import React from 'react';
import { Car, History, Shield } from 'lucide-react';
import { DemoUser } from '../types';

interface NavbarProps {
  currentUser: DemoUser;
  demoUsers: DemoUser[];
  wsConnected: boolean;
  onSelectUser: (user: DemoUser) => void;
  onOpenHistory: () => void;
  onOpenDriverPortal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  demoUsers,
  wsConnected,
  onSelectUser,
  onOpenHistory,
  onOpenDriverPortal,
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-[500] px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
            <span className="text-xl">🚖</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-white">MetroCab</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                Demo
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Urban Mobility & Taxi Booking</p>
          </div>
        </div>

        {/* Center pill: WebSocket realtime connectivity & safety status */}
        <div className="hidden md:flex items-center space-x-3 bg-slate-950/60 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs">
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            ></span>
            <span className="text-slate-300 font-medium">
              {wsConnected ? 'Live Realtime Sync' : 'Reconnecting...'}
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">Safe Demo Sandbox</span>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center space-x-3">
          {/* Driver Mode Button */}
          <button
            onClick={onOpenDriverPortal}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            <Car className="w-3.5 h-3.5 text-amber-400" />
            <span>Driver Mode</span>
          </button>

          {/* Ride History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Trips</span>
          </button>

          {/* User Switcher Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-950/70 border border-slate-800 p-1 rounded-2xl">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow"
              style={{ backgroundColor: currentUser.avatar_color }}
            >
              {currentUser.name.charAt(currentUser.name.lastIndexOf(' ') + 1)}
            </div>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const found = demoUsers.find((u) => u.id === e.target.value);
                if (found) onSelectUser(found);
              }}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
            >
              {demoUsers.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
