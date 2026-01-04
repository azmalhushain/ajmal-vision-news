-- Create email analytics table
CREATE TABLE public.email_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  clicked_links JSONB DEFAULT '[]'::jsonb,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scheduled emails table
CREATE TABLE public.scheduled_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  recipients JSONB NOT NULL DEFAULT '[]'::jsonb,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  post_id UUID REFERENCES public.posts(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_emails ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_analytics
CREATE POLICY "Admins can view email analytics" 
ON public.email_analytics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert analytics (for tracking pixels)" 
ON public.email_analytics 
FOR INSERT 
WITH CHECK (true);

-- RLS policies for scheduled_emails
CREATE POLICY "Admins can manage scheduled emails" 
ON public.scheduled_emails 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to auto-publish scheduled posts
CREATE OR REPLACE FUNCTION public.auto_publish_scheduled_posts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.posts
  SET status = 'published', updated_at = now()
  WHERE status = 'draft'
    AND scheduled_publish_at IS NOT NULL
    AND scheduled_publish_at <= now();
END;
$$;

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_emails;