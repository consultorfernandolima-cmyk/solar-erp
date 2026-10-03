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
      auditoria_eventos: {
        Row: {
          acao: string
          created_at: string
          dados_anteriores: Json | null
          dados_novos: Json | null
          entidade: string | null
          entidade_id: string | null
          id: number
          modulo: string | null
          organizacao_id: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          entidade?: string | null
          entidade_id?: string | null
          id?: never
          modulo?: string | null
          organizacao_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          entidade?: string | null
          entidade_id?: string | null
          id?: never
          modulo?: string | null
          organizacao_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auditoria_eventos_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      avisos_aprovacao: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          created_at: string
          criado_por: string | null
          dados: Json
          descricao: string | null
          destinatario_id: string
          entidade_id: string | null
          entidade_tipo: string | null
          id: string
          organizacao_id: string
          status: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          created_at?: string
          criado_por?: string | null
          dados?: Json
          descricao?: string | null
          destinatario_id: string
          entidade_id?: string | null
          entidade_tipo?: string | null
          id?: string
          organizacao_id: string
          status?: string
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          created_at?: string
          criado_por?: string | null
          dados?: Json
          descricao?: string | null
          destinatario_id?: string
          entidade_id?: string | null
          entidade_tipo?: string | null
          id?: string
          organizacao_id?: string
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avisos_aprovacao_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avisos_aprovacao_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avisos_aprovacao_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avisos_aprovacao_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_sistema: {
        Row: {
          chave: string
          created_at: string
          id: string
          organizacao_id: string
          updated_at: string
          valor: Json
        }
        Insert: {
          chave: string
          created_at?: string
          id?: string
          organizacao_id: string
          updated_at?: string
          valor?: Json
        }
        Update: {
          chave?: string
          created_at?: string
          id?: string
          organizacao_id?: string
          updated_at?: string
          valor?: Json
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_sistema_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos: {
        Row: {
          cliente_id: string
          created_at: string
          data_assinatura: string | null
          data_emissao: string
          descricao: string | null
          dia_vencimento: number | null
          empresa_id: string
          fim_vigencia: string | null
          id: string
          inicio_vigencia: string | null
          numero: number
          observacoes: string | null
          ordem_servico_id: string | null
          organizacao_id: string
          periodicidade_cobranca: string | null
          proposta_id: string | null
          renovacao_automatica: boolean
          status: string
          titulo: string
          updated_at: string
          usina_id: string | null
          valor: number
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_assinatura?: string | null
          data_emissao?: string
          descricao?: string | null
          dia_vencimento?: number | null
          empresa_id: string
          fim_vigencia?: string | null
          id?: string
          inicio_vigencia?: string | null
          numero?: number
          observacoes?: string | null
          ordem_servico_id?: string | null
          organizacao_id: string
          periodicidade_cobranca?: string | null
          proposta_id?: string | null
          renovacao_automatica?: boolean
          status?: string
          titulo: string
          updated_at?: string
          usina_id?: string | null
          valor?: number
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_assinatura?: string | null
          data_emissao?: string
          descricao?: string | null
          dia_vencimento?: number | null
          empresa_id?: string
          fim_vigencia?: string | null
          id?: string
          inicio_vigencia?: string | null
          numero?: number
          observacoes?: string | null
          ordem_servico_id?: string | null
          organizacao_id?: string
          periodicidade_cobranca?: string | null
          proposta_id?: string | null
          renovacao_automatica?: boolean
          status?: string
          titulo?: string
          updated_at?: string
          usina_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "parceiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_usina_id_fkey"
            columns: ["usina_id"]
            isOneToOne: false
            referencedRelation: "usinas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          ativo: boolean
          cnpj: string | null
          codigo: string | null
          created_at: string
          empresa_matriz_id: string | null
          id: string
          nome_fantasia: string | null
          organizacao_id: string
          razao_social: string
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cnpj?: string | null
          codigo?: string | null
          created_at?: string
          empresa_matriz_id?: string | null
          id?: string
          nome_fantasia?: string | null
          organizacao_id: string
          razao_social: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cnpj?: string | null
          codigo?: string | null
          created_at?: string
          empresa_matriz_id?: string | null
          id?: string
          nome_fantasia?: string | null
          organizacao_id?: string
          razao_social?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresas_empresa_matriz_id_fkey"
            columns: ["empresa_matriz_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empresas_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      familias_produto: {
        Row: {
          ativo: boolean
          codigo: string | null
          grupo_id: string | null
          id: string
          nome: string
          organizacao_id: string
        }
        Insert: {
          ativo?: boolean
          codigo?: string | null
          grupo_id?: string | null
          id?: string
          nome: string
          organizacao_id: string
        }
        Update: {
          ativo?: boolean
          codigo?: string | null
          grupo_id?: string | null
          id?: string
          nome?: string
          organizacao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "familias_produto_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos_produto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "familias_produto_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      faturamento_parcelas: {
        Row: {
          created_at: string
          data_recebimento: string | null
          faturamento_id: string
          forma_recebimento: string | null
          id: string
          numero_parcela: number
          observacoes: string | null
          status: string
          updated_at: string
          valor: number
          valor_recebido: number
          vencimento: string
        }
        Insert: {
          created_at?: string
          data_recebimento?: string | null
          faturamento_id: string
          forma_recebimento?: string | null
          id?: string
          numero_parcela: number
          observacoes?: string | null
          status?: string
          updated_at?: string
          valor: number
          valor_recebido?: number
          vencimento: string
        }
        Update: {
          created_at?: string
          data_recebimento?: string | null
          faturamento_id?: string
          forma_recebimento?: string | null
          id?: string
          numero_parcela?: number
          observacoes?: string | null
          status?: string
          updated_at?: string
          valor?: number
          valor_recebido?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "faturamento_parcelas_faturamento_id_fkey"
            columns: ["faturamento_id"]
            isOneToOne: false
            referencedRelation: "faturamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      faturamentos: {
        Row: {
          acrescimos: number
          cliente_id: string
          competencia: string
          contrato_id: string | null
          created_at: string
          desconto: number
          descricao: string
          emissao: string
          empresa_id: string
          id: string
          numero: number
          observacoes: string | null
          ordem_servico_id: string | null
          organizacao_id: string
          proposta_id: string | null
          status: string
          updated_at: string
          valor_bruto: number
          valor_total: number | null
        }
        Insert: {
          acrescimos?: number
          cliente_id: string
          competencia?: string
          contrato_id?: string | null
          created_at?: string
          desconto?: number
          descricao: string
          emissao?: string
          empresa_id: string
          id?: string
          numero?: number
          observacoes?: string | null
          ordem_servico_id?: string | null
          organizacao_id: string
          proposta_id?: string | null
          status?: string
          updated_at?: string
          valor_bruto?: number
          valor_total?: number | null
        }
        Update: {
          acrescimos?: number
          cliente_id?: string
          competencia?: string
          contrato_id?: string | null
          created_at?: string
          desconto?: number
          descricao?: string
          emissao?: string
          empresa_id?: string
          id?: string
          numero?: number
          observacoes?: string | null
          ordem_servico_id?: string | null
          organizacao_id?: string
          proposta_id?: string | null
          status?: string
          updated_at?: string
          valor_bruto?: number
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faturamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "parceiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturamentos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturamentos_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturamentos_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturamentos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      grupo_permissoes: {
        Row: {
          grupo_id: string
          permissao_id: string
        }
        Insert: {
          grupo_id: string
          permissao_id: string
        }
        Update: {
          grupo_id?: string
          permissao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grupo_permissoes_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos_permissao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grupo_permissoes_permissao_id_fkey"
            columns: ["permissao_id"]
            isOneToOne: false
            referencedRelation: "permissoes"
            referencedColumns: ["id"]
          },
        ]
      }
      grupos_permissao: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          organizacao_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          organizacao_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          organizacao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grupos_permissao_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      grupos_produto: {
        Row: {
          ativo: boolean
          codigo: string | null
          id: string
          nome: string
          organizacao_id: string
        }
        Insert: {
          ativo?: boolean
          codigo?: string | null
          id?: string
          nome: string
          organizacao_id: string
        }
        Update: {
          ativo?: boolean
          codigo?: string | null
          id?: string
          nome?: string
          organizacao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grupos_produto_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      modulos_sistema: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          descricao: string | null
          icone: string | null
          id: string
          modulo_pai_id: string | null
          nome: string
          ordem: number
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          modulo_pai_id?: string | null
          nome: string
          ordem?: number
          status?: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          modulo_pai_id?: string | null
          nome?: string
          ordem?: number
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modulos_sistema_modulo_pai_id_fkey"
            columns: ["modulo_pai_id"]
            isOneToOne: false
            referencedRelation: "modulos_sistema"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_servico: {
        Row: {
          cliente_aprovou: boolean
          cliente_id: string
          created_at: string
          data_abertura: string
          data_agendada: string | null
          data_aprovacao_cliente: string | null
          data_conclusao: string | null
          descricao: string
          empresa_id: string
          id: string
          numero: number
          observacao_aprovacao_cliente: string | null
          observacoes: string | null
          organizacao_id: string
          prioridade: string
          status: string
          tecnico_id: string | null
          tipo: string
          updated_at: string
          usina_id: string | null
        }
        Insert: {
          cliente_aprovou?: boolean
          cliente_id: string
          created_at?: string
          data_abertura?: string
          data_agendada?: string | null
          data_aprovacao_cliente?: string | null
          data_conclusao?: string | null
          descricao: string
          empresa_id: string
          id?: string
          numero?: number
          observacao_aprovacao_cliente?: string | null
          observacoes?: string | null
          organizacao_id: string
          prioridade?: string
          status?: string
          tecnico_id?: string | null
          tipo: string
          updated_at?: string
          usina_id?: string | null
        }
        Update: {
          cliente_aprovou?: boolean
          cliente_id?: string
          created_at?: string
          data_abertura?: string
          data_agendada?: string | null
          data_aprovacao_cliente?: string | null
          data_conclusao?: string | null
          descricao?: string
          empresa_id?: string
          id?: string
          numero?: number
          observacao_aprovacao_cliente?: string | null
          observacoes?: string | null
          organizacao_id?: string
          prioridade?: string
          status?: string
          tecnico_id?: string | null
          tipo?: string
          updated_at?: string
          usina_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "parceiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_usina_id_fkey"
            columns: ["usina_id"]
            isOneToOne: false
            referencedRelation: "usinas"
            referencedColumns: ["id"]
          },
        ]
      }
      organizacao_modulos: {
        Row: {
          created_at: string
          fim_em: string | null
          id: string
          inicio_em: string
          modulo_id: string
          observacao: string | null
          organizacao_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fim_em?: string | null
          id?: string
          inicio_em?: string
          modulo_id: string
          observacao?: string | null
          organizacao_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fim_em?: string | null
          id?: string
          inicio_em?: string
          modulo_id?: string
          observacao?: string | null
          organizacao_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizacao_modulos_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos_sistema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizacao_modulos_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      organizacoes: {
        Row: {
          ativo: boolean
          created_at: string
          documento: string | null
          id: string
          nome: string
          nome_fantasia: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          documento?: string | null
          id?: string
          nome: string
          nome_fantasia?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          documento?: string | null
          id?: string
          nome?: string
          nome_fantasia?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      parceiro_papeis: {
        Row: {
          papel: string
          parceiro_id: string
        }
        Insert: {
          papel: string
          parceiro_id: string
        }
        Update: {
          papel?: string
          parceiro_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parceiro_papeis_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "parceiros"
            referencedColumns: ["id"]
          },
        ]
      }
      parceiros: {
        Row: {
          ativo: boolean
          codigo: number
          created_at: string
          documento: string | null
          email: string | null
          id: string
          inscricao_estadual: string | null
          nome_fantasia: string | null
          nome_razao_social: string
          observacoes: string | null
          organizacao_id: string
          telefone: string | null
          tipo_pessoa: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean
          codigo?: number
          created_at?: string
          documento?: string | null
          email?: string | null
          id?: string
          inscricao_estadual?: string | null
          nome_fantasia?: string | null
          nome_razao_social: string
          observacoes?: string | null
          organizacao_id: string
          telefone?: string | null
          tipo_pessoa: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean
          codigo?: number
          created_at?: string
          documento?: string | null
          email?: string | null
          id?: string
          inscricao_estadual?: string | null
          nome_fantasia?: string | null
          nome_razao_social?: string
          observacoes?: string | null
          organizacao_id?: string
          telefone?: string | null
          tipo_pessoa?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parceiros_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis: {
        Row: {
          ativo: boolean
          created_at: string
          email: string | null
          id: string
          is_admin: boolean
          nome: string
          organizacao_id: string
          updated_at: string
          username: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          id: string
          is_admin?: boolean
          nome: string
          organizacao_id: string
          updated_at?: string
          username: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          id?: string
          is_admin?: boolean
          nome?: string
          organizacao_id?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfis_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      permissoes: {
        Row: {
          acao: string
          chave: string
          descricao: string | null
          id: string
          modulo: string
          modulo_codigo: string | null
          recurso: string
        }
        Insert: {
          acao: string
          chave: string
          descricao?: string | null
          id?: string
          modulo: string
          modulo_codigo?: string | null
          recurso: string
        }
        Update: {
          acao?: string
          chave?: string
          descricao?: string | null
          id?: string
          modulo?: string
          modulo_codigo?: string | null
          recurso?: string
        }
        Relationships: []
      }
      produto_empresas: {
        Row: {
          ativo: boolean
          empresa_id: string
          produto_id: string
        }
        Insert: {
          ativo?: boolean
          empresa_id: string
          produto_id: string
        }
        Update: {
          ativo?: boolean
          empresa_id?: string
          produto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "produto_empresas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produto_empresas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos_servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos_servicos: {
        Row: {
          ativo: boolean
          codigo: string | null
          codigo_externo: string | null
          controla_estoque: boolean
          controla_serial: boolean
          created_at: string
          descricao: string | null
          familia_id: string | null
          grupo_id: string | null
          id: string
          nome: string
          organizacao_id: string
          tipo: string
          tipo_consumo: string | null
          unidade_medida_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo?: string | null
          codigo_externo?: string | null
          controla_estoque?: boolean
          controla_serial?: boolean
          created_at?: string
          descricao?: string | null
          familia_id?: string | null
          grupo_id?: string | null
          id?: string
          nome: string
          organizacao_id: string
          tipo: string
          tipo_consumo?: string | null
          unidade_medida_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string | null
          codigo_externo?: string | null
          controla_estoque?: boolean
          controla_serial?: boolean
          created_at?: string
          descricao?: string | null
          familia_id?: string | null
          grupo_id?: string | null
          id?: string
          nome?: string
          organizacao_id?: string
          tipo?: string
          tipo_consumo?: string | null
          unidade_medida_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_servicos_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias_produto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_servicos_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos_produto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_servicos_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_servicos_unidade_medida_id_fkey"
            columns: ["unidade_medida_id"]
            isOneToOne: false
            referencedRelation: "unidades_medida"
            referencedColumns: ["id"]
          },
        ]
      }
      proposta_itens: {
        Row: {
          created_at: string
          desconto: number
          id: string
          observacoes: string | null
          produto_id: string
          proposta_id: string
          quantidade: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string
          desconto?: number
          id?: string
          observacoes?: string | null
          produto_id: string
          proposta_id: string
          quantidade: number
          valor_unitario: number
        }
        Update: {
          created_at?: string
          desconto?: number
          id?: string
          observacoes?: string | null
          produto_id?: string
          proposta_id?: string
          quantidade?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposta_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos_servicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposta_itens_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas: {
        Row: {
          cliente_id: string
          created_at: string
          data_emissao: string
          empresa_id: string
          id: string
          numero: number
          observacoes: string | null
          organizacao_id: string
          status: string
          updated_at: string
          validade: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_emissao?: string
          empresa_id: string
          id?: string
          numero?: number
          observacoes?: string | null
          organizacao_id: string
          status?: string
          updated_at?: string
          validade?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_emissao?: string
          empresa_id?: string
          id?: string
          numero?: number
          observacoes?: string | null
          organizacao_id?: string
          status?: string
          updated_at?: string
          validade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "parceiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      relatorios_energia: {
        Row: {
          cliente: string
          consumo_cemig: number
          criado_em: string
          energia_injetada: number
          geracao_usina: number
          id: number
          mes_referencia: string
          valor_pago: number
        }
        Insert: {
          cliente: string
          consumo_cemig: number
          criado_em?: string
          energia_injetada: number
          geracao_usina: number
          id?: never
          mes_referencia: string
          valor_pago: number
        }
        Update: {
          cliente?: string
          consumo_cemig?: number
          criado_em?: string
          energia_injetada?: number
          geracao_usina?: number
          id?: never
          mes_referencia?: string
          valor_pago?: number
        }
        Relationships: []
      }
      unidades_medida: {
        Row: {
          ativo: boolean
          codigo: string
          fator_conversao: number | null
          id: string
          nome: string
          organizacao_id: string | null
        }
        Insert: {
          ativo?: boolean
          codigo: string
          fator_conversao?: number | null
          id?: string
          nome: string
          organizacao_id?: string | null
        }
        Update: {
          ativo?: boolean
          codigo?: string
          fator_conversao?: number | null
          id?: string
          nome?: string
          organizacao_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unidades_medida_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      usinas: {
        Row: {
          cliente_id: string | null
          codigo: number
          created_at: string
          data_instalacao: string | null
          empresa_id: string
          endereco: string | null
          id: string
          marca_inversor: string | null
          marca_paineis: string | null
          nome: string
          numero_serie_inversor: string | null
          observacoes: string | null
          organizacao_id: string
          periodicidade_limpeza_meses: number | null
          potencia_kwp: number | null
          quantidade_paineis: number | null
          status: string
          updated_at: string
        }
        Insert: {
          cliente_id?: string | null
          codigo?: number
          created_at?: string
          data_instalacao?: string | null
          empresa_id: string
          endereco?: string | null
          id?: string
          marca_inversor?: string | null
          marca_paineis?: string | null
          nome: string
          numero_serie_inversor?: string | null
          observacoes?: string | null
          organizacao_id: string
          periodicidade_limpeza_meses?: number | null
          potencia_kwp?: number | null
          quantidade_paineis?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          codigo?: number
          created_at?: string
          data_instalacao?: string | null
          empresa_id?: string
          endereco?: string | null
          id?: string
          marca_inversor?: string | null
          marca_paineis?: string | null
          nome?: string
          numero_serie_inversor?: string | null
          observacoes?: string | null
          organizacao_id?: string
          periodicidade_limpeza_meses?: number | null
          potencia_kwp?: number | null
          quantidade_paineis?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usinas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "parceiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usinas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usinas_organizacao_id_fkey"
            columns: ["organizacao_id"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      usuario_empresas: {
        Row: {
          created_at: string
          empresa_id: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          empresa_id: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          empresa_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_empresas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_empresas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      usuario_grupos: {
        Row: {
          grupo_id: string
          usuario_id: string
        }
        Insert: {
          grupo_id: string
          usuario_id: string
        }
        Update: {
          grupo_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_grupos_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos_permissao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_grupos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
