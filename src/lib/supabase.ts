// Re-exporta o client oficial do Lovable Cloud para manter os imports antigos.
export { supabase } from '@/integrations/supabase/client';

export type DatabaseProduct = {
  id: string;
  nome: string;
  descricao: string | null;
  valor: number;
  foto_url: string | null;
  imagem_destaque_url: string | null;
  cupom_codigo: string | null;
  cupom_tipo: 'percentual' | 'fixo' | null;
  cupom_valor: number | null;
  cupom_validade: string | null;
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
};
