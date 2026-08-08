-- Create table for tracking question generation tasks
CREATE TABLE IF NOT EXISTS question_generation_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  task_type text NOT NULL CHECK (task_type IN ('questions', 'summary', 'text', 'comprehensive')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress integer DEFAULT 0,
  result jsonb,
  error text,
  question_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_question_generation_tasks_lesson_id ON question_generation_tasks(lesson_id);
CREATE INDEX IF NOT EXISTS idx_question_generation_tasks_status ON question_generation_tasks(status);

-- RLS policies
ALTER TABLE question_generation_tasks ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins can manage generation tasks" ON question_generation_tasks
  FOR ALL USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_question_generation_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_question_generation_tasks_updated_at
  BEFORE UPDATE ON question_generation_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_question_generation_tasks_updated_at();