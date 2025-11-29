-- Add video_url and is_pinned to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'News';

-- Add is_pinned to gallery_images
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- Create podcasts table
CREATE TABLE public.podcasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  cover_image_url TEXT,
  duration TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on podcasts
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;

-- RLS policies for podcasts
CREATE POLICY "Anyone can view active podcasts"
ON public.podcasts FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage podcasts"
ON public.podcasts FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on podcasts
CREATE TRIGGER update_podcasts_updated_at
BEFORE UPDATE ON public.podcasts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create admin_notifications table for storing admin emails
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  notify_on_new_user BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can manage notifications
CREATE POLICY "Admins can manage notifications"
ON public.admin_notifications FOR ALL
USING (has_role(auth.uid(), 'admin'));