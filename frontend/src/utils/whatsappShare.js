export function buildTicketWhatsAppMessage(ticket) {
  const {
    pnr = 'N/A',
    trainName = 'RailYatra Express',
    trainNumber = '',
    from = '',
    to = '',
    journeyDate = '',
    coach = '',
    seats = [],
    passengerName = 'Traveller',
    fare = 0,
  } = ticket || {};

  const seatList = Array.isArray(seats) ? seats.join(', ') : String(seats || 'N/A');
  const trainLabel = trainNumber ? `${trainNumber} - ${trainName}` : trainName;

  return [
    '🚆 *RailYatra 3D — Ticket Confirmed*',
    '━━━━━━━━━━━━━━━━━━━━',
    `*PNR:* ${pnr}`,
    `*Passenger:* ${passengerName}`,
    `*Train:* ${trainLabel}`,
    from && to ? `*Route:* ${from} ➔ ${to}` : null,
    journeyDate ? `*Date:* ${journeyDate}` : null,
    coach ? `*Coach:* ${coach}` : null,
    `*Seat(s):* ${seatList}`,
    `*Total Paid:* ₹${fare}`,
    '━━━━━━━━━━━━━━━━━━━━',
    'Have a safe journey with RailYatra 3D!',
  ]
    .filter(Boolean)
    .join('\n');
}

export function shareTicketOnWhatsApp(ticket, phoneNumber = '') {
  const text = encodeURIComponent(buildTicketWhatsAppMessage(ticket));
  const digits = String(phoneNumber || '').replace(/\D/g, '');

  const formattedPhone =
    digits.length === 10 ? `91${digits}` : digits.length >= 11 ? digits : '';

  const url = formattedPhone
    ? `https://wa.me/${formattedPhone}?text=${text}`
    : `https://wa.me/?text=${text}`;

  window.open(url, '_blank', 'noopener,noreferrer');
}