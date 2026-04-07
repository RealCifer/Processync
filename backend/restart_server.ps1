# restart_server.ps1 - V1.1 (Ultimate Isolation)
# This script ensures a 100% clean environment for the Processync API

# 1. Force kill all 'Ghost' python/uvicorn processes
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✅ Ghost processes purged." -ForegroundColor Green

# 2. Delete the legacy 'uploads' folder inside backend/ (Prevent reload loops)
if (Test-Path ".\uploads") {
    Remove-Item -Path ".\uploads" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Legacy watched directory removed." -ForegroundColor Green
}

# 3. Securely start the API using the venv
Write-Host "🚀 Starting Processync API..." -ForegroundColor Cyan
if (Test-Path ".\venv\Scripts\python.exe") {
    .\venv\Scripts\python.exe -m uvicorn app.main:app --reload
} else {
    python -m uvicorn app.main:app --reload
}
