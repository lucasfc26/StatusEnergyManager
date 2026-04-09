// supabase/functions/clientes/index.ts
// Edge Function – CRUD de Clientes
//
// Rotas:
//   GET    /clientes          → lista todos os clientes do usuário autenticado
//   GET    /clientes/:id      → retorna um cliente específico
//   POST   /clientes          → cria um novo cliente
//   PUT    /clientes/:id      → atualiza um cliente existente
//   DELETE /clientes/:id      → exclui um cliente (e suas UCs por cascade)

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

interface ClienteInput {
  nome: string;
  cpf_cnpj: string;
  email: string;
  telefone?: string;
  observacoes?: string;
}

// ─── Handler principal ────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // Pre-flight CORS
  if (req.method === "OPTIONS") return corsResponse();

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return errorResponse("Authorization header ausente", 401);

  // Cria o client usando o JWT do usuário, garantindo que o RLS seja aplicado
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  // Extrai o ID do path: /clientes/{id}
  const url = new URL(req.url);
  const pathParts = url.pathname.replace(/^\/+/, "").split("/");
  const entityId = pathParts[1] ?? null; // índice 0 = "clientes"

  try {
    // ── GET ──────────────────────────────────────────────────────────────────
    if (req.method === "GET") {
      if (entityId) {
        // GET /clientes/:id
        const { data, error } = await supabase
          .from("clientes")
          .select("*, unidades_consumidoras(count)")
          .eq("id", entityId)
          .single();

        if (error) return errorResponse(error.message, 404);
        return jsonResponse(normalizeCliente(data));
      }

      // GET /clientes
      const { data, error } = await supabase
        .from("clientes")
        .select("*, unidades_consumidoras(count)")
        .order("nome");

      if (error) return errorResponse(error.message);
      return jsonResponse((data ?? []).map(normalizeCliente));
    }

    // ── POST ─────────────────────────────────────────────────────────────────
    if (req.method === "POST") {
      const body = await parseBody<ClienteInput>(req);
      const validation = validateCliente(body);
      if (validation) return errorResponse(validation, 422);

      const { data, error } = await supabase
        .from("clientes")
        .insert({
          nome: body.nome.trim(),
          cpf_cnpj: body.cpf_cnpj.trim(),
          email: body.email.trim().toLowerCase(),
          telefone: body.telefone?.trim() ?? "",
          observacoes: body.observacoes?.trim() ?? "",
        })
        .select("*, unidades_consumidoras(count)")
        .single();

      if (error) return errorResponse(error.message);
      return jsonResponse(normalizeCliente(data), 201);
    }

    // ── PUT ──────────────────────────────────────────────────────────────────
    if (req.method === "PUT") {
      if (!entityId) return errorResponse("ID do cliente não informado", 400);

      const body = await parseBody<Partial<ClienteInput>>(req);
      const patch: Record<string, string> = {};

      if (body.nome !== undefined) patch.nome = body.nome.trim();
      if (body.cpf_cnpj !== undefined) patch.cpf_cnpj = body.cpf_cnpj.trim();
      if (body.email !== undefined)
        patch.email = body.email.trim().toLowerCase();
      if (body.telefone !== undefined) patch.telefone = body.telefone.trim();
      if (body.observacoes !== undefined)
        patch.observacoes = body.observacoes.trim();

      if (Object.keys(patch).length === 0) {
        return errorResponse("Nenhum campo para atualizar", 422);
      }

      const { data, error } = await supabase
        .from("clientes")
        .update(patch)
        .eq("id", entityId)
        .select("*, unidades_consumidoras(count)")
        .single();

      if (error) return errorResponse(error.message);
      return jsonResponse(normalizeCliente(data));
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    if (req.method === "DELETE") {
      if (!entityId) return errorResponse("ID do cliente não informado", 400);

      const { error } = await supabase
        .from("clientes")
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

function validateCliente(body: Partial<ClienteInput>): string | null {
  if (!body.nome?.trim()) return "Campo 'nome' é obrigatório";
  if (!body.cpf_cnpj?.trim()) return "Campo 'cpf_cnpj' é obrigatório";
  if (!body.email?.trim()) return "Campo 'email' é obrigatório";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    return "Campo 'email' inválido";
  }
  return null;
}

/** Normaliza o retorno do Supabase (converte count de unidades_consumidoras) */
// deno-lint-ignore no-explicit-any
function normalizeCliente(row: any) {
  const { unidades_consumidoras, ...rest } = row;
  return {
    ...rest,
    total_ucs: unidades_consumidoras?.[0]?.count ?? 0,
  };
}
