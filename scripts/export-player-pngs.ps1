$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$publicGame = Join-Path $root "public\game"
$tempDir = Join-Path $PSScriptRoot ".tmp-player-export"
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if (-not (Test-Path $edgePath)) {
  throw "Microsoft Edge nao encontrado em $edgePath"
}

New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

$states = @(
  @{ Name = "idle"; Svg = "player-idle.svg"; Png = "player-idle.png"; Width = 128; Height = 128 },
  @{ Name = "run"; Svg = "player-run.svg"; Png = "player-run.png"; Width = 128; Height = 128 },
  @{ Name = "jump"; Svg = "player-jump.svg"; Png = "player-jump.png"; Width = 128; Height = 128 },
  @{ Name = "relato"; Svg = "collect-relato.svg"; Png = "collect-relato.png"; Width = 96; Height = 96 },
  @{ Name = "prova"; Svg = "collect-prova.svg"; Png = "collect-prova.png"; Width = 96; Height = 96 },
  @{ Name = "memoria"; Svg = "collect-memoria.svg"; Png = "collect-memoria.png"; Width = 96; Height = 96 },
  @{ Name = "apoio"; Svg = "collect-apoio.svg"; Png = "collect-apoio.png"; Width = 96; Height = 96 },
  @{ Name = "processinho"; Svg = "obstacle-processinho.svg"; Png = "obstacle-processinho.png"; Width = 128; Height = 96 },
  @{ Name = "carimbo"; Svg = "obstacle-carimbo.svg"; Png = "obstacle-carimbo.png"; Width = 128; Height = 128 },
  @{ Name = "muralha"; Svg = "obstacle-muralha.svg"; Png = "obstacle-muralha.png"; Width = 128; Height = 144 }
)

foreach ($state in $states) {
  $svgPath = Join-Path $publicGame $state.Svg
  $pngPath = Join-Path $publicGame $state.Png
  $htmlPath = Join-Path $tempDir ("player-" + $state.Name + ".html")

  $svgUri = [System.Uri]::new($svgPath).AbsoluteUri
  $html = @"
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <style>
      html, body {
        margin: 0;
        width: $($state.Width)px;
        height: $($state.Height)px;
        overflow: hidden;
        background: transparent;
      }
      body {
        display: grid;
        place-items: center;
      }
      img {
        display: block;
        width: $($state.Width)px;
        height: $($state.Height)px;
      }
    </style>
  </head>
  <body>
    <img src="$svgUri" alt="" />
  </body>
</html>
"@

  Set-Content -LiteralPath $htmlPath -Value $html -Encoding UTF8

  & $edgePath `
    --headless `
    --disable-gpu `
    --hide-scrollbars `
    --default-background-color=00000000 `
    --window-size=$($state.Width),$($state.Height) `
    "--screenshot=$pngPath" `
    ([System.Uri]::new($htmlPath).AbsoluteUri) | Out-Null
}

Write-Host "PNG export concluido em $publicGame"
