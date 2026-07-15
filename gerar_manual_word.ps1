# Script para gerar manual do Word (.docx) automatizado usando objeto COM (Sem acentos)
$Word = New-Object -ComObject Word.Application
$Word.Visible = $false
$Doc = $Word.Documents.Add()
$Selection = $Word.Selection

# Configurar estilos de formatacao
$Selection.PageSetup.TopMargin = 72 # 1 polegada
$Selection.PageSetup.BottomMargin = 72
$Selection.PageSetup.LeftMargin = 72
$Selection.PageSetup.RightMargin = 72

# Titulo Principal
$Selection.Font.Name = "Calibri"
$Selection.Font.Size = 24
$Selection.Font.Bold = $true
$Selection.Font.Color = 12531742 # Azul Escuro (RGB invertido para COM: 0xBF5B1E)
$Selection.TypeText("Manual de Uso: Gerador Tanium e Agendador de GMUD (V3)`n")

# Subtitulo
$Selection.Font.Size = 12
$Selection.Font.Bold = $false
$Selection.Font.Italic = $true
$Selection.Font.Color = 8421504 # Cinza
$Selection.TypeText("Guia passo a passo para extracao de dados e agendamento de comunicados de GMUD via Outlook local.`n`n")

# Linha divisoria
$Selection.ParagraphFormat.Borders.Item(-3).LineStyle = 1 # Bottom border

# Cabecalho: Sobre a Ferramenta
$Selection.Font.Size = 16
$Selection.Font.Bold = $true
$Selection.Font.Italic = $false
$Selection.Font.Color = 12531742
$Selection.TypeText("1. Sobre a Ferramenta`n")
$Selection.Font.Size = 11
$Selection.Font.Bold = $false
$Selection.TypeText("O Gerador Tanium V3 permite cruzar dados de servidores informados no e-mail de GMUD com a base do CMDB da Claranet de forma offline no seu navegador, gerando automaticamente:`n")
$Selection.TypeText(" - Lista de servidores limpos, ordenados e com status do CMDB (ligada/desligada);`n")
$Selection.TypeText(" - Expressao regular (Regex) pronta para deploy no Tanium;`n")
$Selection.TypeText(" - Corpo de e-mail formatado em HTML (com negritos e tabelas organizadas);`n")
$Selection.TypeText(" - Script do PowerShell para agendamento de envio automatico via Outlook sem necessidade de permissoes de administrador.`n`n")

# Secao: Como Utilizar (Receita de Bolo)
$Selection.Font.Size = 16
$Selection.Font.Bold = $true
$Selection.Font.Color = 12531742
$Selection.TypeText("2. Receita de Bolo: Passo a Passo`n")

$Passos = @(
    "Copie o e-mail completo que voce recebeu com a solicitacao da GMUD.",
    "Cole o conteudo copiado na area azul escuro 'Colar E-mail da GMUD (Extracao Automatica)'.",
    "Clique no botao 'Analisar E-mail e Preencher Campos'.",
    "Confirme se a data, hora, numero da GMUD e lista de servidores foram preenchidos corretamente.",
    "Na lista de e-mails extraidos, revise o direcionamento automatico (e-mails @claranet.com vao para Copia (Cc) e demais para Para (To)).",
    "Caso utilize o CMDB, certifique-se de clicar em 'Carregar Base de Dados (GetDataLake)' para atualizar o status dos servidores.",
    "Verifique o preview do script PowerShell gerado e clique em 'Copiar Script PowerShell'.",
    "Pressione 'Win + R', digite 'powershell' e aperte Enter.",
    "Na tela preta do PowerShell, cole com Ctrl+V e pressione Enter. A janela piscara o Outlook para preencher a assinatura, agendara o e-mail na Caixa de Saida e se fechara."
)

$Selection.Font.Size = 11
$Selection.Font.Bold = $false
for ($i = 0; $i -lt $Passos.Count; $i++) {
    $Selection.Font.Bold = $true
    $Selection.TypeText("Passo $($i + 1): ")
    $Selection.Font.Bold = $false
    $Selection.TypeText("$($Passos[$i])`n")
}
$Selection.TypeText("`n")

# Secao: Avisos Importantes
$Selection.Font.Size = 14
$Selection.Font.Bold = $true
$Selection.Font.Color = 255 # Vermelho
$Selection.TypeText("AVISOS IMPORTANTES`n")
$Selection.Font.Size = 11
$Selection.Font.Bold = $false
$Selection.Font.Color = 0
$Selection.TypeText("1. O e-mail agendado ficara salvo na pasta 'Caixa de Saida' (Outbox) do seu Outlook local.`n")
$Selection.TypeText("2. O Outlook deve estar aberto na hora programada para que o envio seja disparado.`n")
$Selection.TypeText("3. Nao altere o e-mail na Caixa de Saida manualmente apos o agendamento para evitar que ele perca a propriedade de envio automatico.`n`n")

# Salvar documento na pasta Manuais
$Filename = "C:\Users\RenanSerafimPires\OneDrive - Claranet\Documentos\Manuais\Manual_Gerador_Tanium_V3.docx"
if (Test-Path $Filename) { Remove-Item $Filename -Force }
$Doc.SaveAs([ref]$Filename)
$Doc.Close()
$Word.Quit()

Write-Host "Manual gerado com sucesso sem acentos em: $Filename" -ForegroundColor Green
