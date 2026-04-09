# Exemplos de Backend - Endpoints Necessários

## 1. Express.js (Node.js)

### Instalação de dependências

```bash
npm install express cors dotenv googleapis axios
```

### Implementação Completa

```typescript
import express, { Router } from "express";
import cors from "cors";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// OAuth2 Client Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID || "",
  process.env.GOOGLE_CLIENT_SECRET || "",
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:5173/auth/callback",
);

/**
 * POST /api/auth/google/token
 * Troca o authorization code pelo access token
 */
router.post("/auth/google/token", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code é obrigatório" });
    }

    // Trocar code pelo token
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      return res.status(400).json({ error: "Falha ao obter access token" });
    }

    // OPCIONAL: Salvar refresh token se disponível
    // Usar nos endpoints para renovar token quando expirar
    if (tokens.refresh_token) {
      // Salvar em banco de dados associado ao user
      // await db.users.update({ refreshToken: tokens.refresh_token })
    }

    res.json({
      access_token: tokens.access_token,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date,
    });
  } catch (error: any) {
    console.error("Erro ao obter token:", error);
    res.status(500).json({
      error: error.message || "Erro ao trocar código por token",
    });
  }
});

/**
 * POST /api/emails/save
 * Salva os e-mails com anexos no banco de dados
 */
router.post("/emails/save", async (req, res) => {
  try {
    const { emails, clienteId } = req.body;

    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ error: "Emails inválidos" });
    }

    // Exemplo com Supabase
    // const { data, error } = await supabase
    //   .from('emails')
    //   .insert(
    //     emails.map((email) => ({
    //       id: email.id,
    //       thread_id: email.threadId,
    //       from: email.from,
    //       subject: email.subject,
    //       date: email.date,
    //       cliente_id: clienteId || null,
    //       created_at: new Date(),
    //     }))
    //   );

    // Se usar attachments em tabela separada:
    // emails.forEach(email => {
    //   if (email.attachments.length > 0) {
    //     const attachmentRecords = email.attachments.map(att => ({
    //       email_id: email.id,
    //       filename: att.filename,
    //       mime_type: att.mimeType,
    //       size: att.size,
    //       data: att.data // base64 encoded
    //     }));
    //     // Salvar attachments
    //   }
    // });

    // Resposta de sucesso
    res.json({
      success: true,
      message: `${emails.length} e-mail(s) salvos com sucesso`,
    });
  } catch (error: any) {
    console.error("Erro ao salvar e-mails:", error);
    res.status(500).json({
      error: error.message || "Erro ao salvar e-mails",
    });
  }
});

/**
 * POST /api/emails/process
 * OPCIONAL: Processa e extrai dados dos e-mails
 */
router.post("/emails/process", async (req, res) => {
  try {
    const { emails } = req.body;

    // Aqui você implementaria lógica para:
    // 1. Fazer parsing dos PDFs
    // 2. Extrair dados das faturas
    // 3. Validar dados
    // 4. Salvar em tabelas específicas (faturas_grupo_a, etc)

    res.json({
      success: true,
      message: "E-mails processados",
    });
  } catch (error: any) {
    console.error("Erro ao processar e-mails:", error);
    res.status(500).json({
      error: error.message || "Erro ao processar e-mails",
    });
  }
});

export default router;
```

### main.ts (Setup da aplicação)

```typescript
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  }),
);

app.use(express.json({ limit: "50mb" }));

// Routes
app.use("/api", authRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Server rodando em http://localhost:${PORT}`);
});
```

### .env.server

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback

# Server
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

---

## 2. Supabase Functions

### supabase/functions/auth-google-token/index.ts

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ error: "Code é obrigatório" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Exchange code for token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
        client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
        redirect_uri: "http://localhost:5173/auth/callback",
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokens = await tokenResponse.json();

    return new Response(JSON.stringify(tokens), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
```

### supabase/functions/emails-save/index.ts

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { emails, clienteId } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Salvar e-mails
    const emailRecords = emails.map((email: any) => ({
      gmail_id: email.id,
      thread_id: email.threadId,
      from: email.from,
      subject: email.subject,
      date: new Date(email.date),
      cliente_id: clienteId || null,
    }));

    const { data, error } = await supabase
      .from("emails")
      .insert(emailRecords)
      .select();

    if (error) throw error;

    // OPCIONAL: Salvar anexos em tabela separada
    for (const email of emails) {
      if (email.attachments && email.attachments.length > 0) {
        const attachmentRecords = email.attachments.map((att: any) => ({
          email_id: email.id,
          filename: att.filename,
          mime_type: att.mimeType,
          size: att.size,
          data: att.data,
        }));

        await supabase.from("email_attachments").insert(attachmentRecords);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${emails.length} e-mail(s) salvos`,
        data,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
```

---

## 3. Migrations do Supabase

### supabase/migrations/20260404_create_emails_table.sql

```sql
-- Tabela de e-mails
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gmail_id TEXT UNIQUE NOT NULL,
  thread_id TEXT NOT NULL,
  "from" TEXT NOT NULL,
  subject TEXT,
  date TIMESTAMP,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_emails_gmail_id ON emails(gmail_id);
CREATE INDEX idx_emails_thread_id ON emails(thread_id);
CREATE INDEX idx_emails_cliente_id ON emails(cliente_id);
CREATE INDEX idx_emails_date ON emails(date);

-- Tabela de anexos
CREATE TABLE email_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id TEXT NOT NULL REFERENCES emails(gmail_id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT,
  size INTEGER,
  data TEXT, -- Base64 encoded
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_attachments_email_id ON email_attachments(email_id);
CREATE INDEX idx_attachments_mime_type ON email_attachments(mime_type);
```

---

## 4. Variáveis de Ambiente Completas

### .env (Backend)

```env
# Google OAuth
GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### .env.local (Frontend)

```env
VITE_GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
```

---

## 5. Package.json (Backend)

```json
{
  "name": "status-energy-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/main.ts",
    "build": "tsc",
    "start": "node dist/main.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "googleapis": "^118.0.0",
    "axios": "^1.6.2",
    "@supabase/supabase-js": "^2.37.0"
  },
  "devDependencies": {
    "typescript": "^5.2.2",
    "tsx": "^3.13.0",
    "@types/express": "^4.17.17",
    "@types/node": "^20.3.1"
  }
}
```

---

## Próximos Passos

1. ✅ Escolher a opção de backend (Express, Supabase Functions, etc)
2. ✅ Implementar os endpoints
3. ✅ Testar fluxo OAuth 2.0
4. ✅ Adicionar lógica de parsing de PDFs (bibliotecas: pdfjs, pdf2json)
5. ✅ Implementar processamento de dados das faturas
