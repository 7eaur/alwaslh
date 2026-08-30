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
  CONSTRAINT profiles_auth_subject_nonblank CHECK (auth_subject IS NULL OR length(btrim(auth_subject)) > 0)
);

CREATE TABLE classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  position integer NOT NULL DEFAULT 0,
  status record_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT classes_slug_nonblank CHECK (length(btrim(slug)) > 0),
  CONSTRAINT classes_name_nonblank CHECK (length(btrim(name)) > 0),
  CONSTRAINT classes_position_nonnegative CHECK (position >= 0)
);

CREATE TABLE subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  status record_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subjects_slug_nonblank CHECK (length(btrim(slug)) > 0),
  CONSTRAINT subjects_name_nonblank CHECK (length(btrim(name)) > 0)
);

CREATE TABLE subject_class_links (
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (class_id, subject_id),
  CONSTRAINT subject_class_links_position_nonnegative CHECK (position >= 0)
);

CREATE TABLE lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  summary text,
  position integer NOT NULL DEFAULT 0,
  status record_status NOT NULL DEFAULT 'active',
  content_revision bigint NOT NULL DEFAULT 1,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lessons_subject_class_fk FOREIGN KEY (class_id, subject_id)
    REFERENCES subject_class_links(class_id, subject_id) ON DELETE RESTRICT,
  CONSTRAINT lessons_slug_unique_per_subject UNIQUE (class_id, subject_id, slug),
  CONSTRAINT lessons_slug_nonblank CHECK (length(btrim(slug)) > 0),
  CONSTRAINT lessons_title_nonblank CHECK (length(btrim(title)) > 0),
  CONSTRAINT lessons_position_nonnegative CHECK (position >= 0),
  CONSTRAINT lessons_revision_positive CHECK (content_revision >= 1)
);

CREATE TABLE lesson_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  kind lesson_asset_kind NOT NULL,
  position integer NOT NULL,
  storage_key text NOT NULL,
  source_storage_key text,
  thumbnail_storage_key text,
  ai_storage_key text,
  mime_type text NOT NULL,
  byte_size bigint,
  width integer,
  height integer,
  checksum_sha256 text,
  source_page_number integer,
  source_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lesson_assets_position_unique UNIQUE (lesson_id, position),
  CONSTRAINT lesson_assets_storage_key_unique UNIQUE (storage_key),
  CONSTRAINT lesson_assets_position_nonnegative CHECK (position >= 0),
  CONSTRAINT lesson_assets_storage_key_nonblank CHECK (length(btrim(storage_key)) > 0),
  CONSTRAINT lesson_assets_mime_nonblank CHECK (length(btrim(mime_type)) > 0),
  CONSTRAINT lesson_assets_byte_size_valid CHECK (byte_size IS NULL OR byte_size >= 0),
  CONSTRAINT lesson_assets_width_valid CHECK (width IS NULL OR width > 0),
  CONSTRAINT lesson_assets_height_valid CHECK (height IS NULL OR height > 0),
  CONSTRAINT lesson_assets_page_valid CHECK (source_page_number IS NULL OR source_page_number > 0),
  CONSTRAINT lesson_assets_checksum_format CHECK (checksum_sha256 IS NULL OR checksum_sha256 ~ '^[0-9a-fA-F]{64}$')
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
