CREATE TABLE IF NOT EXISTS public.lesson_upload_tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
  status text NOT NULL, -- 'uploading', 'detecting', 'completed', 'failed'
  progress integer DEFAULT 0,
  files jsonb DEFAULT '[]'::jsonb, -- Array of { url, aiUrl, id, name }
  detected_pages jsonb DEFAULT '[]'::jsonb, -- Array of DetectedPage
  error text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lesson_upload_tasks_pkey PRIMARY KEY (id)
);

-- RLS (Assume public for simplicity in this educational app as per existing pattern)
ALTER TABLE public.lesson_upload_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to lesson_upload_tasks" ON public.lesson_upload_tasks;
CREATE POLICY "Allow public access to lesson_upload_tasks" ON public.lesson_upload_tasks FOR ALL USING (true) WITH CHECK (true);
