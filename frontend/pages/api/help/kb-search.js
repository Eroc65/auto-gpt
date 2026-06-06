import crypto from "crypto";
import {
  buildConfigKbContext,
  getKbResolution,
  GOFIELDWISE_CONFIG_KB_VERSION,
  GOFIELDWISE_CONFIG_KB_DEFAULT_CONFIDENCE_THRESHOLD,
} from "../../../lib/gofieldwise-config-kb";
import { recordKbLowConfidenceEvent } from "../../../lib/kb-telemetry-store";

const LOW_CONFIDENCE_EVENT = "gofieldwise_kb_low_confidence";

function toQueryFingerprint(query) {
  const normalized = String(query || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
  if (!normalized) return null;
  return crypto.createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}

function logLowConfidenceTelemetry({ query, category, tag, confidenceThreshold, resolution }) {
  const fingerprint = toQueryFingerprint(query);
  if (!fingerprint) return;

  const payload = {
    event: LOW_CONFIDENCE_EVENT,
    at: new Date().toISOString(),
    version: GOFIELDWISE_CONFIG_KB_VERSION,
    queryFingerprint: fingerprint,
    queryLength: String(query || "").length,
    category: category || null,
    tag: tag || null,
    topConfidence: resolution.topConfidence,
    confidenceThreshold,
    clarifyingQuestion: resolution.clarifyingQuestion || null,
  };

  // Structured JSON logs are easy to aggregate in hosting logs.
  console.info(JSON.stringify(payload));
  recordKbLowConfidenceEvent(payload);
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const {
    query = "",
    limit = 6,
    category = null,
    tag = null,
    confidenceThreshold = GOFIELDWISE_CONFIG_KB_DEFAULT_CONFIDENCE_THRESHOLD,
  } = req.body || {};
  const numericLimit = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(12, Number(limit))) : 6;
  const numericThreshold = Number.isFinite(Number(confidenceThreshold))
    ? Math.max(0, Math.min(1, Number(confidenceThreshold)))
    : GOFIELDWISE_CONFIG_KB_DEFAULT_CONFIDENCE_THRESHOLD;

  const resolution = getKbResolution({
    query,
    limit: numericLimit,
    category,
    tag,
    confidenceThreshold: numericThreshold,
  });

  const items = resolution.items.map((row) => ({
    ...row.entry,
    score: row.score,
    confidence: row.confidence,
  }));

  const context = resolution.confident
    ? buildConfigKbContext({
        query,
        limit: Math.min(5, numericLimit),
        category,
        tag,
      })
    : `Low-confidence match. Clarify before answering: ${resolution.clarifyingQuestion}`;

  if (!resolution.confident) {
    logLowConfidenceTelemetry({
      query,
      category,
      tag,
      confidenceThreshold: numericThreshold,
      resolution,
    });
  }

  return res.status(200).json({
    ok: true,
    version: GOFIELDWISE_CONFIG_KB_VERSION,
    query,
    confident: resolution.confident,
    topConfidence: resolution.topConfidence,
    confidenceThreshold: numericThreshold,
    clarifyingQuestion: resolution.clarifyingQuestion,
    count: items.length,
    items,
    context,
  });
}