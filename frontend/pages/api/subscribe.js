export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { email = "", source = "field-notes" } = req.body || {};
  const normalizedEmail = String(email).trim().toLowerCase();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({ ok: false, error: "Please provide a valid email." });
  }

  // Stub only: replace this with ConvertKit/Resend/Mailchimp/custom integration.
  console.info(
    JSON.stringify({
      event: "field_notes_subscribe",
      at: new Date().toISOString(),
      email: normalizedEmail,
      source: String(source || "field-notes"),
    })
  );

  return res.status(200).json({
    ok: true,
    message: "Thanks. You are subscribed to Field Notes.",
  });
}
