# Portugues do Brasil nos e-mails - 21/10/2026

Revisao dos textos automaticos de inicio e encerramento: acentuacao,
concordancia e termos como evidencias, observacoes, validacao, prioridades,
criticidade, comunicacao e atualizacao. Os textos exibidos usam os acentos
corretos, e a data/hora usa "as" com crase. O assunto Outlook tambem foi revisto.

Mensagens internas de OCR continuam com os mesmos identificadores/resultados
para preservar a logica e os testes. A apresentacao dessas mensagens no e-mail
usa uma formatacao especifica de portugues, sem substituir o HTML completo.

Hostnames, IPs, clientes, KBs, nomes oficiais dos produtos, titulo da GMUD e
observacoes digitadas nao passam por um corretor global. O conteudo digitado
permanece literal, evitando alterar identificadores ou instrucoes operacionais.
Status originais do Tanium, como Complete e Pending Restart, sao preservados.
As regras de privacidade VISA, criticidade e escopo ON continuam ativas.

Testes verificam o texto em portugues, acentos, horario e preservacao dos
campos operacionais, inclusive nomes que contem palavras sem acento.

## Rollback

Tag: `rollback/pre-email-ptbr-20261021`.
Backup local de HTML/teste:
`Documentos/Manuais/backups-gerador-tanium/pre-email-ptbr-20261021`.
Preservar o estado atual, restaurar os arquivos locais do backup e reverter
somente o commit desta revisao no GitHub. Nao reverter catalogos JSON automaticos.
