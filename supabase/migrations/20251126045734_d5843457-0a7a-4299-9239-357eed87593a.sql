-- Create table for hero section content
CREATE TABLE IF NOT EXISTS public.hero_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_line1 text NOT NULL DEFAULT 'TOGETHER FOR',
  title_line2 text NOT NULL DEFAULT 'A PROSPEROUS',
  title_line3 text NOT NULL DEFAULT 'BHOKRAHA NARSINGH',
  description text NOT NULL DEFAULT 'Working hand-in-hand with citizens for development, dignity, and democracy.',
  button1_text text NOT NULL DEFAULT 'Learn More',
  button1_link text NOT NULL DEFAULT '#',
  button2_text text NOT NULL DEFAULT 'Watch Video',
  button2_link text NOT NULL DEFAULT '#',
  hero_image_url text,
  stat1_number text NOT NULL DEFAULT '15+',
  stat1_label text NOT NULL DEFAULT 'Projects Completed',
  stat2_number text NOT NULL DEFAULT '500+',
  stat2_label text NOT NULL DEFAULT 'Families Benefited',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create table for vision section
CREATE TABLE IF NOT EXISTS public.vision_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_line1 text NOT NULL DEFAULT 'I BELIEVE IN',
  title_line2 text NOT NULL DEFAULT 'PEOPLE-FIRST',
  title_line3 text NOT NULL DEFAULT 'DEVELOPMENT',
  description text NOT NULL DEFAULT '"जनताकै साथमा, जनताकै लागि" - With the people, for the people. Every decision, every project, every initiative is driven by the needs and aspirations of our citizens.',
  stat1_number text NOT NULL DEFAULT '100%',
  stat1_label text NOT NULL DEFAULT 'Ward Coverage',
  stat2_number text NOT NULL DEFAULT '25+',
  stat2_label text NOT NULL DEFAULT 'Infrastructure Projects',
  stat3_number text NOT NULL DEFAULT '8',
  stat3_label text NOT NULL DEFAULT 'Health Posts Upgraded',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create table for development areas
CREATE TABLE IF NOT EXISTS public.development_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vision_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_areas ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Anyone can view
CREATE POLICY "Anyone can view hero content" ON public.hero_content FOR SELECT USING (true);
CREATE POLICY "Anyone can view vision content" ON public.vision_content FOR SELECT USING (true);
CREATE POLICY "Anyone can view development areas" ON public.development_areas FOR SELECT USING (true);

-- RLS Policies - Admins can manage
CREATE POLICY "Admins can update hero content" ON public.hero_content FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert hero content" ON public.hero_content FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update vision content" ON public.vision_content FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert vision content" ON public.vision_content FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage development areas" ON public.development_areas FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_hero_content_updated_at
  BEFORE UPDATE ON public.hero_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vision_content_updated_at
  BEFORE UPDATE ON public.vision_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_development_areas_updated_at
  BEFORE UPDATE ON public.development_areas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data for hero section
INSERT INTO public.hero_content (id) VALUES (gen_random_uuid());

-- Insert default data for vision section
INSERT INTO public.vision_content (id) VALUES (gen_random_uuid());

-- Insert default development areas
INSERT INTO public.development_areas (title, description, icon_name, display_order) VALUES
('Infrastructure', 'Modern roads, bridges, and public facilities for better connectivity and quality of life.', 'Building2', 1),
('Healthcare', 'Accessible healthcare for all with upgraded facilities and trained medical staff.', 'Heart', 2),
('Education', 'Quality education opportunities with modern infrastructure and digital learning.', 'GraduationCap', 3),
('Empowerment', 'Youth and women empowerment through skill development and employment programs.', 'Users', 4);