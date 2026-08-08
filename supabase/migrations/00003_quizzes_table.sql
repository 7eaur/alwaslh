CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  lesson_ids uuid[] NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Policies for quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to quizzes" ON quizzes
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Students can view quizzes" ON quizzes
  FOR SELECT TO authenticated USING (true);
