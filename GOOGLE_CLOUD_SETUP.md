# CONFIGURAÇÃO GOOGLE CLOUD - PASSO A PASSO

## PARTE 1: Criar Projeto no Google Cloud

### 1. Acesse o Google Cloud Console
🔗 https://console.cloud.google.com

### 2. Criar novo projeto
1. Clique no seletor de projeto (topo da página, ao lado de "Google Cloud")
2. Clique em **"NOVO PROJETO"**
3. Nome do projeto: `Wedding Films Dashboard`
4. Clique em **"CRIAR"**
5. Aguarde alguns segundos até o projeto ser criado

---

## PARTE 2: Ativar a API do Google Sheets

### 1. No projeto recém-criado
1. Certifique-se de que o projeto correto está selecionado (topo da página)
2. No menu lateral (☰), navegue até: **APIs e serviços** > **Biblioteca**

### 2. Ativar Google Sheets API
1. Na barra de busca, digite: `Google Sheets API`
2. Clique no resultado **"Google Sheets API"**
3. Clique no botão **"ATIVAR"**
4. Aguarde a ativação (leva ~10 segundos)

---

## PARTE 3: Criar API Key

### 1. Ir para Credenciais
1. No menu lateral: **APIs e serviços** > **Credenciais**
2. No topo da página, clique em **"+ CRIAR CREDENCIAIS"**
3. Selecione: **Chave de API**

### 2. Sua API Key foi criada!
1. Uma janela popup aparecerá mostrando sua API Key
2. **COPIE esta chave** (será algo como: `AIzaSyD...`)
3. Guarde em local seguro - você vai precisar dela no dashboard

### 3. (IMPORTANTE) Restringir a API Key

Por segurança, vamos restringir o uso da chave:

1. Ainda na janela popup, clique em **"EDITAR CHAVE DE API"**
   OU
   Na lista de credenciais, clique na chave que acabou de criar

2. Em **"Restrições de aplicativo"**:
   - Selecione: **"Referenciadores HTTP (sites)"**
   - Adicione seu domínio do Vercel quando tiver (ex: `seu-projeto.vercel.app`)
   - Por enquanto, adicione: `localhost` e `127.0.0.1` para testar localmente

3. Em **"Restrições de API"**:
   - Selecione: **"Restringir chave"**
   - Na lista, marque apenas: ✅ **Google Sheets API**

4. Clique em **"SALVAR"**

---

## RESUMO - O QUE VOCÊ PRECISA

Ao final deste processo, você terá:

✅ **ID da Planilha** (do Google Sheets)
   - Formato: `1A2B3C4D5E6F7G8H9I0J`
   - Obtido da URL da planilha

✅ **API Key** (do Google Cloud)
   - Formato: `AIzaSyD_aBcDeFgHiJkLmNoPqRsTuVwXyZ`
   - Criada no Google Cloud Console

---

## PRÓXIMO PASSO: Configurar no Dashboard

1. Abra seu dashboard (hospedado no Vercel ou localmente)
2. Clique em **"Configurar Sheets"** na sidebar
3. Cole o **ID da Planilha**
4. Cole a **API Key**
5. Clique em **"Salvar configurações"**
6. Clique em **"Sincronizar"**

Pronto! Seus dados agora estão sincronizados com o Google Sheets!

---

## TROUBLESHOOTING (Problemas Comuns)

### ❌ "Erro ao ler planilha"
- Verifique se a planilha está compartilhada como "Qualquer pessoa com o link"
- Confirme que o ID da planilha está correto
- Certifique-se de que a aba se chama exatamente "Projetos"

### ❌ "API Key inválida"
- Verifique se copiou a chave completa
- Confirme que a Google Sheets API está ativada
- Aguarde alguns minutos - mudanças levam até 5min para propagar

### ❌ "Permissão negada"
- A planilha precisa ser pública (compartilhada com "Qualquer pessoa com o link")
- Verifique as restrições da API Key

---

## IMPORTANTE: Segurança

⚠️ **Nunca compartilhe sua API Key publicamente**
⚠️ **Não comite a API Key no GitHub** (se usar Git)
⚠️ **Use as restrições de domínio** quando fizer deploy no Vercel
