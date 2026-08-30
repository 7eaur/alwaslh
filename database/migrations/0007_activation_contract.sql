BEGIN;

-- A single-use access code must never produce more than one redemption record,
-- even if a future service bug bypasses the current row-lock/status checks.
CREATE UNIQUE INDEX ux_access_redemptions_full_code_once
  ON access_redemptions(full_access_code_id)
  WHERE full_access_code_id IS NOT NULL;

CREATE UNIQUE INDEX ux_access_redemptions_class_code_once
  ON access_redemptions(class_access_code_id)
  WHERE class_access_code_id IS NOT NULL;

-- A redeemed code must identify the student who redeemed it, not only the time.
ALTER TABLE full_access_codes
  DROP CONSTRAINT full_access_codes_redeemed_state,
  ADD CONSTRAINT full_access_codes_redeemed_state CHECK (
    status <> 'redeemed'
    OR (redeemed_at IS NOT NULL AND redeemed_by_profile_id IS NOT NULL)
  );

ALTER TABLE class_access_codes
  DROP CONSTRAINT class_access_codes_redeemed_state,
  ADD CONSTRAINT class_access_codes_redeemed_state CHECK (
    status <> 'redeemed'
    OR (redeemed_at IS NOT NULL AND redeemed_by_profile_id IS NOT NULL)
  );

-- Activation is an authentication lifecycle event. The raw access/account code
-- is never stored in auth_events; only its SHA-256 audit hash is persisted.
ALTER TYPE auth_event_type ADD VALUE IF NOT EXISTS 'account_activated';

COMMIT;
