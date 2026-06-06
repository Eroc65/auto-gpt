const MAX_EVENTS = 500;
const events = [];

function clampLimit(limit, defaultValue, maxValue) {
  const n = Number(limit);
  if (!Number.isFinite(n)) return defaultValue;
  return Math.max(1, Math.min(maxValue, Math.floor(n)));
}

export function recordKbLowConfidenceEvent(event) {
  if (!event || !event.queryFingerprint) return;
  events.push({ ...event });
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }
}

export function getKbLowConfidenceSummary({ lookbackHours = 24, limit = 10 } = {}) {
  const safeLookbackHours = Math.max(1, Math.min(168, Number(lookbackHours) || 24));
  const safeLimit = clampLimit(limit, 10, 50);
  const cutoff = Date.now() - safeLookbackHours * 60 * 60 * 1000;

  const recent = events.filter((event) => {
    const ts = Date.parse(event.at || "");
    return Number.isFinite(ts) && ts >= cutoff;
  });

  const byFingerprint = new Map();
  const byCategory = new Map();
  const byTag = new Map();
  const byClarifyingQuestion = new Map();

  for (const event of recent) {
    const fpKey = event.queryFingerprint;
    const existing = byFingerprint.get(fpKey) || {
      queryFingerprint: fpKey,
      count: 0,
      lastSeenAt: null,
      avgTopConfidence: 0,
      lastCategory: null,
      lastTag: null,
      lastClarifyingQuestion: null,
    };

    existing.count += 1;
    existing.avgTopConfidence =
      (existing.avgTopConfidence * (existing.count - 1) + Number(event.topConfidence || 0)) / existing.count;

    if (!existing.lastSeenAt || event.at > existing.lastSeenAt) {
      existing.lastSeenAt = event.at;
      existing.lastCategory = event.category || null;
      existing.lastTag = event.tag || null;
      existing.lastClarifyingQuestion = event.clarifyingQuestion || null;
    }

    byFingerprint.set(fpKey, existing);

    const categoryKey = event.category || "unknown";
    byCategory.set(categoryKey, (byCategory.get(categoryKey) || 0) + 1);

    const tagKey = event.tag || "none";
    byTag.set(tagKey, (byTag.get(tagKey) || 0) + 1);

    const cqKey = event.clarifyingQuestion || "none";
    byClarifyingQuestion.set(cqKey, (byClarifyingQuestion.get(cqKey) || 0) + 1);
  }

  const topFingerprints = [...byFingerprint.values()]
    .sort((a, b) => b.count - a.count || (b.lastSeenAt || "").localeCompare(a.lastSeenAt || ""))
    .slice(0, safeLimit)
    .map((row) => ({
      ...row,
      avgTopConfidence: Number(row.avgTopConfidence.toFixed(4)),
    }));

  const topCategories = [...byCategory.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, safeLimit);

  const topTags = [...byTag.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, safeLimit);

  const topClarifyingQuestions = [...byClarifyingQuestion.entries()]
    .map(([clarifyingQuestion, count]) => ({ clarifyingQuestion, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, safeLimit);

  return {
    lookbackHours: safeLookbackHours,
    totalEventsInWindow: recent.length,
    topFingerprints,
    topCategories,
    topTags,
    topClarifyingQuestions,
  };
}
