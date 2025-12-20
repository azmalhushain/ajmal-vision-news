-- Create contact_messages table to store all contact form submissions
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for contact_messages
CREATE POLICY "Anyone can submit contact messages" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all contact messages" 
ON public.contact_messages 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update contact messages" 
ON public.contact_messages 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete contact messages" 
ON public.contact_messages 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create email_templates table for admin customization
CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type text NOT NULL UNIQUE,
  subject text NOT NULL,
  body_html text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_templates
CREATE POLICY "Admins can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default email templates
INSERT INTO public.email_templates (template_type, subject, body_html) VALUES
('new_comment', 'New Comment on {{post_title}}', '<h2>New Comment Received</h2><p><strong>Post:</strong> {{post_title}}</p><p><strong>Author:</strong> {{author_name}}</p><p><strong>Comment:</strong> {{content}}</p>'),
('new_subscriber', 'New Newsletter Subscriber', '<h2>New Subscriber</h2><p>Email: {{email}}</p><p>Subscribed at: {{subscribed_at}}</p>'),
('new_user', 'New User Registration', '<h2>New User Registered</h2><p><strong>Name:</strong> {{full_name}}</p><p><strong>Email:</strong> {{email}}</p>'),
('contact_form', 'New Contact Form Submission', '<h2>New Contact Message</h2><p><strong>Name:</strong> {{name}}</p><p><strong>Email:</strong> {{email}}</p><p><strong>Phone:</strong> {{phone}}</p><p><strong>Subject:</strong> {{subject}}</p><p><strong>Message:</strong> {{message}}</p>'),
('new_post', 'New Post Published', '<h2>New Post Published</h2><p><strong>Title:</strong> {{title}}</p><p><strong>Category:</strong> {{category}}</p><p><strong>Excerpt:</strong> {{excerpt}}</p>');

-- Add developer_name and developer_url columns to footer_content
ALTER TABLE public.footer_content 
ADD COLUMN developer_name text DEFAULT 'Bhokraha Narsingh Team',
ADD COLUMN developer_url text DEFAULT '#';

-- Add trigger for updated_at on contact_messages
CREATE TRIGGER update_contact_messages_updated_at
BEFORE UPDATE ON public.contact_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on email_templates
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update profiles table for user profile card
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS location text;

-- Add policy to let anyone view profiles (for showing user info on comments)
CREATE POLICY "Anyone can view profiles for display" 
ON public.profiles 
FOR SELECT 
USING (true);