BEGIN;

CREATE TYPE access_code_type AS ENUM ('full_access', 'class_access');
CREATE TYPE access_code_status AS ENUM ('active', 'redeemed', 'expired', 'revoked');
CREATE TYPE entitlement_scope AS ENUM ('all_content', 'class');
CREATE TYPE entitlement_source AS ENUM ('full_code', 'class_code', 'admin', 'migration');
CREATE TYPE entitlement_status AS ENUM ('active', 'expired', 'revoked');

CREATE TABLE full_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code char(6) NOT NULL UNIQUE,
  status access_code_status NOT NULL DEFAULT 'active',
  valid_from timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  redeemed_at timestamptz,
  redeemed_by_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_by_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (code ~ '^[0-9]{6}$'),
  CHECK (expires_at IS NULL OR expires_at > valid_from),
  CHECK ((status = 'redeemed') = (redeemed_at IS NOT NULL))
);

CREATE TABLE class_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code char(7) NOT NULL UNIQUE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
  status access_code_status NOT NULL DEFAULT 'active',
  valid_from timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  redeemed_at timestamptz,
  redeemed_by_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_by_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (code ~ '^[0-9]{7}$'),
  CHECK (expires_at IS NULL OR expires_at > valid_from),
  CHECK ((status = 'redeemed') = (redeemed_at IS NOT NULL))
);

CREATE TABLE student_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scope entitlement_scope NOT NULL,
  class_id uuid REFERENCES classes(id) ON DELETE RESTRICT,
  source entitlement_source NOT NULL,
  source_id uuid,
  status entitlement_status NOT NULL DEFAULT 'active',
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (scope = 'all_content' AND class_id IS NULL)
    OR
    (scope = 'class' AND class_id IS NOT NULL)
  ),
  CHECK (expires_at IS NULL OR expires_at > starts_at),
  CHECK ((status = 'revoked') = (revoked_at IS NOT NULL))
);

CREATE TABLE access_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code_type access_code_type NOT NULL,
  full_access_code_id uuid REFERENCES full_access_codes(id) ON DELETE RESTRICT,
  class_access_code_id uuid REFERENCES class_access_codes(id) ON DELETE RESTRICT,
  entitlement_id uuid NOT NULL REFERENCES student_entitlements(id) ON DELETE RESTRICT,
  idempotency_key text NOT NULL UNIQUE,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  request_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CHECK (
    (code_type = 'full_access' AND full_access_code_id IS NOT NULL AND class_access_code_id IS NULL)
    OR
    (code_type = 'class_access' AND class_access_code_id IS NOT NULL AND full_access_code_id IS NULL)
  ),
  CHECK (length(btrim(idempotency_key)) >= 12)
);

CREATE UNIQUE INDEX ux_active_all_content_entitlement
ON student_entitlements(profile_id)
WHERE scope = 'all_content' AND status = 'active';

CREATE UNIQUE INDEX ux_active_class_entitlement
ON student_entitlements(profile_id, class_id)
WHERE scope = 'class' AND status = 'active';

CREATE INDEX idx_entitlements_profile_status ON student_entitlements(profile_id, status, expires_at);
CREATE INDEX idx_full_codes_status_expiry ON full_access_codes(status, expires_at);
CREATE INDEX idx_class_codes_class_status_expiry ON class_access_codes(class_id, status, expires_at);

CREATE TRIGGER full_access_codes_set_updated_at BEFORE UPDATE ON full_access_codes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER class_access_codes_set_updated_at BEFORE UPDATE ON class_access_codes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER student_entitlements_set_updated_at BEFORE UPDATE ON student_entitlements
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
