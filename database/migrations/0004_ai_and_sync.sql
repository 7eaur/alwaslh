BEGIN;

CREATE TYPE ai_job_status AS ENUM ('queued', 'running', 'retrying', 'completed', 'failed', 'cancelled');
CREATE TYPE ai_unit_status AS ENUM ('queued', 'running', 'retrying', 'completed', 'failed', 'cancelled', 'review_required');
CREATE TYPE ai_output_validation_status AS ENUM ('pending', 'valid', 'invalid', 'review_required');
CREATE TYPE content_entity_type AS ENUM ('class', 'subject', 'lesson', 'lesson_asset', 'quiz', 'notification');
CREATE TYPE content_change_type AS ENUM ('upsert', 'delete');

CREATE TABLE ai_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  job_type text NOT NULL,
  status ai_job_status NOT NULL DEFAULT 'queued',
  prompt_key text NOT NULL,
  prompt_version text NOT NULL,
  requested_model text,
  input_manifest jsonb NOT NULL DEFAULT '{}'::jsonb,
  priority smallint NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  total_units integer NOT NULL DEFAULT 0 CHECK (total_units >= 0),
  completed_units integer NOT NULL DEFAULT 0 CHECK (completed_units >= 0),
  failed_units integer NOT NULL DEFAULT 0 CHECK (failed_units >= 0),
  idempotency_key text NOT NULL UNIQUE,
  cancel_requested_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (length(btrim(job_type)) > 0),
  CHECK (length(btrim(prompt_key)) > 0),
  CHECK (length(btrim(prompt_version)) > 0),
  CHECK (length(btrim(idempotency_key)) >= 12),
  CHECK (completed_units + failed_units <= total_units)
);

CREATE TABLE ai_job_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES ai_jobs(id) ON DELETE CASCADE,
  unit_key text NOT NULL,
  position integer NOT NULL CHECK (position >= 0),
  status ai_unit_status NOT NULL DEFAULT 'queued',
  input_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  provider_project_alias text,
  credential_alias text,
  model_used text,
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  next_attempt_at timestamptz,
  last_error_code text,
  last_error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, unit_key),
  UNIQUE (job_id, position),
  CHECK (length(btrim(unit_key)) > 0)
);

CREATE TABLE ai_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_unit_id uuid NOT NULL UNIQUE REFERENCES ai_job_units(id) ON DELETE CASCADE,
  validation_status ai_output_validation_status NOT NULL DEFAULT 'pending',
  raw_response jsonb,
  normalized_output jsonb,
  validation_errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  semantic_warnings jsonb NOT NULL DEFAULT '[]'::jsonb,
  reviewed_by_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((reviewed_at IS NULL) = (reviewed_by_profile_id IS NULL))
);

CREATE TABLE content_revisions (
  revision bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  entity_type content_entity_type NOT NULL,
  entity_id uuid NOT NULL,
  change_type content_change_type NOT NULL,
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE content_tombstones (
  entity_type content_entity_type NOT NULL,
  entity_id uuid NOT NULL,
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  deleted_revision bigint NOT NULL REFERENCES content_revisions(revision) ON DELETE RESTRICT,
  deleted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entity_type, entity_id)
);

CREATE TABLE sync_checkpoints (
  profile_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  last_acknowledged_revision bigint NOT NULL DEFAULT 0 CHECK (last_acknowledged_revision >= 0),
  entitlement_revision bigint NOT NULL DEFAULT 1 CHECK (entitlement_revision >= 1),
  last_synced_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_jobs_status_priority_created ON ai_jobs(status, priority, created_at);
CREATE INDEX idx_ai_job_units_ready ON ai_job_units(status, next_attempt_at, job_id, position);
CREATE INDEX idx_content_revisions_revision_class ON content_revisions(revision, class_id);
CREATE INDEX idx_content_revisions_entity ON content_revisions(entity_type, entity_id, revision DESC);

CREATE TRIGGER ai_jobs_set_updated_at BEFORE UPDATE ON ai_jobs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER ai_job_units_set_updated_at BEFORE UPDATE ON ai_job_units
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER ai_outputs_set_updated_at BEFORE UPDATE ON ai_outputs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER sync_checkpoints_set_updated_at BEFORE UPDATE ON sync_checkpoints
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
