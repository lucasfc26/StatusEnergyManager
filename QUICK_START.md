# ⚡ Quick Start - 5 Minutos

## 🚀 Iniciar em 30 Segundos

```bash
cd "c:\Workspace\Status Energy\StatusEnergyManager"
npm run dev
```

Abre em `http://localhost:5173`

---

## 👀 Debugar em 1 Minuto

1. **Pressione F12** (abre DevTools)
2. **Clique em "Console"**
3. **Arraste PDF para tela**
4. **Leia os logs:**

```
🔍 Processando...
📄 PDF extraído: XXX linhas
📍 UC extraída: "2595111"
✅ Grupo B Extração Completa: {...}
```

---

## ✅ Sucesso?

- [ ] Vê `UC extraída: "2595111"`?
- [ ] Tabela mostra dados?
- [ ] Nenhuma mensagem de erro?

**SIM** ✅ → Pronto! Sistema funcionando  
**NÃO** ❌ → Vá para [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)

---

## 🔧 Se Falhar

### Passo 1: Check o Log

Procure por qual log NÃO apareceu:

```
🔍 Processando? ─────────► Sim? OK. Não? ⚠️ PDF não carregou
📄 PDF extraído? ────────► Sim? OK. Não? ⚠️ PDF é imagem (OCR)
📍 UC extraída? ─────────► Sim? OK. Não? ⚠️ Padrão não encontrado
✅ Extração Completa? ───► Sim? OK. Não? ⚠️ Campos faltando
```

### Passo 2: Consulte Tabela

| Se Falhar                 | Abra                                                   |
| ------------------------- | ------------------------------------------------------ |
| UC não extraída           | [DEBUG_GUIDE.md](DEBUG_GUIDE.md)                       |
| Consumo vazio             | [DEBUG_GUIDE.md](DEBUG_GUIDE.md)                       |
| Tarifas vazias            | [DEBUG_GUIDE.md](DEBUG_GUIDE.md)                       |
| Interface quebrada        | [TEST_GUIDE.md](TEST_GUIDE.md)                         |
| Não sabe por onde começar | [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md) |

---

## 📂 Estrutura de Documentos

```
📁 Projeto
├── 📄 QUICK_START.md (você está aqui)
├── 📄 IMPROVEMENTS_SUMMARY.md ─ O que mudou
├── 📄 VERIFICATION_CHECKLIST.md ─ Teste passo-a-passo
├── 📄 DEBUG_GUIDE.md ─ Debugar logs
├── 📄 TEST_GUIDE.md ─ Testes avançados
├── 📁 src/
│   └── 📁 components/Extracoes/
│       └── 📄 extractionFunctions.ts ─ CÓDIGO PRINCIPAL
└── 📁 dist/ ─ Build final (gerado por npm run build)
```

---

## 🎯 Fluxo Rápido

```
npm run dev
     ↓
F12 → Console
     ↓
Arraste PDF
     ↓
Veja logs
     ↓
✅ Sucesso? → Terminou
❌ Falha? → VERIFICATION_CHECKLIST.md
```

---

## 🆘 Help!

| Problema         | Comando         | Próx. Passo            |
| ---------------- | --------------- | ---------------------- |
| Não compila      | `npm install`   | `npm run dev`          |
| Console vazio    | Aguarde 5s      | Procure por 🔍 logs    |
| Erro JS vermelho | Copie mensagem  | Cole em DEBUG_GUIDE.md |
| PDF não carrega  | Tente outro     | Verifique se é .pdf    |
| Tudo quebrou     | `npm run build` | `npm run dev`          |

---

## 📊 Tabela de Sucesso

| Cenário            | Resultado Esperado | O que Fazer                         |
| ------------------ | ------------------ | ----------------------------------- |
| ✅ UC encontrada   | Verde              | ✓ Sistema OK                        |
| ✅ Todos campos ok | Verde + Tabela     | ✓ Sistema OK                        |
| ⚠️ Alguns campos 0 | Amarelo + Aviso    | ⚠️ Normal, alguns PDFs não têm tudo |
| ❌ UC vazia        | Vermelho + Erro    | ❌ Verificar padrão                 |
| ❌ PDF é imagem    | Aguardar OCR       | ⏳ Demora 10-30s                    |

---

## 💡 Dica Profissional

Se quer entender TUDO:

1. Leia `IMPROVEMENTS_SUMMARY.md` (5 min)
2. Faça `VERIFICATION_CHECKLIST.md` (10 min)
3. Consulte `DEBUG_GUIDE.md` se precisar (10 min)

Se só quer **testar**:

1. `npm run dev`
2. Arraste PDF
3. Pronto!

---

## ✨ Próximos Testes

- [ ] Testar com PDF original
- [ ] Testar com outros PDFs
- [ ] Testar com diferentes distribuidoras
- [ ] Testar upload múltiplo
- [ ] Testar GD (geração distribuída)

---

**Total: ~5 minutos para estar pronto! 🚀**

Precisa de mais info? Veja [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)
