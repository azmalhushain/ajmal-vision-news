-- Add subscriber segmentation fields to newsletter_subscribers
ALTER TABLE public.newsletter_subscribers 
ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS engagement_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_engagement_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS segment text DEFAULT 'general',
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en';

-- Create index for faster segment queries
CREATE INDEX IF NOT EXISTS idx_subscribers_segment ON public.newsletter_subscribers(segment);
CREATE INDEX IF NOT EXISTS idx_subscribers_interests ON public.newsletter_subscribers USING GIN(interests);

-- Create a table for managing segments
CREATE TABLE IF NOT EXISTS public.subscriber_segments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  criteria jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on subscriber_segments
ALTER TABLE public.subscriber_segments ENABLE ROW LEVEL SECURITY;

-- Admin only policies for segments
CREATE POLICY "Admins can manage segments" ON public.subscriber_segments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create table for post translations cache
CREATE TABLE IF NOT EXISTS public.post_translations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  language text NOT NULL,
  translated_title text NOT NULL,
  translated_content text NOT NULL,
  translated_excerpt text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id, language)
);

-- Enable RLS on post_translations
ALTER TABLE public.post_translations ENABLE ROW LEVEL SECURITY;

-- Anyone can read translations
CREATE POLICY "Anyone can read translations" ON public.post_translations
  FOR SELECT USING (true);

-- Only admins can manage translations
CREATE POLICY "Admins can manage translations" ON public.post_translations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Add trigger for updated_at on new tables
CREATE TRIGGER update_subscriber_segments_updated_at
  BEFORE UPDATE ON public.subscriber_segments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_translations_updated_at
  BEFORE UPDATE ON public.post_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();