# Privacidade dos e-mails VISA - 20/10/2026

Os e-mails de inicio e encerramento da VISA ocultam os hostnames nos corpos
gerados, incluindo listas de servidores, prioridades, bancos de dados,
validacao manual, observacoes e titulos. Identificadores sao substituidos por
Servidor do escopo. Status, contagens, alertas, SOs e KBs permanecem disponiveis.
Nomes de arquivos sao substituidos por Evidencia N no texto do e-mail.
IPs tambem sao ocultos, inclusive em observacoes, preservando a regra anterior.
O assunto do agendamento Outlook passa pelo mesmo tratamento.

A deteccao considera o titulo VISA e os clientes VISA/HYPERATIVA/HIPERATIVA.
Um cliente nao VISA confirmado pela CMDB nao e substituido por um campo manual
antigo do encerramento. Campos e titulos de outros clientes permanecem iguais.

O tratamento ocorre somente na saida de comunicacao: hostnames usados pelo
Tanium, CMDB e correlacao OCR nao sao alterados. PDF tecnico e arquivos originais
continuam completos; nao anexar esses artefatos a comunicacoes que exijam
anonimizacao integral. Essa alteracao nao modifica pixels das evidencias.

Testes cobrem VISA numerada, hostname generico em cliente VISA, HYPERATIVA,
cliente diferente, prioridades, SQL, FQDN, observacoes, nomes de arquivos,
IPs, assunto Outlook e preservacao das saidas internas e do relatorio tecnico.

## Rollback

Tag: `rollback/pre-visa-email-hostnames-20261020`.
Backup local HTML/teste:
`Documentos/Manuais/backups-gerador-tanium/pre-visa-email-hostnames-20261020`.
Para reverter, preservar o estado atual, restaurar HTML/teste local e reverter
somente o commit desta regra no GitHub. Manter catalogos automaticos JSON.
