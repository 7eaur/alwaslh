-- Table for tracking progress in quizzes and lessons
CREATE TABLE IF NOT EXISTS public.quiz_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE,
  current_index integer DEFAULT 0,
  user_answers jsonb DEFAULT '[]'::jsonb,
  is_completed boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT one_per_student_lesson UNIQUE (student_id, lesson_id),
  CONSTRAINT one_per_student_quiz UNIQUE (student_id, quiz_id)
);

-- RLS
ALTER TABLE public.quiz_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage their own progress" ON public.quiz_progress
  FOR ALL TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins can view all progress" ON public.quiz_progress
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Function to handle timestamp updates
CREATE OR REPLACE FUNCTION update_quiz_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quiz_progress_time
BEFORE UPDATE ON public.quiz_progress
FOR EACH ROW
EXECUTE FUNCTION update_quiz_progress_timestamp();