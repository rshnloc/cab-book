import asyncio
import math
from typing import Dict, Any, List, Set
from fastapi import WebSocket
import database

# Connected WebSockets for real-time live updates
active_connections: Set[WebSocket] = set()

# Running simulation tasks keyed by ride_id
running_simulations: Dict[str, asyncio.Task] = {}

async def register_ws(websocket: WebSocket):
    await websocket.accept()
    active_connections.add(websocket)

def unregister_ws(websocket: WebSocket):
    active_connections.discard(websocket)

async def broadcast_event(event_type: str, data: Any):
    payload = {
        "type": event_type,
        "data": data
    }
    dead_connections = set()
    for ws in list(active_connections):
        try:
            await ws.send_json(payload)
        except Exception:
            dead_connections.add(ws)
    for ws in dead_connections:
        active_connections.discard(ws)

def interpolate_coordinate(start_lat: float, start_lng: float, end_lat: float, end_lng: float, fraction: float):
    """Linear interpolation between two lat/lng coordinates."""
    fraction = max(0.0, min(1.0, fraction))
    lat = start_lat + (end_lat - start_lat) * fraction
    lng = start_lng + (end_lng - start_lng) * fraction
    return round(lat, 6), round(lng, 6)

async def simulate_ride_lifecycle(ride_id: str):
    """Simulates realistic ride progression from pickup to dropoff with real-time location updates."""
    try:
        # Step 1: Matching / Finding Driver (2 seconds)
        await asyncio.sleep(2.0)
        ride = database.get_ride_by_id(ride_id)
        if not ride or ride["status"] in ["CANCELLED", "COMPLETED"]:
            return

        # Assign nearest driver if not already assigned
        driver = database.find_nearest_driver(ride["cab_type"], ride["pickup_lat"], ride["pickup_lng"])
        driver_id = driver["id"] if driver else "driver_101"
        driver_start_lat = driver["current_lat"] if driver else (ride["pickup_lat"] + 0.005)
        driver_start_lng = driver["current_lng"] if driver else (ride["pickup_lng"] + 0.005)

        ride = database.update_ride(ride_id, {
            "driver_id": driver_id,
            "status": "ACCEPTED",
            "driver_lat": driver_start_lat,
            "driver_lng": driver_start_lng,
            "progress_percent": 5.0
        })
        await broadcast_event("RIDE_UPDATED", ride)

        # Step 2: Driver heading to pickup location (4 steps, 1.2s each)
        for step in range(1, 5):
            await asyncio.sleep(1.2)
            ride = database.get_ride_by_id(ride_id)
            if not ride or ride["status"] == "CANCELLED":
                return
            fraction = step / 4.0
            cur_lat, cur_lng = interpolate_coordinate(driver_start_lat, driver_start_lng, ride["pickup_lat"], ride["pickup_lng"], fraction)
            ride = database.update_ride(ride_id, {
                "driver_lat": cur_lat,
                "driver_lng": cur_lng,
                "progress_percent": round(5.0 + fraction * 15.0, 1)
            })
            database.update_driver_position(driver_id, cur_lat, cur_lng)
            await broadcast_event("RIDE_UPDATED", ride)

        # Step 3: Driver Arrived at Pickup
        await asyncio.sleep(1.0)
        ride = database.get_ride_by_id(ride_id)
        if not ride or ride["status"] == "CANCELLED":
            return
        ride = database.update_ride(ride_id, {
            "status": "ARRIVED",
            "driver_lat": ride["pickup_lat"],
            "driver_lng": ride["pickup_lng"],
            "progress_percent": 25.0
        })
        await broadcast_event("RIDE_UPDATED", ride)

        # Step 4: Rider boards, ride starts
        await asyncio.sleep(2.0)
        ride = database.get_ride_by_id(ride_id)
        if not ride or ride["status"] == "CANCELLED":
            return
        ride = database.update_ride(ride_id, {
            "status": "IN_PROGRESS",
            "progress_percent": 30.0
        })
        await broadcast_event("RIDE_UPDATED", ride)

        # Step 5: Ride in progress towards destination (10 steps)
        # We can add subtle natural route curves using slight perpendicular offset
        total_steps = 10
        p_lat, p_lng = ride["pickup_lat"], ride["pickup_lng"]
        d_lat, d_lng = ride["drop_lat"], ride["drop_lng"]

        for step in range(1, total_steps + 1):
            await asyncio.sleep(1.5)
            ride = database.get_ride_by_id(ride_id)
            if not ride or ride["status"] == "CANCELLED":
                return

            fraction = step / float(total_steps)
            base_lat, base_lng = interpolate_coordinate(p_lat, p_lng, d_lat, d_lng, fraction)
            
            # Add slight street curve simulation
            curve_offset = math.sin(fraction * math.pi) * 0.0008
            cur_lat = round(base_lat + curve_offset, 6)
            cur_lng = round(base_lng - curve_offset * 0.5, 6)

            progress = round(30.0 + fraction * 70.0, 1)
            is_final = (step == total_steps)

            ride = database.update_ride(ride_id, {
                "status": "COMPLETED" if is_final else "IN_PROGRESS",
                "driver_lat": cur_lat,
                "driver_lng": cur_lng,
                "progress_percent": 100.0 if is_final else progress
            })
            database.update_driver_position(driver_id, cur_lat, cur_lng)
            await broadcast_event("RIDE_UPDATED", ride)

    except asyncio.CancelledError:
        pass
    except Exception as e:
        print(f"Simulation error for ride {ride_id}: {e}")
    finally:
        running_simulations.pop(ride_id, None)

def start_ride_simulation(ride_id: str):
    if ride_id in running_simulations:
        running_simulations[ride_id].cancel()
    task = asyncio.create_task(simulate_ride_lifecycle(ride_id))
    running_simulations[ride_id] = task

def cancel_ride_simulation(ride_id: str):
    task = running_simulations.pop(ride_id, None)
    if task:
        task.cancel()
