function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

function getField(body, key) {
  if (!body) return "";

  if (typeof body === "string") {
    const params = new URLSearchParams(body);
    return params.get(key) || "";
  }

  if (typeof body === "object") {
    return body[key] || "";
  }

  return "";
}

function resolveAgentId(toNumber) {
  const frontOfficeNumber = normalizePhone(
    process.env.TWILIO_FRONT_OFFICE_NUMBER || "+16029320967"
  );
  const salesSupportNumber = normalizePhone(
    process.env.TWILIO_SALES_SUPPORT_NUMBER || "+18552476985"
  );

  const frontOfficeAgent =
    process.env.RETELL_FRONT_OFFICE_AGENT_ID || process.env.RETELL_AGENT_ID || "";
  const salesSupportAgent = process.env.RETELL_SALES_SUPPORT_AGENT_ID || "";

  if (!frontOfficeAgent && !salesSupportAgent) return "";

  if (toNumber === salesSupportNumber && salesSupportAgent) {
    return salesSupportAgent;
  }

  if (toNumber === frontOfficeNumber && frontOfficeAgent) {
    return frontOfficeAgent;
  }

  return frontOfficeAgent || salesSupportAgent;
}

function buildTwiml(agentId) {
  if (!agentId) {
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      "<Response>",
      "<Say>We are unable to connect your call right now. Please try again shortly.</Say>",
      "</Response>",
    ].join("");
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<Response><Dial><Sip>",
    `sip:${agentId}@sip.retellai.com;transport=tls`,
    "</Sip></Dial></Response>",
  ].join("");
}

export default function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const toNumber = normalizePhone(getField(req.body, "To") || req.query?.To || "");
  const agentId = resolveAgentId(toNumber);
  const twiml = buildTwiml(agentId);

  res.setHeader("Content-Type", "text/xml; charset=utf-8");
  return res.status(200).send(twiml);
}
