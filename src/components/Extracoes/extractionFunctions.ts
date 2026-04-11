import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { supabase } from "../../lib/supabase";

// Usa o worker local bundled pelo Vite (evita dependência de CDN externo)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// ============================================================
// TIPOS
// ============================================================
export interface Fatura {
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
}

// ============================================================
// FUNÇÕES DE UTILIDADE - UC e SUPABASE
// ============================================================

/**
 * Extrai o número UC do nome do arquivo
 * Procura por 6-10 dígitos consecutivos após a palavra "UC"
 * Ex: "Fatura_UC1234567_2024.pdf" -> "1234567"
 */
function extrairUCDoNomeArquivo(nomeArquivo: string): string {
  const semExtensao = nomeArquivo.replace(/\.[^/.]+$/, "");
  const match = semExtensao.match(/UC\s*(\d{6,10})/i);
  if (match && match[1]) {
    const uc = match[1].trim();
    console.log(`✨ UC extraída do arquivo "${nomeArquivo}": "${uc}"`);
    return uc;
  }
  console.log(`⚠️ Nenhuma UC encontrada no arquivo "${nomeArquivo}"`);
  return "";
}

/**
 * Busca no Supabase o CPF/CNPJ correspondente ao número UC
 * Retorna os 5 primeiros dígitos (sem formatação) para usar como senha do PDF
 */
async function obterSenhaDouc(numeroUc: string): Promise<string | null> {
  try {
    if (!numeroUc) {
      console.log(`⚠️ Numero UC vazio, não buscar no Supabase`);
      return null;
    }

    const ucOriginal = String(numeroUc).trim();
    console.log(`🔍 Buscando UC "${ucOriginal}" no Supabase...`);

    const variacoes: string[] = [
      ucOriginal,
      ucOriginal.padStart(10, "0"),
      ucOriginal.padStart(9, "0"),
      ucOriginal.padStart(8, "0"),
    ];

    const variacoesUnicas = [...new Set(variacoes)];

    for (const ucString of variacoesUnicas) {
      try {
        console.log(`  🔎 Tentando variação: "${ucString}"`);

        let { data, error } = await supabase
          .from("unidades_consumidoras")
          .select("cpf_cnpj")
          .eq("numero_uc", ucString)
          .limit(1)
          .single();

        if (
          error &&
          (error.code === "PGRST116" || error.message?.includes("No rows"))
        ) {
          console.log(`    ℹ️ eq() não encontrou, tentando like()...`);
          const { data: dataLike, error: errorLike } = await supabase
            .from("unidades_consumidoras")
            .select("cpf_cnpj")
            .like("numero_uc", `%${ucString}%`)
            .limit(1)
            .single();

          if (!errorLike && dataLike) {
            data = dataLike;
            error = null;
          } else {
            error = errorLike;
          }
        }

        if (error) {
          console.log(
            `  ❌ Variação "${ucString}" falhou (${error?.code}): ${error?.message}`,
          );
          continue;
        }

        if (!data) {
          console.log(`  ⚠️ Variação "${ucString}" sem dados`);
          continue;
        }

        const cpfCnpj = data.cpf_cnpj as string;
        if (!cpfCnpj) {
          console.log(`  ⚠️ UC "${ucString}" encontrada mas sem CPF/CNPJ`);
          continue;
        }

        const cpfCnpjNumeros = cpfCnpj.replace(/\D/g, "");
        if (cpfCnpjNumeros.length >= 5) {
          const senha = cpfCnpjNumeros.substring(0, 5);
          console.log(
            `✅ UC encontrada (variação: "${ucString}") | Senha: ${senha}`,
          );
          return senha;
        } else {
          console.log(
            `  ⚠️ CPF/CNPJ inválido para "${ucString}" (${cpfCnpjNumeros})`,
          );
        }
      } catch (erroVariacao) {
        console.log(`  ⚠️ Exceção ao tentar "${ucString}":`, erroVariacao);
        continue;
      }
    }

    try {
      const { count, error: countError } = await supabase
        .from("unidades_consumidoras")
        .select("*", { count: "exact", head: true });

      if (countError) {
        console.log(`  ❌ Erro ao contar registros: ${countError.message}`);
      } else {
        console.log(`  ℹ️ Tabela tem ${count} registros (conexão OK)`);
      }
    } catch (e) {
      console.log(`  ⚠️ Erro ao verificar tabela:`, e);
    }

    console.log(`❌ UC "${ucOriginal}" não encontrada em nenhuma tentativa`);
    return null;
  } catch (err) {
    console.error("❌ Erro crítico ao buscar senha no Supabase:", err);
    return null;
  }
}

/**
 * Extrai UC de forma robusta tentando múltiplas estratégias
 */
export function extrairUCRobusto(linhas: string[]): string {
  // Estratégia 1: Linha após "Protocolo de autorização:"
  for (let i = 0; i < linhas.length; i++) {
    if (linhas[i].includes("Protocolo de autorização:")) {
      for (let j = 1; j <= 5; j++) {
        const candidate = (linhas[i + j] || "").trim();
        if (/^\d{6,10}$/.test(candidate)) return candidate;
        const m = (linhas[i + j] || "").match(/\b(\d{6,10})\b/);
        if (m) return m[1];
      }
    }
  }

  // Estratégia 2: Linha após indicadores de UC
  for (let i = 0; i < linhas.length; i++) {
    const l = linhas[i];
    if (
      l.includes("UNIDADE CONSUMIDORA") ||
      l.includes("DO CLIENTE") ||
      l === "INSTALAÇÃO /"
    ) {
      for (let j = 0; j <= 3; j++) {
        const candidate = (linhas[i + j] || "").trim();
        if (/^\d{6,10}$/.test(candidate)) return candidate;
      }
    }
  }

  // Estratégia 3: Linha com "código XXXXXXX" (débito automático)
  for (const l of linhas) {
    const m = l.match(/c[oó]digo\s+(\d{6,10})/i);
    if (m) return m[1];
  }

  // Estratégia 4: Linha com INSTALAÇÃO/UNIDADE com número embutido
  for (const l of linhas) {
    if (l.includes("INSTALAÇÃO") || l.includes("UNIDADE CONSUMIDORA")) {
      const m = l.match(/\b(\d{6,10})\b/);
      if (m) return m[1];
    }
  }

  // Estratégia 5: Primeira linha só com dígitos (7-10 chars) nas primeiras 80 linhas
  for (let i = 0; i < Math.min(80, linhas.length); i++) {
    if (/^\d{7,10}$/.test(linhas[i].trim())) return linhas[i].trim();
  }

  for (const l of linhas) {
    if (l.includes("Protocolo de autorização:")) {
      const m = l.match(/Protocolo de autorização:\s*(\d{6,10})/);
      if (m) return m[1];
    }
  }

  return "";
}

/**
 * Abre o PDF e retorna texto em formato de array de linhas.
 * Se o PDF estiver protegido por senha, tenta usar os 5 primeiros dígitos do CPF/CNPJ da UC.
 */
async function extractTextFromPdf(
  pdfData: Blob | File | ArrayBuffer,
  nomeArquivo?: string,
): Promise<string[]> {
  try {
    let uint8Array: Uint8Array;
    if (pdfData instanceof Blob || pdfData instanceof File) {
      const buffer = await pdfData.arrayBuffer();
      uint8Array = new Uint8Array(buffer.slice(0));
    } else if (pdfData instanceof ArrayBuffer) {
      uint8Array = new Uint8Array(pdfData.slice(0));
    } else {
      throw new Error("Tipo de entrada inválido para PDF");
    }

    let senhaParaTentativa: string | null = null;
    if (nomeArquivo) {
      const numeroUc = extrairUCDoNomeArquivo(nomeArquivo);
      if (numeroUc) {
        senhaParaTentativa = await obterSenhaDouc(numeroUc);
      }
    }

    let pdf;
    try {
      pdf = await pdfjsLib.getDocument({
        data: uint8Array.slice(0),
      }).promise;
    } catch (erro: any) {
      if (
        senhaParaTentativa &&
        (erro.name === "PasswordException" ||
          erro.message?.includes("password") ||
          erro.message?.includes("encrypted"))
      ) {
        console.log(
          `🔐 PDF protegido por senha, tentando com a senha de 5 dígitos...`,
        );
        try {
          pdf = await pdfjsLib.getDocument({
            data: uint8Array.slice(0),
            password: senhaParaTentativa,
          }).promise;
          console.log(`✅ PDF desbloqueado com sucesso usando a senha!`);
        } catch (erroComSenha: any) {
          console.error(
            `❌ Falha ao desbloquear PDF com a senha:`,
            erroComSenha,
          );
          throw erroComSenha;
        }
      } else {
        throw erro;
      }
    }

    const allLines: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      const lineMap = new Map<number, string[]>();
      for (const item of textContent.items as any[]) {
        if (!item.str?.trim()) continue;
        const y = Math.round(item.transform[5] / 3) * 3;
        if (!lineMap.has(y)) lineMap.set(y, []);
        lineMap.get(y)!.push(item.str);
      }

      const sortedYs = [...lineMap.keys()].sort((a, b) => b - a);
      for (const y of sortedYs) {
        const lineText = lineMap.get(y)!.join(" ").trim();
        if (lineText) allLines.push(lineText);
      }
    }

    console.log(`📄 PDF extraído: ${allLines.length} linhas encontradas`);
    console.log("Primeiras 20 linhas:", allLines.slice(0, 20));

    return allLines;
  } catch (error) {
    console.error("Erro ao extrair texto do PDF:", error);
    return [];
  }
}

/** Versão exportada para uso externo */
export const extractTextFromPdfDetect = (
  pdfData: Blob | File | ArrayBuffer,
  nomeArquivo?: string,
) => extractTextFromPdf(pdfData, nomeArquivo);

// ============================================================
// EXTRAÇÃO PRINCIPAL DE FATURA
// ============================================================

/**
 * Abre o PDF, extrai as linhas e retorna uma Fatura com a UC preenchida.
 * Os demais campos são preenchidos com valores padrão (0 ou string vazia).
 */
export async function extrairFatura(
  pdfData: Blob | File | ArrayBuffer,
  nomeArquivo?: string,
): Promise<Fatura | null> {
  try {
    console.log(`📋 Iniciando extração de fatura de "${nomeArquivo || "PDF"}"`);

    // Extrai as linhas do PDF
    const linhas = await extractTextFromPdf(pdfData, nomeArquivo);

    if (linhas.length === 0) {
      console.error("❌ Nenhuma linha foi extraída do PDF");
      return null;
    }

    // Extrai UC do texto
    const unidade = extrairUCRobusto(linhas);

    if (!unidade) {
      console.warn("⚠️ Não foi possível extrair a UC do PDF");
      return null;
    }

    // Cria a fatura com os dados extraídos
    const fatura: Fatura = {
      unidade,
      mes_referencia: "",
      data_leitura: "",
      data_emissao: "",
      data_vencimento: "",
      grupo_uc: "",
      subgrupo_uc: "",
      classe_uc: "",
      modalidade: "",
      tipo_GD: "GD1",

      subtotal_faturamento: 0,
      subtotal_outros: 0,

      icms: 0,
      pis_pasep: 0,
      cofins: 0,
      cip: 0,

      isen_icms_tusd: 0,
      creditos_proximas: 0,
      credito_energia_ativa_TUSD: 0,
      beneficio_bruto: 0,
      beneficio_liquido: 0,
      pag_dup: 0,
      juros_323: 0,
      atualizacao_323: 0,
      ajuste_fin: 0,

      bandeira_vermelha: 0,
      bandeira_amarela: 0,

      tarifa_cons_te_fp: 0,
      tarifa_cons_tusd_fp: 0,
      tarifa_comp_tusd_fp: 0,
      tarifa_comp_te_fp: 0,
      tarifa_homo_te_fp: 0,
      tarifa_homo_tusd_fp: 0,
      tarifa_consumo_reativo_fp: 0,

      consumo_fp: 0,
      consumo_reativo_fp: 0,
      energia_injetada_fp: 0,
      credito_utilizado_fp: 0,
      credito_utilizado_real_fp: 0,
      saldo_atualizado_fp: 0,
      demanda_reativa_fp: 0,
      demanda_cons_fp: 0,
      demanda_g_fp: 0,

      tarifa_cons_te_ponta: 0,
      tarifa_cons_tusd_ponta: 0,
      tarifa_comp_tusd_ponta: 0,
      tarifa_comp_te_ponta: 0,
      tarifa_homo_te_ponta: 0,
      tarifa_homo_tusd_ponta: 0,
      tarifa_consumo_reativo_ponta: 0,

      consumo_ponta: 0,
      consumo_reativo_ponta: 0,
      energia_injetada_ponta: 0,
      credito_utilizado_ponta: 0,
      credito_utilizado_real_ponta: 0,
      saldo_atualizado_ponta: 0,
      demanda_reativa_ponta: 0,
      demanda_cons_ponta: 0,
      demanda_g_ponta: 0,

      tarifa_cons_te_reservado: 0,
      tarifa_cons_tusd_reservado: 0,
      tarifa_comp_tusd_reservado: 0,
      tarifa_comp_te_reservado: 0,
      tarifa_homo_te_reservado: 0,
      tarifa_homo_tusd_reservado: 0,
      tarifa_consumo_reativo_reservado: 0,

      consumo_reservado: 0,
      consumo_reativo_reservado: 0,
      energia_injetada_reservado: 0,
      credito_utilizado_reservado: 0,
      credito_utilizado_real_reservado: 0,
      saldo_atualizado_reservado: 0,
      demanda_reativa_reservado: 0,
      demanda_cons_reservado: 0,
      demanda_g_reservado: 0,

      tarifa_cons_te_inter: 0,
      tarifa_cons_tusd_inter: 0,
      tarifa_comp_tusd_inter: 0,
      tarifa_comp_te_inter: 0,
      tarifa_homo_te_inter: 0,
      tarifa_homo_tusd_inter: 0,

      consumo_inter: 0,
      energia_injetada_inter: 0,
      credito_utilizado_inter: 0,
      credito_utilizado_real_inter: 0,
      saldo_atualizado_inter: 0,

      demanda_g_faturada_fp: 0,
      tarifa_demanda_g_fp: 0,
      demanda_g_sem_ICMS_fp: 0,
      tarifa_demanda_g_sem_ICMS_fp: 0,
      demanda_g_ultrapassagem_fp: 0,
      tarifa_demanda_g_ultrapassagem_fp: 0,
      demanda_cons_faturada_fp: 0,
      tarifa_demanda_cons_fp: 0,
      demanda_cons_sem_ICMS_fp: 0,
      tarifa_demanda_cons_sem_ICMS_fp: 0,
      demanda_ultrapassagem_fp: 0,
      tarifa_demanda_ultrapassagem_fp: 0,
      demanda_reativa_faturada_fp: 0,
      tarifa_demanda_reativa_fp: 0,

      demanda_g_faturada_ponta: 0,
      tarifa_demanda_g_ponta: 0,
      demanda_g_sem_ICMS_ponta: 0,
      tarifa_demanda_g_sem_ICMS_ponta: 0,
      demanda_g_ultrapassagem_ponta: 0,
      tarifa_demanda_g_ultrapassagem_ponta: 0,
      demanda_cons_faturada_ponta: 0,
      tarifa_demanda_cons_ponta: 0,
      demanda_cons_sem_ICMS_ponta: 0,
      tarifa_demanda_cons_sem_ICMS_ponta: 0,
      demanda_ultrapassagem_ponta: 0,
      tarifa_demanda_ultrapassagem_ponta: 0,
      demanda_reativa_faturada_ponta: 0,
      tarifa_demanda_reativa_ponta: 0,

      demanda_complementar: 0,
      tarifa_demanda_complementar: 0,

      demanda_g_contratada_fp: 0,
      demanda_cons_contratada_fp: 0,
      demanda_g_contratada_ponta: 0,
      demanda_cons_contratada_ponta: 0,
    };

    console.log(`✅ Fatura extraída com UC: "${unidade}"`);
    return fatura;
  } catch (error) {
    console.error("❌ Erro ao extrair fatura:", error);
    return null;
  }
}
