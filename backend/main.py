import os
import uuid
from datetime import datetime
from typing import List, Optional
from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

import database
import simulation
from models import (
    FareEstimateRequest,
    FareEstimateItem,
    RideCreateRequest,
    RideResponse,
    RideRatingRequest,
    DriverStatusUpdateRequest,
    DemoUser,
    CabType,
    PresetLocation,
    DriverInfo
)

app = FastAPI(
    title="Demo Cab Booking API",
    description="Full-stack demo cab booking platform. Strictly simulated data; no credentials or real PII.",
    version="1.0.0"
)

# Enable CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    database.init_db()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "cab-booking-backend", "time": datetime.utcnow().isoformat()}

@app.get("/api/demo-users", response_model=List[DemoUser])
def get_demo_users():
    return database.get_all_demo_users()

@app.get("/api/cab-types", response_model=List[CabType])
def get_cab_types():
    return database.get_all_cab_types()

@app.get("/api/preset-locations", response_model=List[PresetLocation])
def get_preset_locations():
    return database.get_all_preset_locations()

@app.get("/api/drivers", response_model=List[DriverInfo])
def get_drivers(online_only: bool = Query(False)):
    return database.get_all_drivers(online_only=online_only)

@app.post("/api/drivers/status")
def update_driver_status(payload: DriverStatusUpdateRequest):
    success = database.update_driver_status(payload.driver_id, payload.is_online)
    if not success:
        raise HTTPException(status_code=404, detail="Driver not found")
    driver = database.get_driver_by_id(payload.driver_id)
    return {"success": True, "driver": driver}

@app.post("/api/fare-estimate", response_model=List[FareEstimateItem])
def calculate_fare_estimate(payload: FareEstimateRequest):
    dist_km = database.haversine_distance_km(
        payload.pickup_lat, payload.pickup_lng,
        payload.drop_lat, payload.drop_lng
    )
    est_duration_mins = max(5, int(dist_km * 2.2))

    cab_types = database.get_all_cab_types()
    estimates = []

    for cab in cab_types:
        base = cab["base_fare"]
        distance_cost = round(dist_km * cab["per_km_rate"], 2)
        time_cost = round(est_duration_mins * cab["per_minute_rate"], 2)
        total_fare = round(base + distance_cost + time_cost, 2)

        estimates.append(
            FareEstimateItem(
                cab_type_id=cab["id"],
                cab_name=cab["name"],
                estimated_fare=total_fare,
                distance_km=dist_km,
                duration_mins=est_duration_mins,
                eta_mins=cab["eta_minutes"],
                base_fare=base,
                distance_fare=distance_cost
            )
        )

    return estimates

@app.post("/api/rides", response_model=RideResponse)
async def request_ride(payload: RideCreateRequest):
    ride_id = f"ride_{uuid.uuid4().hex[:8]}"
    dist_km = database.haversine_distance_km(
        payload.pickup_lat, payload.pickup_lng,
        payload.drop_lat, payload.drop_lng
    )
    est_duration_mins = max(5, int(dist_km * 2.2))

    # Calculate fare
    cab_types = {c["id"]: c for c in database.get_all_cab_types()}
    selected_cab = cab_types.get(payload.cab_type, cab_types.get("economy"))
    if not selected_cab:
        raise HTTPException(status_code=400, detail="Invalid cab type")

    base = selected_cab["base_fare"]
    fare = round(base + (dist_km * selected_cab["per_km_rate"]) + (est_duration_mins * selected_cab["per_minute_rate"]), 2)
    now_iso = datetime.utcnow().isoformat()

    ride_record = {
        "id": ride_id,
        "rider_id": payload.rider_id,
        "rider_name": payload.rider_name,
        "driver_id": None,
        "pickup_name": payload.pickup_name,
        "pickup_address": payload.pickup_address,
        "pickup_lat": payload.pickup_lat,
        "pickup_lng": payload.pickup_lng,
        "drop_name": payload.drop_name,
        "drop_address": payload.drop_address,
        "drop_lat": payload.drop_lat,
        "drop_lng": payload.drop_lng,
        "cab_type": payload.cab_type,
        "status": "REQUESTED",
        "fare": fare,
        "distance_km": dist_km,
        "duration_mins": est_duration_mins,
        "created_at": now_iso,
        "updated_at": now_iso,
        "driver_lat": payload.pickup_lat + 0.006,
        "driver_lng": payload.pickup_lng + 0.006,
        "progress_percent": 0.0,
        "payment_method": payload.payment_method,
        "rating": None,
        "feedback": None
    }

    created = database.create_ride(ride_record)
    
    # Broadcast to websocket subscribers and trigger simulation
    await simulation.broadcast_event("RIDE_CREATED", created)
    simulation.start_ride_simulation(ride_id)

    return created

@app.get("/api/rides/{ride_id}", response_model=RideResponse)
def get_ride_details(ride_id: str):
    ride = database.get_ride_by_id(ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    return ride

@app.post("/api/rides/{ride_id}/cancel")
async def cancel_ride(ride_id: str):
    ride = database.get_ride_by_id(ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    if ride["status"] in ["COMPLETED", "CANCELLED"]:
        raise HTTPException(status_code=400, detail=f"Ride cannot be cancelled from status {ride['status']}")

    simulation.cancel_ride_simulation(ride_id)
    updated = database.update_ride(ride_id, {"status": "CANCELLED"})
    await simulation.broadcast_event("RIDE_CANCELLED", updated)
    return {"success": True, "ride": updated}

@app.post("/api/rides/{ride_id}/rate")
async def rate_ride(ride_id: str, payload: RideRatingRequest):
    ride = database.get_ride_by_id(ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    updated = database.update_ride(ride_id, {
        "rating": payload.rating,
        "feedback": payload.feedback
    })
    await simulation.broadcast_event("RIDE_RATED", updated)
    return {"success": True, "ride": updated}

@app.get("/api/rides", response_model=List[RideResponse])
def list_rides(rider_id: Optional[str] = None, limit: int = 20):
    if rider_id:
        return database.get_rides_by_rider(rider_id, limit=limit)
    return database.get_all_rides(limit=limit)

@app.post("/api/rides/{ride_id}/advance-status")
async def advance_ride_status(ride_id: str, new_status: str = Query(...)):
    """Driver manual override / demonstration status advance."""
    valid_statuses = ["REQUESTED", "ACCEPTED", "ARRIVED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")

    ride = database.get_ride_by_id(ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    if new_status in ["COMPLETED", "CANCELLED"]:
        simulation.cancel_ride_simulation(ride_id)

    updated = database.update_ride(ride_id, {"status": new_status})
    await simulation.broadcast_event("RIDE_UPDATED", updated)
    return updated

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await simulation.register_ws(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        simulation.unregister_ws(websocket)
    except Exception:
        simulation.unregister_ws(websocket)

# Static Frontend SPA Serving
FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        file_candidate = FRONTEND_DIST / full_path
        if file_candidate.is_file():
            return FileResponse(file_candidate)
        return FileResponse(FRONTEND_DIST / "index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
