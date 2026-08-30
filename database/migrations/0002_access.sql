BEGIN;

CREATE TYPE access_code_type AS ENUM ('full_access', 'class_access');
CREATE TYPE access_code_status AS ENUM ('active', 'redeemed', 'expired', 'revoked');
CREATE TYPE entitlement_scope AS ENUM ('all_content', 'class');
CREATE TYPE entitlement_source AS ENUM ('full_code', 'class_code', 'admin');
CREATE TYPE entitlement_status AS ENUM ('active', 'expired', 'revoked');

CREATE TABLE full_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  status access_code_status NOT NULL DEFAULT 'active',
  valid_from timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  redeemed_at timestamptz,
  redeemed_by_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_by_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT full_access_codes_format CHECK (code ~ '^[0-9]{6}$'),
  CONSTRAINT full_access_codes_expiry_valid CHECK (expires_at IS NULL OR expires_at > valid_from),
  CONSTRAINT full_access_codes_redeemed_state CHECK (status <> 'redeemed' OR redeemed_at IS NOT NULL)
);

CREATE TABLE class_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
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
  CONSTRAINT class_access_codes_format CHECK (code ~ '^[0-9]{7}$'),
  CONSTRAINT class_access_codes_expiry_valid CHECK (expires_at IS NULL OR expires_at > valid_from),
  CONSTRAINT class_access_codes_redeemed_state CHECK (status <> 'redeemed' OR redeemed_at IS NOT NULL)
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
  CONSTRAINT student_entitlements_profile_id_id_unique UNIQUE (profile_id, id),
  CONSTRAINT student_entitlements_scope_shape CHECK (
    (scope = 'all_content' AND class_id IS NULL)
    OR
    (scope = 'class' AND class_id IS NOT NULL)
  ),
  CONSTRAINT student_entitlements_expiry_valid CHECK (expires_at IS NULL OR expires_at > starts_at),
  CONSTRAINT student_entitlements_revoked_state CHECK (status <> 'revoked' OR revoked_at IS NOT NULL),
  CONSTRAINT student_entitlements_code_source CHECK (
    (source IN ('full_code', 'class_code') AND source_id IS NOT NULL)
    OR
    (source = 'admin')
  )
);

CREATE TABLE access_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code_type access_code_type NOT NULL,
  full_access_code_id uuid REFERENCES full_access_codes(id) ON DELETE RESTRICT,
  class_access_code_id uuid REFERENCES class_access_codes(id) ON DELETE RESTRICT,
  entitlement_id uuid NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  request_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT access_redemptions_profile_entitlement_fk
    FOREIGN KEY (profile_id, entitlement_id)
    REFERENCES student_entitlements(profile_id, id) ON DELETE RESTRICT,
  CONSTRAINT access_redemptions_code_shape CHECK (
    (code_type = 'full_access' AND full_access_code_id IS NOT NULL AND class_access_code_id IS NULL)
    OR
    (code_type = 'class_access' AND class_access_code_id IS NOT NULL AND full_access_code_id IS NULL)
  ),
  CONSTRAINT access_redemptions_idempotency_nonblank CHECK (length(btrim(idempotency_key)) >= 12)
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
CREATE INDEX idx_access_redemptions_profile_time ON access_redemptions(profile_id, redeemed_at DESC);

CREATE TRIGGER full_access_codes_set_updated_at BEFORE UPDATE ON full_access_codes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER class_access_codes_set_updated_at BEFORE UPDATE ON class_access_codes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER student_entitlements_set_updated_at BEFORE UPDATE ON student_entitlements
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
