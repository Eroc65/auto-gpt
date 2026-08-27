export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { phone = "", consent = null, source = "gofieldwise_footer" } = req.body || {};
  const normalizedPhone = String(phone)
    .trim()
    .replace(/\D/g, ""); // Remove non-digits

  // Validate US/Canada phone format (10+ digits)
  if (normalizedPhone.length < 10) {
    return res.status(400).json({ ok: false, error: "Please provide a valid phone number." });
  }

  // Format phone number for display
  const formattedPhone = `+1${normalizedPhone.slice(-10)}`;

  // Log SMS opt-in event
  console.info(
    JSON.stringify({
      event: "sms_optin",
      at: new Date().toISOString(),
      phone: formattedPhone,
      raw_phone: normalizedPhone,
      source: String(source),
      consent: consent === null ? "implied_by_form_submission" : Boolean(consent),
      consent_language:
        "By checking this box, I agree to receive recurring automated marketing and service text messages from GoFieldWise at the mobile number provided. Consent is not a condition of purchase. Message frequency varies, up to 6 messages per month. Msg & data rates may apply. Reply HELP for help, STOP to cancel.",
      user_agent: req.headers["user-agent"] || null,
      ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || null,
    })
  );

  // TODO: Integrate with Twilio or your SMS provider
  // Example: Send welcome SMS, add to contacts list, sync with CRM
  // For now, this is a placeholder that logs the opt-in

  return res.status(200).json({
    ok: true,
    message: "You've been subscribed to GoFieldWise SMS updates. Check your phone for a welcome message.",
    phone: formattedPhone,
  });
}
