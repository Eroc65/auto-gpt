const TWILIO_API_BASE = "https://api.twilio.com/2010-04-01";
const SEND_TIMEOUT_MS = 6000;

export function normalizeE164(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

export function getTwilioConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
  const authToken = process.env.TWILIO_AUTH_TOKEN || "";
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID || "";
  const from = process.env.TWILIO_SMS_FROM || process.env.TWILIO_SALES_SUPPORT_NUMBER || "";

  if (!accountSid || !authToken) return { ready: false, reason: "missing_credentials" };
  if (!messagingServiceSid && !from) return { ready: false, reason: "missing_sender" };

  return { ready: true, accountSid, authToken, messagingServiceSid, from };
}

// Sends one SMS. Never throws: callers log the result and carry on, because a
// failed notification must not fail the request that triggered it.
export async function sendSms({ to, body, from }) {
  const config = getTwilioConfig();
  if (!config.ready) return { sent: false, reason: config.reason };

  const toE164 = normalizeE164(to);
  if (!toE164 || toE164.length < 12) return { sent: false, reason: "invalid_recipient" };
  if (!body) return { sent: false, reason: "empty_body" };

  const params = new URLSearchParams({ To: toE164, Body: body });
  const explicitFrom = from ? normalizeE164(from) : "";
  if (explicitFrom) {
    params.set("From", explicitFrom);
  } else if (config.messagingServiceSid) {
    params.set("MessagingServiceSid", config.messagingServiceSid);
  } else {
    params.set("From", normalizeE164(config.from));
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
    return {
      sent: false,
      reason: error.name === "AbortError" ? "timeout" : "network_error",
      detail: error.message,
    };
  } finally {
    clearTimeout(timer);
  }
}
