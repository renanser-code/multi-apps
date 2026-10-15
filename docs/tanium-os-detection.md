# Identificacao de SO e associacao com a CMDB

O gerador reconhece `WIN/2022`, `WIN 2022`, `WIN2022` e os nomes completos
de Windows Server. A mesma normalizacao atende 2012, 2016, 2019 e 2025.
Hostnames como `SRV1201` nao constituem evidencia de Windows Server 2012.
O alerta de 2012 permanece para maquinas realmente identificadas com esse SO.

Se a linha contem um IP, a selecao na CMDB deve corresponder a esse IP.
Um hostname compartilhado por clientes diferentes nao pode substituir essa
identidade. Sem IP, nomes ambiguos ficam sem correspondencia, exigindo validacao.

Uma versao Windows explicita e nao generica na GMUD prevalece quando diverge
do SO cadastrado na CMDB. A divergencia e exibida na revisao e no escopo para
validacao do cadastro; a base original da CMDB nao e modificada. O estado
ligado/desligado continua sendo obtido da CMDB. Expressoes como `2016 or later`
nao sobrepoem uma versao especifica cadastrada.

As mesmas informacoes corrigidas alimentam o e-mail inicial, o encerramento,
a selecao de KBs, os agrupamentos por SO e o relatorio para PDF.

Os testes de regressao reproduzem a linha `SRV-SQL ... WIN/2022` repetida no
cronograma da GMUD 1010, com endereco IP reservado para documentacao, sem
publicar contatos ou a base real do cliente. Incluem colisao de hostname,
cadastro divergente, correspondencia ausente e maquinas realmente 2012.

## Rollback

Tag anterior a esta correcao:
`rollback/pre-os-detection-20261015-191015`.

Backup do HTML local e teste:
`C:\Users\RenanSerafimPires\OneDrive - Claranet\Documentos\Manuais\backups-gerador-tanium\pre-os-detection-20261015-191015`.

Para desfazer somente esta alteracao, preservar a versao atual, restaurar o
HTML local do backup e reverter o commit desta correcao no GitHub, revisando
o diff. Nao reverter os JSONs produzidos pelas sincronizacoes automaticas nem
alteracoes posteriores de outros trabalhos.
