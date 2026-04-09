# Exemplos de Uso - Extração de PDF com Senha

## Exemplo 1: Usar a Hook no Componente

```typescript
import { useFacturaExtraction } from "../hooks/useFacturaExtraction";

function MeuComponente() {
  const { processMultipleFiles, loading, progress, error, results } =
    useFacturaExtraction({
      onProgress: (p) => console.log(`Progresso: ${p}%`),
      onSuccess: (result) => {
        console.log(`✅ Sucesso: ${result.arquivoNome}`);
        if (result.fatura?.numero_uc) {
          console.log(`UC encontrada: ${result.fatura.numero_uc}`);
        }
      },
      onError: (err) => console.error(`❌ Erro: ${err}`),
    });

  const handleFileSelect = async (arquivos: File[]) => {
    const resultados = await processMultipleFiles(arquivos);
    // resultados agora contêm dados com suporte a PDFs protegidos
    resultados.forEach((r) => {
      if (r.success) {
        salvarNoSupabase(r.fatura);
      }
    });
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept=".pdf"
        onChange={(e) => handleFileSelect(Array.from(e.currentTarget.files || []))}
      />
      {loading && <p>Processando... {progress.toFixed(0)}%</p>}
    </div>
  );
}
```

## Exemplo 2: Testes Unitários

```typescript
import { describe, it, expect, vi } from "vitest";
import * as extractionFunctions from "../extractionFunctions";

describe("Extração de UC do Arquivo", () => {
  it("deve extrair UC bem formatado", () => {
    // Simulando a função (pois é privada)
    const nomeArquivo = "fatura_UC1234567_jan2024.pdf";
    const match = nomeArquivo.match(/UC\s*(\d{6,10})/i);
    expect(match?.[1]).toBe("1234567");
  });

  it("deve aceitar UC com espaço", () => {
    const nomeArquivo = "fatura_UC 1234567.pdf";
    const match = nomeArquivo.match(/UC\s*(\d{6,10})/i);
    expect(match?.[1]).toBe("1234567");
  });

  it("deve ser case-insensitive", () => {
    const nomeArquivo = "fatura_uc1234567.pdf";
    const match = nomeArquivo.match(/UC\s*(\d{6,10})/i);
    expect(match?.[1]).toBe("1234567");
  });

  it("deve retornar string vazia se UC inválida", () => {
    const nomeArquivo = "fatura.pdf";
    const match = nomeArquivo.match(/UC\s*(\d{6,10})/i);
    expect(match).toBeNull();
  });
});
```

## Exemplo 3: Setup de Teste com PDF Protegido

```bash
# Criar arquivo PDF protegido com PyPDF para teste
pip install PyPDF2

# Script Python para proteger PDF
python3 << 'EOF'
from PyPDF2 import PdfWriter
from pathlib import Path

# Ler PDF original
reader = PdfWriter()
reader.append("fatura_original.pdf")

# Proteger com senha
reader.encrypt("12345")

# Salvar como novo arquivo
with open("teste_UC1234567_jan2024.pdf", "wb") as output:
    reader.write(output)

print("✅ PDF protegido criado: teste_UC1234567_jan2024.pdf")
print("🔐 Senha: 12345")
EOF
```

## Exemplo 4: Estrutura de Dados no Supabase

```sql
-- Criar/Verificar tabela
CREATE TABLE IF NOT EXISTS unidades_consumidoras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_uc TEXT UNIQUE NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  cpf_cpnj TEXT NOT NULL,
  estado TEXT,
  cidade TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Exemplo de dados para teste
INSERT INTO unidades_consumidoras
  (numero_uc, cliente_id, cpf_cpnj, estado, cidade)
VALUES
  ('1234567', 'uuid-do-cliente', '123.456.789-00', 'SP', 'São Paulo'),
  ('7654321', 'uuid-do-cliente', '987.654.321-11', 'RJ', 'Rio de Janeiro');

-- Consultar para teste
SELECT numero_uc, cpf_cpnj FROM unidades_consumidoras WHERE numero_uc = '1234567';
```

## Exemplo 5: Depuração e Logging

```typescript
// No console do navegador (F12)

// Ver logs de extração UC
window.localStorage.setItem("debug", "*:*"); // se usando library 'debug'

// Teste manual de extração UC
const testarExtracao = (nomeArquivo: string) => {
  const regex = /UC\s*(\d{6,10})/i;
  const match = nomeArquivo.match(regex);
  console.log(`Arquivo: ${nomeArquivo}`);
  console.log(`UC encontrada: ${match?.[1] || "(nenhuma)"}`);
};

testarExtracao("fatura_UC1234567_2024.pdf"); // "1234567"
testarExtracao("documento.pdf"); // "(nenhuma)"

// Ver status de busca no Supabase
const { data } = await supabase
  .from("unidades_consumidoras")
  .select("numero_uc, cpf_cpnj")
  .eq("numero_uc", "1234567")
  .single();

console.log(data); // { numero_uc: '1234567', cpf_cpnj: '123.456.789-00' }
```

## Exemplo 6: Tratamento de Erros Esperados

```typescript
// Simulando diferentes cenários

// Cenário 1: Sucesso
// Arquivo: documento_UC1234567.pdf
// Supabase: tem registro com cpf_cpnj = "123.456.789-00"
// PDF: protegido com senha "12345"
// Resultado: ✅ Desbloqueado e processado

// Cenário 2: PDF não protegido
// Arquivo: documento_UC1234567.pdf
// PDF: sem proteção
// Resultado: ⚠️ Abre normalmente, ignora tentativa de senha

// Cenário 3: UC não encontrada
// Arquivo: documento_UC9999999.pdf
// Supabase: nenhum registro
// Resultado: ⚠️ Tenta abrir sem senha, se falhar retorna erro

// Cenário 4: Senha errada
// Arquivo: documento_UC1234567.pdf
// Supabase: tem registro com cpf_cpnj "999.999.999-99"
// PDF: protegido com senha "12345" (mas tentará "99999")
// Resultado: ❌ Falha ao desbloquear
```

## Exemplo 7: Integração com API Posterior

```typescript
// Após extrair com sucesso, salvar no Supabase

async function salvarFaturasExtraidas(results: ExtractionResult[]) {
  for (const result of results) {
    if (!result.success || !result.fatura) continue;

    const { data: faturaData, error } = await supabase
      .from("faturas_grupo_a") // ou apropriada
      .insert({
        numero_uc: result.fatura.numero_uc,
        mes_referencia: result.fatura.mes_referencia,
        data_leitura: result.fatura.data_leitura,
        // ... outros campos
        arquivo_origem: result.arquivoNome,
        data_extracao: result.dataExtracao,
        tipo_fatura: result.tipo,
      });

    if (error) {
      console.error(`Erro ao salvar ${result.arquivoNome}:`, error);
    } else {
      console.log(
        `✅ Salvo: ${result.arquivoNome} (UC: ${result.fatura.numero_uc})`,
      );
    }
  }
}
```

## Exemplo 8: Monitoramento de Performance

```typescript
// Medir tempo de extração com e sem senha

async function mediTempoExtracao(file: File) {
  const inicio = performance.now();

  const result = await useFacturaExtraction().processSingleFile(file);

  const fim = performance.now();
  const tempo = (fim - inicio).toFixed(2);

  console.log(`⏱️ Tempo de extração: ${tempo}ms`);
  console.log(`📊 Arquivo: ${file.name}`);
  console.log(`✅ Sucesso: ${result?.success}`);

  if (result?.fatura?.numero_uc) {
    console.log(`🔑 UC: ${result.fatura.numero_uc}`);
  }
}
```

## Dicas de Debugging

### 1. Verificar se UC está sendo extraído corretamente

```typescript
// Abrir DevTools (F12) e rodar:
const nome = "fatura_UC1234567.pdf";
console.log(nome.match(/UC\s*(\d{6,10})/i));
// Esperado: [ 'UC1234567', '1234567', index: 7, input: '...', groups: undefined ]
```

### 2. Verificar se Supabase encontra a UC

```typescript
import { supabase } from "@/lib/supabase";

const { data, error } = await supabase
  .from("unidades_consumidoras")
  .select("*")
  .eq("numero_uc", "1234567");

console.log({ data, error });
```

### 3. Validar formato do CPF/CNPJ

```typescript
const cpfCnpj = "123.456.789-00";
const numeros = cpfCnpj.replace(/\D/g, "");
const senha = numeros.substring(0, 5);
console.log({ original: cpfCnpj, numeros, senha }); // { original: ..., numeros: '12345678900', senha: '12345' }
```

### 4. Forçar logging detalhado

```typescript
// No início do arquivo extractionFunctions.ts
console.debug = console.log; // Converter todos os logs

// Ou no seu componente:
const origLog = console.log;
console.log = (...args: any[]) => {
  origLog(`[${new Date().toISOString()}]`, ...args);
};
```
