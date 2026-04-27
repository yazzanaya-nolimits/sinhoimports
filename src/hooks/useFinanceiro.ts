import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Lancamento = {
  id: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  forma_pagamento: string | null;
  venda_id: string | null;
  status: string;
  created_at: string;
};

export function useFinanceiro() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('financeiro_lancamentos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);
    setLancamentos((data || []) as unknown as Lancamento[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
    const ch = supabase
      .channel('financeiro_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financeiro_lancamentos' }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetch]);

  const criarLancamento = async (l: Omit<Lancamento, 'id' | 'created_at' | 'status' | 'venda_id'> & { venda_id?: string | null }) => {
    const { error } = await supabase.from('financeiro_lancamentos').insert({
      tipo: l.tipo,
      categoria: l.categoria,
      descricao: l.descricao,
      valor: l.valor,
      forma_pagamento: l.forma_pagamento,
      venda_id: l.venda_id ?? null,
    });
    return { error };
  };

  const removerLancamento = async (id: string) => {
    const { error } = await supabase.from('financeiro_lancamentos').delete().eq('id', id);
    return { error };
  };

  return { lancamentos, loading, criarLancamento, removerLancamento, refresh: fetch };
}
