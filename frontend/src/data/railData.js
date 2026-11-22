export const QUOTA_PILLS = [
  { id: 'GN', label: 'Regular', sub: 'Standard IRCTC Fares' },
  { id: 'SS', label: 'Senior Citizen', sub: 'Lower Berth Priority' },
  { id: 'LD', label: 'Ladies Quota', sub: 'Dedicated Safe Bays' },
  { id: 'TQ', label: 'Tatkal', sub: 'Opens 10 AM (AC)' },
  { id: 'ST', label: 'Student', sub: 'Flexible Cancellation' }
];

export const TRAINS_CATALOG = [
  {
    number: '12952',
    name: 'Mumbai Tejas Rajdhani',
    tagline: 'Premium LHB Tejas Rake • Automatic Doors & Meals Included',
    from: 'NDLS',
    to: 'MMCT',
    depTime: '16:55',
    depSlot: 'EVENING',
    arrTime: '08:35',
    nextDay: '+1 day',
    duration: '15h 40m',
    distance: '1,384 km',
    rating: '4.8',
    reviews: '14.2k',
    punctuality: '97% On-Time',
    freeCancel: true,
    runningDays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    rake: ['ENG', 'EOG', 'H1', 'A1', 'A2', 'B1', 'B2', 'B3', 'PC', 'B4', 'EOG'],
    liveStatus: {
      currentStation: 'Kota Junction (KOTA)',
      delay: 'On Time',
      speed: '128 km/h',
      nextStop: 'Ratlam Jn (RTM) • 22:18',
      progress: 46,
      stops: [
        { name: 'New Delhi (NDLS)', time: '16:55', status: 'DEPARTED', pf: 'PF 3' },
        { name: 'Kota Junction (KOTA)', time: '21:35', status: 'CURRENT', pf: 'PF 1' },
        { name: 'Ratlam Junction (RTM)', time: '00:42', status: 'UPCOMING', pf: 'PF 4' },
        { name: 'Vadodara Junction (BRC)', time: '03:50', status: 'UPCOMING', pf: 'PF 2' },
        { name: 'Mumbai Central (MMCT)', time: '08:35', status: 'UPCOMING', pf: 'PF 1' }
      ]
    },
    classes: [
      { code: '3A', label: 'AC 3-Tier', coach: 'B1', fare: 1965, status: 'AVL 28', tone: 'green', guarantee: '3X Trip Guarantee' },
      { code: '2A', label: 'AC 2-Tier', coach: 'A1', fare: 2840, status: 'AVL 14', tone: 'green', guarantee: 'Privacy Curtains' },
      { code: '1A', label: 'First AC', coach: 'H1', fare: 4785, status: 'AVL 06', tone: 'green', guarantee: 'Lockable Cabin' }
    ]
  },
  {
    number: '22436',
    name: 'Vande Bharat Express',
    tagline: 'Next-Gen Semi-High Speed Sleeper & Executive Comfort',
    from: 'NDLS',
    to: 'MMCT',
    depTime: '19:30',
    depSlot: 'NIGHT',
    arrTime: '09:15',
    nextDay: '+1 day',
    duration: '13h 45m',
    distance: '1,384 km',
    rating: '4.9',
    reviews: '9.8k',
    punctuality: '99% On-Time',
    freeCancel: true,
    runningDays: ['M', 'T', 'W', 'F', 'S', 'S'],
    rake: ['DTC', 'H1', 'A1', 'A2', 'B1', 'B2', 'B3', 'PC', 'B4', 'DTC'],
    liveStatus: {
      currentStation: 'Mathura Junction (MTJ)',
      delay: 'On Time',
      speed: '142 km/h',
      nextStop: 'Kota Jn (KOTA) • 23:45',
      progress: 28,
      stops: [
        { name: 'New Delhi (NDLS)', time: '19:30', status: 'DEPARTED', pf: 'PF 16' },
        { name: 'Mathura Junction (MTJ)', time: '20:55', status: 'CURRENT', pf: 'PF 2' },
        { name: 'Kota Junction (KOTA)', time: '23:45', status: 'UPCOMING', pf: 'PF 1' },
        { name: 'Surat (ST)', time: '06:10', status: 'UPCOMING', pf: 'PF 1' },
        { name: 'Mumbai Central (MMCT)', time: '09:15', status: 'UPCOMING', pf: 'PF 2' }
      ]
    },
    classes: [
      { code: '3A', label: 'AC 3-Tier', coach: 'B1', fare: 2190, status: 'AVL 36', tone: 'green', guarantee: '3X Trip Guarantee' },
      { code: '2A', label: 'AC 2-Tier', coach: 'A1', fare: 3090, status: 'AVL 18', tone: 'green', guarantee: 'Extra Legroom' },
      { code: '1A', label: 'First AC', coach: 'H1', fare: 5120, status: 'AVL 04', tone: 'green', guarantee: 'Private Suite' }
    ]
  },
  {
    number: '12963',
    name: 'Mewar Express',
    tagline: 'Heritage Overnight Superfast • Direct to City of Lakes',
    from: 'NDLS',
    to: 'UDZ',
    depTime: '18:25',
    depSlot: 'EVENING',
    arrTime: '07:15',
    nextDay: '+1 day',
    duration: '12h 50m',
    distance: '739 km',
    rating: '4.6',
    reviews: '6.4k',
    punctuality: '94% On-Time',
    freeCancel: true,
    runningDays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    rake: ['ENG', 'EOG', 'H1', 'A1', 'B1', 'B2', 'B3', 'PC', 'S1', 'EOG'],
    liveStatus: {
      currentStation: 'Sawai Madhopur (SWM)',
      delay: '5 mins late',
      speed: '108 km/h',
      nextStop: 'Kota Jn (KOTA) • 00:15',
      progress: 52,
      stops: [
        { name: 'Hazrat Nizamuddin (NZM)', time: '18:25', status: 'DEPARTED', pf: 'PF 5' },
        { name: 'Sawai Madhopur (SWM)', time: '22:45', status: 'CURRENT', pf: 'PF 1' },
        { name: 'Kota Junction (KOTA)', time: '00:15', status: 'UPCOMING', pf: 'PF 2' },
        { name: 'Chittorgarh (COR)', time: '04:15', status: 'UPCOMING', pf: 'PF 1' },
        { name: 'Udaipur City (UDZ)', time: '07:15', status: 'UPCOMING', pf: 'PF 1' }
      ]
    },
    classes: [
      { code: '3A', label: 'AC 3-Tier', coach: 'B1', fare: 1245, status: 'AVL 31', tone: 'green', guarantee: 'Free Cancellation' },
      { code: '2A', label: 'AC 2-Tier', coach: 'A1', fare: 1760, status: 'AVL 16', tone: 'green', guarantee: 'Privacy Curtains' },
      { code: '1A', label: 'First AC', coach: 'H1', fare: 2980, status: 'AVL 05', tone: 'green', guarantee: 'Lockable Coupé' }
    ]
  },
  {
    number: '12002',
    name: 'Bhopal Shatabdi Special',
    tagline: 'Daylight LHB Superfast • Quick Business & Family Travel',
    from: 'NDLS',
    to: 'JP',
    depTime: '06:00',
    depSlot: 'MORNING',
    arrTime: '10:35',
    nextDay: '',
    duration: '04h 35m',
    distance: '308 km',
    rating: '4.7',
    reviews: '11.1k',
    punctuality: '96% On-Time',
    freeCancel: false,
    runningDays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    rake: ['ENG', 'EOG', 'H1', 'A1', 'B1', 'B2', 'PC', 'EOG'],
    liveStatus: {
      currentStation: 'Alwar Junction (AWR)',
      delay: 'On Time',
      speed: '118 km/h',
      nextStop: 'Jaipur Jn (JP) • 10:35',
      progress: 68,
      stops: [
        { name: 'New Delhi (NDLS)', time: '06:00', status: 'DEPARTED', pf: 'PF 1' },
        { name: 'Gurugram (GGN)', time: '06:42', status: 'DEPARTED', pf: 'PF 2' },
        { name: 'Alwar Junction (AWR)', time: '08:25', status: 'CURRENT', pf: 'PF 1' },
        { name: 'Jaipur Junction (JP)', time: '10:35', status: 'UPCOMING', pf: 'PF 1' }
      ]
    },
    classes: [
      { code: '3A', label: 'AC 3-Tier', coach: 'B1', fare: 895, status: 'AVL 44', tone: 'green', guarantee: 'Breakfast Included' },
      { code: '2A', label: 'AC 2-Tier', coach: 'A1', fare: 1320, status: 'AVL 19', tone: 'green', guarantee: 'Wide Cushions' },
      { code: '1A', label: 'First AC', coach: 'H1', fare: 2150, status: 'AVL 06', tone: 'green', guarantee: 'VIP Cabin' }
    ]
  }
];