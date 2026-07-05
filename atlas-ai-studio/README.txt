ATLAS AI STUDIO - DOWNLOAD & LEGENDA
======================================

Objetivo:
Baixar vídeos do YouTube, SharePoint e outros serviços, e receber um MP4 final com:
- Vídeo + áudio em AAC compatível com Windows
- Legenda automática gerada pelo Whisper (localmente)
- Tradução da legenda para Português (PT-BR)
- Legenda embutida no vídeo final (hardsub)

Como usar:
1. Certifique-se de que o Python está instalado no seu computador.
2. Execute o script 'INSTALAR.bat' para instalar as dependências e baixar o ffmpeg/yt-dlp.
3. Execute o script 'ATLAS_AI_STUDIO.bat' para abrir o programa.
4. Cole o link do YouTube ou SharePoint.
5. Selecione as opções de áudio e legenda desejadas.
6. (Opcional) Se o vídeo for do SharePoint / Stream / OneDrive, selecione o navegador em que você está logado no campo "Cookies (autenticação)".
7. Clique em "PROCESSAR COMPLETO".

Novidade - Download do SharePoint:
Para baixar vídeos privados do SharePoint Online/Microsoft Stream:
1. Faça login na sua conta da Claranet / Microsoft 365 no navegador (ex.: Microsoft Edge ou Chrome).
2. No Atlas AI Studio, selecione o seu navegador no campo "Cookies (autenticação)".
3. Cole o link de compartilhamento ou visualização do vídeo do SharePoint.
4. Clique em "PROCESSAR COMPLETO".
* Nota: Se a extração falhar ou der erro de banco de dados bloqueado, feche o navegador temporariamente durante o download.

Saída:
A pasta downloads terá:
- video_AAC.mp4 (vídeo com áudio AAC corrigido)
- video_AAC.srt (legenda no idioma original)
- video_AAC.pt-BR.srt (legenda traduzida para PT-BR)
- video_AAC_FINAL_PTBR.mp4 (vídeo com legenda embutida permanentemente)

Observações:
- O app baixa o yt-dlp.exe e o ffmpeg.exe na pasta 'tools' automaticamente.
- A transcrição roda localmente usando o processador (CPU), e na primeira execução o modelo Whisper (small) será baixado automaticamente.
