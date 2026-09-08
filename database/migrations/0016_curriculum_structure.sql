BEGIN;

ALTER TABLE subject_class_links
  ADD COLUMN status record_status NOT NULL DEFAULT 'active',
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

CREATE TRIGGER subject_class_links_set_updated_at BEFORE UPDATE ON subject_class_links
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE curriculum_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  position integer NOT NULL DEFAULT 0,
  status record_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT curriculum_sections_offering_fk
    FOREIGN KEY (class_id, subject_id)
    REFERENCES subject_class_links(class_id, subject_id) ON DELETE RESTRICT,
  CONSTRAINT curriculum_sections_scope_id_unique UNIQUE (class_id, subject_id, id),
  CONSTRAINT curriculum_sections_slug_unique UNIQUE (class_id, subject_id, slug),
  CONSTRAINT curriculum_sections_slug_nonblank CHECK (length(btrim(slug)) > 0),
  CONSTRAINT curriculum_sections_title_nonblank CHECK (length(btrim(title)) > 0),
  CONSTRAINT curriculum_sections_position_nonnegative CHECK (position >= 0)
);

CREATE TRIGGER curriculum_sections_set_updated_at BEFORE UPDATE ON curriculum_sections
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE lessons
  ADD COLUMN section_id uuid,
  ADD CONSTRAINT lessons_section_scope_fk
    FOREIGN KEY (class_id, subject_id, section_id)
    REFERENCES curriculum_sections(class_id, subject_id, id) ON DELETE RESTRICT;

CREATE TABLE curriculum_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  resource_type text NOT NULL,
  resource_key text NOT NULL,
  event_type text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT curriculum_events_resource_type_nonblank CHECK (length(btrim(resource_type)) > 0),
  CONSTRAINT curriculum_events_resource_key_nonblank CHECK (length(btrim(resource_key)) > 0),
  CONSTRAINT curriculum_events_event_type_nonblank CHECK (length(btrim(event_type)) > 0),
  CONSTRAINT curriculum_events_metadata_object CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE INDEX idx_subject_class_links_class_status_position
  ON subject_class_links(class_id, status, position, subject_id);

CREATE INDEX idx_curriculum_sections_offering_position
  ON curriculum_sections(class_id, subject_id, status, position, id);

CREATE INDEX idx_lessons_offering_section_position
  ON lessons(class_id, subject_id, section_id, status, position, id);

CREATE INDEX idx_curriculum_events_resource_created
  ON curriculum_events(resource_type, resource_key, created_at DESC);

CREATE INDEX idx_curriculum_events_actor_created
  ON curriculum_events(actor_profile_id, created_at DESC)
  WHERE actor_profile_id IS NOT NULL;

COMMIT;
