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

## ♻️ Como Atualizar o Aplicativo (PWA Cache)

Para atualizar o app e garantir que os usuários recebam a nova versão imediatamente sem precisar desinstalar e reinstalar o atalho PWA:
1. Faça as modificações necessárias nos arquivos (`index.html`, `style.css`, etc).
2. Abra o arquivo `service-worker.js`.
3. Altere o valor de `CACHE_NAME` no topo do arquivo para a versão seguinte (Ex: de `copacenter-cache-v1` para `copacenter-cache-v2`).
4. Salve e envie os arquivos para o GitHub (`git commit` + `git push`).
5. O Service Worker dos navegadores dos usuários detectará a nova assinatura de cache automaticamente, fará o download em segundo plano e aplicará a atualização de forma fluida!

---

## 📅 Gerenciamento de Confrontos (Guia do Desenvolvedor)

### 1. Estrutura da Base de Jogos (104 Confrontos)
O banco de dados de partidas é gerado dinamicamente no arquivo [app.js](file:///C:/Users/Renan%20Pires/OneDrive/Aplicativos/multi-apps/copa-2026-app/app.js) através da função `generate104Matches()`. A Copa do Mundo de 2026 conta com um total de **104 jogos**:
*   **Fase de Grupos (72 jogos)**: 12 grupos (A a L) com 4 seleções cada. Cada grupo realiza 6 partidas (`12 * 6 = 72`).
*   **Fase Mata-Mata (32 jogos)**: 
    *   **16avos de Final**: 16 confrontos (jogos #73 ao #88)
    *   **Oitavas de Final**: 8 confrontos (jogos #89 ao #96)
    *   **Quartas de Final**: 4 confrontos (jogos #97 ao #100)
    *   **Semifinais**: 2 confrontos (jogos #101 e #102)
    *   **Disputa do 3º Lugar**: 1 confronto (jogo #103)
    *   **Grande Final**: 1 confronto (jogo #104)

### 2. Como Atualizar Confrontos e Placares
Cada partida é gerada como um objeto estruturado:
```javascript
MATCHES.push({
  id: 1,                    // ID numérico sequencial único (1 a 104)
  phase: "grupos",          // Fase da partida ("grupos", "32avos", "oitavas", "quartas", "semis", "final")
  group: "A",               // Letra correspondente do grupo (A a L) ou nulo em mata-mata
  round: 1,                 // Rodada da Fase de Grupos (1, 2 ou 3)
  homeTeam: "Brasil",       // Nome exato da seleção mandante
  awayTeam: "Croácia",      // Nome exato da seleção visitante
  homeFlag: "🇧🇷",           // Bandeira/Emoji mandante
  awayFlag: "🇭🇷",           // Bandeira/Emoji visitante
  homeScore: null,          // Placar mandante (null se não iniciado, número se finalizado)
  awayScore: null,          // Placar visitante (null se não iniciado, número se finalizado)
  date: "2026-06-11",       // Data oficial da partida (Formato YYYY-MM-DD)
  localTime: "16:00",       // Horário de início local do estádio
  brtTime: "19:00",         // Horário convertido de Brasília (BRT)
  stadium: "Estádio Azteca",// Nome do estádio sede
  city: "Cidade do México", // Cidade sede
  country: "México",        // País sede do confronto
  status: "scheduled",      // Status do jogo ("scheduled" = agendado, "finished" = finalizado)
  winner: null              // Vencedor (null se empate/agendado, ou nome da seleção vencedora)
});
```
Para registrar um resultado oficial no código, mude o placar (`homeScore`, `awayScore`) para números inteiros e altere o `status` para `"finished"`.

### 3. Como Validar a Quantidade Total de Jogos
Você pode abrir o console do desenvolvedor do navegador (F12) e executar o seguinte comando para confirmar que a base está íntegra e contém todos os 104 jogos programados:
```javascript
console.log("Total de jogos cadastrados:", MATCHES.length); // Deve exibir exatamente 104
console.log("Jogos da Fase de Grupos:", MATCHES.filter(m => m.phase === "grupos").length); // Deve exibir exatamente 72
console.log("Jogos do Mata-Mata:", MATCHES.filter(m => m.phase !== "grupos").length); // Deve exibir exatamente 32
```
A interface do usuário também exibe no topo das abas de navegação da tabela a contagem oficial das partidas em cada fase (`Grupos (72j)`, `16avos (16j)`, etc.).

### 4. Como Zerar Completamente os Placares e Palpites
Caso necessite retornar o aplicativo ao estado de fábrica/zero absoluto:
1.  **Limpeza no Script**: No arquivo [app.js](file:///C:/Users/Renan%20Pires/OneDrive/Aplicativos/multi-apps/copa-2026-app/app.js), verifique se `generate104Matches()` está gerando partidas com `homeScore: null`, `awayScore: null`, `winner: null` e `status: "scheduled"`.
2.  **Purga de Sessões Antigas**: O aplicativo implementa migração automatizada baseada em cache de versão. Ao incrementar a chave `copacenter_clean_slate_v2` em `localStorage`, todas as contas, pontuações, placares antigos e simulações de sessões anteriores de usuários ativos nos navegadores serão automaticamente purgadas e reiniciadas do zero!

### 5. Como Publicar no Monorepo Multi-Apps
Como o aplicativo está integrado ao monorepo sob a pasta `copa-2026-app/`, siga os padrões abaixo para manter o deploy funcionando sem quebrar os caminhos relativos no GitHub Pages:
*   **Base Path**: Sempre utilize caminhos relativos (`./style.css`, `./app.js`) nos arquivos HTML para evitar que o roteamento force caminhos na raiz do domínio principal.
*   **Service Worker**: O Service Worker está configurado para registrar o escopo dinamicamente com base no diretório em que é carregado (`navigator.serviceWorker.register(swPath)`), permitindo que funcione perfeitamente tanto em subpastas do GitHub Pages (`https://renanser-code.github.io/multi-apps/copa-2026-app/`) quanto em servidores locais!
*   **Comandos de deploy**:
    ```bash
    git add .
    git commit -m "feat: atualizações do CopaCenter 2026"
    git push origin main
    ```
