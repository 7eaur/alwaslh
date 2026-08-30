\set ON_ERROR_STOP on

BEGIN;

DO $$
DECLARE
  v_class uuid;
  v_subject uuid;
  v_other_subject uuid;
  v_lesson uuid;
  v_profile uuid;
  v_quiz uuid;
  v_version uuid;
  v_question uuid;
  v_correct_option uuid;
  v_wrong_option uuid;
  v_session uuid;
BEGIN
  INSERT INTO classes (slug, name) VALUES ('smoke-class', 'صف تجريبي') RETURNING id INTO v_class;
  INSERT INTO subjects (slug, name) VALUES ('smoke-subject', 'مادة تجريبية') RETURNING id INTO v_subject;
  INSERT INTO subjects (slug, name) VALUES ('other-subject', 'مادة أخرى') RETURNING id INTO v_other_subject;
  INSERT INTO subject_class_links (class_id, subject_id, position) VALUES (v_class, v_subject, 0);

  -- A lesson must belong to an actual subject/class link.
  BEGIN
    INSERT INTO lessons (class_id, subject_id, slug, title)
    VALUES (v_class, v_other_subject, 'invalid-link', 'يجب أن يفشل');
    RAISE EXCEPTION 'Expected lesson subject/class FK violation';
  EXCEPTION WHEN foreign_key_violation THEN
    NULL;
  END;

  INSERT INTO lessons (class_id, subject_id, slug, title)
  VALUES (v_class, v_subject, 'lesson-1', 'درس تجريبي')
  RETURNING id INTO v_lesson;

  INSERT INTO lesson_assets (lesson_id, kind, position, storage_key, mime_type)
  VALUES (v_lesson, 'image', 0, 'smoke/lesson-1/page-1.webp', 'image/webp');

  -- Stable page order must be unique inside one lesson.
  BEGIN
    INSERT INTO lesson_assets (lesson_id, kind, position, storage_key, mime_type)
    VALUES (v_lesson, 'image', 0, 'smoke/lesson-1/page-duplicate.webp', 'image/webp');
    RAISE EXCEPTION 'Expected duplicate lesson asset position violation';
  EXCEPTION WHEN unique_violation THEN
    NULL;
  END;

  INSERT INTO profiles (auth_subject, role, display_name)
  VALUES ('smoke-student', 'student', 'طالب تجريبي')
  RETURNING id INTO v_profile;

  -- Full code is exactly six digits.
  BEGIN
    INSERT INTO full_access_codes (code) VALUES ('12345');
    RAISE EXCEPTION 'Expected invalid full-access code format violation';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;

  INSERT INTO full_access_codes (code) VALUES ('123456');

  -- Class code is exactly seven digits.
  BEGIN
    INSERT INTO class_access_codes (code, class_id) VALUES ('123456', v_class);
    RAISE EXCEPTION 'Expected invalid class-access code format violation';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;

  INSERT INTO class_access_codes (code, class_id) VALUES ('1234567', v_class);

  INSERT INTO quizzes (title, status) VALUES ('اختبار تجريبي', 'draft') RETURNING id INTO v_quiz;
  INSERT INTO quiz_lessons (quiz_id, lesson_id, position) VALUES (v_quiz, v_lesson, 0);
  INSERT INTO quiz_versions (quiz_id, version_number) VALUES (v_quiz, 1) RETURNING id INTO v_version;
  INSERT INTO questions (quiz_version_id, lesson_id, type, prompt, position)
  VALUES (v_version, v_lesson, 'multiple_choice', 'ما الإجابة الصحيحة؟', 0)
  RETURNING id INTO v_question;

  INSERT INTO question_options (question_id, label, is_correct, position)
  VALUES (v_question, 'الصحيحة', true, 0) RETURNING id INTO v_correct_option;
  INSERT INTO question_options (question_id, label, is_correct, position)
  VALUES (v_question, 'الخاطئة', false, 1) RETURNING id INTO v_wrong_option;

  -- A question cannot have two correct options.
  BEGIN
    INSERT INTO question_options (question_id, label, is_correct, position)
    VALUES (v_question, 'صحيحة ثانية', true, 2);
    RAISE EXCEPTION 'Expected single-correct-option unique violation';
  EXCEPTION WHEN unique_violation THEN
    NULL;
  END;

  INSERT INTO practice_sessions (profile_id, quiz_version_id)
  VALUES (v_profile, v_version) RETURNING id INTO v_session;
  INSERT INTO practice_session_questions (session_id, question_id, position)
  VALUES (v_session, v_question, 0);
  INSERT INTO practice_session_options (session_id, question_id, option_id, position)
  VALUES
    (v_session, v_question, v_wrong_option, 0),
    (v_session, v_question, v_correct_option, 1);
  INSERT INTO practice_answers (session_id, question_id, selected_option_id)
  VALUES (v_session, v_question, v_correct_option);

  -- A generated attempt score is derived from counts at the DB boundary.
  INSERT INTO quiz_attempts (
    profile_id, quiz_id, quiz_version_id, session_id, correct_count, question_count
  ) VALUES (
    v_profile, v_quiz, v_version, v_session, 1, 1
  );

  IF NOT EXISTS (
    SELECT 1 FROM quiz_attempts
    WHERE session_id = v_session AND score_percent = 100.00
  ) THEN
    RAISE EXCEPTION 'Generated score_percent check failed';
  END IF;
END
$$;

ROLLBACK;

\echo 'schema_smoke.sql: PASS'
