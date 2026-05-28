-- Create site_config table
CREATE TABLE public.site_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    mercado_pago_public_key TEXT,
    mercado_pago_access_token TEXT,
    mercado_pago_enabled BOOLEAN DEFAULT false,
    whatsapp_numero TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT singleton_check CHECK (id = 1)
);

-- Initial config row
INSERT INTO public.site_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Grant permissions
GRANT SELECT, UPDATE ON public.site_config TO authenticated;
GRANT ALL ON public.site_config TO service_role;

-- Enable RLS
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view site_config" 
ON public.site_config 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update site_config" 
ON public.site_config 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_site_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_config_updated_at
BEFORE UPDATE ON public.site_config
FOR EACH ROW
EXECUTE FUNCTION public.update_site_config_updated_at();
