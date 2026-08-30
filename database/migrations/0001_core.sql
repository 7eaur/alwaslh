BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE profile_role AS ENUM ('student', 'admin');
CREATE TYPE record_status AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE lesson_asset_kind AS ENUM ('image', 'pdf_page', 'document', 'audio', 'video');

CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_subject text UNIQUE,
  role profile_role NOT NULL DEFAULT 'student',
  display_name text,
  status record_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (auth_subject IS NULL OR length(btrim(auth_subject)) > 0)
);

CREATE TABLE classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  status record_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (length(btrim(slug)) > 0),
  CHECK (length(btrim(name)) > 0)
);

CREATE TABLE subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  status record_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (length(btrim(slug)) > 0),
  CHECK (length(btrim(name)) > 0)
);

CREATE TABLE subject_class_links (
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (class_id, subject_id)
);

CREATE TABLE lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  slug text NOT NULL,
  title text NOT NULL,
  summary text,
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  status record_status NOT NULL DEFAULT 'active',
  content_revision bigint NOT NULL DEFAULT 1 CHECK (content_revision >= 1),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_id, subject_id, slug),
  CHECK (length(btrim(slug)) > 0),
  CHECK (length(btrim(title)) > 0)
);

CREATE TABLE lesson_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  kind lesson_asset_kind NOT NULL,
  position integer NOT NULL CHECK (position >= 0),
  storage_key text NOT NULL,
  source_storage_key text,
  thumbnail_storage_key text,
  ai_storage_key text,
  mime_type text NOT NULL,
  byte_size bigint CHECK (byte_size IS NULL OR byte_size >= 0),
  width integer CHECK (width IS NULL OR width > 0),
  height integer CHECK (height IS NULL OR height > 0),
  checksum_sha256 text,
  source_page_number integer CHECK (source_page_number IS NULL OR source_page_number > 0),
  source_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, position),
  UNIQUE (storage_key),
  CHECK (length(btrim(storage_key)) > 0),
  CHECK (length(btrim(mime_type)) > 0),
  CHECK (checksum_sha256 IS NULL OR checksum_sha256 ~ '^[0-9a-fA-F]{64}$')
);

CREATE INDEX idx_lessons_class_subject_position ON lessons(class_id, subject_id, position);
CREATE INDEX idx_lesson_assets_lesson_position ON lesson_assets(lesson_id, position);
CREATE INDEX idx_profiles_role_status ON profiles(role, status);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER classes_set_updated_at BEFORE UPDATE ON classes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER subjects_set_updated_at BEFORE UPDATE ON subjects
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER lessons_set_updated_at BEFORE UPDATE ON lessons
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER lesson_assets_set_updated_at BEFORE UPDATE ON lesson_assets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
