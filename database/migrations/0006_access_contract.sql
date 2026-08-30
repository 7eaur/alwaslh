BEGIN;

ALTER TABLE full_access_codes
  ADD COLUMN entitlement_duration_days integer NOT NULL DEFAULT 365,
  ADD CONSTRAINT full_access_codes_duration_valid
    CHECK (entitlement_duration_days BETWEEN 1 AND 3650);

ALTER TABLE class_access_codes
  ADD COLUMN entitlement_duration_days integer NOT NULL DEFAULT 365,
  ADD CONSTRAINT class_access_codes_duration_valid
    CHECK (entitlement_duration_days BETWEEN 1 AND 3650);

CREATE TYPE access_event_type AS ENUM (
  'code_generated',
  'code_redeemed',
  'entitlement_created',
  'entitlement_renewed',
  'entitlement_revoked'
);

CREATE TABLE access_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type access_event_type NOT NULL,
  actor_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  subject_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  code_type access_code_type,
  full_access_code_id uuid REFERENCES full_access_codes(id) ON DELETE SET NULL,
  class_access_code_id uuid REFERENCES class_access_codes(id) ON DELETE SET NULL,
  entitlement_id uuid REFERENCES student_entitlements(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT access_events_code_shape CHECK (
    (code_type IS NULL AND full_access_code_id IS NULL AND class_access_code_id IS NULL)
    OR
    (code_type = 'full_access' AND full_access_code_id IS NOT NULL AND class_access_code_id IS NULL)
    OR
    (code_type = 'class_access' AND class_access_code_id IS NOT NULL AND full_access_code_id IS NULL)
  )
);

CREATE INDEX idx_access_events_subject_time
  ON access_events(subject_profile_id, created_at DESC);
CREATE INDEX idx_access_events_actor_time
  ON access_events(actor_profile_id, created_at DESC);

COMMIT;
