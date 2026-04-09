# Guia de Instalação - Sistema de Extração de Faturas

## Dependências Necessárias

Instale as seguintes dependências para usar o sistema de extração de PDFs:

```bash
npm install pdf-parse tesseract.js
npm install --save-dev @types/pdf-parse
```

## Estrutura de Arquivos Criados

### 1. Funções de Extração

**Arquivo:** `src/components/Extracoes/extractionFunctions.ts`

Contém as funções principais de extração:

- `extrairDadosGrupoA()` - Extrai faturas Grupo A com demandas complexas
- `extrairDadosGrupoB()` - Extrai faturas Grupo B simplificadas
- `extrairDadosRuralIrrigante()` - Extrai faturas de propriedades rurais
- `extrairDadosBranca()` - Extrai faturas de classe branca

Funções auxiliares:

- `toFloatBr()` - Converte números brasileiros para floats
- `formatarSaldo()` - Formata saldos removendo unidades
- `limparTexto()` - Limpa e normaliza texto

### 2. Tipos TypeScript

**Arquivo:** `src/types/faturas.ts`

Define as interfaces:

- `FaturaGrupoA` - 100+ campos para Grupo A
- `FaturaGrupoB` - ~25 campos para Grupo B
- `FaturaRuralIrrigante` - Extends FaturaGrupoA
- `FaturaBranca` - Extends FaturaGrupoA
- `ExtractionResult` - Resultado da extração
- `ProcessingStatus` - Status de processamento

### 3. Hook React

**Arquivo:** `src/hooks/useFacturaExtraction.ts`

Fornece:

- `processSingleFile()` - Processa um arquivo
- `processMultipleFiles()` - Processa múltiplos arquivos
- `detectAndExtract()` - Detecta tipo e extrai
- `getStatistics()` - Retorna estatísticas
- Estados: `loading`, `progress`, `error`, `results`

### 4. Componente Exemplo

**Arquivo:** `src/components/Extracoes/ExemploProcessamento.tsx`

Exemplo completo de implementação com:

- Upload de múltiplos PDFs
- Barra de progresso
- Statistiques de sucesso/erro
- Listagem de resultados detalhados

### 5. Documentação

**Arquivo:** `src/components/Extracoes/EXTRACTION_GUIDE.md`

Guia completo com:

- Como usar cada função
- Exemplos de código
- Tratamento de erros
- Explicação do fluxo

## Migrações do Banco de Dados

Foram criadas 4 migrações SQL no diretório `supabase/migrations/`:

1. **20260401000003_create_faturas_grupo_a.sql**
   - Tabela: `public.faturas_grupo_a`
   - 80+ colunas para armazenar dados completos

2. **20260401000004_create_faturas_grupo_b.sql**
   - Tabela: `public.faturas_grupo_b`
   - ~25 colunas estruturadas

3. **20260401000005_create_faturas_rural_irrigante.sql**
   - Tabela: `public.faturas_rural_irrigante`
   - Mesma estrutura de Grupo A

4. **20260401000006_create_faturas_branca.sql**
   - Tabela: `public.faturas_branca`
   - Mesma estrutura de Grupo A

Todas as tabelas incluem:

- Foreign keys para `auth.users` e `unidades_consumidoras`
- Índices para otimização
- Row Level Security (RLS) policies
- Campos de timestamp (`created_at`, `updated_at`)

Aplicar migrações:

```bash
supabase migration up
```

## Uso Básico

### 1. Processar um único arquivo

```typescript
import { useFacturaExtraction } from '@/hooks/useFacturaExtraction';

function MeuComponente() {
  const { processSingleFile, loading, error } = useFacturaExtraction();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await processSingleFile(file);
    if (result?.success) {
      console.log('Fatura extraída:', result.fatura);
    }
  };

  return (
    <div>
      <input type="file" accept=".pdf" onChange={handleUpload} />
      {loading && <p>Processando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

### 2. Processar múltiplos arquivos

```typescript
const { processMultipleFiles, progress, getStatistics } =
  useFacturaExtraction();

const handleMultipleFiles = async (files: File[]) => {
  const results = await processMultipleFiles(files);
  const stats = getStatistics();
  console.log(`Sucesso: ${stats.successCount}/${stats.total}`);
};
```

### 3. Com callbacks

```typescript
const { processMultipleFiles } = useFacturaExtraction({
  onProgress: (p) => console.log(`Progresso: ${p}%`),
  onSuccess: (r) => {
    console.log(`✓ ${r.arquivoNome} - UC: ${r.fatura?.numero_uc}`);
  },
  onError: (e) => {
    console.error(`✗ ${e}`);
  },
});
```

### 4. Salvar no Supabase

```typescript
const { supabase } = useStore();

const salvarFatura = async (fatura: FaturaGrupoA) => {
  const { error } = await supabase.from("faturas_grupo_a").insert({
    user_id: user.id,
    uc_id: unidade.id,
    ...fatura,
  });

  if (error) console.error("Erro ao salvar:", error);
};
```

## Fluxo de Extração Detalhado

```
PDF Upload
    ↓
Buffer Conversion
    ↓
pdf-parse (extract text)
    ↓
Text found?
 ├─ YES → Parse with regex & patterns → Detectar tipo
 └─ NO  → Tesseract.js OCR → Parse with regex & patterns
    ↓
Normalize Brazilian Numbers
    ↓
Fill FaturaGrupoA/B object
    ↓
Return ExtractionResult {
  success: boolean
  fatura: FaturaGrupoA | FaturaGrupoB | null
  tipo: 'grupoA' | 'grupoB' | 'ruralIrrigante' | 'branca'
  error?: string
}
```

## Performance

- **PDF com texto**: ~100-500ms por arquivo
- **PDF com OCR**: ~5-15s por arquivo (depende do tamanho)
- **Processamento paralelo**: Recomenda-se processar até 5 arquivos simultâneamente

## Troubleshooting

### Erro: "Cannot find module 'pdf-parse'"

```bash
npm install pdf-parse
```

### Erro: "Tesseract is not defined"

```bash
npm install tesseract.js
# Reinicie o development server
npm run dev
```

### PDF não é extraído

- Verifique se é um PDF válido
- Tente abrir no Acrobat Reader para validar
- Se for PDF scaneado, depende do OCR (mais lento)

### Dados extraídos incorretos

- Verifique se o PDF segue o padrão da distribuidora
- Pode ser fatura de período diferente (layout pode variar)
- Contribua com melhorias ao regex patterns

## Testes

Para testar com PDFs reais:

```bash
# 1. Copie alguns PDFs para a pasta public/test-pdfs/
# 2. Crie um teste simples:

import { extrairDadosGrupoA } from '@/components/Extracoes/extractionFunctions';

async function testar() {
  const pdf = await fetch('/test-pdfs/fatura-exemplo.pdf');
  const buffer = Buffer.from(await pdf.arrayBuffer());
  const fatura = await extrairDadosGrupoA(buffer);
  console.log(fatura);
}
```

## Próximos Passos Recomendados

1. **Integrar com componente de upload existente**
   - Adaptar `ExemploProcessamento.tsx` para `Extracoes/index.tsx`

2. **Salvar no banco de dados**
   - Criar função para inserir na tabela correta
   - Validar dados antes de salvar

3. **Validação de dados**
   - Criar schema de validação (Zod/Yup)
   - Alertar se dados parecem incorretos

4. **Edição manual**
   - Interface para corrigir dados extraídos
   - Antes de salvar no banco

5. **Relatórios**
   - Dashboard com dados extraídos
   - Consolidação por período

6. **Melhorias no OCR**
   - Configurar melhor detecção de idioma
   - Preprocessor de imagem

7. **Cache**
   - Armazenar PDFs processados
   - Evitar reprocessamento

## Documentação Adicional

- Guia detalhado: `EXTRACTION_GUIDE.md`
- Tipos: `src/types/faturas.ts`
- Código fonte: `extractionFunctions.ts`
- Exemplo: `ExemploProcessamento.tsx`

## Suporte

Para dúvidas ou melhorias:

1. Verifique os exemplos em `EXTRACTION_GUIDE.md`
2. Revise os tipos em `src/types/faturas.ts`
3. Consulte o código comentado em `extractionFunctions.ts`
