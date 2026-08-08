-- Add questions and user_answers to quiz_attempts
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS questions jsonb DEFAULT '[]';
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS user_answers jsonb DEFAULT '[]';
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS version_name text;
