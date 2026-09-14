// Verschickt die Nachricht aus dem Kontaktformular per Mail an Klaus.
// Keine Speicherung -- die Daten werden nur fuer den einen Versand
// verwendet, siehe Datenschutzerklaerung Punkt 4.
const { Resend } = require('resend');

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Nur die Fehlermeldungen ans Frontend sind sprachabhaengig -- die Mail an
// Klaus bleibt IMMER Deutsch, siehe Notiz in book-slot.js.
const MESSAGES = {
  de: {
    badRequest: 'Ungueltige Anfrage.',
    needName: 'Bitte einen Namen angeben.',
    needEmail: 'Bitte eine gueltige E-Mail-Adresse angeben.',
    needMessage: 'Bitte eine Nachricht angeben.',
    notConfigured: 'Versand ist noch nicht konfiguriert.',
    sendFailed: 'Nachricht konnte nicht versendet werden.',
  },
  en: {
    badRequest: 'Invalid request.',
    needName: 'Please enter a name.',
    needEmail: 'Please enter a valid email address.',
    needMessage: 'Please enter a message.',
    notConfigured: 'Sending is not configured yet.',
    sendFailed: 'Message could not be sent.',
  },
};
function msgsFor(data) {
  return MESSAGES[data && data.lang === 'en' ? 'en' : 'de'];
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: MESSAGES.de.badRequest }) };
  }
  const msgs = msgsFor(data);

  const name = String(data.name || '').trim();
  const email = String(data.email || '').trim();
  const nachricht = String(data.nachricht || '').trim();

  if (!name || name.length > 200) {
    return { statusCode: 400, body: JSON.stringify({ error: msgs.needName }) };
  }
  if (!isValidEmail(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: msgs.needEmail }) };
  }
  if (!nachricht || nachricht.length > 5000) {
    return { statusCode: 400, body: JSON.stringify({ error: msgs.needMessage }) };
  }

  const notifyAddress = process.env.BOOKING_NOTIFY_EMAIL;
  if (!notifyAddress) {
    return { statusCode: 500, body: JSON.stringify({ error: msgs.notConfigured }) };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromAddress = process.env.BOOKING_FROM_EMAIL || 'onboarding@resend.dev';

    await resend.emails.send({
      from: fromAddress,
      to: notifyAddress,
      replyTo: email,
      subject: `Neue Nachricht von der Website: ${name}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}<br>
        <strong>E-Mail:</strong> ${escapeHtml(email)}</p>
        <p><strong>Nachricht:</strong></p>
        <p>${escapeHtml(nachricht).replace(/\n/g, '<br>')}</p>
      `,
    });
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: msgs.sendFailed }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
