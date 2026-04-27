import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SiteImage = {
  id: string;
  tipo: 'capa' | 'carrossel';
  url: string;
  ordem: number;
  created_at: string;
};

export function useSiteImages() {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('imagens_site')
      .select('*')
      .order('ordem', { ascending: true });
    if (!error && data) setImages(data as SiteImage[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
    const ch = supabase
      .channel('imagens_site_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'imagens_site' }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetch]);

  const uploadImage = async (file: File): Promise<string | null> => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) return null;
    const ext = file.name.split('.').pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('site-imagens').upload(path, file, {
      cacheControl: '3600', upsert: false,
    });
    if (error) return null;
    const { data } = supabase.storage.from('site-imagens').getPublicUrl(path);
    return data.publicUrl;
  };

  const setCapa = async (url: string) => {
    // Delete previous capa(s) and insert the new one
    await supabase.from('imagens_site').delete().eq('tipo', 'capa');
    const { error } = await supabase.from('imagens_site').insert({ tipo: 'capa', url, ordem: 0 });
    return { error };
  };

  const addCarrossel = async (url: string) => {
    const maxOrdem = images
      .filter(i => i.tipo === 'carrossel')
      .reduce((m, i) => Math.max(m, i.ordem), 0);
    const { error } = await supabase.from('imagens_site').insert({
      tipo: 'carrossel',
      url,
      ordem: maxOrdem + 1,
    });
    return { error };
  };

  const removeImage = async (id: string) => {
    const { error } = await supabase.from('imagens_site').delete().eq('id', id);
    return { error };
  };

  const saveOrder = async (orderedIds: string[]) => {
    // Update each row sequentially (small N)
    for (let i = 0; i < orderedIds.length; i++) {
      await supabase.from('imagens_site').update({ ordem: i + 1 }).eq('id', orderedIds[i]);
    }
  };

  const capa = images.find(i => i.tipo === 'capa') || null;
  const carrossel = images.filter(i => i.tipo === 'carrossel');

  return { images, capa, carrossel, loading, uploadImage, setCapa, addCarrossel, removeImage, saveOrder, refetch: fetch };
}
