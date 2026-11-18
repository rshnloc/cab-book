import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { MapComponent } from './components/MapComponent';
import { RideBookingCard } from './components/RideBookingCard';
import { ActiveRideCard } from './components/ActiveRideCard';
import { RideCompletedModal } from './components/RideCompletedModal';
import { RideHistoryDrawer } from './components/RideHistoryDrawer';
import { DriverPortalModal } from './components/DriverPortalModal';
import {
  DemoUser,
  PresetLocation,
  CabType,
  DriverInfo,
  FareEstimateItem,
  Ride,
} from './types';

export const App: React.FC = () => {
  // App Data States
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);
  const [currentUser, setCurrentUser] = useState<DemoUser>({
    id: 'rider_demo_1',
    name: 'Demo Rider Alex',
    role: 'rider',
    rating: 4.95,
    phone: '+1-555-0101',
    avatar_color: '#3b82f6',
  });
  const [presetLocations, setPresetLocations] = useState<PresetLocation[]>([]);
  const [cabTypes, setCabTypes] = useState<CabType[]>([]);
  const [drivers, setDrivers] = useState<DriverInfo[]>([]);
  const [fareEstimates, setFareEstimates] = useState<FareEstimateItem[]>([]);
  const [rideHistory, setRideHistory] = useState<Ride[]>([]);

  // Booking Flow States
  const [pickup, setPickup] = useState<{
    name: string;
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  const [drop, setDrop] = useState<{
    name: string;
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  const [selectedCabType, setSelectedCabType] = useState<string>('economy');
  const [paymentMethod, setPaymentMethod] = useState<string>('Demo Card (••• 4242)');
  const [selectionMode, setSelectionMode] = useState<'pickup' | 'drop' | null>(null);
  const [isBookingLoading, setIsBookingLoading] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Active Ride & Modals
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [completedRideForModal, setCompletedRideForModal] = useState<Ride | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isDriverPortalOpen, setIsDriverPortalOpen] = useState<boolean>(false);

  // WebSocket
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  // 1. Initial Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, cabTypesRes, locationsRes, driversRes] = await Promise.all([
          fetch('/api/demo-users'),
          fetch('/api/cab-types'),
          fetch('/api/preset-locations'),
          fetch('/api/drivers'),
        ]);

        if (usersRes.ok) {
          const users: DemoUser[] = await usersRes.json();
          setDemoUsers(users);
          const defaultRider = users.find((u) => u.role === 'rider') || users[0];
          if (defaultRider) setCurrentUser(defaultRider);
        }

        if (cabTypesRes.ok) {
          const types: CabType[] = await cabTypesRes.json();
          setCabTypes(types);
          if (types.length > 0) setSelectedCabType(types[0].id);
        }

        if (locationsRes.ok) {
          const locs: PresetLocation[] = await locationsRes.json();
          setPresetLocations(locs);
          if (locs.length >= 2) {
            setPickup({
              name: locs[0].name,
              address: locs[0].address,
              lat: locs[0].lat,
              lng: locs[0].lng,
            });
            setDrop({
              name: locs[1].name,
              address: locs[1].address,
              lat: locs[1].lat,
              lng: locs[1].lng,
            });
          }
        }

        if (driversRes.ok) {
          const drvs: DriverInfo[] = await driversRes.json();
          setDrivers(drvs);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };

    fetchData();
  }, []);

  // 2. Fetch User Ride History
  const fetchRideHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/rides?rider_id=${currentUser.id}`);
      if (res.ok) {
        const rides: Ride[] = await res.json();
        setRideHistory(rides);
      }
    } catch (err) {
      console.error('Error fetching ride history:', err);
    }
  }, [currentUser.id]);

  useEffect(() => {
    fetchRideHistory();
  }, [fetchRideHistory]);

  // 3. Calculate Fare Estimates whenever pickup or drop coordinates change
  useEffect(() => {
    if (!pickup || !drop) return;

    const calculateFares = async () => {
      try {
        const res = await fetch('/api/fare-estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pickup_lat: pickup.lat,
            pickup_lng: pickup.lng,
            drop_lat: drop.lat,
            drop_lng: drop.lng,
          }),
        });

        if (res.ok) {
          const estimates: FareEstimateItem[] = await res.json();
          setFareEstimates(estimates);
        }
      } catch (err) {
        console.error('Fare estimate error:', err);
      }
    };

    calculateFares();
  }, [pickup, drop]);

  // 4. WebSocket setup
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    let socket: WebSocket;
    let pingInterval: any;

    const connectWs = () => {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setWsConnected(true);
        pingInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send('ping');
          }
        }, 15000);
      };

      socket.onmessage = (event) => {
        try {
          if (event.data === 'pong') return;
          const message = JSON.parse(event.data);

          if (message.type === 'RIDE_UPDATED' || message.type === 'RIDE_CREATED') {
            const updatedRide: Ride = message.data;
            setActiveRide((prev) => {
              if (prev && prev.id === updatedRide.id) {
                // Check if newly completed
                if (updatedRide.status === 'COMPLETED' && prev.status !== 'COMPLETED') {
                  setCompletedRideForModal(updatedRide);
                }
                return updatedRide;
              } else if (!prev && updatedRide.rider_id === currentUser.id && updatedRide.status !== 'COMPLETED' && updatedRide.status !== 'CANCELLED') {
                return updatedRide;
              }
              return prev;
            });
            fetchRideHistory();
          } else if (message.type === 'RIDE_CANCELLED') {
            const cancelledRide: Ride = message.data;
            setActiveRide((prev) => (prev && prev.id === cancelledRide.id ? null : prev));
            fetchRideHistory();
          } else if (message.type === 'RIDE_RATED') {
            fetchRideHistory();
          }
        } catch (e) {
          // Ignore parse errors on raw messages
        }
      };

      socket.onclose = () => {
        setWsConnected(false);
        clearInterval(pingInterval);
        // Retry connection after 3 seconds
        setTimeout(connectWs, 3000);
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connectWs();

    return () => {
      clearInterval(pingInterval);
      if (wsRef.current) wsRef.current.close();
    };
  }, [currentUser.id, fetchRideHistory]);

  // Handle Location Selection
  const handleSelectPickup = (loc: PresetLocation) => {
    setPickup({
      name: loc.name,
      address: loc.address,
      lat: loc.lat,
      lng: loc.lng,
    });
  };

  const handleSelectDrop = (loc: PresetLocation) => {
    setDrop({
      name: loc.name,
      address: loc.address,
      lat: loc.lat,
      lng: loc.lng,
    });
  };

  const handleSwapLocations = () => {
    const temp = pickup;
    setPickup(drop);
    setDrop(temp);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (selectionMode === 'pickup') {
      setPickup({
        name: `Custom Pin (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
        address: 'Selected on map',
        lat,
        lng,
      });
      setSelectionMode(null);
    } else if (selectionMode === 'drop') {
      setDrop({
        name: `Custom Destination (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
        address: 'Selected on map',
        lat,
        lng,
      });
      setSelectionMode(null);
    }
  };

  // Request Ride
  const handleRequestRide = async () => {
    if (!pickup || !drop) return;
    setIsBookingLoading(true);

    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rider_id: currentUser.id,
          rider_name: currentUser.name,
          pickup_name: pickup.name,
          pickup_address: pickup.address,
          pickup_lat: pickup.lat,
          pickup_lng: pickup.lng,
          drop_name: drop.name,
          drop_address: drop.address,
          drop_lat: drop.lat,
          drop_lng: drop.lng,
          cab_type: selectedCabType,
          payment_method: paymentMethod,
        }),
      });

      if (res.ok) {
        const createdRide: Ride = await res.json();
        setActiveRide(createdRide);
        fetchRideHistory();
      } else {
        alert('Could not book cab. Please try again.');
      }
    } catch (err) {
      console.error('Ride booking error:', err);
    } finally {
      setIsBookingLoading(false);
    }
  };

  // Cancel Ride
  const handleCancelRide = async () => {
    if (!activeRide) return;
    setIsCancelling(true);

    try {
      const res = await fetch(`/api/rides/${activeRide.id}/cancel`, {
        method: 'POST',
      });
      if (res.ok) {
        setActiveRide(null);
        fetchRideHistory();
      }
    } catch (err) {
      console.error('Cancel error:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  // Submit Rating
  const handleSubmitRating = async (rating: number, feedback: string) => {
    if (!completedRideForModal) return;

    try {
      await fetch(`/api/rides/${completedRideForModal.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback }),
      });
    } catch (err) {
      console.error('Rating submission error:', err);
    } finally {
      setCompletedRideForModal(null);
      setActiveRide(null);
      fetchRideHistory();
    }
  };

  // Advance Driver Status (manual driver portal testing)
  const handleAdvanceStatus = async (rideId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/rides/${rideId}/advance-status?new_status=${nextStatus}`, {
        method: 'POST',
      });
      if (res.ok) {
        const updated: Ride = await res.json();
        setActiveRide(updated);
        if (nextStatus === 'COMPLETED') {
          setCompletedRideForModal(updated);
        }
      }
    } catch (err) {
      console.error('Status advance error:', err);
    }
  };

  // Driver toggle online status
  const handleToggleDriverOnline = async (isOnline: boolean) => {
    const demoDriver = drivers[0];
    if (!demoDriver) return;

    try {
      const res = await fetch('/api/drivers/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_id: demoDriver.id,
          is_online: isOnline,
        }),
      });
      if (res.ok) {
        setDrivers((prev) =>
          prev.map((d) => (d.id === demoDriver.id ? { ...d, is_online: isOnline } : d))
        );
      }
    } catch (err) {
      console.error('Driver online toggle error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        demoUsers={demoUsers}
        wsConnected={wsConnected}
        onSelectUser={setCurrentUser}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenDriverPortal={() => setIsDriverPortalOpen(true)}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Booking Card or Live Ride Card */}
        <div className="lg:col-span-5 w-full order-2 lg:order-1">
          {activeRide && activeRide.status !== 'COMPLETED' && activeRide.status !== 'CANCELLED' ? (
            <ActiveRideCard
              ride={activeRide}
              onCancelRide={handleCancelRide}
              isCancelling={isCancelling}
            />
          ) : (
            <RideBookingCard
              presetLocations={presetLocations}
              cabTypes={cabTypes}
              fareEstimates={fareEstimates}
              pickup={pickup}
              drop={drop}
              selectedCabType={selectedCabType}
              paymentMethod={paymentMethod}
              selectionMode={selectionMode}
              isLoading={isBookingLoading}
              onSelectPickup={handleSelectPickup}
              onSelectDrop={handleSelectDrop}
              onToggleSelectionMode={(mode) =>
                setSelectionMode((prev) => (prev === mode ? null : mode))
              }
              onSwapLocations={handleSwapLocations}
              onSelectCabType={setSelectedCabType}
              onSelectPaymentMethod={setPaymentMethod}
              onRequestRide={handleRequestRide}
            />
          )}

          {/* Safe Environment Banner */}
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center space-x-1.5 font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>100% Mock & Zero-PII Demonstration Mode</span>
            </div>
            <p>
              All drivers, riders, locations, license plates, and payments are strictly simulated.
              No real API keys, credentials, or private user data are used.
            </p>
          </div>
        </div>

        {/* Right Side: Interactive Live Map */}
        <div className="lg:col-span-7 w-full h-[520px] lg:h-[680px] order-1 lg:order-2">
          <MapComponent
            pickupCoords={pickup ? { lat: pickup.lat, lng: pickup.lng } : null}
            dropCoords={drop ? { lat: drop.lat, lng: drop.lng } : null}
            activeRide={activeRide}
            availableDrivers={drivers}
            onMapClick={handleMapClick}
            selectionMode={selectionMode}
          />
        </div>
      </main>

      {/* Completed Trip Celebration & Rating Modal */}
      {completedRideForModal && (
        <RideCompletedModal
          ride={completedRideForModal}
          onSubmitRating={handleSubmitRating}
          onClose={() => {
            setCompletedRideForModal(null);
            setActiveRide(null);
          }}
        />
      )}

      {/* Ride History Slide-out */}
      <RideHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        rides={rideHistory}
      />

      {/* Driver Portal Modal */}
      {drivers.length > 0 && (
        <DriverPortalModal
          isOpen={isDriverPortalOpen}
          onClose={() => setIsDriverPortalOpen(false)}
          driver={drivers[0]}
          activeRide={activeRide}
          onToggleOnline={handleToggleDriverOnline}
          onAdvanceStatus={handleAdvanceStatus}
        />
      )}
    </div>
  );
};

export default App;
