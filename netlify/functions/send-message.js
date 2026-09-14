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

  const name = String(data.name || '').trim();
  const email = String(data.email || '').trim();
  const nachricht = String(data.nachricht || '').trim();

  if (!name || name.length > 200) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Bitte einen Namen angeben.' }) };
  }
  if (!isValidEmail(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Bitte eine gueltige E-Mail-Adresse angeben.' }) };
  }
  if (!nachricht || nachricht.length > 5000) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Bitte eine Nachricht angeben.' }) };
  }

  const notifyAddress = process.env.BOOKING_NOTIFY_EMAIL;
  if (!notifyAddress) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Versand ist noch nicht konfiguriert.' }) };
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
    return { statusCode: 502, body: JSON.stringify({ error: 'Nachricht konnte nicht versendet werden.' }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
