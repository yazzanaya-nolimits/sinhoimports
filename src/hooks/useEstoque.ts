import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type EstoqueStatus = 'disponivel' | 'baixo' | 'esgotado';

export type EstoqueItem = {
  id: string;
  nome: string;
  tipo: string | null;
  quantidade: number;
  quantidade_minima: number;
  valor_compra: number;
  valor_venda: number;
  lucro_valor: number;
  margem_percentual: number;
  status: EstoqueStatus;
  created_at: string;
  updated_at: string;
};

export function useEstoque() {
  const [items, setItems] = useState<EstoqueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('estoque')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setItems(data as unknown as EstoqueItem[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
    const channel = supabase
      .channel('estoque_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estoque' }, () => fetchItems())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems]);

  const createItem = async (payload: Partial<EstoqueItem>) => {
    const { error } = await supabase.from('estoque').insert({
      nome: payload.nome!,
      tipo: payload.tipo || null,
      quantidade: payload.quantidade ?? 0,
      quantidade_minima: payload.quantidade_minima ?? 5,
      valor_compra: payload.valor_compra ?? 0,
      valor_venda: payload.valor_venda ?? 0,
    });
    return { error };
  };

  const updateItem = async (id: string, patch: Partial<EstoqueItem>) => {
    const { error } = await supabase.from('estoque').update(patch as never).eq('id', id);
    return { error };
  };

  const adjustQuantity = async (item: EstoqueItem, delta: number) => {
    const novaQtd = Math.max(0, item.quantidade + delta);
    return updateItem(item.id, { quantidade: novaQtd });
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('estoque').delete().eq('id', id);
    return { error };
  };

  return { items, loading, createItem, updateItem, adjustQuantity, deleteItem, refetch: fetchItems };
}
