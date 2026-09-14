// Liefert nur die IDs bereits gebuchter Termin-Slots zurueck -- bewusst
// KEINE Namen/E-Mails der Buchenden (die werden dafuer auch gar nicht erst
// dauerhaft gespeichert, siehe book-slot.js), damit hier niemals
// personenbezogene Daten oeffentlich abrufbar sind. Der Kalender im Frontend
// berechnet die moeglichen Slots (naechste Werktage) selbst und blendet nur
// die hier gelisteten IDs als "belegt" aus.
const { getStore } = require('@netlify/blobs');

exports.handler = async function () {
  try {
    const store = getStore('bookings');
    const booked = (await store.get('booked-slots', { type: 'json' })) || [];
    const slotIds = booked.map((entry) => entry.slotId);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ bookedSlotIds: slotIds }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Slots konnten nicht geladen werden.' }),
    };
  }
};
