# 🚀 Guia de Testes - Sistema de Extração de Faturas

## Para Testar a Extraç ao de PDF com Debug

### 1️⃣ Inicie o Servidor Dev

```bash
cd "c:\Workspace\Status Energy\StatusEnergyManager"
npm run dev
```

A aplicação abrirá em `http://localhost:5173` (ou porta similar)

---

## 2️⃣ Abra o Console do Navegador

### No Firefox ou Chrome:

1. Pressione <kbd>F12</kbd> ou <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>I</kbd>
2. Abra a aba **Console**
3. Procure por logs começando com `🔍`, `📄`, `🔎`, `✅`, `❌`

---

## 3️⃣ Teste o Upload do PDF

### Opção A: Arrastar e Soltar (Drag & Drop)

1. Na interface, arraste o PDF para a área de upload
2. Observe os logs aparecendo em tempo real

### Opção B: Clicar para Selecionar

1. Clique no botão "Selecionar PDF(s)"
2. Escolha o arquivo
3. Observe os logs

---

## 4️⃣ Leia os Logs em Sequência

### Sequência Esperada de Logs:

```
🔍 Processando: 2595111_032025_grupoB.pdf
📄 Tamanho: X.XX KB
📄 PDF extraído: 150+ linhas encontradas
Primeiras 20 linhas: [
  "ENEL Companhia Energética do Ceará",
  "FATURA",
  ...
]
🔎 Buscando padrões:
  Linha 5: NÚMERO DA UNIDADE CONSUMIDORA
  Linha 8: 2595111
✅ Grupo B Extração Completa: {
  numero_uc: "2595111",
  mes_referencia: "03/2025",
  consumo: 1091,
  tarifa_te: X.XXXX,
  ...
}
```

---

## 5️⃣ Interpretando Resultados

### ✅ Sucesso

- UI mostra resultado em verde
- `numero_uc` não está vazio
- `mes_referencia` preenchido
- Dados aparecem na tabela

### ⚠️ Aviso (Parcial)

- Alguns campos vazios (consumo = 0)
- UC encontrado mas tarifas não
- Verifique logs para qual padrão falhou

### ❌ Falha

- UI mostra em vermelho
- `numero_uc` vazio = "(não encontrado)"
- Se "PDF extraído: 0 linhas" = PDF é imagem, OCR será usado

---

## 6️⃣ Debug Avançado - Adicionar Logs Personalizados

Se precisa investigar um campo específico, edite temporariamente `extractionFunctions.ts`:

### Exemplo: Para debugar extração de consumo

Adicione antes da retorno:

```typescript
console.log("🔍 Consumo Debug:", {
  consumo_extraido: fatura.consumo,
  procurou_por: "Energia Ativa Fornecida",
  proximos_valores: linhas
    .slice(0, 50)
    .filter((l) => l.includes("kWh") || l.includes("Energia")),
});
```

Recompile e teste:

```bash
npm run build
npm run dev
```

---

## 7️⃣ Capturando Logs para Análise

### ChromeDevTools

```
1. Clique botão direito no console
2. "Save as..." para salvar os logs
3. Envie para análise
```

### Copy/Paste Manual

```
1. Selecione todos os logs (Ctrl+A no console)
2. Copie (Ctrl+C)
3. Cole em arquivo .txt
4. Salve como `debug_<data>.txt`
```

### Alternativa: Network Tab

```
1. Abra Network (F12 → Network)
2. Se houver upload para servidor, analise requisições
3. Verifique se dados estão sendo enviados corretamente
```

---

## 📊 Métricas Para Coletar

Para cada PDF testado, registre:

| Campo            | Valor                       |
| ---------------- | --------------------------- |
| **Nome do PDF**  | `2595111_032025_grupoB.pdf` |
| **Tipo**         | Grupo B                     |
| **Distribuidor** | ENEL                        |
| **UC Extraída**  | 2595111 ✓                   |
| **Mês**          | 03/2025 ✓                   |
| **Consumo**      | 1091 ✓                      |
| **Tarifa TE**    | ✓ ou ✗                      |
| **Tarifa TUSD**  | ✓ ou ✗                      |
| **Subtotal**     | ✓ ou ✗                      |
| **Tempo**        | X.XXs                       |
| **Mensagem**     | "Extração bem-sucedida"     |

---

## 🔄 Ciclo de Melhoria

1. **Teste** com PDF
2. **Analise** logs no console
3. **Identifique** qual padrão falhou
4. **Adicione** novo padrão em `extractionFunctions.ts`
5. **Recompile** (`npm run build`)
6. **Reteste** com mesmo PDF

---

## 🎯 Itens Para Verificar

### Verificação 1: Extração Básica de UC

- [ ] UC aparece nos logs
- [ ] UC não é vazio
- [ ] UC é número válido

### Verificação 2: Data/Mês

- [ ] `mes_referencia` formatado MM/YYYY
- [ ] Corresponde ao PDF
- [ ] `data_leitura` preenchida

### Verificação 3: Consumo e Tarifas

- [ ] Consumo está em kWh
- [ ] Tarifas estão em R$/kWh
- [ ] Valores > 0

### Verificação 4: Subtotais Financeiros

- [ ] Subtotal faturamento > 0
- [ ] Tributos (ICMS, PIS, COFINS) extraídos
- [ ] Total realista

### Verificação 5: GD (Geração Distribuída)

- [ ] Se tem painéis solares: `tipo_gd` = GD2 ou GD3
- [ ] Se não tem: `tipo_gd` = GD1
- [ ] `energia_injetada` preenchido se GD

---

## 💡 Dicas Profissionais

### Dica 1: PDF Muito Grande?

- Procure "PDF extraído: 0 linhas"
- Sistema usará OCR (mais lento)
- Achie um PDF com texto nativo

### Dica 2: Alguns Campos Vazios?

- Normal! Nem todos os PDFs têm todos os campos
- Foco no UC, mês, consumo, tarifas (campos principais)

### Dica 3: Testar Múltiplos PDFs?

```bash
# Abra pasta com PDFs
# Teste um por um
# Mantenha histórico de sucessos/falhas
```

### Dica 4: Performance

- Primeiro upload: 2-5 segundos
- PDFs imagem (OCR): 10-30 segundos
- Múltiplos PDFs: sequencial (um por um)

---

## 🔗 Próximas Etapas

1. **Teste este PDF**: `2595111_032025_grupoB.pdf`
2. **Capture os logs**
3. **Compare com esperado**: UC=2595111, Consumo=1091
4. **Reporte resultados**:
   - ✓ Funcionou
   - ✗ Falhou (quais campos)
   - ⚠️ Parcial (quais campos faltaram)

---

## 📞 Precisa de Ajuda?

Se encontrar problema:

1. Capture screenshots dos logs
2. Salve o PDF problemático
3. Anote: qual campo falhou?
4. Refira `DEBUG_GUIDE.md` para análise detalhada
