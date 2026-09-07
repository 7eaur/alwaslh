BEGIN;

ALTER TABLE ai_job_units
  ADD COLUMN control_deferred_count integer NOT NULL DEFAULT 0;

ALTER TABLE ai_job_units
  ADD CONSTRAINT ai_job_units_control_deferred_nonnegative CHECK (
    control_deferred_count >= 0
  );

ALTER TABLE ai_execution_attempts
  ADD COLUMN global_budget_reservation_usd_micros bigint NOT NULL DEFAULT 0,
  ADD COLUMN route_budget_reservation_usd_micros bigint NOT NULL DEFAULT 0;

ALTER TABLE ai_execution_attempts
  ADD CONSTRAINT ai_execution_attempts_global_budget_reservation_nonnegative CHECK (
    global_budget_reservation_usd_micros >= 0
  ),
  ADD CONSTRAINT ai_execution_attempts_route_budget_reservation_nonnegative CHECK (
    route_budget_reservation_usd_micros >= 0
  );

CREATE TABLE ai_execution_runtime_control (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  kill_switch boolean NOT NULL DEFAULT false,
  budget_limit_usd_micros bigint,
  budget_window_started_at timestamptz,
  budget_window_ends_at timestamptz,
  budget_reservation_usd_micros bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ai_execution_runtime_control_budget_shape CHECK (
    (
      budget_limit_usd_micros IS NULL
      AND budget_window_started_at IS NULL
      AND budget_window_ends_at IS NULL
      AND budget_reservation_usd_micros = 0
    )
    OR
    (
      budget_limit_usd_micros IS NOT NULL
      AND budget_limit_usd_micros > 0
      AND budget_window_started_at IS NOT NULL
      AND budget_window_ends_at IS NOT NULL
      AND budget_window_started_at < budget_window_ends_at
      AND budget_reservation_usd_micros > 0
      AND budget_reservation_usd_micros <= budget_limit_usd_micros
    )
  )
);

INSERT INTO ai_execution_runtime_control (singleton) VALUES (true);

CREATE TABLE ai_route_runtime_state (
  route_key text PRIMARY KEY,
  provider_key text NOT NULL,
  provider_project_alias text,
  credential_alias text,
  model_used text NOT NULL,
  kill_switch boolean NOT NULL DEFAULT false,
  cooldown_until timestamptz,
  consecutive_failures integer NOT NULL DEFAULT 0,
  failure_threshold integer NOT NULL DEFAULT 3,
  failure_cooldown_ms integer NOT NULL DEFAULT 30000,
  budget_limit_usd_micros bigint,
  budget_window_started_at timestamptz,
  budget_window_ends_at timestamptz,
  budget_reservation_usd_micros bigint NOT NULL DEFAULT 0,
  last_error_code text,
  last_failure_at timestamptz,
  last_success_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ai_route_runtime_state_route_nonblank CHECK (length(btrim(route_key)) > 0),
  CONSTRAINT ai_route_runtime_state_provider_nonblank CHECK (length(btrim(provider_key)) > 0),
  CONSTRAINT ai_route_runtime_state_model_nonblank CHECK (length(btrim(model_used)) > 0),
  CONSTRAINT ai_route_runtime_state_failures_nonnegative CHECK (consecutive_failures >= 0),
  CONSTRAINT ai_route_runtime_state_threshold_valid CHECK (failure_threshold BETWEEN 1 AND 100),
  CONSTRAINT ai_route_runtime_state_cooldown_ms_valid CHECK (
    failure_cooldown_ms BETWEEN 1000 AND 86400000
  ),
  CONSTRAINT ai_route_runtime_state_budget_shape CHECK (
    (
      budget_limit_usd_micros IS NULL
      AND budget_window_started_at IS NULL
      AND budget_window_ends_at IS NULL
      AND budget_reservation_usd_micros = 0
    )
    OR
    (
      budget_limit_usd_micros IS NOT NULL
      AND budget_limit_usd_micros > 0
      AND budget_window_started_at IS NOT NULL
      AND budget_window_ends_at IS NOT NULL
      AND budget_window_started_at < budget_window_ends_at
      AND budget_reservation_usd_micros > 0
      AND budget_reservation_usd_micros <= budget_limit_usd_micros
    )
  )
);

CREATE INDEX idx_ai_route_runtime_state_cooldown
  ON ai_route_runtime_state(cooldown_until, route_key)
  WHERE cooldown_until IS NOT NULL;

CREATE INDEX idx_ai_execution_attempts_global_budget_window
  ON ai_execution_attempts(started_at, global_budget_reservation_usd_micros);

CREATE INDEX idx_ai_execution_attempts_route_budget_window
  ON ai_execution_attempts(route_key, started_at, route_budget_reservation_usd_micros);

COMMIT;
