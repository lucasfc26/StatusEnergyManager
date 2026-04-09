import { useEffect, useState } from "react";
import { useStore } from "../../store";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Zap,
  Filter,
  MapPin,
  Eye,
  EyeOff,
} from "lucide-react";
import { UnidadeConsumidora } from "../../types";

const estados = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];
const distribuidoras = [
  "Enel CE",
  "Enel SP",
  "Enel RJ",
  "CPFL",
  "Light",
  "CEMIG",
  "Copel",
  "Coelba",
  "Celpe",
  "Equatorial",
];

export function UCs() {
  const {
    clientes,
    ucs,
    loadingUCs,
    errorUCs,
    fetchUCs,
    fetchClientes,
    addUC,
    updateUC,
    deleteUC,
  } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCliente, setFilterCliente] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUC, setEditingUC] = useState<UnidadeConsumidora | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cliente_id: "",
    numero_uc: "",
    cpf_cnpj: "",
    distribuidora: "",
    estado: "",
    cidade: "",
    tipo_uc: "Beneficiária" as "Geradora" | "Beneficiária",
    classe: "Residencial" as "Residencial" | "Comercial" | "Industrial",
    subclasse: "",
    grupo_tarifario: "",
    subgrupo: "",
    modalidade: "",
    mercado: "ACR" as "ACR" | "ACL",
    desconto: 0,
    data_leitura: "",
    data_vencimento: "",
    energia_contratada: 0,
    rateio_percentual: 100,
    numero_geradoras: 1,
    tipo_conta: "pessoal" as "pessoal" | "empresarial",
    login_enel: "",
    senha_enel: "",
  });

  useEffect(() => {
    fetchUCs();
    if (clientes.length === 0) fetchClientes();
  }, []);

  const filteredUCs = ucs.filter((uc) => {
    const matchesSearch =
      uc.numero_uc.includes(searchTerm) ||
      uc.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uc.distribuidora.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCliente = !filterCliente || uc.cliente_id === filterCliente;
    return matchesSearch && matchesCliente;
  });

  const getClienteName = (clienteId: string) => {
    return clientes.find((c) => c.id === clienteId)?.nome || "N/A";
  };

  const handleOpenModal = (uc?: UnidadeConsumidora) => {
    setSaveError(null);
    if (uc) {
      setEditingUC(uc);
      setFormData({
        cliente_id: uc.cliente_id,
        numero_uc: uc.numero_uc,
        cpf_cnpj:
          typeof uc.cpf_cnpj === "number"
            ? exibirCpfCnpj(uc.cpf_cnpj)
            : uc.cpf_cnpj,
        distribuidora: uc.distribuidora,
        estado: uc.estado,
        cidade: uc.cidade,
        tipo_uc: uc.tipo_uc,
        classe: uc.classe,
        subclasse: uc.subclasse,
        grupo_tarifario: uc.grupo_tarifario,
        subgrupo: uc.subgrupo,
        modalidade: uc.modalidade,
        mercado: uc.mercado,
        desconto: uc.desconto,
        data_leitura: uc.data_leitura,
        data_vencimento: uc.data_vencimento,
        energia_contratada: uc.energia_contratada,
        rateio_percentual: uc.rateio_percentual,
        numero_geradoras: uc.numero_geradoras,
        tipo_conta: uc.tipo_conta,
        login_enel: uc.login_enel,
        senha_enel: uc.senha_enel,
      });
    } else {
      setEditingUC(null);
      setFormData({
        cliente_id: filterCliente || "",
        numero_uc: "",
        cpf_cnpj: "",
        distribuidora: "",
        estado: "",
        cidade: "",
        tipo_uc: "Beneficiária",
        classe: "Residencial",
        subclasse: "",
        grupo_tarifario: "",
        subgrupo: "",
        modalidade: "",
        mercado: "ACR",
        desconto: 0,
        data_leitura: "",
        data_vencimento: "",
        energia_contratada: 0,
        rateio_percentual: 100,
        numero_geradoras: 1,
        tipo_conta: "pessoal",
        login_enel: "",
        senha_enel: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUC(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      // Remove formatação antes de salvar
      const dadosParaSalvar = {
        ...formData,
        cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ""),
      };
      if (editingUC) {
        await updateUC(editingUC.id, dadosParaSalvar);
      } else {
        await addUC(dadosParaSalvar);
      }
      handleCloseModal();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta UC?")) {
      try {
        await deleteUC(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Erro ao excluir");
      }
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const exibirCpfCnpj = (valor: number): string => {
    const apenasNumeros = valor.toString().padStart(14, "0");

    if (apenasNumeros.length <= 11) {
      // CPF: 000.000.000-00
      return apenasNumeros
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
    } else {
      // CNPJ: 00.000.000/0000-00
      return apenasNumeros
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
        .replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
    }
  };

  const formatarCpfCnpj = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, "");

    // Limita a 14 dígitos (máximo de um CNPJ)
    const limitado = apenasNumeros.slice(0, 14);

    if (limitado.length <= 11) {
      // CPF: 000.000.000-00
      return limitado
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
    } else {
      // CNPJ: 00.000.000/0000-00
      return limitado
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
        .replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Unidades Consumidoras
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie as UCs dos seus clientes
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-white font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl transition-all"
        >
          <Plus className="h-5 w-5" />
          Nova UC
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por UC, cidade ou distribuidora..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-12 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={filterCliente}
            onChange={(e) => setFilterCliente(e.target.value)}
            className="w-full sm:w-64 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-12 pr-4 py-3 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none appearance-none"
          >
            <option value="">Todos os clientes</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {ucs.length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total de UCs
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-2xl font-bold text-green-600">
            {ucs.filter((u) => u.tipo_uc === "Geradora").length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Geradoras</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-2xl font-bold text-blue-600">
            {ucs.filter((u) => u.tipo_uc === "Beneficiária").length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Beneficiárias
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-2xl font-bold text-purple-600">
            {[...new Set(ucs.map((u) => u.estado))].length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Estados</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {errorUCs && (
          <div className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
            Erro ao carregar UCs: {errorUCs}
          </div>
        )}
        {loadingUCs ? (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <p className="mt-3 text-gray-500 dark:text-gray-400">
              Carregando...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    UC
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Localização
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    cpf/cnpj
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Classe
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Desconto
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredUCs.map((uc) => (
                  <tr
                    key={uc.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-mono font-medium text-gray-900 dark:text-white">
                          {uc.numero_uc}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {uc.distribuidora}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {getClienteName(uc.cliente_id)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {uc.cidade}/{uc.estado}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          uc.tipo_uc === "Geradora"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {uc.tipo_uc}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {uc.classe}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        {uc.desconto}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(uc)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(uc.id)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUCs.length === 0 && (
              <div className="p-12 text-center">
                <Zap className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhuma UC encontrada
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingUC ? "Editar UC" : "Nova UC"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              {saveError && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
                  {saveError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cliente
                  </label>
                  <select
                    value={formData.cliente_id}
                    onChange={(e) =>
                      setFormData({ ...formData, cliente_id: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    required
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Número UC
                  </label>
                  <input
                    type="text"
                    value={formData.numero_uc}
                    onChange={(e) =>
                      setFormData({ ...formData, numero_uc: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CPF:CNPJ
                  </label>
                  <input
                    type="text"
                    value={formData.cpf_cnpj}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cpf_cnpj: formatarCpfCnpj(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Distribuidora
                  </label>
                  <select
                    value={formData.distribuidora}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        distribuidora: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    required
                  >
                    <option value="">Selecione</option>
                    {distribuidoras.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({ ...formData, estado: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    required
                  >
                    <option value="">Selecione</option>
                    {estados.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) =>
                      setFormData({ ...formData, cidade: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo UC
                  </label>
                  <select
                    value={formData.tipo_uc}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipo_uc: e.target.value as "Geradora" | "Beneficiária",
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  >
                    <option value="Beneficiária">Beneficiária</option>
                    <option value="Geradora">Geradora</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Classe
                  </label>
                  <select
                    value={formData.classe}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        classe: e.target.value as
                          | "Residencial"
                          | "Comercial"
                          | "Industrial",
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  >
                    <option value="Residencial">Residencial</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subclasse
                  </label>
                  <input
                    type="text"
                    value={formData.subclasse}
                    onChange={(e) =>
                      setFormData({ ...formData, subclasse: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    placeholder="Ex: Residencial Normal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Grupo Tarifário
                  </label>
                  <input
                    type="text"
                    value={formData.grupo_tarifario}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        grupo_tarifario: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    placeholder="Ex: B1, A3, A4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subgrupo
                  </label>
                  <input
                    type="text"
                    value={formData.subgrupo}
                    onChange={(e) =>
                      setFormData({ ...formData, subgrupo: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    placeholder="Ex: B1, A3a"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Modalidade
                  </label>
                  <input
                    type="text"
                    value={formData.modalidade}
                    onChange={(e) =>
                      setFormData({ ...formData, modalidade: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    placeholder="Ex: Cativo, Livre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mercado
                  </label>
                  <select
                    value={formData.mercado}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mercado: e.target.value as "ACR" | "ACL",
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  >
                    <option value="ACR">ACR - Cativo</option>
                    <option value="ACL">ACL - Livre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Desconto (%)
                  </label>
                  <input
                    type="number"
                    value={formData.desconto}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        desconto: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data Leitura
                  </label>
                  <input
                    type="text"
                    value={formData.data_leitura}
                    onChange={(e) =>
                      setFormData({ ...formData, data_leitura: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data Vencimento
                  </label>
                  <input
                    type="text"
                    value={formData.data_vencimento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        data_vencimento: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Energia Contratada (kWh)
                  </label>
                  <input
                    type="number"
                    value={formData.energia_contratada}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        energia_contratada: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rateio (%)
                  </label>
                  <input
                    type="number"
                    value={formData.rateio_percentual}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rateio_percentual: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nº UCs Geradoras
                  </label>
                  <input
                    type="number"
                    value={formData.numero_geradoras}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numero_geradoras: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Conta
                  </label>
                  <select
                    value={formData.tipo_conta}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipo_conta: e.target.value as "pessoal" | "empresarial",
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  >
                    <option value="pessoal">Pessoal</option>
                    <option value="empresarial">Empresarial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Login Enel
                  </label>
                  <input
                    type="text"
                    value={formData.login_enel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        login_enel: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Senha Enel
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.senha_enel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          senha_enel: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 py-2.5 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-60"
                >
                  {saving ? "Salvando..." : editingUC ? "Salvar" : "Criar UC"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
