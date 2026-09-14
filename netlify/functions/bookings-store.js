// Kleiner gemeinsamer Helfer fuer get-slots.js und book-slot.js: liefert
// den Netlify-Blobs-Store fuer Buchungen. Die automatische Umgebungs-
// Konfiguration (nur Store-Name, kein siteID/token noetig) hat sich auf
// dieser Site nicht selbst verdrahtet ("environment has not been
// configured..."), deshalb hier explizit mit siteID + Access-Token, so wie
// die Fehlermeldung von @netlify/blobs es selbst vorschlaegt.
const { getStore } = require('@netlify/blobs');

function bookingsStore() {
  return getStore({
    name: 'bookings',
    siteID: process.env.BLOBS_SITE_ID,
    token: process.env.BLOBS_AUTH_TOKEN,
  });
}

module.exports = { bookingsStore };
