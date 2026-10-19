# Escopo restrito a VMs ligadas - 19/10/2026

O filtro de VMs ligadas permanece marcado e bloqueado na interface. A API
continua carregando todos os registros para permitir resolver duplicidades e
conferir os excluidos, mas somente status normalizado Ligada e elegivel.

O escopo elegivel alimenta padrao Tanium, copias de hostnames/IPs por SO,
contagens, resultado copiavel da CMDB, classificacoes e alertas do cliente,
KBs/SOs afetados, abertura, encerramento e relatorio imprimivel.
Desligadas/descontinuadas/nao localizadas ficam somente na conferencia.

Sem base validada ou sem VM ligada, nao ha fallback para o texto original.
Emails e relatorio indicam escopo nao liberado. Ao recarregar a API, os
resultados anteriores sao invalidados antes da requisicao; falha de rede ou
resposta fora do formato esperado nao mantem uma antiga lista de deploy.
As copias recalculam as saidas, evitando copiar um encerramento obsoleto.

Os testes incluem estados mistos, nenhuma VM ligada, base indisponivel,
resposta invalida, classificacao SQL e exclusao de alertas/KBs de VMs OFF.
Continuam cobertos os registros duplicados e restaurados com sufixo.

## Rollback

Tag anterior: `rollback/pre-only-on-20261019`.
Backup local de HTML/teste:
`Documentos/Manuais/backups-gerador-tanium/pre-only-on-20261019`.
Preservar o estado atual, restaurar apenas esses arquivos locais e reverter
o commit desta mudanca no GitHub. Nao reverter os catalogos automaticos JSON.
