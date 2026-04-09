import { useEffect, useState } from "react";
import { useStore } from "../../store";
import { Plus, Search, Edit2, Trash2, X, Users } from "lucide-react";
import { Cliente } from "../../types";
import { IMaskInput } from "react-imask";

export function Clientes() {
  const {
    clientes,
    ucs,
    loadingClientes,
    errorClientes,
    fetchClientes,
    addCliente,
    updateCliente,
    deleteCliente,
  } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    cpf_cnpj: "",
    email: "",
    telefone: "",
    observacoes: "",
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const filteredClientes = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cpf_cnpj.includes(searchTerm),
  );

  const getUCCount = (clienteId: string) => {
    const found = clientes.find((c) => c.id === clienteId);
    if (found?.total_ucs !== undefined) return found.total_ucs;
    return ucs.filter((uc) => uc.cliente_id === clienteId).length;
  };

  const handleOpenModal = (cliente?: Cliente) => {
    setSaveError(null);
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nome: cliente.nome,
        cpf_cnpj:
          typeof cliente.cpf_cnpj === "number"
            ? exibirCpfCnpj(cliente.cpf_cnpj)
            : cliente.cpf_cnpj,
        email: cliente.email,
        telefone: cliente.telefone,
        observacoes: cliente.observacoes,
      });
    } else {
      setEditingCliente(null);
      setFormData({
        nome: "",
        cpf_cnpj: "",
        email: "",
        telefone: "",
        observacoes: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCliente(null);
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
      if (editingCliente) {
        await updateCliente(editingCliente.id, dadosParaSalvar);
      } else {
        await addCliente(dadosParaSalvar);
      }
      handleCloseModal();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Tem certeza que deseja excluir este cliente? Todas as UCs vinculadas tambÃ©m serÃ£o excluÃ­das.",
      )
    ) {
      try {
        await deleteCliente(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Erro ao excluir");
      }
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Clientes
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie seus clientes
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-white font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl transition-all"
        >
          <Plus className="h-5 w-5" />
          Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome, email ou documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-12 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {clientes.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total de clientes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {errorClientes && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400">
          Erro ao carregar clientes: {errorClientes}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loadingClientes ? (
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
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    UC's
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredClientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                          <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {cliente.nome}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {cliente.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-900 dark:text-white">
                        {cliente.cpf_cnpj}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {cliente.telefone}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                        <ZapIcon className="h-3 w-3" />
                        {getUCCount(cliente.id)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(cliente)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente.id)}
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

            {filteredClientes.length === 0 && (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhum cliente encontrado
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingCliente ? "Editar Cliente" : "Novo Cliente"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {saveError && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
                  {saveError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome / Razão Social
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CPF / CNPJ
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefone
                  </label>
                  <IMaskInput
                    mask={[
                      { mask: "(00) 0000-0000" }, // Telefone
                      { mask: "(00) 00000-0000" }, // Celular
                    ]}
                    dispatch={(appended, dynamicMasked) => {
                      const number = (dynamicMasked.value + appended).replace(
                        /\D/g,
                        "",
                      );

                      return number.length > 10
                        ? dynamicMasked.compiledMasks[1] // Celular
                        : dynamicMasked.compiledMasks[0]; // Telefone
                    }}
                    value={formData.telefone}
                    onAccept={(value) =>
                      setFormData({ ...formData, telefone: value })
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData({ ...formData, observacoes: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none resize-none"
                  />
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
                  {saving
                    ? "Salvando..."
                    : editingCliente
                      ? "Salvar"
                      : "Criar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
