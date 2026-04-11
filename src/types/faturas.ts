// ============================================================
// TIPOS DE FATURAS
// ============================================================

/**
 * Fatura unificada — espelha a tabela public.faturas do Supabase
 */
export interface Fatura {
  id?: string;
  user_id?: string;
  uc_id?: string;

  // REFERÊNCIAS
  unidade: string;
  mes_referencia: string;
  data_leitura: string;
  data_emissao: string;
  data_vencimento: string;
  grupo_uc: string;
  subgrupo_uc: string;
  classe_uc: string;
  modalidade: string;
  tipo_GD: string;

  // FINANCEIROS
  subtotal_faturamento: number;
  subtotal_outros: number;

  // IMPOSTOS
  icms: number;
  pis_pasep: number;
  cofins: number;
  cip: number;

  // DEVOLUÇÕES
  isen_icms_tusd: number;
  creditos_proximas: number;
  credito_energia_ativa_TUSD: number;
  beneficio_bruto: number;
  beneficio_liquido: number;
  pag_dup: number;
  juros_323: number;
  atualizacao_323: number;
  ajuste_fin: number;

  // BANDEIRAS
  bandeira_vermelha: number;
  bandeira_amarela: number;

  // FORA PONTA (FP) — TARIFAS
  tarifa_cons_te_fp: number;
  tarifa_cons_tusd_fp: number;
  tarifa_comp_tusd_fp: number;
  tarifa_comp_te_fp: number;
  tarifa_homo_te_fp: number;
  tarifa_homo_tusd_fp: number;
  tarifa_consumo_reativo_fp: number;

  // FORA PONTA (FP) — INDICADORES
  consumo_fp: number;
  consumo_reativo_fp: number;
  energia_injetada_fp: number;
  credito_utilizado_fp: number;
  credito_utilizado_real_fp: number;
  saldo_atualizado_fp: number;
  demanda_reativa_fp: number;
  demanda_cons_fp: number;
  demanda_g_fp: number;

  // PONTA — TARIFAS
  tarifa_cons_te_ponta: number;
  tarifa_cons_tusd_ponta: number;
  tarifa_comp_tusd_ponta: number;
  tarifa_comp_te_ponta: number;
  tarifa_homo_te_ponta: number;
  tarifa_homo_tusd_ponta: number;
  tarifa_consumo_reativo_ponta: number;

  // PONTA — INDICADORES
  consumo_ponta: number;
  consumo_reativo_ponta: number;
  energia_injetada_ponta: number;
  credito_utilizado_ponta: number;
  credito_utilizado_real_ponta: number;
  saldo_atualizado_ponta: number;
  demanda_reativa_ponta: number;
  demanda_cons_ponta: number;
  demanda_g_ponta: number;

  // RESERVADO — TARIFAS
  tarifa_cons_te_reservado: number;
  tarifa_cons_tusd_reservado: number;
  tarifa_comp_tusd_reservado: number;
  tarifa_comp_te_reservado: number;
  tarifa_homo_te_reservado: number;
  tarifa_homo_tusd_reservado: number;
  tarifa_consumo_reativo_reservado: number;

  // RESERVADO — INDICADORES
  consumo_reservado: number;
  consumo_reativo_reservado: number;
  energia_injetada_reservado: number;
  credito_utilizado_reservado: number;
  credito_utilizado_real_reservado: number;
  saldo_atualizado_reservado: number;
  demanda_reativa_reservado: number;
  demanda_cons_reservado: number;
  demanda_g_reservado: number;

  // INTERMEDIÁRIO (Branca) — TARIFAS
  tarifa_cons_te_inter: number;
  tarifa_cons_tusd_inter: number;
  tarifa_comp_tusd_inter: number;
  tarifa_comp_te_inter: number;
  tarifa_homo_te_inter: number;
  tarifa_homo_tusd_inter: number;

  // INTERMEDIÁRIO (Branca) — INDICADORES
  consumo_inter: number;
  energia_injetada_inter: number;
  credito_utilizado_inter: number;
  credito_utilizado_real_inter: number;
  saldo_atualizado_inter: number;

  // DEMANDA FATURADA — FP
  demanda_g_faturada_fp: number;
  tarifa_demanda_g_fp: number;
  demanda_g_sem_ICMS_fp: number;
  tarifa_demanda_g_sem_ICMS_fp: number;
  demanda_g_ultrapassagem_fp: number;
  tarifa_demanda_g_ultrapassagem_fp: number;
  demanda_cons_faturada_fp: number;
  tarifa_demanda_cons_fp: number;
  demanda_cons_sem_ICMS_fp: number;
  tarifa_demanda_cons_sem_ICMS_fp: number;
  demanda_ultrapassagem_fp: number;
  tarifa_demanda_ultrapassagem_fp: number;
  demanda_reativa_faturada_fp: number;
  tarifa_demanda_reativa_fp: number;

  // DEMANDA FATURADA — PONTA
  demanda_g_faturada_ponta: number;
  tarifa_demanda_g_ponta: number;
  demanda_g_sem_ICMS_ponta: number;
  tarifa_demanda_g_sem_ICMS_ponta: number;
  demanda_g_ultrapassagem_ponta: number;
  tarifa_demanda_g_ultrapassagem_ponta: number;
  demanda_cons_faturada_ponta: number;
  tarifa_demanda_cons_ponta: number;
  demanda_cons_sem_ICMS_ponta: number;
  tarifa_demanda_cons_sem_ICMS_ponta: number;
  demanda_ultrapassagem_ponta: number;
  tarifa_demanda_ultrapassagem_ponta: number;
  demanda_reativa_faturada_ponta: number;
  tarifa_demanda_reativa_ponta: number;

  // DEMANDA COMPLEMENTAR
  demanda_complementar: number;
  tarifa_demanda_complementar: number;

  // DEMANDA CONTRATADA
  demanda_g_contratada_fp: number;
  demanda_cons_contratada_fp: number;
  demanda_g_contratada_ponta: number;
  demanda_cons_contratada_ponta: number;

  created_at?: string;
  updated_at?: string;
}

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
