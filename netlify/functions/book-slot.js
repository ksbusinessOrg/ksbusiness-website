// Bucht einen Termin-Slot: prueft, ob er noch frei ist, markiert ihn als
// belegt (nur die Slot-ID + Zeitstempel -- Name/E-Mail der Buchenden werden
// NICHT dauerhaft gespeichert, siehe Notiz in get-slots.js) und verschickt
// die Buchungsmail an Klaus ueber Resend.
const { bookingsStore } = require('./bookings-store');
const { Resend } = require('resend');

const SLOT_ID_PATTERN = /^\d{4}-\d{2}-\d{2}_(1600|1630|1700|1730)$/;
const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

function formatSlot(slotId) {
  const [datePart, timePart] = slotId.split('_');
  const [year, month, day] = datePart.split('-').map(Number);
  // Uhrzeit rein aus der ID ableiten statt aus einem Date-Objekt (das
  // haette Zeitzonen-Stolperfallen) -- die ID selbst ist schon die
  // Berliner Ortszeit, die der Kalender im Frontend erzeugt hat.
  const hour = timePart.slice(0, 2);
  const minute = timePart.slice(2, 4);
  const endMinuteTotal = parseInt(hour, 10) * 60 + parseInt(minute, 10) + 30;
  const endHour = String(Math.floor(endMinuteTotal / 60)).padStart(2, '0');
  const endMinute = String(endMinuteTotal % 60).padStart(2, '0');
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${weekday}, ${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}, ${hour}:${minute}–${endHour}:${endMinute} Uhr`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Ungueltige Anfrage.' }) };
  }

  const slotId = String(data.slotId || '').trim();
  const name = String(data.name || '').trim();
  const email = String(data.email || '').trim();

  if (!SLOT_ID_PATTERN.test(slotId)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Ungueltiger Termin-Slot.' }) };
  }
  if (!name || name.length > 200) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Bitte einen Namen angeben.' }) };
  }
  if (!isValidEmail(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Bitte eine gueltige E-Mail-Adresse angeben.' }) };
  }

  const store = bookingsStore();
  const booked = (await store.get('booked-slots', { type: 'json' })) || [];

  if (booked.some((entry) => entry.slotId === slotId)) {
    return { statusCode: 409, body: JSON.stringify({ error: 'Dieser Termin ist leider gerade eben vergeben worden.' }) };
  }

  booked.push({ slotId, bookedAt: new Date().toISOString() });
  await store.setJSON('booked-slots', booked);

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromAddress = process.env.BOOKING_FROM_EMAIL || 'onboarding@resend.dev';
    const notifyAddress = process.env.BOOKING_NOTIFY_EMAIL;

    if (notifyAddress) {
      await resend.emails.send({
        from: fromAddress,
        to: notifyAddress,
        replyTo: email,
        subject: `Neue Terminbuchung: ${formatSlot(slotId)}`,
        html: `
          <p><strong>Neuer gebuchter Termin ueber die Website:</strong></p>
          <p>${formatSlot(slotId)}</p>
          <p><strong>Name:</strong> ${escapeHtml(name)}<br>
          <strong>E-Mail:</strong> ${escapeHtml(email)}</p>
        `,
      });
    }
  } catch (err) {
    // Slot bleibt trotzdem gebucht/gesperrt -- ein Mail-Fehler soll nicht
    // dazu fuehren, dass sich zwei Leute denselben Termin teilen. Klaus
    // bekommt die Anfrage im Zweifel eben nicht per Mail, sieht den
    // belegten Slot aber weiterhin korrekt im Kalender.
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, mailSent: false }),
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, mailSent: true }),
  };
};
