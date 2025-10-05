-- Add new fields to resources table for enhanced story functionality
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS audio_file_path TEXT,
ADD COLUMN IF NOT EXISTS pdf_file_path TEXT;

COMMENT ON COLUMN public.resources.audio_url IS 'Public URL of the background audio/music for the story';
COMMENT ON COLUMN public.resources.audio_file_path IS 'Storage path of the audio file in Supabase Storage';
COMMENT ON COLUMN public.resources.pdf_file_path IS 'Storage path of the PDF file in Supabase Storage for PDF-based stories';