import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type CarrosselImagem = {
  id: string;
  url: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
};

export function useCarrossel() {
  const [imagens, setImagens] = useState<CarrosselImagem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('carrossel_imagens')
      .select('*')
      .order('ordem', { ascending: true });
    if (!error && data) setImagens(data as CarrosselImagem[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
    const ch = supabase
      .channel('carrossel_imagens_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'carrossel_imagens' }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetch]);

  const uploadImage = async (file: File): Promise<string | null> => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) return null;
    if (file.size > 5 * 1024 * 1024) return null;
    const ext = file.name.split('.').pop();
    const path = `carrossel/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('site-imagens').upload(path, file, {
      cacheControl: '3600', upsert: false,
    });
    if (error) return null;
    const { data } = supabase.storage.from('site-imagens').getPublicUrl(path);
    return data.publicUrl;
  };

  const addImagem = async (url: string) => {
    const maxOrdem = imagens.reduce((m, i) => Math.max(m, i.ordem), 0);
    const { error } = await supabase.from('carrossel_imagens').insert({
      url, ordem: maxOrdem + 1, ativo: true,
    });
    return { error };
  };

  const removeImagem = async (id: string) => {
    const { error } = await supabase.from('carrossel_imagens').delete().eq('id', id);
    return { error };
  };

  const toggleAtivo = async (id: string, ativo: boolean) => {
    const { error } = await supabase.from('carrossel_imagens').update({ ativo }).eq('id', id);
    return { error };
  };

  const saveOrder = async (orderedIds: string[]) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await supabase.from('carrossel_imagens').update({ ordem: i + 1 }).eq('id', orderedIds[i]);
    }
  };

  return { imagens, loading, uploadImage, addImagem, removeImagem, toggleAtivo, saveOrder, refetch: fetch };
}
