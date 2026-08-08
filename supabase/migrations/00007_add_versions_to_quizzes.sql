ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS versions jsonb DEFAULT '[]'::jsonb;
