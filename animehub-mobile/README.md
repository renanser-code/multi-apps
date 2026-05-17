# AnimeHub Mobile 🎬🍿

> **Plataforma Premium de Streaming Companion e Rastreamento de Animes**

Este diretório contém o projeto completo de **AnimeHub Mobile**. Um aplicativo móvel de alta fidelidade visual, com design baseado em Glassmorphism escuro, que consome a API Jikan (MyAnimeList) para listar, filtrar, favoritar e rastrear episódios de animes em tempo real.

---

## 🚀 Como Executar e Testar Localmente

### 1. Pré-requisitos
*   Node.js instalado.
*   NPM.

### 2. Instalação e Execução
Instale as dependências específicas do projeto e inicie o servidor web na pasta `www` ou na raiz:
```bash
npm install
# Você pode subir um servidor estático apontando para a raiz ou a pasta www:
npx http-server . -p 8080
```
Acesse o aplicativo em `http://localhost:8080`.

---

## 🛠️ Compilação e Sincronização Nativa (Capacitor)

Para sincronizar as modificações com as plataformas móveis (Android e iOS):

```bash
# 1. Copiar as alterações de desenvolvimento para a pasta 'www' (neste projeto, a edição ocorre direto em www/index.html e a raiz serve como ponte)
npx cap copy android
npx cap copy ios

# 2. Sincronizar todos os assets nativos
npx cap sync

# 3. Abrir o Android Studio
npx cap open android
```

---

## 📦 Detalhes de Integração e APIs
*   **API Jikan (MyAnimeList)**: Utiliza a API pública REST para carregar calendário de lançamentos diários, animes populares, sinopses traduzidas e recomendações.
*   **Cache Avançado**: Um sistema de cache de 10 minutos é armazenado no `localStorage` para evitar limite de requisições (rate limits) e garantir carregamentos instantâneos.
*   **Histórico de Usuários**: Salva o progresso individual de episódios e listas personalizadas (Favoritos, Planejado, Assistindo) no banco de dados local isolado do navegador por sessão de e-mail.
