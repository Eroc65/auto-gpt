const FORWARD_NUMBER = "+14053782099";

const ROUTES = {
  "fort-worth": {
    slug: "fort-worth",
    label: "Fort Worth Garage Door Repair",
    publicPath: "/api/twilio/voice/fort-worth",
  },
  "el-paso": {
    slug: "el-paso",
    label: "El Paso Garage Door Repair",
    publicPath: "/api/twilio/voice/el-paso",
  },
  arlington: {
    slug: "arlington",
    label: "Arlington Garage Door Repair",
    publicPath: "/api/twilio/voice/arlington",
  },
};

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function resolveBaseUrl(req) {
  const configured = String(process.env.PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  if (configured) return configured.replace(/\/$/, "");

  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim() || "https";
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  return host ? `${proto}://${host}` : "";
}

export function getMarketRoute(slug) {
  return ROUTES[String(slug || "").trim().toLowerCase()] || null;
}

export function buildVoiceTwiml(req, slug) {
  const route = getMarketRoute(slug);
  if (!route) {
    return {
      status: 404,
      body: '<?xml version="1.0" encoding="UTF-8"?><Response><Say>This Twilio route is not configured.</Say></Response>',
    };
  }

  const baseUrl = resolveBaseUrl(req);
  const whisperUrl = `${baseUrl}/api/twilio/whisper/${route.slug}`;

  return {
    status: 200,
    body: [
      '<?xml version="1.0" encoding="UTF-8"?>',
      "<Response>",
      `<Dial answerOnBridge="true"><Number url="${escapeXml(whisperUrl)}">${FORWARD_NUMBER}</Number></Dial>`,
      "</Response>",
    ].join(""),
  };
}

export function buildWhisperTwiml(slug) {
  const route = getMarketRoute(slug);
  if (!route) {
    return {
      status: 404,
      body: '<?xml version="1.0" encoding="UTF-8"?><Response><Say>This whisper route is not configured.</Say></Response>',
    };
  }

  return {
    status: 200,
    body: [
      '<?xml version="1.0" encoding="UTF-8"?>',
      "<Response>",
      `<Say voice="alice">${escapeXml(route.label)} call.</Say>`,
      '<Pause length="1"/>',
      "</Response>",
    ].join(""),
  };
}