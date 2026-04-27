import type { Modulo } from '@/contexts/AuthContext';

export type LevelOption = { value: string; label: string };

export const MODULOS: { key: Modulo; label: string; levels: LevelOption[] }[] = [
  { key: 'dashboard', label: 'Dashboard Geral', levels: [
    { value: 'ver', label: 'Ver' },
    { value: 'sem_acesso', label: 'Sem acesso' },
  ]},
  { key: 'pdv', label: 'PDV — Vendas', levels: [
    { value: 'total', label: 'Acesso total' },
    { value: 'registrar', label: 'Somente registrar' },
    { value: 'sem_acesso', label: 'Sem acesso' },
  ]},
  { key: 'estoque', label: 'Estoque', levels: [
    { value: 'editar', label: 'Ver e editar' },
    { value: 'ver', label: 'Somente ver' },
    { value: 'sem_acesso', label: 'Sem acesso' },
  ]},
  { key: 'financeiro', label: 'Financeiro', levels: [
    { value: 'total', label: 'Acesso total' },
    { value: 'ver', label: 'Somente ver' },
    { value: 'sem_acesso', label: 'Sem acesso' },
  ]},
  { key: 'crm', label: 'CRM Comercial', levels: [
    { value: 'total', label: 'Acesso total' },
    { value: 'ver', label: 'Somente ver' },
    { value: 'sem_acesso', label: 'Sem acesso' },
  ]},
  { key: 'catalogo', label: 'Catálogo do Site', levels: [
    { value: 'editar', label: 'Editar' },
    { value: 'ver', label: 'Somente ver' },
    { value: 'sem_acesso', label: 'Sem acesso' },
  ]},
  { key: 'configuracoes', label: 'Configurações', levels: [
    { value: 'total', label: 'Acesso total' },
    { value: 'sem_acesso', label: 'Sem acesso' },
  ]},
];

export const defaultPermissoes = (): Record<Modulo, string> => ({
  dashboard: 'ver',
  pdv: 'sem_acesso',
  estoque: 'sem_acesso',
  financeiro: 'sem_acesso',
  crm: 'sem_acesso',
  catalogo: 'sem_acesso',
  configuracoes: 'sem_acesso',
});
