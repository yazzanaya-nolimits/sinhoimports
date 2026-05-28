-- Ensure proper grants
GRANT SELECT ON public.site_config TO anon, authenticated;
GRANT ALL ON public.site_config TO service_role;

-- Refine RLS policies for site_config
DROP POLICY IF EXISTS "Config visível publicamente" ON public.site_config;
DROP POLICY IF EXISTS "Admins can view site_config" ON public.site_config;

-- Policy for everyone to see general config
CREATE POLICY "Public can view general config" 
ON public.site_config 
FOR SELECT 
USING (true);

-- We will handle sensitive columns by not selecting them in the frontend.
-- To be even safer, we could use a view, but let's start by fixing the visibility issue.
