import { useState, useCallback } from "react";
import {
  extrairDadosGrupoA,
  extrairDadosGrupoB,
  extrairDadosRuralIrrigante,
  extrairDadosBranca,
} from "../components/Extracoes/extractionFunctions";
import type { ExtractionResult, Fatura } from "../types/faturas";

export interface UseExtractionOptions {
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
  onSuccess?: (result: ExtractionResult) => void;
}

export function useFacturaExtraction(options?: UseExtractionOptions) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ExtractionResult[]>([]);

  const resetState = useCallback(() => {
    setError(null);
    setProgress(0);
  }, []);

  /**
   * Detecta o tipo de fatura e extrai os dados
   */
  const detectAndExtract = useCallback(
    async (
      pdfData: Blob | File | ArrayBuffer,
      arquivo: string,
    ): Promise<ExtractionResult> => {
      try {
        setProgress(10);
        options?.onProgress?.(10);

        // Detecta tipo pelo conteúdo do PDF antes de tentar os extractores
        const { extractTextFromPdfDetect } =
          await import("../components/Extracoes/extractionFunctions");
        const linhasDeteccao = await extractTextFromPdfDetect(pdfData, arquivo);
        const rawLines = linhasDeteccao; // guarda para debug
        const textoCompleto = linhasDeteccao.join(" ").toUpperCase();

        // Grupo B: classificação começa com B (B1, B2, B3, B4)
        // Indicadores exclusivos: "B1 RESIDENCIAL", "B2 ", "MONOFÁSICO"/"TRIFÁSICO" SEM demanda
        const isGrupoB =
          textoCompleto.includes("B1 RESIDENCIAL") ||
          textoCompleto.includes("B1 RESIDENCIAL-CONV") ||
          /\bB[1234]\s/.test(textoCompleto);

        // Grupo A: tem itens de DEMANDA faturada (não apenas "HFP" na tabela de medição)
        const isGrupoA =
          !isGrupoB &&
          (textoCompleto.includes("DEMANDA G ") ||
            textoCompleto.includes("DEMANDA FORA PONTA") ||
            textoCompleto.includes("TUSD HFP ") ||
            textoCompleto.includes("TUSD FP ") ||
            /CONSUMO\s+FORA\s+PONTA/.test(textoCompleto));

        const isRural = !isGrupoB && textoCompleto.includes("RURAL IRRIGANTE");
        const isBranca = !isGrupoB && textoCompleto.includes("TARIFA BRANCA");

        let fatura = null;
        let tipo: ExtractionResult["tipo"] = "grupoB";

        if (isGrupoB) {
          tipo = "grupoB";
          fatura = await extrairDadosGrupoB(pdfData, arquivo);
        } else if (isRural) {
          tipo = "ruralIrrigante";
          fatura = await extrairDadosRuralIrrigante(pdfData, arquivo);
        } else if (isBranca) {
          tipo = "branca";
          fatura = await extrairDadosBranca(pdfData, arquivo);
        } else if (isGrupoA) {
          tipo = "grupoA";
          fatura = await extrairDadosGrupoA(pdfData, arquivo);
        } else {
          // Padrão: Grupo B (mais comum)
          tipo = "grupoB";
          fatura = await extrairDadosGrupoB(pdfData, arquivo);
        }

        setProgress(50);
        options?.onProgress?.(50);

        // Fallback: se não extraiu UC, tenta os demais tipos
        if (!fatura || !fatura.numero_uc) {
          fatura = await extrairDadosGrupoA(pdfData, arquivo);
          tipo = "grupoA";
        }
        if (!fatura || !fatura.numero_uc) {
          fatura = await extrairDadosRuralIrrigante(pdfData, arquivo);
          tipo = "ruralIrrigante";
        }
        if (!fatura || !fatura.numero_uc) {
          fatura = await extrairDadosBranca(pdfData, arquivo);
          tipo = "branca";
        }

        setProgress(90);
        options?.onProgress?.(90);

        const success = !!fatura && !!fatura.numero_uc;
        const result: ExtractionResult = {
          success,
          fatura: fatura as Fatura | null,
          tipo: success ? tipo : undefined,
          arquivoNome: arquivo,
          dataExtracao: new Date().toISOString(),
          rawLines,
        };

        if (!result.success) {
          result.error = `Não foi possível extrair dados válidos de ${arquivo}`;
          options?.onError?.(result.error);
        } else {
          options?.onSuccess?.(result);
        }

        setProgress(100);
        options?.onProgress?.(100);

        return result;
      } catch (err) {
        const errorMsg = `Erro ao extrair ${arquivo}: ${err instanceof Error ? err.message : String(err)}`;
        setError(errorMsg);
        options?.onError?.(errorMsg);

        return {
          success: false,
          fatura: null,
          error: errorMsg,
          arquivoNome: arquivo,
          dataExtracao: new Date().toISOString(),
        };
      }
    },
    [options],
  );

  /**
   * Processa múltiplos arquivos PDF
   */
  const processMultipleFiles = useCallback(
    async (files: File[]): Promise<ExtractionResult[]> => {
      try {
        setLoading(true);
        resetState();

        const results: ExtractionResult[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const progressPercentage = (i / files.length) * 100;
          setProgress(progressPercentage);
          options?.onProgress?.(progressPercentage);

          try {
            const result = await detectAndExtract(file, file.name);
            results.push(result);
          } catch (err) {
            const errorMsg = `Erro ao processar ${file.name}: ${err instanceof Error ? err.message : String(err)}`;
            results.push({
              success: false,
              fatura: null,
              error: errorMsg,
              arquivoNome: file.name,
              dataExtracao: new Date().toISOString(),
            });
          }
        }

        setResults(results);
        setProgress(100);
        options?.onProgress?.(100);

        return results;
      } catch (err) {
        const errorMsg = `Erro ao processar múltiplos arquivos: ${err instanceof Error ? err.message : String(err)}`;
        setError(errorMsg);
        options?.onError?.(errorMsg);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [resetState, detectAndExtract, options],
  );

  /**
   * Processa um único arquivo PDF
   */
  const processSingleFile = useCallback(
    async (file: File): Promise<ExtractionResult | null> => {
      try {
        setLoading(true);
        resetState();

        const result = await detectAndExtract(file, file.name);

        setResults([result]);
        setProgress(100);
        options?.onProgress?.(100);

        return result;
      } catch (err) {
        const errorMsg = `Erro ao processar ${file.name}: ${err instanceof Error ? err.message : String(err)}`;
        setError(errorMsg);
        options?.onError?.(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [resetState, detectAndExtract, options],
  );

  /**
   * Obtém estatísticas dos resultados
   */
  const getStatistics = useCallback(() => {
    const total = results.length;
    const successCount = results.filter((r) => r.success).length;
    const errorCount = total - successCount;
    const successRate = total > 0 ? (successCount / total) * 100 : 0;

    const byType = {
      grupoA: results.filter((r) => r.tipo === "grupoA" && r.success).length,
      grupoB: results.filter((r) => r.tipo === "grupoB" && r.success).length,
      ruralIrrigante: results.filter(
        (r) => r.tipo === "ruralIrrigante" && r.success,
      ).length,
      branca: results.filter((r) => r.tipo === "branca" && r.success).length,
    };

    return {
      total,
      successCount,
      errorCount,
      successRate,
      byType,
    };
  }, [results]);

  /**
   * Reseta todos os resultados
   */
  const clearResults = useCallback(() => {
    setResults([]);
    resetState();
  }, [resetState]);

  return {
    loading,
    progress,
    error,
    results,
    processSingleFile,
    processMultipleFiles,
    detectAndExtract,
    getStatistics,
    clearResults,
    resetState,
  };
}
