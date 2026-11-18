import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ArrowUpDown,
  Car,
  Zap,
  Truck,
  ShieldCheck,
  CreditCard,
  Clock,
  Users,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { PresetLocation, CabType, FareEstimateItem } from '../types';

interface RideBookingCardProps {
  presetLocations: PresetLocation[];
  cabTypes: CabType[];
  fareEstimates: FareEstimateItem[];
  pickup: { name: string; address: string; lat: number; lng: number } | null;
  drop: { name: string; address: string; lat: number; lng: number } | null;
  selectedCabType: string;
  paymentMethod: string;
  selectionMode: 'pickup' | 'drop' | null;
  isLoading: boolean;
  onSelectPickup: (loc: PresetLocation) => void;
  onSelectDrop: (loc: PresetLocation) => void;
  onToggleSelectionMode: (mode: 'pickup' | 'drop') => void;
  onSwapLocations: () => void;
  onSelectCabType: (cabTypeId: string) => void;
  onSelectPaymentMethod: (method: string) => void;
  onRequestRide: () => void;
}

export const RideBookingCard: React.FC<RideBookingCardProps> = ({
  presetLocations,
  cabTypes,
  fareEstimates,
  pickup,
  drop,
  selectedCabType,
  paymentMethod,
  selectionMode,
  isLoading,
  onSelectPickup,
  onSelectDrop,
  onToggleSelectionMode,
  onSwapLocations,
  onSelectCabType,
  onSelectPaymentMethod,
  onRequestRide,
}) => {
  const [showPickupPresets, setShowPickupPresets] = useState(false);
  const [showDropPresets, setShowDropPresets] = useState(false);

  const getCabIcon = (iconType: string) => {
    switch (iconType) {
      case 'zap':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'truck':
        return <Truck className="w-5 h-5 text-blue-400" />;
      case 'shield-check':
        return <ShieldCheck className="w-5 h-5 text-amber-400" />;
      default:
        return <Car className="w-5 h-5 text-slate-300" />;
    }
  };

  const getEstimate = (cabTypeId: string) => {
    return fareEstimates.find((f) => f.cab_type_id === cabTypeId);
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Book a Ride
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Instant Match
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Quick & transparent city transfers</p>
        </div>
        <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/80 text-amber-400">
          <Sparkles className="w-5 h-5" />
        </div>
      </div>

      {/* Location Input Section */}
      <div className="relative bg-slate-950/60 rounded-2xl p-4 border border-slate-800 space-y-3">
        {/* Pickup Input */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Pickup Location
            </span>
            <button
              onClick={() => onToggleSelectionMode('pickup')}
              className={`text-xs px-2 py-0.5 rounded transition ${
                selectionMode === 'pickup'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-amber-400 hover:text-amber-300 bg-amber-400/10'
              }`}
            >
              {selectionMode === 'pickup' ? 'Click on map...' : '📍 Pin on Map'}
            </button>
          </div>

          <div
            onClick={() => setShowPickupPresets(!showPickupPresets)}
            className="w-full bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm cursor-pointer flex items-center justify-between text-left transition"
          >
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                <div className="font-medium text-white truncate">
                  {pickup ? pickup.name : 'Select pickup point'}
                </div>
                {pickup && <div className="text-[11px] text-slate-400 truncate">{pickup.address}</div>}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </div>

          {/* Preset Popup */}
          {showPickupPresets && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 max-h-56 overflow-y-auto space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Popular Demo Landmarks
              </div>
              {presetLocations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => {
                    onSelectPickup(loc);
                    setShowPickupPresets(false);
                  }}
                  className="px-3 py-2 rounded-lg hover:bg-slate-700/80 cursor-pointer text-xs transition"
                >
                  <div className="font-semibold text-slate-100 flex items-center justify-between">
                    <span>{loc.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-750 text-slate-400">
                      {loc.category}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] truncate">{loc.address}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button Divider */}
        <div className="relative flex items-center justify-center -my-1">
          <div className="w-full border-t border-slate-800"></div>
          <button
            onClick={onSwapLocations}
            title="Swap Locations"
            className="absolute bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 p-1.5 rounded-full shadow transition"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dropoff Input */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span> Destination
            </span>
            <button
              onClick={() => onToggleSelectionMode('drop')}
              className={`text-xs px-2 py-0.5 rounded transition ${
                selectionMode === 'drop'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-amber-400 hover:text-amber-300 bg-amber-400/10'
              }`}
            >
              {selectionMode === 'drop' ? 'Click on map...' : '📍 Pin on Map'}
            </button>
          </div>

          <div
            onClick={() => setShowDropPresets(!showDropPresets)}
            className="w-full bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm cursor-pointer flex items-center justify-between text-left transition"
          >
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <Navigation className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="truncate">
                <div className="font-medium text-white truncate">
                  {drop ? drop.name : 'Select destination'}
                </div>
                {drop && <div className="text-[11px] text-slate-400 truncate">{drop.address}</div>}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </div>

          {/* Preset Popup */}
          {showDropPresets && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 max-h-56 overflow-y-auto space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Popular Demo Landmarks
              </div>
              {presetLocations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => {
                    onSelectDrop(loc);
                    setShowDropPresets(false);
                  }}
                  className="px-3 py-2 rounded-lg hover:bg-slate-700/80 cursor-pointer text-xs transition"
                >
                  <div className="font-semibold text-slate-100 flex items-center justify-between">
                    <span>{loc.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-750 text-slate-400">
                      {loc.category}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] truncate">{loc.address}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cab Selection Carousel / List */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Choose Cab Tier
          </label>
          {fareEstimates.length > 0 && (
            <span className="text-xs text-slate-400">
              Trip: ~{fareEstimates[0].distance_km} km ({fareEstimates[0].duration_mins} mins)
            </span>
          )}
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {cabTypes.map((cab) => {
            const isSelected = selectedCabType === cab.id;
            const estimate = getEstimate(cab.id);

            return (
              <div
                key={cab.id}
                onClick={() => onSelectCabType(cab.id)}
                className={`relative flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${
                      isSelected ? 'bg-amber-400/20 text-amber-400' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {getCabIcon(cab.icon_type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-white">{cab.name}</span>
                      <span className="text-[11px] flex items-center text-slate-400">
                        <Users className="w-3 h-3 mr-0.5" />
                        {cab.capacity}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-emerald-400" />
                        {cab.eta_minutes} min away
                      </span>
                      <span>•</span>
                      <span className="text-[11px] truncate max-w-[130px]">{cab.category}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold text-white">
                    ${estimate ? estimate.estimated_fare.toFixed(2) : cab.base_fare.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {estimate ? 'est. total' : `from $${cab.base_fare}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Selection */}
      <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-slate-800 text-emerald-400">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Payment Mode</div>
            <select
              value={paymentMethod}
              onChange={(e) => onSelectPaymentMethod(e.target.value)}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="Demo Card (••• 4242)" className="bg-slate-900 text-white">
                Demo Card (••• 4242)
              </option>
              <option value="Demo Wallet ($120.00)" className="bg-slate-900 text-white">
                Demo Wallet ($120.00)
              </option>
              <option value="Cash on Trip" className="bg-slate-900 text-white">
                Cash on Trip
              </option>
            </select>
          </div>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">TEST-MODE</span>
      </div>

      {/* Book Button */}
      <button
        disabled={!pickup || !drop || isLoading}
        onClick={onRequestRide}
        className={`w-full py-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center space-x-2 transition-all ${
          !pickup || !drop
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            : isLoading
            ? 'bg-amber-500 text-slate-950 cursor-wait'
            : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 hover:shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99]'
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            <span>Matching Nearest Driver...</span>
          </>
        ) : !pickup || !drop ? (
          <span>Select Pickup & Destination</span>
        ) : (
          <>
            <span>Confirm & Request Cab</span>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};
