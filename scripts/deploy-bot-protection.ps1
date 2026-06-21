# Deploy bot protection (verify-captcha + secret)
# Requiere: SUPABASE_ACCESS_TOKEN (https://supabase.com/dashboard/account/tokens)
# Uso: $env:SUPABASE_ACCESS_TOKEN = "sbp_..."; .\scripts\deploy-bot-protection.ps1

$ErrorActionPreference = "Stop"
$ProjectRef = "msgfcxnqujgvkxrzkbsw"
$Root = Split-Path -Parent $PSScriptRoot

if (-not $env:SUPABASE_ACCESS_TOKEN) {
  Write-Error "Falta SUPABASE_ACCESS_TOKEN. Creá un token en Supabase Dashboard > Account > Access Tokens."
}

if (-not $env:HCAPTCHA_SECRET_KEY) {
  Write-Error "Falta HCAPTCHA_SECRET_KEY en el entorno (no commitear)."
}

Push-Location $Root
try {
  Write-Host "Configurando secret HCAPTCHA_SECRET_KEY..."
  npx supabase secrets set "HCAPTCHA_SECRET_KEY=$env:HCAPTCHA_SECRET_KEY" --project-ref $ProjectRef

  Write-Host "Desplegando Edge Function verify-captcha..."
  npx supabase functions deploy verify-captcha --project-ref $ProjectRef --no-verify-jwt

  Write-Host "Deploy completado. Aplicá supabase/apply_004_rate_limit.sql en SQL Editor si aún no existe la tabla."
} finally {
  Pop-Location
}
