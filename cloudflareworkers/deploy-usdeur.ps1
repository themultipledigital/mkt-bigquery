# PowerShell deployment script for USD/EUR Exchange Rate Worker
# This script sets all required secrets and deploys the worker

Write-Host "🚀 Deploying USD/EUR Exchange Rate Worker..." -ForegroundColor Cyan
Write-Host ""

# Check if .dev.vars exists
if (-not (Test-Path ".dev.vars")) {
    Write-Host "❌ Error: .dev.vars file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Setting secrets from .dev.vars..." -ForegroundColor Yellow
Write-Host ""

# Read .dev.vars file
$devVars = Get-Content ".dev.vars" | Where-Object { $_ -match "^[^#]" -and $_ -match "=" }

# Extract values
$BQ_PROJECT_ID = ($devVars | Where-Object { $_ -match "^BQ_PROJECT_ID=" }) -replace "BQ_PROJECT_ID=", ""
$GS_CLIENT_EMAIL = ($devVars | Where-Object { $_ -match "^GS_CLIENT_EMAIL=" }) -replace "GS_CLIENT_EMAIL=", ""
$GS_PRIVATE_KEY = ($devVars | Where-Object { $_ -match "^GS_PRIVATE_KEY=" }) -replace "GS_PRIVATE_KEY=", ""
$BQ_LOCATION = ($devVars | Where-Object { $_ -match "^BQ_LOCATION=" }) -replace "BQ_LOCATION=", ""

# Set BQ_DATASET to "utils" for this worker
$BQ_DATASET = "utils"

Write-Host "Setting BQ_PROJECT_ID..." -ForegroundColor Green
$BQ_PROJECT_ID | wrangler secret put BQ_PROJECT_ID --config wrangler-usdeur.toml

Write-Host "Setting BQ_DATASET to 'utils'..." -ForegroundColor Green
$BQ_DATASET | wrangler secret put BQ_DATASET --config wrangler-usdeur.toml

Write-Host "Setting GS_CLIENT_EMAIL..." -ForegroundColor Green
$GS_CLIENT_EMAIL | wrangler secret put GS_CLIENT_EMAIL --config wrangler-usdeur.toml

Write-Host "Setting GS_PRIVATE_KEY..." -ForegroundColor Green
$GS_PRIVATE_KEY | wrangler secret put GS_PRIVATE_KEY --config wrangler-usdeur.toml

Write-Host "Setting BQ_LOCATION..." -ForegroundColor Green
$BQ_LOCATION | wrangler secret put BQ_LOCATION --config wrangler-usdeur.toml

Write-Host ""
Write-Host "✅ All secrets set!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Deploying worker..." -ForegroundColor Yellow
wrangler deploy --config wrangler-usdeur.toml

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 Test the worker:" -ForegroundColor Cyan
Write-Host "   curl https://usdeur-exchange-rate.YOUR_SUBDOMAIN.workers.dev/"
Write-Host ""
Write-Host "📊 The worker will:" -ForegroundColor Cyan
Write-Host "   - Fetch all USD/EUR rates for the current year"
Write-Host "   - Save to BigQuery: level-hope-462409-a8.utils.usdeur"
Write-Host "   - Run daily at 02:00 UTC via cron"

