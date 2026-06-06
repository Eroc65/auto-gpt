import { getKbLowConfidenceSummary } from "../../../lib/kb-telemetry-store";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const expectedToken = process.env.KB_TELEMETRY_ADMIN_TOKEN;
  if (!expectedToken) {
    return res.status(503).json({ ok: false, error: "Telemetry admin token is not configured." });
  }

  const providedToken = req.headers["x-kb-telemetry-admin-token"];
  if (typeof providedToken !== "string" || providedToken !== expectedToken) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const { lookbackHours = 24, limit = 10 } = req.query || {};

  const summary = getKbLowConfidenceSummary({
    lookbackHours,
    limit,
  });

  return res.status(200).json({
    ok: true,
    ...summary,
  });
}
