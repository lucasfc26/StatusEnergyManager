import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import Tesseract from "tesseract.js";
import { supabase } from "../../lib/supabase";

// Usa o worker local bundled pelo Vite (evita dependência de CDN externo)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// ============================================================
// TIPOS
// ============================================================
export interface FaturaGrupoA {
  numero_uc: string;
  mes_referencia: string;
  data_leitura: string;
  subtotal_faturamento: number;
  subtotal_outros: number;
  icms: number;
  pis_pasep: number;
  cofins: number;
  tipo_gd: string;
  cip: number;
  beneficio_bruto: number;
  beneficio_liquido: number;
  bandeira_vermelha: number;
  bandeira_amarela: number;
  // Demanda
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
  // Fora Ponta
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
  // Ponta
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
  // Reservado
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
}

export interface FaturaGrupoB {
  numero_uc: string;
  mes_referencia: string;
  data_leitura: string;
  tarifa_cons_tusd: number;
  tarifa_cons_te: number;
  tarifa_comp_tusd: number;
  tarifa_comp_te: number;
  tarifa_homologada_te: number;
  tarifa_homologada_tusd: number;
  bandeira_vermelha: number;
  bandeira_amarela: number;
  consumo: number;
  energia_injetada: number;
  credito_utilizado: number;
  credito_utilizado_real: number;
  saldo_atualizado: number;
  subtotal_faturamento: number;
  subtotal_outros: number;
  tipo_gd: string;
  pag_dup: number;
  pis_pasep: number;
  cofins: number;
  icms: number;
  cip: number;
}

export interface FaturaRuralIrrigante extends FaturaGrupoA {}
export interface FaturaBranca extends FaturaGrupoA {}

// ============================================================
// FUNÇÕES DE UTILIDADE - UC e SUPABASE
// ============================================================

/**
 * Extrai o número UC do nome do arquivo
 * Procura por 6-10 dígitos consecutivos após a palavra "UC"
 * Ex: "Fatura_UC1234567_2024.pdf" -> "1234567"
 */
function extrairUCDoNomeArquivo(nomeArquivo: string): string {
  // Remove extensão
  const semExtensao = nomeArquivo.replace(/\.[^/.]+$/, "");

  // Procura por "UC" seguido de 6-10 dígitos
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
 * Tenta múltiplas variações e estratégias para encontrar a UC
 * Retorna os 5 primeiros dígitos (sem formatação)
 */
async function obterSenhaDouc(numeroUc: string): Promise<string | null> {
  try {
    if (!numeroUc) {
      console.log(`⚠️ Numero UC vazio, não buscar no Supabase`);
      return null;
    }

    // Garante que numeroUc é string (alguns valores podem vir como número)
    const ucOriginal = String(numeroUc).trim();

    console.log(`🔍 Buscando UC "${ucOriginal}" no Supabase...`);

    // Tenta múltiplas variações da UC
    const variações: string[] = [
      ucOriginal,
      ucOriginal.padStart(10, "0"), // Com zeros à esquerda (10 dígitos)
      ucOriginal.padStart(9, "0"), // Com zeros à esquerda (9 dígitos)
      ucOriginal.padStart(8, "0"), // Com zeros à esquerda (8 dígitos)
    ];

    // Remove duplicatas
    const variáçõesUnicas = [...new Set(variações)];

    for (const ucString of variáçõesUnicas) {
      try {
        console.log(`  🔎 Tentando variação: "${ucString}"`);

        // Estratégia 1: Usando eq()
        let { data, error } = await supabase
          .from("unidades_consumidoras")
          .select("cpf_cnpj")
          .eq("numero_uc", ucString)
          .limit(1)
          .single();

        // Estratégia 2: Se eq() falhar com PGRST116, tentar com like()
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
          const errorCode = error?.code || "UNKNOWN";
          const errorMsg = error?.message || "Erro desconhecido";
          console.log(
            `  ❌ Variação "${ucString}" falhou (${errorCode}): ${errorMsg}`,
          );
          continue; // Tenta próxima variação
        }

        if (!data) {
          console.log(`  ⚠️ Variação "${ucString}" sem dados`);
          continue; // Tenta próxima variação
        }

        const cpfCnpj = data.cpf_cnpj as string;
        if (!cpfCnpj) {
          console.log(`  ⚠️ UC "${ucString}" encontrada mas sem CPF/CNPJ`);
          continue; // Tenta próxima variação
        }

        // Extrai apenas os dígitos do CPF/CNPJ (remove formatação)
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
        continue; // Tenta próxima variação
      }
    }

    // Estratégia 3: Log de debug para ajudar diagnóstico
    try {
      console.log(`  🔎 Tentando busca genérica (debug)...`);
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

    // Se chegou aqui, nenhuma variação funcionou
    console.log(`❌ UC "${ucOriginal}" não encontrada em nenhuma tentativa`);
    return null;
  } catch (err) {
    console.error("❌ Erro crítico ao buscar senha no Supabase:", err);
    return null;
  }
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

/**
 * Converte string brasileira (com , e .) para number
 * Ex: "1.234,56" -> 1234.56
 */
function toFloatBr(s: string): number {
  if (!s) return 0;
  s = s.trim();

  // Move "-" do fim para começo se existir
  if (s.endsWith("-")) {
    s = "-" + s.slice(0, -1).trim();
  }

  // Remove pontos que não são separadores decimais
  // e substitui virgula por ponto
  s = s.replace(/\./g, "").replace(",", ".");

  const result = parseFloat(s);
  return isNaN(result) ? 0 : result;
}

/**
 * Formata saldo mantendo só a última ocorrência de ponto como decimal
 */
function formatarSaldo(saldo: string): string {
  if (!saldo) return "0";

  saldo = saldo.replace(/\s*kWh/i, "").trim();

  // Remove todos os pontos exceto o último (decimal)
  const lastDotIndex = saldo.lastIndexOf(".");
  if (lastDotIndex > 0) {
    saldo =
      saldo.slice(0, lastDotIndex).replace(/\./g, "") +
      saldo.slice(lastDotIndex);
  }

  saldo = saldo.replace(",", ".");
  return saldo;
}

/**
 * Limpa texto removendo quebras de linha, hífens e substituindo vírgula por ponto
 */
function limparTexto(text: string): string {
  if (!text) return "0";
  return text.replace(/\n/g, "").replace(/-/g, "").replace(/,/g, ".");
}

/**
 * Extrai valor do texto usando regex
 */
function extractValue(pattern: RegExp, text: string): number {
  const match = text.match(pattern);
  if (!match || !match[1]) return 0;

  const value = match[1].replace(/\./g, "").replace(/,/g, ".");
  const result = parseFloat(value);
  return isNaN(result) ? 0 : result;
}

/**
 * Extrai UC de forma robusta tentando múltiplas estratégias
 */
function extrairUCRobusto(linhas: string[]): string {
  // Estratégia 1: Linha que contém "Protocolo de autorização:" - a UC aparece após essa linha
  for (let i = 0; i < linhas.length; i++) {
    if (linhas[i].includes("Protocolo de autorização:")) {
      // Procura número de UC nas próximas 5 linhas
      for (let j = 1; j <= 5; j++) {
        const candidate = (linhas[i + j] || "").trim();
        if (/^\d{6,10}$/.test(candidate)) return candidate;
        // Tenta extrair número dentro de uma linha
        const m = (linhas[i + j] || "").match(/\b(\d{6,10})\b/);
        if (m) return m[1];
      }
    }
  }

  // Estratégia 2: Linha com só dígitos logo após indicadores de UC
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

  // Estratégia 3: Linha que contém "código XXXXXXX" (débito automático)
  for (const l of linhas) {
    const m = l.match(/c[oó]digo\s+(\d{6,10})/i);
    if (m) return m[1];
  }

  // Estratégia 3: Linha que contém INSTALAÇÃO/UNIDADE com número embutido
  for (const l of linhas) {
    if (l.includes("INSTALAÇÃO") || l.includes("UNIDADE CONSUMIDORA")) {
      const m = l.match(/\b(\d{6,10})\b/);
      if (m) return m[1];
    }
  }

  // Estratégia 4: Primeira linha que é só dígitos (7-10 chars) nas primeiras 80 linhas
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
 * Extrai PDF e retorna texto em formato de array de linhas
 * Usa pdfjs-dist que funciona no browser
 * Se o PDF estiver protegido por senha, tenta usar os 5 primeiros dígitos do CPF/CNPJ da UC
 */
async function extractTextFromPdf(
  pdfData: Blob | File | ArrayBuffer,
  nomeArquivo?: string,
): Promise<string[]> {
  try {
    // Converte para Uint8Array e já guarda uma cópia antes de qualquer uso
    // O pdfjs transfere (detach) o ArrayBuffer ao Worker, impossibilitando reutilizá-lo
    let uint8Array: Uint8Array;
    if (pdfData instanceof Blob || pdfData instanceof File) {
      const buffer = await pdfData.arrayBuffer();
      uint8Array = new Uint8Array(buffer.slice(0)); // cópia imediata
    } else if (pdfData instanceof ArrayBuffer) {
      uint8Array = new Uint8Array(pdfData.slice(0)); // cópia imediata
    } else {
      throw new Error("Tipo de entrada inválido para PDF");
    }

    // Tenta extrair UC do nome do arquivo
    let senhaParaTentativa: string | null = null;
    if (nomeArquivo) {
      const numeroUc = extrairUCDoNomeArquivo(nomeArquivo);
      if (numeroUc) {
        senhaParaTentativa = await obterSenhaDouc(numeroUc);
      }
    }

    // Tenta abrir PDF sem senha primeiro (usa cópia própria)
    let pdf;
    try {
      pdf = await pdfjsLib.getDocument({
        data: uint8Array.slice(0), // cópia para esta tentativa
      }).promise;
    } catch (erro: any) {
      // Se o erro for de autenticação/senha requerida, tenta com a senha
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
            data: uint8Array.slice(0), // nova cópia para esta tentativa
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

      // Agrupa itens por posição Y (linha visual) com tolerância de 3px
      const lineMap = new Map<number, string[]>();
      for (const item of textContent.items as any[]) {
        if (!item.str?.trim()) continue;
        const y = Math.round(item.transform[5] / 3) * 3; // arredonda para agrupar itens na mesma linha
        if (!lineMap.has(y)) lineMap.set(y, []);
        lineMap.get(y)!.push(item.str);
      }

      // Ordena por Y decrescente (topo → baixo na página)
      const sortedYs = [...lineMap.keys()].sort((a, b) => b - a);
      for (const y of sortedYs) {
        const lineText = lineMap.get(y)!.join(" ").trim();
        if (lineText) allLines.push(lineText);
      }
    }

    const lines = allLines;

    console.log(`📄 PDF extraído: ${lines.length} linhas encontradas`);
    console.log("Primeiras 20 linhas:", lines.slice(0, 20));

    return lines;
  } catch (error) {
    console.error("Erro ao extrair texto do PDF:", error);
    return [];
  }
}

/** Versão exportada usada apenas para detecção de tipo */
export const extractTextFromPdfDetect = (
  pdfData: Blob | File | ArrayBuffer,
  nomeArquivo?: string,
) => extractTextFromPdf(pdfData, nomeArquivo);

/**
 * Usa OCR quando o PDF é uma imagem escaneada
 * Nota: Tesseract.js funciona melhor com arquivos de imagem blob
 */
async function extractTextFromImagePDF(
  pdfData: Blob | File | ArrayBuffer,
  nomeArquivo?: string,
): Promise<string[]> {
  try {
    // Garante que temos um Blob
    let blob: Blob;
    if (pdfData instanceof Blob || pdfData instanceof File) {
      blob = pdfData;
    } else if (pdfData instanceof ArrayBuffer) {
      blob = new Blob([pdfData], { type: "application/pdf" });
    } else {
      throw new Error("Tipo de entrada inválido para OCR");
    }

    // Tenta reconhecer texto usando Tesseract
    const result = await Tesseract.recognize(blob, "por", {
      logger: (m) => console.log("OCR Progress:", m),
    });

    const lines = result.data.text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    return lines;
  } catch (error) {
    console.error("Erro ao fazer OCR:", error);
    return [];
  }
}

// ============================================================
// EXTRAÇÃO GRUPO A
// ============================================================

export async function extrairDadosGrupoA(
  pdfData: Blob | File | ArrayBuffer,
  nomeArquivo?: string,
): Promise<FaturaGrupoA | null> {
  try {
    let linhas = await extractTextFromPdf(pdfData, nomeArquivo);

    // Se não extraiu texto, tenta com OCR
    if (linhas.length === 0) {
      console.log("PDF sem texto detectável, usando OCR...");
      linhas = await extractTextFromImagePDF(pdfData, nomeArquivo);
    }

    const fatura = inicializarFaturaGrupoA();

    // Extrai UC com função robusta (mesma usada no Grupo B)
    fatura.numero_uc = extrairUCRobusto(linhas);

    for (let num = 0; num < linhas.length; num++) {
      const texto = linhas[num];

      // MÊS/ANO e DATA DE LEITURA
      if (texto.includes("MÊS/ANO") && !fatura.mes_referencia) {
        const proxima = linhas[num + 2] || "";
        const m = proxima.match(/^(\d{1,2})\/(\d{4})/);
        if (m) fatura.mes_referencia = `${m[1].padStart(2, "0")}/${m[2]}`;
      }

      if (
        !fatura.data_leitura &&
        texto.match(/MONOFÁSICO|TRIFÁSICO|BIFÁSICO/)
      ) {
        const dates = texto.match(/\d{2}\/\d{2}\/\d{4}/g);
        if (dates && dates.length >= 2) fatura.data_leitura = dates[1];
        for (let i = 1; i <= 3 && !fatura.data_leitura; i++) {
          const prox = linhas[num + i] || "";
          const ds = prox.match(/\d{2}\/\d{2}\/\d{4}/g);
          if (ds && ds.length >= 2) fatura.data_leitura = ds[1];
        }
      }

      // DADOS FINANCEIROS
      if (texto.includes("Subtotal Faturamento")) {
        const value = linhas[num + 1]?.replace(/\./g, "").trim() || "0";
        fatura.subtotal_faturamento = toFloatBr(value);
      }

      if (texto.includes("Subtotal Outros")) {
        fatura.subtotal_outros = toFloatBr(linhas[num + 1] || "0");
      }

      if (texto.includes("Benefício Tarifário Bruto")) {
        fatura.beneficio_bruto = toFloatBr(linhas[num + 1] || "0");
      }

      if (texto.includes("Benefício Tarifário Líquido")) {
        fatura.beneficio_liquido = toFloatBr(linhas[num + 1] || "0");
      }

      if (texto.includes("CIP ILUM PUB")) {
        fatura.cip = toFloatBr(linhas[num + 1] || "0");
      }

      if (texto.includes("PIS/PASEP")) {
        fatura.pis_pasep = toFloatBr(linhas[num + 2] || "0");
      }

      if (texto.includes("COFINS")) {
        fatura.cofins = toFloatBr(linhas[num + 2] || "0");
      }

      if (texto.includes("ICMS")) {
        fatura.icms = toFloatBr(linhas[num + 2] || "0");
      }

      // BANDEIRAS
      if (texto.includes("Adicional Band. Vermelha")) {
        fatura.bandeira_vermelha = toFloatBr(linhas[num + 3] || "0");
      }

      if (texto.includes("Adicional Band. Amarela")) {
        fatura.bandeira_amarela = toFloatBr(linhas[num + 3] || "0");
      }

      // CONSUMOS E TARIFAS - FORA PONTA (FP)
      if (texto.includes("Energia Atv Forn F Ponta TE")) {
        fatura.consumo_fp = toFloatBr(linhas[num + 2] || "0");
        fatura.tarifa_cons_te_fp = toFloatBr(linhas[num + 3] || "0");
        fatura.tarifa_homo_te_fp = toFloatBr(linhas[num + 9] || "0");
      }

      if (texto.includes("Energia Atv Forn F Ponta TUSD")) {
        fatura.tarifa_cons_tusd_fp = toFloatBr(linhas[num + 3] || "0");
        fatura.tarifa_homo_tusd_fp = toFloatBr(linhas[num + 9] || "0");
      }

      // CONSUMOS E TARIFAS - PONTA
      if (texto.includes("Energia Atv Forn Ponta TE")) {
        fatura.consumo_ponta = toFloatBr(linhas[num + 2] || "0");
        fatura.tarifa_cons_te_ponta = toFloatBr(linhas[num + 3] || "0");
        fatura.tarifa_homo_te_ponta = toFloatBr(linhas[num + 9] || "0");
      }

      if (texto.includes("Energia Atv Forn Ponta TUSD")) {
        fatura.tarifa_cons_tusd_ponta = toFloatBr(linhas[num + 3] || "0");
        fatura.tarifa_homo_tusd_ponta = toFloatBr(linhas[num + 9] || "0");
      }

      // CONSUMOS E TARIFAS - RESERVADO
      if (texto.includes("Energia Atv Forn Reserv TE")) {
        fatura.consumo_reservado = toFloatBr(linhas[num + 2] || "0");
        fatura.tarifa_cons_te_reservado = toFloatBr(linhas[num + 3] || "0");
        fatura.tarifa_homo_te_reservado = toFloatBr(linhas[num + 9] || "0");
      }

      if (texto.includes("Energia Atv Forn Reserv TUSD")) {
        fatura.tarifa_cons_tusd_reservado = toFloatBr(linhas[num + 3] || "0");
        fatura.tarifa_homo_tusd_reservado = toFloatBr(linhas[num + 9] || "0");
      }

      // CONSUMO REATIVO
      if (texto.includes("Consumo Reativo Excedente Fp")) {
        fatura.consumo_reativo_fp = toFloatBr(linhas[num + 2] || "0");
        fatura.tarifa_consumo_reativo_fp = toFloatBr(linhas[num + 3] || "0");
      }

      if (texto.includes("Consumo Reativo Excedente Np")) {
        fatura.consumo_reativo_ponta = toFloatBr(linhas[num + 2] || "0");
        fatura.tarifa_consumo_reativo_ponta = toFloatBr(linhas[num + 3] || "0");
      }

      if (texto.includes("Consumo Reativo Excedente Rv")) {
        fatura.consumo_reativo_reservado = toFloatBr(linhas[num + 2] || "0");
        fatura.tarifa_consumo_reativo_reservado = toFloatBr(
          linhas[num + 3] || "0",
        );
      }

      // COMPENSAÇÃO - FORA PONTA
      if (texto.includes("Energ Atv Inj FP TE")) {
        fatura.tarifa_comp_te_fp = toFloatBr(
          linhas[num + 3]?.replace(/-/g, "") || "0",
        );
        fatura.credito_utilizado_real_fp += toFloatBr(
          limparTexto(linhas[num + 2] || "0"),
        );
      }

      if (texto.includes("Energ Atv Inj FP TUSD")) {
        fatura.tarifa_comp_tusd_fp = toFloatBr(
          linhas[num + 3]?.replace(/-/g, "") || "0",
        );
      }

      // COMPENSAÇÃO - PONTA
      if (texto.includes("Energ Atv Inj Ponta TE")) {
        fatura.tarifa_comp_te_ponta = toFloatBr(
          linhas[num + 3]?.replace(/-/g, "") || "0",
        );
        fatura.credito_utilizado_real_ponta += toFloatBr(
          limparTexto(linhas[num + 2] || "0"),
        );
      }

      if (texto.includes("Energ Atv Inj Ponta TUSD")) {
        fatura.tarifa_comp_tusd_ponta = toFloatBr(
          linhas[num + 3]?.replace(/-/g, "") || "0",
        );
      }

      // COMPENSAÇÃO - RESERVADO
      if (texto.includes("Energ Atv Inj Reser TE")) {
        fatura.tarifa_comp_te_reservado = toFloatBr(
          linhas[num + 3]?.replace(/-/g, "") || "0",
        );
        fatura.credito_utilizado_real_reservado += toFloatBr(
          limparTexto(linhas[num + 2] || "0"),
        );
      }

      if (texto.includes("Energ Atv Inj Reser TUSD")) {
        fatura.tarifa_comp_tusd_reservado = toFloatBr(
          linhas[num + 3]?.replace(/-/g, "") || "0",
        );
      }

      // SALDO ACUMULADO, UTILIZADO E INJETADO
      if (texto.includes("Data de apresentação:")) {
        const textoInteiro = [
          linhas[num + 1] || "",
          linhas[num + 2] || "",
          linhas[num + 3] || "",
          linhas[num + 4] || "",
        ]
          .join(" ")
          .replace(/\n/g, " ");

        // FORA PONTA
        fatura.energia_injetada_fp = extractValue(
          /Energia Injetada HFP no mês:\s*([\d,.]+)/i,
          textoInteiro,
        );
        fatura.credito_utilizado_fp = extractValue(
          /HFP.*?Saldo utilizado no mês:\s*([\d,.]+)/i,
          textoInteiro,
        );
        fatura.saldo_atualizado_fp = extractValue(
          /HFP.*?Saldo atualizado:\s*([\d,.]+)/i,
          textoInteiro,
        );

        // PONTA
        fatura.energia_injetada_ponta = extractValue(
          /Energia Injetada HP no mês:\s*([\d,.]+)/i,
          textoInteiro,
        );
        fatura.credito_utilizado_ponta = extractValue(
          /HP.*?Saldo utilizado no mês:\s*([\d,.]+)/i,
          textoInteiro,
        );
        fatura.saldo_atualizado_ponta = extractValue(
          /HP.*?Saldo atualizado:\s*([\d,.]+)/i,
          textoInteiro,
        );
      }

      // DEMANDAS
      if (texto.includes("Demanda Ativa") && fatura.tarifa_demanda_fp === 0) {
        fatura.demanda_fp = toFloatBr(linhas[num + 2] || "0");
        fatura.tarifa_demanda_fp = toFloatBr(linhas[num + 3] || "0");
      }

      if (texto.includes("Demanda Ativa sem ICMS")) {
        fatura.demanda_sem_icms = toFloatBr(linhas[num + 2] || "0");
        fatura.tarifa_demanda_sem_icms = toFloatBr(linhas[num + 3] || "0");
      }

      if (
        texto.includes("Demanda Ultrapassagem") &&
        fatura.tarifa_demanda_ultrapassagem === 0
      ) {
        fatura.demanda_ultrapassagem = toFloatBr(linhas[num + 2] || "0");
        fatura.tarifa_demanda_ultrapassagem = toFloatBr(linhas[num + 3] || "0");
      }

      if (texto.includes("Demanda De Geração")) {
        fatura.demanda_g = toFloatBr(linhas[num + 2] || "0");
        fatura.tarifa_demanda_g = toFloatBr(linhas[num + 3] || "0");
      }

      if (texto.includes("Demanda Ultrapassagem Geração")) {
        fatura.demanda_g_ultrapassagem = toFloatBr(linhas[num + 2] || "0");
        fatura.tarifa_demanda_g_ultrapassagem = toFloatBr(
          linhas[num + 3] || "0",
        );
      }

      if (texto.includes("Demanda Complementar")) {
        fatura.demanda_complementar = toFloatBr(linhas[num + 2] || "0");
        fatura.tarifa_demanda_complementar = toFloatBr(linhas[num + 3] || "0");
      }

      if (
        texto.includes("Demanda Reativa") &&
        !texto.includes("Demanda Reativa-kVAr") &&
        fatura.demanda_reativa === 0
      ) {
        fatura.demanda_reativa = toFloatBr(linhas[num + 2] || "0");
        fatura.tarifa_demanda_reativa = toFloatBr(linhas[num + 3] || "0");
      }

      // TIPO GD
      if (texto.includes("GD2") && fatura.tipo_gd === "GD1") {
        fatura.tipo_gd = "GD2";
      } else if (texto.includes("GD3") && fatura.tipo_gd === "GD1") {
        fatura.tipo_gd = "GD3";
      }
    }

    return fatura;
  } catch (error) {
    console.error("Erro ao extrair dados Grupo A:", error);
    return null;
  }
}

// ============================================================
// EXTRAÇÃO GRUPO B
// ============================================================

export async function extrairDadosGrupoB(
  pdfData: Blob | File | ArrayBuffer,
  nomeArquivo?: string,
): Promise<FaturaGrupoB | null> {
  try {
    let linhas = await extractTextFromPdf(pdfData, nomeArquivo);

    if (linhas.length === 0) {
      console.log("PDF sem texto detectável, usando OCR...");
      linhas = await extractTextFromImagePDF(pdfData, nomeArquivo);
    }
    console.log(
      linhas[8].includes("B1")
        ? `  Linha 8: 🔍 Processando Grupo B com ${linhas.length} linhas`
        : "  Linha 8: (Não é Grupo B, mas processando mesmo assim...)",
    );

    const fatura = inicializarFaturaGrupoB();

    // Debug: Procura por padrões importantes
    console.log("🔎 Buscando padrões:");

    // Usar extrair UC robusta
    //fatura.numero_uc = linhas[25].match(/\b\d{6,10}\b/)?.[0] || "";

    const index = linhas.findIndex((l) => l.includes("CFOP"));

    if (index !== -1 && linhas[index + 0]) {
      const linhaUC = linhas[index + 0];
      fatura.numero_uc = linhaUC.match(/\b\d{6,10}\b/)?.[0] || fatura.numero_uc;
    }

    console.log(`📍 UC extraída: "${fatura.numero_uc}"`);

    for (let num = 0; num < linhas.length; num++) {
      const texto = linhas[num];

      // MÊS/ANO - cabeçalho da tabela de dados
      // Com extração por Y, a linha seguinte contém os valores: "03/2025 10/04/2025 R$ 0,00"
      if (texto.includes("MÊS/ANO") && !fatura.mes_referencia) {
        let linha = linhas[num + 2] || "";
        const mref =
          linha.match(/\b\d{1,2}\/\d{4}\b/) || // 03/2025
          linha.match(/\b[A-Z]{3}\d{2}\b/); // MAR25

        fatura.mes_referencia = mref?.[0] || "";
      }

      // DATA LEITURA - linha com TRIFÁSICO/MONOFÁSICO/BIFÁSICO tem datas próximas
      if (
        !fatura.data_leitura &&
        texto.match(/TRIFÁSICO|MONOFÁSICO|BIFÁSICO/)
      ) {
        // A linha pode conter datas no próprio texto
        const dates = texto.match(/\d{2}\/\d{2}\/\d{4}/g);
        if (dates && dates.length >= 2) {
          fatura.data_leitura = dates[1]; // leitura atual
        }
        // Ou na próxima linha de valores
        for (let i = 1; i <= 3; i++) {
          const prox = linhas[num + i] || "";
          const ds = prox.match(/\d{2}\/\d{2}\/\d{4}/g);
          if (ds && ds.length >= 2) {
            fatura.data_leitura = ds[1];
            break;
          }
        }
      }

      // CONSUMO E TARIFAS — cada item de fatura vem numa única linha:
      // "Energia Ativa Fornecida TE kWh 1.091 0,34826 379,95 6,22 379,95 20,00% 75,99 0,27291"
      if (
        texto.includes("Energia Ativa Fornecida TE") &&
        !texto.includes("TUSD")
      ) {
        // Quantidade (consumo): primeiro número que pode ter ponto como milhar
        const qMatch = texto.match(/kWh\s+([\d.]+)\s+/);
        if (qMatch) fatura.consumo = toFloatBr(qMatch[1].replace(/\./g, ""));

        // Tarifa unit (último número na linha, sem sinal negativo)
        const numeros = [...texto.matchAll(/([\d]+,[\d]+)-?/g)].map(
          (m) => m[1],
        );
        if (numeros.length > 0)
          fatura.tarifa_cons_te = toFloatBr(numeros[numeros.length - 1]);
      }

      if (texto.includes("Energia Ativa Fornecida TUSD")) {
        const numeros = [...texto.matchAll(/([\d]+,[\d]+)-?/g)].map(
          (m) => m[1],
        );
        if (numeros.length > 0)
          fatura.tarifa_cons_tusd = toFloatBr(numeros[0].replace(/\./g, ""));
        else fatura.tarifa_cons_tusd = toFloatBr(numeros[numeros.length - 1]);
      }

      // COMPENSAÇÃO GD — linhas com "Energia Atv Inj TE" e "Energia Atv Inj TUSD"
      if (texto.includes("Energia Atv Inj TE") && fatura.tarifa_comp_te === 0) {
        // Quantidade acumulada (crédito utilizado)
        const qMatch = texto.match(/kWh\s+([\d.]+)\s+/);
        if (qMatch)
          fatura.credito_utilizado += toFloatBr(qMatch[1].replace(/\./g, ""));
        const numeros = [...texto.matchAll(/([\d]+,[\d]+)-?/g)].map(
          (m) => m[1],
        );
        if (numeros.length > 0)
          fatura.tarifa_comp_te = toFloatBr(numeros[numeros.length - 1]);
      }

      if (
        texto.includes("Energia Atv Inj TUSD") &&
        fatura.tarifa_comp_tusd === 0
      ) {
        const numeros = [...texto.matchAll(/([\d]+,[\d]+)-?/g)].map(
          (m) => m[1],
        );
        if (numeros.length > 0)
          fatura.tarifa_comp_tusd = toFloatBr(numeros[numeros.length - 1]);
      }

      // CIP ILUMINAÇÃO PÚBLICA — linha contém valor em R$
      if (texto.includes("CIP ILUM") && fatura.cip === 0) {
        // Formato: "CIP ILUM PUB PREF MUNICIPAL 137,67 0,00 ..."
        const m = texto.match(/CIP[^0-9]+([\d]+,[\d]+)/);
        if (m) fatura.cip = toFloatBr(m[1]);
      }

      // PAGAMENTO DUPLICIDADE
      if (
        texto.includes("Pagamento Duplicidade") ||
        texto.includes("Pagamento Duplic")
      ) {
        const m = texto.match(/([\d.]+,[\d]+)-?/);
        if (m) fatura.pag_dup = toFloatBr(m[1]);
      }

      // SUBTOTAL FATURAMENTO
      if (
        texto.includes("Subtotal Faturamento") &&
        fatura.subtotal_faturamento === 0
      ) {
        // Formato: "Subtotal Faturamento 276,04"
        const m = texto.match(/Subtotal Faturamento\s+([\d.]+,[\d]+)/);
        if (m) {
          fatura.subtotal_faturamento = toFloatBr(m[1]);
        } else {
          const proxima = linhas[num + 1] || "";
          const mp = proxima.match(/^([\d.]+,[\d]+)/);
          if (mp) fatura.subtotal_faturamento = toFloatBr(mp[1]);
        }
      }

      // SUBTOTAL OUTROS
      if (texto.includes("Subtotal Outros") && fatura.subtotal_outros === 0) {
        const m = texto.match(/Subtotal Outros\s+([\d.]+,[\d]+-?)/);
        if (m) {
          fatura.subtotal_outros = toFloatBr(m[1]);
        } else {
          const proxima = linhas[num + 1] || "";
          const mp = proxima.match(/^([\d.]+,[\d]+-?)/);
          if (mp) fatura.subtotal_outros = toFloatBr(mp[1]);
        }
      }

      // BANDEIRAS
      if (
        texto.includes("Band. Vermelha") ||
        (texto.includes("Vermelha") && texto.includes("kWh"))
      ) {
        const m = texto.match(/([\d]+,[\d]+)/g);
        if (m) fatura.bandeira_vermelha = toFloatBr(m[m.length - 2] || m[0]);
      }

      if (
        texto.includes("Band. Amarela") ||
        (texto.includes("Amarela") && texto.includes("kWh"))
      ) {
        const m = texto.match(/([\d]+,[\d]+)/g);
        if (m) fatura.bandeira_amarela = toFloatBr(m[m.length - 2] || m[0]);
      }

      // ENERGIA INJETADA (nas mensagens importantes do PDF)
      if (texto.includes("Energia Injetada HFP")) {
        const m = texto.match(/Energia Injetada HFP[^:]*:\s*([\d.,]+)\s*kWh/i);
        if (m) fatura.energia_injetada = toFloatBr(m[1]);
      }

      // SALDO UTILIZADO E ATUALIZADO (nas mensagens importantes)
      if (
        texto.includes("Saldo utilizado") &&
        fatura.credito_utilizado_real === 0
      ) {
        const m = texto.match(/Saldo utilizado[^:]*:\s*([\d.,]+)\s*kWh/i);
        if (m) fatura.credito_utilizado_real = toFloatBr(m[1]);
      }

      if (texto.includes("Saldo atualizado") && fatura.saldo_atualizado === 0) {
        const m = texto.match(/Saldo atualizado[^:]*:\s*([\d.,]+)\s*kWh/i);
        if (m) fatura.saldo_atualizado = toFloatBr(m[1]);
      }

      // TRIBUTOS — seção "INFORMAÇÕES FISCAIS"
      // Formato da linha: " PIS/PASEP 137,90 0,37 0,52"
      if (texto.includes("PIS/PASEP") && fatura.pis_pasep === 0) {
        const nums = [...texto.matchAll(/([\d]+,[\d]+)/g)].map((m) => m[1]);
        if (nums.length >= 3) fatura.pis_pasep = toFloatBr(nums[2]);
      }

      if (texto.includes("COFINS") && fatura.cofins === 0) {
        const nums = [...texto.matchAll(/([\d]+,[\d]+)/g)].map((m) => m[1]);
        if (nums.length >= 3) fatura.cofins = toFloatBr(nums[2]);
      }

      if (texto.match(/^\s*I?\s*CMS\b|^ICMS\b/) && fatura.icms === 0) {
        const nums = [...texto.matchAll(/([\d]+,[\d]+)/g)].map((m) => m[1]);
        if (nums.length >= 3) fatura.icms = toFloatBr(nums[2]);
      }

      // TIPO GD
      if (texto.includes("GD2") && fatura.tipo_gd === "GD1")
        fatura.tipo_gd = "GD2";
      else if (texto.includes("GD3") && fatura.tipo_gd === "GD1")
        fatura.tipo_gd = "GD3";
    }

    console.log("✅ Grupo B Extração Completa:", {
      numero_uc: fatura.numero_uc || "(não encontrado)",
      mes_referencia: fatura.mes_referencia || "(não encontrado)",
      consumo: fatura.consumo,
      tarifa_te: fatura.tarifa_cons_te,
      tarifa_tusd: fatura.tarifa_cons_tusd,
      subtotal: fatura.subtotal_faturamento,
    });

    return fatura;
  } catch (error) {
    console.error("Erro ao extrair dados Grupo B:", error);
    return null;
  }
}

// Função auxiliar para inicializar FaturaGrupoB
function inicializarFaturaGrupoB(): FaturaGrupoB {
  return {
    numero_uc: "",
    mes_referencia: "",
    data_leitura: "",
    tarifa_cons_tusd: 0,
    tarifa_cons_te: 0,
    tarifa_comp_tusd: 0,
    tarifa_comp_te: 0,
    tarifa_homologada_te: 0,
    tarifa_homologada_tusd: 0,
    bandeira_vermelha: 0,
    bandeira_amarela: 0,
    consumo: 0,
    energia_injetada: 0,
    credito_utilizado: 0,
    credito_utilizado_real: 0,
    saldo_atualizado: 0,
    subtotal_faturamento: 0,
    subtotal_outros: 0,
    tipo_gd: "GD1",
    pag_dup: 0,
    pis_pasep: 0,
    cofins: 0,
    icms: 0,
    cip: 0,
  };
}

// ============================================================
// EXTRAÇÃO RURAL IRRIGANTE
// ============================================================

export async function extrairDadosRuralIrrigante(
  pdfData: Blob | File | ArrayBuffer,
  nomeArquivo?: string,
): Promise<FaturaRuralIrrigante | null> {
  // Rural Irrigante usa a mesma estrutura de Grupo A
  return extrairDadosGrupoA(pdfData, nomeArquivo);
}

// ============================================================
// EXTRAÇÃO BRANCA
// ============================================================

export async function extrairDadosBranca(
  pdfData: Blob | File | ArrayBuffer,
  nomeArquivo?: string,
): Promise<FaturaBranca | null> {
  // Branca usa a mesma estrutura de Grupo A
  return extrairDadosGrupoA(pdfData, nomeArquivo);
}

// ============================================================
// FUNÇÕES DE INICIALIZAÇÃO
// ============================================================

function inicializarFaturaGrupoA(): FaturaGrupoA {
  return {
    numero_uc: "",
    mes_referencia: "",
    data_leitura: "",
    subtotal_faturamento: 0,
    subtotal_outros: 0,
    icms: 0,
    pis_pasep: 0,
    cofins: 0,
    tipo_gd: "GD1",
    cip: 0,
    beneficio_bruto: 0,
    beneficio_liquido: 0,
    bandeira_vermelha: 0,
    bandeira_amarela: 0,
    demanda_g: 0,
    tarifa_demanda_g: 0,
    demanda_g_ultrapassagem: 0,
    tarifa_demanda_g_ultrapassagem: 0,
    demanda_sem_icms: 0,
    tarifa_demanda_sem_icms: 0,
    demanda_ultrapassagem: 0,
    tarifa_demanda_ultrapassagem: 0,
    demanda_reativa: 0,
    tarifa_demanda_reativa: 0,
    demanda_complementar: 0,
    tarifa_demanda_complementar: 0,
    tarifa_cons_te_fp: 0,
    tarifa_cons_tusd_fp: 0,
    tarifa_comp_tusd_fp: 0,
    tarifa_comp_te_fp: 0,
    tarifa_homo_te_fp: 0,
    tarifa_homo_tusd_fp: 0,
    tarifa_consumo_reativo_fp: 0,
    consumo_fp: 0,
    consumo_reativo_fp: 0,
    credito_utilizado_fp: 0,
    credito_utilizado_real_fp: 0,
    saldo_atualizado_fp: 0,
    energia_injetada_fp: 0,
    demanda_fp: 0,
    tarifa_demanda_fp: 0,
    tarifa_cons_te_ponta: 0,
    tarifa_cons_tusd_ponta: 0,
    tarifa_comp_tusd_ponta: 0,
    tarifa_comp_te_ponta: 0,
    tarifa_homo_te_ponta: 0,
    tarifa_homo_tusd_ponta: 0,
    tarifa_consumo_reativo_ponta: 0,
    consumo_ponta: 0,
    consumo_reativo_ponta: 0,
    credito_utilizado_ponta: 0,
    credito_utilizado_real_ponta: 0,
    saldo_atualizado_ponta: 0,
    energia_injetada_ponta: 0,
    demanda_ponta: 0,
    tarifa_demanda_ponta: 0,
    tarifa_cons_te_reservado: 0,
    tarifa_cons_tusd_reservado: 0,
    tarifa_comp_tusd_reservado: 0,
    tarifa_comp_te_reservado: 0,
    tarifa_homo_te_reservado: 0,
    tarifa_homo_tusd_reservado: 0,
    tarifa_consumo_reativo_reservado: 0,
    consumo_reservado: 0,
    consumo_reativo_reservado: 0,
    credito_utilizado_reservado: 0,
    credito_utilizado_real_reservado: 0,
    saldo_atualizado_reservado: 0,
    energia_injetada_reservado: 0,
  };
}
