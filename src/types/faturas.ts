// ============================================================
// TIPOS DE FATURAS
// ============================================================

/**
 * Fatura Grupo A - Conta com diversos períodos tarifários (FP, Ponta, Reservado)
 * Inclui demandas complexas e compensação de energia
 */
export interface FaturaGrupoA {
  id?: string;
  user_id?: string;
  uc_id?: string;

  // REFERÊNCIAS
  numero_uc: string;
  mes_referencia: string;
  data_leitura: string;

  // FINANCEIROS
  subtotal_faturamento: number;
  subtotal_outros: number;
  icms: number;
  pis_pasep: number;
  cofins: number;
  tipo_gd: string;
  cip: number;
  beneficio_bruto: number;
  beneficio_liquido: number;

  // BANDEIRAS
  bandeira_vermelha: number;
  bandeira_amarela: number;

  // DEMANDA
  demanda_g: number;
  tarifa_demanda_g: number;
  demanda_g_ultrapassagem: number;
  tarifa_demanda_g_ultrapassagem: number;
  demanda_sem_icms: number;
  tarifa_demanda_sem_icms: number;
  demanda_ultrapassagem: number;
  tarifa_demanda_ultrapassagem: number;
  demanda_reativa: number;
  tarifa_demanda_reativa: number;
  demanda_complementar: number;
  tarifa_demanda_complementar: number;

  // FORA PONTA (FP)
  tarifa_cons_te_fp: number;
  tarifa_cons_tusd_fp: number;
  tarifa_comp_tusd_fp: number;
  tarifa_comp_te_fp: number;
  tarifa_homo_te_fp: number;
  tarifa_homo_tusd_fp: number;
  tarifa_consumo_reativo_fp: number;
  consumo_fp: number;
  consumo_reativo_fp: number;
  credito_utilizado_fp: number;
  credito_utilizado_real_fp: number;
  saldo_atualizado_fp: number;
  energia_injetada_fp: number;
  demanda_fp: number;
  tarifa_demanda_fp: number;

  // PONTA
  tarifa_cons_te_ponta: number;
  tarifa_cons_tusd_ponta: number;
  tarifa_comp_tusd_ponta: number;
  tarifa_comp_te_ponta: number;
  tarifa_homo_te_ponta: number;
  tarifa_homo_tusd_ponta: number;
  tarifa_consumo_reativo_ponta: number;
  consumo_ponta: number;
  consumo_reativo_ponta: number;
  credito_utilizado_ponta: number;
  credito_utilizado_real_ponta: number;
  saldo_atualizado_ponta: number;
  energia_injetada_ponta: number;
  demanda_ponta: number;
  tarifa_demanda_ponta: number;

  // RESERVADO
  tarifa_cons_te_reservado: number;
  tarifa_cons_tusd_reservado: number;
  tarifa_comp_tusd_reservado: number;
  tarifa_comp_te_reservado: number;
  tarifa_homo_te_reservado: number;
  tarifa_homo_tusd_reservado: number;
  tarifa_consumo_reativo_reservado: number;
  consumo_reservado: number;
  consumo_reativo_reservado: number;
  credito_utilizado_reservado: number;
  credito_utilizado_real_reservado: number;
  saldo_atualizado_reservado: number;
  energia_injetada_reservado: number;

  created_at?: string;
  updated_at?: string;
}

/**
 * Fatura Grupo B - Conta mais simples, sem períodos tarifários específicos
 * Mais comum em residências
 */
export interface FaturaGrupoB {
  id?: string;
  user_id?: string;
  uc_id?: string;

  // REFERÊNCIAS
  numero_uc: string;
  mes_referencia: string;
  data_leitura: string;

  // TARIFAS
  tarifa_cons_tusd: number;
  tarifa_cons_te: number;
  tarifa_comp_tusd: number;
  tarifa_comp_te: number;
  tarifa_homologada_te: number;
  tarifa_homologada_tusd: number;

  // BANDEIRAS
  bandeira_vermelha: number;
  bandeira_amarela: number;

  // DADOS DE FATURAMENTO
  consumo: number;
  energia_injetada: number;
  credito_utilizado: number;
  credito_utilizado_real: number;
  saldo_atualizado: number;

  // DADOS FINANCEIROS
  subtotal_faturamento: number;
  subtotal_outros: number;
  tipo_gd: string;
  pag_dup: number;

  // TRIBUTOS
  pis_pasep: number;
  cofins: number;
  icms: number;
  cip: number;

  created_at?: string;
  updated_at?: string;
}

/**
 * Fatura Rural Irrigante - Mesma estrutura de Grupo A
 * Para propriedades rurais com sistema de irrigação
 */
export interface FaturaRuralIrrigante extends FaturaGrupoA {}

/**
 * Fatura Branca - Mesma estrutura de Grupo A
 * Classe de consumidor de energia sem quantidade mínima obrigatória
 */
export interface FaturaBranca extends FaturaGrupoA {}

/**
 * Tipo union para qualquer tipo de fatura
 */
export type Fatura =
  | FaturaGrupoA
  | FaturaGrupoB
  | FaturaRuralIrrigante
  | FaturaBranca;

/**
 * Resultado da extração de PDF
 */
export interface ExtractionResult {
  success: boolean;
  fatura: Fatura | null;
  error?: string;
  tipo?: "grupoA" | "grupoB" | "ruralIrrigante" | "branca";
  arquivoNome?: string;
  dataExtracao?: string;
  rawLines?: string[];
}

/**
 * Status de processamento de arquivo
 */
export interface ProcessingStatus {
  arquivo: string;
  status: "pendente" | "processando" | "sucesso" | "erro";
  progresso: number; // 0-100
  result?: ExtractionResult;
}
