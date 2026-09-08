import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { currentProfile, parseBody } from "../auth/http.js";
import type { AuthService } from "../auth/service.js";
import type { AppConfig } from "../config.js";
import { AppError } from "../errors.js";
import type { AdminAiOperationsService } from "./admin-operations.js";

const JobStatusSchema = z.enum([
  "queued",
  "running",
  "retrying",
  "completed",
  "failed",
  "cancelled",
  "paused",
]);

const JobListQuerySchema = z.object({
  status: JobStatusSchema.optional(),
  jobType: z.string().trim().min(1).max(160).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).default(0),
});

const JobDetailQuerySchema = z.object({
  unitLimit: z.coerce.number().int().min(1).max(100).default(50),
  unitOffset: z.coerce.number().int().min(0).default(0),
});

const UnitDetailQuerySchema = z.object({
  attemptLimit: z.coerce.number().int().min(1).max(100).default(50),
  attemptOffset: z.coerce.number().int().min(0).default(0),
});

const JobParamsSchema = z.object({ jobId: z.string().uuid() });
const UnitParamsSchema = z.object({ unitId: z.string().uuid() });
const OutputParamsSchema = z.object({ outputId: z.string().uuid() });
const ReviewNoteSchema = z.string().trim().max(4000).optional();

const OutputReviewSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("edit"),
      editedOutput: z.unknown(),
      note: ReviewNoteSchema,
    })
    .strict(),
  z
    .object({
      action: z.literal("approve"),
      note: ReviewNoteSchema,
    })
    .strict(),
  z
    .object({
      action: z.literal("reject"),
      note: z.string().trim().min(1).max(4000),
    })
    .strict(),
]);

async function adminActor(
  request: Parameters<typeof currentProfile>[0],
  config: AppConfig,
  auth: AuthService,
) {
  const actor = await currentProfile(request, config, auth);
  if (actor.role !== "admin") throw new AppError("FORBIDDEN", "هذه العملية للمدير فقط", 403);
  return actor;
}

export function registerAdminAiOperationsRoutes(
  app: FastifyInstance,
  config: AppConfig,
  auth: AuthService,
  operations: AdminAiOperationsService,
): void {
  app.get("/v1/admin/ai/jobs", async (request) => {
    await adminActor(request, config, auth);
    const query = parseBody(JobListQuerySchema, request.query);
    return operations.listJobs({
      ...(query.status ? { status: query.status } : {}),
      ...(query.jobType ? { jobType: query.jobType } : {}),
      limit: query.limit ?? 30,
      offset: query.offset ?? 0,
    });
  });

  app.get("/v1/admin/ai/jobs/:jobId", async (request) => {
    await adminActor(request, config, auth);
    const params = parseBody(JobParamsSchema, request.params);
    const query = parseBody(JobDetailQuerySchema, request.query);
    return operations.jobDetail(params.jobId, query.unitLimit ?? 50, query.unitOffset ?? 0);
  });

  app.get("/v1/admin/ai/units/:unitId", async (request) => {
    await adminActor(request, config, auth);
    const params = parseBody(UnitParamsSchema, request.params);
    const query = parseBody(UnitDetailQuerySchema, request.query);
    return operations.unitDetail(params.unitId, query.attemptLimit ?? 50, query.attemptOffset ?? 0);
  });

  app.get("/v1/admin/ai/outputs/:outputId", async (request) => {
    await adminActor(request, config, auth);
    const params = parseBody(OutputParamsSchema, request.params);
    return { output: await operations.outputDetail(params.outputId) };
  });

  app.post("/v1/admin/ai/jobs/:jobId/pause", async (request) => {
    await adminActor(request, config, auth);
    const params = parseBody(JobParamsSchema, request.params);
    return { progress: await operations.pauseJob(params.jobId) };
  });

  app.post("/v1/admin/ai/jobs/:jobId/resume", async (request) => {
    await adminActor(request, config, auth);
    const params = parseBody(JobParamsSchema, request.params);
    return { progress: await operations.resumeJob(params.jobId) };
  });

  app.post("/v1/admin/ai/jobs/:jobId/cancel", async (request) => {
    await adminActor(request, config, auth);
    const params = parseBody(JobParamsSchema, request.params);
    return { progress: await operations.cancelJob(params.jobId) };
  });

  app.post("/v1/admin/ai/jobs/:jobId/retry", async (request) => {
    await adminActor(request, config, auth);
    const params = parseBody(JobParamsSchema, request.params);
    return { progress: await operations.retryJob(params.jobId) };
  });

  app.patch("/v1/admin/ai/outputs/:outputId/review", async (request) => {
    const actor = await adminActor(request, config, auth);
    const params = parseBody(OutputParamsSchema, request.params);
    const input = parseBody(OutputReviewSchema, request.body);
    return { output: await operations.reviewOutput(actor.id, params.outputId, input) };
  });
}
