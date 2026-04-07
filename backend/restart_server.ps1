# restart_server.ps1 - V1.1
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

if (Test-Path ".\uploads") {
    Remove-Item -Path ".\uploads" -Recurse -Force -ErrorAction SilentlyContinue
}

if (Test-Path ".\venv\Scripts\python.exe") {
    .\venv\Scripts\python.exe -m uvicorn app.main:app --reload
} else {
    python -m uvicorn app.main:app --reload
}
