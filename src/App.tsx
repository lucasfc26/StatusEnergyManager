import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "./utils/toast";
import { useStore } from "./store";
import { supabase } from "./lib/supabase";
import { Layout } from "./components/Layout";
import { Login } from "./components/Auth/Login";
import { Cadastro } from "./components/Auth/Cadastro";
import { Dashboard } from "./components/Dashboard";
import { Clientes } from "./components/Clientes";
import { UCs } from "./components/UCs";
import RateioPage from "./components/Rateio";
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
  const [isSessionLoading, setIsSessionLoading] = useState(true);

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
    let isMounted = true;

    const restoreSession = async () => {
      try {
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

        // Restaura a sessão ativa do Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (isMounted) {
          if (session?.user) {
            // Recupera o role do usuário
            const { data: roleData } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .single();

            const role =
              (roleData?.role as
                | "administrador"
                | "profissional"
                | "cliente") || "cliente";

            useStore.setState({
              isAuthenticated: true,
              user: {
                id: session.user.id,
                nome:
                  session.user.user_metadata?.nome ?? session.user.email ?? "",
                email: session.user.email ?? "",
                empresa: session.user.user_metadata?.empresa ?? "",
                plano: "profissional",
                status_assinatura: "ativa",
                limite_clientes: 100,
                limite_ucs: 500,
                role,
                created_at: session.user.created_at,
              },
            });
            await fetchClientes();
            await fetchUCs();
          }
          setIsSessionLoading(false);
        }
      } catch {
        if (isMounted) {
          setIsSessionLoading(false);
        }
      }
    };

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        if (!session) {
          useStore.setState({
            isAuthenticated: false,
            user: null,
            clientes: [],
            ucs: [],
          });
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchClientes, fetchUCs]);

  // Mostra tela de carregamento enquanto verifica a sessão
  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200 mb-4 animate-pulse">
            <div className="h-8 w-8 bg-white/20 rounded-full" />
          </div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
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
          <Route path="rateios" element={<RateioPage />} />
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
