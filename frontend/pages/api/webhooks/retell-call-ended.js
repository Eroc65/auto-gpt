import crypto from "crypto";

import { sendSms } from "../../../lib/twilio-sms";
import {
  buildCallerMessage,
  buildOwnerMessage,
  extractBooking,
  resolveRoute,
  wasResolved,
} from "../../../lib/call-alerts";

// Retell signs the raw body, so Next's JSON parser has to stay out of the way.
export const config = { api: { bodyParser: false } };

const MAX_SIGNATURE_AGE_MS = 5 * 60 * 1000;
const HANDLED_EVENT = "call_analyzed";

// Retell retries webhooks; a retry must not text anyone twice.
const seenCallIds = new Set();
const SEEN_LIMIT = 500;

function rememberCall(callId) {
  if (!callId) return false;
  if (seenCallIds.has(callId)) return true;
  seenCallIds.add(callId);
  if (seenCallIds.size > SEEN_LIMIT) {
    seenCallIds.delete(seenCallIds.values().next().value);
  }
  return false;
}

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

// X-Retell-Signature is "v={unix_ms},d={hex}" where the digest is
// HMAC-SHA256(rawBody + timestamp) keyed with the Retell API key.
function verifySignature(rawBody, header, apiKey) {
  if (!apiKey) return { ok: false, reason: "missing_api_key" };
  if (!header) return { ok: false, reason: "missing_signature" };

  const match = /v=(\d+),\s*d=([a-f0-9]+)/i.exec(String(header));
  if (!match) return { ok: false, reason: "malformed_signature" };

  const [, timestamp, digest] = match;
  if (Math.abs(Date.now() - Number(timestamp)) > MAX_SIGNATURE_AGE_MS) {
    return { ok: false, reason: "stale_signature" };
  }

  const expected = crypto
    .createHmac("sha256", apiKey)
    .update(rawBody + timestamp)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(digest.toLowerCase(), "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: "signature_mismatch" };
  }
  return { ok: true };
}

function log(event, fields) {
  console.info(JSON.stringify({ event, at: new Date().toISOString(), ...fields }));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const rawBody = await readRawBody(req);
  const verdict = verifySignature(
    rawBody,
    req.headers["x-retell-signature"],
    process.env.RETELL_API_KEY || ""
  );

  if (!verdict.ok) {
    log("retell_webhook_rejected", { reason: verdict.reason });
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    log("retell_webhook_bad_json", { detail: error.message });
    return res.status(400).json({ ok: false, error: "Invalid JSON" });
  }

  const { event, call } = payload || {};
  if (event !== HANDLED_EVENT) {
    return res.status(200).json({ ok: true, skipped: `event_${event || "unknown"}` });
  }

  if (rememberCall(call?.call_id)) {
    return res.status(200).json({ ok: true, skipped: "duplicate_call_id" });
  }

  // Only numbers listed in CALL_ALERT_ROUTES send anything. Rank-and-rent
  // forwarding numbers never reach this webhook, and would be skipped here.
  const route = resolveRoute(call?.to_number);
  if (!route) {
    log("retell_webhook_unrouted", { call_id: call?.call_id, to: call?.to_number || null });
    return res.status(200).json({ ok: true, skipped: "number_not_configured" });
  }

  const booking = extractBooking(call);
  const resolved = wasResolved(call, booking);
  const results = {};

  const callerNumber = String(call?.from_number || "");
  const callerIsReachable =
    call?.direction === "inbound" && /^\+?\d{10,}$/.test(callerNumber.replace(/\s/g, ""));

  if (route.textCaller && callerIsReachable) {
    results.caller = await sendSms({
      to: callerNumber,
      body: buildCallerMessage({ businessName: route.businessName, booking }),
    });
  } else {
    results.caller = { sent: false, reason: route.textCaller ? "caller_unreachable" : "disabled" };
  }

  const ownerWanted = route.ownerSms && (route.mode === "all" || !resolved);
  if (ownerWanted) {
    results.owner = await sendSms({
      to: route.ownerSms,
      body: buildOwnerMessage({ businessName: route.businessName, call, booking, resolved }),
    });
  } else {
    results.owner = {
      sent: false,
      reason: route.ownerSms ? "suppressed_resolved_call" : "no_owner_number",
    };
  }

  log("retell_call_notifications", {
    call_id: call?.call_id || null,
    to: call?.to_number || null,
    from: call?.from_number || null,
    business: route.businessName,
    booking: booking || null,
    resolved,
    caller_sent: results.caller.sent,
    caller_reason: results.caller.reason || null,
    owner_sent: results.owner.sent,
    owner_reason: results.owner.reason || null,
  });

  // Always 200: a texting failure is logged, not retried forever by Retell.
  return res.status(200).json({
    ok: true,
    callerSent: results.caller.sent,
    ownerSent: results.owner.sent,
  });
}
