BEGIN;

ALTER TABLE auth_credentials
  ADD COLUMN must_change_password boolean NOT NULL DEFAULT false,
  ADD COLUMN temporary_password_expires_at timestamptz,
  ADD COLUMN device_rebind_allowed boolean NOT NULL DEFAULT false,
  ADD CONSTRAINT auth_credentials_temporary_password_state CHECK (
    temporary_password_expires_at IS NULL OR must_change_password
  );

CREATE TABLE student_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  public_key_spki text NOT NULL,
  public_key_sha256 text NOT NULL,
  label text,
  registered_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revoked_by_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT student_devices_public_key_nonblank CHECK (length(btrim(public_key_spki)) BETWEEN 80 AND 4096),
  CONSTRAINT student_devices_public_key_hash_format CHECK (public_key_sha256 ~ '^[0-9a-f]{64}$'),
  CONSTRAINT student_devices_revocation_after_registration CHECK (revoked_at IS NULL OR revoked_at >= registered_at)
);

CREATE UNIQUE INDEX ux_student_devices_one_active_per_profile
  ON student_devices(profile_id)
  WHERE revoked_at IS NULL;
CREATE INDEX idx_student_devices_public_key_hash
  ON student_devices(public_key_sha256);
CREATE INDEX idx_student_devices_profile_history
  ON student_devices(profile_id, registered_at DESC);

ALTER TABLE auth_sessions
  ADD COLUMN device_id uuid REFERENCES student_devices(id) ON DELETE SET NULL;
CREATE INDEX idx_auth_sessions_device_active
  ON auth_sessions(device_id, expires_at)
  WHERE revoked_at IS NULL AND device_id IS NOT NULL;

CREATE TYPE auth_device_challenge_purpose AS ENUM (
  'login',
  'password_change',
  'device_rebind',
  'password_change_rebind'
);

CREATE TABLE auth_device_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash_sha256 text NOT NULL UNIQUE,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_id uuid REFERENCES student_devices(id) ON DELETE CASCADE,
  purpose auth_device_challenge_purpose NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT auth_device_challenges_token_hash_format CHECK (token_hash_sha256 ~ '^[0-9a-f]{64}$'),
  CONSTRAINT auth_device_challenges_expiry_after_creation CHECK (expires_at > created_at),
  CONSTRAINT auth_device_challenges_used_after_creation CHECK (used_at IS NULL OR used_at >= created_at),
  CONSTRAINT auth_device_challenges_device_shape CHECK (
    (purpose IN ('login', 'password_change') AND device_id IS NOT NULL)
    OR
    (purpose IN ('device_rebind', 'password_change_rebind') AND device_id IS NULL)
  )
);

CREATE INDEX idx_auth_device_challenges_profile_active
  ON auth_device_challenges(profile_id, expires_at)
  WHERE used_at IS NULL;

CREATE TABLE student_activation_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash_sha256 text NOT NULL UNIQUE,
  full_access_code_id uuid NOT NULL REFERENCES full_access_codes(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_activation_tickets_token_hash_format CHECK (token_hash_sha256 ~ '^[0-9a-f]{64}$'),
  CONSTRAINT student_activation_tickets_expiry_after_creation CHECK (expires_at > created_at),
  CONSTRAINT student_activation_tickets_used_after_creation CHECK (used_at IS NULL OR used_at >= created_at)
);

CREATE INDEX idx_student_activation_tickets_code_active
  ON student_activation_tickets(full_access_code_id, expires_at)
  WHERE used_at IS NULL;

ALTER TYPE auth_event_type ADD VALUE IF NOT EXISTS 'activation_ticket_issued';
ALTER TYPE auth_event_type ADD VALUE IF NOT EXISTS 'device_registered';
ALTER TYPE auth_event_type ADD VALUE IF NOT EXISTS 'device_challenge_issued';
ALTER TYPE auth_event_type ADD VALUE IF NOT EXISTS 'device_challenge_verified';
ALTER TYPE auth_event_type ADD VALUE IF NOT EXISTS 'temporary_password_issued';
ALTER TYPE auth_event_type ADD VALUE IF NOT EXISTS 'device_rebind_reset';

COMMIT;
