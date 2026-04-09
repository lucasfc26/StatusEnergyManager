import { useStore } from "../../store";
import {
  Users,
  Zap,
  FileText,
  TrendingUp,
  DollarSign,
  Leaf,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const faturamentoData = [
  { mes: "Jan", valor: 28500 },
  { mes: "Fev", valor: 32000 },
  { mes: "Mar", valor: 35200 },
  { mes: "Abr", valor: 31800 },
  { mes: "Mai", valor: 38500 },
  { mes: "Jun", valor: 42000 },
];

const energiaData = [
  { mes: "Jan", consumida: 45000, compensada: 28000 },
  { mes: "Fev", consumida: 48000, compensada: 32000 },
  { mes: "Mar", consumida: 52000, compensada: 38000 },
  { mes: "Abr", consumida: 49000, compensada: 35000 },
  { mes: "Mai", consumida: 55000, compensada: 42000 },
  { mes: "Jun", consumida: 58000, compensada: 45000 },
];

const ucTipoData = [
  { name: "Beneficiária", value: 18, color: "#10b981" },
  { name: "Geradora", value: 8, color: "#0d9488" },
];

const ucEstadoData = [
  { estado: "SP", quantidade: 12 },
  { estado: "RJ", quantidade: 5 },
  { estado: "MG", quantidade: 4 },
  { estado: "PR", quantidade: 3 },
  { estado: "SC", quantidade: 2 },
];

const statusFaturaData = [
  { name: "Extraída", value: 45, color: "#10b981" },
  { name: "Pendente", value: 12, color: "#f59e0b" },
  { name: "Erro", value: 3, color: "#ef4444" },
  { name: "Paga", value: 28, color: "#3b82f6" },
];

export function Dashboard() {
  const { clientes, ucs, faturas } = useStore();

  const totalClientes = clientes.length;
  const totalUCs = ucs.length;
  const faturasHoje = faturas.filter(
    (f) => f.data_vencimento === new Date().toISOString().split("T")[0],
  ).length;
  const faturasExtraidas = faturas.filter(
    (f) => f.status === "Extraída",
  ).length;
  const valorTotalFaturado = faturas.reduce((acc, f) => acc + f.valor_total, 0);
  const economiaGerada = faturas.reduce(
    (acc, f) => acc + f.valor_compensado,
    0,
  );

  const proximasFaturas = faturas
    .filter((f) => f.status === "Pendente" || f.status === "Extraída")
    .sort(
      (a, b) =>
        new Date(a.data_vencimento).getTime() -
        new Date(b.data_vencimento).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Visão geral do seu negócio
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Users}
          title="Total de Clientes"
          value={totalClientes}
          change="+12%"
          color="emerald"
        />
        <StatsCard
          icon={Zap}
          title="Total de UC's"
          value={totalUCs}
          change="+8%"
          color="teal"
        />
        <StatsCard
          icon={FileText}
          title="Faturas Mês"
          value={faturasHoje}
          subtitle={`${faturasExtraidas} extraídas`}
          color="blue"
        />
        <StatsCard
          icon={DollarSign}
          title="Valor Faturado"
          value={`R$ ${valorTotalFaturado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          change="+15%"
          color="amber"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-200">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Economia Gerada
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                R${" "}
                {economiaGerada.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Crescimento Financeiro
              </p>
              <p className="text-2xl font-bold text-green-600">+24.5%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Faturas Pendentes
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {faturas.filter((f) => f.status === "Pendente").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faturamento Mensal */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Faturamento Mensal
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={faturamentoData}>
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mes" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [
                    `R$ ${Number(value).toLocaleString("pt-BR")}`,
                    "Valor",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorValor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energia Consumida vs Compensada */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Energia Consumida vs Compensada
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={energiaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mes" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [
                    `${Number(value).toLocaleString("pt-BR")} kWh`,
                    "",
                  ]}
                />
                <Bar
                  dataKey="consumida"
                  fill="#94a3b8"
                  name="Consumida"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="compensada"
                  fill="#10b981"
                  name="Compensada"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* UC's por Tipo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            UC's por Tipo
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ucTipoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ucTipoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {ucTipoData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status das Faturas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Status das Faturas
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusFaturaData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusFaturaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* UC's por Estado */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          UC's por Estado
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ucEstadoData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis type="category" dataKey="estado" stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="quantidade" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Próximas Faturas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Próximas Faturas
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  UC
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vencimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {proximasFaturas.map((fatura) => {
                const cliente = clientes.find(
                  (c) => c.id === fatura.cliente_id,
                );
                const uc = ucs.find((u) => u.id === fatura.uc_id);
                return (
                  <tr
                    key={fatura.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {cliente?.nome}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {cliente?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-mono text-sm text-gray-900 dark:text-white">
                          {uc?.numero_uc}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {uc?.distribuidora}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {new Date(fatura.data_vencimento).toLocaleDateString(
                        "pt-BR",
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={fatura.status} />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      R${" "}
                      {fatura.valor_total.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  icon: Icon,
  title,
  value,
  change,
  subtitle,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  change?: string;
  subtitle?: string;
  color: "emerald" | "teal" | "blue" | "amber";
}) {
  const colorClasses = {
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-200",
    teal: "from-teal-500 to-teal-600 shadow-teal-200",
    blue: "from-blue-500 to-blue-600 shadow-blue-200",
    amber: "from-amber-500 to-amber-600 shadow-amber-200",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        {change && (
          <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
            {change}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Extraída:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Pendente:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    Erro: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Paga: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles["Pendente"]}`}
    >
      {status}
    </span>
  );
}
