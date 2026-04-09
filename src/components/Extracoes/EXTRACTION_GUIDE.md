# Guia de Extração de PDFs de Faturas

Este módulo permite extrair dados automaticamente de faturas de energia em PDF, usando text extraction (pdf-parse) e OCR (tesseract.js) quando necessário.

## Instalação de Dependências

Antes de usar as funções de extração, instale as seguintes dependências:

```bash
npm install pdf-parse tesseract.js
npm install --save-dev @types/pdf-parse
```

## Estrutura de Dados

O módulo define as seguintes interfaces:

### FaturaGrupoA / FaturaRuralIrrigante / FaturaBranca

Contém mais de 100 campos incluindo:

- Referências (UC, mês, data)
- Dados financeiros (subtotais, tributos)
- Demandas (várias modalidades)
- Tarifas e consumos em 3 períodos: Fora Ponta (FP), Ponta e Reservado
- Créditos e saldo de compensação

### FaturaGrupoB

Estrutura simplificada com:

- Referências básicas
- Tarifas (TE e TUSD)
- Consumo e energia injetada
- Alguns créditos e saldo
- Tributos básicos

## Funções Disponíveis

### 1. Extrair Grupo A

```typescript
import { extrairDadosGrupoA } from "@/components/Extracoes/extractionFunctions";

const pdfBuffer = await file.arrayBuffer(); // Arquivo PDF como Buffer
const fatura = await extrairDadosGrupoA(pdfBuffer);

if (fatura) {
  console.log(`UC: ${fatura.numero_uc}`);
  console.log(`Mês: ${fatura.mes_referencia}`);
  console.log(`Consumo FP: ${fatura.consumo_fp} kWh`);
  // ... outros dados
}
```

### 2. Extrair Grupo B

```typescript
import { extrairDadosGrupoB } from "@/components/Extracoes/extractionFunctions";

const fatura = await extrairDadosGrupoB(pdfBuffer);
if (fatura) {
  console.log(`Consumo: ${fatura.consumo} kWh`);
}
```

### 3. Extrair Rural Irrigante

```typescript
import { extrairDadosRuralIrrigante } from "@/components/Extracoes/extractionFunctions";

const fatura = await extrairDadosRuralIrrigante(pdfBuffer);
```

### 4. Extrair Branca

```typescript
import { extrairDadosBranca } from "@/components/Extracoes/extractionFunctions";

const fatura = await extrairDadosBranca(pdfBuffer);
```

## Fluxo de Extração

1. **Tentativa com pdf-parse**: Extrai o texto diretamente do PDF
2. **Fallback OCR**: Se o PDF não contiver texto (apenas imagens), usa tesseract.js para OCR
3. **Parsing**: Os dados são extraídos usando regex e lógica de busca por padrões
4. **Normalização**: Números brasileiros (com . como milhares e , como decimal) são convertidos

## Exemplo Completo - Upload e Extração em React

```typescript
import { useState } from 'react';
import { extrairDadosGrupoA, extrairDadosGrupoB } from '@/components/Extracoes/extractionFunctions';

export function ProcessadorFaturas() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      try {
        setLoading(true);
        setError(null);

        const buffer = await file.arrayBuffer();

        // Tenta extrair como Grupo A
        let fatura = await extrairDadosGrupoA(Buffer.from(buffer));

        if (fatura && fatura.numero_uc) {
          console.log('Fatura Grupo A extraída:', fatura);
          // Salvar no banco de dados
        } else {
          // Tenta extrair como Grupo B
          fatura = await extrairDadosGrupoB(Buffer.from(buffer));
          if (fatura && fatura.numero_uc) {
            console.log('Fatura Grupo B extraída:', fatura);
          }
        }

        if (!fatura || !fatura.numero_uc) {
          setError(`Não foi possível extrair dados de ${file.name}`);
        }
      } catch (err) {
        setError(`Erro ao processar ${file.name}: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf"
        multiple
        onChange={handleFileUpload}
        disabled={loading}
      />
      {loading && <p>Processando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

## Funções Auxiliares Disponíveis

Estas funções são internas, mas podem ser úteis para debug:

- `toFloatBr(s: string)`: Converte string brasileira para número

  ```typescript
  toFloatBr("1.234,56"); // retorna 1234.56
  ```

- `formatarSaldo(saldo: string)`: Remove unidades (kWh) e formata

  ```typescript
  formatarSaldo("100.000,00 kWh"); // retorna "100000.00"
  ```

- `limparTexto(text: string)`: Remove quebras de linha e caracteres especiais
  ```typescript
  limparTexto("100,00\n"); // retorna "100.00"
  ```

## Tratamento de Erros

As funções retornam `null` se houver erro na extração:

```typescript
const fatura = await extrairDadosGrupoA(pdfBuffer);
if (!fatura) {
  console.error("Falha na extração. Verifique se o PDF é válido.");
}
```

## Limitações

1. **PDFs com imagens**: Requer tesseract.js, que é mais lento
2. **Formatação Personalizada**: PDFs com layouts muito diferentes podem não ser extraídos corretamente
3. **Qualidade de OCR**: PDFs com baixa qualidade podem resultar em dados imprecisos
4. **Performance**: Tesseract.js pode levar alguns segundos para processar

## Próximos Passos

1. Implementar cache de resultados
2. Adicionar validação de dados extraídos
3. Criar interface de visualização e edição dos dados
4. Salvar dados extraídos no Supabase
5. Adicionar relatórios com dados consolidados
