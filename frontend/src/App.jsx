import React, { useState, useMemo, useEffect } from 'react';
import { Train, UtensilsCrossed, ShieldCheck, LogOut } from 'lucide-react';
import BharatRailSpatial from './BharatRailSpatial';
import FoodCateringHub from './components/FoodCateringHub';
import AdminDashboard from './components/AdminDashboard';

function formatIsoDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('railyatra_verified_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeSection, setActiveSection] = useState('booking');
  const todayIso = useMemo(() => formatIsoDate(new Date()), []);
  const [journeyDate, setJourneyDate] = useState(todayIso);

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

  const handleAuthenticated = (verifiedUser) => {
    setUser(verifiedUser);
    try {
      sessionStorage.setItem('railyatra_verified_user', JSON.stringify(verifiedUser));
    } catch {}
    setActiveSection(verifiedUser.role === 'admin' ? 'admin' : 'booking');
  };

  useEffect(() => {
    const onAuthEvent = (e) => {
      if (e?.detail) handleAuthenticated(e.detail);
    };
    window.addEventListener('railyatra:auth', onAuthEvent);
    return () => window.removeEventListener('railyatra:auth', onAuthEvent);
  }, []);

  const handleLogout = () => {
    setUser(null);
    try {
      sessionStorage.removeItem('railyatra_verified_user');
    } catch {}
    setActiveSection('booking');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#f2f5fa] text-slate-900">
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

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {user?.role !== 'admin' && (
              <>
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
              </>
            )}

            {user && (
              <>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] text-blue-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="max-w-[150px] truncate">{user.email || user.mobile}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-100 hover:bg-white/15 border border-white/20 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {user?.role === 'admin' ? (
        <AdminDashboard user={user} />
      ) : activeSection === 'food' ? (
        <FoodCateringHub journeyDate={readableDate} onBack={() => setActiveSection('booking')} />
      ) : (
        <BharatRailSpatial
          journeyDate={journeyDate}
          onDateChange={setJourneyDate}
          verifiedUser={user}
          onAuthenticated={handleAuthenticated}
        />
      )}
    </div>
  );
}