// Re-exporta o client oficial do Lovable Cloud para manter os imports antigos.
export { supabase } from '@/integrations/supabase/client';

export type ProductVariation = {
  tamanho: string;
  valor?: number | null;
};

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
  ingredientes: string | null;
  modo_uso: string | null;
  informacoes_gerais: string | null;
  variacoes: ProductVariation[];
  aceita_pix: boolean;
  aceita_cartao: boolean;
  max_parcelas: number;
  categoria: string;
  destaque: boolean;
  created_at: string;
  updated_at: string;
};

export const PRODUTO_CATEGORIAS = [
  { id: 'masculino', label: 'Masculino' },
  { id: 'feminino', label: 'Feminino' },
  { id: 'perfumes', label: 'Perfumes' },
  { id: 'automotivo', label: 'Automotivo' },
  { id: 'unisex', label: 'Unisex' },
  { id: 'outros', label: 'Outros' },
] as const;
