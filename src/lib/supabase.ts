import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Database features will not work.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

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
