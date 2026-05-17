# Barbara Zero - preparacao para lojas

## Status atual

- PWA instalavel com manifest, icones e service worker.
- Funciona offline depois do primeiro carregamento.
- Progresso salvo localmente no aparelho.
- Tela Sobre e Politica de Privacidade adicionadas.
- Estrutura Capacitor criada em `android/`.
- App id Android: `com.renanser.barbarazero`.
- Nome do app: `Barbara Zero`.
- Versao inicial: `1.0.0`.

## Comandos principais

Rodar local:

```powershell
npm start
```

Validar web:

```powershell
npm run verify
```

Gerar pacote web para Capacitor:

```powershell
npm run build:cap
```

Sincronizar Android:

```powershell
npm run cap:sync
```

Abrir no Android Studio:

```powershell
npm run cap:open:android
```

Gerar APK debug, depois de instalar Java 11+ e Android SDK:

```powershell
cd android
.\gradlew.bat assembleDebug
```

Gerar AAB para Play Store, depois de configurar assinatura:

```powershell
cd android
.\gradlew.bat bundleRelease
```

## Bloqueio local encontrado

O build Android falhou porque a maquina esta usando Java 8. O Gradle atual exige Java 11 ou superior.

Instalar uma JDK 17 e configurar `JAVA_HOME` resolve o proximo passo de build.

## Antes de enviar para Play Store

- Criar conta Google Play Console.
- Gerar keystore de release.
- Configurar assinatura em `android/gradle.properties` e `android/app/build.gradle`.
- Revisar classificacao indicativa.
- Publicar politica de privacidade em URL publica.
- Verificar requisitos de apps infantis/familia no Play Console.
- Testar em aparelhos Android reais.

## App Store futura

O Capacitor iOS esta configurado no `package.json`, mas a plataforma iOS precisa ser gerada em um Mac com Xcode:

```bash
npm run cap:add:ios
npm run cap:open:ios
```
