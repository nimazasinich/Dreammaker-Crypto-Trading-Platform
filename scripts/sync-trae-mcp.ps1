param(
  [string]$ProjectPath = "c:\Users\Dreammaker\Downloads\Dreammaker-legal-agent-gitlab-main (9)\Dreammaker-legal-agent-gitlab-main"
)

$ErrorActionPreference = 'Stop'

$appData = [Environment]::GetFolderPath('ApplicationData')
$traeUserDir = Join-Path $appData 'Trae\User'
$target = Join-Path $traeUserDir 'mcp.json'
$backup = Join-Path $traeUserDir ("mcp.json.bak-" + (Get-Date -Format 'yyyyMMdd_HHmmss'))

Write-Host "Trae user dir: $traeUserDir"
if (!(Test-Path $traeUserDir)) { New-Item -Force -ItemType Directory -Path $traeUserDir | Out-Null }

# Load template and inject ProjectPath
$templatePath = Join-Path (Get-Location) 'mcp\trae.mcp.json'
if (!(Test-Path $templatePath)) { throw "Template not found: $templatePath" }
$json = Get-Content $templatePath -Raw | ConvertFrom-Json

# Update args and env to reflect current ProjectPath
foreach ($srv in $json.servers) {
  if ($srv.name -eq 'filesystem') {
    $srv.args[2] = $ProjectPath
    $srv.env.PROJECT_PATH = $ProjectPath
  }
}

$outJson = $json | ConvertTo-Json -Depth 6

if (Test-Path $target) { Copy-Item -Force $target $backup }
Set-Content -Encoding UTF8 -Path $target -Value $outJson

Write-Host "✅ Synchronized MCP config to $target"
Write-Host "Backup: $backup"
