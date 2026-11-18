# 🚖 MetroCab • Cab Booking Platform

A full-stack, real-time taxi and cab booking web platform built with **Python (FastAPI)** and **TypeScript (React + Vite)**.

> **Zero Credentials & Zero PII Policy Notice:**  
> This application contains **no real credentials, private keys, API keys, session secrets, or personal identifiable information (PII)**. All rider names, driver identities, phone numbers, vehicle numbers, locations, and payment methods are 100% synthetic mock/demo data. Open-source keyless mapping (Leaflet + OpenStreetMap) is utilized with no external paid mapping API tokens required.

---

## 🌟 Key Features

- **Interactive Dynamic Mapping:**
  - Keyless OpenStreetMap rendering via Leaflet.js (no Google Maps API key required).
  - Visual pickup pin (green), destination pin (red), and animated cab markers.
  - Interactive click-to-pin mode on the map or select from curated demo landmarks.
- **Dynamic Fare & ETA Engine:**
  - Real-time great-circle distance (Haversine) and urban city transit calculations.
  - Multi-tier vehicle selection:
    1. **Economy Hatchback** (Affordable, quick rides)
    2. **City Comfort Sedan** (Spacious sedans with top-rated demo drivers)
    3. **Green EV Prime** (Zero-emission electric vehicle)
    4. **Spacious SUV** (Room for 6 riders + luggage)
    5. **Executive Black** (Premium luxury chauffeur)
- **Real-Time Ride Simulation Engine (WebSockets):**
  - Instant dispatch matching to the nearest available simulated driver.
  - Smooth lifecycle transitions:
    `REQUESTED` ➔ `ACCEPTED` ➔ `ARRIVED` ➔ `IN_PROGRESS` (moving car marker along the route) ➔ `COMPLETED`.
  - Live progress percentage and ETA countdown.
- **Rider Experience:**
  - Demo payment method switcher (Demo Card ••• 4242, Demo Wallet, Cash on Trip).
  - Cancellation options during assignment and arrival stages.
  - Celebratory confetti burst upon arrival, itemized digital receipt, and 5-star rating with compliment tags.
- **Driver Mode & Portal:**
  - Toggle duty status (Online / Offline).
  - Review dispatched trips and simulate real-time driver actions.
- **Demo User Switcher:**
  - Switch easily between demo rider profiles ("Demo Rider Alex", "Demo Rider Morgan") and test drivers ("Demo Driver Jordan", "Demo Driver Sam").
- **Ride History Drawer:**
  - View all past rides, receipts, driver ratings, and route summaries.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic | High-performance async REST API & WebSockets |
| **Database** | SQLite3 (`cab_booking.db`) | Lightweight, zero-config relational store |
| **Frontend** | TypeScript, React 18, Vite | Strongly typed, reactive single page application |
| **Styling** | Tailwind CSS, Lucide Icons | Dark-mode modern urban UI |
| **Maps** | Leaflet.js, OpenStreetMap | 100% free, open-source, keyless mapping |
| **Deployment** | Standalone Local (No Docker Required) | Direct execution with Python venv & Node.js |

---

## 🚀 Quick Start (No Docker Required)

### Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm**

### 1. Launch with One Command
Run the launcher script:
```bash
./start.sh
```
This script will:
1. Initialize the Python virtual environment (`venv`) and install requirements.
2. Build the TypeScript production bundle if not already compiled.
3. Start the unified FastAPI server on `http://127.0.0.1:8000`.

Open your browser to:
**[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

### 2. Development Mode (Concurrently with Vite HMR)
If you wish to develop and edit React/TypeScript code with hot reload:
```bash
./start_dev.sh
```
- Backend runs on `http://127.0.0.1:8000`
- Frontend Vite dev server runs on `http://127.0.0.1:5173` (proxies `/api` and `/ws` to 8000)

---

## 🔒 Safety & Privacy Verification

- **No Credentials:**
  - No database passwords, external auth tokens, cloud provider keys, or private certificates exist in the code or config.
- **No PII:**
  - No real names, government IDs, phone numbers, or credit card details are used.
  - All users are prefixed with `Demo Rider` or `Demo Driver`.
  - All phone numbers follow standard fictitious formats (`+1-555-0101`).
- **No Confidential Information:**
  - Clean-room design with zero proprietary client code or enterprise dependencies.
