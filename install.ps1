$ErrorActionPreference = "Stop"

$repo = "Galavic/Clyra-CLI"
$version = $env:CLYRA_VERSION
if ([string]::IsNullOrWhiteSpace($version)) {
    $release = Invoke-RestMethod -Headers @{ "User-Agent" = "clyra-installer" } `
        -Uri "https://api.github.com/repos/$repo/releases/latest"
    $version = $release.tag_name.TrimStart("v")
}

$arch = if ([System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture -eq "Arm64") {
    "arm64"
} else {
    "x64"
}
$asset = "clyra-windows-$arch.zip"
$url = "https://github.com/$repo/releases/download/v$version/$asset"
$temp = Join-Path ([IO.Path]::GetTempPath()) ("clyra-" + [guid]::NewGuid().ToString("N"))
$archive = "$temp.zip"
$target = Join-Path $env:LOCALAPPDATA "Clyra"

try {
    New-Item -ItemType Directory -Force -Path $temp | Out-Null
    Write-Host "Descargando Clyra $version ($arch)..."
    Invoke-WebRequest -UseBasicParsing -Headers @{ "User-Agent" = "clyra-installer" } -Uri $url -OutFile $archive

    New-Item -ItemType Directory -Force -Path $target | Out-Null
    Expand-Archive -LiteralPath $archive -DestinationPath $target -Force

    $path = [Environment]::GetEnvironmentVariable("Path", "User")
    $entries = @($path -split ";" | Where-Object { $_ -and $_.Trim() -and $_ -ne $target })
    [Environment]::SetEnvironmentVariable("Path", (($entries + $target) -join ";"), "User")

    Write-Host "Clyra $version se instalo en $target"
    Write-Host "Cierra y abre la terminal para usar: clyra"
}
finally {
    Remove-Item -LiteralPath $temp -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $archive -Force -ErrorAction SilentlyContinue
}
