import React, { useState } from 'react';
import { Train, UtensilsCrossed } from 'lucide-react';
import BharatRailSpatial from './BharatRailSpatial';
import FoodCateringHub from './components/FoodCateringHub';

export default function App() {
  const [activeSection, setActiveSection] = useState('booking');

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="sticky top-0 z-50 border-b border-slate-800/90 bg-slate-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-amber-500/20">
              RY
            </div>
            <span className="font-bold text-white tracking-tight text-sm sm:text-base">
              RailYatra <span className="text-amber-400">3D</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection('booking')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeSection === 'booking'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Train className="w-3.5 h-3.5" />
              3D Coach Booking
            </button>

            <button
              onClick={() => setActiveSection('food')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeSection === 'food'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Food on Train
              <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Live PNR
              </span>
            </button>
          </div>
        </div>
      </nav>

      {activeSection === 'food' ? (
        <FoodCateringHub onBack={() => setActiveSection('booking')} />
      ) : (
        <BharatRailSpatial />
      )}
    </div>
  );
}