# 🔧 Diagnóstico - Erro de Query no Supabase

## Problema Encontrado

```
GET https://yzfyiwvuurcsihkfylyq.supabase.co/rest/v1/unidades_consumidoras?select=cpf_cpnj&numero_uc=eq.9002368&limit=1
400 (Bad Request)
```

## Possíveis Causas

### 1. ❌ Coluna `numero_uc` não existe ou tem nome diferente

**Como verificar:**

```sql
-- No SQL Editor do Supabase
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'unidades_consumidoras';
```

**O que procurar:**

- Coluna deve existir exatamente como `numero_uc` (maiúsculas/minúsculas importam!)
- Coluna deve estar sendo retornada na lista

---

### 2. ❌ Problema de RLS (Row Level Security)

Se a tabela tem RLS ativado, a consulta sem autenticação pode falhar.

**Como verificar:**

1. Abra o Supabase Dashboard
2. Vá para: **Tables > unidades_consumidoras > RLS**
3. Verifique se há políticas ativadas

**Solução possível:**

```sql
-- Verificar RLS na tabela
SELECT * FROM pg_tables
WHERE tablename = 'unidades_consumidoras'
AND rowsecurity = true;

-- Se houver RLS, pode precisar adicionar política:
ALTER TABLE unidades_consumidoras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for anon" ON unidades_consumidoras
  FOR SELECT
  TO anon
  USING (true);
```

---

### 3. ⚠️ Coluna `numero_uc` está como número (não texto)

Mesmo que seja TEXT, verificar o tipo de dado:

```sql
-- Verificar tipo de dado
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'unidades_consumidoras'
AND column_name = 'numero_uc';
```

**Tipo esperado:** `text` ou `character varying`

**Se for numérico:** pode precisar converter na query:

```typescript
.eq("numero_uc", String(numeroUc))  // Converter para string
```

---

### 4. ⚠️ Problema de espaços em branco ou formatação

A UC no banco pode ter:

- Espaços: `" 9002368"`
- Zeros à esquerda: `"0009002368"`
- Formatação: `"9002-368"`

**Solução:** Já implementada no código (tenta múltiplas variações)

---

## 🧪 Teste Manual no Supabase

### Teste 1: Via SQL Editor

```sql
-- Copie e execute no Supabase SQL Editor
SELECT * FROM unidades_consumidoras
WHERE numero_uc = '9002368';

-- Ou com diferentes formatações
SELECT * FROM unidades_consumidoras
WHERE numero_uc = '0009002368';

SELECT * FROM unidades_consumidoras
WHERE numero_uc LIKE '%9002368%';
```

### Teste 2: Via JavaScript Console

```javascript
// Abra DevTools (F12) do navegador e execute:

import { supabase } from "./src/lib/supabase.ts";

// Teste simples
const { data, error } = await supabase
  .from("unidades_consumidoras")
  .select("*")
  .eq("numero_uc", "9002368");

console.log({ data, error });

// Se falhar, tente sem o eq:
const { data: dados2, error: erro2 } = await supabase
  .from("unidades_consumidoras")
  .select("*")
  .limit(1);

console.log("Primeiros registros:", { dados2, erro2 });
```

### Teste 3: Verificar Coluna Exata

```javascript
// Verificar quais colunas existem
const { data: allData } = await supabase
  .from("unidades_consumidoras")
  .select("*")
  .limit(1);

console.log("Colunas disponíveis:", Object.keys(allData?.[0] || {}));
```

---

## ✅ Checklist de Diagnóstico

- [ ] Tabela `unidades_consumidoras` existe no Supabase
- [ ] Coluna `numero_uc` existe na tabela
- [ ] Coluna `cpf_cpnj` existe na tabela
- [ ] Tipo de dados é `TEXT` ou `VARCHAR` (não numérico)
- [ ] RLS está desativado OU tem política correta
- [ ] Anon key está configurada no `.env.local`
- [ ] Dados de teste existem na tabela:
  ```sql
  SELECT COUNT(*) FROM unidades_consumidoras WHERE numero_uc = '9002368';
  ```

---

## 🚀 Soluções Rápidas

### Se a coluna tem nome diferente:

```typescript
// Modifique a função obterSenhaDouc:
const { data } = await supabase
  .from("unidades_consumidoras")
  .select("cpf_cpnj")
  .eq("nome_coluna_correta", ucString) // Mude o nome aqui
  .single();
```

### Se está como numérico:

```typescript
// Converta para número:
.eq("numero_uc", parseInt(ucString, 10))
```

### Se tem RLS bloqueando:

No Supabase Dashboard:

1. **Tables > unidades_consumidoras > RLS**
2. **Disable RLS** OU
3. **New Policy > SELECT > For: Anon > Using: true**

---

## 📊 Dados de Teste Esperados

A tabela deve ter:

```
numero_uc  | cpf_cpnj           | ... (outras colunas)
-----------|--------------------
9002368    | 123.456.789-00     | ...
1234567    | 987.654.321-11     | ...
```

---

## 🔍 Logs que Indicam Sucesso

Quando funcionar, você verá:

```
✨ UC extraída do arquivo "fatura_UC9002368.pdf": "9002368"
🔍 Buscando UC "9002368" no Supabase...
✅ UC encontrada com variação "9002368" | Senha extraída: 12345
```

---

## 📞 Próximos Passos

1. Verifique os testes acima
2. Confirme que a coluna `numero_uc` existe e é TEXT
3. Execute a query SQL manualmente para ver se retorna dados
4. Verifique as políticas de RLS
5. Se ainda não funcionar, compartilhe:
   - Nome exato da coluna (com maiúsculas)
   - Tipo de dados da coluna
   - Se RLS está ativado

---

## 🎯 Possível Erro Adicional

Se a mensagem for `400 Bad Request` especificamente, pode ser:

- Caracteres especiais na coluna
- Problema com query builder do `supabase-js`
- Coluna não existe e está sendo escapada incorretamente

**Debug rápido:**

```javascript
// Teste diretamente sem filter
const { data, error } = await supabase
  .from("unidades_consumidoras")
  .select("numero_uc, cpf_cpnj")
  .limit(5);

console.log("Amostra de dados:", data);
```
