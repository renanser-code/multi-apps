# PowerShell Script to Resize Application Icons and Splash Screens using .NET
# Carinho Doces da Fabi - Native Asset Builder

Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param (
        [string]$SourcePath,
        [string]$TargetPath,
        [int]$Width,
        [int]$Height
    )
    Write-Host "Processando: $TargetPath ($Width x $Height)"
    
    # Ensure source exists
    if (!(Test-Path -Path $SourcePath)) {
        Write-Error "Arquivo de origem nao encontrado: $SourcePath"
        return
    }

    $srcImage = [System.Drawing.Image]::FromFile($SourcePath)
    $destImage = New-Object System.Drawing.Bitmap($Width, $Height)
    $graphics = [System.Drawing.Graphics]::FromImage($destImage)
    
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $graphics.DrawImage($srcImage, 0, 0, $Width, $Height)
    
    # Ensure target directory exists
    $dir = Split-Path -Parent $TargetPath
    if (!(Test-Path -Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    
    # Release previous file handle if it exists by deleting first
    if (Test-Path -Path $TargetPath) {
        Remove-Item -Path $TargetPath -Force
    }

    $destImage.Save($TargetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $destImage.Dispose()
    $srcImage.Dispose()
}

$iconPath = "C:\Users\Renan Pires\OneDrive\Aplicativos\Carinho doces da Fabi\www\assets\icon.png"
$splashPath = "C:\Users\Renan Pires\OneDrive\Aplicativos\Carinho doces da Fabi\www\assets\splash.png"
$resPath = "C:\Users\Renan Pires\OneDrive\Aplicativos\Carinho doces da Fabi\android\app\src\main\res"

Write-Host "====== INICIANDO REDIMENSIONAMENTO DE ATIVOS NATIVOS ======"

# Mipmaps (Icone Redondo e Quadrado)
Resize-Image $iconPath "$resPath\mipmap-mdpi\ic_launcher.png" 48 48
Resize-Image $iconPath "$resPath\mipmap-hdpi\ic_launcher.png" 72 72
Resize-Image $iconPath "$resPath\mipmap-xhdpi\ic_launcher.png" 96 96
Resize-Image $iconPath "$resPath\mipmap-xxhdpi\ic_launcher.png" 144 144
Resize-Image $iconPath "$resPath\mipmap-xxxhdpi\ic_launcher.png" 192 192

Resize-Image $iconPath "$resPath\mipmap-mdpi\ic_launcher_round.png" 48 48
Resize-Image $iconPath "$resPath\mipmap-hdpi\ic_launcher_round.png" 72 72
Resize-Image $iconPath "$resPath\mipmap-xhdpi\ic_launcher_round.png" 96 96
Resize-Image $iconPath "$resPath\mipmap-xxhdpi\ic_launcher_round.png" 144 144
Resize-Image $iconPath "$resPath\mipmap-xxxhdpi\ic_launcher_round.png" 192 192

# Drawables (Splash Screens)
Resize-Image $splashPath "$resPath\drawable\splash.png" 512 512

# Portrait Splashes
Resize-Image $splashPath "$resPath\drawable-port-mdpi\splash.png" 320 480
Resize-Image $splashPath "$resPath\drawable-port-hdpi\splash.png" 480 800
Resize-Image $splashPath "$resPath\drawable-port-xhdpi\splash.png" 720 1280
Resize-Image $splashPath "$resPath\drawable-port-xxhdpi\splash.png" 960 1600
Resize-Image $splashPath "$resPath\drawable-port-xxxhdpi\splash.png" 1280 1920

# Landscape Splashes
Resize-Image $splashPath "$resPath\drawable-land-mdpi\splash.png" 480 320
Resize-Image $splashPath "$resPath\drawable-land-hdpi\splash.png" 800 480
Resize-Image $splashPath "$resPath\drawable-land-xhdpi\splash.png" 1280 720
Resize-Image $splashPath "$resPath\drawable-land-xxhdpi\splash.png" 1600 960
Resize-Image $splashPath "$resPath\drawable-land-xxxhdpi\splash.png" 1920 1280

Write-Host "====== ATIVOS NATIVOS ATUALIZADOS COM SUCESSO ======"
