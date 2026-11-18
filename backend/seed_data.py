"""
Safe Demo Seed Data for Cab Booking Application.
- Strictly demo & synthetic mock data.
- Zero credentials or API keys.
- Zero personal identifying information (PII).
- Demo coordinates centered around a scenic metropolitan area (Demo Metropolis).
"""

DEMO_USERS = [
    {
        "id": "rider_demo_1",
        "name": "Demo Rider Alex",
        "role": "rider",
        "rating": 4.95,
        "phone": "+1-555-0101",
        "avatar_color": "#3b82f6"
    },
    {
        "id": "rider_demo_2",
        "name": "Demo Rider Morgan",
        "role": "rider",
        "rating": 4.88,
        "phone": "+1-555-0102",
        "avatar_color": "#10b981"
    },
    {
        "id": "driver_demo_1",
        "name": "Demo Driver Jordan",
        "role": "driver",
        "rating": 4.92,
        "phone": "+1-555-0151",
        "avatar_color": "#f59e0b"
    },
    {
        "id": "driver_demo_2",
        "name": "Demo Driver Sam",
        "role": "driver",
        "rating": 4.89,
        "phone": "+1-555-0152",
        "avatar_color": "#8b5cf6"
    }
]

CAB_TYPES = [
    {
        "id": "economy",
        "name": "Economy Hatchback",
        "category": "Standard",
        "capacity": 4,
        "base_fare": 4.50,
        "per_km_rate": 1.20,
        "per_minute_rate": 0.25,
        "eta_minutes": 3,
        "description": "Affordable, quick rides for daily commutes",
        "icon_type": "car"
    },
    {
        "id": "comfort",
        "name": "City Comfort Sedan",
        "category": "Comfort",
        "capacity": 4,
        "base_fare": 6.50,
        "per_km_rate": 1.65,
        "per_minute_rate": 0.35,
        "eta_minutes": 4,
        "description": "Spacious sedans with top-rated demo drivers",
        "icon_type": "car-front"
    },
    {
        "id": "electric",
        "name": "Green EV Prime",
        "category": "Eco-Friendly",
        "capacity": 4,
        "base_fare": 7.00,
        "per_km_rate": 1.50,
        "per_minute_rate": 0.30,
        "eta_minutes": 5,
        "description": "Zero-emission electric vehicle ride",
        "icon_type": "zap"
    },
    {
        "id": "suv",
        "name": "Spacious SUV",
        "category": "Extra Seats",
        "capacity": 6,
        "base_fare": 9.50,
        "per_km_rate": 2.20,
        "per_minute_rate": 0.45,
        "eta_minutes": 6,
        "description": "Room for 6 riders plus luggage space",
        "icon_type": "truck"
    },
    {
        "id": "luxury",
        "name": "Executive Black",
        "category": "Premium",
        "capacity": 4,
        "base_fare": 14.00,
        "per_km_rate": 3.10,
        "per_minute_rate": 0.65,
        "eta_minutes": 7,
        "description": "Premium luxury vehicle with seasoned chauffeur",
        "icon_type": "shield-check"
    }
]

DEMO_DRIVERS = [
    {
        "id": "driver_101",
        "name": "Demo Driver Jordan",
        "rating": 4.94,
        "rides_count": 842,
        "vehicle_model": "EcoGlider Sedan",
        "vehicle_color": "Sapphire Blue",
        "vehicle_plate": "TEST-CAB-101",
        "cab_type": "comfort",
        "phone": "+1-555-0151",
        "current_lat": 37.7790,
        "current_lng": -122.4180,
        "is_online": True
    },
    {
        "id": "driver_102",
        "name": "Demo Driver Sam",
        "rating": 4.91,
        "rides_count": 1210,
        "vehicle_model": "VoltPulse EV",
        "vehicle_color": "Pearl White",
        "vehicle_plate": "DEMO-EV-202",
        "cab_type": "electric",
        "phone": "+1-555-0152",
        "current_lat": 37.7712,
        "current_lng": -122.4245,
        "is_online": True
    },
    {
        "id": "driver_103",
        "name": "Demo Driver Casey",
        "rating": 4.87,
        "rides_count": 654,
        "vehicle_model": "SwiftPulse Hatchback",
        "vehicle_color": "Silver Grey",
        "vehicle_plate": "SAMPLE-CAB-303",
        "cab_type": "economy",
        "phone": "+1-555-0153",
        "current_lat": 37.7834,
        "current_lng": -122.4110,
        "is_online": True
    },
    {
        "id": "driver_104",
        "name": "Demo Driver Riley",
        "rating": 4.97,
        "rides_count": 1820,
        "vehicle_model": "Terrano Grande SUV",
        "vehicle_color": "Midnight Black",
        "vehicle_plate": "TEST-SUV-404",
        "cab_type": "suv",
        "phone": "+1-555-0154",
        "current_lat": 37.7680,
        "current_lng": -122.4130,
        "is_online": True
    },
    {
        "id": "driver_105",
        "name": "Demo Driver Avery",
        "rating": 4.99,
        "rides_count": 2105,
        "vehicle_model": "Apex Sovereign Luxury",
        "vehicle_color": "Obsidian Black",
        "vehicle_plate": "DEMO-LUX-505",
        "cab_type": "luxury",
        "phone": "+1-555-0155",
        "current_lat": 37.7870,
        "current_lng": -122.4060,
        "is_online": True
    }
]

PRESET_LOCATIONS = [
    {
        "id": "loc_1",
        "name": "Metro Central Station",
        "category": "Transit",
        "lat": 37.7749,
        "lng": -122.4194,
        "address": "100 Central Transit Way, Demo Metropolis"
    },
    {
        "id": "loc_2",
        "name": "Innovation Tech Park",
        "category": "Business",
        "lat": 37.7892,
        "lng": -122.4014,
        "address": "500 Silicon Promenade, Demo Metropolis"
    },
    {
        "id": "loc_3",
        "name": "Green Valley Botanical Gardens",
        "category": "Leisure",
        "lat": 37.7695,
        "lng": -122.4468,
        "address": "1200 Garden Loop, Demo Metropolis"
    },
    {
        "id": "loc_4",
        "name": "Civic Center & City Hall",
        "category": "Public",
        "lat": 37.7794,
        "lng": -122.4187,
        "address": "1 Dr Carlton B Goodlett Pl, Demo Metropolis"
    },
    {
        "id": "loc_5",
        "name": "Bayfront Marina Promenade",
        "category": "Sightseeing",
        "lat": 37.8050,
        "lng": -122.4350,
        "address": "88 Marina Boulevard, Demo Metropolis"
    },
    {
        "id": "loc_6",
        "name": "Grand Metropolis Airport Terminal 1",
        "category": "Airport",
        "lat": 37.6213,
        "lng": -122.3790,
        "address": "Terminal 1 Departures, Demo Metropolis"
    },
    {
        "id": "loc_7",
        "name": "Metropolis Arts & Concert Hall",
        "category": "Entertainment",
        "lat": 37.7780,
        "lng": -122.4208,
        "address": "301 Van Ness Ave, Demo Metropolis"
    },
    {
        "id": "loc_8",
        "name": "Westgate Shopping Plaza",
        "category": "Shopping",
        "lat": 37.7650,
        "lng": -122.4210,
        "address": "850 Market Galleria, Demo Metropolis"
    }
]
