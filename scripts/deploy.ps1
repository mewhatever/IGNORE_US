# QueueStorm — one-shot production deploy helper (Windows PowerShell)
# Prerequisites: vercel login, Neon DATABASE_URL, backend/.env filled in

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "==> QueueStorm deploy helper" -ForegroundColor Cyan

# Load secrets from backend/.env (never committed)
$envFile = Join-Path $Root "backend\.env"
if (-not (Test-Path $envFile)) {
  Write-Error "Missing backend\.env — copy from .env.example and fill in values."
}

Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') {
    $name = $matches[1].Trim()
    $value = $matches[2].Trim()
    Set-Item -Path "env:$name" -Value $value
  }
}

if (-not $env:DATABASE_URL) { Write-Error "DATABASE_URL missing in backend\.env" }
if (-not $env:JWT_SECRET -or $env:JWT_SECRET.Length -lt 32) {
  Write-Error "JWT_SECRET must be at least 32 characters for production."
}

Write-Host "==> Initializing remote database schema..." -ForegroundColor Cyan
npm run db:init
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "==> Checking Vercel auth..." -ForegroundColor Cyan
vercel whoami 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Run: vercel login" -ForegroundColor Yellow
  exit 1
}

# Deploy first to learn the production URL (or use existing link)
Write-Host "==> Deploying to Vercel (production)..." -ForegroundColor Cyan
$deployOutput = vercel deploy --prod --yes 2>&1 | Out-String
Write-Host $deployOutput

$url = ($deployOutput | Select-String -Pattern 'https://[\w.-]+\.vercel\.app' -AllMatches).Matches[-1].Value
if (-not $url) {
  Write-Warning "Could not detect deploy URL. Set CORS_ORIGIN manually in Vercel dashboard."
  $url = Read-Host "Paste your production URL (e.g. https://queuestorm.vercel.app)"
}

$cors = $url.TrimEnd('/')
Write-Host "==> Setting Vercel env vars (production)..." -ForegroundColor Cyan

$vars = @{
  NODE_ENV            = "production"
  DATABASE_URL        = $env:DATABASE_URL
  JWT_SECRET          = $env:JWT_SECRET
  JWT_EXPIRES_IN      = if ($env:JWT_EXPIRES_IN) { $env:JWT_EXPIRES_IN } else { "8h" }
  CORS_ORIGIN         = $cors
  DEMO_AGENT_EMAIL    = if ($env:DEMO_AGENT_EMAIL) { $env:DEMO_AGENT_EMAIL } else { "agent@queuestorm.demo" }
  DEMO_AGENT_PASSWORD = $env:DEMO_AGENT_PASSWORD
  CLASSIFIER_MODE     = if ($env:CLASSIFIER_MODE) { $env:CLASSIFIER_MODE } else { "hybrid" }
  LLM_PROVIDER        = if ($env:LLM_PROVIDER) { $env:LLM_PROVIDER } else { "groq" }
  LLM_TIMEOUT_MS      = if ($env:LLM_TIMEOUT_MS) { $env:LLM_TIMEOUT_MS } else { "15000" }
}

foreach ($key in @("GROQ_API_KEY", "DEEPSEEK_API_KEY", "GEMINI_API_KEY", "LLM_MODEL")) {
  if ((Get-Item "env:$key" -ErrorAction SilentlyContinue).Value) {
    $vars[$key] = (Get-Item "env:$key").Value
  }
}

foreach ($entry in $vars.GetEnumerator()) {
  Write-Host "  $($entry.Key)"
  $entry.Value | vercel env add $entry.Key production --force 2>&1 | Out-Null
}

Write-Host "==> Redeploying with env vars..." -ForegroundColor Cyan
vercel deploy --prod --yes

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Write-Host "  App:    $cors"
Write-Host "  Health: $cors/health"
Write-Host "  API:    $cors/sort-ticket"
Write-Host ""
Write-Host "Verify: curl $cors/health"
