import React from 'react';
import {
  Phone,
  Shield,
  XCircle,
  MapPin,
  Navigation,
  Clock,
} from 'lucide-react';
import { Ride } from '../types';

interface ActiveRideCardProps {
  ride: Ride;
  onCancelRide: () => void;
  isCancelling: boolean;
}

export const ActiveRideCard: React.FC<ActiveRideCardProps> = ({
  ride,
  onCancelRide,
  isCancelling,
}) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return {
          title: 'Looking for a nearby driver',
          subtitle: 'Dispatching to top-rated demo cabs in your area...',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          pulse: true,
        };
      case 'ACCEPTED':
        return {
          title: 'Driver on the way to pickup',
          subtitle: `${ride.driver?.name || 'Driver'} is arriving in ~3 mins`,
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          pulse: true,
        };
      case 'ARRIVED':
        return {
          title: 'Driver has arrived!',
          subtitle: 'Your cab is waiting at the designated pickup point',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          pulse: true,
        };
      case 'IN_PROGRESS':
        return {
          title: 'Ride in progress',
          subtitle: `Cruising towards ${ride.drop_name}`,
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          pulse: true,
        };
      case 'COMPLETED':
        return {
          title: 'Trip Completed',
          subtitle: 'You have arrived at your destination!',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          pulse: false,
        };
      case 'CANCELLED':
        return {
          title: 'Trip Cancelled',
          subtitle: 'This ride booking was cancelled',
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          pulse: false,
        };
      default:
        return {
          title: 'Ride Active',
          subtitle: 'Processing update...',
          badgeColor: 'bg-slate-700 text-slate-300 border-slate-600',
          pulse: false,
        };
    }
  };

  const statusInfo = getStatusInfo(ride.status);
  const canCancel = ride.status === 'REQUESTED' || ride.status === 'ACCEPTED';

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col space-y-6">
      {/* Live Status Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center space-x-1.5 ${statusInfo.badgeColor}`}
            >
              {statusInfo.pulse && (
                <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
              )}
              <span>{ride.status}</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">#{ride.id.slice(0, 10)}</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-2">{statusInfo.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{statusInfo.subtitle}</p>
        </div>

        <div className="text-right">
          <div className="text-xl font-extrabold text-amber-400">${ride.fare.toFixed(2)}</div>
          <div className="text-[11px] text-slate-400">{ride.payment_method}</div>
        </div>
      </div>

      {/* Dynamic Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
          <span>Trip Progress</span>
          <span>{Math.round(ride.progress_percent)}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-400 transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, Math.max(5, ride.progress_percent))}%` }}
          ></div>
        </div>
      </div>

      {/* Driver Card Info (if assigned) */}
      {ride.driver ? (
        <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg shadow-inner">
              {ride.driver.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-white">{ride.driver.name}</span>
                <span className="text-xs bg-slate-800 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-slate-700">
                  ★ {ride.driver.rating.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {ride.driver.vehicle_model} • {ride.driver.vehicle_color}
              </div>
              <div className="inline-block mt-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                {ride.driver.vehicle_plate}
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5 items-end">
            <button
              onClick={() => alert(`[Demo Mode] Simulated call with driver ${ride.driver?.name} (${ride.driver?.phone})`)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white transition"
              title="Call Driver (Demo)"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
            </button>
            <span className="text-[10px] text-slate-400">{ride.driver.phone}</span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/80 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
          <Clock className="w-4 h-4 text-amber-400 animate-spin" />
          <span>Searching nearby demo cabs for assignment...</span>
        </div>
      )}

      {/* Route Waypoints Recap */}
      <div className="bg-slate-950/40 rounded-2xl p-3.5 border border-slate-800/80 space-y-2 text-xs">
        <div className="flex items-center space-x-2 text-slate-300 truncate">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">
            <b>From:</b> {ride.pickup_name}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300 truncate">
          <Navigation className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="truncate">
            <b>To:</b> {ride.drop_name}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        {canCancel && (
          <button
            disabled={isCancelling}
            onClick={onCancelRide}
            className="w-full py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs transition flex items-center justify-center space-x-1.5"
          >
            <XCircle className="w-4 h-4" />
            <span>{isCancelling ? 'Cancelling...' : 'Cancel Ride'}</span>
          </button>
        )}

        <button
          onClick={() => alert('[Demo Safety] Safety emergency simulated. All systems secure.')}
          className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition"
        >
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Safety</span>
        </button>
      </div>
    </div>
  );
};
