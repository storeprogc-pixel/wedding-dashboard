# TEMPLATE DA PLANILHA GOOGLE SHEETS

## PASSO 1: Criar a Planilha

1. Acesse: https://sheets.google.com
2. Crie uma nova planilha
3. Renomeie a primeira aba para: **Projetos**

## PASSO 2: Configure as Colunas (Linha 1 - Cabeçalhos)

Cole exatamente esses cabeçalhos na primeira linha:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ID | Nome do Casal | Data Casamento | Prazo Entrega | Status | Material baixado | Backup | Organizado | Seleção de takes | Sincronização | Trilha sonora | Corte principal | Color grade | Títulos/texto | Exportação | Entrega |

## PASSO 3: Formatação (opcional mas recomendado)

- **Linha 1:** Negrito, fundo cinza claro
- **Colunas F até P:** Formato das células = "Texto simples"
- **Largura das colunas:** 
  - A: 150px
  - B: 200px
  - C-D: 120px
  - E: 100px
  - F-P: 80px cada

## PASSO 4: Exemplo de dados (linha 2 para teste)

| ID | Nome do Casal | Data Casamento | Prazo Entrega | Status | Material baixado | Backup | ... |
|----|---------------|----------------|---------------|--------|------------------|--------|-----|
| project-1 | Ana & Carlos | 2026-05-20 | 2026-06-05 | editando | TRUE | TRUE | FALSE ... |

**IMPORTANTE:**
- Status deve ser exatamente: `pendente`, `editando`, `revisao` ou `entregue`
- Etapas devem ser: `TRUE` ou `FALSE` (em maiúsculas)
- Datas no formato: `YYYY-MM-DD` (ex: 2026-05-20)

## PASSO 5: Compartilhar a Planilha

1. Clique em "Compartilhar" (botão verde no canto superior direito)
2. Em "Acesso geral", selecione: **"Qualquer pessoa com o link"**
3. Nível de acesso: **"Leitor"** (importante!)
4. Copie o link da planilha

## PASSO 6: Obter o ID da Planilha

Do link copiado, extraia o ID. Exemplo:

```
https://docs.google.com/spreadsheets/d/1A2B3C4D5E6F7G8H9I0J/edit#gid=0
                                      ^^^^^^^^^^^^^^^^^^^
                                      Este é o ID da planilha
```

Copie apenas a parte entre `/d/` e `/edit`

---

## Próximo passo: Configurar Google Cloud Console
Veja o arquivo: `GOOGLE_CLOUD_SETUP.md`
