import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Banner = {
  id: string;
  mensagem: string;
  ativo: boolean;
  updated_at: string;
};

export function useBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('banner_desconto')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);
    setBanner((data?.[0] as Banner) || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
    const ch = supabase
      .channel('banner_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banner_desconto' }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetch]);

  const update = async (patch: Partial<Banner>) => {
    if (!banner) {
      const { error } = await supabase.from('banner_desconto').insert({
        mensagem: patch.mensagem ?? '',
        ativo: patch.ativo ?? false,
      });
      return { error };
    }
    const { error } = await supabase
      .from('banner_desconto')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', banner.id);
    return { error };
  };

  return { banner, loading, update };
}
