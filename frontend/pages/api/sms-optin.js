import { sendSms } from "../../lib/twilio-sms";

// Must stay word-for-word identical to the opt-in message submitted with the
// toll-free registration and shown on /sms. Reviewers compare them.
const CONFIRMATION_BODY =
  "GoFieldWise: You are now opted in to receive text messages. " +
  "Msg frequency varies, up to 6 msgs/month. Msg & data rates may apply. " +
  "Reply HELP for help, STOP to cancel.";

const CONSENT_LANGUAGE =
  "By checking this box, I agree to receive recurring automated marketing and service text " +
  "messages from GoFieldWise at the mobile number provided. Consent is not a condition of " +
  "purchase. Message frequency varies, up to 6 messages per month. Msg & data rates may apply. " +
  "Reply HELP for help, STOP to cancel.";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { phone = "", consent = null, source = "gofieldwise_footer" } = req.body || {};
  const normalizedPhone = String(phone).trim().replace(/\D/g, "");

  if (normalizedPhone.length < 10) {
    return res.status(400).json({ ok: false, error: "Please provide a valid phone number." });
  }

  const formattedPhone = `+1${normalizedPhone.slice(-10)}`;

  // Consent record. Keep these fields — they are the TCPA audit trail, and it
  // is written before the send so a Twilio failure never loses the opt-in.
  console.info(
    JSON.stringify({
      event: "sms_optin",
      at: new Date().toISOString(),
      phone: formattedPhone,
      raw_phone: normalizedPhone,
      source: String(source),
      consent: consent === null ? "implied_by_form_submission" : Boolean(consent),
      consent_language: CONSENT_LANGUAGE,
      user_agent: req.headers["user-agent"] || null,
      ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || null,
    })
  );

  const confirmation = await sendSms({ to: formattedPhone, body: CONFIRMATION_BODY });

  console.info(
    JSON.stringify({
      event: "sms_optin_confirmation",
      at: new Date().toISOString(),
      phone: formattedPhone,
      sent: confirmation.sent,
      reason: confirmation.reason || null,
      message_sid: confirmation.messageSid || null,
      twilio_code: confirmation.code || null,
      twilio_detail: confirmation.detail || null,
    })
  );

  return res.status(200).json({
    ok: true,
    confirmationSent: confirmation.sent,
    message: confirmation.sent
      ? "You're opted in. Check your phone for a confirmation message."
      : "You're opted in. We'll be in touch shortly.",
    phone: formattedPhone,
  });
}
