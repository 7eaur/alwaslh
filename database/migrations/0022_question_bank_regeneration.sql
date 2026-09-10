BEGIN;

CREATE OR REPLACE FUNCTION enforce_question_bank_regeneration_identity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  target_revision_number integer;
BEGIN
  IF NEW.generation_mode <> 'regenerate_question' THEN
    RETURN NEW;
  END IF;

  SELECT revision_number
    INTO target_revision_number
  FROM question_bank_revisions
  WHERE id = NEW.revision_id
    AND item_id = NEW.item_id;

  IF target_revision_number IS NULL OR target_revision_number <= 1 THEN
    RAISE EXCEPTION 'regenerated question must create a later revision of an existing item'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER question_bank_regeneration_identity_guard
BEFORE INSERT OR UPDATE OF generation_mode, item_id, revision_id
ON question_bank_ai_imports
FOR EACH ROW EXECUTE FUNCTION enforce_question_bank_regeneration_identity();

COMMIT;
