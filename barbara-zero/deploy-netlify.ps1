$ErrorActionPreference = "Stop"

$siteName = "illustrious-arithmetic-6ae29a"
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path

Set-Location -LiteralPath $projectPath

Write-Host "Verificando login no Netlify..."
$status = npx netlify status 2>&1 | Out-String

if ($status -match "Not logged in") {
  Write-Host "Abrindo login do Netlify. Conclua no navegador e volte para este terminal."
  npx netlify login
}

Write-Host "Publicando o jogo no Netlify: $siteName"
npx netlify deploy --prod --dir "." --no-build --site $siteName
