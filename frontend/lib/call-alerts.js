import { normalizeE164 } from "./twilio-sms";

// Which numbers get post-call texts. Opt-in by design: a number absent from
// this map sends nothing, so rank-and-rent forwarding numbers and any other
// line are untouched unless deliberately added.
//
// CALL_ALERT_ROUTES is JSON keyed by the number that was CALLED:
// {
//   "+16029320967": { "businessName": "GoFieldWise", "ownerSms": "+14055550123" }
// }
// Optional per-route keys: "mode" ("all" | "unresolved"), "textCaller" (bool).
let cachedRoutes = null;
let cachedRaw = null;

export function getRoutes() {
  const raw = process.env.CALL_ALERT_ROUTES || "";
  if (cachedRoutes && cachedRaw === raw) return cachedRoutes;

  let parsed = {};
  if (raw.trim()) {
    try {
      const candidate = JSON.parse(raw);
      if (candidate && typeof candidate === "object") parsed = candidate;
    } catch (error) {
      console.error(
        JSON.stringify({ event: "call_alert_routes_invalid", detail: error.message })
      );
    }
  }

  const normalized = {};
  for (const [key, value] of Object.entries(parsed)) {
    const number = normalizeE164(key);
    if (!number || !value || typeof value !== "object") continue;
    normalized[number] = {
      businessName: String(value.businessName || "GoFieldWise").trim(),
      ownerSms: value.ownerSms ? normalizeE164(value.ownerSms) : "",
      mode: value.mode === "unresolved" ? "unresolved" : "all",
      textCaller: value.textCaller === false ? false : true,
    };
  }

  cachedRoutes = normalized;
  cachedRaw = raw;
  return normalized;
}

export function resolveRoute(toNumber) {
  const number = normalizeE164(toNumber);
  if (!number) return null;
  return getRoutes()[number] || null;
}

const BOOKING_KEY = /(appointment|booking|schedule|visit)/i;

// Retell's custom_analysis_data keys are whatever the agent was configured to
// extract, so match on intent rather than an exact key name.
export function extractBooking(call) {
  const data = call?.call_analysis?.custom_analysis_data;
  if (!data || typeof data !== "object") return "";

  for (const [key, value] of Object.entries(data)) {
    if (!BOOKING_KEY.test(key)) continue;
    if (typeof value === "string" && value.trim() && !/^(no|none|n\/a|false)$/i.test(value.trim())) {
      return value.trim();
    }
  }
  return "";
}

export function formatDuration(call) {
  const start = Number(call?.start_timestamp) || 0;
  const end = Number(call?.end_timestamp) || 0;
  if (!start || !end || end < start) return "unknown length";
  const seconds = Math.round((end - start) / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes}m${seconds % 60}s` : `${seconds}s`;
}

export function formatCallTime(call) {
  const stamp = Number(call?.start_timestamp) || 0;
  if (!stamp) return "";
  const timeZone = process.env.CALL_ALERT_TIMEZONE || "America/Chicago";
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(stamp));
  } catch (error) {
    return new Date(stamp).toISOString();
  }
}

export function wasResolved(call, booking) {
  if (booking) return true;
  const successful = call?.call_analysis?.call_successful;
  return successful === true;
}

export function buildCallerMessage({ businessName, booking }) {
  const brand = businessName || "GoFieldWise";
  if (booking) {
    return (
      `${brand}: Thanks for calling. You're booked for ${booking}. ` +
      `Call us back at any time if you need to change it. Reply STOP to cancel texts.`
    );
  }
  return (
    `${brand}: Thanks for calling. We have your request and someone will follow up shortly. ` +
    `Reply STOP to cancel texts.`
  );
}

export function buildOwnerMessage({ businessName, call, booking, resolved }) {
  const brand = businessName || "GoFieldWise";
  const flag = resolved ? "BOOKED" : "NEEDS FOLLOW-UP";
  const when = formatCallTime(call);
  const caller = call?.from_number || "unknown number";
  const summary = String(call?.call_analysis?.call_summary || "").trim();

  const parts = [
    `${brand} [${flag}]: Call from ${caller}${when ? ` at ${when}` : ""} (${formatDuration(call)}).`,
  ];
  if (booking) parts.push(`Booked: ${booking}.`);
  if (call?.disconnection_reason) parts.push(`Ended: ${call.disconnection_reason}.`);
  if (summary) parts.push(summary.length > 320 ? `${summary.slice(0, 317)}...` : summary);

  return parts.join(" ");
}
