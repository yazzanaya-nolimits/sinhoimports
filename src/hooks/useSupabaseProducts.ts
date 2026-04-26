import { useState, useEffect } from 'react';
import { supabase, type DatabaseProduct } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { formatBRL } from '@/lib/brl';

export function useSupabaseProducts() {
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data || []) as DatabaseProduct[]);
    } catch (error: any) {
      console.error('Error fetching products:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'produtos',
        },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const saveProduct = async (product: Partial<DatabaseProduct>) => {
    try {
      const { data, error } = product.id
        ? await supabase
            .from('produtos')
            .update({ ...product, updated_at: new Date().toISOString() })
            .eq('id', product.id)
            .select()
        : await supabase.from('produtos').insert([product]).select();

      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Produto salvo e publicado com sucesso!' });
      return data?.[0];
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('produtos').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Produto excluído com sucesso!' });
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const toggleStatus = async (id: string, currentStatus: 'ativo' | 'inativo') => {
    const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
    try {
      const { error } = await supabase
        .from('produtos')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao alterar status',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const uploadFile = async (file: File, bucket: string = 'produtos') => {
    try {
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.type)) {
        toast({
          title: 'Formato não suportado',
          description: 'Use JPG, PNG ou WebP.',
          variant: 'destructive',
        });
        return null;
      }
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: 'Erro no upload',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    products,
    loading,
    saveProduct,
    deleteProduct,
    toggleStatus,
    uploadFile,
    refresh: fetchProducts
  };
}
