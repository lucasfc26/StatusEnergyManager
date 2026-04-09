# Guia de Debugging - Extração de Faturas

## 📋 Melhorias Implementadas

### 1. **Logs Detalhados de Extração de Texto**

- Adicionado log mostrando quantas linhas foram extraídas do PDF: `📄 PDF extraído: X linhas encontradas`
- Primeiras 20 linhas do PDF são exibidas para inspeção

### 2. **Debugging de Busca de Padrões**

- Log identifica onde encontra padrões importantes (UNIDADE, CLIENTE, NÚMERO, UC)
- Mostra número da linha e conteúdo: `🔎 Buscando padrões`

### 3. **Múltiplas Estratégias de Extração de UC**

O código tenta 4 formas diferentes de extrair o número da UC:

```typescript
// Estratégia 1: Linha com "Se você ainda não tem débito automático"
if (texto.includes("Se você ainda não tem débito automático")) {
  const match = texto.match(/utiliz[aá]ndo\s+o\s+c[óo]digo\s+(\d+)/i);
  // Extrai: "2595111"
}

// Estratégia 2: Linha com "NÚMERO DA UNIDADE CONSUMIDORA"
if (texto.includes("NÚMERO DA UNIDADE CONSUMIDORA")) {
  const proximaLinha = linhas[num + 1];
  // Se próxima linha é só números, usa essa
}

// Estratégia 3: Linha com "Nº DO CLIENTE"
if (texto.includes("Nº DO CLIENTE")) {
  const proximaLinha = linhas[num + 1];
  // Se próxima linha é só números, usa essa
}

// Estratégia 4: Busca em arquivo completo por padrão
```

### 4. **Log Final com Resumo**

Ao final da extração, exibe um resumo dos campos principais extraídos:

```
✅ Grupo B Extração Completa:
  numero_uc: (valor ou "(não encontrado)")
  mes_referencia: (valor ou "(não encontrado)")
  consumo: X
  tarifa_te: X
  tarifa_tusd: X
  subtotal: X
```

---

## 🔍 Como Debugar

### Passo 1: Abrir Console do Navegador

1. Abra a aplicação no navegador
2. Pressione `F12` ou `Ctrl+Shift+I`
3. Vá para a aba "Console"

### Passo 2: Fazer Upload do PDF

1. Clique em "Selecionar PDF" ou arraste o arquivo
2. Observe os logs que aparecem:

```
🔍 Processando: 2595111_032025_grupoB.pdf
📄 Tamanho: X.XX KB
📄 PDF extraído: X linhas encontradas
Primeiras 20 linhas: [...]
🔎 Buscando padrões:
  Linha X: NÚMERO DA UNIDADE CONSUMIDORA
  Linha Y: 2595111
...
✅ Grupo B Extração Completa: {...}
```

### Passo 3: Analisar os Logs

#### ✅ Se `numero_uc` foi encontrado:

- A extração funcionou!
- Procure pelos outros campos importantes (consumo, tarifas, etc)
- Se alguns campos estão vazios, pode ser que o PDF use layout diferente

#### ❌ Se `numero_uc` está "(não encontrado)":

1. **Verifique se o PDF foi extraído com texto:**
   - Se "Primeiras 20 linhas" está vazio = PDF é imagem
   - Sistema tentará OCR automaticamente
   - Aguarde processamento mais longo

2. **Procure a UC manualmente no PDF:**
   - Localize onde está o número da UC (ex: 2595111)
   - Qual é o padrão de linha exatamente?
   - Compare com padrões conhecidos

3. **Verifique a saída de "Buscando padrões":**
   - Encontrou "NÚMERO DA UNIDADE CONSUMIDORA"?
   - Qual era a próxima linha?
   - Era só números?

---

## 🔧 Para Melhorar a Extração Localmente

### 1. Adicione Mais Padrões

Se encontrar um novo padrão, adicione em `src/components/Extracoes/extractionFunctions.ts`:

```typescript
// Adicione DEPOIS do bloco de UC
if (texto.includes("NOVO_PADRÃO") && !fatura.numero_uc) {
  const match = texto.match(/padrão_aqui_(\d+)/);
  if (match) {
    fatura.numero_uc = match[1];
  }
}
```

### 2. Teste Localmente

```bash
# Build e view
npm run dev

# Cole o código console aqui após análise
```

### 3. Procure por Alternativas

Se o código não está na linha com "Se você ainda não tem débito", procure por:

- Seções diferentes (cabeçalho, rodapé, corpo)
- Formatos diferentes (espaçamento, quebras de linha)
- Número formatado diferente (com espaços, hífen, etc)

---

## 📊 Exemplo de Saída Esperada

### Para PDF Grupo B (tipo "B1 RESIDENCIAL"):

```
📄 PDF extraído: 150 linhas encontradas
🔎 Buscando padrões:
  Linha 5: NÚMERO DA UNIDADE CONSUMIDORA
  Linha 6: 2595111
  Linha 42: Se você ainda não tem débito automático, cadastra-se na sua instituição bancária utilizando o código 2595111

✅ Grupo B Extração Completa:
  numero_uc: "2595111"
  mes_referencia: "03/2025"
  consumo: 1091
  tarifa_te: X.XXXX
  tarifa_tusd: X.XXXX
  subtotal: XXX.XX
```

---

## 🆘 Problemas Conhecidos e Soluções

### Problema: "Não foi possível extrair dados válidos"

- **Causa**: `numero_uc` vazio
- **Solução 1**: Verificar se PDF é texto ou imagem (procure "PDF extraído 0 linhas")
- **Solução 2**: Adicionar novo padrão de extração de UC
- **Solução 3**: Verificar se textoEste documento é muito longo, continuar...

### Problema: Consumo/Tarifas Vazios

- **Possível Causa**: Padrão de número não corresponde
- **Dica**: Procure por `Energia Ativa Fornecida` no console
- **Ação**: Compare regex com padrão real

### Problema: OCR Muito Lento

- **Causa**: PDF é imagem, tesseract.js processando
- **Esperado**: Demora 10-30 segundos para PDF em imagem
- **Solução**: Otimizar PDF ou usar versão com texto

---

## 🎯 Próximos Passos

1. **Teste com múltiplos PDFs**
   - ENEL (Ceará)
   - CPFL (São Paulo)
   - Outras distribuidoras

2. **Documente Padrões Encontrados**
   - Crie um arquivo `INVOICE_PATTERNS.md`
   - Descreva layout de cada tipo/distribuidor

3. **Implemente Cache de Padrões**
   - Memorize qual tipo funciona melhor
   - Otimize ordem de tentativa

4. **Adicione Validação Manual**
   - Interface para corrigir dados extraídos
   - Salvar correções para melhorar futuras extrações

---

## 📝 Template para Relatar Problemas

```
**PDF**: [nome do arquivo]
**Tipo**: [Grupo A/B, Distribuidor]
**Problema**: [descrição]

**Logs do Console:**
```

[colar saída do console]

```

**Esperado**: [o que deveria ter sido extraído]
**Obtido**: [o que foi extraído]

**Sugestão**: [como melhorar]
```
