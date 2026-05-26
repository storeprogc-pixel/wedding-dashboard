# 🚀 GUIA COMPLETO DE INSTALAÇÃO

## Wedding Films Dashboard - Sincronização com Google Sheets

---

## 📋 ORDEM DE EXECUÇÃO

Siga exatamente nesta ordem:

1. ✅ Criar e configurar planilha Google Sheets
2. ✅ Configurar Google Cloud Console e obter API Key
3. ✅ Fazer deploy no Vercel
4. ✅ Configurar credenciais no dashboard
5. ✅ Testar sincronização

---

## 📊 PASSO 1: Criar Planilha Google Sheets

Siga o arquivo: **`PLANILHA_TEMPLATE.md`**

**Resumo:**
1. Crie nova planilha no Google Sheets
2. Renomeie a aba para "Projetos"
3. Adicione os cabeçalhos (16 colunas de A até P)
4. Compartilhe como "Qualquer pessoa com o link"
5. Copie o ID da planilha

**Tempo estimado:** 5 minutos

---

## 🔑 PASSO 2: Configurar Google Cloud

Siga o arquivo: **`GOOGLE_CLOUD_SETUP.md`**

**Resumo:**
1. Acesse: https://console.cloud.google.com
2. Crie novo projeto
3. Ative a Google Sheets API
4. Crie uma API Key
5. Restrinja a API Key (segurança)

**Tempo estimado:** 5-10 minutos

---

## 🌐 PASSO 3: Deploy no Vercel

### Opção A: Deploy via Interface Web (Mais Fácil)

1. **Acesse:** https://vercel.com
2. **Faça login** (pode usar conta GitHub, GitLab ou Google)
3. Clique em **"Add New..."** → **"Project"**
4. Selecione **"Import from Git"** OU **"Browse files"**

#### Se escolher "Browse files":
1. Faça upload dos arquivos:
   - `index.html`
   - `app.js`
   - `vercel.json`
2. Clique em **"Deploy"**
3. Aguarde ~30 segundos
4. ✅ Pronto! Você receberá uma URL (ex: `seu-projeto.vercel.app`)

### Opção B: Deploy via GitHub (Recomendado para Updates)

1. **Crie repositório no GitHub:**
   ```bash
   # No seu computador, crie uma pasta
   mkdir wedding-dashboard
   cd wedding-dashboard
   
   # Coloque os 3 arquivos dentro:
   # - index.html
   # - app.js  
   # - vercel.json
   
   # Inicialize Git
   git init
   git add .
   git commit -m "Initial commit"
   
   # Crie repositório no GitHub e conecte
   git remote add origin https://github.com/SEU_USUARIO/wedding-dashboard.git
   git push -u origin main
   ```

2. **No Vercel:**
   - Clique em "Import Project"
   - Conecte sua conta GitHub
   - Selecione o repositório `wedding-dashboard`
   - Clique em "Deploy"

3. **Vantagem:** Toda vez que você fizer `git push`, o Vercel atualiza automaticamente!

**Tempo estimado:** 5 minutos

---

## ⚙️ PASSO 4: Configurar Dashboard

1. **Abra seu dashboard** (a URL do Vercel)
2. Na sidebar, clique em **"Configurar Sheets"**
3. Cole:
   - **ID da Planilha** (obtido no Passo 1)
   - **API Key** (obtida no Passo 2)
4. Clique em **"Salvar configurações"**

**Tempo estimado:** 1 minuto

---

## 🔄 PASSO 5: Primeira Sincronização

1. Clique no botão **"Sincronizar"** na sidebar
2. Aguarde a mensagem "Sincronizado"
3. Se você adicionou dados de exemplo na planilha, eles aparecerão no dashboard!

**Pronto! Tudo funcionando!** 🎉

---

## 📝 COMO USAR O SISTEMA

### Cadastrar Novo Projeto

**Opção 1 - No Dashboard:**
1. Clique em "Novo projeto"
2. Preencha os dados
3. Clique em "Adicionar"
4. ✅ Automaticamente salva no Google Sheets

**Opção 2 - Na Planilha:**
1. Adicione nova linha no Google Sheets
2. Preencha as colunas
3. No dashboard, clique em "Sincronizar"
4. ✅ Projeto aparece no dashboard

### Editar Projeto

**No Dashboard:**
- Clique nos chips das etapas para marcar como concluído
- Use o dropdown para mudar status
- ✅ Salva automaticamente no Sheets

**Na Planilha:**
- Edite diretamente as células
- No dashboard, clique em "Sincronizar"
- ✅ Mudanças aparecem no dashboard

### Sincronização Automática

O sistema sincroniza automaticamente a cada **2 minutos**.

Você pode também:
- Clicar em "Sincronizar" manualmente a qualquer momento
- O indicador mostra status: 🟢 Conectado | 🔵 Sincronizando | 🔴 Erro

---

## 🎨 ESTRUTURA DOS ARQUIVOS

```
wedding-dashboard/
├── index.html          # Interface do dashboard
├── app.js             # Lógica + sincronização Google Sheets
├── vercel.json        # Configuração do Vercel
├── PLANILHA_TEMPLATE.md    # Guia da planilha
├── GOOGLE_CLOUD_SETUP.md   # Guia Google Cloud
└── README.md          # Este arquivo
```

---

## 🔒 SEGURANÇA

### ⚠️ IMPORTANTE

**Suas credenciais são armazenadas apenas no navegador (localStorage).**

Isso significa:
- ✅ Ninguém mais tem acesso às suas credenciais
- ✅ Elas não são enviadas para nenhum servidor
- ⚠️ Se limpar cache do navegador, precisa reconfigurar

### Para Maior Segurança

1. **Restrinja a API Key no Google Cloud** para seu domínio Vercel
2. **Não compartilhe** a API Key publicamente
3. **Revogue a chave** se suspeitar de vazamento (e crie uma nova)

---

## 🆘 PROBLEMAS COMUNS

### Dashboard não carrega
- Limpe cache do navegador
- Tente em modo anônimo
- Verifique console do navegador (F12)

### Sincronização não funciona
- Verifique se a planilha está compartilhada publicamente
- Confirme que a aba se chama "Projetos"
- Aguarde 5 min após criar API Key (propagação)
- Clique em "Configurar Sheets" e salve novamente

### Dados não aparecem
- Verifique formato das datas (YYYY-MM-DD)
- Status deve ser: pendente, editando, revisao ou entregue
- Etapas devem ser: TRUE ou FALSE (maiúsculas)

---

## 📞 SUPORTE

**Precisa de ajuda?**

1. Verifique se seguiu todos os passos na ordem
2. Revise os arquivos de configuração
3. Teste com dados de exemplo primeiro

---

## 🎯 PRÓXIMOS PASSOS (Opcional)

Depois que tudo estiver funcionando, você pode:

1. **Personalizar cores** no CSS (arquivo index.html)
2. **Adicionar mais métricas** no dashboard
3. **Criar gráficos personalizados**
4. **Configurar domínio próprio** no Vercel

---

## ✅ CHECKLIST FINAL

Antes de usar em produção, confirme:

- [ ] Planilha criada e compartilhada
- [ ] Google Cloud configurado
- [ ] API Key criada e restrita
- [ ] Deploy no Vercel funcionando
- [ ] Credenciais configuradas no dashboard
- [ ] Sincronização testada e funcionando
- [ ] Projeto de teste criado com sucesso

**Tudo marcado? Parabéns! Seu sistema está pronto! 🎉**
