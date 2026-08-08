ALTER TABLE access_codes ADD COLUMN IF NOT EXISTS recovery_password_encrypted TEXT;

UPDATE access_codes
SET is_used = false,
    device_fingerprint = NULL,
    device_id = NULL,
    recovery_password_encrypted = NULL;