-- Add multimedia columns to student_notes
ALTER TABLE student_notes ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text';
ALTER TABLE student_notes ADD COLUMN IF NOT EXISTS media_url TEXT;

-- Create storage bucket for student notes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student_notes_media', 'student_notes_media', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for student_notes_media bucket
CREATE POLICY "Public access to student_notes_media"
ON storage.objects FOR SELECT
USING (bucket_id = 'student_notes_media');

CREATE POLICY "Allow authenticated students to upload notes media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'student_notes_media');

CREATE POLICY "Allow authenticated students to delete notes media"
ON storage.objects FOR DELETE
USING (bucket_id = 'student_notes_media');
