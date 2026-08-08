
-- إصلاح lesson_image_url لكل نموذج في الاختبارات الموجودة
CREATE OR REPLACE FUNCTION fix_quiz_versions_lesson_images()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  quiz_rec RECORD;
  versions_arr JSONB;
  new_versions JSONB;
  v JSONB;
  v_idx INT;
  v_lesson_id TEXT;
  v_lesson_image TEXT;
  updated_questions JSONB;
  q JSONB;
BEGIN
  FOR quiz_rec IN SELECT id, versions FROM quizzes WHERE versions IS NOT NULL AND jsonb_array_length(versions) > 0 LOOP
    versions_arr := quiz_rec.versions;
    new_versions := '[]'::JSONB;

    FOR v_idx IN 0 .. jsonb_array_length(versions_arr) - 1 LOOP
      v := versions_arr -> v_idx;
      v_lesson_id := v ->> 'lesson_id';

      -- جلب صورة الدرس بناءً على lesson_id للنموذج (image_urls هو ARRAY وليس JSONB)
      v_lesson_image := NULL;
      IF v_lesson_id IS NOT NULL THEN
        SELECT image_urls[1]
        INTO v_lesson_image
        FROM lessons
        WHERE id::text = v_lesson_id
        LIMIT 1;
      END IF;

      -- إذا وُجدت الصورة، حدّث النموذج وأسئلته
      IF v_lesson_image IS NOT NULL THEN
        -- تحديث lesson_page_url لكل سؤال في هذا النموذج
        updated_questions := '[]'::JSONB;
        IF v -> 'questions' IS NOT NULL AND jsonb_array_length(v -> 'questions') > 0 THEN
          FOR q IN SELECT value FROM jsonb_array_elements(v -> 'questions') LOOP
            updated_questions := updated_questions || jsonb_build_array(
              q || jsonb_build_object('lesson_page_url', v_lesson_image)
            );
          END LOOP;
        END IF;

        v := v || jsonb_build_object('lesson_image_url', v_lesson_image);
        IF jsonb_array_length(updated_questions) > 0 THEN
          v := v || jsonb_build_object('questions', updated_questions);
        END IF;
      END IF;

      new_versions := new_versions || jsonb_build_array(v);
    END LOOP;

    UPDATE quizzes SET versions = new_versions WHERE id = quiz_rec.id;
  END LOOP;
END;
$$;

SELECT fix_quiz_versions_lesson_images();

DROP FUNCTION fix_quiz_versions_lesson_images();
