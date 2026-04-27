import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Venda = {
  id: string;
  produto_id: string | null;
  produto_nome: string;
  variacao: string | null;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  desconto_aplicado: number;
  cupom_codigo: string | null;
  forma_pagamento: string;
  parcelas: number;
  status: 'concluida' | 'cancelada' | string;
  observacao: string | null;
  cliente_nome: string | null;
  created_at: string;
  updated_at: string;
};

export type ConfirmarVendaInput = {
  produto_id: string;
  quantidade: number;
  valor_unitario: number;
  desconto?: number;
  cupom?: string | null;
  forma_pagamento: string;
  parcelas?: number;
  observacao?: string | null;
  cliente_nome?: string | null;
  variacao?: string | null;
};

export function useVendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendas = useCallback(async () => {
    const { data } = await supabase
      .from('vendas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    setVendas((data || []) as unknown as Venda[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVendas();
    const ch = supabase
      .channel('vendas_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas' }, () => fetchVendas())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchVendas]);

  const confirmarVenda = async (input: ConfirmarVendaInput) => {
    const { data, error } = await supabase.rpc('confirmar_venda', {
      p_produto_id: input.produto_id,
      p_quantidade: input.quantidade,
      p_valor_unitario: input.valor_unitario,
      p_desconto: input.desconto ?? 0,
      p_cupom: input.cupom ?? null,
      p_forma_pagamento: input.forma_pagamento,
      p_parcelas: input.parcelas ?? 1,
      p_observacao: input.observacao ?? null,
      p_cliente_nome: input.cliente_nome ?? null,
      p_variacao: input.variacao ?? null,
    });
    return { data, error };
  };

  const cancelarVenda = async (id: string) => {
    const { data, error } = await supabase.rpc('cancelar_venda', { p_venda_id: id });
    return { data, error };
  };

  return { vendas, loading, confirmarVenda, cancelarVenda, refresh: fetchVendas };
}
