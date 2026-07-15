# Script para gerar manual do Word (.docx) automatizado usando objeto COM
$Word = New-Object -ComObject Word.Application
$Word.Visible = $false
$Doc = $Word.Documents.Add()
$Selection = $Word.Selection

# Configurar estilos de formatação
$Selection.PageSetup.TopMargin = 72 # 1 polegada
$Selection.PageSetup.BottomMargin = 72
$Selection.PageSetup.LeftMargin = 72
$Selection.PageSetup.RightMargin = 72

# Título Principal
$Selection.Font.Name = "Calibri"
$Selection.Font.Size = 24
$Selection.Font.Bold = $true
$Selection.Font.Color = 12531742 # Azul Escuro (RGB invertido para COM: 0xBF5B1E)
$Selection.TypeText("Manual de Uso: Gerador Tanium & Agendador de GMUD (V3)`n")

# Subtítulo
$Selection.Font.Size = 12
$Selection.Font.Bold = $false
$Selection.Font.Italic = $true
$Selection.Font.Color = 8421504 # Cinza
$Selection.TypeText("Guia passo a passo para extração de dados e agendamento de comunicados de GMUD via Outlook local.`n`n")

# Linha divisória
$Selection.ParagraphFormat.Borders.Item(-3).LineStyle = 1 # Bottom border

# Cabeçalho: Sobre a Ferramenta
$Selection.Font.Size = 16
$Selection.Font.Bold = $true
$Selection.Font.Italic = $false
$Selection.Font.Color = 12531742
$Selection.TypeText("1. Sobre a Ferramenta`n")
$Selection.Font.Size = 11
$Selection.Font.Bold = $false
$Selection.TypeText("O Gerador Tanium V3 permite cruzar dados de servidores informados no e-mail de GMUD com a base do CMDB da Claranet de forma offline no seu navegador, gerando automaticamente:`n")
$Selection.TypeText(" - Lista de servidores limpos, ordenados e com status do CMDB (ligada/desligada);`n")
$Selection.TypeText(" - Expressão regular (Regex) pronta para deploy no Tanium;`n")
$Selection.TypeText(" - Corpo de e-mail formatado em HTML (com negritos e tabelas organizadas);`n")
$Selection.TypeText(" - Script do PowerShell para agendamento de envio automático via Outlook sem necessidade de permissões de administrador.`n`n")

# Seção: Como Utilizar (Receita de Bolo)
$Selection.Font.Size = 16
$Selection.Font.Bold = $true
$Selection.Font.Color = 12531742
$Selection.TypeText("2. Receita de Bolo: Passo a Passo`n")

$Passos = @(
    "Copie o e-mail completo que você recebeu com a solicitação da GMUD.",
    "Cole o conteúdo copiado na área azul escuro 'Colar E-mail da GMUD (Extração Automática)'.",
    "Clique no botão 'Analisar E-mail e Preencher Campos'.",
    "Confirme se a data, hora, número da GMUD e lista de servidores foram preenchidos corretamente.",
    "Na lista de e-mails extraídos, revise o direcionamento automático (e-mails @claranet.com vão para Cópia (Cc) e demais para Para (To)).",
    "Caso utilize o CMDB, certifique-se de clicar em 'Carregar Base de Dados (GetDataLake)' para atualizar o status dos servidores.",
    "Verifique o preview do script PowerShell gerado e clique em 'Copiar Script PowerShell'.",
    "Pressione 'Win + R', digite 'powershell' e aperte Enter.",
    "Na tela preta do PowerShell, cole com Ctrl+V e pressione Enter. A janela piscará o Outlook para preencher a assinatura, agendará o e-mail na Caixa de Saída e se fechará."
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

# Seção: Avisos Importantes (Tabela / Caixa de Atenção)
$Selection.Font.Size = 14
$Selection.Font.Bold = $true
$Selection.Font.Color = 255 # Vermelho
$Selection.TypeText("⚠️ IMPORTANTE`n")
$Selection.Font.Size = 11
$Selection.Font.Bold = $false
$Selection.Font.Color = 0
$Selection.TypeText("1. O e-mail agendado ficará salvo na pasta 'Caixa de Saída' (Outbox) do seu Outlook local.`n")
$Selection.TypeText("2. O Outlook deve estar aberto na hora programada para que o envio seja disparado.`n")
$Selection.TypeText("3. Não altere o e-mail na Caixa de Saída manualmente após o agendamento para evitar que ele perca a propriedade de envio automático.`n`n")

# Salvar documento na pasta Manuais
$Filename = "C:\Users\RenanSerafimPires\OneDrive - Claranet\Documentos\Manuais\Manual_Gerador_Tanium_V3.docx"
if (Test-Path $Filename) { Remove-Item $Filename -Force }
$Doc.SaveAs([ref]$Filename)
$Doc.Close()
$Word.Quit()

Write-Host "Manual gerado com sucesso em: $Filename" -ForegroundColor Green
