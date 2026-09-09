BEGIN;

CREATE TYPE question_bank_origin AS ENUM ('manual', 'ai');
CREATE TYPE question_bank_revision_status AS ENUM ('draft', 'review', 'published', 'archived');
CREATE TYPE question_bank_question_type AS ENUM ('multiple_choice', 'true_false', 'direct');
CREATE TYPE question_bank_answer_status AS ENUM ('known', 'unknown', 'review_required');
CREATE TYPE question_bank_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE question_bank_event_action AS ENUM (
  'create',
  'import',
  'edit',
  'submit_review',
  'reject',
  'publish',
  'archive'
);

CREATE TABLE question_bank_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  origin question_bank_origin NOT NULL,
  created_by_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT question_bank_items_offering_fk
    FOREIGN KEY (class_id, subject_id)
    REFERENCES subject_class_links(class_id, subject_id) ON DELETE RESTRICT
);

CREATE TABLE question_bank_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES question_bank_items(id) ON DELETE CASCADE,
  revision_number integer NOT NULL CHECK (revision_number > 0),
  status question_bank_revision_status NOT NULL DEFAULT 'draft',
  type question_bank_question_type NOT NULL,
  prompt text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_option_index integer,
  answer_text text,
  answer_status question_bank_answer_status NOT NULL,
  difficulty question_bank_difficulty NOT NULL,
  explanation text,
  method text,
  created_by_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  submitted_for_review_by_profile_id uuid REFERENCES profiles(id) ON DELETE RESTRICT,
  submitted_for_review_at timestamptz,
  published_by_profile_id uuid REFERENCES profiles(id) ON DELETE RESTRICT,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT question_bank_revisions_item_number_unique UNIQUE (item_id, revision_number),
  CONSTRAINT question_bank_revisions_item_id_id_unique UNIQUE (item_id, id),
  CONSTRAINT question_bank_revisions_prompt_nonblank CHECK (length(btrim(prompt)) > 0),
  CONSTRAINT question_bank_revisions_options_array CHECK (jsonb_typeof(options) = 'array'),
  CONSTRAINT question_bank_revisions_explanation_nonblank CHECK (
    explanation IS NULL OR length(btrim(explanation)) > 0
  ),
  CONSTRAINT question_bank_revisions_method_nonblank CHECK (
    method IS NULL OR length(btrim(method)) > 0
  ),
  CONSTRAINT question_bank_revisions_type_shape CHECK (
    (type = 'multiple_choice' AND jsonb_array_length(options) = 4)
    OR
    (type = 'true_false' AND options = '["صح", "خطأ"]'::jsonb)
    OR
    (type = 'direct' AND jsonb_array_length(options) = 0)
  ),
  CONSTRAINT question_bank_revisions_answer_shape CHECK (
    (
      answer_status = 'known'
      AND (
        (
          type = 'direct'
          AND correct_option_index IS NULL
          AND answer_text IS NOT NULL
          AND length(btrim(answer_text)) > 0
        )
        OR
        (
          type IN ('multiple_choice', 'true_false')
          AND correct_option_index IS NOT NULL
          AND correct_option_index >= 0
          AND correct_option_index < jsonb_array_length(options)
          AND answer_text IS NOT NULL
          AND answer_text = options ->> correct_option_index
        )
      )
    )
    OR
    (
      answer_status IN ('unknown', 'review_required')
      AND correct_option_index IS NULL
      AND answer_text IS NULL
    )
  ),
  CONSTRAINT question_bank_revisions_review_state CHECK (
    status <> 'review'
    OR (
      submitted_for_review_by_profile_id IS NOT NULL
      AND submitted_for_review_at IS NOT NULL
    )
  ),
  CONSTRAINT question_bank_revisions_publish_actor_shape CHECK (
    (published_by_profile_id IS NULL) = (published_at IS NULL)
  ),
  CONSTRAINT question_bank_revisions_published_state CHECK (
    status <> 'published'
    OR (
      submitted_for_review_by_profile_id IS NOT NULL
      AND submitted_for_review_at IS NOT NULL
      AND published_by_profile_id IS NOT NULL
      AND published_at IS NOT NULL
    )
  )
);

CREATE UNIQUE INDEX ux_question_bank_open_revision
  ON question_bank_revisions(item_id)
  WHERE status IN ('draft', 'review');

CREATE UNIQUE INDEX ux_question_bank_published_revision
  ON question_bank_revisions(item_id)
  WHERE status = 'published';

CREATE INDEX idx_question_bank_revisions_item_created
  ON question_bank_revisions(item_id, revision_number DESC);

CREATE TABLE question_bank_revision_lessons (
  revision_id uuid NOT NULL REFERENCES question_bank_revisions(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE RESTRICT,
  position integer NOT NULL,
  PRIMARY KEY (revision_id, lesson_id),
  CONSTRAINT question_bank_revision_lessons_position_unique UNIQUE (revision_id, position),
  CONSTRAINT question_bank_revision_lessons_position_nonnegative CHECK (position >= 0)
);

CREATE TABLE question_bank_revision_sources (
  revision_id uuid NOT NULL REFERENCES question_bank_revisions(id) ON DELETE CASCADE,
  position integer NOT NULL,
  media_asset_id uuid NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
  page_number integer NOT NULL,
  input_checksum_sha256 text NOT NULL,
  ocr_extraction_id uuid REFERENCES ocr_extractions(id) ON DELETE RESTRICT,
  content_source_asset_id uuid REFERENCES content_source_assets(id) ON DELETE RESTRICT,
  source_quote text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (revision_id, position),
  CONSTRAINT question_bank_revision_sources_position_nonnegative CHECK (position >= 0),
  CONSTRAINT question_bank_revision_sources_page_positive CHECK (page_number > 0),
  CONSTRAINT question_bank_revision_sources_checksum_format CHECK (
    input_checksum_sha256 ~ '^[0-9a-f]{64}$'
  ),
  CONSTRAINT question_bank_revision_sources_quote_nonblank CHECK (
    source_quote IS NULL OR length(btrim(source_quote)) > 0
  ),
  CONSTRAINT question_bank_revision_sources_quote_length CHECK (
    source_quote IS NULL OR length(source_quote) <= 8000
  )
);

CREATE INDEX idx_question_bank_revision_sources_media_page
  ON question_bank_revision_sources(media_asset_id, page_number, revision_id);

CREATE TABLE question_bank_ai_imports (
  ai_output_id uuid NOT NULL REFERENCES ai_outputs(id) ON DELETE RESTRICT,
  approved_review_revision integer NOT NULL CHECK (approved_review_revision > 0),
  question_locator text NOT NULL,
  item_id uuid NOT NULL REFERENCES question_bank_items(id) ON DELETE RESTRICT,
  revision_id uuid NOT NULL,
  prompt_key text NOT NULL,
  prompt_version text NOT NULL,
  generation_mode text NOT NULL,
  imported_by_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  imported_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (ai_output_id, approved_review_revision, question_locator),
  CONSTRAINT question_bank_ai_import_review_fk
    FOREIGN KEY (ai_output_id, approved_review_revision)
    REFERENCES ai_output_review_events(ai_output_id, revision) ON DELETE RESTRICT,
  CONSTRAINT question_bank_ai_import_revision_fk
    FOREIGN KEY (item_id, revision_id)
    REFERENCES question_bank_revisions(item_id, id) ON DELETE RESTRICT,
  CONSTRAINT question_bank_ai_import_locator_nonblank CHECK (length(btrim(question_locator)) > 0),
  CONSTRAINT question_bank_ai_import_prompt_key_nonblank CHECK (length(btrim(prompt_key)) > 0),
  CONSTRAINT question_bank_ai_import_prompt_version_nonblank CHECK (length(btrim(prompt_version)) > 0),
  CONSTRAINT question_bank_ai_import_mode_nonblank CHECK (length(btrim(generation_mode)) > 0)
);

CREATE INDEX idx_question_bank_ai_import_item
  ON question_bank_ai_imports(item_id, imported_at DESC);

CREATE TABLE question_bank_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_id uuid NOT NULL REFERENCES question_bank_items(id) ON DELETE RESTRICT,
  revision_id uuid REFERENCES question_bank_revisions(id) ON DELETE RESTRICT,
  action question_bank_event_action NOT NULL,
  actor_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT question_bank_events_note_nonblank CHECK (
    note IS NULL OR length(btrim(note)) > 0
  ),
  CONSTRAINT question_bank_events_note_length CHECK (
    note IS NULL OR length(note) <= 4000
  ),
  CONSTRAINT question_bank_events_reject_note_required CHECK (
    action <> 'reject' OR note IS NOT NULL
  )
);

CREATE INDEX idx_question_bank_items_scope_created
  ON question_bank_items(class_id, subject_id, created_at DESC, id);

CREATE INDEX idx_question_bank_items_origin_created
  ON question_bank_items(origin, created_at DESC, id);

CREATE INDEX idx_question_bank_revision_lessons_lesson
  ON question_bank_revision_lessons(lesson_id, revision_id);

CREATE INDEX idx_question_bank_events_item_created
  ON question_bank_events(item_id, created_at DESC, id DESC);

CREATE TRIGGER question_bank_items_set_updated_at BEFORE UPDATE ON question_bank_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
