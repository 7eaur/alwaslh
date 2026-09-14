BEGIN;

-- Stage16 sync authority is intentionally scoped to learner-visible lesson packages.
-- `content_revisions` existed since 0004 but had no authoritative writers.

CREATE OR REPLACE FUNCTION record_lesson_content_revision()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  revision_id bigint;
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO content_revisions (
      entity_type, entity_id, change_type, class_id, metadata
    ) VALUES (
      'lesson', OLD.id, 'delete', OLD.class_id,
      jsonb_build_object(
        'lessonId', OLD.id,
        'contentRevision', OLD.content_revision,
        'publishedAt', OLD.published_at,
        'status', OLD.status
      )
    ) RETURNING revision INTO revision_id;

    INSERT INTO content_tombstones (
      entity_type, entity_id, class_id, deleted_revision, deleted_at
    ) VALUES (
      'lesson', OLD.id, OLD.class_id, revision_id, now()
    )
    ON CONFLICT (entity_type, entity_id) DO UPDATE
      SET class_id = EXCLUDED.class_id,
          deleted_revision = EXCLUDED.deleted_revision,
          deleted_at = EXCLUDED.deleted_at;

    RETURN OLD;
  END IF;

  -- Draft-only records are not Student sync authority. A transition away from
  -- a previously published lesson is still recorded so clients can invalidate.
  IF TG_OP = 'INSERT' AND (NEW.published_at IS NULL OR NEW.status <> 'active') THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE'
     AND OLD.published_at IS NULL
     AND NEW.published_at IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO content_revisions (
    entity_type, entity_id, change_type, class_id, metadata
  ) VALUES (
    'lesson', NEW.id, 'upsert', NEW.class_id,
    jsonb_build_object(
      'lessonId', NEW.id,
      'contentRevision', NEW.content_revision,
      'publishedAt', NEW.published_at,
      'status', NEW.status
    )
  );

  DELETE FROM content_tombstones
   WHERE entity_type = 'lesson' AND entity_id = NEW.id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION record_lesson_asset_content_revision()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  asset_record lesson_assets%ROWTYPE;
  lesson_record lessons%ROWTYPE;
  revision_id bigint;
  next_lesson_revision bigint;
  was_or_is_published boolean;
BEGIN
  IF TG_OP = 'DELETE' THEN
    asset_record := OLD;
  ELSE
    asset_record := NEW;
  END IF;

  SELECT * INTO lesson_record
    FROM lessons
   WHERE id = asset_record.lesson_id;

  -- A parent lesson delete is already represented by a lesson tombstone. If the
  -- parent no longer exists, there is no separate learner package to reconcile.
  IF NOT FOUND THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
  END IF;

  was_or_is_published :=
    (TG_OP <> 'INSERT' AND OLD.publication_status = 'published')
    OR (TG_OP <> 'DELETE' AND NEW.publication_status = 'published');

  IF NOT was_or_is_published OR lesson_record.published_at IS NULL OR lesson_record.status <> 'active' THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
  END IF;

  -- Published lesson assets are part of the signed offline package. Any
  -- learner-visible asset mutation advances the canonical lesson revision.
  UPDATE lessons
     SET content_revision = content_revision + 1
   WHERE id = asset_record.lesson_id
   RETURNING content_revision INTO next_lesson_revision;

  IF TG_OP = 'DELETE' THEN
    INSERT INTO content_revisions (
      entity_type, entity_id, change_type, class_id, metadata
    ) VALUES (
      'lesson_asset', OLD.id, 'delete', lesson_record.class_id,
      jsonb_build_object(
        'lessonId', OLD.lesson_id,
        'contentRevision', next_lesson_revision,
        'publicationStatus', OLD.publication_status
      )
    ) RETURNING revision INTO revision_id;

    INSERT INTO content_tombstones (
      entity_type, entity_id, class_id, deleted_revision, deleted_at
    ) VALUES (
      'lesson_asset', OLD.id, lesson_record.class_id, revision_id, now()
    )
    ON CONFLICT (entity_type, entity_id) DO UPDATE
      SET class_id = EXCLUDED.class_id,
          deleted_revision = EXCLUDED.deleted_revision,
          deleted_at = EXCLUDED.deleted_at;

    RETURN OLD;
  END IF;

  INSERT INTO content_revisions (
    entity_type, entity_id, change_type, class_id, metadata
  ) VALUES (
    'lesson_asset', NEW.id, 'upsert', lesson_record.class_id,
    jsonb_build_object(
      'lessonId', NEW.lesson_id,
      'contentRevision', next_lesson_revision,
      'publicationStatus', NEW.publication_status
    )
  );

  DELETE FROM content_tombstones
   WHERE entity_type = 'lesson_asset' AND entity_id = NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lessons_content_revision_log ON lessons;
CREATE TRIGGER lessons_content_revision_log
AFTER INSERT OR UPDATE OR DELETE ON lessons
FOR EACH ROW EXECUTE FUNCTION record_lesson_content_revision();

DROP TRIGGER IF EXISTS lesson_assets_content_revision_log ON lesson_assets;
CREATE TRIGGER lesson_assets_content_revision_log
AFTER INSERT OR UPDATE OR DELETE ON lesson_assets
FOR EACH ROW EXECUTE FUNCTION record_lesson_asset_content_revision();

CREATE INDEX IF NOT EXISTS idx_content_revisions_offline_delta
  ON content_revisions(revision, class_id, entity_type)
  WHERE entity_type IN ('lesson', 'lesson_asset');

COMMIT;
