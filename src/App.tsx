import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "./store";
import { supabase } from "./lib/supabase";
import { Layout } from "./components/Layout";
import { Login } from "./components/Auth/Login";
import { Cadastro } from "./components/Auth/Cadastro";
import { Dashboard } from "./components/Dashboard";
import { Clientes } from "./components/Clientes";
import { UCs } from "./components/UCs";
import { Agenda } from "./components/Agenda";
import { Extracoes } from "./components/Extracoes";
import { ExemploProcessamentoFaturas } from "./components/Extracoes/ExemploProcessamento";
import { Configuracoes } from "./components/Configuracoes";
import { ResumoExtracoes } from "./components/ResumoExtracoes";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { fetchClientes, fetchUCs, darkMode } = useStore();

  // Sincroniza o tema com a tag html quando darkMode muda
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  // Restaura o tema salvo e sessão ativa do Supabase ao recarregar a página
  useEffect(() => {
    // Restaura o tema do localStorage apenas na primeira renderização
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === "true";
      useStore.setState({ darkMode: isDark });
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        useStore.setState({
          isAuthenticated: true,
          user: {
            id: session.user.id,
            nome: session.user.user_metadata?.nome ?? session.user.email ?? "",
            email: session.user.email ?? "",
            empresa: session.user.user_metadata?.empresa ?? "",
            plano: "profissional",
            status_assinatura: "ativa",
            limite_clientes: 100,
            limite_ucs: 500,
            created_at: session.user.created_at,
          },
        });
        fetchClientes();
        fetchUCs();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        useStore.setState({
          isAuthenticated: false,
          user: null,
          clientes: [],
          ucs: [],
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchClientes, fetchUCs]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="ucs" element={<UCs />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="resumo-extracoes" element={<ResumoExtracoes />} />
          <Route
            path="exemplo-extracoes"
            element={<ExemploProcessamentoFaturas />}
          />
          <Route path="extracoes" element={<Extracoes />} />
          <Route path="configuracoes" element={<Configuracoes />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
