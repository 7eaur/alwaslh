BEGIN;

ALTER TABLE ai_jobs
  ADD COLUMN paused_at timestamptz;

CREATE INDEX idx_ai_jobs_claimable_unpaused
  ON ai_jobs(status, priority, created_at)
  WHERE cancel_requested_at IS NULL
    AND paused_at IS NULL
    AND status IN ('queued', 'running', 'retrying');

COMMIT;
