-- Add video_url to podcasts table
ALTER TABLE public.podcasts ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.podcasts ADD COLUMN IF NOT EXISTS media_type text DEFAULT 'audio';

-- Update existing rows to have media_type as 'audio'
UPDATE public.podcasts SET media_type = 'audio' WHERE media_type IS NULL;