# 📤 Disparador de Mensagens - React + n8n

Este projeto é uma solução completa para **envio de mensagens personalizadas** com base em **dados de um arquivo CSV**, utilizando um painel frontend em **React** e um backend automatizado com **n8n**.

---

## 🧩 Funcionalidades

- Upload de arquivo CSV com contatos (colunas como `TELEFONE`, `NOME`, etc)
- Mensagem personalizada com variáveis (ex: `Olá $NOME, tudo bem?`)
- Envio de imagem (opcional)
- Autenticação com e-mail e senha (verificada no PostgreSQL via n8n)
- Geração e validação de token JWT
- Feedback visual com status do envio

---

## ⚙️ Tecnologias utilizadas

- **React + Chakra UI** (interface moderna e responsiva)
- **PapaParse** (leitura de CSV no frontend)
- **n8n** (automação backend via webhooks)
- **PostgreSQL** (banco de usuários e controle de login)
- **JWT** (autenticação segura)

---

## 🚀 Como usar

### 1. Acesse a interface React

- Tela de Login (`/login`)
  - Insira e-mail e senha cadastrados no banco
- Tela de Disparo (`/disparo`)
  - Escreva a mensagem com variáveis como `$NOME`
  - Faça upload do CSV e, se quiser, de uma imagem
  - Clique em **ENVIAR**

### 2. Backend no n8n

- Webhook `/login`
  - Verifica e-mail/senha no PostgreSQL
  - Retorna token JWT ao frontend
- Webhook `/disparo`
  - Valida o token
  - Processa e envia as mensagens (via loop + API externa)

---

## 📁 Estrutura de pastas

```bash
📦 react-frontend/
 ┣ 📄 LoginPage.jsx
 ┣ 📄 Disparo.jsx
 ┗ 📁 assets/
