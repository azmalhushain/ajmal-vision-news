-- Create push_subscriptions table for web push notifications
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create push_notifications table to store sent notifications
CREATE TABLE IF NOT EXISTS public.push_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT DEFAULT '/news',
  icon TEXT,
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for push_subscriptions (allow insert/delete from anyone for subscribing)
CREATE POLICY "Anyone can subscribe to push notifications"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view their subscription"
  ON public.push_subscriptions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can unsubscribe"
  ON public.push_subscriptions FOR DELETE
  USING (true);

-- RLS policies for push_notifications (public read)
CREATE POLICY "Anyone can view push notifications"
  ON public.push_notifications FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert notifications"
  ON public.push_notifications FOR INSERT
  WITH CHECK (true);

-- Create function to increment A/B test counters
CREATE OR REPLACE FUNCTION public.increment_ab_test_counter(
  test_id UUID,
  column_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE format(
    'UPDATE email_ab_tests SET %I = COALESCE(%I, 0) + 1 WHERE id = $1',
    column_name,
    column_name
  ) USING test_id;
END;
$$;