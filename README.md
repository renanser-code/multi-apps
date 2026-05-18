# Portfólio de Multi-Aplicativos 🚀✨

> **Coleção Premium de Aplicativos Mobile Conectados e Hospedados Individualmente**

Este monorepo contém cinco aplicativos móveis híbridos independentes de alto desempenho desenvolvidos para o ecossistema Android e iOS. Cada projeto é totalmente isolado com suas próprias dependências, configurações Gradle, plataformas nativas e código-fonte, mas são publicados juntos de forma automatizada por meio do **GitHub Pages**.

---

## 🔗 Links de Produção (Acesso Instantâneo)

Você pode acessar, interagir e testar individualmente cada um dos aplicativos em tempo real através dos links abaixo:

1.  **Bárbara Zero** 🏠🎒
    *   *Descrição*: Jogo infantil educativo de casinha, decoração e leitura projetado para crianças de 4 a 7 anos.
    *   *Link de Produção*: [https://renanser-code.github.io/multi-apps/barbara-zero/](https://renanser-code.github.io/multi-apps/barbara-zero/)
2.  **AnimeHub Mobile** 🎬🍿
    *   *Descrição*: Plataforma premium de streaming companion e rastreamento de animes com interface escura baseada em Glassmorphism.
    *   *Link de Produção*: [https://renanser-code.github.io/multi-apps/animehub-mobile/](https://renanser-code.github.io/multi-apps/animehub-mobile/)
3.  **DarkFrame Mobile** 🎬👻
    *   *Descrição*: Companion de horror interativo, contendo curadoria, favoritos e fichas técnicas com estética de horror premium e neon sangrento.
    *   *Link de Produção*: [https://renanser-code.github.io/multi-apps/darkframe-mobile/](https://renanser-code.github.io/multi-apps/darkframe-mobile/)
4.  **Carinho Doces da Fabi** 🧁🍬
    *   *Descrição*: Vitrine e aplicativo de encomendas para confeitaria artesanal, com receitas, favoritos e canal de WhatsApp direto.
    *   *Link de Produção*: [https://renanser-code.github.io/multi-apps/carinho-doces-da-fabi/](https://renanser-code.github.io/multi-apps/carinho-doces-da-fabi/)
5.  **CopaCenter 2026** 🏆⚽
    *   *Descrição*: Plataforma premium da Copa de 2026, com simulador, MatchZone de palpites, história da seleção brasileira e 104 jogos completos.
    *   *Link de Produção*: [https://renanser-code.github.io/multi-apps/copa-2026-app/](https://renanser-code.github.io/multi-apps/copa-2026-app/)

---

## 📂 Organização do Monorepo

```text
multi-apps/
├── barbara-zero/               # Jogo Infantil Educativo (Vanilla HTML, CSS, JS + PWA)
│   ├── android/                # Pasta nativa do Android (Gradle, Java)
│   ├── assets/                 # Recursos ilustrativos e ícones do PWA
│   └── README.md               # Instruções de desenvolvimento da Bárbara Zero
│
├── animehub-mobile/            # Streaming Companion de Anime (Glassmorphism Vanilla JS)
│   ├── android/                # Pasta nativa do Android (Gradle, Java)
│   └── README.md               # Instruções de desenvolvimento do AnimeHub
│
├── darkframe-mobile/           # Horror Streaming Companion (Estética Dark Blood Neon)
│   ├── android/                # Pasta nativa do Android (Gradle, Java)
│   └── README.md               # Instruções de desenvolvimento do DarkFrame
│
├── carinho-doces-da-fabi/      # Confeitaria Artesanal Premium (PWA / Encomendas)
│   ├── android/                # Pasta nativa do Android (Gradle, Java)
│   └── README.md               # Instruções de desenvolvimento da Fabi Doces
│
└── copa-2026-app/              # Plataforma Social e Bolão Copa 2026 (PWA / MatchZone)
    └── README.md               # Instruções de desenvolvimento do CopaCenter 2026
```

---

## 🛠️ Tecnologias e Arquiteturas

| Aplicativo | Tipo de Arquitetura | Recursos Especiais |
| :--- | :--- | :--- |
| **Bárbara Zero** | Vanilla JS + PWA | Sistema Offline com Service Worker customizado, Haptics (Vibração), Text-To-Speech nativo e AdMob infantil. |
| **AnimeHub Mobile** | Vanilla JS Standalone | Glassmorphism fluido, consumo da API Jikan API (MyAnimeList), sistema de cache inteligente local e histórico. |
| **DarkFrame Mobile** | Vanilla JS Standalone | Estética de alta fidelidade com gradients radial, grades de filtros avançadas de streaming de horror. |
| **Carinho Doces da Fabi** | Vanilla JS + PWA | Design delicado em tons pastel, cardápios e receitas dinâmicas, favoritos locais e gerador de link WhatsApp. |
| **CopaCenter 2026** | Vanilla JS + PWA | Cobertura total de 104 jogos, simulador interativo de chaves, MatchZone social com Firebase, e favoritos. |

---

## ⚙️ Como Desenvolver e Sincronizar (Instruções Globais)

Como cada aplicativo utiliza o **CapacitorJS**, toda alteração na camada Web deve ser copiada para as pastas nativas antes de compilar os APKs/IPAs.

### 1. Entrar na pasta do aplicativo desejado
*(Nunca edite arquivos no nível raiz do monorepo global, entre na pasta específica)*
```bash
cd barbara-zero
# ou
cd animehub-mobile
# ou
cd darkframe-mobile
# ou
cd carinho-doces-da-fabi
# ou
cd copa-2026-app
```

### 2. Instalar as dependências locais
```bash
npm install
```

### 3. Sincronizar as alterações da Web com a plataforma nativa
```bash
npx cap copy android
# ou use sync para atualizar plugins:
npx cap sync
```

### 4. Abrir no Android Studio para gerar o APK
```bash
npx cap open android
```

---

## 🚀 Instruções de Publicação (GitHub Pages)

Para manter o deploy automático ativo:
1. Ative o **GitHub Pages** nas configurações deste repositório (`Settings > Pages`).
2. Defina o *Build and deployment* para obter os arquivos da branch **`main`** na pasta raiz **`/(root)`**.
3. Sempre que realizar um commit na branch `main`, os cinco aplicativos serão compilados e publicados simultaneamente sob seus subcaminhos relativos!

---

💡 *Monorepo mantido e configurado com fins de portabilidade multiplataforma por Renan Pires.*
