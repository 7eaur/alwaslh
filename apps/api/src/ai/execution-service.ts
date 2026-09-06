import { createHash } from "node:crypto";
import type { Database } from "../db.js";
import { aiGenerationRequestSchema, type AiGenerationRequest } from "./contracts.js";
import { AiExecutionRepository, type AiJobRecord } from "./execution-repository.js";
import { buildPromptEnvelope, getPromptDefinition } from "./prompt-registry.js";
import { classifyAiProviderError, type AiProviderError, type AiProviderGenerateResult } from "./provider.js";
import type { AiModelRouter } from "./router.js";
import { type AiValidationResult, validateAiGenerationOutput } from "./validators.js";

export interface AiExecutionProfile {
  leaseSeconds: number;
  maxAttempts: number;
  retryBaseMs: number;
  retryMaxMs: number;
}

export interface AiPlanUnitInput {
  unitKey: string;
  request: AiGenerationRequest;
}

export interface EnqueueAiPlanInput {
  idempotencyKey: string;
  createdByProfileId?: string;
  priority?: number;
  units: readonly AiPlanUnitInput[];
}

export interface AiProcessedUnit {
  jobId: string;
  unitId: string;
  status: "completed" | "review_required" | "retrying" | "failed";
  routeKey?: string;
  validation?: AiValidationResult;
}

const ESCALATABLE_REVIEW_CODES = new Set(["generated_answer_uncertain", "near_duplicate_question"]);

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  return value;
}

function planFingerprint(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

function assertExecutionProfile(profile: AiExecutionProfile): void {
  if (!Number.isInteger(profile.leaseSeconds) || profile.leaseSeconds < 5 || profile.leaseSeconds > 3600) {
    throw new Error("ai_lease_seconds_invalid");
  }
  if (!Number.isInteger(profile.maxAttempts) || profile.maxAttempts < 1 || profile.maxAttempts > 20) {
    throw new Error("ai_max_attempts_invalid");
  }
  if (!Number.isFinite(profile.retryBaseMs) || profile.retryBaseMs < 0) throw new Error("ai_retry_base_invalid");
  if (!Number.isFinite(profile.retryMaxMs) || profile.retryMaxMs < profile.retryBaseMs) {
    throw new Error("ai_retry_max_invalid");
  }
}

function shouldEscalate(request: AiGenerationRequest, validation: AiValidationResult): boolean {
  if (validation.status === "invalid") return true;
  if (validation.status !== "review_required") return false;
  if (getPromptDefinition(request.mode).exactSource) return false;
  return validation.issues.some((issue) => ESCALATABLE_REVIEW_CODES.has(issue.code));
}

export class AiExecutionService {
  constructor(
    private readonly database: Database,
    private readonly router: AiModelRouter,
    private readonly profile: AiExecutionProfile,
    private readonly repository = new AiExecutionRepository(),
    private readonly random: () => number = Math.random,
  ) {
    assertExecutionProfile(profile);
  }

  async enqueue(input: EnqueueAiPlanInput): Promise<{ job: AiJobRecord; replayed: boolean }> {
    if (input.idempotencyKey.trim().length < 12) throw new Error("ai_idempotency_key_too_short");
    if (input.units.length === 0) throw new Error("ai_plan_empty");
    if (input.units.length > 5_000) throw new Error("ai_plan_too_large");
    const priority = input.priority ?? 5;
    if (!Number.isInteger(priority) || priority < 1 || priority > 10) throw new Error("ai_priority_invalid");

    const seen = new Set<string>();
    const units = input.units.map((unit, position) => {
      const unitKey = unit.unitKey.trim();
      if (!unitKey) throw new Error("ai_unit_key_empty");
      if (seen.has(unitKey)) throw new Error(`ai_unit_key_duplicate:${unitKey}`);
      seen.add(unitKey);
      return { unitKey, position, request: aiGenerationRequestSchema.parse(unit.request) };
    });

    const firstDefinition = getPromptDefinition(units[0]!.request.mode);
    for (const unit of units) {
      const definition = getPromptDefinition(unit.request.mode);
      if (definition.key !== firstDefinition.key || definition.version !== firstDefinition.version) {
        throw new Error("ai_plan_mixed_prompt_contracts");
      }
    }

    const fingerprint = planFingerprint({
      promptKey: firstDefinition.key,
      promptVersion: firstDefinition.version,
      units: units.map((unit) => ({ unitKey: unit.unitKey, request: unit.request })),
    });

    return this.database.transaction((executor) =>
      this.repository.createPlan(executor, {
        ...(input.createdByProfileId ? { createdByProfileId: input.createdByProfileId } : {}),
        jobType: units[0]!.request.mode,
        promptKey: firstDefinition.key,
        promptVersion: firstDefinition.version,
        priority,
        idempotencyKey: input.idempotencyKey,
        planFingerprint: fingerprint,
        maxAttempts: this.profile.maxAttempts,
        units,
      }),
    );
  }

  async processNext(): Promise<AiProcessedUnit | null> {
    const claimed = await this.database.transaction(async (executor) => {
      const touched = new Set<string>([
        ...(await this.repository.reconcileExpiredAttempts(executor)),
        ...(await this.repository.finalizeExpiredExhausted(executor)),
      ]);
      for (const jobId of touched) await this.repository.refreshJob(executor, jobId);
      return this.repository.claimNext(executor, this.profile.leaseSeconds);
    });
    if (!claimed) return null;

    const request = aiGenerationRequestSchema.parse(claimed.input_payload);
    const envelope = buildPromptEnvelope(request);
    const routes = this.router.routesFor(request);
    if (routes.length === 0) {
      const failure = { code: "ai_route_unavailable", message: "no benchmark-approved route is available" };
      await this.database.transaction(async (executor) => {
        await this.repository.persistProviderFailure(executor, claimed, failure, "failed", null);
        await this.repository.refreshJob(executor, claimed.job_id);
      });
      return { jobId: claimed.job_id, unitId: claimed.id, status: "failed" };
    }

    let lastProviderFailure: AiProviderError | null = null;
    for (const [routeIndex, route] of routes.entries()) {
      const attempt = await this.database.transaction((executor) => this.repository.startAttempt(executor, claimed, route));
      const startedAt = Date.now();
      let providerResult: AiProviderGenerateResult;
      try {
        const adapter = this.router.adapterFor(route);
        providerResult = await adapter.generate({
          envelope,
          modelKey: route.modelKey,
          projectAlias: route.projectAlias,
          credentialAlias: route.credentialAlias,
        });
      } catch (error) {
        const classified = classifyAiProviderError(error);
        lastProviderFailure = classified;
        const latencyMs = Math.max(0, Date.now() - startedAt);
        await this.database.transaction((executor) =>
          this.repository.finishAttemptFailure(executor, attempt.id, classified, latencyMs),
        );
        if (routeIndex < routes.length - 1) continue;
        break;
      }

      const latencyMs = Math.max(0, Date.now() - startedAt);
      const validation = validateAiGenerationOutput(request, providerResult.output);
      const canEscalate = routeIndex < routes.length - 1 && shouldEscalate(request, validation);
      if (canEscalate) {
        await this.database.transaction((executor) =>
          this.repository.finishAttemptSuccess(
            executor,
            attempt.id,
            validation.status,
            latencyMs,
            providerResult.usage ?? {},
            providerResult.providerRequestId,
            providerResult.metadata,
          ),
        );
        continue;
      }

      let status: AiProcessedUnit["status"];
      let nextAttemptAt: Date | null = null;
      if (validation.status === "valid") status = "completed";
      else if (validation.status === "review_required") status = "review_required";
      else if (claimed.attempt_count < claimed.max_attempts) {
        status = "retrying";
        nextAttemptAt = new Date(Date.now() + this.retryDelayMs(claimed.attempt_count));
      } else status = "failed";

      await this.database.transaction(async (executor) => {
        await this.repository.finishAttemptSuccess(
          executor,
          attempt.id,
          validation.status,
          latencyMs,
          providerResult.usage ?? {},
          providerResult.providerRequestId,
          providerResult.metadata,
        );
        await this.repository.persistOutputOutcome(executor, claimed, providerResult.output, validation, status, nextAttemptAt);
        await this.repository.refreshJob(executor, claimed.job_id);
      });
      return { jobId: claimed.job_id, unitId: claimed.id, status, routeKey: route.routeKey, validation };
    }

    const failure: { code: string; message: string; retryable: boolean; retryAfterMs: number | undefined } =
      lastProviderFailure ?? {
        code: "provider_error",
        message: "all configured routes failed",
        retryable: false,
        retryAfterMs: undefined,
      };
    const retrying = failure.retryable && claimed.attempt_count < claimed.max_attempts;
    const nextAttemptAt = retrying
      ? new Date(Date.now() + Math.max(this.retryDelayMs(claimed.attempt_count), failure.retryAfterMs ?? 0))
      : null;
    const status: "retrying" | "failed" = retrying ? "retrying" : "failed";
    await this.database.transaction(async (executor) => {
      await this.repository.persistProviderFailure(executor, claimed, failure, status, nextAttemptAt);
      await this.repository.refreshJob(executor, claimed.job_id);
    });
    return { jobId: claimed.job_id, unitId: claimed.id, status };
  }

  async cancel(jobId: string): Promise<AiJobRecord> {
    return this.database.transaction((executor) => this.repository.requestCancel(executor, jobId));
  }

  private retryDelayMs(attemptCount: number): number {
    const exponent = Math.max(0, Math.min(10, attemptCount - 1));
    const base = Math.min(this.profile.retryMaxMs, this.profile.retryBaseMs * 2 ** exponent);
    const jitter = 0.75 + Math.min(1, Math.max(0, this.random())) * 0.5;
    return Math.min(this.profile.retryMaxMs, Math.round(base * jitter));
  }
}
