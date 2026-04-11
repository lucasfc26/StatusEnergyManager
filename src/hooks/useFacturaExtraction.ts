import { useState, useCallback } from "react";
import {
  extractTextFromPdfDetect,
  extrairUCRobusto,
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
   * Abre o PDF, lê as linhas e extrai a UC.
   * A classificação e extração dos demais campos são feitas pelo backend.
   */
  const detectAndExtract = useCallback(
    async (
      pdfData: Blob | File | ArrayBuffer,
      arquivo: string,
    ): Promise<ExtractionResult> => {
      try {
        setProgress(10);
        options?.onProgress?.(10);

        const linhas = await extractTextFromPdfDetect(pdfData, arquivo);

        setProgress(50);
        options?.onProgress?.(50);

        const unidade = extrairUCRobusto(linhas);

        const textoCompleto = linhas.join(" ").toUpperCase();

        // Detecta tipo para classificação informativa
        const isGrupoB =
          textoCompleto.includes("B1 RESIDENCIAL") ||
          textoCompleto.includes("B1 RESIDENCIAL-CONV") ||
          /\bB[1234]\s/.test(textoCompleto);

        const isRural = !isGrupoB && textoCompleto.includes("RURAL IRRIGANTE");
        const isBranca = !isGrupoB && textoCompleto.includes("TARIFA BRANCA");
        const isGrupoA =
          !isGrupoB &&
          (textoCompleto.includes("DEMANDA G ") ||
            textoCompleto.includes("DEMANDA FORA PONTA") ||
            textoCompleto.includes("TUSD HFP ") ||
            textoCompleto.includes("TUSD FP ") ||
            /CONSUMO\s+FORA\s+PONTA/.test(textoCompleto));

        let tipo: ExtractionResult["tipo"];
        if (isGrupoB) tipo = "grupoB";
        else if (isRural) tipo = "ruralIrrigante";
        else if (isBranca) tipo = "branca";
        else if (isGrupoA) tipo = "grupoA";
        else tipo = "grupoB";

        setProgress(90);
        options?.onProgress?.(90);

        const success = !!unidade;

        const fatura: Partial<Fatura> = { unidade };

        const result: ExtractionResult = {
          success,
          fatura: success ? (fatura as Fatura) : null,
          tipo: success ? tipo : undefined,
          arquivoNome: arquivo,
          dataExtracao: new Date().toISOString(),
          rawLines: linhas,
        };

        if (!result.success) {
          result.error = `Não foi possível extrair UC válida de ${arquivo}`;
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

        const allResults: ExtractionResult[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const progressPercentage = (i / files.length) * 100;
          setProgress(progressPercentage);
          options?.onProgress?.(progressPercentage);

          try {
            const result = await detectAndExtract(file, file.name);
            allResults.push(result);
          } catch (err) {
            const errorMsg = `Erro ao processar ${file.name}: ${err instanceof Error ? err.message : String(err)}`;
            allResults.push({
              success: false,
              fatura: null,
              error: errorMsg,
              arquivoNome: file.name,
              dataExtracao: new Date().toISOString(),
            });
          }
        }

        setResults(allResults);
        setProgress(100);
        options?.onProgress?.(100);

        return allResults;
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

    return { total, successCount, errorCount, successRate, byType };
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
