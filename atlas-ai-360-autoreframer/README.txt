ATLAS AI 360 AUTOREFRAMER
=========================

Objetivo:
Aplicativo desktop inteligente para reenquadrar (reframe) automaticamente videos de 360 graus
(equiretanguar) de drones (ex: DJI Avata 360) e cameras esféricas, utilizando Inteligencia Artificial
(YOLOv8) para rastreamento de alvos (pessoas, carros, etc.) e estabilização de horizonte.

Como usar:
1. Certifique-se de ter o Python instalado.
2. Dê dois cliques em 'INSTALAR.bat' para baixar e instalar as dependencias necessárias.
3. Dê dois cliques em 'EXECUTAR_ATLAS_AI_360.bat' para abrir o aplicativo.
4. Clique em 'Selecionar Vídeo 360' e escolha o arquivo MP4 gravado pelo drone.
5. Selecione o formato de saída (Paisagem 16:9 ou Retrato 9:16).
6. Ajuste os sliders de FOV (Zoom da lente) e Smoothing (Inercia do movimento da câmera).
7. Clique em 'Analisar e Selecionar Alvo' para rodar uma deteção rápida YOLOv8 no primeiro frame do vídeo.
8. Escolha o elemento que deseja seguir no menu de alvos detectados (Ex: 'carro #1', 'pessoa #1').
9. Clique em 'Iniciar Edição Automática'.
10. O vídeo reenquadrado final será gerado automaticamente com o nome '_REFRAMED.mp4' na mesma pasta.

Requisitos de Sistema:
- Python 3.8 ou superior
- Conexão de Internet (apenas na primeira execução para baixar o modelo YOLOv8 automaticamente)
