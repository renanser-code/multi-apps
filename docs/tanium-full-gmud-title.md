# Nome completo da GMUD - 19/10/2026

O campo Nome completo da GMUD recebe numero, cliente e descricao/onda.
Ao analisar o e-mail colado, o gerador extrai esse titulo, preservando caixa,
acentos e identificacao da onda. Frases de continuidade como `, em que ...`
nao integram o titulo. O campo permanece editavel.

Os corpos dos e-mails de inicio/encerramento usam o mesmo titulo completo,
assim como o assunto do agendamento Outlook e o cabecalho do relatorio.
O numero da GMUD permanece separado para identificadores e demais campos.

Sem titulo completo correspondente ao numero atual, os e-mails apresentam
uma pendencia, em vez de gerar silenciosamente um texto so com o numero.
O agendamento nao e gerado nessa situacao. Cliente e onda nao sao inventados.
Titulos sao escapados para HTML e aspas do assunto PowerShell sao protegidas.

Testes cobrem titulo extraido de frase/convite, edicao manual, numero diferente,
nome ausente, HTML, aspas, e-mails, relatorio e assunto Outlook.

## Rollback

Tag: `rollback/pre-full-gmud-title-20261019`.
Backup local: `Documentos/Manuais/backups-gerador-tanium/pre-full-gmud-title-20261019`.
Preservar estado atual, restaurar HTML/teste local desse backup e reverter
somente o commit desta alteracao no GitHub; manter os catalogos JSON automaticos.
