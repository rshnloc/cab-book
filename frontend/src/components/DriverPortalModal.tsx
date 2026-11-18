import React from 'react';
import { X, Power, Car, Award, MapPin, Navigation } from 'lucide-react';
import { DriverInfo, Ride } from '../types';

interface DriverPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: DriverInfo;
  activeRide: Ride | null;
  onToggleOnline: (isOnline: boolean) => void;
  onAdvanceStatus: (rideId: string, nextStatus: string) => void;
}

export const DriverPortalModal: React.FC<DriverPortalModalProps> = ({
  isOpen,
  onClose,
  driver,
  activeRide,
  onToggleOnline,
  onAdvanceStatus,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1050] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              {driver.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>{driver.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                  Driver Portal
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {driver.vehicle_model} • {driver.vehicle_plate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Online / Offline Toggle & Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Duty Status</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {driver.is_online ? 'Online (Accepting)' : 'Offline (Paused)'}
              </div>
            </div>
            <button
              onClick={() => onToggleOnline(!driver.is_online)}
              className={`p-2.5 rounded-xl border transition ${
                driver.is_online
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              }`}
            >
              <Power className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Driver Rating</div>
              <div className="text-sm font-bold text-amber-400 mt-0.5 flex items-center space-x-1">
                <span>★ {driver.rating.toFixed(2)}</span>
                <span className="text-xs text-slate-400 font-normal">({driver.rides_count} trips)</span>
              </div>
            </div>
            <Award className="w-5 h-5 text-amber-400/80" />
          </div>
        </div>

        {/* Current Assigned Ride or Standby */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Trip Dispatch Queue</span>
            {activeRide && (
              <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ACTIVE TRIP
              </span>
            )}
          </div>

          {activeRide && activeRide.status !== 'COMPLETED' && activeRide.status !== 'CANCELLED' ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Rider: <b>{activeRide.rider_name}</b></span>
                <span className="text-amber-400 font-bold text-sm">${activeRide.fare.toFixed(2)}</span>
              </div>

              <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-2 text-slate-300 truncate">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{activeRide.pickup_name}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300 truncate">
                  <Navigation className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{activeRide.drop_name}</span>
                </div>
              </div>

              {/* Status progression quick buttons */}
              <div className="pt-2">
                <div className="text-[11px] text-slate-400 mb-2">Simulate driver action:</div>
                <div className="grid grid-cols-2 gap-2">
                  {activeRide.status === 'REQUESTED' && (
                    <button
                      onClick={() => onAdvanceStatus(activeRide.id, 'ACCEPTED')}
                      className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
                    >
                      Accept Trip
                    </button>
                  )}
                  {activeRide.status === 'ACCEPTED' && (
                    <button
                      onClick={() => onAdvanceStatus(activeRide.id, 'ARRIVED')}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                    >
                      Arrived at Pickup
                    </button>
                  )}
                  {activeRide.status === 'ARRIVED' && (
                    <button
                      onClick={() => onAdvanceStatus(activeRide.id, 'IN_PROGRESS')}
                      className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                    >
                      Start Trip
                    </button>
                  )}
                  {activeRide.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => onAdvanceStatus(activeRide.id, 'COMPLETED')}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                    >
                      Complete Trip
                    </button>
                  )}
                  <button
                    onClick={() => onAdvanceStatus(activeRide.id, 'CANCELLED')}
                    className="py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs transition"
                  >
                    Cancel Trip
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 space-y-1">
              <Car className="w-6 h-6 mx-auto opacity-40 text-slate-400" />
              <p className="text-xs">No active dispatch</p>
              <p className="text-[11px] text-slate-600">Waiting for riders to request rides in this area</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
