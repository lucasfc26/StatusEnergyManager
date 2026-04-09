import { create } from "zustand";
import { User, Cliente, UnidadeConsumidora, Fatura } from "../types";
import { supabase } from "../lib/supabase";

// â”€â”€â”€ Interface do store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  darkMode: boolean;

  // Data
  clientes: Cliente[];
  ucs: UnidadeConsumidora[];
  faturas: Fatura[];

  // Loading / error
  loadingClientes: boolean;
  loadingUCs: boolean;
  errorClientes: string | null;
  errorUCs: string | null;

  // Actions â€“ Auth
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  toggleDarkMode: () => void;

  // Actions â€“ Clientes
  fetchClientes: () => Promise<void>;
  addCliente: (
    cliente: Omit<Cliente, "id" | "user_id" | "created_at" | "total_ucs">,
  ) => Promise<void>;
  updateCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;

  // Actions â€“ UCs
  fetchUCs: (clienteId?: string) => Promise<void>;
  addUC: (uc: Omit<UnidadeConsumidora, "id" | "created_at">) => Promise<void>;
  updateUC: (id: string, uc: Partial<UnidadeConsumidora>) => Promise<void>;
  deleteUC: (id: string) => Promise<void>;

  // Actions â€“ Faturas
  addFatura: (fatura: Omit<Fatura, "id" | "created_at">) => void;
  updateFatura: (id: string, fatura: Partial<Fatura>) => void;
}

// â”€â”€â”€ Store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  darkMode: false,
  clientes: [],
  ucs: [],
  faturas: [],
  loadingClientes: false,
  loadingUCs: false,
  errorClientes: null,
  errorUCs: null,

  // â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) return false;
    set({
      isAuthenticated: true,
      user: {
        id: data.user.id,
        nome: data.user.user_metadata?.nome ?? email,
        email: data.user.email ?? email,
        empresa: data.user.user_metadata?.empresa ?? "",
        plano: "profissional",
        status_assinatura: "ativa",
        limite_clientes: 100,
        limite_ucs: 500,
        created_at: data.user.created_at,
      },
    });
    await get().fetchClientes();
    await get().fetchUCs();
    return true;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      isAuthenticated: false,
      clientes: [],
      ucs: [],
      faturas: [],
    });
  },

  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

  // â”€â”€ Clientes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  fetchClientes: async () => {
    set({ loadingClientes: true, errorClientes: null });
    const { data, error } = await supabase
      .from("clientes")
      .select("*, unidades_consumidoras(count)")
      .order("nome");
    if (error) {
      set({ loadingClientes: false, errorClientes: error.message });
      return;
    }
    const clientes: Cliente[] = (data ?? []).map((row: any) => {
      const { unidades_consumidoras, ...rest } = row;
      return { ...rest, total_ucs: unidades_consumidoras?.[0]?.count ?? 0 };
    });
    set({ clientes, loadingClientes: false });
  },

  addCliente: async (cliente) => {
    const userId = get().user?.id;
    if (!userId) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from("clientes")
      .insert({
        user_id: userId,
        nome: cliente.nome.trim(),
        cpf_cnpj: cliente.cpf_cnpj.trim(),
        email: cliente.email.trim().toLowerCase(),
        telefone: cliente.telefone?.trim() ?? "",
        observacoes: cliente.observacoes?.trim() ?? "",
      })
      .select("*, unidades_consumidoras(count)")
      .single();
    if (error) throw new Error(error.message);
    const { unidades_consumidoras, ...rest } = data as any;
    const newCliente: Cliente = {
      ...rest,
      total_ucs: unidades_consumidoras?.[0]?.count ?? 0,
    };
    set((state) => ({ clientes: [...state.clientes, newCliente] }));
  },

  updateCliente: async (id, cliente) => {
    const { data, error } = await supabase
      .from("clientes")
      .update(cliente)
      .eq("id", id)
      .select("*, unidades_consumidoras(count)")
      .single();
    if (error) throw new Error(error.message);
    const { unidades_consumidoras, ...rest } = data as any;
    const updated: Cliente = {
      ...rest,
      total_ucs: unidades_consumidoras?.[0]?.count ?? 0,
    };
    set((state) => ({
      clientes: state.clientes.map((c) => (c.id === id ? updated : c)),
    }));
  },

  deleteCliente: async (id) => {
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) throw new Error(error.message);
    set((state) => ({
      clientes: state.clientes.filter((c) => c.id !== id),
      ucs: state.ucs.filter((uc) => uc.cliente_id !== id),
    }));
  },

  // â”€â”€ UCs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  fetchUCs: async (clienteId) => {
    set({ loadingUCs: true, errorUCs: null });
    let query = supabase
      .from("unidades_consumidoras")
      .select("*, cliente:clientes(id, nome, cpf_cnpj, email, telefone)")
      .order("created_at", { ascending: false });
    if (clienteId) query = query.eq("cliente_id", clienteId);
    const { data, error } = await query;
    if (error) {
      set({ loadingUCs: false, errorUCs: error.message });
      return;
    }
    set({ ucs: (data ?? []) as UnidadeConsumidora[], loadingUCs: false });
  },

  addUC: async (uc) => {
    const userId = get().user?.id;
    if (!userId) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from("unidades_consumidoras")
      .insert({ ...uc, user_id: userId })
      .select("*, cliente:clientes(id, nome, cpf_cnpj, email, telefone)")
      .single();
    if (error) throw new Error(error.message);
    set((state) => ({ ucs: [data as UnidadeConsumidora, ...state.ucs] }));
    // Atualiza o total_ucs do cliente correspondente
    set((state) => ({
      clientes: state.clientes.map((c) =>
        c.id === uc.cliente_id
          ? { ...c, total_ucs: (c.total_ucs ?? 0) + 1 }
          : c,
      ),
    }));
  },

  updateUC: async (id, uc) => {
    const { data, error } = await supabase
      .from("unidades_consumidoras")
      .update(uc)
      .eq("id", id)
      .select("*, cliente:clientes(id, nome, cpf_cnpj, email, telefone)")
      .single();
    if (error) throw new Error(error.message);
    set((state) => ({
      ucs: state.ucs.map((u) =>
        u.id === id ? (data as UnidadeConsumidora) : u,
      ),
    }));
  },

  deleteUC: async (id) => {
    const uc = get().ucs.find((u) => u.id === id);
    const { error } = await supabase
      .from("unidades_consumidoras")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    set((state) => ({
      ucs: state.ucs.filter((u) => u.id !== id),
      clientes: uc
        ? state.clientes.map((c) =>
            c.id === uc.cliente_id
              ? { ...c, total_ucs: Math.max(0, (c.total_ucs ?? 0) - 1) }
              : c,
          )
        : state.clientes,
    }));
  },

  // â”€â”€ Faturas (local â€“ ainda sem edge function) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  addFatura: (fatura) => {
    const newFatura: Fatura = {
      ...fatura,
      id: String(Date.now()),
      created_at: new Date().toISOString().split("T")[0],
    };
    set((state) => ({ faturas: [...state.faturas, newFatura] }));
  },

  updateFatura: (id, fatura) => {
    set((state) => ({
      faturas: state.faturas.map((f) =>
        f.id === id ? { ...f, ...fatura } : f,
      ),
    }));
  },
}));
