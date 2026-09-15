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

  IF TG_OP = 'UPDATE'
     AND OLD.kind IS NOT DISTINCT FROM NEW.kind
     AND OLD.position IS NOT DISTINCT FROM NEW.position
     AND OLD.storage_key IS NOT DISTINCT FROM NEW.storage_key
     AND OLD.mime_type IS NOT DISTINCT FROM NEW.mime_type
     AND OLD.byte_size IS NOT DISTINCT FROM NEW.byte_size
     AND OLD.width IS NOT DISTINCT FROM NEW.width
     AND OLD.height IS NOT DISTINCT FROM NEW.height
     AND OLD.checksum_sha256 IS NOT DISTINCT FROM NEW.checksum_sha256
     AND OLD.source_page_number IS NOT DISTINCT FROM NEW.source_page_number
     AND OLD.media_asset_id IS NOT DISTINCT FROM NEW.media_asset_id
     AND OLD.publication_status IS NOT DISTINCT FROM NEW.publication_status
     AND OLD.asset_published_at IS NOT DISTINCT FROM NEW.asset_published_at THEN
    RETURN NEW;
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

CREATE OR REPLACE FUNCTION bump_lesson_revision_for_reader_ocr()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  variant_id uuid;
  old_visible boolean := false;
  new_visible boolean := false;
  old_text text;
  new_text text;
  target record;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    old_text := coalesce(nullif(OLD.normalized_text, ''), nullif(OLD.raw_text, ''));
    old_visible := OLD.status = 'completed'
      AND OLD.review_status IN ('not_required', 'approved')
      AND old_text IS NOT NULL;
  END IF;
  IF TG_OP <> 'DELETE' THEN
    new_text := coalesce(nullif(NEW.normalized_text, ''), nullif(NEW.raw_text, ''));
    new_visible := NEW.status = 'completed'
      AND NEW.review_status IN ('not_required', 'approved')
      AND new_text IS NOT NULL;
  END IF;

  IF NOT old_visible AND NOT new_visible THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE'
     AND old_visible = new_visible
     AND OLD.input_media_variant_id = NEW.input_media_variant_id
     AND old_text IS NOT DISTINCT FROM new_text THEN
    RETURN NEW;
  END IF;

  variant_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.input_media_variant_id ELSE NEW.input_media_variant_id END;

  FOR target IN
    SELECT DISTINCT l.id AS lesson_id
      FROM media_variants mv
      JOIN media_assets ma ON ma.id = mv.media_asset_id
      JOIN lesson_assets la ON la.media_asset_id = ma.id
      JOIN lessons l ON l.id = la.lesson_id
     WHERE mv.id = variant_id
       AND la.publication_status = 'published'
       AND l.status = 'active'
       AND l.published_at IS NOT NULL
  LOOP
    UPDATE lessons
       SET content_revision = content_revision + 1
     WHERE id = target.lesson_id;
  END LOOP;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
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

DROP TRIGGER IF EXISTS reader_ocr_content_revision ON ocr_extractions;
CREATE TRIGGER reader_ocr_content_revision
AFTER INSERT OR UPDATE OR DELETE ON ocr_extractions
FOR EACH ROW EXECUTE FUNCTION bump_lesson_revision_for_reader_ocr();

CREATE INDEX IF NOT EXISTS idx_content_revisions_offline_delta
  ON content_revisions(revision, class_id, entity_type)
  WHERE entity_type IN ('lesson', 'lesson_asset');

COMMIT;
