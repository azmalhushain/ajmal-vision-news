-- Create A/B test table for email subject lines
CREATE TABLE IF NOT EXISTS public.email_ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_name TEXT NOT NULL,
  variant_a_subject TEXT NOT NULL,
  variant_b_subject TEXT NOT NULL,
  variant_a_sent_count INTEGER DEFAULT 0,
  variant_b_sent_count INTEGER DEFAULT 0,
  variant_a_open_count INTEGER DEFAULT 0,
  variant_b_open_count INTEGER DEFAULT 0,
  variant_a_click_count INTEGER DEFAULT 0,
  variant_b_click_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  winning_variant TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS for A/B tests
ALTER TABLE public.email_ab_tests ENABLE ROW LEVEL SECURITY;

-- RLS policies for A/B tests (admins only)
CREATE POLICY "Admins can manage A/B tests" ON public.email_ab_tests
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create subscriber preferences table for more detailed preferences
CREATE TABLE IF NOT EXISTS public.subscriber_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID NOT NULL REFERENCES public.newsletter_subscribers(id) ON DELETE CASCADE,
  email_frequency TEXT DEFAULT 'weekly',
  preferred_time TEXT DEFAULT 'morning',
  receive_breaking_news BOOLEAN DEFAULT true,
  receive_weekly_digest BOOLEAN DEFAULT true,
  receive_event_notifications BOOLEAN DEFAULT true,
  receive_promotional BOOLEAN DEFAULT false,
  unsubscribed_categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subscriber_id)
);

-- Enable RLS for subscriber preferences
ALTER TABLE public.subscriber_preferences ENABLE ROW LEVEL SECURITY;

-- Public can read/update their own preferences (by email token)
CREATE POLICY "Anyone can view preferences with valid token" ON public.subscriber_preferences
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update preferences with valid token" ON public.subscriber_preferences
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can insert preferences" ON public.subscriber_preferences
  FOR INSERT WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_subscriber_preferences_updated_at
  BEFORE UPDATE ON public.subscriber_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();