# start_worker.ps1
# This script starts the Celery worker using the 'solo' pool for Windows stability.

Write-Host "🚀 Starting Processync Worker (Solo Mode)..." -ForegroundColor Cyan
if (Test-Path ".\venv\Scripts\python.exe") {
    .\venv\Scripts\python.exe -m celery -A app.workers.celery_app worker --loglevel=info -P solo
} else {
    celery -A app.workers.celery_app worker --loglevel=info -P solo
}
