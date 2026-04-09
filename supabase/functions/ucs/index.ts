// supabase/functions/ucs/index.ts
// Edge Function – CRUD de Unidades Consumidoras
//
// Rotas:
//   GET    /ucs               → lista todas as UCs do usuário (query ?cliente_id=)
//   GET    /ucs/:id           → retorna uma UC específica (com dados do cliente)
//   POST   /ucs               → cria uma nova UC
//   PUT    /ucs/:id           → atualiza uma UC existente
//   DELETE /ucs/:id           → exclui uma UC

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── CORS helpers (inlined de _shared/cors.ts) ────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};
function corsResponse(body = "ok", status = 200) {
  return new Response(body, { status, headers: corsHeaders });
}
function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface UCInput {
  cliente_id: string;
  numero_uc: string;
  distribuidora: string;
  estado: string;
  cidade: string;
  tipo_uc: "Geradora" | "Beneficiária";
  classe: "Residencial" | "Comercial" | "Industrial";
  subclasse?: string;
  grupo_tarifario?: string;
  subgrupo?: string;
  modalidade?: string;
  mercado?: "ACR" | "ACL";
  desconto?: number;
  energia_contratada?: number;
  rateio_percentual?: number;
  numero_geradoras?: number;
  data_leitura?: string;
  data_vencimento?: string;
  tipo_conta?: "pessoal" | "empresarial";
  login_enel?: string;
  senha_enel?: string;
}

const TIPOS_UC = ["Geradora", "Beneficiária"] as const;
const CLASSES = ["Residencial", "Comercial", "Industrial"] as const;
const MERCADOS = ["ACR", "ACL"] as const;
const TIPOS_CONTA = ["pessoal", "empresarial"] as const;

// ─── Handler principal ────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return corsResponse();

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return errorResponse("Authorization header ausente", 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const url = new URL(req.url);
  const pathParts = url.pathname.replace(/^\/+/, "").split("/");
  const entityId = pathParts[1] ?? null; // índice 0 = "ucs"

  try {
    // ── GET ──────────────────────────────────────────────────────────────────
    if (req.method === "GET") {
      if (entityId) {
        // GET /ucs/:id  →  retorna a UC com dados do cliente vinculado
        const { data, error } = await supabase
          .from("unidades_consumidoras")
          .select("*, cliente:clientes(id, nome, cpf_cnpj, email, telefone)")
          .eq("id", entityId)
          .single();

        if (error) return errorResponse(error.message, 404);
        return jsonResponse(data);
      }

      // GET /ucs  (opcionalmente filtrado por ?cliente_id=)
      const clienteId = url.searchParams.get("cliente_id");
      let query = supabase
        .from("unidades_consumidoras")
        .select("*, cliente:clientes(id, nome, cpf_cnpj, email, telefone)")
        .order("created_at", { ascending: false });

      if (clienteId) query = query.eq("cliente_id", clienteId);

      const { data, error } = await query;
      if (error) return errorResponse(error.message);
      return jsonResponse(data ?? []);
    }

    // ── POST ─────────────────────────────────────────────────────────────────
    if (req.method === "POST") {
      const body = await parseBody<UCInput>(req);
      const validation = validateUC(body);
      if (validation) return errorResponse(validation, 422);

      const { data, error } = await supabase
        .from("unidades_consumidoras")
        .insert(buildInsertPayload(body))
        .select("*, cliente:clientes(id, nome, cpf_cnpj, email, telefone)")
        .single();

      if (error) return errorResponse(error.message);
      return jsonResponse(data, 201);
    }

    // ── PUT ──────────────────────────────────────────────────────────────────
    if (req.method === "PUT") {
      if (!entityId) return errorResponse("ID da UC não informado", 400);

      const body = await parseBody<Partial<UCInput>>(req);
      const patch = buildPatchPayload(body);

      if (Object.keys(patch).length === 0) {
        return errorResponse("Nenhum campo para atualizar", 422);
      }

      const { data, error } = await supabase
        .from("unidades_consumidoras")
        .update(patch)
        .eq("id", entityId)
        .select("*, cliente:clientes(id, nome, cpf_cnpj, email, telefone)")
        .single();

      if (error) return errorResponse(error.message);
      return jsonResponse(data);
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    if (req.method === "DELETE") {
      if (!entityId) return errorResponse("ID da UC não informado", 400);

      const { error } = await supabase
        .from("unidades_consumidoras")
        .delete()
        .eq("id", entityId);

      if (error) return errorResponse(error.message);
      return jsonResponse({ success: true });
    }

    return errorResponse("Método não suportado", 405);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return errorResponse(message, 500);
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function parseBody<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new Error("Corpo da requisição inválido (JSON esperado)");
  }
}

function validateUC(body: Partial<UCInput>): string | null {
  if (!body.cliente_id?.trim()) return "Campo 'cliente_id' é obrigatório";
  if (!body.numero_uc?.trim()) return "Campo 'numero_uc' é obrigatório";
  if (!body.distribuidora?.trim()) return "Campo 'distribuidora' é obrigatório";
  if (!body.estado?.trim()) return "Campo 'estado' é obrigatório";
  if (body.estado && body.estado.trim().length !== 2) {
    return "Campo 'estado' deve conter a sigla com 2 caracteres (ex: SP)";
  }
  if (!body.cidade?.trim()) return "Campo 'cidade' é obrigatório";
  if (
    !body.tipo_uc ||
    !(TIPOS_UC as readonly string[]).includes(body.tipo_uc)
  ) {
    return `Campo 'tipo_uc' deve ser um de: ${TIPOS_UC.join(", ")}`;
  }
  if (!body.classe || !(CLASSES as readonly string[]).includes(body.classe)) {
    return `Campo 'classe' deve ser um de: ${CLASSES.join(", ")}`;
  }
  if (body.mercado && !(MERCADOS as readonly string[]).includes(body.mercado)) {
    return `Campo 'mercado' deve ser um de: ${MERCADOS.join(", ")}`;
  }
  if (
    body.tipo_conta &&
    !(TIPOS_CONTA as readonly string[]).includes(body.tipo_conta)
  ) {
    return `Campo 'tipo_conta' deve ser um de: ${TIPOS_CONTA.join(", ")}`;
  }
  if (
    body.desconto !== undefined &&
    (body.desconto < 0 || body.desconto > 100)
  ) {
    return "Campo 'desconto' deve estar entre 0 e 100";
  }
  if (
    body.rateio_percentual !== undefined &&
    (body.rateio_percentual < 0 || body.rateio_percentual > 100)
  ) {
    return "Campo 'rateio_percentual' deve estar entre 0 e 100";
  }
  return null;
}

/** Monta o payload de inserção com valores padrão */
function buildInsertPayload(body: UCInput) {
  return {
    cliente_id: body.cliente_id.trim(),
    numero_uc: body.numero_uc.trim(),
    distribuidora: body.distribuidora.trim(),
    estado: body.estado.trim().toUpperCase(),
    cidade: body.cidade.trim(),
    tipo_uc: body.tipo_uc,
    classe: body.classe,
    subclasse: body.subclasse?.trim() ?? "",
    grupo_tarifario: body.grupo_tarifario?.trim() ?? "",
    subgrupo: body.subgrupo?.trim() ?? "",
    modalidade: body.modalidade?.trim() ?? "",
    mercado: body.mercado ?? "ACR",
    desconto: body.desconto ?? 0,
    energia_contratada: body.energia_contratada ?? 0,
    rateio_percentual: body.rateio_percentual ?? 100,
    numero_geradoras: body.numero_geradoras ?? 1,
    data_leitura: body.data_leitura ?? "",
    data_vencimento: body.data_vencimento ?? "",
    tipo_conta: body.tipo_conta ?? "pessoal",
    login_enel: body.login_enel?.trim() ?? "",
    senha_enel: body.senha_enel ?? "",
  };
}

/** Monta o payload de atualização incluindo apenas os campos fornecidos */
function buildPatchPayload(body: Partial<UCInput>) {
  // deno-lint-ignore no-explicit-any
  const patch: Record<string, any> = {};

  if (body.cliente_id !== undefined) patch.cliente_id = body.cliente_id.trim();
  if (body.numero_uc !== undefined) patch.numero_uc = body.numero_uc.trim();
  if (body.distribuidora !== undefined)
    patch.distribuidora = body.distribuidora.trim();
  if (body.estado !== undefined)
    patch.estado = body.estado.trim().toUpperCase();
  if (body.cidade !== undefined) patch.cidade = body.cidade.trim();
  if (body.tipo_uc !== undefined) patch.tipo_uc = body.tipo_uc;
  if (body.classe !== undefined) patch.classe = body.classe;
  if (body.subclasse !== undefined) patch.subclasse = body.subclasse.trim();
  if (body.grupo_tarifario !== undefined)
    patch.grupo_tarifario = body.grupo_tarifario.trim();
  if (body.subgrupo !== undefined) patch.subgrupo = body.subgrupo.trim();
  if (body.modalidade !== undefined) patch.modalidade = body.modalidade.trim();
  if (body.mercado !== undefined) patch.mercado = body.mercado;
  if (body.desconto !== undefined) patch.desconto = body.desconto;
  if (body.energia_contratada !== undefined)
    patch.energia_contratada = body.energia_contratada;
  if (body.rateio_percentual !== undefined)
    patch.rateio_percentual = body.rateio_percentual;
  if (body.numero_geradoras !== undefined)
    patch.numero_geradoras = body.numero_geradoras;
  if (body.data_leitura !== undefined) patch.data_leitura = body.data_leitura;
  if (body.data_vencimento !== undefined)
    patch.data_vencimento = body.data_vencimento;
  if (body.tipo_conta !== undefined) patch.tipo_conta = body.tipo_conta;
  if (body.login_enel !== undefined) patch.login_enel = body.login_enel.trim();
  if (body.senha_enel !== undefined) patch.senha_enel = body.senha_enel;

  return patch;
}
