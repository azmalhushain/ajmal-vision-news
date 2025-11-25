-- Add scheduled_publish_at column to posts table
ALTER TABLE posts ADD COLUMN scheduled_publish_at timestamp with time zone;

-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create function to auto-publish scheduled posts
CREATE OR REPLACE FUNCTION auto_publish_scheduled_posts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE posts
  SET status = 'published'
  WHERE status = 'scheduled'
    AND scheduled_publish_at <= NOW()
    AND scheduled_publish_at IS NOT NULL;
END;
$$;

-- Schedule the function to run every minute
SELECT cron.schedule(
  'auto-publish-posts',
  '* * * * *',
  'SELECT auto_publish_scheduled_posts();'
);