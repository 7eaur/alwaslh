-- Add description column to student_notes
ALTER TABLE public.student_notes ADD COLUMN IF NOT EXISTS description text;

-- Create student_achievements table
CREATE TABLE IF NOT EXISTS public.student_achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE,
  achievement_type text NOT NULL, -- e.g., 'excellence', 'distinction'
  badge_icon text,
  points integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for achievements
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for achievements
CREATE POLICY "Students can view their own achievements" ON public.student_achievements
  FOR SELECT TO authenticated USING (auth.uid() = student_id);

CREATE POLICY "Admins can manage achievements" ON public.student_achievements
  FOR ALL TO authenticated USING (is_admin(auth.uid()));
