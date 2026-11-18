#!/usr/bin/env bash
set -e

# MetroCab - Cab Booking Application Launcher
# Python Backend + TypeScript React Frontend (No Docker needed)
# Zero real credentials, Zero PII, 100% Mock Demo Environment

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "🚕 Starting MetroCab Demo Platform..."

# 1. Setup Python Virtual Environment if needed
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
    ./venv/bin/pip install --upgrade pip
    ./venv/bin/pip install -r backend/requirements.txt
fi

# 2. Build Frontend if dist doesn't exist
if [ ! -d "frontend/dist" ]; then
    echo "🎨 Building TypeScript frontend..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    npm run build
    cd "$ROOT_DIR"
fi

echo "🚀 Starting Unified Application Server on http://127.0.0.1:8000"
echo "👉 Open your browser to: http://127.0.0.1:8000"
echo "Press Ctrl+C to stop."

export PYTHONPATH=backend
exec ./venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --reload
