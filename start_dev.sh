#!/usr/bin/env bash
# Development Launcher for running FastAPI and Vite concurrently
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

trap "kill 0" EXIT

echo "🚀 Starting Backend (FastAPI on http://127.0.0.1:8000)..."
export PYTHONPATH=backend
./venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --reload &

echo "🎨 Starting Frontend (Vite Dev Server on http://localhost:5173)..."
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173 &

wait
