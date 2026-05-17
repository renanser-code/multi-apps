# Bárbara Zero 🏠🎒

> **Jogo Infantil Educativo de Decoração, Casinha e Leitura**

Este diretório contém o projeto completo e independente de **Bárbara Zero**. Trata-se de um jogo móvel interativo que ajuda no desenvolvimento cognitivo de crianças de 4 a 7 anos, contando com minijogos de decoração de ambientes, quiz interativo de soletração e leitura com voz integrada.

---

## 🚀 Como Executar e Testar Localmente

### 1. Pré-requisitos
*   Node.js instalado.
*   NPM.

### 2. Instalação e Execução
Instale as dependências específicas do projeto e inicie o servidor web estático:
```bash
npm install
npm start
```
Acesse o jogo em `http://localhost:8092`.

---

## 🛠️ Compilação e Sincronização Nativa (Capacitor)

Para compilar os arquivos e atualizar as plataformas móveis (Android e iOS):

```bash
# 1. Copiar as alterações de desenvolvimento para a pasta 'www'
npm run build:cap

# 2. Sincronizar com as pastas do Android/iOS nativo
npx cap sync

# 3. Abrir o Android Studio
npx cap open android

# 4. Abrir o Xcode (iOS)
npx cap open ios
```

---

## 📦 Detalhes de Integração e APIs
*   **Text-to-Speech**: Usado para narrar as palavras no Quiz de soletração de forma lúdica.
*   **AdMob**: Configurado com as diretivas de proteção infantil **COPPA** (TagForChildDirectedTreatment ativado) para garantir a segurança dos anúncios.
*   **PWA Offline**: Um Service Worker robusto (`service-worker.js`) realiza o cache completo de imagens e cenários ilustrados locais, permitindo que a criança continue jogando mesmo sem nenhuma conexão à internet.
