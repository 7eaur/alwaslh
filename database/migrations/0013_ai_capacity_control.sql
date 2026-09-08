BEGIN;

ALTER TABLE ai_job_units
  ADD COLUMN resume_route_key text,
  ADD COLUMN capacity_deferred_count integer NOT NULL DEFAULT 0;

ALTER TABLE ai_job_units
  ADD CONSTRAINT ai_job_units_resume_route_nonblank CHECK (
    resume_route_key IS NULL OR length(btrim(resume_route_key)) > 0
  ),
  ADD CONSTRAINT ai_job_units_capacity_deferred_nonnegative CHECK (
    capacity_deferred_count >= 0
  );

CREATE INDEX idx_ai_job_units_capacity_resume
  ON ai_job_units(status, next_attempt_at, resume_route_key, job_id, position)
  WHERE status = 'retrying' AND resume_route_key IS NOT NULL;

COMMIT;
