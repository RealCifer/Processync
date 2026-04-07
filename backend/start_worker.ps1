# start_worker.ps1
if (Test-Path ".\venv\Scripts\python.exe") {
    .\venv\Scripts\python.exe -m celery -A app.workers.celery_app worker --loglevel=info -P solo
} else {
    celery -A app.workers.celery_app worker --loglevel=info -P solo
}
