from typing import List, Optional
from pydantic import BaseModel, Field

class Coordinate(BaseModel):
    lat: float
    lng: float

class PresetLocation(BaseModel):
    id: str
    name: str
    category: str
    lat: float
    lng: float
    address: str

class CabType(BaseModel):
    id: str
    name: str
    category: str
    capacity: int
    base_fare: float
    per_km_rate: float
    per_minute_rate: float
    eta_minutes: int
    description: str
    icon_type: str

class DemoUser(BaseModel):
    id: str
    name: str
    role: str  # "rider" | "driver"
    rating: float
    phone: str
    avatar_color: str

class DriverInfo(BaseModel):
    id: str
    name: str
    rating: float
    rides_count: int
    vehicle_model: str
    vehicle_color: str
    vehicle_plate: str
    cab_type: str
    phone: str
    current_lat: float
    current_lng: float
    is_online: bool = True

class FareEstimateRequest(BaseModel):
    pickup_lat: float
    pickup_lng: float
    drop_lat: float
    drop_lng: float

class FareEstimateItem(BaseModel):
    cab_type_id: str
    cab_name: str
    estimated_fare: float
    distance_km: float
    duration_mins: int
    eta_mins: int
    base_fare: float
    distance_fare: float

class RideCreateRequest(BaseModel):
    rider_id: str
    rider_name: str
    pickup_name: str
    pickup_address: str
    pickup_lat: float
    pickup_lng: float
    drop_name: str
    drop_address: str
    drop_lat: float
    drop_lng: float
    cab_type: str
    payment_method: str = "Demo Card (••• 4242)"
    notes: Optional[str] = None

class RideResponse(BaseModel):
    id: str
    rider_id: str
    rider_name: str
    driver: Optional[DriverInfo] = None
    pickup_name: str
    pickup_address: str
    pickup_lat: float
    pickup_lng: float
    drop_name: str
    drop_address: str
    drop_lat: float
    drop_lng: float
    cab_type: str
    status: str  # "REQUESTED", "ACCEPTED", "ARRIVED", "IN_PROGRESS", "COMPLETED", "CANCELLED"
    fare: float
    distance_km: float
    duration_mins: int
    created_at: str
    updated_at: str
    driver_lat: Optional[float] = None
    driver_lng: Optional[float] = None
    progress_percent: float = 0.0
    payment_method: str = "Demo Wallet"
    rating: Optional[int] = None
    feedback: Optional[str] = None

class RideRatingRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    feedback: Optional[str] = ""

class DriverStatusUpdateRequest(BaseModel):
    driver_id: str
    is_online: bool
