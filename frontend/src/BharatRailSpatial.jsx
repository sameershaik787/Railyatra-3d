import { mergeAllIndiaStations, resolveTravelDateObj, StationSearchField, TravelDatePickerField } from './components/SearchBarWidgets';
import EmbeddedAuthCard from './components/EmbeddedAuthCard';
import { QUOTA_PILLS, TRAINS_CATALOG } from './data/railData';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import {
  Train, ShieldCheck, UserCheck, Lock, LogOut, Eye,
  CheckCircle2, AlertCircle, CreditCard, QrCode, Printer,
  Sliders, Compass, Layers, ChevronRight, Search,
  Sun, Moon, FileText, ArrowRight, ArrowLeftRight,
  Calendar, MapPin, Utensils, Shield, Clock, Users,
  Info, Check, X, Navigation, Activity, Armchair,
  Coffee, Heart, Star, Gauge, Phone, Building2,
  Tag, Wallet, Landmark, MessageCircle, UserPlus,
  ChevronDown, ChevronUp, Download, BadgeCheck
} from 'lucide-react';

// Inject natural production travel fonts (Lato + Noto Sans) and tabular numerals
const FONT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&family=Noto+Sans:wght@400;500;600;700&display=swap');
  .railyatra-font {
    font-family: 'Lato', 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }
`;

// ============================================================================
// 1. INDIAN RAILWAYS MASTER CATALOG, STATIONS, TRAINS & RBAC PROFILES
// ============================================================================

const STATIONS = mergeAllIndiaStations([
  { code: 'NDLS', name: 'New Delhi', city: 'New Delhi', state: 'Delhi', gate: 'Ajmeri Gate / Paharganj' },
  { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra', gate: 'Main Concourse Gate 1' },
  { code: 'UDZ', name: 'Udaipur City', city: 'Udaipur', state: 'Rajasthan', gate: 'Heritage Main Entry' },
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan', gate: 'Platform 1 Metro Link' },
  { code: 'BCT', name: 'Bandra Terminus', city: 'Mumbai', state: 'Maharashtra', gate: 'East Skywalk Entry' },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal', gate: 'New Complex Gate 4' },
  { code: 'SBC', name: 'KSR Bengaluru', city: 'Bengaluru', state: 'Karnataka', gate: 'Majestic Metro Concourse' }
]);

const TRAVEL_DATES = [
  { date: '2026-11-22', dayNum: '22', month: 'Nov', weekday: 'Sun', avail: 'AVL 48', tone: 'green', minFare: 1790 },
  { date: '2026-11-23', dayNum: '23', month: 'Nov', weekday: 'Mon', avail: 'AVL 64', tone: 'green', minFare: 1790 },
  { date: '2026-11-24', dayNum: '24', month: 'Nov', weekday: 'Tue', avail: 'AVL 29', tone: 'green', minFare: 1845 },
  { date: '2026-11-25', dayNum: '25', month: 'Nov', weekday: 'Wed', avail: 'RAC 06', tone: 'amber', minFare: 1965 },
  { date: '2026-11-26', dayNum: '26', month: 'Nov', weekday: 'Thu', avail: 'AVL 22', tone: 'green', minFare: 1965 },
  { date: '2026-11-27', dayNum: '27', month: 'Nov', weekday: 'Fri', avail: 'AVL 14', tone: 'amber', minFare: 2140 },
  { date: '2026-11-28', dayNum: '28', month: 'Nov', weekday: 'Sat', avail: 'AVL 51', tone: 'green', minFare: 1965 }
];





const ECATERING_MENU = [
  { id: 'NONE', name: 'No Meal Selected (Carry Own Food)', price: 0, station: 'Optional', desc: 'You can also order anytime during your journey', veg: true },
  { id: 'BIRYANI', name: 'Hyderabadi Veg Dum Biryani & Mirchi Salan', price: 210, station: 'Served Hot at Kota Jn', desc: 'Long-grain basmati, saffron, mint raita & gulab jamun', veg: true },
  { id: 'CHICKEN_BIRYANI', name: 'Royal Murgh Dum Biryani & Raita', price: 265, station: 'Served Hot at Kota Jn', desc: 'Slow-cooked tender chicken, fragrant basmati & salan', veg: false },
  { id: 'THALI', name: 'Maharaja Deluxe Veg Thali', price: 245, station: 'Served Hot at Vadodara Jn', desc: 'Paneer Butter Masala, Dal Makhani, 3 Butter Roti, Pulao & Sweet', veg: true },
  { id: 'CHAI_SAMOSA', name: 'Kulhad Masala Chai & 2 Punjabi Samosas', price: 95, station: 'Evening Refreshment', desc: 'Fresh ginger-cardamom tea with crispy hot samosas & chutney', veg: true }
];

const SAVED_TRAVELLERS = [
  { name: 'Aaravind Sharma', age: '32', gender: 'Male', berthPref: 'Lower', mealPref: 'Veg', nationality: 'India' },
  { name: 'Sunita Sharma', age: '61', gender: 'Female', berthPref: 'Lower', mealPref: 'Jain', nationality: 'India' },
  { name: 'Rajendra Sharma', age: '65', gender: 'Male', berthPref: 'Lower', mealPref: 'Veg', nationality: 'India' },
  { name: 'Kavya Sharma', age: '28', gender: 'Female', berthPref: 'Side Lower', mealPref: 'Non-Veg', nationality: 'India' }
];

const PROMO_CODES = [
  { code: 'RAILFIRST', title: 'Flat ₹150 OFF', desc: 'Instant discount on your AC train booking', type: 'FLAT', amount: 150 },
  { code: 'ZEROFEE', title: '₹0 Convenience Fee', desc: 'Waive IRCTC & gateway convenience charges', type: 'FEE_WAIVER', amount: 35 },
  { code: 'UPI50', title: 'Instant ₹50 OFF', desc: 'Extra savings when paying via BHIM UPI / GPay', type: 'FLAT', amount: 50 }
];

const DEMO_USERS = {
  PASSENGER: {
    id: 'RY-CIT-8841',
    name: 'Aaravind Sharma',
    email: 'aaravind.sharma@gmail.com',
    phone: '+91 98290 44120',
    role: 'PASSENGER',
    roleLabel: 'Traveller (Passenger)',
    badge: 'IRCTC Verified'
  },
  TTE: {
    id: 'TTE-WR-409',
    name: 'Rajeshwar Chauhan',
    email: 'r.chauhan@indianrailways.gov.in',
    phone: '+91 90041 77102',
    role: 'TTE',
    roleLabel: 'TTE (Onboard Ticket Examiner)',
    badge: 'HHT Chart Synced'
  },
  ADMIN: {
    id: 'ADM-CRIS-01',
    name: 'Ananya Deshpande',
    email: 'ananya.ops@irctc.co.in',
    phone: '+91 98110 22901',
    role: 'ADMIN',
    roleLabel: 'Railway Admin',
    badge: 'CRIS Fleet Ops'
  }
};

// ============================================================================
// 2. REAL-LIFE INDIAN RAILWAYS BERTH LAYOUT ENGINE (3A / 2A / 1A)
// ============================================================================

function generateCoachBerths(coachClass, coachCode) {
  const berths = [];
  const samplePassengers = [
    { name: 'Vikramaditya Nair', age: 36, gender: 'M', pnr: '2849104412', idProof: 'Aadhaar •••• 4819' },
    { name: 'Meenakshi Iyer', age: 29, gender: 'F', pnr: '2849104418', idProof: 'PAN •••• 912K' },
    { name: 'Col. Harishankar Verma', age: 62, gender: 'M', pnr: '2849104490', idProof: 'Defence ID •••• 7731' },
    { name: 'Priyanka Joshi', age: 31, gender: 'F', pnr: '2849104511', idProof: 'Passport •••• 3390' },
    { name: 'Sureshbhai Patel', age: 54, gender: 'M', pnr: '2849104588', idProof: 'Aadhaar •••• 1102' }
  ];

  if (coachClass === '3A') {
    // Authentic LHB 3AC: 3 visible bays x 8 berths = 24 berths
    // 1,4 = Lower (LB) | 2,5 = Middle (MB) | 3,6 = Upper (UB) | 7 = Side Lower (SL) | 8 = Side Upper (SU)
    for (let bay = 1; bay <= 3; bay++) {
      const base = (bay - 1) * 8;
      const layout = [
        { num: base + 1, code: 'LB', name: 'Lower Berth', side: 'MAIN_L', tier: 0, charging: true, window: true },
        { num: base + 2, code: 'MB', name: 'Middle Berth', side: 'MAIN_L', tier: 1, charging: false, window: false },
        { num: base + 3, code: 'UB', name: 'Upper Berth', side: 'MAIN_L', tier: 2, charging: false, window: false },
        { num: base + 4, code: 'LB', name: 'Lower Berth', side: 'MAIN_R', tier: 0, charging: true, window: true },
        { num: base + 5, code: 'MB', name: 'Middle Berth', side: 'MAIN_R', tier: 1, charging: false, window: false },
        { num: base + 6, code: 'UB', name: 'Upper Berth', side: 'MAIN_R', tier: 2, charging: false, window: false },
        { num: base + 7, code: 'SL', name: 'Side Lower', side: 'SIDE', tier: 0, charging: true, window: true },
        { num: base + 8, code: 'SU', name: 'Side Upper', side: 'SIDE', tier: 2, charging: false, window: false }
      ];

      layout.forEach((s, idx) => {
        const isBooked =
          (bay === 1 && (s.num === 2 || s.num === 6)) ||
          (bay === 2 && (s.num === 11 || s.num === 15)) ||
          (bay === 3 && s.num === 18);
        const isQuota = !isBooked && (s.num === 4 || s.num === 9 || s.num === 20);
        const paxObj = isBooked ? samplePassengers[(s.num + idx) % samplePassengers.length] : null;

        const comfortNotes = [];
        if (s.code === 'LB') comfortNotes.push('Great for seniors & easy access');
        if (s.code === 'SL') comfortNotes.push('Solo-friendly with full-length view');
        if (s.charging) comfortNotes.push('230V + USB socket right beside you');
        if (s.window) comfortNotes.push('Clear panoramic window view');
        if (bay === 1) comfortNotes.push('Quiet middle bay, away from the washroom door');
        else if (bay === 2) comfortNotes.push('Balanced mid-coach ride stability');
        else comfortNotes.push('Quick access to washbasin & entry door');

        berths.push({
          id: `${coachCode}-${s.num}`,
          displayNum: s.num,
          coach: coachCode,
          coachClass: '3A',
          bay,
          bayLabel: `Bay ${bay}`,
          code: s.code,
          name: s.name,
          side: s.side,
          tier: s.tier,
          charging: s.charging,
          window: s.window,
          comfortNote: comfortNotes.join(' • '),
          status: isBooked ? 'BOOKED' : isQuota ? 'QUOTA' : 'AVAILABLE',
          quota: isQuota ? 'Ladies / Senior Priority' : 'General',
          pax: paxObj,
          pnr: paxObj ? paxObj.pnr : null,
          boarded: isBooked && s.num % 2 === 0
        });
      });
    }
  } else if (coachClass === '2A') {
    // Authentic LHB 2AC: 3 bays x 6 berths = 18 berths (NO Middle Berth, curtains on every bay & side)
    for (let bay = 1; bay <= 3; bay++) {
      const base = (bay - 1) * 6;
      const layout = [
        { num: base + 1, code: 'LB', name: 'Lower Berth (2AC)', side: 'MAIN_L', tier: 0, charging: true, window: true },
        { num: base + 2, code: 'UB', name: 'Upper Berth (2AC)', side: 'MAIN_L', tier: 2, charging: true, window: false },
        { num: base + 3, code: 'LB', name: 'Lower Berth (2AC)', side: 'MAIN_R', tier: 0, charging: true, window: true },
        { num: base + 4, code: 'UB', name: 'Upper Berth (2AC)', side: 'MAIN_R', tier: 2, charging: true, window: false },
        { num: base + 5, code: 'SL', name: 'Side Lower (2AC)', side: 'SIDE', tier: 0, charging: true, window: true },
        { num: base + 6, code: 'SU', name: 'Side Upper (2AC)', side: 'SIDE', tier: 2, charging: false, window: false }
      ];

      layout.forEach((s, idx) => {
        const isBooked = (bay === 1 && s.num === 2) || (bay === 2 && s.num === 9) || (bay === 3 && s.num === 17);
        const isQuota = !isBooked && (s.num === 3 || s.num === 7);
        const paxObj = isBooked ? samplePassengers[(s.num + idx) % samplePassengers.length] : null;

        berths.push({
          id: `${coachCode}-${s.num}`,
          displayNum: s.num,
          coach: coachCode,
          coachClass: '2A',
          bay,
          bayLabel: `Bay ${bay} (Curtained)`,
          code: s.code,
          name: s.name,
          side: s.side,
          tier: s.tier,
          charging: s.charging,
          window: s.window,
          comfortNote: `Wider plush 2AC cushion • Pleated privacy curtains • ${s.charging ? '230V + USB + reading lamp' : 'Personal reading lamp'} • ${bay === 1 ? 'Quiet bay away from door' : 'Smooth LHB ride'}`,
          status: isBooked ? 'BOOKED' : isQuota ? 'QUOTA' : 'AVAILABLE',
          quota: isQuota ? 'Ladies / Senior Priority' : 'General',
          pax: paxObj,
          pnr: paxObj ? paxObj.pnr : null,
          boarded: isBooked
        });
      });
    }
  } else {
    // Authentic LHB 1A (First AC): Cabin A (4 berths), Cabin B (4 berths), Coupé C (2 berths)
    const cabins = [
      { bay: 1, label: 'Cabin A (4-Berth Private)', nums: [1, 2, 3, 4], sides: ['MAIN_L', 'MAIN_L', 'MAIN_R', 'MAIN_R'] },
      { bay: 2, label: 'Cabin B (4-Berth Private)', nums: [5, 6, 7, 8], sides: ['MAIN_L', 'MAIN_L', 'MAIN_R', 'MAIN_R'] },
      { bay: 3, label: 'Coupé C (2-Berth Private)', nums: [9, 10], sides: ['MAIN_L', 'MAIN_L'] }
    ];

    cabins.forEach(c => {
      c.nums.forEach((num, i) => {
        const isLower = num % 2 === 1;
        const isBooked = num === 2 || num === 6;
        const paxObj = isBooked ? samplePassengers[num % samplePassengers.length] : null;
        berths.push({
          id: `${coachCode}-${num}`,
          displayNum: num,
          coach: coachCode,
          coachClass: '1A',
          bay: c.bay,
          bayLabel: c.label,
          code: isLower ? 'LB' : 'UB',
          name: isLower ? 'First AC Lower Suite' : 'First AC Upper Suite',
          side: c.sides[i],
          tier: isLower ? 0 : 2,
          charging: true,
          window: isLower,
          comfortNote: 'Lockable sliding wood-accent door • Plush carpeted floor • Dedicated attendant call bell • 230V + USB socket',
          status: isBooked ? 'BOOKED' : 'AVAILABLE',
          quota: 'General',
          pax: paxObj,
          pnr: paxObj ? paxObj.pnr : null,
          boarded: isBooked
        });
      });
    });
  }

  return berths;
}

// ============================================================================
// 3. PROCEDURAL PBR CANVAS TEXTURE SUITE (DIFFUSE + BUMP MAPS)
// ============================================================================

function createRexinePBRMaps(baseHex, stitchHex) {
  // Diffuse texture with realistic stitched rexine grain
  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = 256;
  diffCanvas.height = 256;
  const dCtx = diffCanvas.getContext('2d');

  dCtx.fillStyle = baseHex;
  dCtx.fillRect(0, 0, 256, 256);

  // Subtle organic leatherette grain dots
  for (let i = 0; i < 1600; i++) {
    const x = (i * 73) % 256;
    const y = (i * 137) % 256;
    dCtx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.045)';
    dCtx.fillRect(x, y, 2, 2);
  }

  // Channel & diamond quilted stitching seams
  dCtx.strokeStyle = stitchHex;
  dCtx.lineWidth = 1.6;
  dCtx.globalAlpha = 0.28;
  for (let i = -256; i < 512; i += 32) {
    dCtx.beginPath();
    dCtx.moveTo(i, 0);
    dCtx.lineTo(i + 256, 256);
    dCtx.stroke();

    dCtx.beginPath();
    dCtx.moveTo(i + 256, 0);
    dCtx.lineTo(i, 256);
    dCtx.stroke();
  }

  // Matching Bump Map for physical stitch relief
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 256;
  bumpCanvas.height = 256;
  const bCtx = bumpCanvas.getContext('2d');
  bCtx.fillStyle = '#B0B0B0';
  bCtx.fillRect(0, 0, 256, 256);
  bCtx.strokeStyle = '#303030';
  bCtx.lineWidth = 2.5;
  for (let i = -256; i < 512; i += 32) {
    bCtx.beginPath();
    bCtx.moveTo(i, 0);
    bCtx.lineTo(i + 256, 256);
    bCtx.stroke();
    bCtx.beginPath();
    bCtx.moveTo(i + 256, 0);
    bCtx.lineTo(i, 256);
    bCtx.stroke();
  }

  const map = new THREE.CanvasTexture(diffCanvas);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(3, 2);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(3, 2);

  return { map, bumpMap };
}

function createSpeckledFloorTexture(isCarpet = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = isCarpet ? '#6B1D2A' : '#64748B';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 2400; i++) {
    const x = (i * 97) % 256;
    const y = (i * 53) % 256;
    if (isCarpet) {
      ctx.fillStyle = i % 3 === 0 ? 'rgba(255,215,170,0.08)' : 'rgba(0,0,0,0.12)';
      ctx.fillRect(x, y, 2, 2);
    } else {
      ctx.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,0.22)' : i % 3 === 1 ? 'rgba(15,23,42,0.25)' : 'rgba(203,213,225,0.2)';
      ctx.fillRect(x, y, 2, 2);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 10);
  return tex;
}

function createWoodGrainTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#6D4328';
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 3) {
    ctx.fillStyle = y % 6 === 0 ? 'rgba(40,20,10,0.22)' : 'rgba(180,120,75,0.14)';
    ctx.fillRect(0, y, 256, 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createBerthPlaqueTexture(berth, isSelected) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 112;
  const ctx = canvas.getContext('2d');

  // Crisp metallic Indian Railways berth plaque
  ctx.fillStyle = isSelected ? '#065AF3' : '#0F172A';
  ctx.fillRect(0, 0, 256, 112);

  const stripe = isSelected
    ? '#53B2FE'
    : berth.status === 'BOOKED'
    ? '#94A3B8'
    : berth.status === 'QUOTA'
    ? '#F59E0B'
    : '#00A16B';
  ctx.fillStyle = stripe;
  ctx.fillRect(0, 0, 14, 112);

  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 252, 108);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 42px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${berth.displayNum} ${berth.code}`, 28, 56);

  ctx.fillStyle = isSelected ? '#DBEAFE' : '#CBD5E1';
  ctx.font = '600 20px Inter, system-ui, sans-serif';
  const sub = isSelected
    ? 'YOUR CHOICE'
    : berth.status === 'BOOKED'
    ? 'BOOKED'
    : berth.status === 'QUOTA'
    ? 'SR / LADIES'
    : 'AVAILABLE';
  ctx.fillText(sub, 28, 92);

  return new THREE.CanvasTexture(canvas);
}

// ============================================================================
// 4. INTERACTIVE INDIAN RAILWAYS WIDGET: LIVE RAIL CORRIDOR & SIGNAL DECK
// ============================================================================

const CORRIDOR_ROUTES = [
  {
    id: '12951',
    shortLabel: '12951 Mumbai Rajdhani',
    routeCode: 'MMCT → NDLS',
    locoBadge: 'WAP-7 • 22 Coaches',
    maxSpeed: 130,
    startKm: 412,
    scenery: 'PLAINS_ARAVALLI',
    livery: {
      locoBody: '#F8FAFC',
      locoStripe: '#C81E1E',
      locoRoof: '#334155',
      coachBody: '#B91C1C',
      coachBand: '#94A3B8',
      coachRoof: '#64748B',
      isAero: false
    },
    stationTrail: 'Kota Jn → Sawai Madhopur',
    coaches: [
      { code: 'LOCO', label: 'WAP-7', spec: 'WAP-7 Electric Locomotive • 6,350 HP 3-Phase IGBT • Regenerative Braking • Max 140 km/h' },
      { code: 'H1', label: 'H1', spec: 'H1 • LHB First AC (LWFAC) • 24 Berths • Lockable 4-Berth Cabins & 2-Berth Coupés' },
      { code: 'A1', label: 'A1', spec: 'A1 • LHB AC 2-Tier (LWACCW) • 52 Berths • Pleated Privacy Curtains & Reading Lamps' },
      { code: 'B1', label: 'B1', spec: 'B1 • LHB AC 3-Tier (LWACCN) • 72 Berths • Fiat Eurofima Bogie • Bio-Vacuum Toilets' },
      { code: 'B2', label: 'B2', spec: 'B2 • LHB AC 3-Tier (LWACCN) • 72 Berths • 230V + USB Charging • Automatic Plug Doors' },
      { code: 'PC', label: 'PC', spec: 'PC • LHB Hot Buffet Pantry Car • Fresh IRCTC Onboard Kitchen & Beverage Service' }
    ]
  },
  {
    id: '22436',
    shortLabel: '22436 Vande Bharat',
    routeCode: 'NDLS → BSB',
    locoBadge: 'EMU-16 • 16 Coaches',
    maxSpeed: 160,
    startKm: 286,
    scenery: 'GANGETIC_EXPRESS',
    livery: {
      locoBody: '#F8FAFC',
      locoStripe: '#EA580C',
      locoRoof: '#0284C7',
      coachBody: '#F1F5F9',
      coachBand: '#EA580C',
      coachRoof: '#1E3A8A',
      isAero: true
    },
    stationTrail: 'Kanpur Central → Prayagraj Jn',
    coaches: [
      { code: 'DTC', label: 'DTC', spec: 'DTC • Aerodynamic Driving Trailer Coach • KAVACH ATP Safety • 0–100 km/h in 52 sec' },
      { code: 'E1', label: 'E1', spec: 'E1 • Executive Chair Car • 52 Rotating 180° Reclining Seats • Panoramic Glazing' },
      { code: 'C1', label: 'C1', spec: 'C1 • AC Chair Car • 78 Ergonomic Seats • Sensor Sliding Doors & Passenger Info Display' },
      { code: 'C2', label: 'C2', spec: 'C2 • AC Chair Car • Distributed Traction Underframe • Low-Noise Suspended Bogies' },
      { code: 'C3', label: 'C3', spec: 'C3 • AC Chair Car • Divyangjan Accessible Washroom • Individual Reading Lights' },
      { code: 'PC', label: 'MINI', spec: 'MINI • Onboard Mini-Pantry • Convection Ovens & Deep-Chill Beverage Dispensers' }
    ]
  },
  {
    id: '12051',
    shortLabel: '12051 Konkan Jan Shatabdi',
    routeCode: 'CSMT → MAO',
    locoBadge: 'WAP-7 • 18 Coaches',
    maxSpeed: 120,
    startKm: 194,
    scenery: 'KONKAN_GHATS',
    livery: {
      locoBody: '#E2E8F0',
      locoStripe: '#1D4ED8',
      locoRoof: '#1E293B',
      coachBody: '#1D4ED8',
      coachBand: '#CBD5E1',
      coachRoof: '#475569',
      isAero: false
    },
    stationTrail: 'Chiplun → Ratnagiri Viaduct',
    coaches: [
      { code: 'LOCO', label: 'WAP-7', spec: 'WAP-7 Electric Loco • Konkan Electrified Ghat Section • High-Adhesion Traction Control' },
      { code: 'EV1', label: 'EV1', spec: 'EV1 • Vistadome Glass-Roof Coach • 44 Rotating Seats • Viewing Deck for Western Ghats' },
      { code: 'C1', label: 'C1', spec: 'C1 • LHB AC Chair Car • Wide Monsoon-Sealed Tinted Windows & Snack Trays' },
      { code: 'D1', label: 'D1', spec: 'D1 • LHB Second Sitting (2S) • 108 Reserved Seats • High-Ventilation Louvered Windows' },
      { code: 'D2', label: 'D2', spec: 'D2 • LHB Second Sitting (2S) • Anti-Climbing Centre Buffer Coupler • Bio-Toilets' },
      { code: 'PC', label: 'PC', spec: 'PC • Konkan Refreshment Car • Hot Vada Pav, Kanda Poha & Fresh Filter Coffee' }
    ]
  },
  {
    id: '12259',
    shortLabel: '12259 Sealdah Duronto',
    routeCode: 'SDAH → BKN',
    locoBadge: 'WAP-7 • 21 Coaches',
    maxSpeed: 130,
    startKm: 648,
    scenery: 'THAR_DESERT',
    livery: {
      locoBody: '#FEF3C7',
      locoStripe: '#15803D',
      locoRoof: '#0F172A',
      coachBody: '#FDE047',
      coachBand: '#16A34A',
      coachRoof: '#1E40AF',
      isAero: false
    },
    stationTrail: 'Churu → Bikaner Jn Corridor',
    coaches: [
      { code: 'LOCO', label: 'WAP-7', spec: 'WAP-7 Non-Stop Express Loco • Long-Haul 130 km/h Sustained Corridor Cruising' },
      { code: 'H1', label: 'H1', spec: 'H1 • Duronto First AC • Plush Carpeted Cabins • Personal Attendant Call Bell' },
      { code: 'A1', label: 'A1', spec: 'A1 • Duronto AC 2-Tier • Wide Cushioned Berths • Complimentary Linen & Blankets' },
      { code: 'B1', label: 'B1', spec: 'B1 • Duronto AC 3-Tier (LWACCN) • 72 Berths • Dust-Sealed Desert Air-Conditioning' },
      { code: 'B2', label: 'B2', spec: 'B2 • Duronto AC 3-Tier (LWACCN) • 72 Berths • Fiat Eurofima Bogie • Bio-Vacuum Toilets' },
      { code: 'PC', label: 'PC', spec: 'PC • Duronto Hot Pantry Car • Full-Course Regional Meals Included with Ticket' }
    ]
  }
];

const SIGNAL_ASPECTS = [
  { id: 'GREEN', label: 'Green', aspect: 'Proceed', targetSpeed: null, dot: '#22C55E', ring: 'border-emerald-400/70 bg-emerald-500/20 text-emerald-200' },
  { id: 'DOUBLE_YELLOW', label: '2× Yellow', aspect: 'Attention', targetSpeed: 85, dot: '#FACC15', ring: 'border-amber-400/70 bg-amber-500/20 text-amber-200' },
  { id: 'YELLOW', label: 'Yellow', aspect: 'Caution', targetSpeed: 45, dot: '#F59E0B', ring: 'border-orange-400/70 bg-orange-500/20 text-orange-200' },
  { id: 'RED', label: 'Red', aspect: 'Danger / Stop', targetSpeed: 0, dot: '#EF4444', ring: 'border-red-400/70 bg-red-500/20 text-red-200' }
];

const LiveRailCorridorDeck = () => {
  const [routeId, setRouteId] = useState('12951');
  const [timeOfDay, setTimeOfDay] = useState('DAY'); // 'DAWN' | 'DAY' | 'NIGHT'
  const [signalAspect, setSignalAspect] = useState('GREEN'); // 'GREEN' | 'DOUBLE_YELLOW' | 'YELLOW' | 'RED'
  const [selectedCoachIdx, setSelectedCoachIdx] = useState(3);
  const [liveSpeed, setLiveSpeed] = useState(130);
  const [currentKm, setCurrentKm] = useState(412);

  const canvasRef = useRef(null);
  const simRef = useRef({
    speed: 130,
    targetSpeed: 130,
    scrollX: 0,
    kmProgress: 412,
    wheelAngle: 0
  });

  const activeRoute = useMemo(
    () => CORRIDOR_ROUTES.find(r => r.id === routeId) || CORRIDOR_ROUTES[0],
    [routeId]
  );

  // Sync target speed & km marker when route or signal aspect changes
  useEffect(() => {
    const aspectObj = SIGNAL_ASPECTS.find(a => a.id === signalAspect);
    simRef.current.targetSpeed =
      aspectObj && aspectObj.targetSpeed !== null ? aspectObj.targetSpeed : activeRoute.maxSpeed;
  }, [signalAspect, activeRoute]);

  useEffect(() => {
    simRef.current.kmProgress = activeRoute.startKm;
    setCurrentKm(activeRoute.startKm);
    setSelectedCoachIdx(3);
  }, [activeRoute]);

  // High-FPS Animated Broad-Gauge Railway Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let lastTick = performance.now();
    let uiSyncCounter = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth || 540;
      const h = 196;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const drawFrame = (now) => {
      animId = requestAnimationFrame(drawFrame);
      const dt = Math.min((now - lastTick) / 1000, 0.05);
      lastTick = now;

      const sim = simRef.current;
      // Smooth realistic train acceleration & pneumatic braking curve
      const accelRate = sim.targetSpeed < sim.speed ? 48 : 34;
      const diff = sim.targetSpeed - sim.speed;
      if (Math.abs(diff) < 0.4) {
        sim.speed = sim.targetSpeed;
      } else {
        sim.speed += Math.sign(diff) * Math.min(Math.abs(diff), accelRate * dt);
      }

      const pxPerSec = sim.speed * 2.6;
      sim.scrollX += pxPerSec * dt;
      sim.wheelAngle += (pxPerSec * dt) / 8;
      sim.kmProgress += (sim.speed * dt) / 140;

      uiSyncCounter++;
      if (uiSyncCounter % 6 === 0) {
        setLiveSpeed(Math.round(sim.speed));
        setCurrentKm(Math.floor(sim.kmProgress));
      }

      const w = canvas.clientWidth || 540;
      const h = 196;
      const trackY = 152;
      const isNight = timeOfDay === 'NIGHT';
      const isDawn = timeOfDay === 'DAWN';

      // 1. SKY GRADIENT (Tailored to Time of Day + Route)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, trackY);
      if (isNight) {
        skyGrad.addColorStop(0, '#040B1A');
        skyGrad.addColorStop(1, '#0F2547');
      } else if (isDawn) {
        skyGrad.addColorStop(0, '#1E2952');
        skyGrad.addColorStop(0.55, '#9A3412');
        skyGrad.addColorStop(1, '#FDBA74');
      } else if (activeRoute.scenery === 'THAR_DESERT') {
        skyGrad.addColorStop(0, '#1D4ED8');
        skyGrad.addColorStop(0.6, '#F59E0B');
        skyGrad.addColorStop(1, '#FDE68A');
      } else if (activeRoute.scenery === 'KONKAN_GHATS') {
        skyGrad.addColorStop(0, '#334155');
        skyGrad.addColorStop(0.6, '#64748B');
        skyGrad.addColorStop(1, '#CBD5E1');
      } else {
        skyGrad.addColorStop(0, '#0369A1');
        skyGrad.addColorStop(0.65, '#38BDF8');
        skyGrad.addColorStop(1, '#E0F2FE');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, trackY);

      // Stars & Moon at Night, Sun Glow at Dawn/Day
      if (isNight) {
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        for (let i = 0; i < 26; i++) {
          const sx = ((i * 89 + 21) % w);
          const sy = ((i * 43 + 11) % 72) + 8;
          ctx.fillRect(sx, sy, i % 3 === 0 ? 2 : 1.2, i % 3 === 0 ? 2 : 1.2);
        }
        ctx.beginPath();
        ctx.arc(w - 58, 30, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#FEF3C7';
        ctx.fill();
      } else if (isDawn || activeRoute.scenery === 'THAR_DESERT') {
        ctx.beginPath();
        ctx.arc(w - 75, 42, 16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
        ctx.fill();
      }

      // 2. ROUTE-SPECIFIC PARALLAX SCENERY
      const farOffset = (sim.scrollX * 0.14) % 240;
      const midOffset = (sim.scrollX * 0.35) % 200;

      if (activeRoute.scenery === 'THAR_DESERT') {
        // Rolling Golden Thar Desert Dunes
        ctx.fillStyle = isNight ? '#3B2F1E' : isDawn ? '#B45309' : '#D97706';
        ctx.beginPath();
        ctx.moveTo(0, trackY);
        for (let x = -240; x <= w + 240; x += 120) {
          const dx = x - farOffset;
          ctx.quadraticCurveTo(dx + 60, trackY - 54, dx + 120, trackY - 14);
        }
        ctx.lineTo(w, trackY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = isNight ? '#261D12' : '#F59E0B';
        ctx.beginPath();
        ctx.moveTo(0, trackY);
        for (let x = -200; x <= w + 200; x += 100) {
          const dx = x - midOffset;
          ctx.quadraticCurveTo(dx + 50, trackY - 28, dx + 100, trackY - 4);
        }
        ctx.lineTo(w, trackY);
        ctx.closePath();
        ctx.fill();
      } else if (activeRoute.scenery === 'KONKAN_GHATS') {
        // Misty Western Ghats Hills + Waterfall + Stone Viaduct Arches
        ctx.fillStyle = isNight ? '#0F2922' : '#1E4638';
        ctx.beginPath();
        ctx.moveTo(0, trackY);
        for (let x = -240; x <= w + 240; x += 120) {
          const dx = x - farOffset;
          ctx.lineTo(dx + 55, trackY - 76);
          ctx.lineTo(dx + 120, trackY - 18);
        }
        ctx.lineTo(w, trackY);
        ctx.closePath();
        ctx.fill();

        // Shimmering Ghat Waterfalls on hill slopes
        ctx.fillStyle = isNight ? 'rgba(148,163,184,0.35)' : 'rgba(224,242,254,0.75)';
        for (let x = -240; x <= w + 240; x += 240) {
          const wx = x - farOffset + 54;
          ctx.fillRect(wx, trackY - 72, 4, 52);
        }

        // Foreground Viaduct Arches below Track
        ctx.fillStyle = isNight ? '#1E293B' : '#475569';
        ctx.fillRect(0, trackY + 6, w, h - trackY);
      } else if (activeRoute.scenery === 'GANGETIC_EXPRESS') {
        // Gangetic River Bridge Span & Distant Skyline
        ctx.fillStyle = isNight ? '#132642' : '#0284C7';
        ctx.fillRect(0, trackY - 16, w, 16);

        ctx.strokeStyle = isNight ? '#334155' : '#94A3B8';
        ctx.lineWidth = 2;
        for (let x = -200; x <= w + 200; x += 65) {
          const bx = x - midOffset;
          ctx.beginPath();
          ctx.moveTo(bx, trackY - 12);
          ctx.lineTo(bx + 32, trackY - 48);
          ctx.lineTo(bx + 65, trackY - 12);
          ctx.stroke();
        }
      } else {
        // Plains & Aravalli Hills (Mumbai Rajdhani)
        ctx.fillStyle = isNight ? '#112236' : isDawn ? '#475569' : '#3B7A57';
        ctx.beginPath();
        ctx.moveTo(0, trackY);
        for (let x = -240; x <= w + 240; x += 120) {
          const dx = x - farOffset;
          ctx.quadraticCurveTo(dx + 60, trackY - 58, dx + 120, trackY - 10);
        }
        ctx.lineTo(w, trackY);
        ctx.closePath();
        ctx.fill();

        // Lush Agricultural Plains Band
        ctx.fillStyle = isNight ? '#0B1D17' : '#2E6F40';
        ctx.fillRect(0, trackY - 16, w, 16);
      }

      // 3. OVERHEAD EQUIPMENT (OHE) CATENARY WIRES & PASSING MASTS
      ctx.strokeStyle = isNight ? 'rgba(148,163,184,0.4)' : 'rgba(30,41,59,0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 72);
      ctx.lineTo(w, 72);
      ctx.moveTo(0, 82);
      ctx.lineTo(w, 82);
      ctx.stroke();

      const oheSpacing = 175;
      const oheOffset = sim.scrollX % oheSpacing;
      ctx.strokeStyle = isNight ? '#475569' : '#334155';
      for (let x = w + oheSpacing - oheOffset; x > -40; x -= oheSpacing) {
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, 64);
        ctx.lineTo(x, trackY);
        ctx.stroke();
        // Cantilever Bracket Arm
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x, 72);
        ctx.lineTo(x + 22, 82);
        ctx.moveTo(x, 82);
        ctx.lineTo(x + 22, 82);
        ctx.stroke();
      }

      // 4. BROAD-GAUGE BALLAST, SLEEPERS & STEEL RAILS
      ctx.fillStyle = isNight ? '#1E293B' : '#475569';
      ctx.fillRect(0, trackY, w, h - trackY);

      // Crushed Stone Ballast Texture Dots
      ctx.fillStyle = isNight ? '#334155' : '#64748B';
      const sleeperSpace = 18;
      const sleeperOff = sim.scrollX % sleeperSpace;
      for (let x = w + sleeperSpace - sleeperOff; x > -20; x -= sleeperSpace) {
        ctx.fillRect(x, trackY + 4, 7, 10);
      }

      // Gleaming Broad-Gauge Steel Rail
      ctx.fillStyle = isNight ? '#94A3B8' : '#E2E8F0';
      ctx.fillRect(0, trackY, w, 3.5);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, trackY + 3.5, w, 2);

      // Authentic Yellow-and-Black Indian Railways Kilometre Stone
      const kmSpacing = 280;
      const kmOff = sim.scrollX % kmSpacing;
      const kmX = w + 60 - kmOff;
      if (kmX > -30 && kmX < w + 30) {
        ctx.fillStyle = '#FACC15';
        ctx.fillRect(kmX, trackY + 14, 34, 20);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(kmX, trackY + 14, 34, 6);
        ctx.font = 'bold 9px Lato, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`KM ${Math.floor(sim.kmProgress)}`, kmX + 17, trackY + 30);
      }

      // 5. SIDE-PROFILE ANIMATED INDIAN RAILWAYS TRAIN
      const liv = activeRoute.livery;
      const locoX = Math.min(w - 135, Math.max(w * 0.56, 220));
      const trainY = trackY - 40;
      const coachW = 94;
      const coachGap = 5;

      // Draw Trailing Coaches (left of locomotive)
      for (let c = 1; c <= 4; c++) {
        const cx = locoX - c * (coachW + coachGap);
        if (cx + coachW < -10) continue;

        // Vestibule Bellows Connector
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(cx + coachW, trainY + 6, coachGap, 26);

        // Coach Body
        ctx.fillStyle = liv.coachBody;
        ctx.fillRect(cx, trainY, coachW, 34);

        // Roof & Livery Stripe Band
        ctx.fillStyle = liv.coachRoof;
        ctx.fillRect(cx, trainY - 3, coachW, 5);
        ctx.fillStyle = liv.coachBand;
        ctx.fillRect(cx, trainY + 22, coachW, 6);

        // Coach Windows (Lit Warm Golden at Night / Dawn)
        ctx.fillStyle = isNight ? '#FDE68A' : isDawn ? '#FEF08A' : '#1E293B';
        for (let wi = 0; wi < 6; wi++) {
          ctx.fillRect(cx + 8 + wi * 13.5, trainY + 7, 10, 10);
        }

        // Bogies & Spinning Wheelsets
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(cx + 10, trainY + 34, 22, 5);
        ctx.fillRect(cx + coachW - 32, trainY + 34, 22, 5);
        [cx + 15, cx + 27, cx + coachW - 27, cx + coachW - 15].forEach(wx => {
          ctx.beginPath();
          ctx.arc(wx, trackY - 3, 4.2, 0, Math.PI * 2);
          ctx.fillStyle = '#334155';
          ctx.fill();
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }

      // Draw Locomotive / Vande Bharat Aerodynamic Nose
      const locoW = 86;
      if (liv.isAero) {
        // Vande Bharat Sleek Sloped Nose
        ctx.fillStyle = liv.locoBody;
        ctx.beginPath();
        ctx.moveTo(locoX, trainY);
        ctx.lineTo(locoX + locoW - 24, trainY);
        ctx.quadraticCurveTo(locoX + locoW + 4, trainY + 6, locoX + locoW + 8, trainY + 34);
        ctx.lineTo(locoX, trainY + 34);
        ctx.closePath();
        ctx.fill();

        // Saffron/Blue Speed Ribbon
        ctx.fillStyle = liv.locoStripe;
        ctx.fillRect(locoX, trainY + 21, locoW - 4, 6);
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.moveTo(locoX + locoW - 24, trainY + 5);
        ctx.lineTo(locoX + locoW - 5, trainY + 16);
        ctx.lineTo(locoX + locoW - 24, trainY + 16);
        ctx.closePath();
        ctx.fill();
      } else {
        // Iconic Indian Railways WAP-7 Electric Locomotive
        ctx.fillStyle = liv.locoBody;
        ctx.fillRect(locoX, trainY - 2, locoW, 36);
        ctx.fillStyle = liv.locoRoof;
        ctx.fillRect(locoX, trainY - 5, locoW, 5);
        ctx.fillStyle = liv.locoStripe;
        ctx.fillRect(locoX, trainY + 17, locoW, 8);
        // Cab Windshield
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(locoX + locoW - 18, trainY + 3, 14, 11);
        ctx.fillRect(locoX + 10, trainY + 6, 12, 8);
      }

      // Raised Pantograph touching OHE Wire
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(locoX + 24, trainY - 5);
      ctx.lineTo(locoX + 14, trainY - 18);
      ctx.lineTo(locoX + 28, 82);
      ctx.moveTo(locoX + 20, 82);
      ctx.lineTo(locoX + 36, 82);
      ctx.stroke();

      // Loco Twin-Beam Headlight Cone (Active at Night / Dawn)
      if (isNight || isDawn) {
        const beamGrad = ctx.createLinearGradient(locoX + locoW, trainY + 18, locoX + locoW + 145, trainY + 28);
        beamGrad.addColorStop(0, 'rgba(254, 249, 195, 0.65)');
        beamGrad.addColorStop(1, 'rgba(254, 249, 195, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(locoX + locoW - 2, trainY + 14);
        ctx.lineTo(locoX + locoW + 145, trainY - 6);
        ctx.lineTo(locoX + locoW + 145, trackY + 2);
        ctx.lineTo(locoX + locoW - 2, trainY + 26);
        ctx.closePath();
        ctx.fill();
      }

      // Loco Wheels
      [locoX + 14, locoX + 28, locoX + 54, locoX + 68].forEach(wx => {
        ctx.beginPath();
        ctx.arc(wx, trackY - 3, 4.6, 0, Math.PI * 2);
        ctx.fillStyle = '#1E293B';
        ctx.fill();
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1.1;
        ctx.stroke();
      });

      // 6. TRACKSIDE 4-ASPECT INDIAN RAILWAYS COLOUR LIGHT SIGNAL MAST
      const sigX = w - 34;
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(sigX - 2, 74, 4, trackY - 70);
      // Black Signal Hood Housing with White Border
      ctx.fillStyle = '#090D16';
      ctx.fillRect(sigX - 10, 72, 20, 50);
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(sigX - 10, 72, 20, 50);

      // 4 Signal Lenses (Top to Bottom: Upper Yellow, Green, Lower Yellow, Red)
      const lenses = [
        { y: 80, on: signalAspect === 'DOUBLE_YELLOW', color: '#FACC15' },
        { y: 92, on: signalAspect === 'GREEN', color: '#22C55E' },
        { y: 104, on: signalAspect === 'YELLOW' || signalAspect === 'DOUBLE_YELLOW', color: '#F59E0B' },
        { y: 116, on: signalAspect === 'RED', color: '#EF4444' }
      ];
      lenses.forEach(l => {
        ctx.beginPath();
        ctx.arc(sigX, l.y, 4.2, 0, Math.PI * 2);
        ctx.fillStyle = l.on ? l.color : '#1E293B';
        ctx.fill();
        if (l.on) {
          ctx.beginPath();
          ctx.arc(sigX, l.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = `${l.color}44`;
          ctx.fill();
        }
      });

      // Red Brake Hold Indicator Overlay when halted at Red Signal
      if (signalAspect === 'RED' && sim.speed < 2) {
        ctx.fillStyle = 'rgba(220, 38, 38, 0.9)';
        ctx.fillRect(12, 12, 178, 22);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px Lato, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('RED SIGNAL • WAITING FOR CLEARANCE', 20, 26);
      } else if (sim.targetSpeed < sim.speed - 2) {
        ctx.fillStyle = 'rgba(217, 119, 6, 0.88)';
        ctx.fillRect(12, 12, 122, 22);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px Lato, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('BRAKES APPLIED', 20, 26);
      }
    };

    animId = requestAnimationFrame(drawFrame);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [activeRoute, timeOfDay, signalAspect]);

  const activeCoachSpec = activeRoute.coaches[selectedCoachIdx] || activeRoute.coaches[0];

  return (
    <div className="bg-[#081A31]/90 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 sm:p-4 shadow-2xl space-y-3">
      {/* 1. HEADER STRIP */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#D9381E]/90 flex items-center justify-center">
            <Train className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-extrabold text-white leading-tight">
              Live Rail Corridor &amp; Signal Deck
            </div>
            <div className="text-[10px] text-sky-200/90 tabular-nums">
              {activeRoute.routeCode} • {activeRoute.stationTrail} • KM {currentKm}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs tabular-nums">
          <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 font-bold text-white flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#53B2FE]" />
            <span>{liveSpeed} km/h</span>
          </span>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-400/25 text-sky-100 font-semibold text-[11px]">
            {activeRoute.locoBadge}
          </span>
        </div>
      </div>

      {/* 2. INTERACTIVE ROUTE SELECTOR PILLS (4 ICONIC INDIAN RAILWAYS ROUTES) */}
      <div className="flex flex-wrap gap-1.5">
        {CORRIDOR_ROUTES.map(r => {
          const active = r.id === routeId;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setRouteId(r.id)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                active
                  ? 'bg-[#065AF3] border-[#53B2FE] text-white shadow-sm'
                  : 'bg-white/5 border-white/15 text-sky-100 hover:bg-white/15'
              }`}
            >
              {r.shortLabel}
            </button>
          );
        })}
      </div>

      {/* 3. ANIMATED BROAD-GAUGE TRACK & SCENERY CANVAS STAGE */}
      <div className="relative rounded-xl overflow-hidden border border-white/15 bg-[#040B1A]">
        <canvas ref={canvasRef} className="block w-full" />

        {/* Time-of-Day Pill Toggle Overlay (Top Right) */}
        <div className="absolute top-2.5 right-12 flex items-center bg-slate-950/75 backdrop-blur-sm border border-white/15 rounded-full p-0.5 text-[10px] font-bold">
          {[
            { id: 'DAWN', label: 'Dawn' },
            { id: 'DAY', label: 'Day' },
            { id: 'NIGHT', label: 'Night' }
          ].map(tod => (
            <button
              key={tod.id}
              type="button"
              onClick={() => setTimeOfDay(tod.id)}
              className={`px-2.5 py-0.5 rounded-full transition cursor-pointer ${
                timeOfDay === tod.id
                  ? 'bg-[#53B2FE] text-slate-950'
                  : 'text-sky-100 hover:text-white'
              }`}
            >
              {tod.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. INTERACTIVE 4-ASPECT INDIAN RAILWAYS COLOUR LIGHT SIGNAL CONTROL */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
        <span className="text-[11px] font-bold text-sky-100">
          4-Aspect Track Signal:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {SIGNAL_ASPECTS.map(sig => {
            const active = signalAspect === sig.id;
            return (
              <button
                key={sig.id}
                type="button"
                onClick={() => setSignalAspect(sig.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                  active
                    ? sig.ring
                    : 'bg-slate-900/60 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: sig.dot }}
                />
                <span>{sig.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. INTERACTIVE RAKE COACH INSPECTOR STRIP */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <span className="text-[10px] font-bold uppercase text-sky-200/80 shrink-0 mr-1">
            Inspect Rake:
          </span>
          {activeRoute.coaches.map((c, idx) => {
            const isSel = idx === selectedCoachIdx;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => setSelectedCoachIdx(idx)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition cursor-pointer shrink-0 tabular-nums ${
                  isSel
                    ? 'bg-white text-[#051322] border-white shadow-sm'
                    : 'bg-white/10 text-sky-100 border-white/15 hover:bg-white/20'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="px-3 py-2 rounded-lg bg-slate-950/60 border border-white/10 text-[11px] text-sky-100 leading-snug flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-[#53B2FE] shrink-0 mt-0.5" />
          <span>{activeCoachSpec.spec}</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. ULTRA-DETAILED HIGH-LOD 3D LHB COACH INTERIOR VIEWER (THREE.JS LOD + PBR)
// ============================================================================

const UltraDetailLhbCoach3D = ({
  berths,
  selectedIds,
  onSelectBerth,
  cameraMode,
  sitBerthId,
  nightMode,
  qualityMode,
  coachClass,
  onLodChange
}) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  const berthRefsMap = useRef(new Map());
  const middleBerthPivotsRef = useRef([]);
  const blanketsRef = useRef([]);
  const curtainsRef = useRef([]);
  const readingLampsRef = useRef([]);
  const sceneryMastsRef = useRef([]);
  const ceilingGroupRef = useRef(null);
  const lightsRef = useRef({});
  const skyMeshRef = useRef(null);

  // Smooth damped spherical camera state
  const sphericalRef = useRef({ radius: 7.8, theta: 0.62, phi: 1.08 });
  const targetLookAtRef = useRef(new THREE.Vector3(0, 1.15, 0));
  const currentLookAtRef = useRef(new THREE.Vector3(0, 1.15, 0));
  const desiredSphericalRef = useRef(null);
  const sitPovModeRef = useRef(false);
  const sitCamPosRef = useRef(new THREE.Vector3());

  const isDraggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const nightModeRef = useRef(nightMode);
  const lastReportedLodRef = useRef('LOD 1 • Bay Detail');

  const [hoveredBerthId, setHoveredBerthId] = useState(null);

  useEffect(() => {
    nightModeRef.current = nightMode;
  }, [nightMode]);

  // Apply Camera Mode Presets + Sit-On-Berth 1st-Person POV
  useEffect(() => {
    const bayZCenters = [-3.3, 0, 3.3];

    if (cameraMode === 'SIT_POV' && sitBerthId) {
      const b = berths.find(item => item.id === sitBerthId) || berths[0];
      if (b) {
        sitPovModeRef.current = true;
        const zBay = bayZCenters[b.bay - 1] ?? 0;
        const yEye = [0.92, 1.65, 2.38][b.tier] ?? 0.92;
        if (b.side === 'SIDE') {
          sitCamPosRef.current.set(1.18, yEye, zBay - 0.55);
          targetLookAtRef.current.set(-1.35, yEye - 0.05, zBay + 0.35);
        } else {
          const zSeat = b.side === 'MAIN_L' ? zBay - 1.15 : zBay + 1.15;
          const zLook = b.side === 'MAIN_L' ? zBay + 1.2 : zBay - 1.2;
          sitCamPosRef.current.set(-1.12, yEye, zSeat);
          targetLookAtRef.current.set(-0.55, yEye - 0.05, zLook);
        }
        return;
      }
    }

    sitPovModeRef.current = false;
    const presets = {
      CUTAWAY:     { radius: 8.2, theta: 0.64, phi: 1.06, lookAt: [0, 1.12, 0] },
      BAY_CLOSEUP: { radius: 3.1, theta: 0.88, phi: 1.18, lookAt: [-0.85, 1.1, -3.3] },
      WALKTHROUGH: { radius: 1.8, theta: 0.02, phi: 1.48, lookAt: [0.52, 1.45, -3.5] },
      WINDOW_SIDE: { radius: 3.9, theta: -0.55, phi: 1.16, lookAt: [0.9, 1.08, 0] }
    };
    const p = presets[cameraMode] || presets.CUTAWAY;
    desiredSphericalRef.current = { radius: p.radius, theta: p.theta, phi: p.phi };
    targetLookAtRef.current.set(...p.lookAt);
  }, [cameraMode, sitBerthId, berths]);

  // Main Three.js High-LOD Scene Initialization
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 760;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x93C5FD);
    scene.fog = new THREE.FogExp2(0xBAE6FD, 0.015);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.08, 120);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: qualityMode === 'ULTRA',
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, qualityMode === 'ULTRA' ? 2 : 1.25));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ------------------------------------------------------------------------
    // LIGHTING RIG (Daylight Golden Hour <-> Cozy Warm Night Reading Lamps)
    // ------------------------------------------------------------------------
    const hemiLight = new THREE.HemisphereLight(0xFFFBEB, 0x64748B, 1.05);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xFFF7ED, 1.25);
    sunLight.position.set(-7, 8, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = qualityMode === 'ULTRA' ? 1024 : 512;
    sunLight.shadow.mapSize.height = qualityMode === 'ULTRA' ? 1024 : 512;
    scene.add(sunLight);

    const cabinLeds = [];
    const bayZCenters = [-3.3, 0, 3.3];
    bayZCenters.forEach(z => {
      const led = new THREE.PointLight(0xFFFBEB, 0.65, 6.5);
      led.position.set(-0.2, 2.55, z);
      scene.add(led);
      cabinLeds.push(led);
    });
    lightsRef.current = { hemiLight, sunLight, cabinLeds };

    // ------------------------------------------------------------------------
    // OUTDOOR ANIMATED INDIAN COUNTRYSIDE (Green Fields, Distant Hills, OHE Poles)
    // ------------------------------------------------------------------------
    const countrysideGroup = new THREE.Group();
    const fieldMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0x3F7D3E, roughness: 0.95 })
    );
    fieldMesh.rotation.x = -Math.PI / 2;
    fieldMesh.position.set(-14, -1.1, 0);
    countrysideGroup.add(fieldMesh);

    // Distant Rolling Hills Silhouette
    const hillMat = new THREE.MeshStandardMaterial({ color: 0x2F5E41, roughness: 1 });
    [-16, -4, 9, 20].forEach((z, idx) => {
      const hill = new THREE.Mesh(new THREE.ConeGeometry(5 + (idx % 2) * 2.5, 4.2, 7), hillMat);
      hill.position.set(-22, 0.8, z);
      countrysideGroup.add(hill);
    });

    // Passing Electric OHE Catenary Poles & Overhead Wire
    const oheMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });
    const masts = [];
    for (let z = -18; z <= 18; z += 6) {
      const mastGroup = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 5.2, 0.12), oheMat);
      pole.position.set(-3.6, 1.5, 0);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.08), oheMat);
      arm.position.set(-2.95, 3.7, 0);
      mastGroup.add(pole, arm);
      mastGroup.position.z = z;
      countrysideGroup.add(mastGroup);
      masts.push(mastGroup);
    }
    sceneryMastsRef.current = masts;
    scene.add(countrysideGroup);

    // ------------------------------------------------------------------------
    // REAL-SCALE LHB COACH ARCHITECTURE (Width: 3.24m, Ceiling Height: 2.75m)
    // ------------------------------------------------------------------------
    const coachGroup = new THREE.Group();
    const isFirstAC = coachClass === '1A';
    const isSecondAC = coachClass === '2A';

    // Materials
    const floorTex = createSpeckledFloorTexture(isFirstAC);
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: isFirstAC ? 0.9 : 0.65 });
    const frpWallMat = new THREE.MeshStandardMaterial({ color: 0xF5EFE6, roughness: 0.48 }); // Authentic warm cream/ivory LHB FRP
    const steelMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.82, roughness: 0.22 });
    const darkSteelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.35 });
    const woodMat = new THREE.MeshStandardMaterial({ map: createWoodGrainTexture(), roughness: 0.45 });
    const crimsonMat = new THREE.MeshStandardMaterial({ color: 0xD9381E, roughness: 0.35 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xE0F2FE,
      transparent: true,
      opacity: 0.24,
      roughness: 0.08,
      metalness: 0.1
    });

    // Coach Length 10.6m (3 Full Bays + Vestibule)
    const underframe = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.22, 10.8),
      new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.7 })
    );
    underframe.position.set(0, -0.15, 0);
    coachGroup.add(underframe);

    const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(3.24, 0.08, 10.6), floorMat);
    floorMesh.position.set(0, -0.02, 0);
    floorMesh.receiveShadow = true;
    coachGroup.add(floorMesh);

    // Brushed Aluminium Aisle Trim Strips
    [0.18, 0.92].forEach(x => {
      const trim = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.09, 10.4), steelMat);
      trim.position.set(x, -0.015, 0);
      coachGroup.add(trim);
    });

    // Left Window Wall (Warm Cream FRP Panels + Dado Rail + Panoramic Double-Glazed Windows)
    const leftLowerWall = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.96, 10.6), frpWallMat);
    leftLowerWall.position.set(-1.62, 0.48, 0);
    leftLowerWall.receiveShadow = true;
    coachGroup.add(leftLowerWall);

    const leftDadoRail = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.06, 10.62), steelMat);
    leftDadoRail.position.set(-1.62, 0.98, 0);
    coachGroup.add(leftDadoRail);

    const leftUpperHeader = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.52, 10.6), frpWallMat);
    leftUpperHeader.position.set(-1.62, 2.49, 0);
    coachGroup.add(leftUpperHeader);

    // Right Side Wall (Cutaway height for unobstructed architectural overview)
    const rightLowerWall = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.85, 10.6), frpWallMat);
    rightLowerWall.position.set(1.62, 0.42, 0);
    coachGroup.add(rightLowerWall);

    const rightCrimsonBand = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 10.62), crimsonMat);
    rightCrimsonBand.position.set(1.62, 0.87, 0);
    coachGroup.add(rightCrimsonBand);

    // Curved Ceiling Group (With Recessed Diffused LED Strip Lights & Slatted AC Louver Vents)
    const ceilingGroup = new THREE.Group();
    const ceilingArch = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.08, 10.6),
      new THREE.MeshStandardMaterial({ color: 0xFAF8F5, roughness: 0.6 })
    );
    ceilingArch.position.set(-0.55, 2.75, 0);
    ceilingGroup.add(ceilingArch);

    // Recessed Diffused LED Light Strip & Slatted AC Louver Vent down center
    const ledDiffuser = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.04, 10.0),
      new THREE.MeshBasicMaterial({ color: 0xFFFBEB })
    );
    ledDiffuser.position.set(-0.4, 2.71, 0);
    ceilingGroup.add(ledDiffuser);

    for (let z = -4.5; z <= 4.5; z += 0.45) {
      const ventSlat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.06), darkSteelMat);
      ventSlat.position.set(0.15, 2.71, z);
      ceilingGroup.add(ventSlat);
    }
    ceilingGroupRef.current = ceilingGroup;
    coachGroup.add(ceilingGroup);

    // Build 3 Detailed Bays
    const curtainsArr = [];
    bayZCenters.forEach((zCenter, bayIdx) => {
      // Extruded Window Frame + Double-Glazed Tinted Glass + Pull-Down Roller Blind
      const winGlass = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.18, 2.05), glassMat);
      winGlass.position.set(-1.62, 1.61, zCenter);
      coachGroup.add(winGlass);

      // Window Mullion Pillars between bays
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.13, 1.32, 0.35), frpWallMat);
      pillar.position.set(-1.62, 1.62, zCenter - 1.65);
      coachGroup.add(pillar);

      // Pull-Down Window Roller Blind (Partially drawn)
      const blind = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 0.24, 2.02),
        new THREE.MeshStandardMaterial({ color: 0xD6CFC2, roughness: 0.7 })
      );
      blind.position.set(-1.58, 2.1, zCenter);
      coachGroup.add(blind);

      // Fold-Down Snack Table with Recessed Cup Holders
      const table = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.035, 0.72),
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.3 })
      );
      table.position.set(-1.4, 0.76, zCenter);
      table.castShadow = true;
      coachGroup.add(table);

      [-0.22, 0.22].forEach(cupZ => {
        const cupRing = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.045, 16), darkSteelMat);
        cupRing.rotation.x = -Math.PI / 2;
        cupRing.position.set(-1.4, 0.781, zCenter + cupZ);
        coachGroup.add(cupRing);
      });

      // 3-Pin Power + USB Charging Socket Plate on Window Pillar
      const socketPlate = new THREE.Mesh(
        new THREE.BoxGeometry(0.025, 0.14, 0.18),
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.3 })
      );
      socketPlate.position.set(-1.55, 1.06, zCenter - 0.52);
      coachGroup.add(socketPlate);

      const usbPort = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.03, 0.04),
        new THREE.MeshBasicMaterial({ color: 0x065AF3 })
      );
      usbPort.position.set(-1.545, 1.06, zCenter - 0.48);
      coachGroup.add(usbPort);

      // Red Emergency Alarm Chain Pull-Box on Bay Pillar
      const alarmBox = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.1), crimsonMat);
      alarmBox.position.set(-1.53, 2.28, zCenter + 1.38);
      coachGroup.add(alarmBox);

      // Bay Bulkhead Partitions (FRP for 3A/2A, Wood-Accent for 1A)
      [-1.62, 1.62].forEach(zOff => {
        const bulkhead = new THREE.Mesh(
          new THREE.BoxGeometry(1.76, 2.65, 0.065),
          isFirstAC ? woodMat : frpWallMat
        );
        bulkhead.position.set(-0.74, 1.32, zCenter + zOff);
        bulkhead.castShadow = true;
        bulkhead.receiveShadow = true;
        coachGroup.add(bulkhead);

        const edgeStrip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.68, 0.08), steelMat);
        edgeStrip.position.set(0.14, 1.34, zCenter + zOff);
        coachGroup.add(edgeStrip);
      });

      // 1A First AC: Lockable Wood-Accent Sliding Cabin Door & Personal Mirror
      if (isFirstAC) {
        const slidingDoor = new THREE.Mesh(
          new THREE.BoxGeometry(0.055, 2.42, 1.15),
          woodMat
        );
        slidingDoor.position.set(0.16, 1.21, zCenter - 0.85);
        coachGroup.add(slidingDoor);

        const mirror = new THREE.Mesh(
          new THREE.BoxGeometry(0.03, 0.75, 0.45),
          new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.95, roughness: 0.05 })
        );
        mirror.position.set(-1.55, 1.55, zCenter);
        coachGroup.add(mirror);
      }

      // 2A AC 2-Tier: Pleated Privacy Curtains on Main Bay & Side Berths
      if (isSecondAC) {
        const curtainMat = new THREE.MeshStandardMaterial({
          color: 0x9F1239,
          roughness: 0.85,
          side: THREE.DoubleSide
        });
        const bayCurtain = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.35), curtainMat);
        bayCurtain.rotation.y = Math.PI / 2;
        bayCurtain.position.set(0.18, 1.32, zCenter - 0.9);
        coachGroup.add(bayCurtain);
        curtainsArr.push(bayCurtain);
      }

      // Brushed Stainless Steel Climb Ladder with Anti-Slip Treads
      const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 2.2, 12), steelMat);
      post1.position.set(0.19, 1.12, zCenter - 0.13);
      const post2 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 2.2, 12), steelMat);
      post2.position.set(0.19, 1.12, zCenter + 0.13);
      coachGroup.add(post1, post2);

      for (let yStep = 0.44; yStep <= 2.04; yStep += 0.38) {
        const tread = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.025, 0.26), darkSteelMat);
        tread.position.set(0.19, yStep, zCenter);
        coachGroup.add(tread);
      }

      // Under-Berth Storable Trolley Suitcase
      const bagColors = [0x1D4ED8, 0xB91C1C, 0x0F766E];
      const bag = new THREE.Mesh(
        new THREE.BoxGeometry(0.56, 0.24, 0.42),
        new THREE.MeshStandardMaterial({ color: bagColors[bayIdx % 3], roughness: 0.55 })
      );
      bag.position.set(-0.92, 0.13, zCenter - 1.15);
      bag.castShadow = true;
      coachGroup.add(bag);
    });
    curtainsRef.current = curtainsArr;

    // End Washbasin & Bio-Toilet Zone at z = +5.05
    const washCabinet = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.85, 0.55), steelMat);
    washCabinet.position.set(-1.25, 0.42, 4.95);
    coachGroup.add(washCabinet);

    scene.add(coachGroup);

    // ------------------------------------------------------------------------
    // PBR MATERIAL SETS FOR BERTH STATUSES
    // ------------------------------------------------------------------------
    const pbrAvailable = createRexinePBRMaps(isFirstAC ? '#7F1D1D' : '#0E7490', '#E0F2FE'); // Authentic LHB Teal-Blue (or 1A Maroon)
    const pbrSelected = createRexinePBRMaps('#065AF3', '#DBEAFE');                          // MakeMyTrip Electric Blue
    const pbrBooked = createRexinePBRMaps('#64748B', '#E2E8F0');                            // Muted Occupied Slate
    const pbrQuota = createRexinePBRMaps('#D97706', '#FEF3C7');                             // Warm Amber Priority

    scene.userData.pbrSets = {
      AVAILABLE: pbrAvailable,
      SELECTED: pbrSelected,
      BOOKED: pbrBooked,
      QUOTA: pbrQuota
    };

    // ------------------------------------------------------------------------
    // BUILD HIGH-LOD (THREE.LOD) BERTH ASSEMBLIES
    // ------------------------------------------------------------------------
    const berthMap = new Map();
    const middlePivots = [];
    const blanketsArr = [];
    const lampsArr = [];

    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.88 });
    const blanketMat = new THREE.MeshStandardMaterial({ color: 0x7C2D12, roughness: 0.92 }); // Authentic maroon woollen railway blanket
    const bottleHolderMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.9, roughness: 0.15 });

    berths.forEach(berth => {
      const rootGroup = new THREE.Group();
      const zBay = bayZCenters[berth.bay - 1] ?? 0;
      const yLevels = [0.44, 1.24, 2.04];
      const yPos = yLevels[berth.tier];

      let xPos = 0, zPos = zBay, w = 1.68, d = 0.64;
      if (berth.side === 'MAIN_L') {
        xPos = -0.74;
        zPos = zBay - 1.22;
      } else if (berth.side === 'MAIN_R') {
        xPos = -0.74;
        zPos = zBay + 1.22;
      } else {
        xPos = 1.26;
        zPos = zBay;
        w = 0.62;
        d = 1.88;
      }

      // Pivot wrapper so Middle Berths hinge realistically along the bulkhead!
      const pivotGroup = new THREE.Group();
      rootGroup.add(pivotGroup);

      // Shared Mattress Material (updated dynamically on selection/status change)
      const mattressMat = new THREE.MeshStandardMaterial({
        map: pbrAvailable.map,
        bumpMap: pbrAvailable.bumpMap,
        bumpScale: 0.018,
        roughness: 0.52,
        metalness: 0.06
      });

      // TRUE THREE.LOD OBJECT (3 Detail Levels: Ultra < 3.8m, Bay 3.8–7.5m, Overview > 7.5m)
      const lod = new THREE.LOD();

      // --- LOD 0: ULTRA DETAIL ---
      const lod0 = new THREE.Group();
      const tray0 = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.045, d + 0.04), steelMat);
      tray0.position.y = -0.055;
      lod0.add(tray0);

      const mat0 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, d), mattressMat);
      mat0.castShadow = true;
      mat0.receiveShadow = true;
      mat0.userData = { berthId: berth.id };
      lod0.add(mat0);

      // Rounded Bolster / Backrest Cushion on Lower Berths
      if (berth.tier === 0 && berth.side !== 'SIDE') {
        const bolster = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, w * 0.94, 14), mattressMat);
        bolster.rotation.z = Math.PI / 2;
        bolster.position.set(0, 0.24, berth.side === 'MAIN_L' ? -d / 2 + 0.05 : d / 2 - 0.05);
        lod0.add(bolster);
      }

      // Crisp White Pillow
      const pillow0 = new THREE.Mesh(
        new THREE.BoxGeometry(berth.side === 'SIDE' ? 0.44 : 0.28, 0.075, berth.side === 'SIDE' ? 0.28 : 0.42),
        pillowMat
      );
      pillow0.position.set(berth.side === 'SIDE' ? 0 : -w / 2 + 0.2, 0.095, berth.side === 'SIDE' ? -d / 2 + 0.22 : 0);
      lod0.add(pillow0);

      // Neatly Folded Maroon Blanket (Shown in Night Mode)
      const blanket0 = new THREE.Mesh(
        new THREE.BoxGeometry(berth.side === 'SIDE' ? 0.46 : 0.42, 0.06, berth.side === 'SIDE' ? 0.45 : 0.48),
        blanketMat
      );
      blanket0.position.set(berth.side === 'SIDE' ? 0 : w / 2 - 0.3, 0.085, berth.side === 'SIDE' ? d / 2 - 0.34 : 0);
      lod0.add(blanket0);
      blanketsArr.push(blanket0);

      // Safety Guard Rail + Berth Support Chains (Middle Berth)
      if (berth.tier >= 1) {
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(berth.side === 'SIDE' ? 0.025 : w * 0.72, 0.035, berth.side === 'SIDE' ? d * 0.72 : 0.025),
          steelMat
        );
        if (berth.side === 'SIDE') rail.position.set(-w / 2, 0.13, 0);
        else rail.position.set(0, 0.13, berth.side === 'MAIN_L' ? d / 2 : -d / 2);
        lod0.add(rail);
      }
      if (berth.tier === 1) {
        const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.78, 8), steelMat);
        chain.position.set(w / 2 - 0.08, 0.38, berth.side === 'MAIN_L' ? d / 2 : -d / 2);
        lod0.add(chain);
      }

      // Chrome Water Bottle Holder + Individual Swivel Reading Lamp
      const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.12, 12, 1, true), bottleHolderMat);
      holder.position.set(berth.side === 'SIDE' ? 0.28 : -w / 2 + 0.06, 0.16, berth.side === 'SIDE' ? 0 : berth.side === 'MAIN_L' ? -d / 2 + 0.08 : d / 2 - 0.08);
      lod0.add(holder);

      const lampBulbMat = new THREE.MeshBasicMaterial({ color: 0xFEF08A });
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 10), lampBulbMat);
      lamp.position.set(berth.side === 'SIDE' ? 0.28 : -w / 2 + 0.05, 0.42, berth.side === 'SIDE' ? -0.65 : 0);
      lod0.add(lamp);
      lampsArr.push(lampBulbMat);

      lod.addLevel(lod0, 0);

      // --- LOD 1: BAY DETAIL (3.8m – 7.5m) ---
      const lod1 = new THREE.Group();
      const mat1 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, d), mattressMat);
      mat1.userData = { berthId: berth.id };
      lod1.add(mat1);
      const pillow1 = new THREE.Mesh(
        new THREE.BoxGeometry(berth.side === 'SIDE' ? 0.44 : 0.28, 0.07, berth.side === 'SIDE' ? 0.28 : 0.42),
        pillowMat
      );
      pillow1.position.copy(pillow0.position);
      lod1.add(pillow1);
      lod.addLevel(lod1, 3.8);

      // --- LOD 2: COACH OVERVIEW (> 7.5m) ---
      const lod2 = new THREE.Group();
      const mat2 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, d), mattressMat);
      mat2.userData = { berthId: berth.id };
      lod2.add(mat2);
      lod.addLevel(lod2, 7.5);

      pivotGroup.add(lod);

      // Crisp Berth Number Plaque Facing the Aisle (Always sharp)
      const plaqueGeo = new THREE.PlaneGeometry(0.46, 0.2);
      const plaqueMat = new THREE.MeshBasicMaterial({
        map: createBerthPlaqueTexture(berth, false),
        side: THREE.DoubleSide
      });
      const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
      if (berth.side === 'SIDE') {
        plaque.position.set(-w / 2 - 0.02, 0.15, 0);
        plaque.rotation.y = -Math.PI / 2;
      } else {
        plaque.position.set(w / 2 + 0.02, 0.15, 0);
        plaque.rotation.y = Math.PI / 2;
      }
      pivotGroup.add(plaque);

      rootGroup.position.set(xPos, yPos, zPos);
      scene.add(rootGroup);

      if (berth.tier === 1) {
        middlePivots.push({ pivot: pivotGroup, side: berth.side });
      }

      berthMap.set(berth.id, {
        rootGroup,
        lod,
        mattressMat,
        plaqueMat,
        hitMeshes: [mat0, mat1, mat2]
      });
    });

    berthRefsMap.current = berthMap;
    middleBerthPivotsRef.current = middlePivots;
    blanketsRef.current = blanketsArr;
    readingLampsRef.current = lampsArr;

    // ------------------------------------------------------------------------
    // RAYCASTING & SMOOTH DAMPED ORBIT / TOUCH CONTROLS
    // ------------------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const pickBerth = (clientX, clientY) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const allHits = [];
      berthMap.forEach(entry => allHits.push(...entry.hitMeshes));
      const intersects = raycaster.intersectObjects(allHits, false);
      return intersects.length > 0 ? intersects[0].object.userData.berthId : null;
    };

    const onPointerDown = (e) => {
      isDraggingRef.current = true;
      dragMovedRef.current = false;
      desiredSphericalRef.current = null;
      prevPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (isDraggingRef.current) {
        const dx = e.clientX - prevPointerRef.current.x;
        const dy = e.clientY - prevPointerRef.current.y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMovedRef.current = true;

        if (sitPovModeRef.current) {
          // Look around smoothly while seated on berth
          targetLookAtRef.current.x += dx * 0.008;
          targetLookAtRef.current.y = Math.max(0.4, Math.min(2.4, targetLookAtRef.current.y - dy * 0.006));
        } else {
          sphericalRef.current.theta -= dx * 0.007;
          sphericalRef.current.phi = Math.max(
            0.28,
            Math.min(Math.PI * 0.49, sphericalRef.current.phi - dy * 0.006)
          );
        }
        prevPointerRef.current = { x: e.clientX, y: e.clientY };
        renderer.domElement.style.cursor = 'grabbing';
        return;
      }

      const id = pickBerth(e.clientX, e.clientY);
      if (id) {
        renderer.domElement.style.cursor = 'pointer';
        setHoveredBerthId(id);
      } else {
        renderer.domElement.style.cursor = 'grab';
        setHoveredBerthId(null);
      }
    };

    const onPointerUp = (e) => {
      isDraggingRef.current = false;
      renderer.domElement.style.cursor = 'grab';
      if (!dragMovedRef.current) {
        const id = pickBerth(e.clientX, e.clientY);
        if (id) onSelectBerth(id);
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      if (sitPovModeRef.current) return;
      desiredSphericalRef.current = null;
      sphericalRef.current.radius = Math.max(
        1.5,
        Math.min(12.0, sphericalRef.current.radius + e.deltaY * 0.004)
      );
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ------------------------------------------------------------------------
    // ANIMATION LOOP (LOD Updates, Day/Night Transitions, Countryside Motion)
    // ------------------------------------------------------------------------
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const isNight = nightModeRef.current;

      // 1. Smooth Sky & Lighting Transition (Golden-Hour Day <-> Cozy Starry Night)
      const targetSky = isNight ? new THREE.Color(0x091326) : new THREE.Color(0x93C5FD);
      scene.background.lerp(targetSky, 0.05);
      if (scene.fog) scene.fog.color.lerp(targetSky, 0.05);

      if (lightsRef.current.sunLight) {
        lightsRef.current.sunLight.intensity += ((isNight ? 0.18 : 1.25) - lightsRef.current.sunLight.intensity) * 0.06;
        lightsRef.current.hemiLight.intensity += ((isNight ? 0.35 : 1.05) - lightsRef.current.hemiLight.intensity) * 0.06;
        lightsRef.current.cabinLeds.forEach(led => {
          led.intensity += ((isNight ? 1.15 : 0.45) - led.intensity) * 0.06;
          led.color.lerp(new THREE.Color(isNight ? 0xFDE68A : 0xFFFBEB), 0.06);
        });
      }

      // 2. Smoothly Fold/Unfold Middle Berths (Day Seating vs Night Sleeper)
      middleBerthPivotsRef.current.forEach(({ pivot, side }) => {
        const targetRotX = isNight ? 0 : side === 'MAIN_L' ? -Math.PI * 0.46 : Math.PI * 0.46;
        pivot.rotation.x += (targetRotX - pivot.rotation.x) * 0.09;
      });

      // 3. Toggle Folded Blankets & Draw 2AC Curtains in Night Mode
      blanketsRef.current.forEach(bl => {
        bl.visible = isNight;
      });
      curtainsRef.current.forEach(c => {
        const targetScaleX = isNight ? 1.45 : 0.45;
        c.scale.x += (targetScaleX - c.scale.x) * 0.07;
      });
      readingLampsRef.current.forEach(mat => {
        mat.color.setHex(isNight ? 0xFDE047 : 0xCBD5E1);
      });

      // 4. Passing Indian Countryside OHE Catenary Poles
      sceneryMastsRef.current.forEach(mast => {
        mast.position.z += 0.22;
        if (mast.position.z > 18) mast.position.z = -18;
      });

      // 5. Camera Glide & Active LOD Reporting
      currentLookAtRef.current.lerp(targetLookAtRef.current, 0.09);

      if (sitPovModeRef.current) {
        camera.position.lerp(sitCamPosRef.current, 0.09);
        camera.lookAt(currentLookAtRef.current);
      } else {
        if (desiredSphericalRef.current) {
          const d = desiredSphericalRef.current;
          sphericalRef.current.radius += (d.radius - sphericalRef.current.radius) * 0.08;
          sphericalRef.current.theta += (d.theta - sphericalRef.current.theta) * 0.08;
          sphericalRef.current.phi += (d.phi - sphericalRef.current.phi) * 0.08;
          if (Math.abs(d.radius - sphericalRef.current.radius) < 0.02) {
            desiredSphericalRef.current = null;
          }
        }
        const { radius, theta, phi } = sphericalRef.current;
        camera.position.x = currentLookAtRef.current.x + radius * Math.sin(phi) * Math.sin(theta);
        camera.position.y = currentLookAtRef.current.y + radius * Math.cos(phi);
        camera.position.z = currentLookAtRef.current.z + radius * Math.sin(phi) * Math.cos(theta);
        camera.lookAt(currentLookAtRef.current);
      }

      // Update THREE.LOD levels and report active LOD tier to HUD
      let closestDist = 99;
      berthMap.forEach(entry => {
        entry.lod.update(camera);
        const d = camera.position.distanceTo(entry.rootGroup.position);
        if (d < closestDist) closestDist = d;
      });

      const lodTier =
        closestDist < 3.8
          ? 'LOD 0 • Ultra Detail'
          : closestDist < 7.5
          ? 'LOD 1 • Bay Detail'
          : 'LOD 2 • Coach Overview';
      if (lodTier !== lastReportedLodRef.current) {
        lastReportedLodRef.current = lodTier;
        if (onLodChange) onLodChange(lodTier);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, [coachClass, qualityMode]);

  // Sync Berth Selection & Status Colors Live
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !scene.userData.pbrSets) return;
    const sets = scene.userData.pbrSets;

    berths.forEach(berth => {
      const entry = berthRefsMap.current.get(berth.id);
      if (!entry) return;
      const isSel = selectedIds.has(berth.id);
      const key = isSel
        ? 'SELECTED'
        : berth.status === 'BOOKED'
        ? 'BOOKED'
        : berth.status === 'QUOTA'
        ? 'QUOTA'
        : 'AVAILABLE';

      entry.mattressMat.map = sets[key].map;
      entry.mattressMat.bumpMap = sets[key].bumpMap;
      entry.mattressMat.needsUpdate = true;

      if (entry.plaqueMat.map) entry.plaqueMat.map.dispose();
      entry.plaqueMat.map = createBerthPlaqueTexture(berth, isSel);
      entry.plaqueMat.needsUpdate = true;
    });
  }, [berths, selectedIds]);

  const hoveredBerth = useMemo(
    () => berths.find(b => b.id === hoveredBerthId) || null,
    [berths, hoveredBerthId]
  );

  return (
    <div className="relative w-full h-full min-h-[500px] select-none">
      <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden" />

      {/* Humanised Floating Berth Comfort Card on Hover */}
      {hoveredBerth && (
        <div className="pointer-events-none absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-4 max-w-xs text-xs text-slate-800">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-extrabold text-sm text-slate-900">
              Berth #{hoveredBerth.displayNum} • {hoveredBerth.name}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                selectedIds.has(hoveredBerth.id)
                  ? 'bg-blue-100 text-blue-700'
                  : hoveredBerth.status === 'BOOKED'
                  ? 'bg-slate-200 text-slate-600'
                  : hoveredBerth.status === 'QUOTA'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {selectedIds.has(hoveredBerth.id) ? 'Your Selection' : hoveredBerth.status}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {hoveredBerth.comfortNote}
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 6. FIRST PAGE: HUMANISED MAKEMYTRIP-STYLE LOGIN & SIGN-UP PORTAL (RBAC)
// ============================================================================

const AuthPortal = ({ onLogin }) => {
  const [mode, setMode] = useState('LOGIN'); // 'LOGIN' | 'SIGNUP'
  const [selectedRole, setSelectedRole] = useState('PASSENGER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('aaravind.sharma@gmail.com');
  const [password, setPassword] = useState('••••••••••');
  const [error, setError] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'SIGNUP' && name.trim().length < 2) {
      setError('Please enter your full name so we can personalise your tickets.');
      return;
    }
    const base = DEMO_USERS[selectedRole];
    onLogin({
      ...base,
      name: mode === 'SIGNUP' ? name.trim() : base.name,
      email: email.trim() || base.email,
      role: selectedRole
    });
  };

  return (
    <div className="railyatra-font min-h-screen bg-gradient-to-br from-[#051322] via-[#0D2B52] to-[#15457B] flex flex-col justify-center py-8 px-4 sm:px-8 relative overflow-hidden">
      <style>{FONT_STYLES}</style>
      {/* Subtle Warm Sunrise Horizon Glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-sky-400/15 blur-3xl" />

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* LEFT SIDE: WARM TRAVEL STORY + SUNLIT 3D MINI PREVIEW */}
        <div className="lg:col-span-7 text-white space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D9381E] flex items-center justify-center shadow-lg">
              <Train className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tracking-tight">
                  RailYatra <span className="text-[#53B2FE]">3D</span>
                </span>
                <span className="text-[11px] font-semibold bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
                  IRCTC Authorised Partner
                </span>
              </div>
              <p className="text-xs text-sky-200">
                Indian Railways 3D Coach &amp; Berth Reservation Portal
              </p>
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-tight tracking-tight">
              See your exact berth in 3D before you book.
            </h1>
            <p className="mt-3 text-sky-100/90 text-sm sm:text-base max-w-xl leading-relaxed">
              Namaste! Whether you are booking a quiet lower berth for your parents or a window side-lower for an overnight journey, step inside our true-to-scale LHB coaches and choose your preferred seat with complete clarity.
            </p>
          </div>

          {/* Interactive Live Rail Corridor & Signal Deck */}
          <LiveRailCorridorDeck />

          {/* Humanised Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { title: 'Official IRCTC Partner', sub: 'Instant 10-digit PNR & Live Chart', icon: ShieldCheck },
              { title: 'True-to-Scale 3D LHB', sub: 'Inspect 3A, 2A & 1A Coaches', icon: Layers },
              { title: 'Zero Fee on BHIM UPI', sub: '3X Trip Guarantee Eligible', icon: CreditCard }
            ].map((b, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-3 flex items-start gap-2.5">
                <b.icon className="w-5 h-5 text-[#53B2FE] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">{b.title}</div>
                  <div className="text-[11px] text-sky-200">{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: CRISP WHITE FLOATING MAKEMYTRIP AUTH CARD */}
        <div className="lg:col-span-5">
          <EmbeddedAuthCard
            onAuthenticated={(u) => {
              const roleMap = {
                admin: DEMO_USERS.ADMIN || DEMO_USERS.admin || DEMO_USERS.RAILWAY_ADMIN,
                tte: DEMO_USERS.TTE || DEMO_USERS.tte || DEMO_USERS.TTE_STAFF,
                passenger: DEMO_USERS.TRAVELLER || DEMO_USERS.PASSENGER || DEMO_USERS.passenger || Object.values(DEMO_USERS)[0],
              };
              const baseUser = roleMap[u.role] || Object.values(DEMO_USERS)[0] || {};
              onLogin({ ...baseUser, name: u.name, email: u.email, verified: true });
              window.dispatchEvent(new CustomEvent('railyatra:auth', { detail: u }));
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 7. MAIN PRODUCTION APPLICATION: RAILYATRA 3D
// ============================================================================

export default function App() {
  const [user, setUser] = useState(null);

  // Navigation Tabs matching MakeMyTrip Floating Nav: 'TRAINS' | 'COACH_3D' | 'REVIEW_BOOK' | 'PNR' | 'LIVE' | 'FOOD'
  const [activeTab, setActiveTab] = useState('TRAINS');

  // MakeMyTrip Hero Search State
  const [fromCode, setFromCode] = useState('NDLS');
  const [toCode, setToCode] = useState('MMCT');
  const [travelDate, setTravelDate] = useState(new Date().toISOString().slice(0, 10));
  const [classFilter, setClassFilter] = useState('ALL');
  const [quotaPill, setQuotaPill] = useState('GN');
  const [depSlotFilter, setDepSlotFilter] = useState('ALL');
  const [onlyFreeCancel, setOnlyFreeCancel] = useState(false);

  // Active Train & 3D Coach State
  const [selectedTrain, setSelectedTrain] = useState(TRAINS_CATALOG[0]);
  const [selectedClass, setSelectedClass] = useState('3A');
  const [activeCoach, setActiveCoach] = useState('B1');

  // 3D Viewport Controls & LOD State
  const [cameraMode, setCameraMode] = useState('CUTAWAY');
  const [sitBerthId, setSitBerthId] = useState(null);
  const [nightMode, setNightMode] = useState(false); // Starts in bright sunlit Daylight Seating Mode!
  const [qualityMode, setQualityMode] = useState('ULTRA'); // 'ULTRA' | 'BALANCED'
  const [activeLodLabel, setActiveLodLabel] = useState('LOD 1 • Bay Detail');

  // Coach Inventory DB
  const [coachDB, setCoachDB] = useState(() => ({
    '3A-B1': generateCoachBerths('3A', 'B1'),
    '3A-B2': generateCoachBerths('3A', 'B2'),
    '3A-B3': generateCoachBerths('3A', 'B3'),
    '2A-A1': generateCoachBerths('2A', 'A1'),
    '2A-A2': generateCoachBerths('2A', 'A2'),
    '1A-H1': generateCoachBerths('1A', 'H1')
  }));

  // Passenger Booking & Value-Add State
  const [selectedBerthIds, setSelectedBerthIds] = useState(() => new Set());
  const [inspectedBerthId, setInspectedBerthId] = useState(null);
  const [sidebarMode, setSidebarMode] = useState('BUDDY'); // 'BUDDY' | 'BOOKING'
  const [paxForms, setPaxForms] = useState({});
  const [tripGuarantee, setTripGuarantee] = useState(true);
  const [freeCancelAddon, setFreeCancelAddon] = useState(false);
  const [travelInsurance, setTravelInsurance] = useState(true);
  const [selectedMealId, setSelectedMealId] = useState('NONE');

  // Enhanced Review & Book Checkout State
  const [boardingStation, setBoardingStation] = useState('');
  const [irctcUserId, setIrctcUserId] = useState('AARAV_SHARMA94');
  const [irctcVerified, setIrctcVerified] = useState(true);
  const [contactMobile, setContactMobile] = useState('9829044120');
  const [contactEmail, setContactEmail] = useState('aaravind.sharma@gmail.com');
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [showGstForm, setShowGstForm] = useState(false);
  const [gstDetails, setGstDetails] = useState({ company: '', gstin: '', address: '' });
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Berth Finder State (Natural, non-AI-cliché seat helper)
  const [buddyInput, setBuddyInput] = useState('');
  const [buddyMessages, setBuddyMessages] = useState([
    {
      id: 'm1',
      sender: 'HELPER',
      text: 'Namaste! Travelling with parents, family, or solo? Tell us what makes you comfortable and we will highlight the best available berths right inside the 3D coach.'
    }
  ]);

  // Admin & Payment / PNR State
  const [flexiFareMultiplier, setFlexiFareMultiplier] = useState(1.0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET'
  const [selectedUpiApp, setSelectedUpiApp] = useState('GPay');
  const [upiVpa, setUpiVpa] = useState('aaravind@okicici');
  const [upiVerified, setUpiVerified] = useState(true);
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm Wallet');
  const [pnrLookupInput, setPnrLookupInput] = useState('');
  const [myTickets, setMyTickets] = useState([]);
  const [ticketModalData, setTicketModalData] = useState(null);
  const [liveTrainNum, setLiveTrainNum] = useState('12952');
  const [toast, setToast] = useState(null);

  // Sync default boarding station whenever selected train changes
  useEffect(() => {
    const firstStop = selectedTrain?.liveStatus?.stops?.[0];
    if (firstStop) {
      setBoardingStation(`${firstStop.name} (${firstStop.time})`);
    }
  }, [selectedTrain]);

  const showToast = useCallback((msg, tone = 'info') => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 3400);
  }, []);

  const dbKey = `${selectedClass}-${activeCoach}`;
  const currentBerths = useMemo(() => {
    return coachDB[dbKey] || generateCoachBerths(selectedClass, activeCoach);
  }, [coachDB, dbKey, selectedClass, activeCoach]);

  const inspectedBerth = useMemo(
    () => currentBerths.find(b => b.id === inspectedBerthId) || currentBerths[0],
    [currentBerths, inspectedBerthId]
  );

  // Filtered Trains for Search Results
  const filteredTrains = useMemo(() => {
    return TRAINS_CATALOG.filter(t => {
      if (depSlotFilter !== 'ALL' && t.depSlot !== depSlotFilter) return false;
      if (onlyFreeCancel && !t.freeCancel) return false;
      if (classFilter !== 'ALL' && !t.classes.some(c => c.code === classFilter)) return false;
      return true;
    });
  }, [depSlotFilter, onlyFreeCancel, classFilter]);

  // Launch 3D Coach Tour from any Train Card
  const openIn3D = (train, clsObj) => {
    setSelectedTrain(train);
    setSelectedClass(clsObj.code);
    setActiveCoach(clsObj.coach);
    setSelectedBerthIds(new Set());
    setCameraMode('CUTAWAY');
    setActiveTab('COACH_3D');
    showToast(`Welcome aboard ${train.name} — Coach ${clsObj.coach} (${clsObj.label})!`, 'success');
  };

  // Switch Coach from Rake Composition Bar
  const switchCoachFromRake = (carCode) => {
    let cls = null;
    if (carCode.startsWith('H')) cls = '1A';
    else if (carCode.startsWith('A')) cls = '2A';
    else if (carCode.startsWith('B')) cls = '3A';

    if (!cls) {
      showToast(`${carCode} is a service car (Locomotive / Pantry / Power Car). Pick H1, A1, or B1–B3.`, 'info');
      return;
    }

    const key = `${cls}-${carCode}`;
    if (!coachDB[key]) {
      setCoachDB(prev => ({ ...prev, [key]: generateCoachBerths(cls, carCode) }));
    }
    setSelectedClass(cls);
    setActiveCoach(carCode);
    setSelectedBerthIds(new Set());
    setCameraMode('CUTAWAY');
    showToast(`Now viewing Coach ${carCode} (${cls}) in 3D`, 'info');
  };

  // Handle Berth Click inside 3D Coach (Role-Aware)
  const handleBerthSelect = useCallback(
    (berthId) => {
      const berth = currentBerths.find(b => b.id === berthId);
      if (!berth || !user) return;

      setInspectedBerthId(berth.id);

      // TTE Role: Verify ID / Mark Boarded
      if (user.role === 'TTE') {
        if (berth.status !== 'BOOKED') {
          showToast(`Berth #${berth.displayNum} (${berth.code}) is currently ${berth.status}.`, 'info');
          return;
        }
        setCoachDB(prev => ({
          ...prev,
          [dbKey]: currentBerths.map(b =>
            b.id === berthId ? { ...b, boarded: !b.boarded } : b
          )
        }));
        showToast(
          `TTE Chart: Berth #${berth.displayNum} marked ${!berth.boarded ? 'Boarded ✅' : 'Pending ⏳'}`,
          'success'
        );
        return;
      }

      // Admin Role: Toggle General vs Senior/Ladies Quota
      if (user.role === 'ADMIN') {
        if (berth.status === 'BOOKED') {
          showToast(`Berth #${berth.displayNum} is already confirmed (PNR ${berth.pnr}).`, 'warn');
          return;
        }
        const nextStatus = berth.status === 'AVAILABLE' ? 'QUOTA' : 'AVAILABLE';
        setCoachDB(prev => ({
          ...prev,
          [dbKey]: currentBerths.map(b =>
            b.id === berthId
              ? { ...b, status: nextStatus, quota: nextStatus === 'QUOTA' ? 'Ladies / Senior Priority' : 'General' }
              : b
          )
        }));
        showToast(`Berth #${berth.displayNum} moved to ${nextStatus === 'QUOTA' ? 'Ladies / Senior Priority' : 'General Pool'}`);
        return;
      }

      // Traveller (Passenger) Role
      if (berth.status === 'BOOKED') {
        showToast(`Sorry, Berth #${berth.displayNum} (${berth.name}) is already taken. Try a green berth!`, 'warn');
        return;
      }

      setSelectedBerthIds(prev => {
        const next = new Set(prev);
        if (next.has(berthId)) {
          next.delete(berthId);
          showToast(`Removed Berth #${berth.displayNum} from your selection`);
        } else {
          if (next.size >= 6) {
            showToast('You can book up to 6 berths on a single IRCTC ticket.', 'warn');
            return prev;
          }
          next.add(berthId);
          setPaxForms(pf => ({
            ...pf,
            [berthId]: pf[berthId] || {
              name: next.size === 1 ? user.name : '',
              age: berth.status === 'QUOTA' ? '64' : '32',
              gender: 'Male',
              berthPref: berth.name.includes('Side Lower') ? 'Side Lower' : berth.name.includes('Lower') ? 'Lower' : berth.name.includes('Upper') ? 'Upper' : 'No Preference',
              mealPref: 'Veg',
              nationality: 'India'
            }
          }));
          setSidebarMode('BOOKING');
          showToast(`Berth #${berth.displayNum} (${berth.name}) added to your trip.`, 'success');
        }
        return next;
      });
    },
    [currentBerths, user, dbKey, showToast]
  );

  // Add another traveller directly from Review & Book (auto-allocates next available berth)
  const handleAddTravellerAutoBerth = () => {
    if (selectedBerthIds.size >= 6) {
      showToast('Maximum 6 passengers are allowed per IRCTC ticket.', 'warn');
      return;
    }
    const nextVacant = currentBerths.find(
      b => b.status !== 'BOOKED' && !selectedBerthIds.has(b.id)
    );
    if (!nextVacant) {
      showToast('No more vacant berths in this coach.', 'warn');
      return;
    }
    setSelectedBerthIds(prev => {
      const next = new Set(prev);
      next.add(nextVacant.id);
      return next;
    });
    setPaxForms(pf => ({
      ...pf,
      [nextVacant.id]: {
        name: '',
        age: '30',
        gender: 'Male',
        berthPref: 'No Preference',
        mealPref: 'Veg',
        nationality: 'India'
      }
    }));
    showToast(`Added Traveller #${selectedBerthIds.size + 1} on Berth #${nextVacant.displayNum} (${nextVacant.code})`, 'success');
  };

  // Quick-fill a Saved Traveller into the first empty slot (or allocate a new berth)
  const handleApplySavedTraveller = (saved) => {
    const selectedArr = currentBerths.filter(b => selectedBerthIds.has(b.id));
    const emptySlot = selectedArr.find(b => !paxForms[b.id]?.name?.trim());

    if (emptySlot) {
      setPaxForms(prev => ({
        ...prev,
        [emptySlot.id]: { ...saved }
      }));
      showToast(`Filled ${saved.name} into Berth #${emptySlot.displayNum}`, 'success');
      return;
    }

    if (selectedBerthIds.size >= 6) {
      showToast('Maximum 6 passengers reached on this ticket.', 'warn');
      return;
    }

    const nextVacant = currentBerths.find(
      b => b.status !== 'BOOKED' && !selectedBerthIds.has(b.id)
    );
    if (!nextVacant) {
      showToast('No vacant berths remaining in this coach.', 'warn');
      return;
    }
    setSelectedBerthIds(prev => new Set(prev).add(nextVacant.id));
    setPaxForms(prev => ({
      ...prev,
      [nextVacant.id]: { ...saved }
    }));
    showToast(`Added ${saved.name} on Berth #${nextVacant.displayNum} (${nextVacant.code})`, 'success');
  };

  // TTE Release No-Show Berth live in 3D
  const handleTteNoShow = (berthId) => {
    const b = currentBerths.find(x => x.id === berthId);
    if (!b) return;
    setCoachDB(prev => ({
      ...prev,
      [dbKey]: currentBerths.map(item =>
        item.id === berthId
          ? { ...item, status: 'AVAILABLE', quota: 'General', pax: null, pnr: null, boarded: false }
          : item
      )
    }));
    showToast(`No-Show logged: Berth #${b.displayNum} is now open for RAC upgrade in 3D!`, 'success');
  };

  // Friendly AI Berth Buddy Engine
  const askBerthBuddy = (queryText) => {
    const q = queryText.trim();
    if (!q) return;
    const lower = q.toLowerCase();

    const vacant = currentBerths.filter(b => b.status !== 'BOOKED');
    if (vacant.length === 0) {
      setBuddyMessages(prev => [
        ...prev,
        { id: Date.now() + 'u', sender: 'USER', text: q },
        { id: Date.now() + 'a', sender: 'AI', text: 'This coach is completely full! Tap another coach like B2 or A1 in the coach bar above and I will find great seats there.' }
      ]);
      return;
    }

    let picks = [];
    let reply = '';
    let cam = 'BAY_CLOSEUP';

    if (lower.includes('parent') || lower.includes('senior') || lower.includes('lower')) {
      const lowers = vacant.filter(b => b.code === 'LB');
      const count = lower.includes('2') || lower.includes('parent') ? 2 : 1;
      picks = lowers.slice(0, count);
      reply = `I picked ${picks.map(p => `Lower Berth #${p.displayNum}`).join(' and ')} for you! They are in the quiet middle bay away from the washroom door, need zero climbing, and have 230V + USB charging right beside the window.`;
      cam = 'BAY_CLOSEUP';
    } else if (lower.includes('family') || lower.includes('4')) {
      const bay1 = vacant.filter(b => b.bay === 1);
      picks = (bay1.length >= 3 ? bay1 : vacant).slice(0, 4);
      reply = `Wonderful! I grouped ${picks.length} berths together (${picks.map(p => `#${p.displayNum} ${p.code}`).join(', ')}) in Bay 1 so your whole family can chat and share meals comfortably around the same window table.`;
      cam = 'BAY_CLOSEUP';
    } else if (lower.includes('side') || lower.includes('window') || lower.includes('charger') || lower.includes('solo')) {
      const sideLowers = vacant.filter(b => b.code === 'SL' || (b.window && b.charging));
      picks = (sideLowers.length > 0 ? sideLowers : vacant).slice(0, 1);
      reply = `Here is your ideal solo spot — Berth #${picks[0].displayNum} (${picks[0].name})! You get a dedicated panoramic window and a 230V + USB socket right at arm's reach.`;
      cam = picks[0].side === 'SIDE' ? 'WINDOW_SIDE' : 'BAY_CLOSEUP';
    } else {
      picks = vacant.slice(0, 1);
      reply = `I've highlighted Berth #${picks[0].displayNum} (${picks[0].name}) in ${picks[0].bayLabel}. Tap "Sit Here (1st-Person)" below to preview the exact view from your seat!`;
    }

    if (picks.length > 0) {
      setSelectedBerthIds(new Set(picks.map(p => p.id)));
      setInspectedBerthId(picks[0].id);
      setCameraMode(cam);
      setPaxForms(prev => {
        const next = { ...prev };
        picks.forEach((b, i) => {
          if (!next[b.id]) {
            next[b.id] = {
              name: i === 0 ? user.name : '',
              age: lower.includes('parent') || b.status === 'QUOTA' ? '64' : '32',
              gender: 'Male',
              berthPref: b.code === 'LB' ? 'Lower' : b.code === 'SL' ? 'Side Lower' : 'No Preference',
              mealPref: 'Veg',
              nationality: 'India'
            };
          }
        });
        return next;
      });
    }

    setBuddyMessages(prev => [
      ...prev,
      { id: Date.now() + 'u', sender: 'USER', text: q },
      { id: Date.now() + 'a', sender: 'HELPER', text: reply, berths: picks.map(p => p.displayNum) }
    ]);
    setBuddyInput('');
  };

  // Selected Berths & Itemized IRCTC Fare Breakdown
  const selectedBerthsList = useMemo(
    () => currentBerths.filter(b => selectedBerthIds.has(b.id)),
    [currentBerths, selectedBerthIds]
  );

  const currentClassMeta = useMemo(
    () => selectedTrain.classes.find(c => c.code === selectedClass) || selectedTrain.classes[0],
    [selectedTrain, selectedClass]
  );

  const fareCalc = useMemo(() => {
    const n = selectedBerthsList.length;
    if (n === 0) {
      return {
        base: 0,
        reservationCharge: 0,
        superfastCharge: 0,
        surge: 0,
        mealTotal: 0,
        insuranceTotal: 0,
        protectionTotal: 0,
        gst: 0,
        convenienceFee: 0,
        discount: 0,
        total: 0
      };
    }
    const reservationCharge = 40 * n;
    const superfastCharge = 45 * n;
    const rawTicket = currentClassMeta.fare * n;
    const base = Math.max(0, rawTicket - reservationCharge - superfastCharge);
    const surge = Math.round(rawTicket * (flexiFareMultiplier - 1));
    const mealPrice = ECATERING_MENU.find(m => m.id === selectedMealId)?.price || 0;
    const mealTotal = mealPrice * n;
    const insuranceTotal = travelInsurance ? +(0.45 * n).toFixed(2) : 0;
    const protectionTotal = (tripGuarantee ? 149 * n : 0) + (freeCancelAddon ? 119 * n : 0);
    const gst = Math.round((rawTicket + surge) * 0.05);
    const baseConvenienceFee = 35;
    const convenienceFee = appliedCoupon?.code === 'ZEROFEE' ? 0 : baseConvenienceFee;

    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'FLAT') discount = appliedCoupon.amount;
      if (appliedCoupon.type === 'FEE_WAIVER') discount = baseConvenienceFee;
    }

    const subtotal =
      base +
      reservationCharge +
      superfastCharge +
      surge +
      mealTotal +
      insuranceTotal +
      protectionTotal +
      gst +
      baseConvenienceFee;

    const total = Math.max(0, +(subtotal - discount).toFixed(2));
    return {
      base,
      reservationCharge,
      superfastCharge,
      surge,
      mealTotal,
      insuranceTotal,
      protectionTotal,
      gst,
      convenienceFee,
      discount,
      total
    };
  }, [
    selectedBerthsList,
    currentClassMeta,
    flexiFareMultiplier,
    tripGuarantee,
    freeCancelAddon,
    travelInsurance,
    selectedMealId,
    appliedCoupon
  ]);

  const handleApplyCouponCode = (codeStr) => {
    const clean = (codeStr || couponInput).trim().toUpperCase();
    const found = PROMO_CODES.find(c => c.code === clean);
    if (!found) {
      showToast('Invalid promo code. Try RAILFIRST, ZEROFEE, or UPI50.', 'warn');
      return;
    }
    setAppliedCoupon(found);
    setCouponInput(found.code);
    showToast(`Promo code ${found.code} applied — ${found.title}!`, 'success');
  };

  // Complete Payment & Generate IRCTC Electronic Reservation Slip (ERS)
  const handleCompletePayment = () => {
    const pnr = Math.floor(2100000000 + Math.random() * 7899999999).toString();
    const txnId = 'IRCTC' + Math.floor(1000000000 + Math.random() * 8999999999);
    const bookedAt = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const paxRecords = selectedBerthsList.map((b, idx) => {
      const f = paxForms[b.id] || {};
      return {
        berthNum: b.displayNum,
        berthCode: b.code,
        berthName: b.name,
        name: f.name?.trim() || `${user.name}${idx > 0 ? ` (Co-traveller ${idx})` : ''}`,
        age: f.age || '32',
        gender: f.gender ? f.gender[0] : 'M',
        mealPref: f.mealPref || 'Veg',
        status: `CNF / ${activeCoach} / ${b.displayNum} / ${b.code}`
      };
    });

    setCoachDB(prev => ({
      ...prev,
      [dbKey]: currentBerths.map(b => {
        if (!selectedBerthIds.has(b.id)) return b;
        const p = paxRecords.find(x => x.berthNum === b.displayNum);
        return {
          ...b,
          status: 'BOOKED',
          pax: { name: p.name, age: p.age, gender: p.gender, idProof: 'Verified IRCTC KYC' },
          pnr,
          boarded: false
        };
      })
    }));

    const ticket = {
      pnr,
      txnId,
      bookedAt,
      train: selectedTrain,
      date: travelDate,
      boardingStation: boardingStation || `${selectedTrain.from} (${selectedTrain.depTime})`,
      quota: QUOTA_PILLS.find(q => q.id === quotaPill)?.label || 'General',
      irctcUserId,
      coach: activeCoach,
      coachClass: selectedClass,
      passengers: paxRecords,
      meal: ECATERING_MENU.find(m => m.id === selectedMealId)?.name || 'No Meal Selected',
      tripGuarantee,
      freeCancelAddon,
      travelInsurance,
      gstDetails: showGstForm && gstDetails.gstin ? gstDetails : null,
      contactMobile,
      contactEmail,
      totalPaid: fareCalc.total,
      paymentMethod:
        paymentMethod === 'UPI'
          ? `UPI (${selectedUpiApp} • ${upiVpa})`
          : paymentMethod === 'NETBANKING'
          ? `NetBanking (${selectedBank})`
          : paymentMethod === 'WALLET'
          ? selectedWallet
          : 'Credit / Debit Card'
    };

    setMyTickets(prev => [ticket, ...prev]);
    setTicketModalData(ticket);
    setSelectedBerthIds(new Set());
    setAppliedCoupon(null);
    setCouponInput('');
    setShowPaymentModal(false);
    showToast(`PNR ${pnr} confirmed! Your Electronic Reservation Slip is ready.`, 'success');
  };

  // Admin Revenue & Occupancy Analytics
  const adminMetrics = useMemo(() => {
    const totalBerths = currentBerths.length;
    const booked = currentBerths.filter(b => b.status === 'BOOKED').length;
    const quota = currentBerths.filter(b => b.status === 'QUOTA').length;
    const avail = totalBerths - booked - quota;
    const occPct = Math.round((booked / totalBerths) * 100);
    const estRevenue = Math.round(booked * currentClassMeta.fare * flexiFareMultiplier);
    return { totalBerths, booked, quota, avail, occPct, estRevenue };
  }, [currentBerths, currentClassMeta, flexiFareMultiplier]);

  // First Screen: Login / Sign-Up Portal
  if (!user) {
    return <AuthPortal onLogin={(u) => setUser(u)} />;
  }

  const fromStationObj = STATIONS.find(s => s.code === fromCode) || STATIONS[0];
  const toStationObj = STATIONS.find(s => s.code === toCode) || STATIONS[1];
  const selectedDateObj = resolveTravelDateObj(travelDate, TRAVEL_DATES);
  const activeLiveTrain = TRAINS_CATALOG.find(t => t.number === liveTrainNum) || TRAINS_CATALOG[0];

  return (
    <div className="railyatra-font min-h-screen bg-[#F2F4F7] text-slate-900 flex flex-col">
      <style>{FONT_STYLES}</style>
      {/* ==================================================================== */}
      {/* TOP NAVY TRAVEL HERO HEADER + FLOATING WHITE MAKEMYTRIP PILL NAVBAR  */}
      {/* ==================================================================== */}
      <div className="bg-gradient-to-b from-[#051322] via-[#0D2B52] to-[#15457B] text-white pb-10">
        {/* Top Utility Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3.5 pb-4 flex flex-wrap items-center justify-between gap-3">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('TRAINS')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#D9381E] flex items-center justify-center shadow-md">
              <Train className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight leading-none">
                RailYatra <span className="text-[#53B2FE]">3D</span>
              </div>
              <div className="text-[11px] text-sky-200 mt-0.5">
                IRCTC Authorised 3D Berth Booking
              </div>
            </div>
          </div>

          {/* Right User Pill + Live RBAC Role Switcher + Sign Out */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3.5 py-1.5 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  user.role === 'ADMIN'
                    ? 'bg-orange-400'
                    : user.role === 'TTE'
                    ? 'bg-sky-300'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="hidden sm:inline text-sky-100">Hi, {user.name.split(' ')[0]}</span>
              <select
                aria-label="Switch RBAC Role"
                value={user.role}
                onChange={(e) => {
                  const nextRole = e.target.value;
                  setUser(DEMO_USERS[nextRole]);
                  if (nextRole !== 'PASSENGER') setActiveTab('COACH_3D');
                  showToast(`Switched view to ${DEMO_USERS[nextRole].roleLabel}`);
                }}
                className="bg-transparent font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="PASSENGER" className="text-slate-900">Traveller Mode</option>
                <option value="TTE" className="text-slate-900">TTE Examiner Mode</option>
                <option value="ADMIN" className="text-slate-900">Railway Admin Mode</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setUser(null)}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Floating White MakeMyTrip Icon Navigation Pill Bar */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white text-slate-700 rounded-2xl shadow-xl border border-slate-200/80 px-2 py-2 flex items-center justify-around sm:justify-center sm:gap-2 overflow-x-auto">
            {[
              { id: 'TRAINS', label: 'Trains', icon: Train },
              { id: 'COACH_3D', label: '3D Coach View', icon: Layers, badge: activeCoach },
              ...(selectedBerthsList.length > 0 && user.role === 'PASSENGER'
                ? [{ id: 'REVIEW_BOOK', label: 'Review & Book', icon: CreditCard, count: selectedBerthsList.length }]
                : []),
              { id: 'PNR', label: 'PNR Status', icon: FileText, count: myTickets.length },
              { id: 'LIVE', label: 'Live Status', icon: Navigation },
              { id: 'FOOD', label: 'Food on Train', icon: Utensils }
            ].map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col sm:flex-row items-center gap-1.5 px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-blue-50 text-[#065AF3] border-b-2 border-[#065AF3]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${active ? 'text-[#065AF3]' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#065AF3] text-white font-bold">
                      {tab.badge}
                    </span>
                  )}
                  {tab.count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#00A16B] text-white font-bold tabular-nums">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: MAKEMYTRIP-STYLE TRAIN SEARCH & DISCOVERY                     */}
      {/* ==================================================================== */}
      {activeTab === 'TRAINS' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 -mt-6 pb-12 space-y-6">
          {/* Overlapping White Hero Search Card (Exact MakeMyTrip Style) */}
          <section className="bg-white rounded-3xl shadow-xl border border-slate-200 p-5 sm:p-7 relative">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Namaste, {user.name.split(' ')[0]}! Where are you travelling today?
                </h1>
                <p className="text-xs text-slate-500">
                  Inspect real-scale 3D LHB coaches, check window & charging positions, and book with zero UPI fee.
                </p>
              </div>
              <span className="text-xs font-bold text-[#00A16B] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                ● Live IRCTC Seat Inventory
              </span>
            </div>

            {/* Huge Bold Station & Date Picker Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 rounded-2xl border border-slate-200 overflow-visible divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-white">
              {/* FROM */}
              <div className="md:col-span-4 p-4 hover:bg-blue-50/40 transition relative">
                <StationSearchField
                  label="From"
                  value={fromCode}
                  stations={STATIONS}
                  onChange={setFromCode}
                  subtitleMode="gate"
                />

                {/* Circular Swap Button on Desktop */}
                <button
                  type="button"
                  onClick={() => {
                    const tmp = fromCode;
                    setFromCode(toCode);
                    setToCode(tmp);
                  }}
                  title="Swap stations"
                  className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-slate-300 shadow-md items-center justify-center text-[#065AF3] hover:bg-blue-50 cursor-pointer"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* TO */}
              <div className="md:col-span-4 p-4 md:pl-7 hover:bg-blue-50/40 transition">
                <StationSearchField
                  label="To"
                  value={toCode}
                  stations={STATIONS}
                  onChange={setToCode}
                  subtitleMode="state"
                />
              </div>

              {/* TRAVEL DATE */}
              <div className="md:col-span-2 p-4 hover:bg-blue-50/40 transition">
                <TravelDatePickerField
                  selectedIso={travelDate}
                  onSelectDate={setTravelDate}
                />
              </div>

              {/* CLASS */}
              <div className="md:col-span-2 p-4 hover:bg-blue-50/40 transition">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Class</label>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="w-full bg-transparent text-lg font-extrabold text-slate-900 focus:outline-none cursor-pointer mt-1"
                >
                  <option value="ALL">All Classes</option>
                  <option value="3A">3A • AC 3-Tier</option>
                  <option value="2A">2A • AC 2-Tier</option>
                  <option value="1A">1A • First AC</option>
                </select>
                <div className="text-xs text-[#00A16B] font-semibold mt-0.5">3D Coach Map Included</div>
              </div>
            </div>

            {/* Special Fare / Quota Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">Select a Fare / Quota:</span>
              {QUOTA_PILLS.map(q => {
                const active = quotaPill === q.id;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setQuotaPill(q.id)}
                    className={`px-3.5 py-2 rounded-xl border text-left transition cursor-pointer ${
                      active
                        ? 'bg-blue-50 border-[#065AF3] text-[#065AF3]'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${active ? 'bg-[#065AF3]' : 'bg-slate-300'}`} />
                      {q.label}
                    </div>
                    <div className="text-[10px] text-slate-500">{q.sub}</div>
                  </button>
                );
              })}
            </div>

            {/* Floating Bottom-Center MakeMyTrip Blue Gradient SEARCH CTA */}
            <div className="flex justify-center mt-6 -mb-11">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('train-results-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ background: 'linear-gradient(93deg, #53B2FE 0%, #065AF3 100%)' }}
                className="px-10 py-3.5 rounded-full text-white font-extrabold text-sm sm:text-base uppercase tracking-wider shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition cursor-pointer"
              >
                Search Trains
              </button>
            </div>
          </section>

          {/* 7-Day Horizontal Date & Availability Strip */}
          <section id="train-results-section" className="pt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {TRAVEL_DATES.map(d => {
              const active = travelDate === d.date;
              return (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => setTravelDate(d.date)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    active
                      ? 'bg-white border-2 border-[#065AF3] shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-extrabold text-slate-800">
                    {d.weekday}, {d.dayNum} {d.month}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-2 h-2 rounded-full ${d.tone === 'green' ? 'bg-[#00A16B]' : 'bg-amber-500'}`} />
                    <span className={`text-xs font-bold ${d.tone === 'green' ? 'text-[#00A16B]' : 'text-amber-600'}`}>
                      {d.avail}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    From ₹{d.minFare.toLocaleString('en-IN')}
                  </div>
                </button>
              );
            })}
          </section>

          {/* Left Sidebar Filters + Right Clean White Train Cards */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Filters Sidebar */}
            <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="font-extrabold text-sm text-slate-900">Filter Trains</h2>
                <button
                  type="button"
                  onClick={() => {
                    setDepSlotFilter('ALL');
                    setClassFilter('ALL');
                    setOnlyFreeCancel(false);
                  }}
                  className="text-xs font-bold text-[#065AF3] hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              </div>

              {/* Departure Time Slots */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700">Departure Time</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ALL', label: 'Any Time' },
                    { id: 'MORNING', label: '6 AM – 12 PM' },
                    { id: 'EVENING', label: '4 PM – 7 PM' },
                    { id: 'NIGHT', label: 'After 7 PM' }
                  ].map(slot => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setDepSlotFilter(slot.id)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        depSlotFilter === slot.id
                          ? 'bg-blue-50 border-[#065AF3] text-[#065AF3]'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Free Cancellation Toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-900">Free Cancellation</div>
                  <div className="text-[11px] text-slate-600">Full refund before charting</div>
                </div>
                <input
                  type="checkbox"
                  checked={onlyFreeCancel}
                  onChange={(e) => setOnlyFreeCancel(e.target.checked)}
                  className="w-4 h-4 accent-[#00A16B]"
                />
              </label>

              {/* Friendly Travel Tip Card */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900">
                  <Heart className="w-3.5 h-3.5 text-[#D9381E]" />
                  <span>Travelling with parents?</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Click <strong>Preview &amp; Pick Berth in 3D</strong> on any train and use our <strong>Berth Finder</strong> to pick quiet Lower Berths away from the washroom door.
                </p>
              </div>
            </aside>

            {/* Right Train Result Cards */}
            <div className="lg:col-span-9 space-y-4">
              {filteredTrains.map(train => (
                <div
                  key={train.number}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 space-y-4"
                >
                  {/* Train Header Row */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-extrabold text-slate-900">{train.name}</h3>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 tabular-nums">
                          #{train.number}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#00A16B] flex items-center gap-1 tabular-nums">
                          <Star className="w-3 h-3 fill-current" /> {train.rating} ({train.reviews})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{train.tagline}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                        <span className="font-semibold text-[#00A16B]">{train.punctuality}</span>
                        <span>•</span>
                        <span>
                          Runs:{' '}
                          {train.runningDays.map((d, i) => (
                            <span key={i} className="font-bold text-slate-800 mx-0.5">{d}</span>
                          ))}
                        </span>
                      </div>
                    </div>

                    {/* Departure -> Duration -> Arrival Timeline */}
                    <div className="flex items-center gap-5 bg-[#F2F4F7] px-4 py-2.5 rounded-2xl border border-slate-200/80 tabular-nums">
                      <div>
                        <div className="text-lg font-extrabold text-slate-900">{train.depTime}</div>
                        <div className="text-xs font-bold text-slate-500">{train.from}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[11px] font-bold text-slate-600">{train.duration}</div>
                        <div className="w-20 h-0.5 bg-slate-300 my-1 relative">
                          <span className="absolute -top-1 left-0 w-2.5 h-2.5 rounded-full bg-[#065AF3]" />
                          <span className="absolute -top-1 right-0 w-2.5 h-2.5 rounded-full bg-[#00A16B]" />
                        </div>
                        <div className="text-[10px] text-slate-500">{train.distance}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-slate-900">
                          {train.arrTime}{' '}
                          {train.nextDay && <span className="text-xs font-bold text-[#D9381E]">{train.nextDay}</span>}
                        </div>
                        <div className="text-xs font-bold text-slate-500">{train.to}</div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Coach Position Bar */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80 text-[11px]">
                    <span className="font-bold text-slate-500 mr-1">Coach Position:</span>
                    {train.rake.map((c, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded-md font-bold border ${
                          c === 'ENG' || c === 'DTC'
                            ? 'bg-red-50 border-red-200 text-[#D9381E]'
                            : c === 'PC'
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : c.startsWith('H') || c.startsWith('A') || c.startsWith('B')
                            ? 'bg-white border-blue-200 text-[#065AF3]'
                            : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* Horizontal Clickable Class Availability Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {train.classes.map(cls => (
                      <div
                        key={cls.code}
                        onClick={() => openIn3D(train, cls)}
                        className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#065AF3] bg-white hover:bg-blue-50/30 transition cursor-pointer flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm text-slate-900">
                              {cls.code} • {cls.label}
                            </span>
                            <span className="font-extrabold text-base text-slate-900 tabular-nums">
                              ₹{Math.round(cls.fare * flexiFareMultiplier).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-xs font-extrabold text-[#00A16B] tabular-nums">{cls.status}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#065AF3]">
                              {cls.guarantee}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          style={{ background: 'linear-gradient(93deg, #53B2FE 0%, #065AF3 100%)' }}
                          className="mt-3 w-full py-2 px-3 rounded-full text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm group-hover:shadow-md transition cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Preview &amp; Pick Berth in 3D</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: ULTRA-DETAILED HIGH-LOD 3D LHB COACH VIEWER & RBAC CONSOLES   */}
      {/* ==================================================================== */}
      {activeTab === 'COACH_3D' && (
        <main className="flex-1 max-w-[1520px] w-full mx-auto px-4 sm:px-6 -mt-5 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT STAGE (8 COLS): 3D COACH INTERIOR + CONTROLS */}
          <section className="lg:col-span-8 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Top Coach & Rake Switcher Bar */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('TRAINS')}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  ← All Trains
                </button>
                <div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {selectedTrain.number} • {selectedTrain.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    Coach <strong className="text-[#065AF3]">{activeCoach}</strong> ({selectedClass}) •{' '}
                    {selectedTrain.from} → {selectedTrain.to}
                  </div>
                </div>
              </div>

              {/* Interactive Rake Car Switcher */}
              <div className="flex flex-wrap items-center gap-1 text-[11px]">
                {selectedTrain.rake.map((car, i) => {
                  const isActive = car === activeCoach;
                  const isBookable = car.startsWith('H') || car.startsWith('A') || car.startsWith('B');
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => switchCoachFromRake(car)}
                      className={`px-2 py-1 rounded-lg font-bold border transition cursor-pointer ${
                        isActive
                          ? 'bg-[#065AF3] border-[#065AF3] text-white shadow-sm'
                          : isBookable
                          ? 'bg-blue-50/70 border-blue-200 text-[#065AF3] hover:bg-blue-100'
                          : 'bg-slate-100 border-slate-200 text-slate-400'
                      }`}
                    >
                      {car}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day/Night Mode, Quality Toggle & Active LOD Telemetry Strip */}
            <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNightMode(v => !v);
                    showToast(
                      !nightMode
                        ? 'Night Sleeper Mode: Middle berths unfolded, reading lamps & blankets ready!'
                        : 'Day Seating Mode: Middle berths folded down for sunlit daytime travel.'
                    );
                  }}
                  className={`px-3.5 py-1.5 rounded-full font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                    nightMode
                      ? 'bg-[#0D2B52] border-[#0D2B52] text-amber-300'
                      : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}
                >
                  {nightMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                  <span>{nightMode ? 'Night Sleeper Mode' : 'Day Seating Mode'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQualityMode(q => (q === 'ULTRA' ? 'BALANCED' : 'ULTRA'))}
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Gauge className="w-3.5 h-3.5 text-[#065AF3]" />
                  <span>{qualityMode === 'ULTRA' ? 'Ultra Realistic' : 'Balanced 60 FPS'}</span>
                </button>
              </div>

              {/* Live Active THREE.LOD Tier Pill */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#00A16B] font-bold text-[11px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00A16B]" />
                  {activeLodLabel}
                </span>
              </div>
            </div>

            {/* 3D WebGL Viewport */}
            <div className="flex-1 p-3 bg-slate-100 relative min-h-[500px]">
              <UltraDetailLhbCoach3D
                berths={currentBerths}
                selectedIds={selectedBerthIds}
                onSelectBerth={handleBerthSelect}
                cameraMode={cameraMode}
                sitBerthId={sitBerthId}
                nightMode={nightMode}
                qualityMode={qualityMode}
                coachClass={selectedClass}
                onLodChange={setActiveLodLabel}
              />
            </div>

            {/* Bottom Camera Presets + Sit-On-Berth POV + Legend */}
            <div className="px-5 py-3.5 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'CUTAWAY', label: 'Cutaway Overview' },
                  { id: 'BAY_CLOSEUP', label: 'Bay Close-Up' },
                  { id: 'WALKTHROUGH', label: 'Walkthrough Aisle' },
                  { id: 'WINDOW_SIDE', label: 'Window & Side' }
                ].map(cam => (
                  <button
                    key={cam.id}
                    type="button"
                    onClick={() => setCameraMode(cam.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                      cameraMode === cam.id
                        ? 'bg-[#0D2B52] border-[#0D2B52] text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}

                {/* Sit on Berth 1st-Person POV Button */}
                <button
                  type="button"
                  onClick={() => {
                    const target = inspectedBerth || currentBerths[0];
                    setSitBerthId(target.id);
                    setCameraMode('SIT_POV');
                    showToast(`Seated on Berth #${target.displayNum} (${target.name}) — drag to look around!`, 'info');
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                    cameraMode === 'SIT_POV'
                      ? 'bg-[#065AF3] border-[#065AF3] text-white shadow-sm'
                      : 'bg-blue-50 border-blue-200 text-[#065AF3] hover:bg-blue-100'
                  }`}
                >
                  <Armchair className="w-3.5 h-3.5" />
                  <span>Sit on Berth #{inspectedBerth?.displayNum || 1} (POV)</span>
                </button>
              </div>

              {/* Status Color Legend */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#0E7490]" /> Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#065AF3]" /> Your Selection
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#D97706]" /> Ladies / Senior
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#64748B]" /> Booked
                </span>
              </div>
            </div>
          </section>

          {/* RIGHT STAGE (4 COLS): RBAC CONTEXTUAL SIDEBAR */}
          <aside className="lg:col-span-4 flex flex-col gap-4">
            {/* ============================================================== */}
            {/* ROLE 1: TRAVELLER (BERTH FINDER + QUICK SELECTION SUMMARY)     */}
            {/* ============================================================== */}
            {user.role === 'PASSENGER' && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex-1 flex flex-col">
                <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setSidebarMode('BUDDY')}
                    className={`py-3.5 text-xs font-extrabold flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
                      sidebarMode === 'BUDDY'
                        ? 'border-[#065AF3] text-[#065AF3] bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>Berth Finder</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarMode('BOOKING')}
                    className={`py-3.5 text-xs font-extrabold flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
                      sidebarMode === 'BOOKING'
                        ? 'border-[#065AF3] text-[#065AF3] bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Selected Berths</span>
                    {selectedBerthsList.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-[#065AF3] text-white text-[10px] tabular-nums">
                        {selectedBerthsList.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* BERTH FINDER PANEL */}
                {sidebarMode === 'BUDDY' && (
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-3 overflow-y-auto max-h-[450px] pr-1">
                      {/* Quick Humanised Prompts */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-500">
                          Popular seat preferences:
                        </div>
                        {[
                          'Find 2 lower berths for my parents',
                          'Quiet side lower with window & charger',
                          'Best family bay for 4'
                        ].map(prompt => (
                          <button
                            key={prompt}
                            type="button"
                            onClick={() => askBerthBuddy(prompt)}
                            className="w-full text-left px-3.5 py-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/80 text-xs font-bold text-[#0D2B52] flex items-center justify-between transition cursor-pointer"
                          >
                            <span>“{prompt}”</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#065AF3]" />
                          </button>
                        ))}
                      </div>

                      {/* Conversation Feed */}
                      <div className="space-y-2.5 pt-2">
                        {buddyMessages.map(m => (
                          <div
                            key={m.id}
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                              m.sender === 'USER'
                                ? 'ml-8 bg-[#065AF3] text-white rounded-tr-sm'
                                : 'mr-4 bg-[#F2F4F7] text-slate-800 rounded-tl-sm border border-slate-200'
                            }`}
                          >
                            <div>{m.text}</div>
                            {m.berths && m.berths.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                                <div className="flex flex-wrap gap-1">
                                  {m.berths.map(num => (
                                    <span
                                      key={num}
                                      className="px-2 py-0.5 rounded-full bg-blue-100 text-[#065AF3] font-bold text-[11px] tabular-nums"
                                    >
                                      Berth #{num}
                                    </span>
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setActiveTab('REVIEW_BOOK')}
                                  className="text-xs font-extrabold text-[#00A16B] hover:underline cursor-pointer"
                                >
                                  Review &amp; Book →
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        askBerthBuddy(buddyInput);
                      }}
                      className="pt-3 border-t border-slate-200 flex gap-2"
                    >
                      <input
                        type="text"
                        value={buddyInput}
                        onChange={(e) => setBuddyInput(e.target.value)}
                        placeholder="e.g., Lower berth near window..."
                        className="flex-1 px-3.5 py-2.5 text-xs border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#065AF3]"
                      />
                      <button
                        type="submit"
                        style={{ background: 'linear-gradient(93deg, #53B2FE 0%, #065AF3 100%)' }}
                        className="px-4 py-2.5 rounded-full text-white font-bold text-xs cursor-pointer"
                      >
                        Find
                      </button>
                    </form>
                  </div>
                )}

                {/* SELECTED BERTHS & LAUNCH FULL REVIEW & BOOK PANEL */}
                {sidebarMode === 'BOOKING' && (
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3 overflow-y-auto max-h-[600px]">
                    <div className="space-y-3">
                      {selectedBerthsList.length === 0 ? (
                        <div className="py-10 px-4 text-center rounded-2xl bg-[#F2F4F7] border border-dashed border-slate-300">
                          <Armchair className="w-8 h-8 text-[#065AF3] mx-auto mb-2" />
                          <div className="text-sm font-extrabold text-slate-900">
                            Pick your preferred berth in 3D
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Click any teal or amber berth in the coach, or use Berth Finder to locate ideal seats.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-slate-800">
                              Coach {activeCoach} • {selectedBerthsList.length} Berth{selectedBerthsList.length > 1 ? 's' : ''} Locked
                            </span>
                            <span className="text-[#00A16B] font-bold">Instant PNR</span>
                          </div>
                          {selectedBerthsList.map(b => (
                            <div key={b.id} className="p-3 rounded-2xl bg-[#F2F4F7] border border-slate-200 flex items-center justify-between gap-2">
                              <div>
                                <div className="text-xs font-extrabold text-[#065AF3] tabular-nums">
                                  Berth #{b.displayNum} • {b.name} ({b.code})
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {b.bayLabel} • {b.charging ? '230V + USB' : 'Standard'}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleBerthSelect(b.id)}
                                className="text-xs font-bold text-[#D9381E] hover:underline cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          ))}

                          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#00A16B] shrink-0 mt-0.5" />
                            <span>
                              Add passenger details, IRCTC ID verification, boarding point, GST, and promo codes on the next step.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Fare Estimate & Proceed to Review & Book */}
                    <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs tabular-nums">
                      <div className="flex justify-between text-slate-600">
                        <span>Ticket Fare ({selectedBerthsList.length}x {selectedClass})</span>
                        <span className="font-bold text-slate-900">
                          ₹{(fareCalc.base + fareCalc.reservationCharge + fareCalc.superfastCharge + fareCalc.surge).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Estimated Taxes &amp; Protection</span>
                        <span className="font-bold text-slate-900">
                          ₹{(fareCalc.gst + fareCalc.protectionTotal + fareCalc.insuranceTotal).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                        <span>Estimated Total</span>
                        <span className="text-[#065AF3]">₹{fareCalc.total.toLocaleString('en-IN')}</span>
                      </div>

                      <button
                        type="button"
                        disabled={selectedBerthsList.length === 0}
                        onClick={() => setActiveTab('REVIEW_BOOK')}
                        style={
                          selectedBerthsList.length > 0
                            ? { background: 'linear-gradient(93deg, #53B2FE 0%, #065AF3 100%)' }
                            : undefined
                        }
                        className={`w-full py-3.5 rounded-full font-bold text-xs sm:text-sm mt-2 transition flex items-center justify-center gap-2 ${
                          selectedBerthsList.length === 0
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'text-white shadow-lg hover:shadow-xl cursor-pointer'
                        }`}
                      >
                        <span>
                          {selectedBerthsList.length === 0
                            ? 'Select a Berth in 3D First'
                            : 'Continue to Traveller Details & Pay'}
                        </span>
                        {selectedBerthsList.length > 0 && <ArrowRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* ROLE 2: TTE (ONBOARD TICKET EXAMINER) HHT CONSOLE              */}
            {/* ============================================================== */}
            {user.role === 'TTE' && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-[11px] font-bold uppercase text-[#065AF3]">
                        HHT Digital Chart • Coach {activeCoach}
                      </span>
                      <h2 className="text-base font-extrabold text-slate-900">
                        Onboard Passenger Verification
                      </h2>
                    </div>
                    <UserCheck className="w-6 h-6 text-[#065AF3]" />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 mb-3">
                    Tap any booked berth in 3D or use the list below to verify Govt ID, mark Boarded, or release No-Show berths instantly for RAC passengers.
                  </p>

                  <div className="space-y-2.5 max-h-[430px] overflow-y-auto pr-1">
                    {currentBerths
                      .filter(b => b.status === 'BOOKED')
                      .map(b => (
                        <div key={b.id} className="p-3 rounded-2xl bg-[#F2F4F7] border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900">
                              Berth #{b.displayNum} ({b.code}) • {b.pax?.name}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600">
                            PNR: <strong>{b.pnr}</strong> • {b.pax?.age}Y/{b.pax?.gender} • {b.pax?.idProof}
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleBerthSelect(b.id)}
                              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                                b.boarded
                                  ? 'bg-[#00A16B] text-white'
                                  : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100'
                              }`}
                            >
                              {b.boarded ? '✓ Boarded & Verified' : 'Verify ID & Board'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTteNoShow(b.id)}
                              className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 hover:bg-red-100 text-[#D9381E] border border-red-200 cursor-pointer"
                            >
                              No-Show
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500">Verification Progress:</span>
                  <span className="text-[#00A16B]">
                    {currentBerths.filter(b => b.status === 'BOOKED' && b.boarded).length} /{' '}
                    {currentBerths.filter(b => b.status === 'BOOKED').length} Passengers Boarded
                  </span>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* ROLE 3: RAILWAY ADMIN FLEET & REVENUE CONSOLE                  */}
            {/* ============================================================== */}
            {user.role === 'ADMIN' && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-[11px] font-bold uppercase text-[#D9381E]">
                        Railway Operations • Coach {activeCoach}
                      </span>
                      <h2 className="text-base font-extrabold text-slate-900">
                        Flexi-Fare &amp; Quota Manager
                      </h2>
                    </div>
                    <Sliders className="w-6 h-6 text-[#D9381E]" />
                  </div>

                  {/* Live Occupancy & Revenue KPIs */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200">
                      <div className="text-[11px] font-bold text-slate-600">Coach Occupancy</div>
                      <div className="text-xl font-extrabold text-[#065AF3] mt-0.5">
                        {adminMetrics.occPct}%
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {adminMetrics.booked} / {adminMetrics.totalBerths} Berths Booked
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <div className="text-[11px] font-bold text-slate-600">Coach Revenue</div>
                      <div className="text-xl font-extrabold text-[#00A16B] mt-0.5">
                        ₹{adminMetrics.estRevenue.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-500">Live Flexi-Fare Applied</div>
                    </div>
                  </div>

                  {/* Dynamic Flexi-Fare Multiplier Slider */}
                  <div className="p-4 rounded-2xl bg-[#F2F4F7] border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">Dynamic Flexi-Fare Surge</span>
                      <span className="text-[#D9381E]">
                        {flexiFareMultiplier.toFixed(1)}x (₹
                        {Math.round(currentClassMeta.fare * flexiFareMultiplier).toLocaleString('en-IN')})
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="1.5"
                      step="0.1"
                      value={flexiFareMultiplier}
                      onChange={(e) => setFlexiFareMultiplier(parseFloat(e.target.value))}
                      className="w-full accent-[#065AF3] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                      <span>1.0x Standard</span>
                      <span>1.2x Peak</span>
                      <span>1.5x Tatkal Cap</span>
                    </div>
                  </div>

                  {/* Quota Override Controls */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700">
                      Coach {activeCoach} Quota Controls
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Click any vacant berth in 3D to toggle Ladies/Senior priority, or use bulk actions:
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setCoachDB(prev => ({
                            ...prev,
                            [dbKey]: currentBerths.map(b =>
                              b.status === 'QUOTA' ? { ...b, status: 'AVAILABLE', quota: 'General' } : b
                            )
                          }));
                          showToast(`Released all Ladies/Senior quota berths in ${activeCoach}`, 'success');
                        }}
                        className="py-2.5 px-3 rounded-full bg-[#065AF3] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Release Quotas
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCoachDB(prev => ({
                            ...prev,
                            [dbKey]: generateCoachBerths(selectedClass, activeCoach)
                          }));
                          showToast(`Reset Coach ${activeCoach} inventory`);
                        }}
                        className="py-2.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                      >
                        Reset Coach
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </main>
      )}

      {/* ==================================================================== */}
      {/* TAB 2B: ENHANCED PRODUCTION TICKET BOOKING & REVIEW CHECKOUT PAGE    */}
      {/* ==================================================================== */}
      {activeTab === 'REVIEW_BOOK' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 -mt-5 pb-12">
          {selectedBerthsList.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-12 text-center space-y-3">
              <Armchair className="w-10 h-10 text-[#065AF3] mx-auto" />
              <h2 className="text-lg font-extrabold text-slate-900">No berths selected yet</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Return to the 3D Coach View to pick your preferred berths before entering traveller details.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('COACH_3D')}
                style={{ background: 'linear-gradient(93deg, #53B2FE 0%, #065AF3 100%)' }}
                className="px-6 py-2.5 rounded-full text-white font-bold text-xs cursor-pointer"
              >
                Back to 3D Coach View
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* LEFT COLUMN (8 COLS): JOURNEY, IRCTC ID, TRAVELLERS, CONTACT, PROTECTION */}
              <div className="lg:col-span-8 space-y-5">
                {/* 1. JOURNEY & BOARDING DETAILS CARD */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setActiveTab('COACH_3D')}
                        className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        ← Edit 3D Berths
                      </button>
                      <h1 className="text-base sm:text-lg font-extrabold text-slate-900">
                        Review Your Journey
                      </h1>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#065AF3] font-bold">
                        {selectedClass} • {currentClassMeta.label}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">
                        {QUOTA_PILLS.find(q => q.id === quotaPill)?.label || 'Regular'} Quota
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-lg font-extrabold text-slate-900 tabular-nums">
                        {selectedTrain.name} <span className="text-slate-500 font-bold">#{selectedTrain.number}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                        Travel Date: <strong className="text-slate-800">{selectedDateObj.weekday}, {selectedDateObj.dayNum} {selectedDateObj.month} 2026</strong> • {selectedTrain.distance}
                      </div>
                    </div>

                    <div className="flex items-center gap-5 bg-[#F2F4F7] px-4 py-2.5 rounded-2xl border border-slate-200/80 tabular-nums">
                      <div>
                        <div className="text-lg font-extrabold text-slate-900">{selectedTrain.depTime}</div>
                        <div className="text-xs font-bold text-slate-600">{selectedTrain.from}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[11px] font-bold text-slate-500">{selectedTrain.duration}</div>
                        <div className="w-16 h-0.5 bg-slate-300 my-1" />
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-slate-900">
                          {selectedTrain.arrTime}{' '}
                          {selectedTrain.nextDay && <span className="text-xs text-[#D9381E]">{selectedTrain.nextDay}</span>}
                        </div>
                        <div className="text-xs font-bold text-slate-600">{selectedTrain.to}</div>
                      </div>
                    </div>
                  </div>

                  {/* Selected Coach & Berths + Change Boarding Station Dropdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/70">
                      <div className="text-[11px] font-bold text-slate-500 mb-1.5">
                        Selected 3D Coach &amp; Berths (Coach {activeCoach})
                      </div>
                      <div className="flex flex-wrap gap-1.5 tabular-nums">
                        {selectedBerthsList.map(b => (
                          <span
                            key={b.id}
                            className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-xs font-bold text-[#065AF3]"
                          >
                            {activeCoach} / #{b.displayNum} ({b.code})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#065AF3]" />
                        <span>Change Boarding Station</span>
                      </label>
                      <select
                        value={boardingStation}
                        onChange={(e) => setBoardingStation(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065AF3] tabular-nums"
                      >
                        {selectedTrain.liveStatus.stops.slice(0, -1).map((st, idx) => (
                          <option key={idx} value={`${st.name} (${st.time})`}>
                            {st.name} — Dep {st.time} ({st.pf})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                {/* 2. IRCTC ACCOUNT VERIFICATION BAR */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-5 h-5 text-[#065AF3]" />
                      <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                        IRCTC Account Details
                      </h2>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Required by Indian Railways to issue your e-ticket
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                    <input
                      type="text"
                      value={irctcUserId}
                      onChange={(e) => {
                        setIrctcUserId(e.target.value);
                        setIrctcVerified(false);
                      }}
                      placeholder="Enter your IRCTC User ID"
                      className="flex-1 px-4 py-2.5 text-sm font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#065AF3]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (irctcUserId.trim().length < 4) {
                          showToast('Please enter a valid IRCTC User ID (min 4 characters).', 'warn');
                          return;
                        }
                        setIrctcVerified(true);
                        showToast(`IRCTC User ID "${irctcUserId}" verified!`, 'success');
                      }}
                      className={`px-6 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        irctcVerified
                          ? 'bg-emerald-50 text-[#00A16B] border border-emerald-300'
                          : 'bg-[#065AF3] hover:bg-blue-700 text-white'
                      }`}
                    >
                      {irctcVerified ? '✓ Verified' : 'Verify ID'}
                    </button>
                  </div>

                  {irctcVerified && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#00A16B] bg-emerald-50/70 border border-emerald-200 px-3.5 py-2 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>IRCTC ID verified — instant e-ticket generation enabled</span>
                    </div>
                  )}
                </section>

                {/* 3. MULTI-PASSENGER DETAILS FORM + SAVED TRAVELLERS */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                        Traveller Details ({selectedBerthsList.length} / 6)
                      </h2>
                      <p className="text-xs text-slate-500">
                        Enter names exactly as on Government Photo ID (Aadhaar, PAN, or Passport)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTravellerAutoBerth}
                      className="px-3.5 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-[#065AF3] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Traveller</span>
                    </button>
                  </div>

                  {/* Quick-Fill Saved Travellers Chips */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-500">
                      Quick-fill from Saved Travellers:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SAVED_TRAVELLERS.map((st, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplySavedTraveller(st)}
                          className="px-3 py-1.5 rounded-full bg-[#F2F4F7] hover:bg-blue-50 border border-slate-200 hover:border-[#065AF3] text-xs font-semibold text-slate-700 hover:text-[#065AF3] transition cursor-pointer"
                        >
                          + {st.name} ({st.age}, {st.gender[0]})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Passenger Rows */}
                  <div className="space-y-3">
                    {selectedBerthsList.map((b, idx) => {
                      const f = paxForms[b.id] || {
                        name: '',
                        age: '32',
                        gender: 'Male',
                        berthPref: 'No Preference',
                        mealPref: 'Veg',
                        nationality: 'India'
                      };
                      const updateField = (key, val) =>
                        setPaxForms(prev => ({
                          ...prev,
                          [b.id]: { ...f, [key]: val }
                        }));

                      return (
                        <div
                          key={b.id}
                          className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-[#065AF3] text-white text-xs font-bold flex items-center justify-center tabular-nums">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                                Coach {activeCoach} • Berth #{b.displayNum} ({b.name})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleBerthSelect(b.id)}
                              className="text-xs font-bold text-[#D9381E] hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                            <div className="sm:col-span-5">
                              <label className="block font-bold text-slate-600 mb-1">Full Name</label>
                              <input
                                type="text"
                                value={f.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                placeholder="Full name as on ID"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#065AF3]"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block font-bold text-slate-600 mb-1">Age</label>
                              <input
                                type="number"
                                min="5"
                                max="115"
                                value={f.age}
                                onChange={(e) => updateField('age', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl tabular-nums focus:outline-none focus:ring-2 focus:ring-[#065AF3]"
                              />
                            </div>
                            <div className="sm:col-span-5">
                              <label className="block font-bold text-slate-600 mb-1">Gender</label>
                              <div className="grid grid-cols-3 gap-1.5">
                                {['Male', 'Female', 'Transgender'].map(g => (
                                  <button
                                    key={g}
                                    type="button"
                                    onClick={() => updateField('gender', g)}
                                    className={`py-2 px-1 rounded-xl font-bold border text-[11px] transition cursor-pointer ${
                                      f.gender === g
                                        ? 'bg-blue-50 border-[#065AF3] text-[#065AF3]'
                                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    {g === 'Transgender' ? 'Other' : g}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="sm:col-span-4">
                              <label className="block font-bold text-slate-600 mb-1">Berth Preference</label>
                              <select
                                value={f.berthPref}
                                onChange={(e) => updateField('berthPref', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none"
                              >
                                <option value="No Preference">No Preference</option>
                                <option value="Lower">Lower Berth</option>
                                <option value="Middle">Middle Berth</option>
                                <option value="Upper">Upper Berth</option>
                                <option value="Side Lower">Side Lower</option>
                                <option value="Side Upper">Side Upper</option>
                              </select>
                            </div>
                            <div className="sm:col-span-4">
                              <label className="block font-bold text-slate-600 mb-1">Meal Preference</label>
                              <select
                                value={f.mealPref}
                                onChange={(e) => updateField('mealPref', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none"
                              >
                                <option value="Veg">Veg Meal</option>
                                <option value="Non-Veg">Non-Veg Meal</option>
                                <option value="Jain">Jain Meal</option>
                                <option value="No Food">No Food</option>
                              </select>
                            </div>
                            <div className="sm:col-span-4">
                              <label className="block font-bold text-slate-600 mb-1">Nationality</label>
                              <select
                                value={f.nationality}
                                onChange={(e) => updateField('nationality', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none"
                              >
                                <option value="India">India</option>
                                <option value="Other">Foreign National</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* 4. CONTACT, WHATSAPP ALERTS & OPTIONAL GST DETAILS */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Contact Information &amp; Ticket Delivery
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Mobile Number</label>
                      <div className="flex">
                        <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl font-bold text-slate-700 tabular-nums">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={contactMobile}
                          onChange={(e) => setContactMobile(e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-r-xl font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-[#065AF3]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#065AF3]"
                      />
                    </div>
                  </div>

                  {/* WhatsApp Alerts Toggle */}
                  <label className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 cursor-pointer text-xs">
                    <div className="flex items-center gap-2.5">
                      <MessageCircle className="w-4 h-4 text-[#00A16B]" />
                      <span className="font-bold text-slate-800">
                        Send e-ticket PDF, platform number &amp; live train alerts on WhatsApp
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={whatsappAlerts}
                      onChange={(e) => setWhatsappAlerts(e.target.checked)}
                      className="w-4 h-4 accent-[#00A16B]"
                    />
                  </label>

                  {/* Expandable Optional GST Details */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowGstForm(v => !v)}
                      className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        Add GST Details (Optional for Business Travel)
                      </span>
                      {showGstForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showGstForm && (
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white border-t border-slate-200">
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={gstDetails.company}
                          onChange={(e) => setGstDetails(g => ({ ...g, company: e.target.value }))}
                          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="15-Digit GSTIN"
                          value={gstDetails.gstin}
                          onChange={(e) => setGstDetails(g => ({ ...g, gstin: e.target.value.toUpperCase() }))}
                          className="px-3 py-2 border border-slate-300 rounded-lg uppercase tabular-nums focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Registered Billing City"
                          value={gstDetails.address}
                          onChange={(e) => setGstDetails(g => ({ ...g, address: e.target.value }))}
                          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </section>

                {/* 5. TRAVEL PROTECTION, IRCTC INSURANCE & E-CATERING ADD-ONS */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Travel Protection &amp; Seat-Side Meals
                  </h2>

                  <div className="space-y-2.5 text-xs">
                    {/* Authentic IRCTC Travel Insurance (₹0.45/pax) */}
                    <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={travelInsurance}
                          onChange={(e) => setTravelInsurance(e.target.checked)}
                          className="mt-0.5 w-4 h-4 accent-[#065AF3]"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900">
                            IRCTC Optional Travel Insurance
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Coverage up to ₹10,00,000 for accidental hospitalisation &amp; travel emergencies
                          </div>
                        </div>
                      </div>
                      <span className="font-extrabold text-slate-900 tabular-nums shrink-0">
                        ₹0.45 / pax
                      </span>
                    </label>

                    {/* Free Cancellation */}
                    <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 cursor-pointer">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={freeCancelAddon}
                          onChange={(e) => setFreeCancelAddon(e.target.checked)}
                          className="mt-0.5 w-4 h-4 accent-[#065AF3]"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900">
                            Free Cancellation — Zero Cancellation Fee
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Get 100% instant refund of base fare if cancelled anytime before chart preparation
                          </div>
                        </div>
                      </div>
                      <span className="font-extrabold text-[#065AF3] tabular-nums shrink-0">
                        ₹119 / pax
                      </span>
                    </label>

                    {/* Trip Guarantee 3X */}
                    <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 cursor-pointer">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={tripGuarantee}
                          onChange={(e) => setTripGuarantee(e.target.checked)}
                          className="mt-0.5 w-4 h-4 accent-[#00A16B]"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900">
                            Trip Guarantee (3X Refund Protection)
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Guaranteed confirmed travel or instant 3X travel voucher for alternate flights/trains
                          </div>
                        </div>
                      </div>
                      <span className="font-extrabold text-[#00A16B] tabular-nums shrink-0">
                        ₹149 / pax
                      </span>
                    </label>
                  </div>

                  {/* IRCTC e-Catering Meal Selector with Authentic Green Veg / Red Non-Veg Dot Indicators */}
                  <div className="pt-2 space-y-2">
                    <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Utensils className="w-4 h-4 text-[#D9381E]" />
                      <span>Pre-Order IRCTC e-Catering to Your Berth</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {ECATERING_MENU.map(m => {
                        const active = selectedMealId === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setSelectedMealId(m.id)}
                            className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start justify-between gap-2 ${
                              active
                                ? 'border-2 border-[#065AF3] bg-blue-50/40'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {/* Authentic Indian Veg (Green) / Non-Veg (Red) Square Symbol */}
                              {m.price > 0 && (
                                <span
                                  className={`mt-0.5 w-3.5 h-3.5 rounded-xs border flex items-center justify-center shrink-0 ${
                                    m.veg ? 'border-[#00A16B]' : 'border-[#D9381E]'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      m.veg ? 'bg-[#00A16B]' : 'bg-[#D9381E]'
                                    }`}
                                  />
                                </span>
                              )}
                              <div>
                                <div className="text-xs font-bold text-slate-900">{m.name}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">{m.station}</div>
                              </div>
                            </div>
                            <span className="text-xs font-extrabold text-slate-900 tabular-nums shrink-0">
                              {m.price > 0 ? `₹${m.price}` : '₹0'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>
              </div>

              {/* RIGHT COLUMN (4 COLS): STICKY FARE BREAKUP & PROMO CODES */}
              <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
                {/* Itemized Fare Breakup Card */}
                <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5 space-y-4">
                  <h2 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
                    Fare Breakup
                  </h2>

                  <div className="space-y-2.5 text-xs tabular-nums">
                    <div className="flex justify-between text-slate-600">
                      <span>Base Ticket Fare ({selectedBerthsList.length} Traveller{selectedBerthsList.length > 1 ? 's' : ''})</span>
                      <span className="font-bold text-slate-900">₹{fareCalc.base.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Reservation Charge</span>
                      <span className="font-bold text-slate-900">₹{fareCalc.reservationCharge.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Superfast Surcharge</span>
                      <span className="font-bold text-slate-900">₹{fareCalc.superfastCharge.toLocaleString('en-IN')}</span>
                    </div>
                    {fareCalc.surge > 0 && (
                      <div className="flex justify-between text-amber-700">
                        <span>Dynamic Flexi-Fare ({flexiFareMultiplier.toFixed(1)}x)</span>
                        <span className="font-bold">+₹{fareCalc.surge.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {fareCalc.mealTotal > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>e-Catering Meal Charge</span>
                        <span className="font-bold text-slate-900">₹{fareCalc.mealTotal.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {fareCalc.protectionTotal > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Trip Guarantee / Free Cancel</span>
                        <span className="font-bold text-slate-900">₹{fareCalc.protectionTotal.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {fareCalc.insuranceTotal > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>IRCTC Travel Insurance</span>
                        <span className="font-bold text-slate-900">₹{fareCalc.insuranceTotal.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>GST (5%)</span>
                      <span className="font-bold text-slate-900">₹{fareCalc.gst.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>IRCTC Convenience Fee</span>
                      <span className="font-bold text-slate-900">
                        {fareCalc.convenienceFee === 0 ? (
                          <span className="text-[#00A16B]">FREE</span>
                        ) : (
                          `₹${fareCalc.convenienceFee}`
                        )}
                      </span>
                    </div>
                    {fareCalc.discount > 0 && (
                      <div className="flex justify-between text-[#00A16B] font-bold pt-1">
                        <span>Promo Discount ({appliedCoupon?.code})</span>
                        <span>-₹{fareCalc.discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                      <span>Total Amount</span>
                      <span className="text-xl text-[#065AF3]">
                        ₹{fareCalc.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!irctcVerified) {
                        showToast('Please verify your IRCTC User ID first.', 'warn');
                        return;
                      }
                      setShowPaymentModal(true);
                    }}
                    style={{ background: 'linear-gradient(93deg, #53B2FE 0%, #065AF3 100%)' }}
                    className="w-full py-3.5 rounded-full text-white font-extrabold text-sm shadow-lg hover:shadow-xl transition cursor-pointer tabular-nums"
                  >
                    Proceed to Pay ₹{fareCalc.total.toLocaleString('en-IN')}
                  </button>
                </div>

                {/* Offers & Promo Codes Box */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                    <Tag className="w-4 h-4 text-[#00A16B]" />
                    <span>Offers &amp; Promo Codes</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter code (e.g. RAILFIRST)"
                      className="flex-1 px-3 py-2 text-xs font-bold uppercase border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#065AF3]"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCouponCode(couponInput)}
                      className="px-4 py-2 rounded-xl bg-[#0D2B52] hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  <div className="space-y-2 pt-1">
                    {PROMO_CODES.map(c => {
                      const isApplied = appliedCoupon?.code === c.code;
                      return (
                        <div
                          key={c.code}
                          onClick={() =>
                            isApplied ? setAppliedCoupon(null) : handleApplyCouponCode(c.code)
                          }
                          className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                            isApplied
                              ? 'bg-emerald-50/70 border-[#00A16B]'
                              : 'bg-slate-50 border-slate-200 hover:border-[#065AF3]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-white border border-dashed border-slate-400 text-[11px] font-extrabold text-slate-900">
                                {c.code}
                              </span>
                              <span className="text-xs font-extrabold text-[#00A16B]">{c.title}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">{c.desc}</div>
                          </div>
                          <span className="text-xs font-bold text-[#065AF3] shrink-0">
                            {isApplied ? 'Remove' : 'Apply'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>
            </div>
          )}
        </main>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: PNR STATUS & MY TRIPS WALLET                                  */}
      {/* ==================================================================== */}
      {activeTab === 'PNR' && (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 -mt-5 pb-12 space-y-5">
          <section className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6">
            <h1 className="text-xl font-extrabold text-slate-900">Check PNR Status &amp; My Trips</h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your 10-digit IRCTC PNR number or view tickets you booked in this session.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                maxLength={10}
                value={pnrLookupInput}
                onChange={(e) => setPnrLookupInput(e.target.value)}
                placeholder="Enter 10-digit PNR (e.g., 2849104412)"
                className="flex-1 px-4 py-3 text-sm border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#065AF3]"
              />
              <button
                type="button"
                onClick={() => {
                  if (pnrLookupInput.length < 6) {
                    showToast('Please enter a valid 10-digit PNR number.', 'warn');
                    return;
                  }
                  showToast(`PNR ${pnrLookupInput}: Status CONFIRMED (Chart Prepared)`, 'success');
                }}
                style={{ background: 'linear-gradient(93deg, #53B2FE 0%, #065AF3 100%)' }}
                className="px-7 py-3 rounded-full text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer"
              >
                Check Status
              </button>
            </div>
          </section>

          {myTickets.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-[#065AF3] mx-auto" />
              <div className="text-base font-extrabold text-slate-900">No upcoming journeys yet</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Search for a train, pick your exact berth inside our 3D coach viewer, and your confirmed E-Ticket will appear right here.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('TRAINS')}
                style={{ background: 'linear-gradient(93deg, #53B2FE 0%, #065AF3 100%)' }}
                className="px-6 py-2.5 rounded-full text-white font-bold text-xs cursor-pointer"
              >
                Explore Trains
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myTickets.map(t => (
                <div key={t.pnr} className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-dashed border-slate-300">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#00A16B] border border-emerald-200 text-xs font-extrabold">
                        CONFIRMED • PNR {t.pnr}
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-2">
                        {t.train.number} • {t.train.name}
                      </h3>
                      <div className="text-xs text-slate-500">
                        {t.train.from} → {t.train.to} • Travel Date: {t.date} • Class {t.coachClass}
                      </div>
                    </div>
                    <div className="p-2 rounded-2xl bg-slate-50 border border-slate-200">
                      <QrCode className="w-16 h-16 text-slate-900" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {t.passengers.map((p, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-[#F2F4F7] flex justify-between items-center">
                        <div>
                          <div className="font-extrabold text-slate-900">{p.name}</div>
                          <div className="text-slate-500">{p.age} yrs • {p.gender}</div>
                        </div>
                        <span className="font-extrabold text-[#00A16B]">{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: LIVE TRAIN RUNNING STATUS                                     */}
      {/* ==================================================================== */}
      {activeTab === 'LIVE' && (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 -mt-5 pb-12 space-y-5">
          <section className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">Live Train Running Status</h1>
                <p className="text-xs text-slate-500">Real-time NTES GPS telemetry, platform numbers &amp; speed</p>
              </div>
              <select
                value={liveTrainNum}
                onChange={(e) => setLiveTrainNum(e.target.value)}
                className="px-4 py-2.5 rounded-full border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none"
              >
                {TRAINS_CATALOG.map(t => (
                  <option key={t.number} value={t.number}>
                    {t.number} • {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-xs text-slate-600 font-semibold">Current Location</div>
                <div className="text-sm font-extrabold text-slate-900 mt-1">
                  {activeLiveTrain.liveStatus.currentStation}
                </div>
                <div className="text-xs font-bold text-[#00A16B] mt-0.5">
                  {activeLiveTrain.liveStatus.delay}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                <div className="text-xs text-slate-600 font-semibold">Live GPS Speed</div>
                <div className="text-lg font-extrabold text-[#065AF3] mt-1">
                  {activeLiveTrain.liveStatus.speed}
                </div>
                <div className="text-xs text-slate-500">LHB Electric Traction</div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="text-xs text-slate-600 font-semibold">Next Scheduled Halt</div>
                <div className="text-sm font-extrabold text-slate-900 mt-1">
                  {activeLiveTrain.liveStatus.nextStop}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {activeLiveTrain.liveStatus.stops.map((st, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F2F4F7] border border-slate-200">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-3.5 h-3.5 rounded-full ${
                        st.status === 'DEPARTED'
                          ? 'bg-[#00A16B]'
                          : st.status === 'CURRENT'
                          ? 'bg-[#065AF3] ring-4 ring-blue-200'
                          : 'bg-slate-300'
                      }`}
                    />
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">{st.name}</div>
                      <div className="text-xs text-slate-500">Expected Platform: {st.pf}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-slate-900">{st.time}</div>
                    <div className="text-[11px] font-bold text-[#00A16B]">{st.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: FOOD ON TRAIN (IRCTC E-CATERING)                              */}
      {/* ==================================================================== */}
      {activeTab === 'FOOD' && (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 -mt-5 pb-12 space-y-5">
          <section className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-5">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Fresh Food Delivered Right to Your Berth</h1>
              <p className="text-xs text-slate-500 mt-1">
                FSSAI-certified station kitchens. Pre-select your meal here and it will auto-attach to your next booking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ECATERING_MENU.filter(m => m.price > 0).map(meal => {
                const chosen = selectedMealId === meal.id;
                return (
                  <div
                    key={meal.id}
                    className={`p-5 rounded-2xl border flex flex-col justify-between transition ${
                      chosen ? 'border-2 border-[#00A16B] bg-emerald-50/40' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            meal.veg
                              ? 'bg-emerald-100 text-[#00A16B]'
                              : 'bg-red-100 text-[#D9381E]'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              meal.veg ? 'bg-[#00A16B]' : 'bg-[#D9381E]'
                            }`}
                          />
                          {meal.veg ? 'PURE VEG' : 'NON-VEG'}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{meal.station}</span>
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">{meal.name}</h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{meal.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-base font-extrabold text-slate-900 tabular-nums">₹{meal.price}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMealId(meal.id);
                          showToast(`Added "${meal.name}" to your booking cart!`, 'success');
                        }}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer ${
                          chosen
                            ? 'bg-[#00A16B] text-white'
                            : 'bg-blue-50 text-[#065AF3] hover:bg-blue-100'
                        }`}
                      >
                        {chosen ? '✓ Added to Trip' : '+ Add Meal'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      )}

      {/* ==================================================================== */}
      {/* REALISTIC INDIAN PAYMENT GATEWAY MODAL (UPI, CARDS, NETBANKING, WALLET) */}
      {/* ==================================================================== */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#051322] to-[#15457B] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-sky-200 font-semibold">
                  IRCTC iPay • 256-Bit Encrypted Payment Gateway
                </div>
                <h3 className="text-base font-extrabold">Select Payment Option</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-white/80 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Order Summary Strip */}
              <div className="p-4 rounded-2xl bg-[#F2F4F7] flex items-center justify-between tabular-nums">
                <div>
                  <div className="font-extrabold text-slate-900">
                    {selectedTrain.number} • {selectedTrain.name}
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Coach {activeCoach} ({selectedClass}) • Berths:{' '}
                    {selectedBerthsList.map(b => `#${b.displayNum}`).join(', ')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Payable</div>
                  <div className="text-lg font-extrabold text-[#065AF3]">
                    ₹{fareCalc.total.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'UPI', label: 'UPI', icon: QrCode },
                  { id: 'CARD', label: 'Cards', icon: CreditCard },
                  { id: 'NETBANKING', label: 'NetBanking', icon: Landmark },
                  { id: 'WALLET', label: 'Wallets', icon: Wallet }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`py-2.5 px-2 rounded-xl font-bold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      paymentMethod === m.id
                        ? 'bg-blue-50 border-[#065AF3] text-[#065AF3]'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <m.icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* TAB: UPI */}
              {paymentMethod === 'UPI' && (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-7 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                        <button
                          key={app}
                          type="button"
                          onClick={() => setSelectedUpiApp(app)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${
                            selectedUpiApp === app
                              ? 'bg-[#065AF3] border-[#065AF3] text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Enter UPI ID</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={upiVpa}
                          onChange={(e) => {
                            setUpiVpa(e.target.value);
                            setUpiVerified(false);
                          }}
                          className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#065AF3]"
                        />
                        <button
                          type="button"
                          onClick={() => setUpiVerified(true)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-50 text-[#00A16B] border border-emerald-200 font-bold cursor-pointer"
                        >
                          {upiVerified ? '✓ Verified' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <QrCode className="w-20 h-20 text-slate-900" />
                    <span className="text-[11px] font-semibold text-slate-600 mt-1.5">
                      Scan &amp; Pay with any UPI App
                    </span>
                  </div>
                </div>
              )}

              {/* TAB: CREDIT / DEBIT CARDS */}
              {paymentMethod === 'CARD' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      defaultValue="4532  8910  4412  8841"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-semibold tabular-nums"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      defaultValue="Aaravind Sharma"
                      placeholder="Name on Card"
                      className="col-span-1 px-3 py-2 border border-slate-300 rounded-xl"
                    />
                    <input
                      type="text"
                      defaultValue="09 / 29"
                      placeholder="MM / YY"
                      className="px-3 py-2 border border-slate-300 rounded-xl tabular-nums"
                    />
                    <input
                      type="password"
                      defaultValue="•••"
                      placeholder="CVV"
                      className="px-3 py-2 border border-slate-300 rounded-xl tabular-nums"
                    />
                  </div>
                </div>
              )}

              {/* TAB: NETBANKING */}
              {paymentMethod === 'NETBANKING' && (
                <div className="grid grid-cols-2 gap-2.5">
                  {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map(bank => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-3 rounded-xl border text-left font-bold flex items-center justify-between cursor-pointer ${
                        selectedBank === bank
                          ? 'bg-blue-50 border-[#065AF3] text-[#065AF3]'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{bank}</span>
                      {selectedBank === bank && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}

              {/* TAB: WALLETS */}
              {paymentMethod === 'WALLET' && (
                <div className="grid grid-cols-2 gap-2.5">
                  {['Paytm Wallet', 'Amazon Pay', 'PhonePe Wallet', 'Mobikwik'].map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWallet(w)}
                      className={`p-3 rounded-xl border text-left font-bold flex items-center justify-between cursor-pointer ${
                        selectedWallet === w
                          ? 'bg-blue-50 border-[#065AF3] text-[#065AF3]'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{w}</span>
                      {selectedWallet === w && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleCompletePayment}
                style={{ background: 'linear-gradient(93deg, #53B2FE 0%, #065AF3 100%)' }}
                className="w-full py-3.5 rounded-full text-white font-extrabold text-sm shadow-lg hover:shadow-xl transition cursor-pointer tabular-nums"
              >
                Pay ₹{fareCalc.total.toLocaleString('en-IN')} &amp; Generate IRCTC E-Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* OFFICIAL IRCTC ELECTRONIC RESERVATION SLIP (ERS) MODAL               */}
      {/* ==================================================================== */}
      {ticketModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-[#00A16B] to-emerald-600 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <div className="text-[11px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full inline-block">
                  IRCTC Electronic Reservation Slip (ERS)
                </div>
                <h3 className="text-xl font-extrabold mt-1 tabular-nums">
                  PNR: {ticketModalData.pnr}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTicketModalData(null)}
                className="text-white/80 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-dashed border-slate-300">
                <div className="space-y-1">
                  <div className="text-base font-extrabold text-slate-900 tabular-nums">
                    {ticketModalData.train.number} • {ticketModalData.train.name}
                  </div>
                  <div className="text-slate-600 font-semibold">
                    {ticketModalData.train.from} → {ticketModalData.train.to} • Class {ticketModalData.coachClass} • {ticketModalData.quota} Quota
                  </div>
                  <div className="text-slate-600 tabular-nums">
                    <strong>Boarding:</strong> {ticketModalData.boardingStation}
                  </div>
                  <div className="text-slate-500 tabular-nums">
                    Date: {ticketModalData.date} • IRCTC ID: <strong>{ticketModalData.irctcUserId}</strong>
                  </div>
                </div>
                <div className="p-2 rounded-2xl bg-slate-50 border border-slate-200 shrink-0 text-center">
                  <QrCode className="w-16 h-16 text-slate-900" />
                  <div className="text-[9px] font-bold text-slate-500 mt-0.5">TTE SCAN QR</div>
                </div>
              </div>

              {/* Passenger Chart Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                      <th className="py-2 px-3">Passenger</th>
                      <th className="py-2 px-3">Age/Sex</th>
                      <th className="py-2 px-3">Meal</th>
                      <th className="py-2 px-3">Coach / Berth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {ticketModalData.passengers.map((p, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{p.name}</td>
                        <td className="py-2.5 px-3 text-slate-600 tabular-nums">{p.age}/{p.gender}</td>
                        <td className="py-2.5 px-3 text-slate-600">{p.mealPref}</td>
                        <td className="py-2.5 px-3 font-extrabold text-[#00A16B] tabular-nums">{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Transaction & Protection Metadata */}
              <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-[#F2F4F7] text-[11px] tabular-nums">
                <div>
                  <span className="text-slate-500">Transaction ID:</span>{' '}
                  <strong className="text-slate-900">{ticketModalData.txnId}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Booked On:</span>{' '}
                  <strong className="text-slate-900">{ticketModalData.bookedAt}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Payment:</span>{' '}
                  <strong className="text-slate-900">{ticketModalData.paymentMethod}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Total Paid:</span>{' '}
                  <strong className="text-[#065AF3]">₹{ticketModalData.totalPaid.toLocaleString('en-IN')}</strong>
                </div>
                {ticketModalData.gstDetails && (
                  <div className="col-span-2 text-slate-600">
                    GST Invoice: <strong>{ticketModalData.gstDetails.company}</strong> ({ticketModalData.gstDetails.gstin})
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-full bg-[#0D2B52] hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Print / Download ERS</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTicketModalData(null);
                    setActiveTab('PNR');
                  }}
                  style={{ background: 'linear-gradient(93deg, #53B2FE 0%, #065AF3 100%)' }}
                  className="flex-1 py-3 rounded-full text-white font-bold cursor-pointer"
                >
                  View in My Trips
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HUMANISED TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0D2B52] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/15 text-xs font-semibold flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              toast.tone === 'success'
                ? 'bg-emerald-400'
                : toast.tone === 'warn'
                ? 'bg-amber-400'
                : 'bg-[#53B2FE]'
            }`}
          />
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}