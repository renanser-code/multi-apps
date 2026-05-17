# DarkFrame Mobile 🎬👻

> **Companion de Horror Interativo Premium (Estética Dark Blood Neon)**

Este diretório contém o projeto completo de **DarkFrame Mobile**. Um aplicativo móvel de alta fidelidade visual com temática de horror/suspense que serve como central interativa de filmes de horror, oferecendo busca rápida, curadorias especializadas por subgênero, salvamento offline de favoritos e integração de trailer.

---

## 🚀 Como Executar e Testar Localmente

### 1. Pré-requisitos
*   Node.js instalado.
*   NPM.

### 2. Instalação e Execução
Instale as dependências específicas do projeto e inicie o servidor na raiz ou pasta `www`:
```bash
npm install
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
*   **Design & Identidade**: Paleta escura customizada (`--void`, `--blood`, `--rust`) com grid estruturado de alta fidelidade para fácil utilização no celular com uma só mão.
*   **Armazenamento Isolado**: Sistema offline de favoritos, listas de filmes assistidos e avaliações pessoais salvas no banco de dados local.
*   **Segurança e DRM**: Proteções nativas contra print screens e cliques indevidos ativados.
