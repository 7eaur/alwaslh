BEGIN;

CREATE TYPE quiz_builder_event_action AS ENUM (
  'create',
  'edit',
  'version_add',
  'version_update',
  'version_remove',
  'submit_review',
  'reject',
  'publish'
);

ALTER TABLE quizzes
  ADD COLUMN class_id uuid,
  ADD COLUMN subject_id uuid,
  ADD COLUMN shuffle_versions boolean NOT NULL DEFAULT true,
  ADD COLUMN submitted_for_review_by_profile_id uuid REFERENCES profiles(id) ON DELETE RESTRICT,
  ADD COLUMN submitted_for_review_at timestamptz,
  ADD COLUMN published_by_profile_id uuid REFERENCES profiles(id) ON DELETE RESTRICT,
  ADD CONSTRAINT quizzes_scope_pair CHECK ((class_id IS NULL) = (subject_id IS NULL)),
  ADD CONSTRAINT quizzes_offering_fk
    FOREIGN KEY (class_id, subject_id)
    REFERENCES subject_class_links(class_id, subject_id) ON DELETE RESTRICT,
  ADD CONSTRAINT quizzes_review_state CHECK (
    status <> 'review'
    OR (
      class_id IS NOT NULL
      AND submitted_for_review_by_profile_id IS NOT NULL
      AND submitted_for_review_at IS NOT NULL
    )
  ),
  ADD CONSTRAINT quizzes_published_builder_state CHECK (
    status <> 'published'
    OR class_id IS NULL
    OR (
      submitted_for_review_by_profile_id IS NOT NULL
      AND submitted_for_review_at IS NOT NULL
      AND published_by_profile_id IS NOT NULL
      AND published_at IS NOT NULL
    )
  );

ALTER TABLE questions
  ADD COLUMN answer_text text,
  ADD COLUMN question_bank_item_id uuid,
  ADD COLUMN question_bank_revision_id uuid,
  ADD CONSTRAINT questions_question_bank_pair CHECK (
    (question_bank_item_id IS NULL) = (question_bank_revision_id IS NULL)
  ),
  ADD CONSTRAINT questions_question_bank_revision_fk
    FOREIGN KEY (question_bank_item_id, question_bank_revision_id)
    REFERENCES question_bank_revisions(item_id, id) ON DELETE RESTRICT,
  ADD CONSTRAINT questions_direct_answer_shape CHECK (
    (type = 'direct' AND answer_text IS NOT NULL AND length(btrim(answer_text)) > 0)
    OR (type <> 'direct' AND answer_text IS NULL)
  );

CREATE TABLE quiz_builder_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE RESTRICT,
  quiz_version_id uuid REFERENCES quiz_versions(id) ON DELETE SET NULL,
  action quiz_builder_event_action NOT NULL,
  actor_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quiz_builder_events_note_nonblank CHECK (note IS NULL OR length(btrim(note)) > 0),
  CONSTRAINT quiz_builder_events_note_length CHECK (note IS NULL OR length(note) <= 4000),
  CONSTRAINT quiz_builder_events_reject_note_required CHECK (action <> 'reject' OR note IS NOT NULL)
);

CREATE INDEX idx_quizzes_scope_status_created
  ON quizzes(class_id, subject_id, status, created_at DESC, id)
  WHERE class_id IS NOT NULL;
CREATE INDEX idx_quiz_builder_events_quiz_created
  ON quiz_builder_events(quiz_id, created_at DESC, id DESC);
CREATE INDEX idx_questions_question_bank_revision
  ON questions(question_bank_revision_id, quiz_version_id)
  WHERE question_bank_revision_id IS NOT NULL;

CREATE OR REPLACE FUNCTION enforce_quiz_lesson_scope()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  quiz_row quizzes%ROWTYPE;
  lesson_row lessons%ROWTYPE;
BEGIN
  SELECT * INTO quiz_row FROM quizzes WHERE id = NEW.quiz_id;
  IF quiz_row.id IS NULL OR quiz_row.class_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO lesson_row FROM lessons WHERE id = NEW.lesson_id;
  IF lesson_row.id IS NULL
     OR lesson_row.class_id <> quiz_row.class_id
     OR lesson_row.subject_id <> quiz_row.subject_id THEN
    RAISE EXCEPTION 'quiz lesson is outside quiz class/subject scope' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER quiz_lessons_scope_guard
BEFORE INSERT OR UPDATE ON quiz_lessons
FOR EACH ROW EXECUTE FUNCTION enforce_quiz_lesson_scope();

CREATE OR REPLACE FUNCTION enforce_quiz_question_bank_snapshot()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  quiz_id_value uuid;
  quiz_class uuid;
  quiz_subject uuid;
  bank_class uuid;
  bank_subject uuid;
  bank_status question_bank_revision_status;
  bank_answer_status question_bank_answer_status;
BEGIN
  IF NEW.quiz_version_id IS NULL OR NEW.question_bank_revision_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT v.quiz_id, q.class_id, q.subject_id
    INTO quiz_id_value, quiz_class, quiz_subject
  FROM quiz_versions v
  JOIN quizzes q ON q.id = v.quiz_id
  WHERE v.id = NEW.quiz_version_id;

  SELECT i.class_id, i.subject_id, r.status, r.answer_status
    INTO bank_class, bank_subject, bank_status, bank_answer_status
  FROM question_bank_revisions r
  JOIN question_bank_items i ON i.id = r.item_id
  WHERE r.id = NEW.question_bank_revision_id
    AND r.item_id = NEW.question_bank_item_id;

  IF quiz_id_value IS NULL OR quiz_class IS NULL OR quiz_subject IS NULL THEN
    RAISE EXCEPTION 'builder quiz scope is incomplete' USING ERRCODE = '23514';
  END IF;
  IF bank_status <> 'published' OR bank_answer_status <> 'known' THEN
    RAISE EXCEPTION 'quiz snapshots require published questions with known answers' USING ERRCODE = '23514';
  END IF;
  IF bank_class <> quiz_class OR bank_subject <> quiz_subject THEN
    RAISE EXCEPTION 'question bank revision is outside quiz scope' USING ERRCODE = '23514';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM question_bank_revision_lessons rls
    JOIN quiz_lessons ql ON ql.lesson_id = rls.lesson_id
    WHERE rls.revision_id = NEW.question_bank_revision_id
      AND ql.quiz_id = quiz_id_value
      AND (NEW.lesson_id IS NULL OR NEW.lesson_id = rls.lesson_id)
  ) THEN
    RAISE EXCEPTION 'question bank revision has no selected quiz lesson' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER questions_question_bank_snapshot_guard
BEFORE INSERT OR UPDATE OF quiz_version_id, lesson_id, question_bank_item_id, question_bank_revision_id
ON questions
FOR EACH ROW EXECUTE FUNCTION enforce_quiz_question_bank_snapshot();

CREATE OR REPLACE FUNCTION block_published_quiz_structure_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  target_quiz_id uuid;
  version_id_value uuid;
  question_id_value uuid;
  current_status quiz_status;
BEGIN
  IF TG_TABLE_NAME = 'quiz_versions' THEN
    target_quiz_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.quiz_id ELSE NEW.quiz_id END;
  ELSIF TG_TABLE_NAME = 'quiz_lessons' THEN
    target_quiz_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.quiz_id ELSE NEW.quiz_id END;
  ELSIF TG_TABLE_NAME = 'questions' THEN
    version_id_value := CASE WHEN TG_OP = 'DELETE' THEN OLD.quiz_version_id ELSE NEW.quiz_version_id END;
    IF version_id_value IS NOT NULL THEN
      SELECT quiz_id INTO target_quiz_id FROM quiz_versions WHERE id = version_id_value;
    END IF;
  ELSIF TG_TABLE_NAME = 'question_options' THEN
    question_id_value := CASE WHEN TG_OP = 'DELETE' THEN OLD.question_id ELSE NEW.question_id END;
    SELECT v.quiz_id INTO target_quiz_id
    FROM questions q
    JOIN quiz_versions v ON v.id = q.quiz_version_id
    WHERE q.id = question_id_value;
  END IF;

  IF target_quiz_id IS NOT NULL THEN
    SELECT status INTO current_status FROM quizzes WHERE id = target_quiz_id;
    IF current_status = 'published' THEN
      RAISE EXCEPTION 'published quiz snapshots are immutable' USING ERRCODE = '23514';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER quiz_versions_published_immutable
BEFORE INSERT OR UPDATE OR DELETE ON quiz_versions
FOR EACH ROW EXECUTE FUNCTION block_published_quiz_structure_mutation();
CREATE TRIGGER quiz_lessons_published_immutable
BEFORE INSERT OR UPDATE OR DELETE ON quiz_lessons
FOR EACH ROW EXECUTE FUNCTION block_published_quiz_structure_mutation();
CREATE TRIGGER questions_published_immutable
BEFORE INSERT OR UPDATE OR DELETE ON questions
FOR EACH ROW EXECUTE FUNCTION block_published_quiz_structure_mutation();
CREATE TRIGGER question_options_published_immutable
BEFORE INSERT OR UPDATE OR DELETE ON question_options
FOR EACH ROW EXECUTE FUNCTION block_published_quiz_structure_mutation();

COMMIT;
