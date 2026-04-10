import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Zap,
  FileText,
  Settings,
  CalendarDays,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useStore } from "../../store";
import { getRoleLabel } from "../../utils/permissions";

const menuItems = [
  {
    section: "Principal",
    items: [{ path: "/", icon: LayoutDashboard, label: "Resumo" }],
  },
  {
    section: "Cadastro",
    items: [
      { path: "/clientes", icon: Users, label: "Clientes" },
      { path: "/ucs", icon: Zap, label: "UC's" },
    ],
  },
  {
    section: "Gerenciamento",
    items: [
      { path: "/agenda", icon: CalendarDays, label: "Agenda de Faturas" },
      {
        path: "/resumo-extracoes",
        icon: FileText,
        label: "Resumo de Extrações",
      },
      {
        path: "/exemplo-extracoes",
        icon: FileText,
        label: "Extração Individual",
      },
      { path: "/extracoes", icon: FileText, label: "Extrator de Dados" },
    ],
  },
  {
    section: "Sistema",
    items: [{ path: "/configuracoes", icon: Settings, label: "Configurações" }],
  },
];

export function Sidebar() {
  const { user, clientes, ucs } = useStore();

  // Calcula quantos clientes este usuário pode ver
  let clientesVisiveis = 0;
  if (user?.role === "administrador") {
    clientesVisiveis = clientes.length;
  } else if (user?.role === "profissional") {
    clientesVisiveis = clientes.filter((c) => c.user_id === user.id).length;
  }
  // Cliente não vê clientes, só UCs

  // Calcula quantas UCs este usuário pode ver
  let ucsVisiveis = 0;
  if (user?.role === "administrador") {
    ucsVisiveis = ucs.length;
  } else if (user?.role === "profissional") {
    ucsVisiveis = ucs.filter((u) => u.user_id === user.id).length;
  } else if (user?.role === "cliente") {
    ucsVisiveis = ucs.filter((u) => u.cliente_user_id === user.id).length;
  }

  // Percentual de clientes para a barra de progresso (considerando o limite)
  const clientesPercentual =
    user?.limite_clientes && user?.limite_clientes > 0
      ? Math.min((clientesVisiveis / user.limite_clientes) * 100, 100)
      : 0;

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <nav className="p-4 space-y-6">
        {menuItems.map((section) => (
          <div key={section.section}>
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {section.section}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
            {user?.role ? getRoleLabel(user.role) : "Carregando..."}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {clientes.length} cliente{clientes.length !== 1 ? "s" : ""} /{" "}
            {ucs.length} UC
            {ucs.length !== 1 ? "s" : ""}
          </p>
          <div className="mt-3">
            <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all"
                style={{ width: `${clientesPercentual}%` }}
              ></div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {clientesVisiveis} de {clientes.length} cliente
              {clientes.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
