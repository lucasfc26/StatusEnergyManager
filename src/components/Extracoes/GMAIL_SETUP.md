# Guia de Configuração - Extração por Gmail

## Visão Geral

Este módulo permite extrair automaticamente faturas de energia enviadas por e-mail usando a API do Gmail. O sistema autentica com sua conta Gmail e busca e-mails com anexos (PDFs) em um intervalo de data/hora especificado.

## Pré-requisitos

1. **Conta Google** - Você precisa ter uma conta Google ativa
2. **Google Cloud Project** - Criar um projeto no Google Cloud Console
3. **Credentials OAuth 2.0** - Gerar credenciais de aplicativo web

## Passo 1: Criar um Google Cloud Project

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Clique em "Criar Projeto"
3. Dê um nome ao projeto (ex: "Status Energy Manager")
4. Clique em "Criar"

## Passo 2: Ativar a API do Gmail

1. No console, vá para "APIs e Serviços" > "Biblioteca"
2. Procure por "Gmail API"
3. Clique em "Gmail API" e depois em "Ativar"

## Passo 3: Criar Credenciais OAuth 2.0

1. Vá para "APIs e Serviços" > "Credenciais"
2. Clique em "Criar Credenciais" > "ID do cliente OAuth 2.0"
3. Selecione "Aplicativo da Web"
4. Configure:
   - **Nome da credencial**: Status Energy Gmail Integration
   - **URIs autorizados de origem**:
     - http://localhost:5173
     - http://localhost:3000
     - https://seu-dominio.com (quando em produção)
   - **URIs autorizados para redirecionamento**:
     - http://localhost:5173/auth/callback
     - http://localhost:3000/auth/callback
     - https://seu-dominio.com/auth/callback (quando em produção)
5. Clique em "Criar"
6. Copie o "Client ID"

## Passo 4: Configurar Variáveis de Ambiente

1. Crie um arquivo `.env` na raiz do projeto (copie de `.env.example`)
2. Adicione seu Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=seu_client_id_copiado_acima.apps.googleusercontent.com
   ```

## Passo 5: Configurar Endpoint de Callback (Backend)

Se você estiver usando um backend separado, crie um endpoint:

```typescript
// Backend - exemplo em Express.js
app.post("/api/auth/google/token", async (req, res) => {
  const { code } = req.body;

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const data = await response.json();
    res.json({ access_token: data.access_token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Como Usar

### 1. Conectar ao Gmail

1. Na seção "Extração por E-mail", clique em "Conectar Gmail"
2. Você será redirecionado para a tela de login do Google
3. Faça login com sua conta Google
4. Autorize o acesso à sua caixa de entrada (a aplicação só lê e-mails)
5. Você será redirecionado de volta à aplicação conectado

### 2. Configurar Extração

Após conectado, você verá campos de configuração:

- **E-mails para extrair**: Informe o e-mail do remetente das faturas
  - Pode adicionar múltiplos e-mails separados por ponto-e-vírgula (;)
  - Exemplo: `contato@enel.com ; faturas@energia.com`

- **Data Inicial**: Especifique a partir de quando buscar e-mails

- **Data Final**: Especifique até quando buscar e-mails

- **Cliente** (opcional): Associe os dados extraídos a um cliente específico

### 3. Iniciar Extração

1. Clique em "Extrair E-mails"
2. O sistema irá:
   - Buscar todos os e-mails do remetente especificado no intervalo de data
   - Filtrar apenas e-mails com anexos
   - Downloaded dos anexos (PDF, XLSX, etc)
   - Salvar os dados no banco de dados

3. Você receberá uma mensagem de sucesso ou erro ao terminar

## Segurança e Privacidade

- ✅ Apenas leitura de e-mails (a aplicação não modifica nenhum e-mail)
- ✅ Token armazenado localmente no navegador (localStorage)
- ✅ Você pode revogar acesso a qualquer momento clicando em "Desconectar"
- ✅ Ao desconectar, o token é revogado nos servidores Google

## Troubleshooting

### Erro: "VITE_GOOGLE_CLIENT_ID não configurado"

- Certifique-se de que a variável de ambiente está no arquivo `.env`
- Recarregue a página (às vezes o build precisa ser refeito)

### Erro: "Token inválido"

- Pode ser que o token tenha expirado ou foi revogado
- Clique em "Desconectar" e depois em "Conectar Gmail" novamente

### Nenhum e-mail encontrado

- Verifique se o e-mail do remetente está correto
- Confirme se existem e-mails nesse período com anexos
- Tente expandir o intervalo de datas

### Erro: "Falha na autenticação"

- Verifique se o Client ID está correto
- Confirme se a URL de redirecionamento no projeto Google Cloud está correta
- Se estiver usando localhost, use `http://` (não HTTPS)

## Arquivos Modificados

1. **EmailExtraction.ts** - Módulo com todas as funções da API do Gmail
2. **index.tsx** - Componente Extracoes com UI e integração
3. **.env.example** - Template de variáveis de ambiente

## Próximos Passos

- [ ] Implementar parsing de faturas a partir dos e-mails
- [ ] Adicionar agendamento automático de extrações
- [ ] Suporte para outros provedores de e-mail
- [ ] Dashboard com histórico de extrações
- [ ] Notificações de sucesso/erro via e-mail
