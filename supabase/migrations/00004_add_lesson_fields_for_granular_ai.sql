ALTER TABLE lessons ADD COLUMN IF NOT EXISTS extracted_text TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS ai_thumbnails TEXT[]; -- Store the AI-optimized URLs as well
