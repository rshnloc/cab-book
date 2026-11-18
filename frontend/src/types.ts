export interface Coordinate {
  lat: number;
  lng: number;
}

export interface PresetLocation {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address: string;
}

export interface CabType {
  id: string;
  name: string;
  category: string;
  capacity: number;
  base_fare: number;
  per_km_rate: number;
  per_minute_rate: number;
  eta_minutes: number;
  description: string;
  icon_type: string;
}

export interface DemoUser {
  id: string;
  name: string;
  role: 'rider' | 'driver';
  rating: number;
  phone: string;
  avatar_color: string;
}

export interface DriverInfo {
  id: string;
  name: string;
  rating: number;
  rides_count: number;
  vehicle_model: string;
  vehicle_color: string;
  vehicle_plate: string;
  cab_type: string;
  phone: string;
  current_lat: number;
  current_lng: number;
  is_online: boolean;
}

export interface FareEstimateItem {
  cab_type_id: string;
  cab_name: string;
  estimated_fare: number;
  distance_km: number;
  duration_mins: number;
  eta_mins: number;
  base_fare: number;
  distance_fare: number;
}

export type RideStatus = 'REQUESTED' | 'ACCEPTED' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Ride {
  id: string;
  rider_id: string;
  rider_name: string;
  driver?: DriverInfo | null;
  pickup_name: string;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  drop_name: string;
  drop_address: string;
  drop_lat: number;
  drop_lng: number;
  cab_type: string;
  status: RideStatus;
  fare: number;
  distance_km: number;
  duration_mins: number;
  created_at: string;
  updated_at: string;
  driver_lat?: number | null;
  driver_lng?: number | null;
  progress_percent: number;
  payment_method: string;
  rating?: number | null;
  feedback?: string | null;
}
