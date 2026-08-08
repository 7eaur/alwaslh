-- Create export_history table to track PDF exports
CREATE TABLE IF NOT EXISTS export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  lesson_ids UUID[] NOT NULL,
  lesson_titles TEXT[] NOT NULL,
  subject_name TEXT,
  class_name TEXT,
  export_options JSONB NOT NULL,
  CONSTRAINT export_history_lesson_ids_check CHECK (array_length(lesson_ids, 1) > 0)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_export_history_created_at ON export_history(created_at DESC);

-- Enable RLS
ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to view export history (admin only in practice)
CREATE POLICY "Authenticated users can view export history"
  ON export_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow all authenticated users to insert export history
CREATE POLICY "Authenticated users can insert export history"
  ON export_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow all authenticated users to delete export history
CREATE POLICY "Authenticated users can delete export history"
  ON export_history
  FOR DELETE
  TO authenticated
  USING (true);