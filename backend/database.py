import sqlite3
import json
import math
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path
from seed_data import DEMO_USERS, CAB_TYPES, DEMO_DRIVERS, PRESET_LOCATIONS

DB_PATH = Path(__file__).parent / "cab_booking.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        rating REAL NOT NULL,
        phone TEXT NOT NULL,
        avatar_color TEXT NOT NULL
    )
    """)

    # Cab Types Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cab_types (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        base_fare REAL NOT NULL,
        per_km_rate REAL NOT NULL,
        per_minute_rate REAL NOT NULL,
        eta_minutes INTEGER NOT NULL,
        description TEXT NOT NULL,
        icon_type TEXT NOT NULL
    )
    """)

    # Drivers Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS drivers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        rating REAL NOT NULL,
        rides_count INTEGER NOT NULL,
        vehicle_model TEXT NOT NULL,
        vehicle_color TEXT NOT NULL,
        vehicle_plate TEXT NOT NULL,
        cab_type TEXT NOT NULL,
        phone TEXT NOT NULL,
        current_lat REAL NOT NULL,
        current_lng REAL NOT NULL,
        is_online INTEGER NOT NULL DEFAULT 1
    )
    """)

    # Preset Locations Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS preset_locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        address TEXT NOT NULL
    )
    """)

    # Rides Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rides (
        id TEXT PRIMARY KEY,
        rider_id TEXT NOT NULL,
        rider_name TEXT NOT NULL,
        driver_id TEXT,
        pickup_name TEXT NOT NULL,
        pickup_address TEXT NOT NULL,
        pickup_lat REAL NOT NULL,
        pickup_lng REAL NOT NULL,
        drop_name TEXT NOT NULL,
        drop_address TEXT NOT NULL,
        drop_lat REAL NOT NULL,
        drop_lng REAL NOT NULL,
        cab_type TEXT NOT NULL,
        status TEXT NOT NULL,
        fare REAL NOT NULL,
        distance_km REAL NOT NULL,
        duration_mins INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        driver_lat REAL,
        driver_lng REAL,
        progress_percent REAL DEFAULT 0.0,
        payment_method TEXT NOT NULL,
        rating INTEGER,
        feedback TEXT
    )
    """)

    conn.commit()

    # Seed data if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        for u in DEMO_USERS:
            cursor.execute(
                "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)",
                (u["id"], u["name"], u["role"], u["rating"], u["phone"], u["avatar_color"])
            )

    cursor.execute("SELECT COUNT(*) FROM cab_types")
    if cursor.fetchone()[0] == 0:
        for c in CAB_TYPES:
            cursor.execute(
                "INSERT INTO cab_types VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (c["id"], c["name"], c["category"], c["capacity"], c["base_fare"],
                 c["per_km_rate"], c["per_minute_rate"], c["eta_minutes"], c["description"], c["icon_type"])
            )

    cursor.execute("SELECT COUNT(*) FROM drivers")
    if cursor.fetchone()[0] == 0:
        for d in DEMO_DRIVERS:
            cursor.execute(
                "INSERT INTO drivers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (d["id"], d["name"], d["rating"], d["rides_count"], d["vehicle_model"],
                 d["vehicle_color"], d["vehicle_plate"], d["cab_type"], d["phone"],
                 d["current_lat"], d["current_lng"], 1 if d["is_online"] else 0)
            )

    cursor.execute("SELECT COUNT(*) FROM preset_locations")
    if cursor.fetchone()[0] == 0:
        for l in PRESET_LOCATIONS:
            cursor.execute(
                "INSERT INTO preset_locations VALUES (?, ?, ?, ?, ?, ?)",
                (l["id"], l["name"], l["category"], l["lat"], l["lng"], l["address"])
            )

    conn.commit()
    conn.close()

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points on the earth in km."""
    R = 6371.0  # Earth's radius in kilometers
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = (math.sin(dLat / 2) * math.sin(dLat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dLon / 2) * math.sin(dLon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    # Return at least 0.5 km minimum for local neighborhood trips
    return max(0.5, round(distance, 2))

def get_all_cab_types() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM cab_types").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_all_preset_locations() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM preset_locations").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_all_demo_users() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM users").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_all_drivers(online_only: bool = False) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    if online_only:
        rows = conn.execute("SELECT * FROM drivers WHERE is_online = 1").fetchall()
    else:
        rows = conn.execute("SELECT * FROM drivers").fetchall()
    conn.close()
    return [{**dict(r), "is_online": bool(r["is_online"])} for r in rows]

def get_driver_by_id(driver_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM drivers WHERE id = ?", (driver_id,)).fetchone()
    conn.close()
    if row:
        return {**dict(row), "is_online": bool(row["is_online"])}
    return None

def update_driver_status(driver_id: str, is_online: bool) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE drivers SET is_online = ? WHERE id = ?", (1 if is_online else 0, driver_id))
    conn.commit()
    rows_affected = cursor.rowcount
    conn.close()
    return rows_affected > 0

def update_driver_position(driver_id: str, lat: float, lng: float):
    conn = get_db_connection()
    conn.execute("UPDATE drivers SET current_lat = ?, current_lng = ? WHERE id = ?", (lat, lng, driver_id))
    conn.commit()
    conn.close()

def find_nearest_driver(cab_type: str, pickup_lat: float, pickup_lng: float) -> Optional[Dict[str, Any]]:
    """Find the nearest available online driver matching or compatible with the cab type."""
    drivers = get_all_drivers(online_only=True)
    if not drivers:
        return None

    # Filter by cab_type preference, or fallback to any driver if none match exactly
    matching_drivers = [d for d in drivers if d["cab_type"] == cab_type]
    if not matching_drivers:
        matching_drivers = drivers

    # Calculate distance for each
    sorted_drivers = sorted(
        matching_drivers,
        key=lambda d: haversine_distance_km(pickup_lat, pickup_lng, d["current_lat"], d["current_lng"])
    )
    return sorted_drivers[0] if sorted_drivers else None

def create_ride(ride_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO rides (
        id, rider_id, rider_name, driver_id,
        pickup_name, pickup_address, pickup_lat, pickup_lng,
        drop_name, drop_address, drop_lat, drop_lng,
        cab_type, status, fare, distance_km, duration_mins,
        created_at, updated_at, driver_lat, driver_lng,
        progress_percent, payment_method, rating, feedback
    ) VALUES (
        :id, :rider_id, :rider_name, :driver_id,
        :pickup_name, :pickup_address, :pickup_lat, :pickup_lng,
        :drop_name, :drop_address, :drop_lat, :drop_lng,
        :cab_type, :status, :fare, :distance_km, :duration_mins,
        :created_at, :updated_at, :driver_lat, :driver_lng,
        :progress_percent, :payment_method, :rating, :feedback
    )
    """, ride_data)
    conn.commit()
    conn.close()
    return get_ride_by_id(ride_data["id"])

def get_ride_by_id(ride_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM rides WHERE id = ?", (ride_id,)).fetchone()
    conn.close()
    if not row:
        return None
    data = dict(row)
    if data["driver_id"]:
        data["driver"] = get_driver_by_id(data["driver_id"])
    else:
        data["driver"] = None
    return data

def update_ride(ride_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    updates["updated_at"] = datetime.utcnow().isoformat()
    fields = [f"{k} = :{k}" for k in updates.keys()]
    query = f"UPDATE rides SET {', '.join(fields)} WHERE id = :ride_id"
    updates["ride_id"] = ride_id
    conn.execute(query, updates)
    conn.commit()
    conn.close()
    return get_ride_by_id(ride_id)

def get_rides_by_rider(rider_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    rows = conn.execute(
        "SELECT * FROM rides WHERE rider_id = ? ORDER BY created_at DESC LIMIT ?",
        (rider_id, limit)
    ).fetchall()
    conn.close()
    results = []
    for r in rows:
        d = dict(r)
        if d["driver_id"]:
            d["driver"] = get_driver_by_id(d["driver_id"])
        else:
            d["driver"] = None
        results.append(d)
    return results

def get_all_rides(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM rides ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
    conn.close()
    results = []
    for r in rows:
        d = dict(r)
        if d["driver_id"]:
            d["driver"] = get_driver_by_id(d["driver_id"])
        else:
            d["driver"] = None
        results.append(d)
    return results
