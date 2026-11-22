import React, { useState, useMemo } from 'react';
import {
  UtensilsCrossed,
  Search,
  MapPin,
  Clock,
  Train,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  Flame,
  ChefHat,
  PackageCheck,
  Navigation,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

const MOCK_PNR_ROUTES = {
  '4218956320': {
    pnr: '4218956320',
    trainNo: '12952',
    trainName: 'Mumbai Tejas Rajdhani Express',
    coach: 'B4',
    berth: '24 (Lower)',
    passenger: 'Aaravind Sharma',
    currentStatus: 'Running on time • 18 km before Kota Jn',
    stations: [
      { code: 'NDLS', name: 'New Delhi', eta: 'Departed 16:55', halt: 'Origin', status: 'passed', cutoff: 'Closed', platform: 'PF 3' },
      { code: 'KOTA', name: 'Kota Jn', eta: '21:35 (In 32m)', halt: '10 min halt', status: 'next', cutoff: 'Order closes in 18m', platform: 'PF 1' },
      { code: 'RTM', name: 'Ratlam Jn', eta: '00:40', halt: '5 min halt', status: 'upcoming', cutoff: 'Order open', platform: 'PF 4' },
      { code: 'BRC', name: 'Vadodara Jn', eta: '03:50', halt: '10 min halt', status: 'upcoming', cutoff: 'Order open', platform: 'PF 2' },
      { code: 'ST', name: 'Surat', eta: '05:25', halt: '5 min halt', status: 'upcoming', cutoff: 'Order open', platform: 'PF 1' },
    ],
  },
  '6510293847': {
    pnr: '6510293847',
    trainNo: '12002',
    trainName: 'Bhopal Shatabdi Express',
    coach: 'C6',
    berth: '42 (Window)',
    passenger: 'Kavya Sharma',
    currentStatus: 'Running on time • Approaching Agra Cantt',
    stations: [
      { code: 'NDLS', name: 'New Delhi', eta: 'Departed 06:00', halt: 'Origin', status: 'passed', cutoff: 'Closed', platform: 'PF 1' },
      { code: 'KOTA', name: 'Kota Jn', eta: '10:15 (In 40m)', halt: '8 min halt', status: 'next', cutoff: 'Order closes in 22m', platform: 'PF 2' },
      { code: 'BRC', name: 'Vadodara Jn', eta: '13:45', halt: '10 min halt', status: 'upcoming', cutoff: 'Order open', platform: 'PF 3' },
    ],
  },
};

const STATION_MENU = [
  {
    id: 'BIRYANI',
    name: 'Hyderabadi Veg Dum Biryani & Mirchi Salan',
    stationCode: 'KOTA',
    stationName: 'Kota Jn',
    kitchen: 'Bawarchi Rail Kitchen • FSSAI 4.8★',
    price: 210,
    diet: 'Veg',
    prepTime: '15 min',
    bestseller: true,
    calories: '540 kcal',
    desc: 'Long-grain basmati, saffron, slow-cooked dum veggies, mint raita & salan.',
    accent: 'from-amber-500/20 to-orange-600/10',
  },
  {
    id: 'CHICKEN_BIRYANI',
    name: 'Royal Murgh Dum Biryani & Raita',
    stationCode: 'KOTA',
    stationName: 'Kota Jn',
    kitchen: 'Nizam Express Kitchen • FSSAI 4.9★',
    price: 265,
    diet: 'Non-Veg',
    prepTime: '18 min',
    bestseller: true,
    calories: '680 kcal',
    desc: 'Tender spiced chicken layered with fragrant basmati, crispy birista & burhani raita.',
    accent: 'from-rose-500/20 to-orange-500/10',
  },
  {
    id: 'KOTA_KACHORI',
    name: 'Kota Special Hing Kachori & Aloo Sabzi',
    stationCode: 'KOTA',
    stationName: 'Kota Jn',
    kitchen: 'Jodhpur Sweets Platform Hub • FSSAI 4.7★',
    price: 115,
    diet: 'Veg',
    prepTime: '10 min',
    bestseller: false,
    calories: '360 kcal',
    desc: '2 piping hot flaky hing kachoris served with tangy jeera-aloo curry & tamarind chutney.',
    accent: 'from-yellow-500/20 to-amber-500/10',
  },
  {
    id: 'RATLAM_POHA',
    name: 'Ratlami Sev Indori Poha & Jalebi Box',
    stationCode: 'RTM',
    stationName: 'Ratlam Jn',
    kitchen: 'Malwa Heritage Tiffin • FSSAI 4.8★',
    price: 145,
    diet: 'Jain',
    prepTime: '10 min',
    bestseller: true,
    calories: '410 kcal',
    desc: 'Steamed jeeravan poha topped with authentic Ratlami sev, pomegranate & 2 crisp kesar jalebis.',
    accent: 'from-orange-500/20 to-yellow-500/10',
  },
  {
    id: 'RATLAM_THALI',
    name: 'Pure Jain Satvik Deluxe Thali',
    stationCode: 'RTM',
    stationName: 'Ratlam Jn',
    kitchen: 'Shreeji Pure Veg Kitchen • FSSAI 4.9★',
    price: 235,
    diet: 'Jain',
    prepTime: '15 min',
    bestseller: false,
    calories: '590 kcal',
    desc: 'Zero onion-garlic Paneer Bhurji, Dal Tadka, 4 Ghee Phulkas, Jeera Rice & Gulab Jamun.',
    accent: 'from-emerald-500/20 to-teal-500/10',
  },
  {
    id: 'THALI',
    name: 'Maharaja Deluxe Veg Thali',
    stationCode: 'BRC',
    stationName: 'Vadodara Jn',
    kitchen: 'Rajwadi Rail Dining • FSSAI 4.8★',
    price: 245,
    diet: 'Veg',
    prepTime: '15 min',
    bestseller: true,
    calories: '720 kcal',
    desc: 'Paneer Butter Masala, Dal Makhani, 3 Butter Roti, Pulao, Salad, Pickle & Sweet.',
    accent: 'from-amber-500/20 to-rose-500/10',
  },
  {
    id: 'CHAI_SAMOSA',
    name: 'Kulhad Masala Chai & 2 Punjabi Samosas',
    stationCode: 'BRC',
    stationName: 'Vadodara Jn',
    kitchen: 'Chai Point Rail Express • FSSAI 4.7★',
    price: 95,
    diet: 'Veg',
    prepTime: '8 min',
    bestseller: true,
    calories: '310 kcal',
    desc: 'Fresh ginger-cardamom tea in thermal flask with 2 kulhads and crispy potato samosas.',
    accent: 'from-orange-600/20 to-amber-400/10',
  },
  {
    id: 'SURAT_LOCHO',
    name: 'Surti Butter Locho & Khaman Combo',
    stationCode: 'ST',
    stationName: 'Surat',
    kitchen: 'Gopal Locho Junction • FSSAI 4.9★',
    price: 160,
    diet: 'Jain',
    prepTime: '12 min',
    bestseller: true,
    calories: '430 kcal',
    desc: 'Steamed spiced gram-flour locho drizzled with Amul butter, green chutney & nylon sev.',
    accent: 'from-yellow-400/20 to-emerald-500/10',
  },
];

const TRACKING_STEPS = [
  { id: 0, label: 'Order Confirmed', desc: 'Sent to station kitchen', icon: CheckCircle2 },
  { id: 1, label: 'Chef Preparing', desc: 'Hot & tamper-proof sealed', icon: ChefHat },
  { id: 2, label: 'At Platform', desc: 'Executive waiting near coach', icon: Navigation },
  { id: 3, label: 'Delivered to Berth', desc: 'Enjoy your meal!', icon: PackageCheck },
];

export default function FoodCateringHub({ initialPnr = '', onBack }) {
  const [pnrInput, setPnrInput] = useState(initialPnr || '4218956320');
  const [activeJourney, setActiveJourney] = useState(MOCK_PNR_ROUTES['4218956320']);
  const [selectedStation, setSelectedStation] = useState('KOTA');
  const [dietFilter, setDietFilter] = useState('All');
  const [cart, setCart] = useState({});
  const [pnrError, setPnrError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [liveOrder, setLiveOrder] = useState(null);
  const [orderStage, setOrderStage] = useState(1);

  const handlePnrLookup = (e) => {
    e?.preventDefault();
    const cleaned = pnrInput.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setPnrError('Please enter a valid 10-digit Indian Railways PNR number.');
      return;
    }
    setPnrError('');
    setIsSearching(true);

    setTimeout(() => {
      const matched = MOCK_PNR_ROUTES[cleaned] || {
        ...MOCK_PNR_ROUTES['4218956320'],
        pnr: cleaned,
        passenger: 'Verified RailYatra Passenger',
        coach: 'A2',
        berth: '14 (Side Lower)',
      };
      setActiveJourney(matched);
      const nextStop = matched.stations.find((s) => s.status === 'next') || matched.stations[1];
      setSelectedStation(nextStop.code);
      setCart({});
      setLiveOrder(null);
      setIsSearching(false);
    }, 450);
  };

  const updateQty = (itemId, delta) => {
    setCart((prev) => {
      const next = (prev[itemId] || 0) + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const filteredMenu = useMemo(() => {
    return STATION_MENU.filter((item) => {
      const matchStation = selectedStation === 'ALL' || item.stationCode === selectedStation;
      const matchDiet = dietFilter === 'All' || item.diet === dietFilter;
      return matchStation && matchDiet;
    });
  }, [selectedStation, dietFilter]);

  const cartSummary = useMemo(() => {
    const items = Object.entries(cart)
      .map(([id, qty]) => {
        const dish = STATION_MENU.find((m) => m.id === id);
        return dish ? { ...dish, qty } : null;
      })
      .filter(Boolean);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const gst = Math.round(subtotal * 0.05);
    return { items, count: items.reduce((s, i) => s + i.qty, 0), subtotal, gst, total: subtotal + gst };
  }, [cart]);

  const placeOrder = () => {
    if (!cartSummary.count) return;
    const stationObj =
      activeJourney.stations.find((s) => s.code === selectedStation) || activeJourney.stations[1];
    setLiveOrder({
      orderId: 'RYF' + Math.floor(100000 + Math.random() * 900000),
      pnr: activeJourney.pnr,
      train: `${activeJourney.trainNo} ${activeJourney.trainName}`,
      coachBerth: `${activeJourney.coach} • Berth ${activeJourney.berth}`,
      station: `${stationObj.name} (${stationObj.code})`,
      platform: stationObj.platform,
      eta: stationObj.eta,
      items: cartSummary.items,
      total: cartSummary.total,
    });
    setOrderStage(1);
    setCart({});
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <style>{`
        @keyframes rollCardIn {
          0% {
            opacity: 0;
            transform: perspective(900px) rotateX(-18deg) translateY(24px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: perspective(900px) rotateX(0deg) translateY(0) scale(1);
          }
        }
        @keyframes marqueeRoll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes trainPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
          50% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
        }
        .animate-roll-in {
          animation: rollCardIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
          transform-origin: top center;
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marqueeRoll 24s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .train-beacon {
          animation: trainPulse 2s infinite;
        }
      `}</style>

      {/* Rolling Live Ticker Strip */}
      <div className="overflow-hidden border-b border-amber-500/20 bg-gradient-to-r from-amber-950/60 via-orange-950/50 to-slate-950 py-2">
        <div className="animate-marquee gap-10 text-xs font-medium text-amber-200/90">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-10 pr-10">
              <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-amber-400" /> Hot Seat Delivery synced to Live NTES Train Running Status</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% FSSAI Certified Station Kitchens</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-400" /> Zero-Fee Cancellation up to 15 mins before station halt</span>
              <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-orange-400" /> Pay via UPI or Cash on Delivery at your Berth</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Header & PNR Lookup Hero */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-400/30 px-3 py-1 text-xs font-semibold text-amber-300 mb-3">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                RailYatra e-Catering • Live PNR Delivery
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Order Fresh Meals Delivered Straight to Your Berth
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 max-w-2xl">
                Enter your 10-digit PNR to track your live train route, pick an upcoming station halt, and get piping hot restaurant meals delivered to your seat.
              </p>
            </div>

            {onBack && (
              <button
                onClick={onBack}
                className="self-start lg:self-center text-xs font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-xl px-4 py-2 transition"
              >
                ← Back to 3D Coach Booking
              </button>
            )}
          </div>

          <form onSubmit={handlePnrLookup} className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                maxLength={10}
                value={pnrInput}
                onChange={(e) => setPnrInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 10-digit PNR Number (e.g. 4218956320)"
                className="w-full rounded-2xl bg-slate-950/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 pl-11 pr-4 py-3.5 text-sm font-mono tracking-widest text-white outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold px-7 py-3.5 text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-95"
            >
              {isSearching ? 'Fetching Live Route...' : 'Track PNR & Menu'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>Demo PNRs:</span>
            {Object.keys(MOCK_PNR_ROUTES).map((demo) => (
              <button
                key={demo}
                type="button"
                onClick={() => {
                  setPnrInput(demo);
                  setActiveJourney(MOCK_PNR_ROUTES[demo]);
                  const nextStop = MOCK_PNR_ROUTES[demo].stations.find((s) => s.status === 'next');
                  if (nextStop) setSelectedStation(nextStop.code);
                  setLiveOrder(null);
                }}
                className="font-mono px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700 transition"
              >
                {demo}
              </button>
            ))}
          </div>

          {pnrError && <p className="mt-2 text-xs text-rose-400 font-medium">{pnrError}</p>}
        </div>

        {/* Live Train Route & Pickup Station Selector */}
        {activeJourney && (
          <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-base">
                      {activeJourney.trainNo} • {activeJourney.trainName}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Coach {activeJourney.coach} • Berth {activeJourney.berth}
                    </span>
                  </div>
                  <p className="text-xs text-amber-300/90 mt-0.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 train-beacon inline-block" />
                    {activeJourney.currentStatus}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block">PNR Verified</span>
                <span className="font-mono text-sm font-bold text-white">{activeJourney.pnr}</span>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  Select Delivery Pickup Station Along Your Route
                </h2>
                <button
                  onClick={() => setSelectedStation('ALL')}
                  className={`text-xs px-3 py-1 rounded-full border transition ${
                    selectedStation === 'ALL'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-semibold'
                      : 'border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  Show All Route Stations
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {activeJourney.stations.map((st, idx) => {
                  const isPassed = st.status === 'passed';
                  const isSelected = selectedStation === st.code;
                  return (
                    <button
                      key={st.code}
                      disabled={isPassed}
                      onClick={() => setSelectedStation(st.code)}
                      style={{ animationDelay: `${idx * 60}ms` }}
                      className={`animate-roll-in text-left rounded-2xl p-3.5 border transition-all ${
                        isPassed
                          ? 'border-slate-800/70 bg-slate-950/40 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'border-amber-400 bg-gradient-to-br from-amber-500/20 to-orange-500/10 shadow-lg shadow-amber-500/10 scale-[1.02]'
                          : 'border-slate-800 bg-slate-950/70 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-amber-400">{st.code}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            st.status === 'next'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : isPassed
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {st.status === 'next' ? 'Next Stop' : st.platform}
                        </span>
                      </div>
                      <div className="font-semibold text-sm text-white mt-1">{st.name}</div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {st.eta}
                      </div>
                      <div className="text-[11px] text-amber-300/90 mt-1 font-medium">{st.cutoff}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Live Food Order Delivery Tracker */}
        {liveOrder && (
          <div className="mt-6 animate-roll-in rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" /> Live Delivery Tracking Active • #{liveOrder.orderId}
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  Delivering to {liveOrder.coachBerth} at {liveOrder.station}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {liveOrder.train} • Expected on {liveOrder.platform} ({liveOrder.eta}) • Total: ₹{liveOrder.total}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOrderStage((s) => (s < 3 ? s + 1 : 0))}
                  className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 transition"
                >
                  Simulate Next Live Stage →
                </button>
                <button
                  onClick={() => setLiveOrder(null)}
                  className="text-xs px-3 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Order More
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6">
              {TRACKING_STEPS.map((step) => {
                const Icon = step.icon;
                const done = orderStage >= step.id;
                const active = orderStage === step.id;
                return (
                  <div
                    key={step.id}
                    className={`rounded-2xl p-4 border transition-all ${
                      active
                        ? 'border-emerald-400 bg-emerald-500/15 shadow-lg shadow-emerald-500/10'
                        : done
                        ? 'border-emerald-500/30 bg-slate-900/80'
                        : 'border-slate-800 bg-slate-950/60 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-5 h-5 ${done ? 'text-emerald-400' : 'text-slate-500'}`} />
                      {active && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-sm text-white mt-2">{step.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{step.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Menu Filter Bar + Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {selectedStation === 'ALL'
                    ? 'All Curated Route Menus'
                    : `Hot Kitchens at ${
                        activeJourney.stations.find((s) => s.code === selectedStation)?.name || selectedStation
                      }`}
                </h2>
                <p className="text-xs text-slate-400">
                  Freshly packed in thermal spill-proof boxes timed to your train arrival
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {['All', 'Veg', 'Jain', 'Non-Veg'].map((diet) => (
                  <button
                    key={diet}
                    onClick={() => setDietFilter(diet)}
                    className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition ${
                      dietFilter === diet
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>

            <div key={`${selectedStation}-${dietFilter}`} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMenu.map((item, idx) => {
                const qty = cart[item.id] || 0;
                const isNonVeg = item.diet === 'Non-Veg';
                return (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${idx * 75}ms` }}
                    className={`animate-roll-in group rounded-3xl border border-slate-800 hover:border-amber-500/50 bg-gradient-to-br ${item.accent} via-slate-900/95 to-slate-950 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                              isNonVeg ? 'border-rose-500' : 'border-emerald-500'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isNonVeg ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                            />
                          </span>
                          <span className="text-[11px] font-semibold text-amber-300/90">
                            {item.stationName} ({item.stationCode})
                          </span>
                        </div>
                        {item.bestseller && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Bestseller
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-white mt-2.5 group-hover:text-amber-200 transition">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.kitchen}</p>
                      <p className="text-xs text-slate-300/90 mt-2.5 leading-relaxed">{item.desc}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-white">₹{item.price}</span>
                        <span className="block text-[10px] text-slate-400">
                          {item.prepTime} • {item.calories}
                        </span>
                      </div>

                      {qty === 0 ? (
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 font-bold text-xs px-4 py-2 transition active:scale-95"
                        >
                          + Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 rounded-xl bg-amber-500 text-slate-950 px-2 py-1 font-bold text-xs">
                          <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-amber-400 rounded-lg">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-4 text-center">{qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-amber-400 rounded-lg">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Seat-Delivery Cart */}
          <div className="lg:sticky lg:top-20 rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white">Seat Delivery Tray</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300">
                {cartSummary.count} items
              </span>
            </div>

            {cartSummary.count === 0 ? (
              <div className="py-10 text-center">
                <UtensilsCrossed className="w-10 h-10 text-slate-700 mx-auto mb-2.5" />
                <p className="text-sm font-medium text-slate-300">Your tray is empty</p>
                <p className="text-xs text-slate-500 mt-1">
                  Pick a station along your route and add hot meals for Berth {activeJourney.berth}.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-4 space-y-3 max-h-64 overflow-y-auto pr-1">
                  {cartSummary.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-2 text-xs">
                      <div>
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="text-[11px] text-amber-300/80">
                          Pickup: {item.stationName} • ₹{item.price} × {item.qty}
                        </div>
                      </div>
                      <div className="font-bold text-white">₹{item.price * item.qty}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Item Subtotal</span>
                    <span>₹{cartSummary.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST (5%)</span>
                    <span>₹{cartSummary.gst}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Berth Delivery Fee</span>
                    <span>FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                    <span>Total Payable</span>
                    <span>₹{cartSummary.total}</span>
                  </div>
                </div>

                <button
                  onClick={placeOrder}
                  className="mt-5 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold py-3.5 text-sm shadow-lg shadow-amber-500/20 transition active:scale-95"
                >
                  Confirm & Track Live Delivery • ₹{cartSummary.total}
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                  Pay via UPI or Cash on Delivery at Coach {activeJourney.coach}, Berth {activeJourney.berth}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}