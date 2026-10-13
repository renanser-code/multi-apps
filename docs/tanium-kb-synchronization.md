# Sincronizacao automatica dos KBs do Tanium

## Fontes e selecao

O motor `scripts/tanium-kb-sync.cjs` e compartilhado entre GitHub Actions e o
HTML local. Consulta exclusivamente as seguintes fontes oficiais:

- MSRC: lista de publicacoes e documentos CVRF recentes.
- Microsoft Learn: historico das versoes do Windows Server.
- Microsoft Update Catalog: cumulativos x64 dos meses atual e anterior.
- Microsoft Support: confirmacao das atualizacoes extraordinarias classificadas
  como `Updates`, quando ainda nao constam no historico de lancamentos.

A selecao e independente para Server 2016, 2019, 2022 e 2025. Sao verificados
produto, arquitetura, data, classificacao e familia de build, quando fornecida.
Server 2022 utiliza o produto 21H2 no Catalog; Server 2025 utiliza 24H2.
Previews, .NET, hotpatch, dynamic updates e servicing stacks nao sao recomendados.
A maior build conhecida e preferida; sem build, utiliza-se a data de publicacao.
Duplicatas sao consolidadas e revisoes de metadados nao constituem novo patch.

## Operacao

GitHub Actions consulta as fontes a cada 30 minutos, todos os dias, inclusive
fora do Patch Tuesday. O calendario da segunda terca-feira e usado somente
para alertar sobre um ciclo ainda nao confirmado, nunca para bloquear consultas.
Publicacoes do MSRC, Learn e Catalog podem aparecer em horarios diferentes.

O HTML consulta o catalogo publicado ao abrir, a cada 15 minutos, ao recuperar
a conexao e ao voltar para a aba. Prioriza o JSON do branch `main`, evitando
depender de um novo deploy do GitHub Pages. Se estiver antigo ou em falha,
tenta tambem as fontes oficiais diretamente, sujeito ao CORS do navegador.
As consultas diretas utilizam o mesmo motor do job agendado.

Falhas transitorias possuem timeout e ate tres tentativas por requisicao.
O navegador agenda novas tentativas em 1, 2, 4, 8 e ate 15 minutos. Falhas
parciais nao bloqueiam KBs novos de outras versoes. Uma falha total conserva os
ultimos registros validados e a data do ultimo sucesso, sem simular atualizacao.
O JSON e escrito por substituicao atomica. O painel mostra ultimo sucesso,
proxima consulta, falhas e alerta para uma consulta com mais de 90 minutos.

O funcionamento depende de internet, disponibilidade das fontes oficiais e
GitHub Actions habilitado. O [agendamento do GitHub](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule) pode atrasar. Repositorios
publicos sem atividade por 60 dias podem ter agendamentos desabilitados pelo
GitHub; as publicacoes periodicas do catalogo mantem atividade quando o job roda.
Se o job parar, o indicador de frescor sinaliza a parada. Nao sao inventados KBs
nem declarada atualizacao bem-sucedida durante indisponibilidade.

## Validacao

```powershell
npm ci
npm run test:tanium
npm run sync:tanium
```

Os testes usam respostas controladas para um novo mes, um cumulativo emergencial,
fontes atrasadas, produtos incorretos, duplicidades, falhas parciais/totais,
timeout, 429, cache antigo, concorrencia, tentativas e recuperacao no navegador.
Tambem validam o HTML via `file:` e a regeneracao dos e-mails de inicio,
encerramento e relatorio para PDF apos receber o catalogo de um novo mes.
A consulta real em 13/10/2026 encontrou os quatro KBs de outubro no Catalog,
mesmo com o CVRF de outubro ainda antecipado e o Learn ainda em setembro.

Ao alterar o motor, atualizar a copia embutida e executar os testes:

```powershell
node scripts/embed-tanium-kb-sync.mjs
npm run test:tanium
```

## Rollback preservado

Tag remota anterior a esta alteracao:
`rollback/pre-sync-kbs-20261013-153505` (commit `351203110cad3b29699f5aa9ee0c09f849b1dfed`).

Backup local original:
`C:\Users\RenanSerafimPires\OneDrive - Claranet\Documentos\Manuais\backups-gerador-tanium\pre-sync-kbs-20261013-153505`.

Para desfazer no GitHub, pausar primeiro o workflow de sincronizacao e criar um
commit de reversao, desfazendo os commits desta entrega em ordem inversa:
testes/documentacao posteriores, normalizacao auxiliar (`da805c7`) e
implementacao (`0267a5f`). Revisar possiveis conflitos do JSON com as
sincronizacoes posteriores e dos testes modificados apos a implementacao.
O tag preserva o conteudo anterior completo para essa revisao. Nao usar reset
destrutivo nem reverter outras alteracoes do usuario. Publicar a reversao e
validar a pagina. A reversao retorna ao mecanismo anterior, com suas limitacoes.

Para restaurar o HTML local, preservar uma copia do arquivo atual e substituir
somente o HTML e seu teste pelas copias desse backup. Nenhum dado da CMDB,
evidencia ou arquivo enviado e apagado pelo rollback. O cache de sincronizacao
possui chave nova (`tanium-kb-catalog-v2`), ignorada pela versao anterior.
