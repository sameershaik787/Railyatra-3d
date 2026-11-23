import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Calendar, MapPin, X } from 'lucide-react';

export const ALL_INDIA_STATIONS = [
  // North India
  { code: 'NDLS', name: 'New Delhi', city: 'New Delhi', state: 'Delhi', gate: 'Ajmeri Gate / Paharganj' },
  { code: 'NZM', name: 'Hazrat Nizamuddin', city: 'New Delhi', state: 'Delhi', gate: 'Sarai Kale Khan Gate' },
  { code: 'ANVT', name: 'Anand Vihar Terminal', city: 'New Delhi', state: 'Delhi', gate: 'Metro Concourse Gate' },
  { code: 'DLI', name: 'Old Delhi Junction', city: 'Delhi', state: 'Delhi', gate: 'Chandni Chowk Entry' },
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan', gate: 'Platform 1 Metro Link' },
  { code: 'UDZ', name: 'Udaipur City', city: 'Udaipur', state: 'Rajasthan', gate: 'Heritage Main Entry' },
  { code: 'JU', name: 'Jodhpur Junction', city: 'Jodhpur', state: 'Rajasthan', gate: 'Main Concourse Gate' },
  { code: 'AII', name: 'Ajmer Junction', city: 'Ajmer', state: 'Rajasthan', gate: 'Station Road Entry' },
  { code: 'KOTA', name: 'Kota Junction', city: 'Kota', state: 'Rajasthan', gate: 'Bhimganj Mandi Gate' },
  { code: 'BKN', name: 'Bikaner Junction', city: 'Bikaner', state: 'Rajasthan', gate: 'Main Heritage Gate' },
  { code: 'CDG', name: 'Chandigarh Junction', city: 'Chandigarh', state: 'Chandigarh', gate: 'Panchkula Side Gate' },
  { code: 'ASR', name: 'Amritsar Junction', city: 'Amritsar', state: 'Punjab', gate: 'Golden Temple Corridor' },
  { code: 'JAT', name: 'Jammu Tawi', city: 'Jammu', state: 'Jammu & Kashmir', gate: 'Bahu Plaza Entry' },
  { code: 'SVDK', name: 'SMVD Katra', city: 'Katra', state: 'Jammu & Kashmir', gate: 'Yatra Registration Gate' },
  { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow', state: 'Uttar Pradesh', gate: 'Heritage Main Porch' },
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh', gate: 'Cantt Side Gate 1' },
  { code: 'PRYJ', name: 'Prayagraj Junction', city: 'Prayagraj', state: 'Uttar Pradesh', gate: 'Civil Lines Side' },
  { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh', gate: 'Cantt Main Entry' },
  { code: 'AGC', name: 'Agra Cantt', city: 'Agra', state: 'Uttar Pradesh', gate: 'Taj Express Gate' },
  { code: 'GKP', name: 'Gorakhpur Junction', city: 'Gorakhpur', state: 'Uttar Pradesh', gate: 'Platform 1 Entry' },
  { code: 'VGLJ', name: 'Virangana Lakshmibai Jhansi', city: 'Jhansi', state: 'Uttar Pradesh', gate: 'Main Concourse' },
  { code: 'DDN', name: 'Dehradun Terminal', city: 'Dehradun', state: 'Uttarakhand', gate: 'Haridwar Road Entry' },
  { code: 'HW', name: 'Haridwar Junction', city: 'Haridwar', state: 'Uttarakhand', gate: 'Main Yatra Gate' },
  { code: 'UMB', name: 'Ambala Cantt', city: 'Ambala', state: 'Haryana', gate: 'GT Road Entry' },

  // West India
  { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra', gate: 'Main Concourse Gate 1' },
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra', gate: 'Heritage Mainline Entry' },
  { code: 'BCT', name: 'Bandra Terminus', city: 'Mumbai', state: 'Maharashtra', gate: 'East Skywalk Entry' },
  { code: 'LTT', name: 'Lokmanya Tilak Terminus', city: 'Mumbai', state: 'Maharashtra', gate: 'Kurla East Concourse' },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra', gate: 'Raja Bahadur Mill Gate' },
  { code: 'NGP', name: 'Nagpur Junction', city: 'Nagpur', state: 'Maharashtra', gate: 'West Main Concourse' },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat', gate: 'Kalupur Main Gate' },
  { code: 'BRC', name: 'Vadodara Junction', city: 'Vadodara', state: 'Gujarat', gate: 'Alkapuri Side Gate' },
  { code: 'ST', name: 'Surat', city: 'Surat', state: 'Gujarat', gate: 'Varachha Side Entry' },
  { code: 'RJT', name: 'Rajkot Junction', city: 'Rajkot', state: 'Gujarat', gate: 'Main Station Gate' },
  { code: 'MAO', name: 'Madgaon Junction', city: 'Goa (Madgaon)', state: 'Goa', gate: 'Konkan Main Gate' },

  // South India
  { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru', state: 'Karnataka', gate: 'Majestic Metro Link' },
  { code: 'YPR', name: 'Yesvantpur Junction', city: 'Bengaluru', state: 'Karnataka', gate: 'Tumkur Road Gate' },
  { code: 'SMVB', name: 'Sir M. Visvesvaraya Terminal', city: 'Bengaluru', state: 'Karnataka', gate: 'Baiyappanahalli Concourse' },
  { code: 'MYS', name: 'Mysuru Junction', city: 'Mysuru', state: 'Karnataka', gate: 'Heritage Main Entry' },
  { code: 'MAQ', name: 'Mangaluru Central', city: 'Mangaluru', state: 'Karnataka', gate: 'Hampankatta Gate' },
  { code: 'MAS', name: 'MGR Chennai Central', city: 'Chennai', state: 'Tamil Nadu', gate: 'Moore Market Complex' },
  { code: 'MS', name: 'Chennai Egmore', city: 'Chennai', state: 'Tamil Nadu', gate: 'Gandhi Irwin Road Gate' },
  { code: 'CBE', name: 'Coimbatore Junction', city: 'Coimbatore', state: 'Tamil Nadu', gate: 'State Bank Road Entry' },
  { code: 'MDU', name: 'Madurai Junction', city: 'Madurai', state: 'Tamil Nadu', gate: 'West Tower Gate' },
  { code: 'TPJ', name: 'Tiruchirappalli Junction', city: 'Trichy', state: 'Tamil Nadu', gate: 'Main Concourse Gate' },
  { code: 'SC', name: 'Secunderabad Junction', city: 'Hyderabad', state: 'Telangana', gate: 'Platform 1 Metro Link' },
  { code: 'HYB', name: 'Hyderabad Deccan (Nampally)', city: 'Hyderabad', state: 'Telangana', gate: 'Nampally Main Entry' },
  { code: 'KCG', name: 'Kacheguda', city: 'Hyderabad', state: 'Telangana', gate: 'Heritage Main Gate' },
  { code: 'BZA', name: 'Vijayawada Junction', city: 'Vijayawada', state: 'Andhra Pradesh', gate: 'East Main Entry' },
  { code: 'VSKP', name: 'Visakhapatnam Junction', city: 'Visakhapatnam', state: 'Andhra Pradesh', gate: 'Gnanapuram Gate' },
  { code: 'TPTY', name: 'Tirupati', city: 'Tirupati', state: 'Andhra Pradesh', gate: 'South Pilgrim Gate' },
  { code: 'ERS', name: 'Ernakulam Junction', city: 'Kochi', state: 'Kerala', gate: 'South Main Concourse' },
  { code: 'TVC', name: 'Thiruvananthapuram Central', city: 'Thiruvananthapuram', state: 'Kerala', gate: 'Thampanoor Entry' },
  { code: 'CLT', name: 'Kozhikode', city: 'Kozhikode', state: 'Kerala', gate: 'Link Road Gate' },

  // East, Central & Northeast India
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal', gate: 'New Complex Gate 4' },
  { code: 'SDAH', name: 'Sealdah', city: 'Kolkata', state: 'West Bengal', gate: 'Mainline Concourse' },
  { code: 'KOAA', name: 'Kolkata Terminal (Chitpur)', city: 'Kolkata', state: 'West Bengal', gate: 'Main Terminal Gate' },
  { code: 'NJP', name: 'New Jalpaiguri', city: 'Siliguri', state: 'West Bengal', gate: 'Darjeeling Gate' },
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar', gate: 'Mahavir Mandir Gate' },
  { code: 'RNC', name: 'Ranchi Junction', city: 'Ranchi', state: 'Jharkhand', gate: 'Station Road Entry' },
  { code: 'TATA', name: 'Tatanagar Junction', city: 'Jamshedpur', state: 'Jharkhand', gate: 'Main Concourse Gate' },
  { code: 'BBS', name: 'Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha', gate: 'Master Canteen Gate' },
  { code: 'PURI', name: 'Puri Terminal', city: 'Puri', state: 'Odisha', gate: 'Grand Road Entry' },
  { code: 'GHY', name: 'Guwahati', city: 'Guwahati', state: 'Assam', gate: 'Paltan Bazar Entry' },
  { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal', state: 'Madhya Pradesh', gate: 'Platform 1 Gate' },
  { code: 'RKMP', name: 'Rani Kamalapati', city: 'Bhopal', state: 'Madhya Pradesh', gate: 'World-Class Concourse' },
  { code: 'INDB', name: 'Indore Junction', city: 'Indore', state: 'Madhya Pradesh', gate: 'Main Heritage Gate' },
  { code: 'JBP', name: 'Jabalpur Junction', city: 'Jabalpur', state: 'Madhya Pradesh', gate: 'Platform 1 Entry' },
  { code: 'GWL', name: 'Gwalior Junction', city: 'Gwalior', state: 'Madhya Pradesh', gate: 'Main Entry Gate' },
  { code: 'R', name: 'Raipur Junction', city: 'Raipur', state: 'Chhattisgarh', gate: 'Station Chowk Gate' },
  { code: 'BSP', name: 'Bilaspur Junction', city: 'Bilaspur', state: 'Chhattisgarh', gate: 'Main Concourse' },
];

export function mergeAllIndiaStations(existingStations = []) {
  const seen = new Set();
  const merged = [];
  for (const s of [...existingStations, ...ALL_INDIA_STATIONS]) {
    if (!s?.code || seen.has(s.code)) continue;
    seen.add(s.code);
    merged.push(s);
  }
  return merged;
}

export function resolveTravelDateObj(isoDate, presetDates = []) {
  const fallbackIso = new Date().toISOString().slice(0, 10);
  const safeIso = typeof isoDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(isoDate) ? isoDate : fallbackIso;
  const preset = presetDates.find((d) => d.date === safeIso);
  const dt = new Date(`${safeIso}T00:00:00`);
  const dayNum = String(dt.getDate()).padStart(2, '0');
  const month = dt.toLocaleDateString('en-IN', { month: 'short' });
  const weekday = dt.toLocaleDateString('en-IN', { weekday: 'short' });
  const fullWeekday = dt.toLocaleDateString('en-IN', { weekday: 'long' });
  const yearShort = String(dt.getFullYear()).slice(-2);

  if (preset) {
    return { ...preset, fullWeekday, yearShort };
  }
  const seed = dt.getDate() + dt.getMonth() * 7;
  const availNum = 18 + ((seed * 13) % 68);
  return {
    date: safeIso,
    dayNum,
    month,
    weekday,
    fullWeekday,
    yearShort,
    avail: `AVL ${availNum}`,
    tone: availNum > 25 ? 'green' : 'amber',
    minFare: 1790 + ((seed % 5) * 45),
  };
}

export function StationSearchField({
  label,
  value,
  stations,
  onChange,
  subtitleMode = 'gate',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const selected = useMemo(
    () => stations.find((s) => s.code === value) || stations[0] || { code: value, city: value, name: value, state: 'India', gate: 'Main Entry' },
    [stations, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stations;
    return stations.filter(
      (s) =>
        s.city.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.state || '').toLowerCase().includes(q)
    );
  }, [stations, query]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 30);
    const onDocClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => {
          setQuery('');
          setOpen((v) => !v);
        }}
        className="w-full text-left flex items-center justify-between gap-2 focus:outline-none cursor-pointer group"
      >
        <span className="text-2xl font-extrabold text-slate-900 truncate group-hover:text-[#065AF3] transition">
          {selected.city} ({selected.code})
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${open ? 'rotate-180 text-[#065AF3]' : ''}`} />
      </button>
      <div className="text-xs text-slate-500 truncate mt-0.5">
        {selected.name} • {subtitleMode === 'gate' ? selected.gate : selected.state}
      </div>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-full sm:w-[340px] rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden">
          <div className="p-2.5 border-b border-slate-100 bg-slate-50">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search city, station or code (e.g. SBC, Jaipur)..."
                className="w-full rounded-xl bg-white border border-slate-200 focus:border-[#065AF3] pl-9 pr-8 py-2 text-xs font-medium text-slate-900 outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching Indian station found for &quot;{query}&quot;
              </div>
            ) : (
              filtered.map((st) => {
                const isSelected = st.code === value;
                return (
                  <button
                    key={st.code}
                    type="button"
                    onClick={() => {
                      onChange(st.code);
                      setOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 transition ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-[#065AF3] shrink-0" />
                        {st.city} — {st.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate pl-4">{st.state}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold shrink-0 ${
                        isSelected ? 'bg-[#065AF3] text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {st.code}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function toIsoLocal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function TravelDatePickerField({ selectedIso, onSelectDate, maxDaysAhead = 120 }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const maxDate = useMemo(() => {
    const m = new Date(today);
    m.setDate(m.getDate() + maxDaysAhead);
    return m;
  }, [today, maxDaysAhead]);

  const activeIso = typeof selectedIso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(selectedIso)
    ? selectedIso
    : toIsoLocal(today);

  const activeDate = useMemo(() => new Date(`${activeIso}T00:00:00`), [activeIso]);

  const [viewYear, setViewYear] = useState(activeDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(activeDate.getMonth());

  useEffect(() => {
    setViewYear(activeDate.getFullYear());
    setViewMonth(activeDate.getMonth());
  }, [activeDate]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const canPrevMonth =
    viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());
  const canNextMonth =
    viewYear < maxDate.getFullYear() || (viewYear === maxDate.getFullYear() && viewMonth < maxDate.getMonth());

  const prevMonth = () => {
    if (!canPrevMonth) return;
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (!canNextMonth) return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const quickPicks = [0, 1, 2].map((offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return {
      iso: toIsoLocal(d),
      label: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    };
  });

  const dayNum = String(activeDate.getDate()).padStart(2, '0');
  const monthShort = activeDate.toLocaleDateString('en-IN', { month: 'short' });
  const yearShort = String(activeDate.getFullYear()).slice(-2);
  const fullWeekday = activeDate.toLocaleDateString('en-IN', { weekday: 'long' });

  return (
    <div ref={wrapperRef} className="relative">
      <label className="flex items-center justify-between text-xs font-bold uppercase text-slate-500 mb-1">
        <span>Travel Date</span>
        <Calendar className="w-3.5 h-3.5 text-[#065AF3]" />
      </label>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left focus:outline-none cursor-pointer group"
      >
        <div className="text-2xl font-extrabold text-slate-900 group-hover:text-[#065AF3] transition">
          {dayNum}{' '}
          <span className="text-base font-bold text-slate-600">
            {monthShort}&apos;{yearShort}
          </span>
        </div>
        <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
          <span>{fullWeekday}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180 text-[#065AF3]' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute right-0 sm:left-0 top-full mt-2 w-[300px] rounded-2xl bg-white border border-slate-200 shadow-2xl p-3.5 z-50">
          {/* Quick Date Chips */}
          <div className="flex items-center gap-1.5 mb-3">
            {quickPicks.map((qp) => (
              <button
                key={qp.iso}
                type="button"
                onClick={() => {
                  onSelectDate(qp.iso);
                  setOpen(false);
                }}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                  activeIso === qp.iso
                    ? 'bg-[#065AF3] text-white border-[#065AF3]'
                    : 'bg-blue-50/70 text-[#065AF3] border-blue-200 hover:bg-blue-100'
                }`}
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Month Header */}
          <div className="flex items-center justify-between mb-2.5">
            <button
              type="button"
              disabled={!canPrevMonth}
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-xs font-extrabold text-slate-900">{monthLabel}</div>
            <button
              type="button"
              disabled={!canNextMonth}
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w) => (
              <div key={w} className="py-1">{w}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`empty-${idx}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const cellDate = new Date(viewYear, viewMonth, day);
              const cellIso = toIsoLocal(cellDate);
              const disabled = cellDate < today || cellDate > maxDate;
              const isSelected = cellIso === activeIso;
              const isToday = cellIso === toIsoLocal(today);

              return (
                <button
                  key={cellIso}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onSelectDate(cellIso);
                    setOpen(false);
                  }}
                  className={`h-8 w-full rounded-lg text-xs font-bold transition ${
                    isSelected
                      ? 'bg-[#065AF3] text-white shadow-sm'
                      : disabled
                      ? 'text-slate-300 cursor-not-allowed'
                      : isToday
                      ? 'bg-blue-50 text-[#065AF3] border border-blue-300 hover:bg-blue-100'
                      : 'text-slate-800 hover:bg-blue-50 hover:text-[#065AF3]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-500 text-center">
            IRCTC Advance Reservation Window: Up to {maxDaysAhead} days
          </div>
        </div>
      )}
    </div>
  );
}