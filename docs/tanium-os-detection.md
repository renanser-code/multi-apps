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

## Registros duplicados e prioridade de status

Quando a mesma VM possui varios registros na CMDB, o registro com status
`Ligada` tem prioridade sobre registros desligados ou sem status. O resultado
independe da ordem da base e e exibido uma unica vez no escopo, nos contadores,
nos resultados Tanium e nas comunicacoes. O registro ligado fornece IP e SO;
nao sao misturados campos de registros antigos desligados.

A preferencia nao atravessa clientes diferentes e nao substitui um IP
explicitamente informado por outro. Se varios registros ligados ainda apontam
para maquinas diferentes, a correspondencia permanece ambigua para validacao.
Se nao houver registro ligado, o gerador nao inventa esse status.

Os valores `ON`, `PoweredOn`, `Powered On`, `Ligado` e `Ligada` representam
o estado ligado; `OFF`, `PoweredOff`, `Desligado` e `Desligada` representam
o estado desligado. A normalizacao e compartilhada pela selecao e exibicao.
No e-mail inicial, somente desligamento confirmado vai para DESLIGADOS.
Maquinas nao localizadas, descontinuadas ou sem confirmacao de energia ficam
em um bloco separado de status nao confirmado, para validacao.
Uma linha anterior apenas com hostname deixa de gerar pendencia duplicada
quando outra linha identifica inequivocamente a mesma VM pelo IP.

Checkpoint anterior a este ajuste do e-mail:
`rollback/pre-email-power-status-20261016-200937`.
Backup local:
`C:\Users\RenanSerafimPires\OneDrive - Claranet\Documentos\Manuais\backups-gerador-tanium\pre-email-power-status-20261016-200937`.

Checkpoint anterior a esta correcao:
`rollback/pre-prefer-powered-on-20261016-194929`.
Backup local:
`C:\Users\RenanSerafimPires\OneDrive - Claranet\Documentos\Manuais\backups-gerador-tanium\pre-prefer-powered-on-20261016-194929`.

## Classificacao automatica de banco de dados

Qualquer hostname contendo `SQL`, sem diferenciar maiusculas de minusculas,
e classificado como Banco de Dados, sem precisar de cadastro na lista manual.
Somente o nome da VM e considerado; observacoes e sufixos de dominio nao
ativam essa regra. As classificacoes manuais e prioridades existentes permanecem.
Os alertas nao sao duplicados quando a VM ja consta na lista de bancos de dados.
O destaque aparece no painel, no escopo, nos e-mails e na tabela do PDF, sem
alterar as colunas do modelo do relatorio.

Checkpoint anterior a esta regra:
`rollback/pre-sql-database-rule-20261015-221222`.
Backup local:
`C:\Users\RenanSerafimPires\OneDrive - Claranet\Documentos\Manuais\backups-gerador-tanium\pre-sql-database-rule-20261015-221222`.

## Rollback da correcao de SO

Tag anterior a esta correcao:
`rollback/pre-os-detection-20261015-191015`.

Backup do HTML local e teste:
`C:\Users\RenanSerafimPires\OneDrive - Claranet\Documentos\Manuais\backups-gerador-tanium\pre-os-detection-20261015-191015`.

Para desfazer somente esta alteracao, preservar a versao atual, restaurar o
HTML local do backup e reverter o commit desta correcao no GitHub, revisando
o diff. Nao reverter os JSONs produzidos pelas sincronizacoes automaticas nem
alteracoes posteriores de outros trabalhos.
