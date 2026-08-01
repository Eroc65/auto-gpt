export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { phone = "" } = req.body || {};
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
      source: "gofieldwise_footer",
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
