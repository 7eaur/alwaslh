BEGIN;

CREATE TABLE auth_credentials (
  profile_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  normalized_identifier text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  password_changed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT auth_credentials_identifier_nonblank CHECK (length(btrim(normalized_identifier)) >= 3),
  CONSTRAINT auth_credentials_identifier_normalized CHECK (normalized_identifier = lower(btrim(normalized_identifier))),
  CONSTRAINT auth_credentials_password_hash_format CHECK (password_hash LIKE 'scrypt$%')
);

CREATE TABLE auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token_hash_sha256 text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  user_agent_hash_sha256 text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT auth_sessions_token_hash_format CHECK (token_hash_sha256 ~ '^[0-9a-f]{64}$'),
  CONSTRAINT auth_sessions_user_agent_hash_format CHECK (user_agent_hash_sha256 IS NULL OR user_agent_hash_sha256 ~ '^[0-9a-f]{64}$'),
  CONSTRAINT auth_sessions_expiry_after_creation CHECK (expires_at > created_at),
  CONSTRAINT auth_sessions_revocation_after_creation CHECK (revoked_at IS NULL OR revoked_at >= created_at)
);

CREATE TABLE auth_password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token_hash_sha256 text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_by_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT auth_password_reset_hash_format CHECK (token_hash_sha256 ~ '^[0-9a-f]{64}$'),
  CONSTRAINT auth_password_reset_expiry_after_creation CHECK (expires_at > created_at),
  CONSTRAINT auth_password_reset_used_after_creation CHECK (used_at IS NULL OR used_at >= created_at)
);

CREATE TABLE auth_login_guards (
  normalized_identifier text PRIMARY KEY,
  failed_count integer NOT NULL DEFAULT 0,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  locked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT auth_login_guards_identifier_nonblank CHECK (length(btrim(normalized_identifier)) >= 3),
  CONSTRAINT auth_login_guards_identifier_normalized CHECK (normalized_identifier = lower(btrim(normalized_identifier))),
  CONSTRAINT auth_login_guards_failed_nonnegative CHECK (failed_count >= 0)
);

CREATE TYPE auth_event_type AS ENUM (
  'login_success',
  'login_failure',
  'login_locked',
  'logout',
  'password_changed',
  'recovery_issued',
  'recovery_used',
  'session_revoked'
);

CREATE TABLE auth_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  event_type auth_event_type NOT NULL,
  identifier_hash_sha256 text,
  actor_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT auth_events_identifier_hash_format CHECK (identifier_hash_sha256 IS NULL OR identifier_hash_sha256 ~ '^[0-9a-f]{64}$')
);

CREATE INDEX idx_auth_sessions_profile_active ON auth_sessions(profile_id, expires_at) WHERE revoked_at IS NULL;
CREATE INDEX idx_auth_sessions_expiry ON auth_sessions(expires_at) WHERE revoked_at IS NULL;
CREATE INDEX idx_auth_reset_profile_active ON auth_password_reset_tokens(profile_id, expires_at) WHERE used_at IS NULL;
CREATE INDEX idx_auth_events_profile_created ON auth_events(profile_id, created_at DESC);
CREATE INDEX idx_auth_events_type_created ON auth_events(event_type, created_at DESC);

CREATE TRIGGER auth_credentials_set_updated_at BEFORE UPDATE ON auth_credentials
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER auth_login_guards_set_updated_at BEFORE UPDATE ON auth_login_guards
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
