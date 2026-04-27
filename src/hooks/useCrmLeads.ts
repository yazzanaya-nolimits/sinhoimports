import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type LeadStage =
  | 'novo_contato'
  | 'qualificacao'
  | 'contato_feito'
  | 'agendamento'
  | 'apresentacao'
  | 'envio_proposta'
  | 'negocio_fechado'
  | 'sem_interesse';

export type HistoricoEntry = {
  data: string;
  de?: string;
  para?: string;
  acao: string;
};

export type Lead = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  interesse: string | null;
  etapa: LeadStage;
  observacao: string | null;
  historico: HistoricoEntry[];
  created_at: string;
  updated_at: string;
};

export const STAGES: { key: LeadStage; label: string; color: string }[] = [
  { key: 'novo_contato', label: 'Novo Contato', color: 'bg-blue-500' },
  { key: 'qualificacao', label: 'Qualificação', color: 'bg-purple-500' },
  { key: 'contato_feito', label: 'Contato Feito', color: 'bg-yellow-500' },
  { key: 'agendamento', label: 'Agendamento', color: 'bg-orange-500' },
  { key: 'apresentacao', label: 'Apresentação', color: 'bg-amber-600' },
  { key: 'envio_proposta', label: 'Envio de Proposta', color: 'bg-sky-600' },
  { key: 'negocio_fechado', label: 'Negócio Fechado', color: 'bg-green-500' },
  { key: 'sem_interesse', label: 'Sem Interesse', color: 'bg-red-500' },
];

export function useCrmLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    const { data, error } = await supabase
      .from('crm_leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setLeads(data as unknown as Lead[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();
    const channel = supabase
      .channel('crm_leads_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_leads' }, () => fetchLeads())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeads]);

  const createLead = async (payload: Partial<Lead>) => {
    const historico: HistoricoEntry[] = [
      { data: new Date().toISOString(), acao: `Lead criado em "${payload.etapa || 'novo_contato'}"` },
    ];
    const { error } = await supabase.from('crm_leads').insert({
      nome: payload.nome!,
      telefone: payload.telefone || null,
      email: payload.email || null,
      interesse: payload.interesse || null,
      etapa: payload.etapa || 'novo_contato',
      observacao: payload.observacao || null,
      historico: historico as unknown as never,
    });
    return { error };
  };

  const updateLead = async (id: string, patch: Partial<Lead>) => {
    const { error } = await supabase.from('crm_leads').update(patch as never).eq('id', id);
    return { error };
  };

  const moveLead = async (lead: Lead, novaEtapa: LeadStage) => {
    if (lead.etapa === novaEtapa) return { error: null };
    const stageLabel = (k: LeadStage) => STAGES.find(s => s.key === k)?.label || k;
    const novoHist: HistoricoEntry[] = [
      ...(lead.historico || []),
      {
        data: new Date().toISOString(),
        de: stageLabel(lead.etapa),
        para: stageLabel(novaEtapa),
        acao: 'Movido entre colunas',
      },
    ];
    const { error } = await supabase
      .from('crm_leads')
      .update({ etapa: novaEtapa, historico: novoHist as unknown as never })
      .eq('id', lead.id);
    return { error };
  };

  const deleteLead = async (id: string) => {
    const { error } = await supabase.from('crm_leads').delete().eq('id', id);
    return { error };
  };

  return { leads, loading, createLead, updateLead, moveLead, deleteLead, refetch: fetchLeads };
}
