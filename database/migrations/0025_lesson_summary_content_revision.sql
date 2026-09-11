BEGIN;

CREATE OR REPLACE FUNCTION ensure_lesson_summary_content_revision()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.summary IS DISTINCT FROM OLD.summary
     AND NEW.content_revision = OLD.content_revision THEN
    NEW.content_revision := OLD.content_revision + 1;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lessons_summary_content_revision ON lessons;
CREATE TRIGGER lessons_summary_content_revision
BEFORE UPDATE OF summary ON lessons
FOR EACH ROW
EXECUTE FUNCTION ensure_lesson_summary_content_revision();

COMMIT;
