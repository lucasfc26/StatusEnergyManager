import { useState } from "react";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Loader,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { useFacturaExtraction } from "../../hooks/useFacturaExtraction";
import type { ExtractionResult } from "../../types/faturas";

export function ExemploProcessamentoFaturas() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [expandedResults, setExpandedResults] = useState<Set<number>>(
    new Set(),
  );
  const [expandedRaw, setExpandedRaw] = useState<Set<number>>(new Set());
  const {
    loading,
    progress,
    error,
    results,
    processMultipleFiles,
    getStatistics,
    clearResults,
  } = useFacturaExtraction({
    onProgress: (p) => console.log(`Progresso: ${p}%`),
    onError: (e) => console.error(`Erro: ${e}`),
    onSuccess: (r) => console.log(`Sucesso: ${r.arquivoNome}`),
  });

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedResults(newExpanded);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (file) => file.type === "application/pdf",
    );
    setSelectedFiles(files);
  };

  const handleProcess = async () => {
    if (selectedFiles.length === 0) return;
    await processMultipleFiles(selectedFiles);
  };

  const stats = getStatistics();

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Processamento de Faturas</h2>

      {/* Upload de Arquivos */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="mx-auto mb-4 text-gray-400" size={40} />
        <label className="cursor-pointer">
          <span className="text-lg font-semibold text-blue-600">
            Clique para selecionar arquivos
          </span>
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={loading}
          />
        </label>
        <p className="text-gray-500 mt-2">ou arraste arquivos PDF aqui</p>
      </div>

      {/* Arquivos Selecionados */}
      {selectedFiles.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">
            {selectedFiles.length} arquivo(s) selecionado(s)
          </h3>
          <ul className="space-y-2">
            {selectedFiles.map((file, i) => (
              <li key={i} className="text-sm text-gray-700">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Botão de Processar */}
      <button
        onClick={handleProcess}
        disabled={loading || selectedFiles.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
      >
        {loading ? (
          <>
            <Loader className="inline animate-spin mr-2" size={20} />
            Processando... {progress}%
          </>
        ) : (
          `Processar ${selectedFiles.length} Arquivo(s)`
        )}
      </button>

      {/* Barra de Progresso */}
      {loading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Mensagem de Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Estatísticas */}
      {results.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            Resumo do Processamento
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total de Arquivos</p>
              <p className="text-xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div>
              <p className="text-gray-600">Processados com Sucesso</p>
              <p className="text-xl font-bold text-green-600">
                {stats.successCount}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Com Erro</p>
              <p className="text-xl font-bold text-red-600">
                {stats.errorCount}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Taxa de Sucesso</p>
              <p className="text-xl font-bold text-purple-600">
                {stats.successRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Distribuição por Tipo */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-gray-600 text-sm mb-2">Distribuição por Tipo:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>Grupo A: {stats.byType.grupoA}</div>
              <div>Grupo B: {stats.byType.grupoB}</div>
              <div>Rural Irrigante: {stats.byType.ruralIrrigante}</div>
              <div>Branca: {stats.byType.branca}</div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Resultados */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Resultados</h3>
            <button
              onClick={clearResults}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Limpar
            </button>
          </div>

          {results.map((result, i) => (
            <ResultadoItem
              key={i}
              index={i}
              result={result}
              isExpanded={expandedResults.has(i)}
              onToggle={() => toggleExpand(i)}
              isRawExpanded={expandedRaw.has(i)}
              onToggleRaw={() => {
                const s = new Set(expandedRaw);
                s.has(i) ? s.delete(i) : s.add(i);
                setExpandedRaw(s);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ResultadoItem({
  index,
  result,
  isExpanded,
  onToggle,
  isRawExpanded,
  onToggleRaw,
}: {
  index: number;
  result: ExtractionResult;
  isExpanded: boolean;
  onToggle: () => void;
  isRawExpanded: boolean;
  onToggleRaw: () => void;
}) {
  return (
    <div
      className={`
        border rounded-lg transition
        ${
          result.success
            ? "border-green-300 bg-green-50"
            : "border-red-300 bg-red-50"
        }
      `}
    >
      <button
        onClick={onToggle}
        className="w-full text-left p-4 hover:opacity-80 transition"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle className="text-green-600" size={20} />
              ) : (
                <AlertCircle className="text-red-600" size={20} />
              )}
              <span className="font-semibold">{result.arquivoNome}</span>
            </div>

            {result.success && result.fatura ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">UC</p>
                  <p className="font-mono font-semibold">
                    {result.fatura.numero_uc}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Mês</p>
                  <p className="font-semibold">
                    {result.fatura.mes_referencia}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Tipo</p>
                  <p className="font-semibold uppercase">{result.tipo}</p>
                </div>
                <div>
                  <p className="text-gray-600">Data de Extração</p>
                  <p className="text-xs">
                    {new Date(result.dataExtracao || "").toLocaleDateString(
                      "pt-BR",
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-red-800 text-sm">{result.error}</p>
            )}
          </div>

          {/* Ícone de Expand */}
          {result.success && (
            <div className="ml-4">
              {isExpanded ? (
                <ChevronUp className="text-blue-600" size={24} />
              ) : (
                <ChevronDown className="text-blue-600" size={24} />
              )}
            </div>
          )}
        </div>
      </button>

      {/* Tabela de Detalhes */}
      {isExpanded && result.success && result.fatura && (
        <div className="border-t border-green-200 p-4 bg-white bg-opacity-50">
          <TabelaDetalhes fatura={result.fatura} tipo={result.tipo} />
        </div>
      )}

      {/* Painel de Debug — linhas brutas do PDF */}
      {result.rawLines && result.rawLines.length > 0 && (
        <div className="border-t border-gray-200">
          <button
            onClick={onToggleRaw}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-500 hover:bg-gray-50 transition"
          >
            <FileText size={14} />
            {isRawExpanded ? "Ocultar" : "Ver"} texto extraído do PDF (
            {result.rawLines.length} linhas)
            {isRawExpanded ? (
              <ChevronUp size={14} className="ml-auto" />
            ) : (
              <ChevronDown size={14} className="ml-auto" />
            )}
          </button>

          {isRawExpanded && (
            <div className="px-4 pb-4">
              <div className="bg-gray-900 text-gray-100 rounded-lg p-3 overflow-auto max-h-96 text-xs font-mono">
                {result.rawLines.map((linha, i) => (
                  <div key={i} className="flex gap-3 hover:bg-gray-800 px-1">
                    <span className="text-gray-500 select-none w-8 text-right flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="break-all">{linha}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface TabelaDetalhesProps {
  fatura: any;
  tipo?: string;
}

function TabelaDetalhes({ fatura, tipo }: TabelaDetalhesProps) {
  if (tipo === "grupoB") {
    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-green-900">Detalhes - Grupo B</h4>

        {/* Dados Básicos */}
        <div>
          <h5 className="text-sm font-semibold text-gray-700 mb-2">
            Dados Básicos
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="bg-white p-2 rounded">
              <p className="text-gray-600">UC</p>
              <p className="font-semibold">{fatura.numero_uc}</p>
            </div>
            <div className="bg-white p-2 rounded">
              <p className="text-gray-600">Mês</p>
              <p className="font-semibold">{fatura.mes_referencia}</p>
            </div>
            <div className="bg-white p-2 rounded">
              <p className="text-gray-600">Data Leitura</p>
              <p className="font-semibold">{fatura.data_leitura}</p>
            </div>
          </div>
        </div>

        {/* Consumo e Energia */}
        <div>
          <h5 className="text-sm font-semibold text-gray-700 mb-2">
            Consumo e Energia
          </h5>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse bg-white">
              <thead className="bg-green-100">
                <tr>
                  <th className="border border-green-300 p-2 text-left">
                    Campo
                  </th>
                  <th className="border border-green-300 p-2 text-right">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-green-50">
                  <td className="border border-green-300 p-2">Consumo (kWh)</td>
                  <td className="border border-green-300 p-2 text-right font-mono">
                    {fatura.consumo?.toFixed(2) || "-"}
                  </td>
                </tr>
                <tr className="hover:bg-green-50">
                  <td className="border border-green-300 p-2">
                    Energia Injetada (kWh)
                  </td>
                  <td className="border border-green-300 p-2 text-right font-mono">
                    {fatura.energia_injetada?.toFixed(2) || "-"}
                  </td>
                </tr>
                <tr className="hover:bg-green-50">
                  <td className="border border-green-300 p-2">
                    Crédito Utilizado (kWh)
                  </td>
                  <td className="border border-green-300 p-2 text-right font-mono">
                    {fatura.credito_utilizado?.toFixed(2) || "-"}
                  </td>
                </tr>
                <tr className="hover:bg-green-50">
                  <td className="border border-green-300 p-2">
                    Saldo Atualizado (kWh)
                  </td>
                  <td className="border border-green-300 p-2 text-right font-mono">
                    {fatura.saldo_atualizado?.toFixed(2) || "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tarifas */}
        <div>
          <h5 className="text-sm font-semibold text-gray-700 mb-2">Tarifas</h5>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse bg-white">
              <thead className="bg-green-100">
                <tr>
                  <th className="border border-green-300 p-2 text-left">
                    Tarifa
                  </th>
                  <th className="border border-green-300 p-2 text-right">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-green-50">
                  <td className="border border-green-300 p-2">TE (R$/kWh)</td>
                  <td className="border border-green-300 p-2 text-right font-mono">
                    {fatura.tarifa_cons_te?.toFixed(6) || "-"}
                  </td>
                </tr>
                <tr className="hover:bg-green-50">
                  <td className="border border-green-300 p-2">TUSD (R$/kWh)</td>
                  <td className="border border-green-300 p-2 text-right font-mono">
                    {fatura.tarifa_cons_tusd?.toFixed(6) || "-"}
                  </td>
                </tr>
                <tr className="hover:bg-green-50">
                  <td className="border border-green-300 p-2">
                    Comp. TE (R$/kWh)
                  </td>
                  <td className="border border-green-300 p-2 text-right font-mono">
                    {fatura.tarifa_comp_te?.toFixed(6) || "-"}
                  </td>
                </tr>
                <tr className="hover:bg-green-50">
                  <td className="border border-green-300 p-2">
                    Comp. TUSD (R$/kWh)
                  </td>
                  <td className="border border-green-300 p-2 text-right font-mono">
                    {fatura.tarifa_comp_tusd?.toFixed(6) || "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Financeiro */}
        <div>
          <h5 className="text-sm font-semibold text-gray-700 mb-2">
            Financeiro
          </h5>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse bg-white">
              <thead className="bg-green-100">
                <tr>
                  <th className="border border-green-300 p-2 text-left">
                    Campo
                  </th>
                  <th className="border border-green-300 p-2 text-right">
                    Valor (R$)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-green-50">
                  <td className="border border-green-300 p-2">
                    Subtotal Faturamento
                  </td>
                  <td className="border border-green-300 p-2 text-right font-mono">
                    {fatura.subtotal_faturamento?.toFixed(2) || "-"}
                  </td>
                </tr>
                <tr className="hover:bg-green-50">
                  <td className="border border-green-300 p-2">
                    Subtotal Outros
                  </td>
                  <td className="border border-green-300 p-2 text-right font-mono">
                    {fatura.subtotal_outros?.toFixed(2) || "-"}
                  </td>
                </tr>
                <tr className="hover:bg-green-50">
                  <td className="border border-green-300 p-2">PIS/PASEP</td>
                  <td className="border border-green-300 p-2 text-right font-mono">
                    {fatura.pis_pasep?.toFixed(2) || "-"}
                  </td>
                </tr>
                <tr className="hover:bg-green-50">
                  <td className="border border-green-300 p-2">COFINS</td>
                  <td className="border border-green-300 p-2 text-right font-mono">
                    {fatura.cofins?.toFixed(2) || "-"}
                  </td>
                </tr>
                <tr className="hover:bg-green-50">
                  <td className="border border-green-300 p-2">ICMS</td>
                  <td className="border border-green-300 p-2 text-right font-mono">
                    {fatura.icms?.toFixed(2) || "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Para Grupo A, Rural Irrigante e Branca
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-green-900">
        Detalhes - {tipo?.toUpperCase() || "GRUPO A"}
      </h4>

      {/* Dados Básicos */}
      <div>
        <h5 className="text-sm font-semibold text-gray-700 mb-2">
          Dados Básicos
        </h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="bg-white p-2 rounded">
            <p className="text-gray-600">UC</p>
            <p className="font-semibold">{fatura.numero_uc}</p>
          </div>
          <div className="bg-white p-2 rounded">
            <p className="text-gray-600">Mês</p>
            <p className="font-semibold">{fatura.mes_referencia}</p>
          </div>
          <div className="bg-white p-2 rounded">
            <p className="text-gray-600">Data Leitura</p>
            <p className="font-semibold">{fatura.data_leitura}</p>
          </div>
        </div>
      </div>

      {/* Consumo por Período */}
      <div>
        <h5 className="text-sm font-semibold text-gray-700 mb-2">
          Consumo por Período
        </h5>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse bg-white">
            <thead className="bg-green-100">
              <tr>
                <th className="border border-green-300 p-2 text-left">
                  Período
                </th>
                <th className="border border-green-300 p-2 text-right">
                  Consumo (kWh)
                </th>
                <th className="border border-green-300 p-2 text-right">
                  Energia Injetada (kWh)
                </th>
                <th className="border border-green-300 p-2 text-right">
                  Saldo (kWh)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-green-50">
                <td className="border border-green-300 p-2 font-semibold">
                  Fora Ponta (FP)
                </td>
                <td className="border border-green-300 p-2 text-right font-mono">
                  {fatura.consumo_fp?.toFixed(2) || "-"}
                </td>
                <td className="border border-green-300 p-2 text-right font-mono">
                  {fatura.energia_injetada_fp?.toFixed(2) || "-"}
                </td>
                <td className="border border-green-300 p-2 text-right font-mono">
                  {fatura.saldo_atualizado_fp?.toFixed(2) || "-"}
                </td>
              </tr>
              <tr className="hover:bg-green-50">
                <td className="border border-green-300 p-2 font-semibold">
                  Ponta
                </td>
                <td className="border border-green-300 p-2 text-right font-mono">
                  {fatura.consumo_ponta?.toFixed(2) || "-"}
                </td>
                <td className="border border-green-300 p-2 text-right font-mono">
                  {fatura.energia_injetada_ponta?.toFixed(2) || "-"}
                </td>
                <td className="border border-green-300 p-2 text-right font-mono">
                  {fatura.saldo_atualizado_ponta?.toFixed(2) || "-"}
                </td>
              </tr>
              <tr className="hover:bg-green-50">
                <td className="border border-green-300 p-2 font-semibold">
                  Reservado
                </td>
                <td className="border border-green-300 p-2 text-right font-mono">
                  {fatura.consumo_reservado?.toFixed(2) || "-"}
                </td>
                <td className="border border-green-300 p-2 text-right font-mono">
                  {fatura.energia_injetada_reservado?.toFixed(2) || "-"}
                </td>
                <td className="border border-green-300 p-2 text-right font-mono">
                  {fatura.saldo_atualizado_reservado?.toFixed(2) || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Demandas */}
      <div>
        <h5 className="text-sm font-semibold text-gray-700 mb-2">Demandas</h5>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse bg-white">
            <thead className="bg-green-100">
              <tr>
                <th className="border border-green-300 p-2 text-left">Tipo</th>
                <th className="border border-green-300 p-2 text-right">
                  Valor (kW)
                </th>
                <th className="border border-green-300 p-2 text-right">
                  Tarifa
                </th>
              </tr>
            </thead>
            <tbody>
              {fatura.demanda_fp > 0 && (
                <tr className="hover:bg-green-50">
                  <td className="border border-green-300 p-2">
                    Demanda Fora Ponta
                  </td>
                  <td className="border border-green-300 p-2 text-right font-mono">
                    {fatura.demanda_fp?.toFixed(2) || "-"}
                  </td>
                  <td className="border border-green-300 p-2 text-right font-mono">
                    {fatura.tarifa_demanda_fp?.toFixed(6) || "-"}
                  </td>
                </tr>
              )}
              {fatura.demanda_ponta > 0 && (
                <tr className="hover:bg-green-50">
                  <td className="border border-green-300 p-2">Demanda Ponta</td>
                  <td className="border border-green-300 p-2 text-right font-mono">
                    {fatura.demanda_ponta?.toFixed(2) || "-"}
                  </td>
                  <td className="border border-green-300 p-2 text-right font-mono">
                    {fatura.tarifa_demanda_ponta?.toFixed(6) || "-"}
                  </td>
                </tr>
              )}
              {fatura.demanda_g > 0 && (
                <tr className="hover:bg-green-50">
                  <td className="border border-green-300 p-2">
                    Demanda de Geração
                  </td>
                  <td className="border border-green-300 p-2 text-right font-mono">
                    {fatura.demanda_g?.toFixed(2) || "-"}
                  </td>
                  <td className="border border-green-300 p-2 text-right font-mono">
                    {fatura.tarifa_demanda_g?.toFixed(6) || "-"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financeiro */}
      <div>
        <h5 className="text-sm font-semibold text-gray-700 mb-2">Financeiro</h5>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse bg-white">
            <thead className="bg-green-100">
              <tr>
                <th className="border border-green-300 p-2 text-left">Campo</th>
                <th className="border border-green-300 p-2 text-right">
                  Valor (R$)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-green-50">
                <td className="border border-green-300 p-2">
                  Subtotal Faturamento
                </td>
                <td className="border border-green-300 p-2 text-right font-mono">
                  {fatura.subtotal_faturamento?.toFixed(2) || "-"}
                </td>
              </tr>
              <tr className="hover:bg-green-50">
                <td className="border border-green-300 p-2">Subtotal Outros</td>
                <td className="border border-green-300 p-2 text-right font-mono">
                  {fatura.subtotal_outros?.toFixed(2) || "-"}
                </td>
              </tr>
              <tr className="hover:bg-green-50">
                <td className="border border-green-300 p-2">Benefício Bruto</td>
                <td className="border border-green-300 p-2 text-right font-mono">
                  {fatura.beneficio_bruto?.toFixed(2) || "-"}
                </td>
              </tr>
              <tr className="hover:bg-green-50">
                <td className="border border-green-300 p-2">
                  Benefício Líquido
                </td>
                <td className="border border-green-300 p-2 text-right font-mono">
                  {fatura.beneficio_liquido?.toFixed(2) || "-"}
                </td>
              </tr>
              <tr className="hover:bg-green-50">
                <td className="border border-green-300 p-2">PIS/PASEP</td>
                <td className="border border-green-300 p-2 text-right font-mono">
                  {fatura.pis_pasep?.toFixed(2) || "-"}
                </td>
              </tr>
              <tr className="hover:bg-green-50">
                <td className="border border-green-300 p-2">COFINS</td>
                <td className="border border-green-300 p-2 text-right font-mono">
                  {fatura.cofins?.toFixed(2) || "-"}
                </td>
              </tr>
              <tr className="hover:bg-green-50">
                <td className="border border-green-300 p-2">ICMS</td>
                <td className="border border-green-300 p-2 text-right font-mono">
                  {fatura.icms?.toFixed(2) || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
