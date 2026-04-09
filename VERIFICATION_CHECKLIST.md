# ✅ Checklist de Verificação - Extração de Faturas

## 🎯 Antes de Começar os Testes

- [ ] Projeto compilado sem erros: `npm run build` ✓
- [ ] Dependências instaladas: pdfjs-dist, tesseract.js
- [ ] Arquivo PDF disponível: `2595111_032025_grupoB.pdf`
- [ ] VS Code com DevTools do navegador aberto (F12)

---

## 📋 Verificação 1: Extração de Texto do PDF

### Logs Esperados

```
📄 PDF extraído: 100+ linhas encontradas
Primeiras 20 linhas: [
  "ENEL Companhia Energética do Ceará",
  "FATURA",
  ...
]
```

### Checklist

- [ ] Este log aparece?
- [ ] Número de linhas > 50?
- [ ] Conteúdo começa com nome da distribuidora ou "FATURA"?

### Se Falhar ❌

- [ ] PDF é válido? Tente abrir no Acrobat Reader
- [ ] É uma imagem escaneada? (Próximo passo será OCR)
- [ ] Arquivo corrompido? Tente outro PDF

### Ação

✓ **Sucesso**: Prossiga para Verificação 2
✗ **Imagem/OCR**: Aguarde 10-30s, depois verifique Verificação 2

---

## 🔐 Verificação 2: Extração de UC (Número da Unidade)

### Logs Esperados

```
🔍 Processando: 2595111_032025_grupoB.pdf
🔎 Buscando padrões:
  Linha 5: NÚMERO DA UNIDADE CONSUMIDORA
  Linha 8: 2595111
📍 UC extraída: "2595111"
```

### Checklist

- [ ] Encontrou "NÚMERO DA UNIDADE CONSUMIDORA"?
- [ ] Próxima linha é exatamente "2595111"?
- [ ] Log mostra `UC extraída: "2595111"`?

### Se Falhar ❌ (UC vazia)

- [ ] Procure manualmente no PDF: onde está o número 2595111?
- [ ] Qual é a linha ANTES dela?
- [ ] Qual é a linha DEPOIS dela?
- [ ] Atualize `DEBUG_GUIDE.md` com novo padrão

### Ação

✓ **UC encontrada**: Prossiga para Verificação 3
✗ **UC não encontrada**: Registre padrão, aguarde Verificação 5

---

## 📊 Verificação 3: Extração de Data/Mês

### Logs Esperados (Procure por)

```
✅ Grupo B Extração Completa:
  ...
  mes_referencia: "03/2025"
  data_leitura: "03/04/2025"
  ...
```

### Checklist

- [ ] `mes_referencia` = "03/2025"? (MM/YYYY formato)
- [ ] `data_leitura` = "03/04/2025"? (DD/MM/YYYY formato)
- [ ] Correspond ao PDF?

### Se Falhar ❌ (Data vazia)

- [ ] Procure "TRIFÁSICO" ou "MONOFÁSICO" no PDF
- [ ] Qual é a data próxima a essa palavra?
- [ ] Atualize padrão de data em `extractionFunctions.ts`

---

## 📈 Verificação 4: Extração de Consumo e Tarifas

### Logs Esperados

```
✅ Grupo B Extração Completa:
  ...
  consumo: 1091
  tarifa_te: X.XXXX
  tarifa_tusd: X.XXXX
  subtotal: 200.XX
```

### Checklist

- [ ] `consumo` > 0? (deveria ser 1091)
- [ ] `tarifa_te` > 0?
- [ ] `tarifa_tusd` > 0?
- [ ] `subtotal` > 0?

### Se Falhar ❌ (Campos em 0)

- [ ] Procure no PDF: onde está "1091 kWh"?
- [ ] Procure no PDF: onde estão as tarifas?
- [ ] Qual padrão de linha contém esses valores?
- [ ] Adicione novo padrão em `extractionFunctions.ts`

---

## 🔢 Verificação 5: Extração de Tributos

### Logs Esperados

```
✅ Grupo B Extração Completa:
  ...
  icms: XX.XX
  pis_pasep: XX.XX
  cofins: XX.XX
  cip: XX.XX (se houver)
```

### Checklist

- [ ] `icms` > 0?
- [ ] `pis_pasep` > 0?
- [ ] `cofins` > 0?
- [ ] `cip` > 0 ou = 0? (nem todo PDF tem CIP)

### Nota

Nem todos os PDFs têm todos os tributos. Isso é normal.

---

## ☀️ Verificação 6: GD (Geração Distribuída) - se aplicável

### Para PDFs SEM Painéis Solares

- [ ] `tipo_gd` = "GD1"?
- [ ] `energia_injetada` = 0?
- [ ] `credito_utilizado_real` = 0?

### Para PDFs COM Painéis Solares

- [ ] `tipo_gd` = "GD2" ou "GD3"?
- [ ] `energia_injetada` > 0?
- [ ] `saldo_atualizado` > 0?

---

## 🎯 Verificação 7: UI (Interface)

### Checklist

- [ ] Resultado aparece na tela (não em console)?
- [ ] Cores estão corretas?
  - ✅ Verde = Sucesso
  - ❌ Vermelho = Erro
  - ⚠️ Amarelo = Aviso
- [ ] Tabela com dados visível?
- [ ] Botão expandir/retrair funciona?

### Se Falhar

- [ ] Abra DevTools (F12) → Network
- [ ] Procure por erros de JavaScript
- [ ] Verifique console por `Erro ao processar`

---

## 📊 Verificação Final: Comparar com PDF

| Campo       | PDF      | Sistema | ✓/✗ |
| ----------- | -------- | ------- | --- |
| UC          | 2595111  | ?       |     |
| Mês         | 03/2025  | ?       |     |
| Consumo     | 1091 kWh | ?       |     |
| Tarifa TE   | ?        | ?       |     |
| Tarifa TUSD | ?        | ?       |     |
| Subtotal    | ?        | ?       |     |
| ICMS        | ?        | ?       |     |

### Checklist

- [ ] Preencheu todos os campos?
- [ ] Todos têm ✓?
- [ ] Se há ✗, atualize `DEBUG_GUIDE.md`

---

## 🚀 Próximos Passos Baseado em Resultados

### ✅ Se TUDO passou

1. Testar com mais PDFs
2. Diferentes distribuidoras (CPFL, Light, etc)
3. Diferentes tipos (Grupo A, Rural, Branca)
4. Diferentes períodos (outros meses/anos)

### ⚠️ Se ALGUNS campos falharam

1. Identifique qual padrão falhou
2. Procure manualmente no PDF
3. Adicione novo padrão em `extractionFunctions.ts`
4. Recompile: `npm run build`
5. Reteste

### ❌ Se TUDO falhou

1. Verificar se PDF é válido
2. Verificar se é imagem (aguardar OCR)
3. Verificar console por erros técnicos
4. Criar issue no GitHub com logs

---

## 📞 Informações para Debug

Se precisa relatar problema, forneça:

```markdown
**PDF**: [nome]
**Tipo**: [Grupo A/B/Rural/Branca]
**Distribuidor**: [ENEL/CPFL/Light/outro]

**Logs do Console** (Ctrl+A no console, Ctrl+C para copiar):
[COLAR AQUI]

**Esperado**:
UC: 2595111
Mês: 03/2025
Consumo: 1091

**Obtido**:
UC: (do log)
Mês: (do log)
Consumo: (do log)

**Qual campo falhou**:

- [ ] UC
- [ ] Mês
- [ ] Consumo
- [ ] Tarifas
- [ ] Tributos
- [ ] Outro: \***\*\_\_\_\*\***
```

---

## 💾 Salvando Resultados

### Se Sucesso:

```bash
# Crie um arquivo com dados:
echo "arquivo,uc,mes,consumo,status,data" > resultados.csv
echo "2595111_032025_grupoB.pdf,2595111,03/2025,1091,sucesso,$(date)" >> resultados.csv
```

### Se Falha:

```bash
# Salve logs para análise:
# 1. Console → clique direito → "Save as" (Chrome)
# 2. Ou selecione tudo (Ctrl+A) → copie → cole em .txt
# 3. Ou use ferramenta: Copilot → Analisar logs
```

---

## ⏱️ Tempo Esperado

| Etapa             | Tempo  | Notas                      |
| ----------------- | ------ | -------------------------- |
| Extração de Texto | 0-2s   | Rápido se PDF tem texto    |
| OCR (se imagem)   | 10-30s | Lento, seja paciente       |
| Processamento     | 1-5s   | Loop de extração de campos |
| Total             | 1-35s  | Depende do PDF             |

---

## ✨ Resumo

✅ **Sucesso Total**: Todos os 7 checks passaram  
⚠️ **Sucesso Parcial**: 5-6 checks passaram (normal!)  
❌ **Falha**: Menos de 5 checks passaram (revisar código)

**Próximo**: Avance para [TEST_GUIDE.md](TEST_GUIDE.md) para testes avançados
