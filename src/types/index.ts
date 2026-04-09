export interface User {
  id: string;
  nome: string;
  email: string;
  empresa: string;
  plano: "basico" | "profissional" | "empresarial";
  status_assinatura: "ativa" | "pendente" | "cancelada";
  limite_clientes: number;
  limite_ucs: number;
  created_at: string;
}

export interface Cliente {
  id: string;
  user_id: string;
  nome: string;
  cpf_cnpj: number;
  email: string;
  telefone: string;
  observacoes: string;
  created_at: string;
  total_ucs?: number;
}

export interface UnidadeConsumidora {
  id: string;
  cliente_id: string;
  numero_uc: string;
  cpf_cnpj: number;
  distribuidora: string;
  estado: string;
  cidade: string;
  tipo_uc: "Geradora" | "Beneficiária";
  classe: "Residencial" | "Comercial" | "Industrial";
  subclasse: string;
  grupo_tarifario: string;
  subgrupo: string;
  modalidade: string;
  mercado: "ACR" | "ACL";
  desconto: number;
  data_leitura: string;
  data_vencimento: string;
  energia_contratada: number;
  rateio_percentual: number;
  numero_geradoras: number;
  created_at: string;
  cliente?: Cliente;
  tipo_conta: "pessoal" | "empresarial";
  login_enel: string;
  senha_enel: string;
}

export interface Fatura {
  id: string;
  uc_id: string;
  cliente_id: string;
  mes_referencia: string;
  data_vencimento: string;
  data_leitura: string;
  valor_total: number;
  energia_kwh: number;
  energia_compensada_kwh: number;
  valor_compensado: number;
  status: "Extraída" | "Pendente" | "Erro" | "Paga";
  arquivo_url?: string;
  created_at: string;
  uc?: UnidadeConsumidora;
  cliente?: Cliente;
}

export interface DashboardStats {
  totalClientes: number;
  totalUCs: number;
  faturasPrevistasHoje: number;
  faturasExtraidasHoje: number;
  valorTotalFaturado: number;
  economiaGerada: number;
  crescimentoFinanceiro: number;
}

export interface Plano {
  id: string;
  nome: string;
  preco: number;
  limite_clientes: number;
  limite_ucs: number;
  recursos: string[];
}
