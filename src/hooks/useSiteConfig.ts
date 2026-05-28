import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type SiteConfig = {
  id: number;
  mercado_pago_public_key: string | null;
  mercado_pago_access_token: string | null;
  mercado_pago_enabled: boolean;
  whatsapp_numero: string | null;
  updated_at: string;
};

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) throw error;
      setConfig(data as SiteConfig);
    } catch (error: any) {
      console.error('Error fetching site config:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = async (updates: Partial<SiteConfig>) => {
    try {
      const { error } = await supabase
        .from('site_config')
        .update(updates)
        .eq('id', 1);

      if (error) throw error;
      
      setConfig(prev => prev ? { ...prev, ...updates } : null);
      toast({ title: 'Configurações atualizadas com sucesso!' });
      return { ok: true };
    } catch (error: any) {
      toast({ 
        title: 'Erro ao atualizar configurações', 
        description: error.message, 
        variant: 'destructive' 
      });
      return { ok: false, error };
    }
  };

  return { config, loading, updateConfig, refresh: fetchConfig };
}
