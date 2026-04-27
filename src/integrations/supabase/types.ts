export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      banner_desconto: {
        Row: {
          ativo: boolean
          id: string
          mensagem: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          id?: string
          mensagem?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          id?: string
          mensagem?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_leads: {
        Row: {
          created_at: string
          email: string | null
          etapa: string
          historico: Json
          id: string
          interesse: string | null
          nome: string
          observacao: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          etapa?: string
          historico?: Json
          id?: string
          interesse?: string | null
          nome: string
          observacao?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          etapa?: string
          historico?: Json
          id?: string
          interesse?: string | null
          nome?: string
          observacao?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      estoque: {
        Row: {
          created_at: string
          id: string
          lucro_valor: number
          margem_percentual: number
          nome: string
          quantidade: number
          quantidade_minima: number
          status: string
          tipo: string | null
          updated_at: string
          valor_compra: number
          valor_venda: number
        }
        Insert: {
          created_at?: string
          id?: string
          lucro_valor?: number
          margem_percentual?: number
          nome: string
          quantidade?: number
          quantidade_minima?: number
          status?: string
          tipo?: string | null
          updated_at?: string
          valor_compra?: number
          valor_venda?: number
        }
        Update: {
          created_at?: string
          id?: string
          lucro_valor?: number
          margem_percentual?: number
          nome?: string
          quantidade?: number
          quantidade_minima?: number
          status?: string
          tipo?: string | null
          updated_at?: string
          valor_compra?: number
          valor_venda?: number
        }
        Relationships: []
      }
      estoque_movimentacoes: {
        Row: {
          created_at: string
          id: string
          motivo: string | null
          produto_id: string | null
          produto_nome: string
          quantidade: number
          tipo: string
          valor_unitario: number
          venda_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          motivo?: string | null
          produto_id?: string | null
          produto_nome: string
          quantidade: number
          tipo: string
          valor_unitario?: number
          venda_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          motivo?: string | null
          produto_id?: string | null
          produto_nome?: string
          quantidade?: number
          tipo?: string
          valor_unitario?: number
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estoque_movimentacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_movimentacoes_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_lancamentos: {
        Row: {
          categoria: string
          created_at: string
          descricao: string
          forma_pagamento: string | null
          id: string
          status: string
          tipo: string
          valor: number
          venda_id: string | null
        }
        Insert: {
          categoria?: string
          created_at?: string
          descricao: string
          forma_pagamento?: string | null
          id?: string
          status?: string
          tipo: string
          valor?: number
          venda_id?: string | null
        }
        Update: {
          categoria?: string
          created_at?: string
          descricao?: string
          forma_pagamento?: string | null
          id?: string
          status?: string
          tipo?: string
          valor?: number
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_lancamentos_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      imagens_site: {
        Row: {
          created_at: string
          id: string
          ordem: number
          tipo: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          ordem?: number
          tipo: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          ordem?: number
          tipo?: string
          url?: string
        }
        Relationships: []
      }
      membros: {
        Row: {
          created_at: string
          email: string
          id: string
          idioma: string
          nome: string
          permissoes: Json
          status: string
          tema: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          idioma?: string
          nome: string
          permissoes?: Json
          status?: string
          tema?: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          idioma?: string
          nome?: string
          permissoes?: Json
          status?: string
          tema?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      produtos: {
        Row: {
          aceita_cartao: boolean
          aceita_pix: boolean
          created_at: string
          cupom_codigo: string | null
          cupom_tipo: string | null
          cupom_validade: string | null
          cupom_valor: number | null
          descricao: string | null
          estoque_status: string
          foto_url: string | null
          id: string
          imagem_destaque_url: string | null
          informacoes_gerais: string | null
          ingredientes: string | null
          lucro_valor: number
          margem_percentual: number
          max_parcelas: number
          modo_uso: string | null
          nome: string
          quantidade: number
          quantidade_minima: number
          status: string
          tipo: string | null
          updated_at: string
          valor: number
          valor_compra: number
          variacoes: Json
        }
        Insert: {
          aceita_cartao?: boolean
          aceita_pix?: boolean
          created_at?: string
          cupom_codigo?: string | null
          cupom_tipo?: string | null
          cupom_validade?: string | null
          cupom_valor?: number | null
          descricao?: string | null
          estoque_status?: string
          foto_url?: string | null
          id?: string
          imagem_destaque_url?: string | null
          informacoes_gerais?: string | null
          ingredientes?: string | null
          lucro_valor?: number
          margem_percentual?: number
          max_parcelas?: number
          modo_uso?: string | null
          nome: string
          quantidade?: number
          quantidade_minima?: number
          status?: string
          tipo?: string | null
          updated_at?: string
          valor?: number
          valor_compra?: number
          variacoes?: Json
        }
        Update: {
          aceita_cartao?: boolean
          aceita_pix?: boolean
          created_at?: string
          cupom_codigo?: string | null
          cupom_tipo?: string | null
          cupom_validade?: string | null
          cupom_valor?: number | null
          descricao?: string | null
          estoque_status?: string
          foto_url?: string | null
          id?: string
          imagem_destaque_url?: string | null
          informacoes_gerais?: string | null
          ingredientes?: string | null
          lucro_valor?: number
          margem_percentual?: number
          max_parcelas?: number
          modo_uso?: string | null
          nome?: string
          quantidade?: number
          quantidade_minima?: number
          status?: string
          tipo?: string | null
          updated_at?: string
          valor?: number
          valor_compra?: number
          variacoes?: Json
        }
        Relationships: []
      }
      vendas: {
        Row: {
          cliente_nome: string | null
          created_at: string
          cupom_codigo: string | null
          desconto_aplicado: number
          forma_pagamento: string
          id: string
          observacao: string | null
          parcelas: number
          produto_id: string | null
          produto_nome: string
          quantidade: number
          status: string
          updated_at: string
          valor_total: number
          valor_unitario: number
          variacao: string | null
        }
        Insert: {
          cliente_nome?: string | null
          created_at?: string
          cupom_codigo?: string | null
          desconto_aplicado?: number
          forma_pagamento?: string
          id?: string
          observacao?: string | null
          parcelas?: number
          produto_id?: string | null
          produto_nome: string
          quantidade: number
          status?: string
          updated_at?: string
          valor_total?: number
          valor_unitario?: number
          variacao?: string | null
        }
        Update: {
          cliente_nome?: string | null
          created_at?: string
          cupom_codigo?: string | null
          desconto_aplicado?: number
          forma_pagamento?: string
          id?: string
          observacao?: string | null
          parcelas?: number
          produto_id?: string | null
          produto_nome?: string
          quantidade?: number
          status?: string
          updated_at?: string
          valor_total?: number
          valor_unitario?: number
          variacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancelar_venda: { Args: { p_venda_id: string }; Returns: boolean }
      confirmar_venda: {
        Args: {
          p_cliente_nome?: string
          p_cupom?: string
          p_desconto?: number
          p_forma_pagamento?: string
          p_observacao?: string
          p_parcelas?: number
          p_produto_id: string
          p_quantidade: number
          p_valor_unitario: number
          p_variacao?: string
        }
        Returns: string
      }
      get_module_permission: {
        Args: { _module: string; _user_id: string }
        Returns: string
      }
      has_module_level: {
        Args: { _level: string; _module: string; _user_id: string }
        Returns: boolean
      }
      has_module_permission: {
        Args: { _module: string; _user_id: string }
        Returns: boolean
      }
      membros_count: { Args: never; Returns: number }
      registrar_entrada_estoque: {
        Args: {
          p_gerar_despesa?: boolean
          p_motivo?: string
          p_produto_id: string
          p_quantidade: number
          p_valor_unitario?: number
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
