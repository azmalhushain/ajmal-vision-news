-- About page content
CREATE TABLE public.about_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title_line1 text NOT NULL DEFAULT 'MEET',
  hero_title_line2 text NOT NULL DEFAULT 'AJMAL AKHTAR AZAD',
  hero_description text NOT NULL DEFAULT 'A dedicated public servant committed to transforming Bhokraha Narsingh through inclusive development and transparent governance.',
  bio_title text NOT NULL DEFAULT 'The Journey',
  bio_content text NOT NULL DEFAULT 'Born and raised in Bhokraha Narsingh, Mayor Ajmal Akhtar Azad has deep roots in the community he serves.',
  bio_image_url text,
  values_json jsonb NOT NULL DEFAULT '[{"icon":"Handshake","title":"Transparency","description":"Open and accountable governance"},{"icon":"Users","title":"Inclusivity","description":"Ensuring development benefits reach every citizen"},{"icon":"Lightbulb","title":"Innovation","description":"Embracing modern technology"},{"icon":"Heart","title":"Service","description":"Dedicated public service"},{"icon":"Leaf","title":"Sustainability","description":"Sustainable development"},{"icon":"Star","title":"Excellence","description":"Striving for highest standards"}]'::jsonb,
  achievements_json jsonb NOT NULL DEFAULT '[{"number":"25+","title":"Infrastructure Projects","description":"Road construction, bridge building"},{"number":"8","title":"Health Posts Upgraded","description":"Modernized healthcare facilities"},{"number":"15","title":"Schools Renovated","description":"Improved educational infrastructure"},{"number":"500+","title":"Families Benefited","description":"Direct impact through programs"}]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Gallery images
CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contact page content
CREATE TABLE public.contact_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title_line1 text NOT NULL DEFAULT 'GET IN',
  hero_title_line2 text NOT NULL DEFAULT 'TOUCH',
  hero_description text NOT NULL DEFAULT 'Have questions or suggestions? We''d love to hear from you.',
  office_address text NOT NULL DEFAULT 'Bhokraha Narsingh Municipality\nSunsari District, Province No. 1, Nepal',
  phone_numbers text NOT NULL DEFAULT '+977-XXX-XXXXXX',
  email_addresses text NOT NULL DEFAULT 'info@bhokrahanarsingh.gov.np',
  office_hours text NOT NULL DEFAULT 'Sunday - Friday: 10:00 AM - 5:00 PM\nSaturday: Closed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Footer content
CREATE TABLE public.footer_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'AJMAL AKHTAR AZAD',
  site_description text NOT NULL DEFAULT 'Mayor of Bhokraha Narsingh Municipality, committed to transparent governance and inclusive development.',
  facebook_url text DEFAULT '#',
  twitter_url text DEFAULT '#',
  instagram_url text DEFAULT '#',
  youtube_url text DEFAULT '#',
  address text NOT NULL DEFAULT 'Bhokraha Narsingh Municipality\nSunsari District, Nepal',
  phone text NOT NULL DEFAULT '+977-XXX-XXXXXX',
  email text NOT NULL DEFAULT 'info@bhokrahanarsingh.gov.np',
  copyright_text text NOT NULL DEFAULT 'Ajmal Akhtar Azad. All rights reserved.',
  tagline text NOT NULL DEFAULT 'Developed with ❤️ for Bhokraha Narsingh',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_content ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can view about content" ON public.about_content FOR SELECT USING (true);
CREATE POLICY "Anyone can view gallery images" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Anyone can view contact content" ON public.contact_content FOR SELECT USING (true);
CREATE POLICY "Anyone can view footer content" ON public.footer_content FOR SELECT USING (true);

-- Admin write policies
CREATE POLICY "Admins can manage about content" ON public.about_content FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage gallery images" ON public.gallery_images FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage contact content" ON public.contact_content FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage footer content" ON public.footer_content FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default data
INSERT INTO public.about_content (id) VALUES (gen_random_uuid());
INSERT INTO public.contact_content (id) VALUES (gen_random_uuid());
INSERT INTO public.footer_content (id) VALUES (gen_random_uuid());

-- Add triggers for updated_at
CREATE TRIGGER update_about_content_updated_at BEFORE UPDATE ON public.about_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gallery_images_updated_at BEFORE UPDATE ON public.gallery_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contact_content_updated_at BEFORE UPDATE ON public.contact_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_footer_content_updated_at BEFORE UPDATE ON public.footer_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Allow admins to manage user_roles (insert, update, delete)
CREATE POLICY "Admins can insert user roles" ON public.user_roles FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update user roles" ON public.user_roles FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete user roles" ON public.user_roles FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));