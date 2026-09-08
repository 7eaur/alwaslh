BEGIN;

CREATE TYPE ocr_extraction_status AS ENUM ('queued', 'running', 'retrying', 'completed', 'failed');
CREATE TYPE ocr_review_status AS ENUM ('not_required', 'pending', 'approved', 'rejected');

CREATE TABLE ocr_extractions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  input_media_variant_id uuid NOT NULL REFERENCES media_variants(id) ON DELETE CASCADE,
  input_checksum_sha256 text NOT NULL,
  provider_key text NOT NULL,
  provider_version text NOT NULL,
  profile_key text NOT NULL,
  status ocr_extraction_status NOT NULL DEFAULT 'queued',
  attempt_count integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  next_attempt_at timestamptz,
  lease_token uuid,
  lease_expires_at timestamptz,
  raw_text text,
  normalized_text text,
  mean_confidence numeric(5,2),
  provider_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  review_status ocr_review_status NOT NULL DEFAULT 'not_required',
  review_reason text,
  reviewed_by_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  last_error_code text,
  last_error_message text,
  idempotency_key text NOT NULL UNIQUE,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ocr_extractions_identity_unique UNIQUE (
    input_media_variant_id,
    input_checksum_sha256,
    provider_key,
    provider_version,
    profile_key
  ),
  CONSTRAINT ocr_extractions_checksum_format CHECK (input_checksum_sha256 ~ '^[0-9a-f]{64}$'),
  CONSTRAINT ocr_extractions_provider_key_nonblank CHECK (length(btrim(provider_key)) > 0),
  CONSTRAINT ocr_extractions_provider_version_nonblank CHECK (length(btrim(provider_version)) > 0),
  CONSTRAINT ocr_extractions_profile_key_nonblank CHECK (length(btrim(profile_key)) > 0),
  CONSTRAINT ocr_extractions_attempts_valid CHECK (
    attempt_count >= 0 AND max_attempts BETWEEN 1 AND 10 AND attempt_count <= max_attempts
  ),
  CONSTRAINT ocr_extractions_idempotency_nonblank CHECK (length(btrim(idempotency_key)) >= 12),
  CONSTRAINT ocr_extractions_confidence_range CHECK (
    mean_confidence IS NULL OR (mean_confidence >= 0 AND mean_confidence <= 100)
  ),
  CONSTRAINT ocr_extractions_running_lease_shape CHECK (
    (status = 'running' AND lease_token IS NOT NULL AND lease_expires_at IS NOT NULL)
    OR
    (status <> 'running' AND lease_token IS NULL AND lease_expires_at IS NULL)
  ),
  CONSTRAINT ocr_extractions_output_shape CHECK (
    status <> 'completed' OR (raw_text IS NOT NULL AND completed_at IS NOT NULL)
  ),
  CONSTRAINT ocr_extractions_review_reason_nonblank CHECK (
    review_reason IS NULL OR length(btrim(review_reason)) > 0
  ),
  CONSTRAINT ocr_extractions_review_actor_shape CHECK (
    (reviewed_at IS NULL) = (reviewed_by_profile_id IS NULL)
  ),
  CONSTRAINT ocr_extractions_review_decision_shape CHECK (
    review_status NOT IN ('approved', 'rejected')
    OR (reviewed_by_profile_id IS NOT NULL AND reviewed_at IS NOT NULL)
  )
);

CREATE INDEX idx_ocr_extractions_ready
  ON ocr_extractions(status, next_attempt_at, provider_key, provider_version, profile_key, created_at);

CREATE INDEX idx_ocr_extractions_input_variant
  ON ocr_extractions(input_media_variant_id, created_at DESC);

CREATE INDEX idx_ocr_extractions_review_pending
  ON ocr_extractions(review_status, created_at)
  WHERE status = 'completed' AND review_status = 'pending';

CREATE INDEX idx_ocr_extractions_search_approved
  ON ocr_extractions
  USING gin (to_tsvector('simple', coalesce(normalized_text, raw_text, '')))
  WHERE status = 'completed' AND review_status IN ('not_required', 'approved');

CREATE TRIGGER ocr_extractions_set_updated_at BEFORE UPDATE ON ocr_extractions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
