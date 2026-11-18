import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Ride, DriverInfo } from '../types';

interface MapComponentProps {
  pickupCoords: { lat: number; lng: number } | null;
  dropCoords: { lat: number; lng: number } | null;
  activeRide: Ride | null;
  availableDrivers: DriverInfo[];
  onMapClick?: (lat: number, lng: number) => void;
  selectionMode?: 'pickup' | 'drop' | null;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  pickupCoords,
  dropCoords,
  activeRide,
  availableDrivers,
  onMapClick,
  selectionMode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropMarkerRef = useRef<L.Marker | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const idleDriversGroupRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Centered at Demo Metropolis
    const map = L.map(mapContainerRef.current, {
      center: [37.7749, -122.4194],
      zoom: 14,
      zoomControl: false,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    idleDriversGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Map Click Listener
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (onMapClick && selectionMode) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [onMapClick, selectionMode]);

  // Update Available Idle Drivers
  useEffect(() => {
    if (!mapRef.current || !idleDriversGroupRef.current) return;
    idleDriversGroupRef.current.clearLayers();

    // If there is an active ride in progress, don't clutter the map with idle drivers
    if (activeRide && activeRide.status !== 'COMPLETED' && activeRide.status !== 'CANCELLED') {
      return;
    }

    availableDrivers.forEach((driver) => {
      if (!driver.is_online) return;

      const carIcon = L.divIcon({
        className: 'custom-driver-icon',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border-2 border-amber-400 shadow-lg text-amber-400 transform hover:scale-110 transition-transform">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([driver.current_lat, driver.current_lng], { icon: carIcon });
      marker.bindTooltip(`<b>${driver.name}</b><br/>${driver.vehicle_model} (${driver.cab_type})`, {
        direction: 'top',
        className: 'bg-slate-800 text-xs text-white px-2 py-1 rounded border border-slate-700 shadow-md',
      });
      idleDriversGroupRef.current?.addLayer(marker);
    });
  }, [availableDrivers, activeRide]);

  // Update Pickup Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (pickupCoords) {
      const pickupIcon = L.divIcon({
        className: 'pickup-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></div>
            <div class="relative w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white font-bold text-xs">
              P
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      if (!pickupMarkerRef.current) {
        pickupMarkerRef.current = L.marker([pickupCoords.lat, pickupCoords.lng], { icon: pickupIcon }).addTo(map);
      } else {
        pickupMarkerRef.current.setLatLng([pickupCoords.lat, pickupCoords.lng]);
      }
    } else if (pickupMarkerRef.current) {
      map.removeLayer(pickupMarkerRef.current);
      pickupMarkerRef.current = null;
    }
  }, [pickupCoords]);

  // Update Dropoff Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (dropCoords) {
      const dropIcon = L.divIcon({
        className: 'drop-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="relative w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white font-bold text-xs">
              D
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      if (!dropMarkerRef.current) {
        dropMarkerRef.current = L.marker([dropCoords.lat, dropCoords.lng], { icon: dropIcon }).addTo(map);
      } else {
        dropMarkerRef.current.setLatLng([dropCoords.lat, dropCoords.lng]);
      }
    } else if (dropMarkerRef.current) {
      map.removeLayer(dropMarkerRef.current);
      dropMarkerRef.current = null;
    }
  }, [dropCoords]);

  // Update Route Polyline & Bounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (pickupCoords && dropCoords) {
      const pathCoords: [number, number][] = [
        [pickupCoords.lat, pickupCoords.lng],
        // Midpoint with curve for realistic street aesthetic
        [
          (pickupCoords.lat + dropCoords.lat) / 2 + 0.001,
          (pickupCoords.lng + dropCoords.lng) / 2 - 0.001,
        ],
        [dropCoords.lat, dropCoords.lng],
      ];

      if (!routePolylineRef.current) {
        routePolylineRef.current = L.polyline(pathCoords, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8',
        }).addTo(map);
      } else {
        routePolylineRef.current.setLatLngs(pathCoords);
      }

      // Auto fit bounds
      const bounds = L.latLngBounds([
        [pickupCoords.lat, pickupCoords.lng],
        [dropCoords.lat, dropCoords.lng],
      ]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    } else if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }
  }, [pickupCoords, dropCoords]);

  // Update Live Active Ride Driver Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (
      activeRide &&
      activeRide.status !== 'CANCELLED' &&
      activeRide.status !== 'COMPLETED' &&
      activeRide.driver_lat &&
      activeRide.driver_lng
    ) {
      const liveDriverIcon = L.divIcon({
        className: 'live-driver-marker',
        html: `
          <div class="relative flex items-center justify-center car-marker-icon">
            <div class="absolute w-10 h-10 rounded-full bg-amber-400/30 animate-ping"></div>
            <div class="relative flex items-center justify-center w-9 h-9 rounded-full bg-slate-900 border-2 border-amber-400 shadow-2xl text-amber-400">
              <svg class="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
            <div class="absolute -bottom-6 bg-slate-900/90 text-[10px] font-bold text-amber-300 px-1.5 py-0.5 rounded shadow border border-slate-700 whitespace-nowrap">
              ${activeRide.driver?.name || 'Assigned Cab'}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      if (!driverMarkerRef.current) {
        driverMarkerRef.current = L.marker([activeRide.driver_lat, activeRide.driver_lng], {
          icon: liveDriverIcon,
          zIndexOffset: 1000,
        }).addTo(map);
      } else {
        driverMarkerRef.current.setLatLng([activeRide.driver_lat, activeRide.driver_lng]);
        driverMarkerRef.current.setIcon(liveDriverIcon);
      }
    } else if (driverMarkerRef.current) {
      map.removeLayer(driverMarkerRef.current);
      driverMarkerRef.current = null;
    }
  }, [activeRide]);

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Interactive Banner / Controls Overlay */}
      {selectionMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-amber-500/50 shadow-xl flex items-center space-x-2 text-sm text-amber-300 animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span>Click on the map to set <b>{selectionMode === 'pickup' ? 'Pickup' : 'Dropoff'}</b> point</span>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/85 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/60 shadow-lg text-xs flex items-center space-x-4 text-slate-300">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span>Pickup</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
          <span>Dropoff</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
          <span>Cabs</span>
        </div>
      </div>
    </div>
  );
};
