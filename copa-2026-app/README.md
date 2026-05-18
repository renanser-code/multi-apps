# 🏆 CopaCenter 2026

> Plataforma Social, Simulador Completo de Grupos/Mata-Mata e Bolão Integrado para a Copa do Mundo de 2026.

---

## 🚀 Sobre o CopaCenter 2026

O **CopaCenter 2026** é uma plataforma social mobile premium desenvolvida para torcedores, apostadores e entusiastas do maior evento esportivo do planeta. O aplicativo foi projetado sob a ótica de um produto real, oferecendo uma experiência moderna com recursos de rede social e gamificação.

### 🌟 Principais Funcionalidades
*   **🎮 Bolão Social Inteligente**: Crie sua conta local, cadastre palpites para os jogos e dispute com pontuação atualizada!
*   **👥 Grupos Privados com Código**: Crie grupos fechados com seus amigos ou familiares (Ex: "Galera do Trabalho") e compita em um ranking interno exclusivo do grupo.
*   **📊 Simulador Avançado**: Insira pontuações projetadas para a fase de grupos e veja o chaveamento de mata-mata (oitavas, quartas, semis e final) se atualizar em tempo real, calculando seu campeão!
*   **🛡️ Elencos & Seleções**: Fichas individuais e elencos escalados das seleções com rating e histórico.
*   **⏱️ Contador Regressivo**: Cronômetro de alta precisão contando os segundos até a cerimônia de abertura oficial.
*   **📲 PWA Estável & Instalável**: Ícone e manifest estáveis para instalação instantânea no Android, iOS (Safari) e Chrome, com funcionamento offline e atualizações de cache transparentes.
*   **📈 Telemetria GA4**: Acompanhamento inteligente de ações cruciais do usuário (login, cadastro, palpites, criação de grupos).

---

## 🛠️ Tecnologias Utilizadas
1.  **Core**: HTML5 Semântico, CSS3 Moderno (Custom Properties & Variáveis HSL), JavaScript (ES6 Modules).
2.  **Visual**: Identidade visual inspirada no ESPN, FotMob e Sofascore com Glassmorphism leve, sombras suaves e fontes modernas (*Outfit* & *Inter* via Google Fonts).
3.  **Ícones**: Lucide Icons CDN.
4.  **Armazenamento e Sincronização**:
    *   **Live Mode**: Compatibilidade plug-and-play com **Firebase Auth** (cadastro/sessão) e **Firestore** (sincronização de palpites, grupos e rankings).
    *   **Sandbox Local Mode**: Mecanismo inteligente de fallback que opera 100% dos recursos em banco de dados local (`localStorage`) e carrega usuários bots mockados para manter o app imediatamente utilizável, sem necessidade de configuração prévia!
5.  **Analytics**: Google Analytics 4 (GA4).
6.  **PWA**: Service Worker inteligente (Network-First para HTML e Stale-While-Revalidate para ativos estáticos).

---

## 📁 Estrutura de Arquivos
```bash
copa-2026-app/
├── index.html            # Estrutura e views SPA do aplicativo
├── style.css             # Design System, HSL Tokens, Grids e Animações
├── app.js                # Core Engine, Roteador, Simulador e Motores de Banco
├── service-worker.js     # Estratégia de cache PWA inteligente e Modo Offline
├── manifest.json         # Manifesto PWA de Instalação Mobile/Desktop
├── icon.png              # Logotipo premium gerado para o app
├── firebase-rules.json   # Regras recomendadas de segurança do Firestore
└── README.md             # Guia de implantação e utilização
```

---

## ⚙️ Configuração do Firebase e Analytics

Para conectar seu aplicativo a um banco de dados real na nuvem do Firebase, siga estes passos simples:

### 1. Criar Projeto no Firebase
1. Acesse o [Firebase Console](https://console.firebase.google.com/).
2. Clique em **Adicionar projeto** e siga as instruções.
3. No painel do projeto, adicione um **Aplicativo Web**.
4. Copie o objeto `firebaseConfig` exibido na tela.

### 2. Ativar Serviços
1. No menu lateral, acesse **Authentication** e ative o método de login **E-mail/Senha**.
2. Acesse **Cloud Firestore** e clique em **Criar banco de dados** (ative no modo de teste ou de produção).
3. Copie as regras do arquivo `firebase-rules.json` deste projeto e cole-as na aba **Regras** do seu Cloud Firestore para proteger as informações dos usuários.

### 3. Injetar Configuração no Aplicativo
1. Abra o arquivo `app.js`.
2. Logo no topo, localize a constante `firebaseConfig` e cole suas credenciais:
```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID",
  measurementId: "SEU_MEASUREMENT_ID"
};
```
3. Salve o arquivo. O aplicativo detectará automaticamente as chaves e mudará do modo **Sandbox Local** para o modo **Firebase Nuvem** em tempo real!

---

## 💻 Como Rodar Localmente

1. Basta clonar o repositório ou abrir a pasta do projeto.
2. Abra o arquivo `index.html` em seu navegador de preferência, ou utilize uma extensão como o *Live Server* do VS Code para rodar com live-reload.
3. Não há dependências de compilação ou processos complexos de build, garantindo velocidade de 0ms para desenvolvimento!

---

## 🚀 Como Publicar no GitHub Pages

O aplicativo está configurado para deploy instantâneo na URL:
`https://renanser-code.github.io/copa-2026-app/`

### Publicação manual simples:
1. Crie o repositório remoto no seu GitHub: `https://github.com/renanser-code/copa-2026-app`.
2. No seu terminal local, adicione o repositório e faça o push:
```bash
git remote add origin https://github.com/renanser-code/copa-2026-app.git
git branch -M main
git add .
git commit -m "Initial commit: CopaCenter 2026"
git push -u origin main
```
3. Acesse a página do seu repositório no GitHub, clique em **Settings** > **Pages**.
4. Sob **Build and deployment**, selecione a branch `main` e a pasta `/ (root)`.
5. Clique em **Save**. O deploy estará ativo em poucos minutos!

---

## ♻️ Como Atualizar o Aplicativo

Para atualizar o app e garantir que os usuários recebam a nova versão imediatamente sem precisar desinstalar e reinstalar o atalho PWA:
1. Faça as modificações necessárias nos arquivos (`index.html`, `style.css`, etc).
2. Abra o arquivo `service-worker.js`.
3. Altere o valor de `CACHE_NAME` no topo do arquivo para a versão seguinte (Ex: de `copacenter-cache-v1` para `copacenter-cache-v2`).
4. Salve e envie os arquivos para o GitHub (`git commit` + `git push`).
5. O Service Worker dos navegadores dos usuários detectará a nova assinatura de cache automaticamente, fará o download em segundo plano e exibirá um aviso elegante na tela antes de atualizar a página de forma fluida!
