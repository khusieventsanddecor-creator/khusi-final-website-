const DESTINATION_EMAIL = "admin@khusi.com.au";
const allowedOrigins = new Set([
  "https://www.khusi.com.au",
  "https://khusi.com.au",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
  "null",
]);

const setCorsHeaders = (req, res) => {
  const origin = req.headers.origin || "";
  const isVercelPreview = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

  if (allowedOrigins.has(origin) || isVercelPreview) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

const fields = [
  ["Your name", "name"],
  ["Attending with", "partnerName"],
  ["Attendance", "attendance"],
  ["Note", "note"],
];

const parseBody = (body) => {
  if (!body) {
    return {};
  }

  if (typeof body === "object") {
    return body;
  }

  try {
    return JSON.parse(body);
  } catch (error) {
    return {};
  }
};

const clean = (value) => String(value || "").trim();

const escapeHtml = (value) =>
  clean(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const buildTextEmail = (payload) =>
  [
    "New Coffee RSVP",
    "",
    ...fields
      .map(([label, key]) => [label, clean(payload[key])])
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`),
  ].join("\n");

const buildHtmlEmail = (payload) => {
  const rows = fields
    .map(([label, key]) => [label, clean(payload[key])])
    .filter(([, value]) => value)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding: 10px 14px; border-bottom: 1px solid #f0d6dc; color: #5c0b19; font-weight: 700;">${escapeHtml(label)}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #f0d6dc; color: #2b1d17;">${escapeHtml(value).replace(/\n/g, "<br>")}</td>
        </tr>`,
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; background: #fbf6ef; padding: 24px;">
      <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #f0d6dc; border-radius: 8px; overflow: hidden;">
        <div style="background: #8f1d35; color: #ffffff; padding: 22px 24px;">
          <h1 style="margin: 0; font-size: 22px;">New Coffee RSVP</h1>
          <p style="margin: 8px 0 0; color: #f8dbe3;">Attendance: ${escapeHtml(payload.attendance)}</p>
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
          ${rows}
        </table>
      </div>
    </div>`;
};

module.exports = async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const payload = parseBody(req.body);
  const name = clean(payload.name);
  const attendance = clean(payload.attendance);

  if (!name || !attendance) {
    return res.status(400).json({ error: "Please include your name and attendance response." });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || "Khusi Events <onboarding@resend.dev>";
  const toEmail = process.env.CONTACT_TO_EMAIL || DESTINATION_EMAIL;

  if (!resendApiKey) {
    return res.status(500).json({ error: "Email service is missing the RESEND_API_KEY setting in Vercel." });
  }

  const subject = `New coffee RSVP from ${name}`;

  try {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject,
        text: buildTextEmail(payload),
        html: buildHtmlEmail(payload),
      }),
    });

    if (!emailResponse.ok) {
      const providerMessage = await emailResponse.text();
      console.error("Resend rejected RSVP email:", providerMessage);
      return res.status(502).json({ error: "Email sender is not verified in Resend. Check CONTACT_FROM_EMAIL in Vercel or verify the sender domain in Resend." });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Unable to send RSVP email:", error);
    return res.status(500).json({ error: "Something went wrong while sending the RSVP." });
  }
};
