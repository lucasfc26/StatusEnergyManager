# Interface Visual - Extração por E-mail

## Layout Antes vs Depois

### ANTES (Em Desenvolvimento)

```
┌─────────────────────────────────────────┐
│  Extração por E-mail                    │
│  ──────────────────────────────────────  │
│  Conecte sua conta Gmail...              │
│                                          │
│  ⏳ Em desenvolvimento                  │
│                                          │
│  [ ✗ Conectar Gmail (desabilitado) ]    │
└─────────────────────────────────────────┘
```

### DEPOIS (Implementado)

#### Estado: Não Conectado

```
┌─────────────────────────────────────────────────┐
│  📧 Extração por E-mail                         │
│  ===================================================
│  Conecte sua conta Gmail para extrair faturas   │
│  automaticamente                                │
│                                                  │
│  ┌─────────────────────────────────────────────┐│
│  │ Clique em "Conectar Gmail" para autenticar  ││
│  └─────────────────────────────────────────────┘│
│                                                  │
│  [ 📧 Conectar Gmail ]                         │
│                                                  │
└─────────────────────────────────────────────────┘
```

#### Estado: Conectado

```
┌──────────────────────────────────────────────────────┐
│  📧 Extração por E-mail                              │
│  =====================================================
│  Conecte sua conta Gmail para extrair faturas        │
│  automaticamente                                     │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ ✅ Conectado                                      ││
│  │    seu.email@gmail.com                           ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  [ 🔴 Desconectar ]                                │
│                                                      │
│  ═══════════════════════════════════════════════════ │
│                                                      │
│  E-mails para extrair                              │
│  ┌──────────────────────────────────────────────────┐│
│  │ faturas@xyz.com ; contato@abc.com               ││
│  │ Separe múltiplos e-mails com ponto-e-vírgula (;)││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  Data Inicial          │  Data Final               │
│  ┌──────────────────┐  │  ┌──────────────────┐   │
│  │ 01/01/2024      │  │  │ 31/03/2024       │   │
│  └──────────────────┘  │  └──────────────────┘   │
│                                                      │
│  Cliente (opcional)                                │
│  ┌──────────────────────────────────────────────────┐│
│  │ Selecionar cliente...                ▼          ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  [ 📥 Extrair E-mails ]                           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### Estado: Extraindo

```
┌──────────────────────────────────────────────────────┐
│  📧 Extração por E-mail                              │
│  (... configuração igual à acima ...)               │
│                                                      │
│  [ 🔄 Extraindo... ]  (desabilitado)               │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### Mensagens de Sucesso

```
┌──────────────────────────────────────────────────────┐
│  ✅ Extração concluída! 15 e-mail(s) com anexo(s)   │
│     processado(s).                                   │
└──────────────────────────────────────────────────────┘
```

#### Mensagens de Erro

```
┌──────────────────────────────────────────────────────┐
│  ⚠️ Informe pelo menos um e-mail para extrair       │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  ⚠️ Defina o intervalo de datas                      │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  ⚠️ Data inicial deve ser anterior à data final      │
└──────────────────────────────────────────────────────┘
```

---

## Fluxo de Interação

### 1️⃣ Conexão Inicial

```
┌─────────────────────────────────────────┐
│ Usuario clica em "Conectar Gmail"       │
└─────────────────────────────────────────┘
                    ↓
        Redirecionado para Google
        └─ Login na conta Google
        └─ Autorizar acesso
                    ↓
┌─────────────────────────────────────────┐
│ Retorna com token + email configurado   │
│ Interface agora mostra campos para       │
│ configurar extração                      │
└─────────────────────────────────────────┘
```

### 2️⃣ Configuração de Extração

```
┌─────────────────────────────────────────┐
│ Usuario preenche:                       │
│ • E-emails do remetente                 │
│ • Data inicial e final                  │
│ • Cliente (opcional)                    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ Clica em "Extrair E-mails"              │
└─────────────────────────────────────────┘
```

### 3️⃣ Processamento

```
┌─────────────────────────────────────────┐
│ Validar configuração                    │
│ Construir query Gmail                   │
│ Buscar e-mails na API do Gmail          │
│ Fazer download de anexos                │
│ Salvar no banco de dados                │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ ✅ Mostrar mensagem de sucesso          │
│ com número de e-mails processados       │
└─────────────────────────────────────────┘
```

---

## Responsividade

### Desktop (1024px+)

```
┌────────────────────────────────────────────────────────────┐
│                  Extração de Faturas                       │
├────────────────────────────────┬───────────────────────────┤
│                                │                           │
│  Upload de PDF                 │  Extração por E-mail     │
│  ┌──────────────────────────┐  │  ┌───────────────────┐  │
│  │ (área grande com upload) │  │  │ (configuração)    │  │
│  └──────────────────────────┘  │  └───────────────────┘  │
│                                │                           │
│  Cliente (opcional)            │  Extração ENEL           │
│  ┌──────────────────────────┐  │  ┌───────────────────┐  │
│  │ Selecionar cliente...    │  │  │ (em desenvolvimento)│  │
│  └──────────────────────────┘  │  └───────────────────┘  │
│                                │                           │
│  [Enviar e Extrair]            │                           │
│                                │                           │
└────────────────────────────────┴───────────────────────────┘
```

### Mobile (<1024px)

```
┌──────────────────────────────┐
│  Extração de Faturas         │
│ ─────────────────────────────│
│                              │
│  Upload de PDF               │
│  ┌────────────────────────┐ │
│  │ (área de upload)       │ │
│  └────────────────────────┘ │
│                              │
│  Cliente (opcional)          │
│  ┌────────────────────────┐ │
│  │ Selecionar cliente...  │ │
│  └────────────────────────┘ │
│                              │
│  [Enviar e Extrair]          │
│                              │
│ ─────────────────────────────│
│                              │
│  Extração por E-mail         │
│  ┌────────────────────────┐ │
│  │ (configuração)         │ │
│  └────────────────────────┘ │
│                              │
│  [Conectar Gmail]            │
│                              │
│ ─────────────────────────────│
│                              │
│  Extração ENEL               │
│  ┌────────────────────────┐ │
│  │ (em desenvolvimento)   │ │
│  └────────────────────────┘ │
│                              │
│  [Conectar ENEL]             │
│                              │
└──────────────────────────────┘
```

---

## Cores e Ícones

### Estados da Conexão

```
✅ Conectado      → Verde (emerald-600)
❌ Desconectado   → Azul (blue-600)
⏳ Em processo    → Amarelo (yellow-600)
⚠️ Erro           → Vermelho (red-600)
```

### Ícones Usados

```
📧 Mail - Conexão/E-mail
🔄 RefreshCw - Carregamento
✅ CheckCircle - Sucesso
⚠️ AlertCircle - Erro
📥 Download - Extração
🚫 LogOut - Desconexão
```

---

## Validações Frontend

### Antes de Conectar

```
❌ Nenhuma validação (botão sempre ativado)
```

### Antes de Extrair

```
❌ E-mails vazios → "Informe pelo menos um e-mail"
❌ Datas vazias → "Defina o intervalo de datas"
❌ Data início >= Data fim → "Data inicial deve ser anterior à data final"
❌ Sem Gmail conectado → "Gmail não configurado"
```

### Validações Backend (ao salvar)

```
❌ E-mails inválidos → Retorna erro
❌ Token expirado → Retorna erro de autenticação
❌ Limite de requisições → Rate limit error
```

---

## Estados Possíveis do Componente

1. **Não Conectado** - Mostra botão conectar
2. **Conectando** - Redirecionando para Google
3. **Conectado** - Mostra configurações
4. **Validando** - Verificando token
5. **Extraindo** - Em processamento
6. **Sucesso** - Mensagem de conclusão
7. **Erro** - Mensagem de erro
8. **Desconectando** - Revogando token

---

## Tema Escuro Integrado

```
Luz:
├─ Background: white
├─ Texto: gray-900
└─ Bordas: gray-200

Escuro:
├─ Background: gray-800
├─ Texto: white
└─ Bordas: gray-700
```

Todos os componentes têm suporte completo a tema escuro com classes `dark:`.
