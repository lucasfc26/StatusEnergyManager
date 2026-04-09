# Checklist de Integração - Gmail API

## ✅ Implementação Concluída

- [x] EmailExtraction.ts - Todas as funções da API do Gmail
- [x] UI do componente Extracoes com configurações
- [x] Gerenciamento de estado do Gmail
- [x] Documentação de setup

## 📋 Próximos Passos - Checklist

### 1. Setup Google Cloud

- [ ] Criar projeto em https://console.cloud.google.com/
- [ ] Ativar Gmail API
- [ ] Criar credenciais OAuth 2.0
- [ ] Copiar Client ID

### 2. Configuração Local

- [ ] Criar arquivo `.env.local`
- [ ] Adicionar `VITE_GOOGLE_CLIENT_ID=seu_client_id`

### 3. Backend (IMPORTANTE)

- [ ] Criar endpoint `POST /api/auth/google/token`
  - Input: { code }
  - Output: { access_token }
  - Usar library: `googleapis` ou fazer request manual

### 4. Testar

- [ ] Clicar em "Conectar Gmail"
- [ ] Fazer login na conta Google
- [ ] Confirmar que aparece "Conectado" com email
- [ ] Preencher dados de extração
- [ ] Clicar em "Extrair E-mails"

## 🔗 Endpoints Necessários

### Backend Express.js (exemplo)

```typescript
import { google } from "googleapis";

app.post("/api/auth/google/token", async (req, res) => {
  const { code } = req.body;

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    const { tokens } = await oauth2Client.getToken(code);
    res.json({ access_token: tokens.access_token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/emails/save", async (req, res) => {
  const { emails, clienteId } = req.body;

  // Implementar salvamento no banco de dados
  // await supabase.from('emails').insert(emails);

  res.json({ success: true });
});
```

### Supabase Functions (alternativa)

```typescript
// supabase/functions/auth-google/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { code } = await req.json();

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
      redirect_uri: Deno.env.get("GOOGLE_REDIRECT_URI")!,
      grant_type: "authorization_code",
    }).toString(),
  });

  const tokens = await tokenResponse.json();
  return new Response(JSON.stringify(tokens));
});
```

## 🎯 Como Testar Localmente

1. **Iniciar dev server**

   ```bash
   npm run dev
   ```

2. **Verificar variáveis de ambiente**

   ```
   Deve aparecer no console se GOOGLE_CLIENT_ID está correto
   ```

3. **Testar autenticação**
   - Abrir em http://localhost:5173
   - Ir para Extração > Extração por E-mail
   - Clique em "Conectar Gmail"
   - Deve redirecionar para google.com
   - Após aceitar, volta para a aplicação

4. **Testar extração**
   - Preencher campos de configuração
   - Clique em "Extrair E-mails"
   - Desabilitar CORS se necessário para testes

## 🔐 Variáveis de Ambiente Completas

```env
# Frontend (.env.local)
VITE_GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com

# Backend (.env)
GOOGLE_CLIENT_ID=sua_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
GMAIL_API_KEY=sua_api_key
```

## 📱 URLs de Redirecionamento Necessárias

No Google Cloud Console, adicione:

**Desenvolvimento:**

- http://localhost:5173/auth/callback
- http://127.0.0.1:5173/auth/callback

**Produção:**

- https://seu-dominio.com/auth/callback
- https://www.seu-dominio.com/auth/callback

## 🐛 Troubleshooting

| Erro                            | Solução                                           |
| ------------------------------- | ------------------------------------------------- |
| "GOOGLE_CLIENT_ID não definido" | Adicionar em .env.local e reiniciar dev server    |
| "CORS error"                    | Endpoint de callback não está implementado        |
| "Token inválido"                | Verificar se backend está devolvendo access_token |
| "E-mails não encontrados"       | Verificar data/hora e remetente no Gmail          |

## 📚 Referências

- [Gmail API Docs](https://developers.google.com/gmail/api/guides)
- [OAuth 2.0 Flows](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
