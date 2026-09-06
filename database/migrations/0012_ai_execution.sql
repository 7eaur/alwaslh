BEGIN;

CREATE TYPE ai_execution_attempt_status AS ENUM ('running', 'completed', 'failed', 'cancelled');

ALTER TABLE ai_job_units
  ADD COLUMN max_attempts integer NOT NULL DEFAULT 4,
  ADD COLUMN lease_token uuid,
  ADD COLUMN lease_expires_at timestamptz;

-- Any pre-Stage12 running row had no lease authority. Make it reclaimable before
-- enforcing the running-lease invariant instead of leaving an unclaimable row.
UPDATE ai_job_units
SET status = 'retrying',
    next_attempt_at = coalesce(next_attempt_at, now())
WHERE status = 'running';

ALTER TABLE ai_job_units
  ADD CONSTRAINT ai_job_units_max_attempts_valid CHECK (max_attempts BETWEEN 1 AND 20),
  ADD CONSTRAINT ai_job_units_running_lease_shape CHECK (
    (status = 'running' AND lease_token IS NOT NULL AND lease_expires_at IS NOT NULL)
    OR
    (status <> 'running' AND lease_token IS NULL AND lease_expires_at IS NULL)
  );

CREATE TABLE ai_execution_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_unit_id uuid NOT NULL REFERENCES ai_job_units(id) ON DELETE CASCADE,
  attempt_number integer NOT NULL CHECK (attempt_number > 0),
  provider_key text NOT NULL,
  provider_project_alias text,
  credential_alias text,
  model_used text NOT NULL,
  route_key text NOT NULL,
  benchmark_version text NOT NULL,
  status ai_execution_attempt_status NOT NULL DEFAULT 'running',
  validation_status ai_output_validation_status,
  retryable boolean,
  provider_request_id text,
  input_tokens integer CHECK (input_tokens IS NULL OR input_tokens >= 0),
  output_tokens integer CHECK (output_tokens IS NULL OR output_tokens >= 0),
  latency_ms integer CHECK (latency_ms IS NULL OR latency_ms >= 0),
  estimated_cost_usd_micros bigint CHECK (
    estimated_cost_usd_micros IS NULL OR estimated_cost_usd_micros >= 0
  ),
  error_code text,
  error_message text,
  provider_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT ai_execution_attempts_unit_number_unique UNIQUE (job_unit_id, attempt_number),
  CONSTRAINT ai_execution_attempts_provider_key_nonblank CHECK (length(btrim(provider_key)) > 0),
  CONSTRAINT ai_execution_attempts_model_nonblank CHECK (length(btrim(model_used)) > 0),
  CONSTRAINT ai_execution_attempts_route_nonblank CHECK (length(btrim(route_key)) > 0),
  CONSTRAINT ai_execution_attempts_benchmark_nonblank CHECK (length(btrim(benchmark_version)) > 0),
  CONSTRAINT ai_execution_attempts_completion_shape CHECK (
    (status = 'running' AND completed_at IS NULL)
    OR
    (status <> 'running' AND completed_at IS NOT NULL)
  )
);

CREATE INDEX idx_ai_job_units_stage12_claim
  ON ai_job_units(status, next_attempt_at, lease_expires_at, job_id, position);

CREATE INDEX idx_ai_execution_attempts_unit_started
  ON ai_execution_attempts(job_unit_id, started_at DESC);

CREATE INDEX idx_ai_execution_attempts_route_started
  ON ai_execution_attempts(provider_key, model_used, route_key, started_at DESC);

COMMIT;
