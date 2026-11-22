import React, { useState, useMemo } from 'react';
import { Train, UtensilsCrossed, Calendar } from 'lucide-react';
import BharatRailSpatial from './BharatRailSpatial';
import FoodCateringHub from './components/FoodCateringHub';

function formatIsoDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function App() {
  const [activeSection, setActiveSection] = useState('booking');
  const todayIso = useMemo(() => formatIsoDate(new Date()), []);
  const [journeyDate, setJourneyDate] = useState(todayIso);

  const quickDates = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return Array.from({ length: 6 }, (_, i) => {
      const dt = new Date();
      dt.setDate(dt.getDate() + i);
      return {
        iso: formatIsoDate(dt),
        tag: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[dt.getDay()],
        label: `${dt.getDate()} ${months[dt.getMonth()]}`,
      };
    });
  }, []);

  const readableDate = useMemo(() => {
    const dt = new Date(`${journeyDate}T00:00:00`);
    if (Number.isNaN(dt.getTime())) return journeyDate;
    return dt.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, [journeyDate]);

  return (
    <div className="min-h-screen bg-[#f2f5fa] text-slate-900">
      {/* Top Navbar Matching Deep Navy & Royal Blue Portal Theme */}
      <nav className="sticky top-0 z-50 bg-[#07244d] border-b border-blue-900/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              RY
            </div>
            <span className="font-bold text-white tracking-tight text-sm sm:text-base">
              RailYatra <span className="text-sky-300">3D</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection('booking')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                activeSection === 'booking'
                  ? 'bg-white text-blue-700 border border-blue-500 shadow-sm'
                  : 'text-blue-100 hover:bg-white/10 border border-white/15'
              }`}
            >
              <Train className="w-3.5 h-3.5" />
              3D Coach Booking
            </button>

            <button
              onClick={() => setActiveSection('food')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                activeSection === 'food'
                  ? 'bg-white text-blue-700 border border-blue-500 shadow-sm'
                  : 'bg-blue-50 text-blue-700 border border-blue-400 hover:bg-white'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Food on Train
            </button>
          </div>
        </div>
      </nav>

      {/* Train Booking Journey Date Selector Bar */}
      {activeSection === 'booking' && (
        <div className="bg-[#07244d] pb-4 pt-2 px-4 sm:px-6 border-b border-blue-900/40">
          <div className="max-w-7xl mx-auto rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Journey Date
                </span>
                <span className="text-sm font-bold text-slate-900">{readableDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {quickDates.map((d) => {
                const active = journeyDate === d.iso;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => setJourneyDate(d.iso)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-blue-50/70 text-blue-700 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <span className="block text-[10px] opacity-85">{d.tag}</span>
                    <span>{d.label}</span>
                  </button>
                );
              })}

              <label className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:border-blue-500 text-xs font-semibold text-slate-700 cursor-pointer">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <input
                  type="date"
                  min={todayIso}
                  value={journeyDate}
                  onChange={(e) => e.target.value && setJourneyDate(e.target.value)}
                  className="bg-transparent outline-none text-xs font-semibold text-slate-800 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'food' ? (
        <FoodCateringHub journeyDate={readableDate} onBack={() => setActiveSection('booking')} />
      ) : (
        <BharatRailSpatial journeyDate={journeyDate} />
      )}
    </div>
  );
}