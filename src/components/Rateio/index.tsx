import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { UnidadeConsumidora, Cliente, Rateio } from "@/types";
import { cn } from "@/utils/cn";
import { Plus, Trash2, Save, X } from "lucide-react";
import { toast } from "@/utils/toast";

interface RateioBeneficiaria {
  uc_id: string;
  percentual: number;
  ucData?: UnidadeConsumidora;
}

interface RateioForm {
  gerador_id: string;
  beneficiarias: RateioBeneficiaria[];
}

interface GeradoraComCliente extends UnidadeConsumidora {
  cliente?: Cliente;
}

export default function RateioPage() {
  const [geradoras, setGeradoras] = useState<GeradoraComCliente[]>([]);
  const [unidadesMap, setUnidadesMap] = useState<
    Map<string, UnidadeConsumidora>
  >(new Map());
  const [rateios, setRateios] = useState<Rateio[]>([]);
  const [loading, setLoading] = useState(true);
  const [rateioForm, setRateioForm] = useState<RateioForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRateio, setEditingRateio] = useState<string | null>(null);

  // Carregar dados ao montar o componente
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.id) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Buscar todos os clientes do usuário
      const { data: clientesData, error: clientesError } = await supabase
        .from("clientes")
        .select("*")
        .eq("user_id", userData.user.id);

      if (clientesError) throw clientesError;

      if (!clientesData || clientesData.length === 0) {
        toast.error("Nenhum cliente encontrado");
        setLoading(false);
        return;
      }

      // Para cada cliente, buscar suas unidades
      const clientesMap = new Map(clientesData.map((c) => [c.id, c]));
      const todasAsUnidades: UnidadeConsumidora[] = [];
      const todasAsGeradoras: GeradoraComCliente[] = [];
      const unidadesMapLocal = new Map<string, UnidadeConsumidora>();

      for (const cliente of clientesData) {
        const { data: unidadesData, error: unidadesError } = await supabase
          .from("unidades_consumidoras")
          .select("*")
          .eq("cliente_id", cliente.id)
          .order("numero_uc");

        if (unidadesError) throw unidadesError;

        if (unidadesData) {
          unidadesData.forEach((uc) => {
            unidadesMapLocal.set(uc.id, uc);
            todasAsUnidades.push(uc);
          });

          // Filtrar geradoras e adicionar informação do cliente
          const geradorasDoCliente = unidadesData
            .filter((uc) => uc.tipo_uc === "Geradora")
            .map((uc) => ({
              ...uc,
              cliente: cliente,
            }));

          todasAsGeradoras.push(...geradorasDoCliente);
        }
      }

      setGeradoras(todasAsGeradoras);
      setUnidadesMap(unidadesMapLocal);

      // Carregar todos os rateios
      await carregarRateios();
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const carregarRateios = async () => {
    try {
      const { data: rateiosData, error: rateiosError } = await supabase
        .from("rateios")
        .select("*")
        .order("created_at", { ascending: false });

      if (rateiosError) throw rateiosError;
      setRateios(rateiosData || []);
    } catch (err) {
      console.error("Erro ao carregar rateios:", err);
    }
  };

  const iniciarNovoRateio = (geradorId: string) => {
    setRateioForm({
      gerador_id: geradorId,
      beneficiarias: [],
    });
    setEditingRateio(geradorId);
  };

  const editarRateioExistente = (geradorId: string) => {
    const rateio = rateios.find((r) => r.geradora_id === geradorId);
    if (!rateio) return;

    // Montar formulário com dados existentes
    const beneficiariasForm = rateio.beneficiarias_ucs.map((ucId, idx) => ({
      uc_id: ucId,
      percentual: Number(rateio.beneficiarias_rateios[idx]) || 0,
      ucData: unidadesMap.get(ucId),
    }));

    setRateioForm({
      gerador_id: geradorId,
      beneficiarias: beneficiariasForm,
    });
    setEditingRateio(geradorId);
  };

  const adicionarBeneficiaria = () => {
    if (!rateioForm) return;
    setRateioForm({
      ...rateioForm,
      beneficiarias: [
        ...rateioForm.beneficiarias,
        { uc_id: "", percentual: 0, ucData: undefined },
      ],
    });
  };

  const removerBeneficiaria = (index: number) => {
    if (!rateioForm) return;
    setRateioForm({
      ...rateioForm,
      beneficiarias: rateioForm.beneficiarias.filter((_, i) => i !== index),
    });
  };

  const atualizarBeneficiaria = (
    index: number,
    field: "uc_id" | "percentual",
    value: string | number,
  ) => {
    if (!rateioForm) return;
    const novasBeneficiarias = [...rateioForm.beneficiarias];

    if (field === "uc_id") {
      const ucSelecionada = unidadesMap.get(value as string);
      novasBeneficiarias[index].uc_id = value as string;
      novasBeneficiarias[index].ucData = ucSelecionada;
    } else {
      novasBeneficiarias[index].percentual = Math.min(
        100,
        Math.max(0, number(value)),
      );
    }

    setRateioForm({
      ...rateioForm,
      beneficiarias: novasBeneficiarias,
    });
  };

  const number = (value: string | number): number => {
    const num = new Number(value).valueOf();
    return isNaN(num) ? 0 : num;
  };

  const getMesAnoFromDate = (date: Date): string => {
    // Retorna string no formato YYYY-MM para comparação
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const salvarRateio = async () => {
    if (!rateioForm) return;

    const geradora = geradoras.find((g) => g.id === rateioForm.gerador_id);
    if (!geradora) return;

    const totalPercentual = rateioForm.beneficiarias.reduce(
      (sum, b) => sum + b.percentual,
      0,
    );

    if (totalPercentual > 100) {
      toast.error("A soma dos percentuais não pode exceder 100%");
      return;
    }

    if (rateioForm.beneficiarias.length === 0) {
      toast.error("Adicione pelo menos uma beneficiária");
      return;
    }

    if (rateioForm.beneficiarias.some((b) => !b.uc_id)) {
      toast.error("Selecione uma UC para todas as beneficiárias");
      return;
    }

    try {
      setIsSaving(true);
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user?.id) {
        toast.error("Usuário não autenticado");
        return;
      }

      const agora = new Date();
      const mesAnoAtual = getMesAnoFromDate(agora);

      // Buscar rateio existente para a mesma geradora no mesmo mês/ano
      const { data: rateioExistente, error: searchError } = await supabase
        .from("rateios")
        .select("id, data_atual")
        .eq("geradora_id", rateioForm.gerador_id)
        .eq("cliente_id", geradora.cliente_id)
        .order("data_atual", { ascending: false })
        .limit(1);

      if (searchError) throw searchError;

      // Verificar se o rateio mais recente é do mesmo mês/ano
      let deveAtualizar = false;
      let rateioIdParaAtualizar: string | null = null;

      if (rateioExistente && rateioExistente.length > 0) {
        const ultimoRateio = rateioExistente[0];
        const mesAnoUltimo = getMesAnoFromDate(
          new Date(ultimoRateio.data_atual),
        );
        if (mesAnoUltimo === mesAnoAtual) {
          deveAtualizar = true;
          rateioIdParaAtualizar = ultimoRateio.id;
        }
      }

      let error: any;

      if (deveAtualizar && rateioIdParaAtualizar) {
        // Atualizar o rateio existente do mês/ano atual
        const { error: updateError } = await supabase
          .from("rateios")
          .update({
            beneficiarias_ucs: rateioForm.beneficiarias.map((b) => b.uc_id),
            beneficiarias_rateios: rateioForm.beneficiarias.map(
              (b) => b.percentual,
            ),
            data_atual: agora.toISOString(),
          })
          .eq("id", rateioIdParaAtualizar);

        error = updateError;
      } else {
        // Criar novo rateio para o novo mês/ano
        const { error: insertError } = await supabase.from("rateios").insert({
          user_id: userData.user.id,
          cliente_id: geradora.cliente_id,
          geradora_id: rateioForm.gerador_id,
          beneficiarias_ucs: rateioForm.beneficiarias.map((b) => b.uc_id),
          beneficiarias_rateios: rateioForm.beneficiarias.map(
            (b) => b.percentual,
          ),
          data_atual: agora.toISOString(),
        });

        error = insertError;
      }

      if (error) throw error;

      setRateioForm(null);
      setEditingRateio(null);
      await carregarRateios();
      toast.success("Rateio salvo com sucesso");
    } catch (err) {
      console.error("Erro ao salvar rateio:", err);
      toast.error("Erro ao salvar rateio");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelarEdicao = () => {
    setRateioForm(null);
    setEditingRateio(null);
  };

  const deletarRateio = async (rateioId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("rateios")
        .delete()
        .eq("id", rateioId);

      if (deleteError) throw deleteError;

      await carregarRateios();
      toast.success("Rateio deletado com sucesso");
    } catch (err) {
      console.error("Erro ao deletar rateio:", err);
      toast.error("Erro ao deletar rateio");
    }
  };

  const beneficiariasPorGerador = (geradorId: string) => {
    const rateio = rateios.find((r) => r.geradora_id === geradorId);
    if (!rateio) return [];

    return (
      rateio.beneficiarias_ucs?.map((ucId, idx) => {
        const uc = unidadesMap.get(ucId);
        return {
          uc,
          percentual: rateio.beneficiarias_rateios?.[idx] || "0",
        };
      }) || []
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Rateio
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gerenciar distribuição de energia entre geradoras e beneficiárias
          </p>
        </div>

        {/* Cards de Geradoras */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Geradoras</h2>

          {geradoras.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">Nenhuma geradora cadastrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {geradoras.map((geradora) => {
                const beneficiarias = beneficiariasPorGerador(geradora.id);
                const temRateio =
                  rateios.some((r) => r.geradora_id === geradora.id) ||
                  editingRateio === geradora.id;

                return (
                  <div
                    key={geradora.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-emerald-800 dark:to-emerald-900 px-6 py-4">
                      <h3 className="text-lg font-bold text-white mb-1">
                        UC {geradora.numero_uc}
                      </h3>
                      <p className="text-green-100 text-sm mb-2">Geradora</p>
                      {geradora.cliente && (
                        <p className="text-green-50 text-xs">
                          Cliente: {geradora.cliente.nome}
                        </p>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-700">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-3 mb-6">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-300 uppercase tracking-wide">
                              Classe
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {geradora.classe}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-300 uppercase tracking-wide">
                              Localização
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {geradora.cidade}, {geradora.estado}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-300 uppercase tracking-wide">
                              Distribuidor
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {geradora.distribuidora}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-300 uppercase tracking-wide">
                              Grupo Tarifário
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {geradora.grupo_tarifario}
                            </p>
                          </div>

                          {geradora.energia_contratada && (
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-300 uppercase tracking-wide">
                                Energia Contratada
                              </p>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {geradora.energia_contratada.toLocaleString(
                                  "pt-BR",
                                )}{" "}
                                kWh
                              </p>
                            </div>
                          )}
                        </div>
                        {/* Tag de Status */}
                        <div>
                          {(() => {
                            const rateio = rateios.find(
                              (r) => r.geradora_id === geradora.id,
                            );
                            const isAprovado = rateio?.status || false;
                            return (
                              <div
                                className={cn(
                                  "inline-block px-3 py-1 rounded-full text-xs font-semibold",
                                  isAprovado
                                    ? "bg-green-100 text-green-800"
                                    : "bg-orange-100 text-orange-800",
                                )}
                              >
                                {isAprovado ? "✓ Aprovado" : "⊘ Pendente"}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Beneficiárias */}
                      {beneficiarias.length > 0 && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-bold text-gray-900 mb-3">
                            Rateio de {beneficiarias.length} Beneficiária(s)
                          </h4>
                          <div className="space-y-2">
                            {beneficiarias.map((ben, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center text-sm"
                              >
                                <span className="text-gray-700">
                                  UC {ben.uc?.numero_uc || "desconhecida"}
                                </span>
                                <span className="font-semibold text-green-600">
                                  {ben.percentual}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Botão */}
                      {!temRateio && (
                        <button
                          onClick={() => iniciarNovoRateio(geradora.id)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus size={18} />
                          Adicionar Rateio
                        </button>
                      )}

                      {temRateio && editingRateio !== geradora.id && (
                        <div className="space-y-2">
                          {/* Botões */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => editarRateioExistente(geradora.id)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={async () => {
                                const rateio = rateios.find(
                                  (r) => r.geradora_id === geradora.id,
                                );
                                if (!rateio) return;

                                // Se vai aprovar (status é false), validar
                                if (!rateio.status) {
                                  // Validar soma de percentuais
                                  const totalPercentual =
                                    rateio.beneficiarias_rateios.reduce(
                                      (sum, pct) => sum + (Number(pct) || 0),
                                      0,
                                    );

                                  if (totalPercentual !== 100) {
                                    toast.error(
                                      `Não é possível aprovar. A soma dos percentuais é ${totalPercentual}% e deve ser exatamente 100%.`,
                                    );
                                    return;
                                  }

                                  // Validar UCs repetidas
                                  const ucsUniquos = new Set(
                                    rateio.beneficiarias_ucs,
                                  );
                                  if (
                                    ucsUniquos.size !==
                                    rateio.beneficiarias_ucs.length
                                  ) {
                                    toast.error(
                                      "Não é possível aprovar. Há unidades consumidoras repetidas no rateio.",
                                    );
                                    return;
                                  }
                                }

                                try {
                                  const { error: updateError } = await supabase
                                    .from("rateios")
                                    .update({
                                      status: !rateio.status,
                                    })
                                    .eq("id", rateio.id);

                                  if (updateError) throw updateError;

                                  await carregarRateios();
                                  toast.success(
                                    "Status atualizado com sucesso",
                                  );
                                } catch (err) {
                                  console.error(
                                    "Erro ao atualizar status:",
                                    err,
                                  );
                                  toast.error(
                                    "Erro ao atualizar status do rateio",
                                  );
                                }
                              }}
                              className={cn(
                                "flex-1 text-white font-medium py-2 px-4 rounded-lg transition-colors",
                                (() => {
                                  const rateio = rateios.find(
                                    (r) => r.geradora_id === geradora.id,
                                  );
                                  const isAprovado = rateio?.status || false;
                                  return isAprovado
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-green-600 hover:bg-green-700 dark:bg-emerald-800 dark:hover:bg-emerald-900";
                                })(),
                              )}
                            >
                              {(() => {
                                const rateio = rateios.find(
                                  (r) => r.geradora_id === geradora.id,
                                );
                                const isAprovado = rateio?.status || false;
                                return isAprovado ? "Desaprovar" : "Aprovar";
                              })()}
                            </button>
                          </div>
                        </div>
                      )}

                      {editingRateio === geradora.id && rateioForm && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800 font-medium">
                            Editando rateio...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Formulário de Rateio */}
        {rateioForm && editingRateio && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-green-600 dark:bg-emerald-800 text-white px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-bold">Adicionar Rateio</h3>
                <button
                  onClick={cancelarEdicao}
                  className="text-white hover:bg-green-700 dark:hover:bg-emerald-900 p-1 rounded"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                {/* Geradora selecionada */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Geradora
                  </label>
                  <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      {
                        geradoras.find((g) => g.id === rateioForm.gerador_id)
                          ?.numero_uc
                      }
                    </p>
                  </div>
                </div>

                {/* Tabela de Beneficiárias */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      Beneficiárias
                    </h4>
                    <button
                      onClick={adicionarBeneficiaria}
                      className="bg-green-600 hover:bg-green-700 dark:bg-emerald-800 dark:hover:bg-emerald-900 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Adicionar Beneficiária
                    </button>
                  </div>

                  {rateioForm.beneficiarias.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                      <p className="text-gray-500 dark:text-gray-400">
                        Clique em "Adicionar Beneficiária" para começar
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rateioForm.beneficiarias.map((beneficiaria, idx) => (
                        <div
                          key={idx}
                          className="flex gap-4 items-end bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          {/* Seletor de UC */}
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Unidade Consumidora
                            </label>
                            <select
                              value={beneficiaria.uc_id}
                              onChange={(e) =>
                                atualizarBeneficiaria(
                                  idx,
                                  "uc_id",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="">Selecione uma UC...</option>
                              {Array.from(unidadesMap.values())
                                .filter((uc) => {
                                  const gerador = geradoras.find(
                                    (g) => g.id === rateioForm.gerador_id,
                                  );
                                  return uc.cliente_id === gerador?.cliente_id;
                                })
                                .sort((a, b) =>
                                  a.numero_uc.localeCompare(b.numero_uc),
                                )
                                .map((uc) => (
                                  <option key={uc.id} value={uc.id}>
                                    {uc.numero_uc} - {uc.classe} ({uc.tipo_uc})
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* Input de Percentual */}
                          <div className="w-28">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Percentual
                            </label>
                            <div className="flex items-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={beneficiaria.percentual}
                                onChange={(e) =>
                                  atualizarBeneficiaria(
                                    idx,
                                    "percentual",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              />
                              <span className="bg-gray-200 text-gray-700 px-3 py-2 rounded-r-lg font-medium">
                                %
                              </span>
                            </div>
                          </div>

                          {/* Botão de Remover */}
                          <button
                            onClick={() => removerBeneficiaria(idx)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Total de Percentual */}
                  <div className="mt-4 p-4 bg-green-50 dark:bg-emerald-800 rounded-lg ">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        Total de Rateio:
                      </span>
                      <span
                        className={cn(
                          "text-xl font-bold",
                          rateioForm.beneficiarias.reduce(
                            (sum, b) => sum + b.percentual,
                            0,
                          ) > 100
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-white",
                        )}
                      >
                        {rateioForm.beneficiarias
                          .reduce((sum, b) => sum + b.percentual, 0)
                          .toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={cancelarEdicao}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>

                  {rateios.some(
                    (r) => r.geradora_id === rateioForm.gerador_id,
                  ) && (
                    <button
                      onClick={() => {
                        const rateio = rateios.find(
                          (r) => r.geradora_id === rateioForm.gerador_id,
                        );
                        if (
                          rateio &&
                          confirm("Tem certeza que deseja deletar este rateio?")
                        ) {
                          deletarRateio(rateio.id);
                          cancelarEdicao();
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 dark:bg-red-800 dark:hover:bg-red-900 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      Deletar
                    </button>
                  )}

                  <button
                    onClick={salvarRateio}
                    disabled={isSaving}
                    className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-emerald-800 dark:hover:bg-emerald-900 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    {isSaving ? "Salvando..." : "Salvar Rateio"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seção sem rateios */}
        {geradoras.length > 0 && rateios.length === 0 && !rateioForm && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">
              Nenhum rateio configurado. Clique em "Adicionar Rateio" em uma
              geradora para começar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
