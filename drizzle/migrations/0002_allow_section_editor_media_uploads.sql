DROP POLICY IF EXISTS "Admins can upload post images" ON storage.objects;
CREATE POLICY "Admins and section editors can upload post images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'post-images'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_section_edit('posts')
    OR public.has_section_edit('gallery')
    OR public.has_section_edit('podcasts')
    OR public.has_section_edit('hero')
    OR public.has_section_edit('about')
  )
);

DROP POLICY IF EXISTS "Admins can update post images" ON storage.objects;
CREATE POLICY "Admins and section editors can update post images" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'post-images'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_section_edit('posts')
    OR public.has_section_edit('gallery')
    OR public.has_section_edit('podcasts')
    OR public.has_section_edit('hero')
    OR public.has_section_edit('about')
  )
)
WITH CHECK (
  bucket_id = 'post-images'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_section_edit('posts')
    OR public.has_section_edit('gallery')
    OR public.has_section_edit('podcasts')
    OR public.has_section_edit('hero')
    OR public.has_section_edit('about')
  )
);

DROP POLICY IF EXISTS "Admins can delete post images" ON storage.objects;
CREATE POLICY "Admins and section editors can delete post images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'post-images'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_section_edit('posts')
    OR public.has_section_edit('gallery')
    OR public.has_section_edit('podcasts')
    OR public.has_section_edit('hero')
    OR public.has_section_edit('about')
  )
);

DROP POLICY IF EXISTS "Admins write sports-logos" ON storage.objects;
CREATE POLICY "Admins and sports editors write sports-logos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'sports-logos'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_section_edit('sports'))
);

DROP POLICY IF EXISTS "Admins update sports-logos" ON storage.objects;
CREATE POLICY "Admins and sports editors update sports-logos" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'sports-logos'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_section_edit('sports'))
)
WITH CHECK (
  bucket_id = 'sports-logos'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_section_edit('sports'))
);

DROP POLICY IF EXISTS "Admins delete sports-logos" ON storage.objects;
CREATE POLICY "Admins and sports editors delete sports-logos" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'sports-logos'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_section_edit('sports'))
);

DROP POLICY IF EXISTS "Admins write sports-media" ON storage.objects;
CREATE POLICY "Admins and sports editors write sports-media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'sports-media'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_section_edit('sports'))
);

DROP POLICY IF EXISTS "Admins update sports-media" ON storage.objects;
CREATE POLICY "Admins and sports editors update sports-media" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'sports-media'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_section_edit('sports'))
)
WITH CHECK (
  bucket_id = 'sports-media'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_section_edit('sports'))
);

DROP POLICY IF EXISTS "Admins delete sports-media" ON storage.objects;
CREATE POLICY "Admins and sports editors delete sports-media" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'sports-media'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_section_edit('sports'))
);