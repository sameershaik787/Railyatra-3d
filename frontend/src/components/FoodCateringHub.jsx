import React, { useState, useMemo, useRef } from 'react';
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
  ChefHat,
  PackageCheck,
  Navigation,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Phone,
  Gauge,
  Radio,
  ArrowLeftRight,
  Store,
  Calendar,
} from 'lucide-react';

const INR = '\u20B9';

const TRAIN_ROUTES = [
  {
    id: 'NDLS-MMCT',
    pnr: '4218956320',
    trainNo: '12952',
    trainName: 'Mumbai Tejas Rajdhani Express',
    fromCode: 'NDLS',
    fromName: 'New Delhi',
    toCode: 'MMCT',
    toName: 'Mumbai Central',
    coach: 'B4',
    berth: '24 (Lower)',
    speedKmph: 118,
    gpsCoords: '25.3124 N, 75.9412 E',
    delayStatus: 'On Time',
    currentLocationText: 'Crossed Sawai Madhopur | 18 km before Kota Jn',
    stations: [
      { code: 'NDLS', name: 'New Delhi', km: 0, arr: 'Origin', dep: '16:55', halt: 'Origin', status: 'passed', platform: 'PF 3', cutoff: 'Closed' },
      { code: 'KOTA', name: 'Kota Jn', km: 465, arr: '21:35', dep: '21:45', halt: '10m halt', status: 'next', platform: 'PF 1', cutoff: 'Order closes in 18m' },
      { code: 'RTM', name: 'Ratlam Jn', km: 731, arr: '00:40', dep: '00:45', halt: '5m halt', status: 'upcoming', platform: 'PF 4', cutoff: 'Order open' },
      { code: 'BRC', name: 'Vadodara Jn', km: 992, arr: '03:50', dep: '04:00', halt: '10m halt', status: 'upcoming', platform: 'PF 2', cutoff: 'Order open' },
      { code: 'ST', name: 'Surat', km: 1121, arr: '05:25', dep: '05:30', halt: '5m halt', status: 'upcoming', platform: 'PF 1', cutoff: 'Order open' },
      { code: 'MMCT', name: 'Mumbai Central', km: 1384, arr: '08:35', dep: 'Dest', halt: 'Destination', status: 'upcoming', platform: 'PF 4', cutoff: 'Order open' },
    ],
  },
  {
    id: 'UDZ-NZM',
    pnr: '6510293847',
    trainNo: '12964',
    trainName: 'Mewar Superfast Express',
    fromCode: 'UDZ',
    fromName: 'Udaipur City',
    toCode: 'NZM',
    toName: 'Hazrat Nizamuddin',
    coach: 'A2',
    berth: '14 (Side Lower)',
    speedKmph: 96,
    gpsCoords: '25.1840 N, 74.6315 E',
    delayStatus: 'On Time',
    currentLocationText: 'Crossed Chittaurgarh | 24 km before Bhilwara',
    stations: [
      { code: 'UDZ', name: 'Udaipur City', km: 0, arr: 'Origin', dep: '18:30', halt: 'Origin', status: 'passed', platform: 'PF 1', cutoff: 'Closed' },
      { code: 'COR', name: 'Chittaurgarh Jn', km: 115, arr: '20:30', dep: '20:40', halt: '10m halt', status: 'passed', platform: 'PF 2', cutoff: 'Closed' },
      { code: 'BHL', name: 'Bhilwara', km: 169, arr: '21:28', dep: '21:33', halt: '5m halt', status: 'next', platform: 'PF 1', cutoff: 'Order closes in 15m' },
      { code: 'KOTA', name: 'Kota Jn', km: 325, arr: '00:10', dep: '00:20', halt: '10m halt', status: 'upcoming', platform: 'PF 3', cutoff: 'Order open' },
      { code: 'MTJ', name: 'Mathura Jn', km: 604, arr: '04:15', dep: '04:20', halt: '5m halt', status: 'upcoming', platform: 'PF 2', cutoff: 'Order open' },
      { code: 'NZM', name: 'Hazrat Nizamuddin', km: 738, arr: '06:45', dep: 'Dest', halt: 'Destination', status: 'upcoming', platform: 'PF 5', cutoff: 'Order open' },
    ],
  },
  {
    id: 'SC-SBC',
    pnr: '7841203945',
    trainNo: '12785',
    trainName: 'Kacheguda Mysuru Express',
    fromCode: 'SC',
    fromName: 'Secunderabad Jn',
    toCode: 'SBC',
    toName: 'KSR Bengaluru',
    coach: 'B2',
    berth: '31 (Lower)',
    speedKmph: 104,
    gpsCoords: '15.8281 N, 78.0373 E',
    delayStatus: 'Delayed 4m',
    currentLocationText: 'Approaching Kurnool City | 14 km remaining',
    stations: [
      { code: 'SC', name: 'Secunderabad Jn', km: 0, arr: 'Origin', dep: '19:05', halt: 'Origin', status: 'passed', platform: 'PF 6', cutoff: 'Closed' },
      { code: 'MBNR', name: 'Mahabubnagar', km: 113, arr: '20:48', dep: '20:50', halt: '2m halt', status: 'passed', platform: 'PF 1', cutoff: 'Closed' },
      { code: 'KRNT', name: 'Kurnool City', km: 244, arr: '22:45', dep: '22:50', halt: '5m halt', status: 'next', platform: 'PF 2', cutoff: 'Order closes in 12m' },
      { code: 'ATP', name: 'Anantapur', km: 392, arr: '01:30', dep: '01:35', halt: '5m halt', status: 'upcoming', platform: 'PF 1', cutoff: 'Order open' },
      { code: 'DMM', name: 'Dharmavaram Jn', km: 425, arr: '02:25', dep: '02:30', halt: '5m halt', status: 'upcoming', platform: 'PF 3', cutoff: 'Order open' },
      { code: 'SBC', name: 'KSR Bengaluru', km: 629, arr: '06:25', dep: 'Dest', halt: 'Destination', status: 'upcoming', platform: 'PF 7', cutoff: 'Order open' },
    ],
  },
  {
    id: 'HWH-NDLS',
    pnr: '8124596301',
    trainNo: '12301',
    trainName: 'Howrah New Delhi Rajdhani',
    fromCode: 'HWH',
    fromName: 'Howrah Jn',
    toCode: 'NDLS',
    toName: 'New Delhi',
    coach: 'B6',
    berth: '19 (Side Upper)',
    speedKmph: 126,
    gpsCoords: '24.7955 N, 84.9994 E',
    delayStatus: 'On Time',
    currentLocationText: 'Crossed Dhanbad Jn | 32 km before Gaya Jn',
    stations: [
      { code: 'HWH', name: 'Howrah Jn', km: 0, arr: 'Origin', dep: '16:50', halt: 'Origin', status: 'passed', platform: 'PF 9', cutoff: 'Closed' },
      { code: 'DHN', name: 'Dhanbad Jn', km: 259, arr: '19:55', dep: '20:00', halt: '5m halt', status: 'passed', platform: 'PF 3', cutoff: 'Closed' },
      { code: 'GAYA', name: 'Gaya Jn', km: 458, arr: '22:20', dep: '22:25', halt: '5m halt', status: 'next', platform: 'PF 1', cutoff: 'Order closes in 20m' },
      { code: 'DDU', name: 'Pt DD Upadhyaya Jn', km: 661, arr: '00:55', dep: '01:05', halt: '10m halt', status: 'upcoming', platform: 'PF 4', cutoff: 'Order open' },
      { code: 'PRYJ', name: 'Prayagraj Jn', km: 814, arr: '02:45', dep: '02:50', halt: '5m halt', status: 'upcoming', platform: 'PF 2', cutoff: 'Order open' },
      { code: 'CNB', name: 'Kanpur Central', km: 1009, arr: '04:55', dep: '05:00', halt: '5m halt', status: 'upcoming', platform: 'PF 1', cutoff: 'Order open' },
      { code: 'NDLS', name: 'New Delhi', km: 1449, arr: '10:05', dep: 'Dest', halt: 'Destination', status: 'upcoming', platform: 'PF 16', cutoff: 'Order open' },
    ],
  },
  {
    id: 'MAS-SBC',
    pnr: '9051847263',
    trainNo: '20607',
    trainName: 'Chennai Mysuru Vande Bharat',
    fromCode: 'MAS',
    fromName: 'MGR Chennai Central',
    toCode: 'SBC',
    toName: 'KSR Bengaluru',
    coach: 'C4',
    berth: '12 (Window)',
    speedKmph: 122,
    gpsCoords: '12.9718 N, 79.1380 E',
    delayStatus: 'On Time',
    currentLocationText: 'Cruising past Arakkonam | 21 km before Katpadi Jn',
    stations: [
      { code: 'MAS', name: 'MGR Chennai Central', km: 0, arr: 'Origin', dep: '05:50', halt: 'Origin', status: 'passed', platform: 'PF 4', cutoff: 'Closed' },
      { code: 'KPD', name: 'Katpadi Jn', km: 130, arr: '07:13', dep: '07:15', halt: '2m halt', status: 'next', platform: 'PF 2', cutoff: 'Order closes in 14m' },
      { code: 'JTJ', name: 'Jolarpettai Jn', km: 214, arr: '08:12', dep: '08:14', halt: '2m halt', status: 'upcoming', platform: 'PF 1', cutoff: 'Order open' },
      { code: 'KJM', name: 'Krishnarajapuram', km: 348, arr: '09:42', dep: '09:44', halt: '2m halt', status: 'upcoming', platform: 'PF 3', cutoff: 'Order open' },
      { code: 'SBC', name: 'KSR Bengaluru', km: 362, arr: '10:15', dep: 'Dest', halt: 'Destination', status: 'upcoming', platform: 'PF 8', cutoff: 'Order open' },
    ],
  },
];

const PARTNER_STYLES = {
  Swiggy: 'bg-orange-50 text-orange-700 border-orange-200',
  Zomato: 'bg-rose-50 text-rose-700 border-rose-200',
  'Pizza Hut': 'bg-red-50 text-red-700 border-red-200',
  "Domino's": 'bg-blue-50 text-blue-700 border-blue-200',
  'IRCTC eCatering': 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const PARTNER_MENU = [
  {
    id: 'SWIGGY_BIRYANI',
    name: 'Hyderabadi Veg Dum Biryani & Mirchi Salan',
    partner: 'Swiggy',
    kitchen: 'Behrouz & Bawarchi Rail Kitchen | 4.8',
    stations: ['ALL'],
    price: 210,
    diet: 'Veg',
    prepTime: '15 min',
    bestseller: true,
    calories: '540 kcal',
    desc: 'Long-grain basmati, saffron, slow-cooked dum vegetables, mint raita, and salan in sealed thermal tray.',
  },
  {
    id: 'ZOMATO_CHICKEN_BIRYANI',
    name: 'Royal Murgh Dum Biryani & Burhani Raita',
    partner: 'Zomato',
    kitchen: 'Nizam Express Kitchen | 4.9',
    stations: ['ALL'],
    price: 265,
    diet: 'Non-Veg',
    prepTime: '18 min',
    bestseller: true,
    calories: '680 kcal',
    desc: 'Spiced tender chicken layered with aromatic basmati, crispy fried onions, and chilled raita.',
  },
  {
    id: 'PIZZAHUT_PANEER',
    name: 'Tandoori Paneer Personal Pan Pizza & Garlic Bread',
    partner: 'Pizza Hut',
    kitchen: 'Pizza Hut Station Express | 4.7',
    stations: ['ALL'],
    price: 289,
    diet: 'Veg',
    prepTime: '16 min',
    bestseller: true,
    calories: '640 kcal',
    desc: 'Spiced paneer chunks, red paprika, mozzarella on signature pan crust with 2 cheese garlic bread sticks.',
  },
  {
    id: 'PIZZAHUT_CHICKEN',
    name: 'Triple Chicken Feast Pan Pizza Combo',
    partner: 'Pizza Hut',
    kitchen: 'Pizza Hut Station Express | 4.6',
    stations: ['ALL'],
    price: 329,
    diet: 'Non-Veg',
    prepTime: '18 min',
    bestseller: false,
    calories: '710 kcal',
    desc: 'Schezwan chicken meatballs, herbed chicken, and chicken sausage with jalapeno dip.',
  },
  {
    id: 'DOMINOS_FARMHOUSE',
    name: 'Cheese Burst Farmhouse Pizza & Choco Lava Cake',
    partner: "Domino's",
    kitchen: "Domino's Rail Delivery | 4.8",
    stations: ['ALL'],
    price: 299,
    diet: 'Veg',
    prepTime: '15 min',
    bestseller: true,
    calories: '690 kcal',
    desc: 'Oven-baked crust loaded with capsicum, mushroom, sweet corn, and molten choco lava cake.',
  },
  {
    id: 'ZOMATO_THALI',
    name: 'Maharaja Deluxe Veg Thali',
    partner: 'Zomato',
    kitchen: 'Rajwadi Rail Dining | 4.8',
    stations: ['ALL'],
    price: 245,
    diet: 'Veg',
    prepTime: '15 min',
    bestseller: true,
    calories: '720 kcal',
    desc: 'Paneer Butter Masala, Dal Makhani, 3 Butter Roti, Jeera Pulao, Salad, Pickle, and Gulab Jamun.',
  },
  {
    id: 'IRCTC_JAIN_THALI',
    name: 'Pure Jain Satvik Deluxe Thali (No Onion/Garlic)',
    partner: 'IRCTC eCatering',
    kitchen: 'Shreeji Pure Veg Kitchen | 4.9',
    stations: ['ALL'],
    price: 235,
    diet: 'Jain',
    prepTime: '15 min',
    bestseller: false,
    calories: '590 kcal',
    desc: 'Prepared in separate Jain kitchen: Paneer Bhurji, Yellow Dal Tadka, 4 Ghee Phulkas, Rice, and Sweet.',
  },
  {
    id: 'SWIGGY_CHAI_SAMOSA',
    name: 'Kulhad Masala Chai Flask & 2 Punjabi Samosas',
    partner: 'Swiggy',
    kitchen: 'Chai Point Rail Hub | 4.7',
    stations: ['ALL'],
    price: 115,
    diet: 'Veg',
    prepTime: '10 min',
    bestseller: true,
    calories: '310 kcal',
    desc: 'Hot ginger-cardamom chai in 250 ml thermal flask with 2 earthen kulhads, samosas, and mint chutney.',
  },
  {
    id: 'IRCTC_KOTA_KACHORI',
    name: 'Kota Special Hing Kachori & Jeera Aloo Combo',
    partner: 'IRCTC eCatering',
    kitchen: 'Jodhpur Sweets Platform Hub | 4.8',
    stations: ['KOTA', 'BHL', 'RTM'],
    price: 120,
    diet: 'Veg',
    prepTime: '10 min',
    bestseller: false,
    calories: '370 kcal',
    desc: 'Two flaky Rajasthani hing kachoris served hot with tangy jeera-aloo sabzi and tamarind chutney.',
  },
  {
    id: 'SWIGGY_SOUTH_TIFFIN',
    name: 'Ghee Podi Idli, Medu Vada & Filter Coffee',
    partner: 'Swiggy',
    kitchen: 'A2B Rail Tiffin Express | 4.9',
    stations: ['KRNT', 'ATP', 'DMM', 'KPD', 'JTJ', 'KJM', 'SBC'],
    price: 175,
    diet: 'Jain',
    prepTime: '12 min',
    bestseller: true,
    calories: '420 kcal',
    desc: 'Soft idlis tossed in roasted podi and ghee with crisp vada, sambar, coconut chutney, and filter coffee.',
  },
];

const TRACKING_STEPS = [
  { id: 0, label: 'Order Confirmed', desc: 'Synced with partner kitchen', icon: CheckCircle2 },
  { id: 1, label: 'Chef Preparing', desc: 'Hot and tamper-proof sealed', icon: ChefHat },
  { id: 2, label: 'Executive at Platform', desc: 'Waiting near your coach', icon: Navigation },
  { id: 3, label: 'Delivered to Berth', desc: 'Verified via OTP handover', icon: PackageCheck },
];

export default function FoodCateringHub({ initialPnr = '', journeyDate = '', onBack }) {
  const [selectedRouteId, setSelectedRouteId] = useState(TRAIN_ROUTES[0].id);
  const [pnrInput, setPnrInput] = useState(initialPnr || TRAIN_ROUTES[0].pnr);
  const [activeRoute, setActiveRoute] = useState(TRAIN_ROUTES[0]);
  const [boardingCode, setBoardingCode] = useState(TRAIN_ROUTES[0].stations[0].code);
  const [selectedStation, setSelectedStation] = useState('KOTA');
  const [dietFilter, setDietFilter] = useState('All');
  const [partnerFilter, setPartnerFilter] = useState('All');
  const [cart, setCart] = useState({});
  const [pnrError, setPnrError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [pendingBooking, setPendingBooking] = useState(null);
  const [mobileInput, setMobileInput] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [liveOrder, setLiveOrder] = useState(null);
  const [orderStage, setOrderStage] = useState(1);

  const mobileSectionRef = useRef(null);

  const applyRoute = (routeObj, customPnr = null) => {
    const updated = customPnr ? { ...routeObj, pnr: customPnr } : routeObj;
    setSelectedRouteId(routeObj.id);
    setActiveRoute(updated);
    setPnrInput(updated.pnr);
    setBoardingCode(updated.stations[0].code);
    const nextStop = updated.stations.find((s) => s.status === 'next') || updated.stations[1];
    setSelectedStation(nextStop.code);
    setCart({});
    setPendingBooking(null);
    setLiveOrder(null);
  };

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
      const matched = TRAIN_ROUTES.find((r) => r.pnr === cleaned) || {
        ...activeRoute,
        pnr: cleaned,
      };
      applyRoute(matched, cleaned);
      setIsSearching(false);
    }, 350);
  };

  const handleRouteSelect = (routeId) => {
    const found = TRAIN_ROUTES.find((r) => r.id === routeId);
    if (found) {
      setPnrError('');
      applyRoute(found);
    }
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
    return PARTNER_MENU.filter((item) => {
      const matchStation =
        selectedStation === 'ALL' ||
        item.stations.includes('ALL') ||
        item.stations.includes(selectedStation);
      const matchDiet = dietFilter === 'All' || item.diet === dietFilter;
      const matchPartner = partnerFilter === 'All' || item.partner === partnerFilter;
      return matchStation && matchDiet && matchPartner;
    });
  }, [selectedStation, dietFilter, partnerFilter]);

  const cartSummary = useMemo(() => {
    const items = Object.entries(cart)
      .map(([id, qty]) => {
        const dish = PARTNER_MENU.find((m) => m.id === id);
        return dish ? { ...dish, qty } : null;
      })
      .filter(Boolean);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const gst = Math.round(subtotal * 0.05);
    const partners = Array.from(new Set(items.map((i) => i.partner)));
    return {
      items,
      partners,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal,
      gst,
      total: subtotal + gst,
    };
  }, [cart]);

  const handleBookFood = () => {
    if (!cartSummary.count) return;
    const stationObj =
      activeRoute.stations.find((s) => s.code === selectedStation) ||
      activeRoute.stations.find((s) => s.status === 'next') ||
      activeRoute.stations[1];

    setPendingBooking({
      orderId: 'RYF' + Math.floor(100000 + Math.random() * 900000),
      otp: String(Math.floor(1000 + Math.random() * 9000)),
      pnr: activeRoute.pnr,
      train: `${activeRoute.trainNo} ${activeRoute.trainName}`,
      coachBerth: `Coach ${activeRoute.coach}, Berth ${activeRoute.berth}`,
      station: `${stationObj.name} (${stationObj.code})`,
      platform: stationObj.platform,
      eta: stationObj.arr,
      partners: cartSummary.partners,
      items: cartSummary.items,
      total: cartSummary.total,
    });
    setLiveOrder(null);
    setMobileError('');
    setCart({});

    setTimeout(() => {
      mobileSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleConfirmMobile = (e) => {
    e.preventDefault();
    const cleaned = mobileInput.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setMobileError('Enter a valid 10-digit Indian mobile number starting with 6-9.');
      return;
    }
    setMobileError('');
    setLiveOrder({
      ...pendingBooking,
      mobileNumber: `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`,
    });
    setPendingBooking(null);
    setOrderStage(1);
  };

  const selectedStationObj =
    activeRoute.stations.find((s) => s.code === selectedStation) ||
    activeRoute.stations.find((s) => s.status === 'next') ||
    activeRoute.stations[1];

  return (
    <div className="min-h-screen bg-[#f2f5fa] text-slate-900 pb-20">
      <style>{`
        @keyframes rollCardIn {
          0% {
            opacity: 0;
            transform: perspective(900px) rotateX(-16deg) translateY(20px) scale(0.97);
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
        @keyframes gpsPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.55); }
          50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
        }
        .animate-roll-in {
          animation: rollCardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
          transform-origin: top center;
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marqueeRoll 26s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .gps-beacon {
          animation: gpsPulse 1.8s infinite;
        }
      `}</style>

      {/* Navy Partner Strip */}
      <div className="overflow-hidden bg-[#0b3166] border-b border-blue-900/60 py-2">
        <div className="animate-marquee gap-10 text-xs font-medium text-blue-100">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-10 pr-10">
              <span className="flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-sky-300" />
                Official Partners: Swiggy, Zomato, Pizza Hut, Domino's & IRCTC eCatering
              </span>
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                Live GPS Train Running Status & Platform Sync
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
                FSSAI Verified Station Kitchens with Tamper-Proof Packaging
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-300" />
                Free Cancellation up to 15 mins before Scheduled Halt
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Deep Navy Header Banner Overlapping White Search Card (Matches Booking Portal Theme) */}
      <div className="bg-[#07244d] pt-6 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-blue-100 mb-2">
              <UtensilsCrossed className="w-3.5 h-3.5 text-sky-300" />
              RailYatra Food on Train | Live Station Delivery
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Order from Swiggy, Zomato & Pizza Hut to Your Berth
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              Track live train GPS speed, choose your upcoming station halt, and get hot restaurant meals delivered to your seat.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-center">
            {journeyDate && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-100 bg-white/10 border border-white/20 rounded-full px-3.5 py-2">
                <Calendar className="w-3.5 h-3.5 text-sky-300" />
                {journeyDate}
              </span>
            )}
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 rounded-full px-4 py-2 transition shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to 3D Coach Booking
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10">
        {/* Route Selector (From/To + Boarding) & PNR Lookup Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Travel Route (From - To)
              </label>
              <div className="relative">
                <ArrowLeftRight className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedRouteId}
                  onChange={(e) => handleRouteSelect(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white pl-10 pr-3 py-3 text-xs font-semibold text-slate-800 outline-none transition"
                >
                  {TRAIN_ROUTES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fromName} ({r.fromCode}) to {r.toName} ({r.toCode}) - {r.trainNo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Boarding Station
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={boardingCode}
                  onChange={(e) => setBoardingCode(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white pl-10 pr-3 py-3 text-xs font-semibold text-slate-800 outline-none transition"
                >
                  {activeRoute.stations.slice(0, -1).map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.name} ({st.code}) - {st.dep}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <form onSubmit={handlePnrLookup} className="lg:col-span-5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Or Enter 10-Digit PNR Number
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={10}
                    value={pnrInput}
                    onChange={(e) => setPnrInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit PNR"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white pl-10 pr-3 py-2.5 text-sm font-mono tracking-wider text-slate-900 outline-none transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 shrink-0"
                >
                  {isSearching ? 'Checking...' : 'Fetch PNR'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold">Quick Routes:</span>
            {TRAIN_ROUTES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRouteSelect(r.id)}
                className={`px-3 py-1 rounded-full border text-xs font-semibold transition ${
                  selectedRouteId === r.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-blue-50/70 hover:bg-blue-100 text-blue-700 border-blue-200'
                }`}
              >
                {r.fromCode} to {r.toCode} ({r.pnr})
              </button>
            ))}
          </div>

          {pnrError && <p className="mt-2 text-xs text-rose-600 font-medium">{pnrError}</p>}
        </div>

        {/* Post-Booking Mobile Verification Card */}
        {pendingBooking && (
          <div
            ref={mobileSectionRef}
            className="mt-6 animate-roll-in rounded-2xl border-2 border-blue-600 bg-white p-6 shadow-md"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Booking Reserved | Order #{pendingBooking.orderId}
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-2">
                  Provide Your Mobile Number to Activate Station Delivery
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Delivery partner ({pendingBooking.partners.join(', ')}) will contact you at {pendingBooking.station} ({pendingBooking.platform}) for handover at {pendingBooking.coachBerth}.
                </p>
              </div>
              <div className="text-left md:text-right">
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">Order Total</span>
                <span className="text-xl font-bold text-blue-700">
                  {INR}{pendingBooking.total}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmMobile} className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative flex-1 w-full">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileInput}
                  onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit mobile number for SMS & delivery call"
                  className="w-full rounded-xl bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white pl-16 pr-4 py-3 text-sm font-mono tracking-wider text-slate-900 outline-none"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 text-sm shadow-sm transition active:scale-95"
              >
                Confirm Mobile & Track Live
              </button>
            </form>
            {mobileError && <p className="mt-2 text-xs text-rose-600 font-medium">{mobileError}</p>}
          </div>
        )}

        {/* Active Live Order Tracking Card */}
        {liveOrder && (
          <div className="mt-6 animate-roll-in rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Live Delivery Confirmed | #{liveOrder.orderId}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  Delivering to {liveOrder.coachBerth} at {liveOrder.station}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Partners: <span className="font-semibold text-slate-800">{liveOrder.partners.join(', ')}</span> | Mobile: <span className="font-mono font-semibold text-blue-700">{liveOrder.mobileNumber}</span> | Handover OTP: <span className="font-mono font-bold text-emerald-700">{liveOrder.otp}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOrderStage((s) => (s < 3 ? s + 1 : 0))}
                  className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  Update Live Stage
                </button>
                <button
                  onClick={() => setLiveOrder(null)}
                  className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Order More
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-5">
              {TRACKING_STEPS.map((step) => {
                const Icon = step.icon;
                const done = orderStage >= step.id;
                const active = orderStage === step.id;
                return (
                  <div
                    key={step.id}
                    className={`rounded-xl p-4 border transition-all ${
                      active
                        ? 'border-blue-500 bg-blue-50/70 shadow-sm'
                        : done
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : 'border-slate-200 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : done ? 'text-emerald-600' : 'text-slate-400'}`} />
                      {active && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-sm text-slate-900 mt-2">{step.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{step.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Where is My Train Live GPS, Speed & Station Timeline */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Train className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-base">
                    {activeRoute.trainNo} - {activeRoute.trainName}
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {activeRoute.fromName} to {activeRoute.toName}
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {activeRoute.delayStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 gps-beacon inline-block" />
                  <span className="font-semibold text-slate-800">{activeRoute.currentLocationText}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="rounded-xl bg-blue-50/70 border border-blue-200 px-3.5 py-2 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-blue-700">Live Speed</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">{activeRoute.speedKmph} km/h</span>
                </div>
              </div>
              <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 px-3.5 py-2 flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-emerald-700">GPS Satellite Lock</span>
                  <span className="text-xs font-bold text-slate-800 font-mono">{activeRoute.gpsCoords}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                Live Running Route - Tap Any Upcoming Station for Food Pickup
              </h2>
              <button
                onClick={() => setSelectedStation('ALL')}
                className={`text-xs font-semibold px-3 py-1 rounded-full border transition ${
                  selectedStation === 'ALL'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                }`}
              >
                Show All Route Kitchens
              </button>
            </div>

            <div className="relative pl-6 space-y-2.5 before:content-[''] before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-0.5 before:bg-blue-200">
              {activeRoute.stations.map((st, idx) => {
                const isPassed = st.status === 'passed';
                const isNext = st.status === 'next';
                const isSelected = selectedStation === st.code;
                const isBoarding = boardingCode === st.code;

                return (
                  <div key={st.code} className="relative">
                    <span
                      className={`absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isNext
                          ? 'bg-blue-600 border-blue-200 text-white gps-beacon'
                          : isPassed
                          ? 'bg-slate-300 border-white'
                          : isSelected
                          ? 'bg-emerald-600 border-emerald-200'
                          : 'bg-white border-blue-400'
                      }`}
                    >
                      {isNext && <Train className="w-2.5 h-2.5" />}
                    </span>

                    <button
                      type="button"
                      disabled={isPassed}
                      onClick={() => setSelectedStation(st.code)}
                      style={{ animationDelay: `${idx * 45}ms` }}
                      className={`animate-roll-in w-full text-left rounded-xl px-4 py-3 border transition flex flex-wrap items-center justify-between gap-3 ${
                        isPassed
                          ? 'bg-slate-50 border-slate-200 opacity-55 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-50 border-blue-500 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {st.code}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">{st.name}</span>
                            {isBoarding && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                Boarding Point
                              </span>
                            )}
                            {isNext && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Next Halt
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {st.km} km | {st.platform} | {st.halt}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {st.arr === 'Origin' ? `Dep ${st.dep}` : `Arr ${st.arr}`}
                          </div>
                          <div className={`text-[11px] font-medium ${isPassed ? 'text-slate-400' : 'text-blue-600'}`}>
                            {st.cutoff}
                          </div>
                        </div>
                        {!isPassed && (
                          <span
                            className={`text-[11px] font-semibold px-3 py-1 rounded-full ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {isSelected ? 'Delivery Stop' : 'Select Stop'}
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Partner Menu + Sticky Seat Delivery Tray */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {selectedStation === 'ALL'
                      ? 'All Route Partner Kitchens'
                      : `Served Hot at ${selectedStationObj.name} (${selectedStationObj.code})`}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Arrival {selectedStationObj.arr} on {selectedStationObj.platform} | Coach {activeRoute.coach}, Berth {activeRoute.berth}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {['All', 'Veg', 'Jain', 'Non-Veg'].map((diet) => (
                    <button
                      key={diet}
                      onClick={() => setDietFilter(diet)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                        dietFilter === diet
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-blue-50/60 text-blue-700 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                  Partners:
                </span>
                {['All', 'Swiggy', 'Zomato', 'Pizza Hut', "Domino's", 'IRCTC eCatering'].map((partner) => (
                  <button
                    key={partner}
                    onClick={() => setPartnerFilter(partner)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full border transition ${
                      partnerFilter === partner
                        ? 'bg-[#07244d] text-white border-[#07244d]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {partner}
                  </button>
                ))}
              </div>
            </div>

            <div
              key={`${selectedStation}-${dietFilter}-${partnerFilter}`}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {filteredMenu.map((item, idx) => {
                const qty = cart[item.id] || 0;
                const isNonVeg = item.diet === 'Non-Veg';
                const partnerClass = PARTNER_STYLES[item.partner] || 'bg-blue-50 text-blue-700 border-blue-200';

                return (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${idx * 65}ms` }}
                    className="animate-roll-in group rounded-2xl border border-slate-200 hover:border-blue-400 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                              isNonVeg ? 'border-rose-600' : 'border-emerald-600'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isNonVeg ? 'bg-rose-600' : 'bg-emerald-600'
                              }`}
                            />
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${partnerClass}`}>
                            {item.partner}
                          </span>
                        </div>
                        {item.bestseller && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            Bestseller
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-slate-900 mt-3 group-hover:text-blue-700 transition">
                        {item.name}
                      </h3>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">{item.kitchen}</p>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.desc}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-slate-900">
                          {INR}{item.price}
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          {item.prepTime} | {item.calories}
                        </span>
                      </div>

                      {qty === 0 ? (
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="rounded-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 font-bold text-xs px-4 py-2 transition active:scale-95"
                        >
                          + Add Meal
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 rounded-full bg-blue-600 text-white px-2.5 py-1 font-bold text-xs">
                          <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-blue-700 rounded-full">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-4 text-center">{qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-blue-700 rounded-full">
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

          <div className="lg:sticky lg:top-20 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Seat Delivery Tray</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {cartSummary.count} items
              </span>
            </div>

            <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Delivery Station</span>
                <span className="font-semibold text-slate-900">{selectedStationObj.name} ({selectedStationObj.code})</span>
              </div>
              <div className="flex justify-between">
                <span>Coach / Berth</span>
                <span className="font-semibold text-slate-900">{activeRoute.coach}, {activeRoute.berth}</span>
              </div>
            </div>

            {cartSummary.count === 0 ? (
              <div className="py-10 text-center">
                <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                <p className="text-sm font-semibold text-slate-700">Your tray is empty</p>
                <p className="text-xs text-slate-500 mt-1">
                  Add meals from Swiggy, Zomato, Pizza Hut, or Domino's for {selectedStationObj.name}.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-4 space-y-3 max-h-64 overflow-y-auto pr-1">
                  {cartSummary.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-2 text-xs">
                      <div>
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.partner} | {INR}{item.price} x {item.qty}
                        </div>
                      </div>
                      <div className="font-bold text-slate-900">{INR}{item.price * item.qty}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Item Subtotal</span>
                    <span>{INR}{cartSummary.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>GST (5%)</span>
                    <span>{INR}{cartSummary.gst}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Berth Delivery Fee</span>
                    <span>FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total Payable</span>
                    <span>{INR}{cartSummary.total}</span>
                  </div>
                </div>

                <button
                  onClick={handleBookFood}
                  className="mt-5 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 text-sm shadow-sm transition active:scale-95"
                >
                  Book Food Order - {INR}{cartSummary.total}
                </button>
                <p className="text-[11px] text-center text-slate-500 mt-2">
                  Next step: verify your 10-digit mobile number for platform delivery call and OTP.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}