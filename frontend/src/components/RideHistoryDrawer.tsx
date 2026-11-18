import React from 'react';
import { X, Clock, MapPin, Navigation, Star, Car } from 'lucide-react';
import { Ride } from '../types';

interface RideHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  rides: Ride[];
  onSelectRide?: (ride: Ride) => void;
}

export const RideHistoryDrawer: React.FC<RideHistoryDrawerProps> = ({
  isOpen,
  onClose,
  rides,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1050] bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 shadow-2xl flex flex-col space-y-4 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">Ride History</h3>
            <p className="text-xs text-slate-400">Past demo trips and digital receipts</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Rides */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {rides.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
              <Clock className="w-8 h-8 opacity-40" />
              <p className="text-sm">No past rides yet</p>
              <p className="text-xs text-slate-600">Your booked trips will appear here</p>
            </div>
          ) : (
            rides.map((r) => {
              const isCompleted = r.status === 'COMPLETED';
              const isCancelled = r.status === 'CANCELLED';

              return (
                <div
                  key={r.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2.5 transition hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : isCancelled
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {r.status}
                    </span>
                    <span className="text-sm font-bold text-white">${r.fare.toFixed(2)}</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2 text-slate-300 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{r.pickup_name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300 truncate">
                      <Navigation className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">{r.drop_name}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <Car className="w-3.5 h-3.5 text-slate-500" />
                      <span>{r.driver ? r.driver.name : 'Demo Fleet'}</span>
                    </div>

                    {r.rating && (
                      <div className="flex items-center space-x-1 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{r.rating}.0</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
