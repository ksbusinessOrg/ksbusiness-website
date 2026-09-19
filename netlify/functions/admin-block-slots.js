// EINMALIGE Admin-Funktion, um Klaus' Nicht-Verfuegbarkeit (vor 17:30 Uhr,
// 21.09.-05.10.2026, siehe Nachricht vom 19.09.) im Buchungskalender
// abzubilden. Wird direkt nach Gebrauch wieder aus dem Repo entfernt --
// kein dauerhafter Bestandteil der Website, siehe Commit-Historie.
const { bookingsStore } = require('./bookings-store');

const BLOCK_DATES = [
  '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25',
  '2026-09-28', '2026-09-29', '2026-09-30',
  '2026-10-01', '2026-10-02', '2026-10-05',
];
const BLOCK_TIMES = ['1600', '1630', '1700'];

exports.handler = async function (event) {
  const key = (event.queryStringParameters || {}).key;
  if (!process.env.ADMIN_BLOCK_KEY || key !== process.env.ADMIN_BLOCK_KEY) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
  }

  const store = bookingsStore();
  const booked = (await store.get('booked-slots', { type: 'json' })) || [];
  const existing = new Set(booked.map((entry) => entry.slotId));

  const added = [];
  BLOCK_DATES.forEach((date) => {
    BLOCK_TIMES.forEach((time) => {
      const slotId = date + '_' + time;
      if (!existing.has(slotId)) {
        booked.push({ slotId, bookedAt: new Date().toISOString(), blocked: true });
        added.push(slotId);
      }
    });
  });

  await store.setJSON('booked-slots', booked);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, added: added, totalBooked: booked.length }),
  };
};
