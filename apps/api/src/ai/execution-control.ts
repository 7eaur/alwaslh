import type { QueryExecutor } from "../db.js";
import type { AiProviderError } from "./provider.js";
import type { AiModelRoute } from "./router.js";

export type AiOperationalBlockReason =
  | "global_kill_switch"
  | "route_kill_switch"
  | "route_cooldown"
  | "global_budget_window_not_started"
  | "global_budget_window_expired"
  | "global_budget_exhausted"
  | "route_budget_window_not_started"
  | "route_budget_window_expired"
  | "route_budget_exhausted";

export interface AiBudgetReservations {
  globalUsdMicros: string;
  routeUsdMicros: string;
}

export interface AiControlAllowed {
  allowed: true;
  reservations: AiBudgetReservations;
}

export interface AiControlBlocked {
  allowed: false;
  reason: AiOperationalBlockReason;
  nextAttemptAt: Date | null;
  message: string;
}

export type AiControlAdmission = AiControlAllowed | AiControlBlocked;

interface BudgetState {
  budget_limit_usd_micros: string | null;
  budget_window_started_at: Date | null;
  budget_window_ends_at: Date | null;
  budget_reservation_usd_micros: string;
}

interface GlobalRuntimeControl extends BudgetState {
  kill_switch: boolean;
}

interface RouteRuntimeState extends BudgetState {
  route_key: string;
  provider_key: string;
  provider_project_alias: string | null;
  credential_alias: string | null;
  model_used: string;
  kill_switch: boolean;
  cooldown_until: Date | null;
  consecutive_failures: number;
  failure_threshold: number;
  failure_cooldown_ms: number;
}

interface RuntimeClock {
  now: Date;
}

function sameNullable(left: string | null, right: string | undefined): boolean {
  return left === (right ?? null);
}

function asBigInt(value: string): bigint {
  return BigInt(value);
}

function budgetStateConfigured(state: BudgetState): boolean {
  return state.budget_limit_usd_micros !== null;
}

function assertBudgetState(scope: "global" | "route", state: BudgetState): void {
  if (!budgetStateConfigured(state)) return;
  if (!state.budget_window_started_at || !state.budget_window_ends_at) {
    throw new Error(`ai_${scope}_budget_window_missing`);
  }
  if (asBigInt(state.budget_reservation_usd_micros) <= 0n) {
    throw new Error(`ai_${scope}_budget_reservation_invalid`);
  }
}

function normalizedRetryAfterMs(error: AiProviderError): number | null {
  if (error.retryAfterMs === undefined || !Number.isFinite(error.retryAfterMs)) return null;
  return Math.max(0, Math.round(error.retryAfterMs));
}

export class AiExecutionControl {
  async prepareAttempt(executor: QueryExecutor, route: AiModelRoute): Promise<AiControlAdmission> {
    // Shared with capacity admission. The transaction-scoped advisory lock makes
    // control checks, budget reservation admission and attempt insertion race-safe
    // across worker processes without holding a lock during the provider call.
    await executor.query("select pg_advisory_xact_lock(9412, 12)");

    const clockRows = await executor.query<RuntimeClock>("select now() as now");
    const now = clockRows[0]?.now;
    if (!now) throw new Error("ai_runtime_clock_unavailable");

    const globalRows = await executor.query<GlobalRuntimeControl>(
      `select kill_switch, budget_limit_usd_micros, budget_window_started_at,
              budget_window_ends_at, budget_reservation_usd_micros
       from ai_execution_runtime_control
       where singleton = true
       for update`,
    );
    const globalControl = globalRows[0];
    if (!globalControl) throw new Error("ai_global_runtime_control_missing");

    await executor.query(
      `insert into ai_route_runtime_state (
         route_key, provider_key, provider_project_alias, credential_alias, model_used
       ) values ($1, $2, $3, $4, $5)
       on conflict (route_key) do nothing`,
      [
        route.routeKey,
        route.providerKey,
        route.projectAlias ?? null,
        route.credentialAlias ?? null,
        route.modelKey,
      ],
    );
    const routeRows = await executor.query<RouteRuntimeState>(
      `select route_key, provider_key, provider_project_alias, credential_alias, model_used,
              kill_switch, cooldown_until, consecutive_failures, failure_threshold,
              failure_cooldown_ms, budget_limit_usd_micros, budget_window_started_at,
              budget_window_ends_at, budget_reservation_usd_micros
       from ai_route_runtime_state
       where route_key = $1
       for update`,
      [route.routeKey],
    );
    const routeState = routeRows[0];
    if (!routeState) throw new Error("ai_route_runtime_state_missing");
    if (
      routeState.provider_key !== route.providerKey ||
      routeState.model_used !== route.modelKey ||
      !sameNullable(routeState.provider_project_alias, route.projectAlias) ||
      !sameNullable(routeState.credential_alias, route.credentialAlias)
    ) {
      throw new Error(`ai_route_runtime_identity_mismatch:${route.routeKey}`);
    }

    if (globalControl.kill_switch) {
      return {
        allowed: false,
        reason: "global_kill_switch",
        nextAttemptAt: null,
        message: "global AI execution kill switch is enabled",
      };
    }
    if (routeState.kill_switch) {
      return {
        allowed: false,
        reason: "route_kill_switch",
        nextAttemptAt: null,
        message: `AI route ${route.routeKey} kill switch is enabled`,
      };
    }
    if (routeState.cooldown_until && routeState.cooldown_until > now) {
      return {
        allowed: false,
        reason: "route_cooldown",
        nextAttemptAt: routeState.cooldown_until,
        message: `AI route ${route.routeKey} is cooling down`,
      };
    }

    assertBudgetState("global", globalControl);
    const globalBudget = await this.checkBudget(executor, "global", globalControl, now, undefined);
    if (!globalBudget.allowed) return globalBudget;

    assertBudgetState("route", routeState);
    const routeBudget = await this.checkBudget(executor, "route", routeState, now, route.routeKey);
    if (!routeBudget.allowed) return routeBudget;

    return {
      allowed: true,
      reservations: {
        globalUsdMicros: globalBudget.reservationUsdMicros,
        routeUsdMicros: routeBudget.reservationUsdMicros,
      },
    };
  }

  async recordProviderFailure(
    executor: QueryExecutor,
    route: AiModelRoute,
    error: AiProviderError,
  ): Promise<void> {
    const retryAfterMs = normalizedRetryAfterMs(error);
    const rows = await executor.query<{ route_key: string }>(
      `update ai_route_runtime_state
       set consecutive_failures = case
             when $2 then consecutive_failures + 1
             else consecutive_failures
           end,
           cooldown_until = case
             when $3::integer is not null and $3::integer > 0 then
               greatest(
                 coalesce(cooldown_until, '-infinity'::timestamptz),
                 now() + ($3::double precision * interval '1 millisecond')
               )
             when $2 and consecutive_failures + 1 >= failure_threshold then
               greatest(
                 coalesce(cooldown_until, '-infinity'::timestamptz),
                 now() + (failure_cooldown_ms::double precision * interval '1 millisecond')
               )
             else cooldown_until
           end,
           last_error_code = $4,
           last_failure_at = now(),
           updated_at = now()
       where route_key = $1
       returning route_key`,
      [route.routeKey, error.retryable, retryAfterMs, error.code],
    );
    if (!rows[0]) throw new Error("ai_route_runtime_state_missing");
  }

  async recordProviderSuccess(executor: QueryExecutor, route: AiModelRoute): Promise<void> {
    const rows = await executor.query<{ route_key: string }>(
      `update ai_route_runtime_state
       set consecutive_failures = 0,
           cooldown_until = case
             when cooldown_until is not null and cooldown_until <= now() then null
             else cooldown_until
           end,
           last_success_at = now(),
           updated_at = now()
       where route_key = $1
       returning route_key`,
      [route.routeKey],
    );
    if (!rows[0]) throw new Error("ai_route_runtime_state_missing");
  }

  private async checkBudget(
    executor: QueryExecutor,
    scope: "global" | "route",
    state: BudgetState,
    now: Date,
    routeKey: string | undefined,
  ): Promise<{ allowed: true; reservationUsdMicros: string } | AiControlBlocked> {
    if (!budgetStateConfigured(state)) {
      return { allowed: true, reservationUsdMicros: "0" };
    }

    const windowStart = state.budget_window_started_at;
    const windowEnd = state.budget_window_ends_at;
    if (!windowStart || !windowEnd) throw new Error(`ai_${scope}_budget_window_missing`);

    if (now < windowStart) {
      return {
        allowed: false,
        reason: `${scope}_budget_window_not_started`,
        nextAttemptAt: windowStart,
        message: `${scope} AI budget window has not started`,
      };
    }
    if (now >= windowEnd) {
      return {
        allowed: false,
        reason: `${scope}_budget_window_expired`,
        nextAttemptAt: null,
        message: `${scope} AI budget window is expired and must be reconfigured`,
      };
    }

    const rows =
      scope === "global"
        ? await executor.query<{ used_usd_micros: string }>(
            `select coalesce(
               sum(greatest(global_budget_reservation_usd_micros, coalesce(estimated_cost_usd_micros, 0))),
               0
             )::text as used_usd_micros
             from ai_execution_attempts
             where started_at >= $1 and started_at < $2`,
            [windowStart, windowEnd],
          )
        : await executor.query<{ used_usd_micros: string }>(
            `select coalesce(
               sum(greatest(route_budget_reservation_usd_micros, coalesce(estimated_cost_usd_micros, 0))),
               0
             )::text as used_usd_micros
             from ai_execution_attempts
             where route_key = $1 and started_at >= $2 and started_at < $3`,
            [routeKey, windowStart, windowEnd],
          );

    const used = asBigInt(rows[0]?.used_usd_micros ?? "0");
    const reservation = asBigInt(state.budget_reservation_usd_micros);
    const limit = asBigInt(state.budget_limit_usd_micros ?? "0");
    if (used + reservation > limit) {
      return {
        allowed: false,
        reason: `${scope}_budget_exhausted`,
        nextAttemptAt: windowEnd,
        message: `${scope} AI budget reservation would exceed the configured window ceiling`,
      };
    }

    return { allowed: true, reservationUsdMicros: reservation.toString() };
  }
}
