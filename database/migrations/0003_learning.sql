BEGIN;

CREATE TYPE quiz_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false');
CREATE TYPE practice_session_status AS ENUM ('in_progress', 'completed', 'abandoned');
CREATE TYPE attempt_status AS ENUM ('completed', 'invalidated');
CREATE TYPE notification_severity AS ENUM ('info', 'success', 'warning', 'critical');

CREATE TABLE quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status quiz_status NOT NULL DEFAULT 'draft',
  created_by_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quizzes_title_nonblank CHECK (length(btrim(title)) > 0),
  CONSTRAINT quizzes_publish_state CHECK (status <> 'published' OR published_at IS NOT NULL)
);

CREATE TABLE quiz_lessons (
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE RESTRICT,
  position integer NOT NULL DEFAULT 0,
  PRIMARY KEY (quiz_id, lesson_id),
  CONSTRAINT quiz_lessons_position_unique UNIQUE (quiz_id, position),
  CONSTRAINT quiz_lessons_position_nonnegative CHECK (position >= 0)
);

CREATE TABLE quiz_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  label text,
  shuffle_questions boolean NOT NULL DEFAULT true,
  shuffle_options boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quiz_versions_quiz_id_id_unique UNIQUE (quiz_id, id),
  CONSTRAINT quiz_versions_number_unique UNIQUE (quiz_id, version_number),
  CONSTRAINT quiz_versions_number_positive CHECK (version_number > 0)
);

CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_version_id uuid REFERENCES quiz_versions(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL,
  type question_type NOT NULL,
  prompt text NOT NULL,
  explanation text,
  difficulty smallint,
  source_page integer,
  source_reference text,
  position integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT questions_prompt_nonblank CHECK (length(btrim(prompt)) > 0),
  CONSTRAINT questions_context_present CHECK (quiz_version_id IS NOT NULL OR lesson_id IS NOT NULL),
  CONSTRAINT questions_difficulty_valid CHECK (difficulty IS NULL OR difficulty BETWEEN 1 AND 5),
  CONSTRAINT questions_source_page_valid CHECK (source_page IS NULL OR source_page > 0),
  CONSTRAINT questions_position_nonnegative CHECK (position >= 0)
);

CREATE UNIQUE INDEX ux_questions_quiz_version_position
ON questions(quiz_version_id, position)
WHERE quiz_version_id IS NOT NULL;

CREATE TABLE question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  label text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  position integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT question_options_question_id_id_unique UNIQUE (question_id, id),
  CONSTRAINT question_options_position_unique UNIQUE (question_id, position),
  CONSTRAINT question_options_label_nonblank CHECK (length(btrim(label)) > 0),
  CONSTRAINT question_options_position_nonnegative CHECK (position >= 0)
);

CREATE UNIQUE INDEX ux_question_single_correct_option
ON question_options(question_id)
WHERE is_correct = true;

CREATE TABLE practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_version_id uuid REFERENCES quiz_versions(id) ON DELETE SET NULL,
  lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL,
  status practice_session_status NOT NULL DEFAULT 'in_progress',
  current_question_id uuid,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT practice_sessions_profile_id_id_unique UNIQUE (profile_id, id),
  CONSTRAINT practice_sessions_version_id_id_unique UNIQUE (quiz_version_id, id),
  CONSTRAINT practice_sessions_exact_context CHECK (
    (quiz_version_id IS NOT NULL AND lesson_id IS NULL)
    OR
    (quiz_version_id IS NULL AND lesson_id IS NOT NULL)
  ),
  CONSTRAINT practice_sessions_completed_state CHECK (status <> 'completed' OR completed_at IS NOT NULL)
);

CREATE TABLE practice_session_questions (
  session_id uuid NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
  position integer NOT NULL,
  PRIMARY KEY (session_id, question_id),
  CONSTRAINT practice_session_questions_position_unique UNIQUE (session_id, position),
  CONSTRAINT practice_session_questions_position_nonnegative CHECK (position >= 0)
);

ALTER TABLE practice_sessions
ADD CONSTRAINT practice_sessions_current_question_fk
FOREIGN KEY (id, current_question_id)
REFERENCES practice_session_questions(session_id, question_id)
DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE practice_session_options (
  session_id uuid NOT NULL,
  question_id uuid NOT NULL,
  option_id uuid NOT NULL,
  position integer NOT NULL,
  PRIMARY KEY (session_id, question_id, option_id),
  CONSTRAINT practice_session_options_session_question_fk
    FOREIGN KEY (session_id, question_id)
    REFERENCES practice_session_questions(session_id, question_id) ON DELETE CASCADE,
  CONSTRAINT practice_session_options_question_option_fk
    FOREIGN KEY (question_id, option_id)
    REFERENCES question_options(question_id, id) ON DELETE RESTRICT,
  CONSTRAINT practice_session_options_position_unique UNIQUE (session_id, question_id, position),
  CONSTRAINT practice_session_options_position_nonnegative CHECK (position >= 0)
);

CREATE TABLE practice_answers (
  session_id uuid NOT NULL,
  question_id uuid NOT NULL,
  selected_option_id uuid,
  answered_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, question_id),
  CONSTRAINT practice_answers_session_question_fk
    FOREIGN KEY (session_id, question_id)
    REFERENCES practice_session_questions(session_id, question_id) ON DELETE CASCADE,
  CONSTRAINT practice_answers_presented_option_fk
    FOREIGN KEY (session_id, question_id, selected_option_id)
    REFERENCES practice_session_options(session_id, question_id, option_id) ON DELETE RESTRICT
);

CREATE TABLE quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  quiz_id uuid NOT NULL,
  quiz_version_id uuid NOT NULL,
  session_id uuid NOT NULL UNIQUE,
  status attempt_status NOT NULL DEFAULT 'completed',
  correct_count integer NOT NULL,
  question_count integer NOT NULL,
  score_percent numeric(5,2) GENERATED ALWAYS AS (
    round((correct_count::numeric / question_count::numeric) * 100, 2)
  ) STORED,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quiz_attempts_profile_session_fk
    FOREIGN KEY (profile_id, session_id)
    REFERENCES practice_sessions(profile_id, id) ON DELETE RESTRICT,
  CONSTRAINT quiz_attempts_version_session_fk
    FOREIGN KEY (quiz_version_id, session_id)
    REFERENCES practice_sessions(quiz_version_id, id) ON DELETE RESTRICT,
  CONSTRAINT quiz_attempts_quiz_version_fk
    FOREIGN KEY (quiz_id, quiz_version_id)
    REFERENCES quiz_versions(quiz_id, id) ON DELETE RESTRICT,
  CONSTRAINT quiz_attempts_correct_count_nonnegative CHECK (correct_count >= 0),
  CONSTRAINT quiz_attempts_question_count_positive CHECK (question_count > 0),
  CONSTRAINT quiz_attempts_correct_not_over_total CHECK (correct_count <= question_count)
);

CREATE TABLE saved_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT saved_questions_profile_question_unique UNIQUE (profile_id, question_id)
);

CREATE TABLE achievement_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  rule_type text NOT NULL,
  rule_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT achievement_definitions_code_nonblank CHECK (length(btrim(code)) > 0),
  CONSTRAINT achievement_definitions_title_nonblank CHECK (length(btrim(title)) > 0),
  CONSTRAINT achievement_definitions_rule_type_nonblank CHECK (length(btrim(rule_type)) > 0)
);

CREATE TABLE student_achievements (
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievement_definitions(id) ON DELETE RESTRICT,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  source_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (profile_id, achievement_id)
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  severity notification_severity NOT NULL DEFAULT 'info',
  target_profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  target_class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  action_path text,
  published_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_by_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notifications_title_nonblank CHECK (length(btrim(title)) > 0),
  CONSTRAINT notifications_body_nonblank CHECK (length(btrim(body)) > 0),
  CONSTRAINT notifications_expiry_valid CHECK (expires_at IS NULL OR expires_at > published_at),
  CONSTRAINT notifications_single_target CHECK (target_profile_id IS NULL OR target_class_id IS NULL)
);

CREATE TABLE notification_reads (
  notification_id uuid NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (notification_id, profile_id)
);

CREATE INDEX idx_questions_lesson_position ON questions(lesson_id, position);
CREATE INDEX idx_practice_sessions_profile_status ON practice_sessions(profile_id, status, updated_at DESC);
CREATE INDEX idx_quiz_attempts_profile_completed ON quiz_attempts(profile_id, completed_at DESC);
CREATE INDEX idx_notifications_profile_published ON notifications(target_profile_id, published_at DESC);
CREATE INDEX idx_notifications_class_published ON notifications(target_class_id, published_at DESC);
CREATE INDEX idx_notifications_global_published ON notifications(published_at DESC)
WHERE target_profile_id IS NULL AND target_class_id IS NULL;

CREATE TRIGGER quizzes_set_updated_at BEFORE UPDATE ON quizzes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER questions_set_updated_at BEFORE UPDATE ON questions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER practice_sessions_set_updated_at BEFORE UPDATE ON practice_sessions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
