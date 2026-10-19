# Precisao da analise de evidencias

## Alteracao de 18/10/2026

- Reconstrucao espacial das linhas sem duplicar palavras entre `words` e `blocks`.
- Tolerancia menor entre linhas para nao juntar servidores vizinhos.
- Identificacao por hostname/FQDN/IP completo, sem aceitar prefixo de outra VM.
- Correcao aproximada somente quando univoca no escopo, incluindo confusoes
  S/5 e transposicao adjacente. Numeracao diferente nao valida outra VM.
- Hostnames SVR sem digitos tambem sao aceitos no escopo.
- `Installing` e download em andamento nao significam sucesso da atualizacao.
- Evidencias divergentes requerem validacao. A quantidade de linhas de sucesso
  nunca substitui a correlacao individual das VMs.
- Segunda leitura em modo esparso quando a primeira nao resolve o escopo.
- PDFs com texto nativo usam suas coordenadas; paginas digitalizadas usam o
  mesmo tratamento de imagem/OCR. As fronteiras de arquivos/paginas sao isoladas.
- Falhas sao isoladas por arquivo e nao interrompem os demais anexos.
- Resultado parcial ou pendente nao pode ser apresentado como sucesso comprovado.
- A interface mostra contagem correlacionada, falhas e texto extraido por arquivo.
- Resultados anteriores nao sobrescrevem um novo conjunto de anexos.

As mesmas funcoes fornecem resultados ao e-mail e ao HTML imprimivel do PDF.
Nenhuma integracao de IA ou envio a um servico externo de analise foi adicionado.
O Tesseract continua executando a leitura no navegador, com bibliotecas/modelo
carregados pela internet como anteriormente.

## Verificacao

`node --test scripts/tanium-kb-browser.test.cjs scripts/tanium-kb-sync.test.cjs`

`node gerador_tanium_hostnames_ips_v3.test.js`

`node scripts/embed-tanium-kb-sync.mjs --check`

Validacao adicional local com o PNG original fornecido pelo usuario, Tesseract
5.1.1 e Edge headless, utilizando a funcao real de pre-processamento e o upload
de arquivo: 10/10 VMs reconhecidas como Installing. Dependencias/modelo servidos
localmente no teste, sem simular a resposta do OCR. Verificacao em viewport
mobile sem overflow horizontal. O arquivo do cliente nao foi incluido no repo.

## Rollback

Tag: `rollback/pre-evidence-precision-20261018`.

Backup do HTML local:
`Documentos/Manuais/backups-gerador-tanium/pre-evidence-precision-20261018`.

Para desfazer, preservar o estado atual, restaurar somente o HTML/teste do
backup local e reverter o commit desta alteracao no GitHub. Revisar o diff e
executar os testes antes de publicar. Nao restaurar o repositorio inteiro nem
reverter os catalogos JSON que sao atualizados automaticamente.
