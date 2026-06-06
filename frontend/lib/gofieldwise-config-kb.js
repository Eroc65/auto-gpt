export const GOFIELDWISE_CONFIG_KB_VERSION = "2026-05-22";
export const GOFIELDWISE_CONFIG_KB_DEFAULT_CONFIDENCE_THRESHOLD = 0.34;

const KB = [
  {
    id: "mode-sidecar",
    category: "mode",
    title: "Sidecar Mode",
    tags: ["sidecar", "crm", "jobber", "housecall", "configuration"],
    body:
      "GoFieldWise handles call answering, lead qualification, and follow-up while the customer CRM remains the system of record for jobs and invoices.",
    value:
      "Best for teams already operating in another CRM that want faster speed-to-lead without retraining office workflows.",
    bestFor: "Existing CRM users",
  },
  {
    id: "mode-hybrid",
    category: "mode",
    title: "Hybrid Mode",
    tags: ["hybrid", "escalation", "automation", "dispatch"],
    body:
      "GoFieldWise automates routine intake and missed-call recovery, while complex or urgent work is escalated to the team with context.",
    value:
      "Reduces admin load during call spikes while keeping human control where judgment is needed.",
    bestFor: "Busy teams with mixed complexity",
  },
  {
    id: "mode-standalone",
    category: "mode",
    title: "Standalone Mode",
    tags: ["standalone", "all-in-one", "front-office"],
    body:
      "GoFieldWise runs the front office flow end-to-end from first call to follow-up and billing handoff.",
    value:
      "Best for teams replacing fragmented tools and wanting one operating workflow.",
    bestFor: "Teams consolidating systems",
  },
  {
    id: "service-jobber",
    category: "service",
    title: "Jobber integration",
    tags: ["jobber", "integration", "sidecar", "sync"],
    body:
      "GoFieldWise captures call context and qualification details, then syncs the right records into Jobber for dispatch and job management.",
    value:
      "Preserves Jobber operations while improving lead capture and response consistency.",
    bestFor: "Dispatch-centric Jobber shops",
  },
  {
    id: "service-housecall",
    category: "service",
    title: "Housecall Pro integration",
    tags: ["housecall", "housecall pro", "integration", "sidecar"],
    body:
      "GoFieldWise handles intake and missed-call recovery and returns structured notes and context to Housecall Pro.",
    value:
      "Improves booking quality without changing field execution behavior.",
    bestFor: "Housecall-based service teams",
  },
  {
    id: "service-quickbooks",
    category: "service",
    title: "QuickBooks configuration",
    tags: ["quickbooks", "accounting", "invoices", "finance"],
    body:
      "GoFieldWise contributes cleaner intake and job outcome details so invoicing and accounting handoff is accurate and faster.",
    value:
      "Reduces billing friction and missing context at invoice time.",
    bestFor: "Finance-driven operators",
  },
  {
    id: "service-google-calendar",
    category: "service",
    title: "Google Calendar configuration",
    tags: ["google calendar", "scheduling", "appointments"],
    body:
      "GoFieldWise schedules and confirms appointment windows while keeping owner and team calendar visibility aligned.",
    value:
      "Cuts scheduling back-and-forth for lean teams.",
    bestFor: "Small teams with lightweight dispatch",
  },
  {
    id: "feature-call-answering",
    category: "feature",
    title: "24/7 AI call answering",
    tags: ["call answering", "24/7", "coverage"],
    body:
      "All inbound calls are answered immediately, including after hours and peak windows.",
    value:
      "Prevents revenue leakage from missed calls.",
  },
  {
    id: "feature-lead-qualification",
    category: "feature",
    title: "Lead qualification",
    tags: ["qualification", "intake", "urgency", "service type"],
    body:
      "The AI captures service type, urgency, customer details, and scheduling context for better handoff quality.",
    value:
      "Increases booking confidence and lowers back-and-forth.",
  },
  {
    id: "feature-follow-up",
    category: "feature",
    title: "Automated follow-up",
    tags: ["follow-up", "sms", "customer updates", "retention"],
    body:
      "Automated reminders and updates keep customers informed and improve close rate after first contact.",
    value:
      "Improves conversion and repeat engagement without manual chasing.",
  },
  {
    id: "onboarding-sequence",
    category: "onboarding",
    title: "Recommended onboarding sequence",
    tags: ["onboarding", "setup", "activation", "configuration"],
    body:
      "1) Select mode (sidecar, hybrid, standalone). 2) Confirm connector. 3) Configure intake fields. 4) Validate routing and follow-up. 5) Run live demo.",
    value:
      "Ensures customers understand what changes and what remains in their current stack.",
  },
  {
    id: "troubleshooting-mode-fit",
    category: "troubleshooting",
    title: "Choosing the wrong mode",
    tags: ["troubleshooting", "mode", "fit", "support"],
    body:
      "If customers already rely on CRM workflows and resist process change, start with sidecar. If they are overwhelmed by tool sprawl, evaluate standalone.",
    value:
      "Improves adoption by matching configuration to team readiness.",
  },
  {
    id: "policy-access-boundary",
    category: "policy",
    title: "Customer access boundary",
    tags: ["policy", "security", "permissions"],
    body:
      "Customers and operators can configure business workflows, but do not receive backend infrastructure or secret management access.",
    value:
      "Protects platform security while enabling self-service onboarding.",
  },
];

export function getGofieldwiseConfigKnowledgeBase() {
  return KB;
}

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function scoreEntry(entry, queryTokens) {
  if (!queryTokens.length) return { score: 0, matchedCount: 0 };
  const haystack = tokenize([entry.title, entry.body, entry.value, ...(entry.tags || [])].join(" "));
  const set = new Set(haystack);
  let score = 0;
  let matchedCount = 0;
  for (const token of queryTokens) {
    const exact = set.has(token);
    const partialTag = (entry.tags || []).some((tag) => tag.toLowerCase().includes(token));
    if (exact) {
      score += 2;
      matchedCount += 1;
    }
    if (partialTag) score += 1;
  }
  return { score, matchedCount };
}

function scoreToConfidence(score, matchedCount, queryTokens) {
  const tokenCount = Array.isArray(queryTokens) ? queryTokens.length : 0;
  if (!tokenCount) return 1;
  const coverageDenominator = Math.min(Math.max(tokenCount, 1), 3);
  const coverage = Math.max(0, Math.min(1, matchedCount / coverageDenominator));
  const scoreNormalized = Math.max(0, Math.min(1, score / (tokenCount * 3)));
  // Weighted blend favors token coverage so natural language prompts are not unfairly penalized.
  return Math.max(0, Math.min(1, coverage * 0.75 + scoreNormalized * 0.25));
}

function suggestClarifyingQuestion({ query = "", category = null, tag = null } = {}) {
  const q = String(query || "").toLowerCase();
  if (q.includes("sidecar") || q.includes("hybrid") || q.includes("standalone") || category === "mode") {
    return "Are you deciding between Sidecar, Hybrid, or Standalone mode for your current workflow?";
  }
  if (
    q.includes("jobber") ||
    q.includes("housecall") ||
    q.includes("quickbooks") ||
    q.includes("calendar") ||
    category === "service" ||
    tag
  ) {
    return "Which connector are you configuring right now: Jobber, Housecall Pro, QuickBooks, or Google Calendar?";
  }
  if (q.includes("setup") || q.includes("onboard") || category === "onboarding") {
    return "Are you asking about first-time setup sequence or a specific connector configuration step?";
  }
  return "Do you want help with mode selection, connector setup, or feature behavior?";
}

function rankKnowledgeBase({ query = "", category = null, tag = null } = {}) {
  const queryTokens = tokenize(query);
  const normalizedCategory = category ? String(category).toLowerCase() : null;
  const normalizedTag = tag ? String(tag).toLowerCase() : null;

  const filtered = KB.filter((entry) => {
    if (normalizedCategory && entry.category !== normalizedCategory) return false;
    if (normalizedTag && !(entry.tags || []).some((x) => x.toLowerCase().includes(normalizedTag))) return false;
    return true;
  });

  const ranked = filtered
    .map((entry) => {
      const { score, matchedCount } = scoreEntry(entry, queryTokens);
      return {
        entry,
        score,
        matchedCount,
        confidence: scoreToConfidence(score, matchedCount, queryTokens),
      };
    })
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));

  return { ranked, queryTokens };
}

export function getKbResolution({
  query = "",
  limit = 6,
  category = null,
  tag = null,
  confidenceThreshold = GOFIELDWISE_CONFIG_KB_DEFAULT_CONFIDENCE_THRESHOLD,
} = {}) {
  const { ranked, queryTokens } = rankKnowledgeBase({ query, category, tag });

  if (!queryTokens.length) {
    return {
      confident: true,
      topConfidence: 1,
      items: ranked.slice(0, limit),
      clarifyingQuestion: null,
    };
  }

  const top = ranked[0] || null;
  const topConfidence = top ? top.confidence : 0;
  const confident = Boolean(top && top.score > 0 && topConfidence >= confidenceThreshold);

  if (!confident) {
    return {
      confident: false,
      topConfidence,
      items: [],
      clarifyingQuestion: suggestClarifyingQuestion({ query, category, tag }),
    };
  }

  return {
    confident: true,
    topConfidence,
    items: ranked.slice(0, limit),
    clarifyingQuestion: null,
  };
}

export function searchGofieldwiseConfigKb({ query = "", limit = 6, category = null, tag = null } = {}) {
  const { ranked, queryTokens } = rankKnowledgeBase({ query, category, tag });

  if (!queryTokens.length) {
    return ranked.slice(0, limit).map((row) => row.entry);
  }

  const matched = ranked.filter((row) => row.score > 0).map((row) => row.entry);
  return matched.slice(0, limit);
}

export function buildConfigKbContext({ query = "", limit = 5, category = null, tag = null } = {}) {
  const items = searchGofieldwiseConfigKb({ query, limit, category, tag });
  if (!items.length) {
    return `No direct configuration knowledge base matches were found. ${suggestClarifyingQuestion({ query, category, tag })}`;
  }

  return items
    .map((item, index) => {
      return [
        `${index + 1}. ${item.title} [${item.category}]`,
        `How it works: ${item.body}`,
        `Value: ${item.value}`,
        `Best for: ${item.bestFor || "General use"}`,
      ].join("\n");
    })
    .join("\n\n");
}