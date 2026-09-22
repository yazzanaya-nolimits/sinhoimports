import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { removePublicImage, storagePathFromPublicUrl, uploadPublicImage, type UploadedImage } from '@/lib/imageUpload';

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

  const uploadImage = (file: File): Promise<UploadedImage> =>
    uploadPublicImage(file, 'site-imagens', 'carrossel');

  const addImagem = async (upload: UploadedImage) => {
    const maxOrdem = imagens.reduce((m, i) => Math.max(m, i.ordem), 0);
    const { error } = await supabase.from('carrossel_imagens').insert({
      url: upload.url, ordem: maxOrdem + 1, ativo: true,
    });
    if (error) await removePublicImage('site-imagens', upload.path).catch(() => undefined);
    else await fetch();
    return { error };
  };

  const removeImagem = async (id: string) => {
    const image = imagens.find(item => item.id === id);
    const { error } = await supabase.from('carrossel_imagens').delete().eq('id', id);
    if (!error && image) {
      const path = storagePathFromPublicUrl(image.url, 'site-imagens');
      if (path) await removePublicImage('site-imagens', path).catch(() => undefined);
      await fetch();
    }
    return { error };
  };

  const toggleAtivo = async (id: string, ativo: boolean) => {
    const { error } = await supabase.from('carrossel_imagens').update({ ativo }).eq('id', id);
    if (!error) await fetch();
    return { error };
  };

  const saveOrder = async (orderedIds: string[]) => {
    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await supabase.from('carrossel_imagens').update({ ordem: i + 1 }).eq('id', orderedIds[i]);
      if (error) return { error };
    }
    await fetch();
    return { error: null };
  };

  return { imagens, loading, uploadImage, addImagem, removeImagem, toggleAtivo, saveOrder, refetch: fetch };
}
