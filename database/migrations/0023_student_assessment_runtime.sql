BEGIN;

CREATE TYPE student_assessment_mode AS ENUM ('practice', 'test');

ALTER TABLE practice_sessions
  ADD COLUMN mode student_assessment_mode NOT NULL DEFAULT 'practice';

ALTER TABLE practice_answers
  ADD COLUMN direct_answer_text text,
  ADD CONSTRAINT practice_answers_exactly_one_answer CHECK (
    (selected_option_id IS NOT NULL)::integer + (direct_answer_text IS NOT NULL)::integer = 1
  ),
  ADD CONSTRAINT practice_answers_direct_nonblank CHECK (
    direct_answer_text IS NULL OR length(btrim(direct_answer_text)) > 0
  ),
  ADD CONSTRAINT practice_answers_direct_length CHECK (
    direct_answer_text IS NULL OR length(direct_answer_text) <= 10000
  );

CREATE UNIQUE INDEX ux_practice_sessions_active_quiz_mode
  ON practice_sessions(profile_id, quiz_version_id, mode)
  WHERE status = 'in_progress' AND quiz_version_id IS NOT NULL;

CREATE OR REPLACE FUNCTION enforce_practice_answer_question_type()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  question_kind question_type;
BEGIN
  SELECT q.type
    INTO question_kind
  FROM practice_session_questions psq
  JOIN questions q ON q.id = psq.question_id
  WHERE psq.session_id = NEW.session_id
    AND psq.question_id = NEW.question_id;

  IF question_kind IS NULL THEN
    RAISE EXCEPTION 'practice answer question is not part of the session' USING ERRCODE = '23503';
  END IF;

  IF question_kind = 'direct' THEN
    IF NEW.selected_option_id IS NOT NULL
       OR NEW.direct_answer_text IS NULL
       OR length(btrim(NEW.direct_answer_text)) = 0 THEN
      RAISE EXCEPTION 'direct practice answers require text only' USING ERRCODE = '23514';
    END IF;
  ELSE
    IF NEW.selected_option_id IS NULL OR NEW.direct_answer_text IS NOT NULL THEN
      RAISE EXCEPTION 'choice practice answers require a presented option only' USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER practice_answers_question_type_guard
BEFORE INSERT OR UPDATE OF selected_option_id, direct_answer_text, session_id, question_id
ON practice_answers
FOR EACH ROW EXECUTE FUNCTION enforce_practice_answer_question_type();

COMMIT;
