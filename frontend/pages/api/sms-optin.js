const TWILIO_API_BASE = "https://api.twilio.com/2010-04-01";
const SEND_TIMEOUT_MS = 6000;

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

function getTwilioConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
  const authToken = process.env.TWILIO_AUTH_TOKEN || "";
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID || "";
  const from = process.env.TWILIO_SMS_FROM || process.env.TWILIO_SALES_SUPPORT_NUMBER || "";

  if (!accountSid || !authToken) return { ready: false, reason: "missing_credentials" };
  if (!messagingServiceSid && !from) return { ready: false, reason: "missing_sender" };

  return { ready: true, accountSid, authToken, messagingServiceSid, from };
}

async function sendConfirmationSms(toE164) {
  const config = getTwilioConfig();
  if (!config.ready) return { sent: false, reason: config.reason };

  const params = new URLSearchParams({ To: toE164, Body: CONFIRMATION_BODY });
  if (config.messagingServiceSid) {
    params.set("MessagingServiceSid", config.messagingServiceSid);
  } else {
    params.set("From", config.from);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);

  try {
    const auth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");
    const response = await fetch(`${TWILIO_API_BASE}/Accounts/${config.accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        sent: false,
        reason: "twilio_error",
        status: response.status,
        code: payload.code || null,
        detail: payload.message || null,
      };
    }

    return { sent: true, messageSid: payload.sid || null };
  } catch (error) {
    const reason = error.name === "AbortError" ? "timeout" : "network_error";
    return { sent: false, reason, detail: error.message };
  } finally {
    clearTimeout(timer);
  }
}

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

  // Consent record. Keep these fields — they are the TCPA audit trail.
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

  const confirmation = await sendConfirmationSms(formattedPhone);

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

  // A failed confirmation text must not lose the opt-in: the consent is already
  // recorded above, so the submission still succeeds.
  return res.status(200).json({
    ok: true,
    confirmationSent: confirmation.sent,
    message: confirmation.sent
      ? "You're opted in. Check your phone for a confirmation message."
      : "You're opted in. We'll be in touch shortly.",
    phone: formattedPhone,
  });
}
