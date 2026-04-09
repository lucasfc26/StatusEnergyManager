import { useState } from "react";
import { useStore } from "../../store";
import {
  FileText,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import { Fatura } from "../../types";

export function ResumoExtracoes() {
  const { clientes, ucs, faturas, updateFatura } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCliente, setFilterCliente] = useState("");

  const filteredFaturas = faturas
    .filter((f) => {
      const cliente = clientes.find((c) => c.id === f.cliente_id);
      const uc = ucs.find((u) => u.id === f.uc_id);

      const matchesSearch =
        cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uc?.numero_uc.includes(searchTerm);
      const matchesStatus = !filterStatus || f.status === filterStatus;
      const matchesCliente = !filterCliente || f.cliente_id === filterCliente;

      return matchesSearch && matchesStatus && matchesCliente;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  const getClienteName = (clienteId: string) => {
    return clientes.find((c) => c.id === clienteId)?.nome || "N/A";
  };

  const getUC = (ucId: string) => {
    return ucs.find((u) => u.id === ucId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Extraída":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Paga":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case "Pendente":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "Erro":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleRetry = (fatura: Fatura) => {
    updateFatura(fatura.id, { status: "Pendente" });
  };

  const totalExtraidas = faturas.filter((f) => f.status === "Extraída").length;
  const totalPendentes = faturas.filter((f) => f.status === "Pendente").length;
  const totalErros = faturas.filter((f) => f.status === "Erro").length;
  const totalPagas = faturas.filter((f) => f.status === "Paga").length;
  const valorTotal = faturas.reduce((acc, f) => acc + f.valor_total, 0);
  const economiaTotal = faturas.reduce((acc, f) => acc + f.valor_compensado, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Extrações de Faturas
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Acompanhe todas as faturas extraídas do sistema
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {faturas.length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-2xl font-bold text-green-600">{totalExtraidas}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Extraídas</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-2xl font-bold text-yellow-600">{totalPendentes}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pendentes</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-2xl font-bold text-red-600">{totalErros}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Erros</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-2xl font-bold text-blue-600">{totalPagas}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pagas</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-2xl font-bold text-emerald-600">
            R${" "}
            {valorTotal.toLocaleString("pt-BR", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Valor Total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente ou UC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-12 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-40 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-12 pr-4 py-3 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none appearance-none"
          >
            <option value="">Status</option>
            <option value="Extraída">Extraída</option>
            <option value="Pendente">Pendente</option>
            <option value="Erro">Erro</option>
            <option value="Paga">Paga</option>
          </select>
        </div>
        <div className="relative">
          <select
            value={filterCliente}
            onChange={(e) => setFilterCliente(e.target.value)}
            className="w-full sm:w-48 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none appearance-none"
          >
            <option value="">Todos clientes</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  UC
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Referência
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vencimento
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Consumo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Economia
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredFaturas.map((fatura) => {
                const uc = getUC(fatura.uc_id);
                return (
                  <tr
                    key={fatura.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(fatura.status)}
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            fatura.status === "Extraída"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : fatura.status === "Paga"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : fatura.status === "Pendente"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {fatura.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getClienteName(fatura.cliente_id)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-mono text-sm text-gray-900 dark:text-white">
                          {uc?.numero_uc}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {uc?.distribuidora}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {fatura.mes_referencia}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {new Date(fatura.data_vencimento).toLocaleDateString(
                        "pt-BR",
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {fatura.energia_kwh.toLocaleString("pt-BR")} kWh
                        </p>
                        {fatura.energia_compensada_kwh > 0 && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            -
                            {fatura.energia_compensada_kwh.toLocaleString(
                              "pt-BR",
                            )}{" "}
                            kWh compensados
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        R${" "}
                        {fatura.valor_total.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {fatura.valor_compensado > 0 ? (
                        <p className="font-medium text-green-600 dark:text-green-400">
                          R${" "}
                          {fatura.valor_compensado.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {fatura.status === "Erro" && (
                          <button
                            onClick={() => handleRetry(fatura)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400 transition-colors"
                            title="Tentar novamente"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredFaturas.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma fatura encontrada
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Economia Total Gerada</h3>
            <p className="text-emerald-100">
              Soma de toda energia compensada nas faturas
            </p>
          </div>
          <div className="text-3xl font-bold">
            R${" "}
            {economiaTotal.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
