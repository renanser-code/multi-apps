# Carinho Doces da Fabi 🍰✨

> **Aplicativo Mobile Premium de Confeitaria Artesanal Feito com Amor**

Este repositório contém o código-fonte completo e a estrutura nativa do aplicativo **Carinho Doces da Fabi**. O app foi projetado com uma experiência visual premium de alta fidelidade nas cores rosa e creme, contando com banco de dados local off-line, sistema de favoritos, animações fluidas de carregamento (Skeleton loaders), DRM contra capturas e cópias de tela, além de um fluxo elegante e intuitivo para realização de pedidos e encomendas diretas via WhatsApp, Instagram ou E-mail.

---

## 📱 Tecnologias Utilizadas

*   **Core**: HTML5 Semântico e Vanilla Javascript (ES6+) para alta performance.
*   **Design & Estilos**: Vanilla CSS3 customizado com transições fluidas, filtros de blur, gradientes premium e design responsivo (Mobile-First).
*   **PWA & Híbrido**: CapacitorJS (v6) para empacotamento nativo no ecossistema Android e iOS.
*   **Recursos Especiais**:
    *   **DRM de Proteção**: Bloqueio de cliques com botão direito, toque longo (menus de contexto móveis) e atalhos de teclado comuns de cópia/impressão (Ctrl+C, Ctrl+P, etc.).
    *   **Fallback Inteligente**: Detecção automática de imagens off-line com carregamento dinâmico local de alta resolução.
    *   **Premium Shimmer Skeleton**: Efeito shimmer fluido durante o pré-carregamento dos elementos na tela inicial e no modal.

---

## 🚀 Como Rodar o Projeto Localmente

### 1. Pré-requisitos
Certifique-se de ter instalado em sua máquina:
*   [Node.js](https://nodejs.org/) (versão 16 ou superior)
*   [Android Studio](https://developer.android.com/studio) (para gerar APKs e rodar no emulador)
*   [NPM](https://www.npmjs.com/) (geralmente instalado junto ao Node.js)

### 2. Instalar Dependências
No terminal, dentro do diretório do projeto, instale as dependências necessárias do Capacitor:
```bash
npm install
```

### 3. Rodar o Servidor Web de Testes
O aplicativo web pode ser executado localmente subindo qualquer servidor estático HTTP a partir da pasta `www/`.
Se você utiliza o VS Code, pode abrir o projeto e iniciar a extensão **Live Server**, ou usar o Node.js para rodar globalmente:
```bash
# Exemplo usando npx para rodar um servidor instantâneo na porta 8080
npx http-server ./www -p 8080
```
Acesse `http://localhost:8080` no seu navegador para ver o aplicativo em execução.

---

## 🛠️ Como Sincronizar e Compilar o Projeto Nativo (Android)

Toda vez que você fizer alterações nos arquivos da pasta `www/` (como `app.js`, `style.css` ou `index.html`), você deve sincronizar as alterações com o projeto Android nativo executando:

```bash
npx cap copy android
# Ou use o comando completo para copiar assets e atualizar plugins:
npx cap sync
```

---

## 📦 Como Gerar o Arquivo APK (Passo a Passo)

### Passo 1: Abrir o projeto Android Studio
Abra o projeto nativo do Android Studio direto pela linha de comando:
```bash
npx cap open android
```
*Ou, se preferir, abra o Android Studio manualmente e importe a pasta `./android` do projeto.*

### Passo 2: Sincronizar o Gradle
Ao abrir o Android Studio pela primeira vez, aguarde a sincronização inicial do Gradle (`Gradle Sync`) terminar. Isso pode levar alguns minutos, pois o Android Studio irá baixar as dependências do Android SDK necessárias.

### Passo 3: Compilar o APK de Depuração (Debug)
No menu superior do Android Studio:
1. Vá em **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2. O Gradle iniciará a compilação do APK.
3. Ao finalizar, uma notificação aparecerá no canto inferior direito. Clique no link **"locate"** para abrir a pasta onde o APK foi salvo.
4. O arquivo gerado estará em:
   `android/app/build/outputs/apk/debug/app-debug.apk`

### Passo 4: Gerar o APK de Produção Assinado (Release)
Para publicar ou enviar um arquivo oficial otimizado:
1. No menu superior, clique em **Build** > **Generate Signed Bundle / APK...**
2. Escolha **APK** e clique em **Next**.
3. Crie ou selecione uma chave digital de assinatura (`Key Store Path`), preencha as senhas solicitadas e clique em **Next**.
4. Selecione a variante **release**, marque as caixas de assinatura apropriadas se necessário, e clique em **Finish**.
5. O APK assinado e otimizado será gerado na pasta do seu projeto em `android/app/release/`.

---

## 📲 Como Testar Externamente (No Celular)

### Método 1: Instalação Direta via USB (Android)
1. Ative as **Opções de Desenvolvedor** no seu celular Android (Vá em *Configurações* > *Sobre o telefone* > Clique 7 vezes no *Número da Versão*).
2. Vá nas novas opções de desenvolvedor e ative a **Depuração USB**.
3. Conecte o celular ao computador através do cabo USB.
4. Execute o comando abaixo para compilar e instalar o app direto no seu celular conectado:
   ```bash
   npx cap run android
   ```

### Método 2: Instalação do Arquivo APK no Celular
1. Copie o arquivo `app-debug.apk` gerado no *Passo 3* anterior para o seu celular (você pode enviar para si mesmo via WhatsApp, subir no Google Drive ou enviar por E-mail).
2. Abra o arquivo no celular.
3. Se o Android exibir um aviso de segurança sobre "Instalar aplicativos de fontes desconhecidas", clique em **Configurações** na mensagem e autorize a instalação para o seu gerenciador de arquivos/navegador.
4. Clique em **Instalar** e o app estará pronto para uso na sua lista de aplicativos!

### Método 3: Acesso via Rede Local Sem Fio (Wi-Fi) no iPhone/Android
Caso queira testar a responsividade web diretamente de um iPhone ou celular Android conectado na mesma rede Wi-Fi sem compilar:
1. Descubra o IP local do seu computador na rede (No Windows, abra o PowerShell e digite `ipconfig`. Procure pelo IP IPv4, ex: `192.168.1.15`).
2. Suba o servidor web local na porta 8080:
   ```bash
   npx http-server ./www -p 8080 -a 0.0.0.0
   ```
3. No seu celular conectado na **mesma rede Wi-Fi**, abra o Safari (iPhone) ou Chrome (Android) e acesse:
   `http://<IP_DO_SEU_COMPUTADOR>:8080` (exemplo: `http://192.168.1.15:8080`).
4. **Dica para iPhone**: Para testar a experiência de aplicativo instalado (PWA), clique no botão **Compartilhar** do Safari e selecione **Adicionar à Tela de Início**. O ícone e o nome *Carinho Doces da Fabi* serão salvos na sua tela inicial, rodando em tela cheia sem barra de endereços!

---

## 📂 Estrutura do Repositório

```text
├── android/                    # Pasta nativa do projeto Android (Gradle, Java, Manifest, etc.)
├── www/                        # Código-fonte Web principal (HTML, CSS, JS e Imagens Locais)
│   ├── assets/                 # Logotipos, ícones do PWA e imagens locais de fallback
│   ├── app.js                  # Lógica de banco de dados, preloader, rotas e DRM
│   ├── index.html              # Estrutura de visualização e Modais de Encomenda
│   └── style.css               # Folha de estilos premium, responsiva e shimmer skeleton
├── .gitignore                  # Arquivo para evitar envio de binários locais pesados
├── capacitor.config.json       # Configurações do CapacitorJS
├── package.json                # Gerenciador de dependências e pacotes Node
├── package-lock.json           # Lock de versões instaladas
└── README.md                   # Este manual de instruções
```

---

## 👩‍🍳 Créditos e Autoria

Aplicativo confeccionado especialmente para a confeitaria artesanal **Carinho Doces da Fabi**. Todos os direitos reservados. 🍩💕
