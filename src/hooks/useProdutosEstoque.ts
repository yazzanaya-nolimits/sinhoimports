import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ProdutoEstoque = {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: string | null;
  valor: number;          // valor de venda
  valor_compra: number;
  quantidade: number;
  quantidade_minima: number;
  lucro_valor: number;
  margem_percentual: number;
  estoque_status: 'disponivel' | 'baixo' | 'esgotado';
  status: 'ativo' | 'inativo' | string;
  foto_url: string | null;
  imagem_destaque_url: string | null;
  variacoes: any[];
  aceita_pix: boolean;
  aceita_cartao: boolean;
  max_parcelas: number;
  created_at: string;
  updated_at: string;
};

export function useProdutosEstoque() {
  const [items, setItems] = useState<ProdutoEstoque[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    const { data } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false });
    setItems((data || []) as unknown as ProdutoEstoque[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
    const ch = supabase
      .channel('produtos_estoque_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, () => fetchItems())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchItems]);

  const updateProduto = async (id: string, patch: Partial<ProdutoEstoque>) => {
    const { error } = await supabase.from('produtos').update(patch as never).eq('id', id);
    return { error };
  };

  const registrarEntrada = async (
    produto_id: string,
    quantidade: number,
    valor_unitario: number,
    motivo: string,
    gerar_despesa: boolean,
  ) => {
    const { data, error } = await supabase.rpc('registrar_entrada_estoque', {
      p_produto_id: produto_id,
      p_quantidade: quantidade,
      p_valor_unitario: valor_unitario,
      p_motivo: motivo,
      p_gerar_despesa: gerar_despesa,
    });
    return { data, error };
  };

  return { items, loading, refresh: fetchItems, updateProduto, registrarEntrada };
}
