# Guia de Extração de PDF com Suporte a Senha

## 🔐 Funcionalidade Implementada

Sistema automático de desbloqueio de PDFs protegidos por senha, utilizando informações armazenadas no Supabase.

## 🔄 Fluxo de Funcionamento

### 1. Extração do Número UC do Nome do Arquivo

```
Nome: "Fatura_UC1234567_2024.pdf"
     ↓
Regex: /UC\s*(\d{6,10})/i
     ↓
Resultado: "1234567"
```

**Formatos aceitos:**

- `UC1234567` (sem espaço)
- `UC 1234567` (com espaço)
- `uc1234567` (case-insensitive)
- `Fatura_UC1234567.pdf`
- `documento_uc_1234567.pdf`

### 2. Busca no Supabase

```typescript
SELECT cpf_cpnj
FROM unidades_consumidoras
WHERE numero_uc = '1234567'
LIMIT 1
```

**Resultado esperado:** `cpf_cpnj = "123.456.789-00"` ou `"12345678901234"`

### 3. Extração de Senha

```
CPF/CNPJ: "123.456.789-00"
        ↓
Remove símbolos: "12345678900"
        ↓
Primeiros 5 dígitos: "12345"
        ↓
Usa como senha para o PDF
```

### 4. Desbloqueio do PDF

```javascript
// Primeira tentativa: sem senha
const pdf = await pdfjsLib.getDocument({
  data: uint8Array,
}).promise;

// Se erro de PasswordException: tenta com senha
const pdf = await pdfjsLib.getDocument({
  data: uint8Array,
  password: "12345",
}).promise;
```

## 🧪 Como Testar

### Cenário 1: PDF Protegido com UC no Nome

1. Criar arquivo de teste: `documento_UC1234567_jan2024.pdf`
2. Proteger PDF com senha: `"12345"` (ou qualquer valor)
3. Garantir que existe registro no Supabase:
   ```sql
   SELECT * FROM unidades_consumidoras
   WHERE numero_uc = '1234567'
   ```
4. Fazer CPF/CNPJ começar com `12345...`
5. Carregar arquivo na interface
6. **Esperado:** PDF desbloqueado automaticamente ✅

### Cenário 2: PDF Sem UC no Nome

1. Arquivo: `fatura_janeiro.pdf` (sem UC)
2. **Esperado:** Sistema não tenta desbloquear, processa normalmente
3. Se protegido, mostra erro ❌

### Cenário 3: UC Não Encontrada no Supabase

1. Arquivo: `UC9999999.pdf` (UC inexistente)
2. Sistema log: `⚠️ UC 9999999 não encontrada no Supabase`
3. **Esperado:** Tenta abrir sem senha, se falhar mostra erro ❌

## 📊 Logs Esperados

### Sucesso

```
🔑 Senha extraída do CPF/CNPJ para UC 1234567: 12345
🔐 PDF protegido por senha, tentando com a senha de 5 dígitos...
✅ PDF desbloqueado com sucesso usando a senha!
📄 PDF extraído: 150 linhas encontradas
```

### Sem UC no Nome

```
📄 PDF extraído: 150 linhas encontradas (processa normalmente)
```

### UC Não Encontrada

```
⚠️ UC 9999999 não encontrada no Supabase
✅ PDF desbloqueado com sucesso usando a senha! (se tiver outra estratégia)
```

### Falha Ao Desbloquear

```
🔐 PDF protegido por senha, tentando com a senha de 5 dígitos...
❌ Falha ao desbloquear PDF com a senha: PasswordException
```

## 📝 Dados Necessários no Supabase

Tabela: `unidades_consumidoras`

| Coluna      | Tipo         | Exemplo          | Notas                                |
| ----------- | ------------ | ---------------- | ------------------------------------ |
| `numero_uc` | text/numeric | `1234567`        | Deve corresponder ao nome do arquivo |
| `cpf_cpnj`  | text         | `123.456.789-00` | Com ou sem formatação                |

**O sistema automaticamente extrai os 5 primeiros dígitos numéricos:**

- `"123.456.789-00"` → `"12345"`
- `"12.345.678/0001-90"` → `"12345"`
- `"12345678901234"` → `"12345"`

## 🎯 Casos de Uso

✅ **Quando funciona bem:**

- PDFs protegidos pelo próprio sistema (usando 5 dígitos do CPF/CNPJ)
- Arquivo com UC bem formatado
- Supabase com dados atualizados

⚠️ **Quando não funciona:**

- PDF com senha diferente (ex: senha completa de 8 dígitos)
- UC incorreta no nome do arquivo
- Supabase sem registro correspondente
- PDF sem UC no nome (não tenta desbloquear)

## 🔧 Modificações no Código

### Arquivos Editados:

1. `extractionFunctions.ts`
   - `extrairUCDoNomeArquivo()` - Extrai UC do nome
   - `obterSenhaDouc()` - Busca no Supabase
   - `extractTextFromPdf()` - Modificado para suportar senha
   - Todas as funções de extração agora aceitam `nomeArquivo`

2. `useFacturaExtraction.ts`
   - `detectAndExtract()` - Passa nome do arquivo para extratores
   - Todasas chamadas updated com parâmetro `arquivo`

### Imports Adicionados:

```typescript
import { supabase } from "../../lib/supabase";
```

## 🚀 Próximas Melhorias (Opcionais)

- [ ] Tentar múltiplas estratégias de senha (completo do CPF, variações)
- [ ] Cache de senhas para evitar múltiplas queries ao Supabase
- [ ] Interface para usuário inserir manualmente a senha se automático falhar
- [ ] Registrar tentativas de desbloqueio em log de auditoria
- [ ] Suporte a senhas diferentes por cliente/grupo

## 📞 Suporte

Para debug:

1. Verificar console do navegador (F12) para logs detalhados
2. Verificar se `numero_uc` no Supabase está em texto (não numérico)
3. Testar manualmente: `extrairUCDoNomeArquivo("seu_arquivo.pdf")`
4. Validar formato do CPF/CNPJ no Supabase
