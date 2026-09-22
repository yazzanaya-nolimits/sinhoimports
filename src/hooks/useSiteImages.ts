import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { removePublicImage, storagePathFromPublicUrl, uploadPublicImage, type UploadedImage } from '@/lib/imageUpload';

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

  const uploadImage = (file: File): Promise<UploadedImage> =>
    uploadPublicImage(file, 'site-imagens');

  const setCapa = async (upload: UploadedImage) => {
    const previous = images.filter(image => image.tipo === 'capa');
    const { error } = await supabase.from('imagens_site').insert({ tipo: 'capa', url: upload.url, ordem: 0 });
    if (error) {
      await removePublicImage('site-imagens', upload.path).catch(() => undefined);
      return { error };
    }
    if (previous.length > 0) {
      const { error: deleteError } = await supabase.from('imagens_site').delete().in('id', previous.map(image => image.id));
      if (deleteError) return { error: deleteError };
      await Promise.all(previous.map(async image => {
        const path = storagePathFromPublicUrl(image.url, 'site-imagens');
        if (path) await removePublicImage('site-imagens', path).catch(() => undefined);
      }));
    }
    await fetch();
    return { error: null };
  };

  const addCarrossel = async (upload: UploadedImage) => {
    const maxOrdem = images
      .filter(i => i.tipo === 'carrossel')
      .reduce((m, i) => Math.max(m, i.ordem), 0);
    const { error } = await supabase.from('imagens_site').insert({
      tipo: 'carrossel',
      url: upload.url,
      ordem: maxOrdem + 1,
    });
    if (error) await removePublicImage('site-imagens', upload.path).catch(() => undefined);
    else await fetch();
    return { error };
  };

  const removeImage = async (id: string) => {
    const image = images.find(item => item.id === id);
    const { error } = await supabase.from('imagens_site').delete().eq('id', id);
    if (!error && image) {
      const path = storagePathFromPublicUrl(image.url, 'site-imagens');
      if (path) await removePublicImage('site-imagens', path).catch(() => undefined);
      await fetch();
    }
    return { error };
  };

  const saveOrder = async (orderedIds: string[]) => {
    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await supabase.from('imagens_site').update({ ordem: i + 1 }).eq('id', orderedIds[i]);
      if (error) return { error };
    }
    await fetch();
    return { error: null };
  };

  const capa = images.find(i => i.tipo === 'capa') || null;
  const carrossel = images.filter(i => i.tipo === 'carrossel');

  return { images, capa, carrossel, loading, uploadImage, setCapa, addCarrossel, removeImage, saveOrder, refetch: fetch };
}
