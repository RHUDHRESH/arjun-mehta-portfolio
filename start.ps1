# Arjun Mehta — local dev
Set-Location $PSScriptRoot
pip install -q -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8080 --reload