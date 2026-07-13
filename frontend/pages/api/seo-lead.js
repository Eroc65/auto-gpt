const RESEND_API_URL = "https://api.resend.com/emails";

function sanitize(value) {
  return String(value || "").trim();
}

function fallbackAnalysis(lead) {
  const type = sanitize(lead.type);
  if (type === "free_rank_checker") {
    return {
      score: 42,
      headline: `Estimated position gap for ${sanitize(lead.keyword) || "your target keyword"}`,
      findings: [
        { level: "critical", text: "Primary keyword placement in page title and H1 is weak or missing." },
        { level: "warning", text: "Local relevance signals are thin (service area pages and location context)." },
        { level: "warning", text: "Internal links are not reinforcing your target keyword cluster." },
        { level: "good", text: "Core page exists and can be improved without a full rebuild." },
      ],
      metrics: [
        { label: "Estimated rank range", value: "Page 2-4" },
        { label: "Fastest win", value: "Title/H1 + service-area expansion" },
      ],
      ctaTitle: "Want a practical page-1 plan?",
      ctaText: "Reply to this email and we will map the top actions for your keyword and market.",
      ctaSubject: "Rank Checker Results - I want page 1",
    };
  }

  if (type === "free_gbp_check") {
    return {
      score: 47,
      headline: "Google Business Profile health snapshot",
      findings: [
        { level: "critical", text: "Profile categories and services are not fully aligned with your trade intent." },
        { level: "warning", text: "Review velocity is below top local competitors." },
        { level: "warning", text: "Profile posting cadence appears inconsistent." },
        { level: "good", text: "Your profile can improve quickly with structured weekly actions." },
      ],
      metrics: [
        { label: "Map visibility status", value: "Needs optimization" },
        { label: "Fastest win", value: "Category + service + post refresh" },
      ],
      ctaTitle: "Want us to optimize this profile?",
      ctaText: "Reply and we will prioritize GBP fixes that directly impact maps visibility.",
      ctaSubject: "GBP Check Results - I want profile optimization",
    };
  }

  if (type === "free_competitor_peek") {
    return {
      score: 44,
      headline: "Competitor gap snapshot",
      findings: [
        { level: "critical", text: "Competitors likely have stronger local entity and citation consistency." },
        { level: "warning", text: "Your service pages and city relevance content are under-expanded." },
        { level: "warning", text: "Authority links and review signals are behind the top results." },
        { level: "good", text: "Gap is recoverable with focused on-page + GBP + local link work." },
      ],
      metrics: [
        { label: "Competitive pressure", value: "Medium" },
        { label: "Fastest win", value: "Service pages + citation cleanup" },
      ],
      ctaTitle: "Want an outrank roadmap?",
      ctaText: "Reply and we will map your first 30 days to close the local ranking gap.",
      ctaSubject: "Competitor Check Results - I want to outrank them",
    };
  }

  return {
    score: 39,
    headline: "SEO health snapshot",
    findings: [
      { level: "critical", text: "Core on-page local SEO signals are weaker than they need to be." },
      { level: "warning", text: "Internal linking and service coverage can be expanded for better rankings." },
      { level: "warning", text: "Local profile and citation consistency should be tightened." },
      { level: "good", text: "Your site has enough foundation to improve with focused execution." },
    ],
    metrics: [
      { label: "Current status", value: "Needs optimization" },
      { label: "Fastest win", value: "Local on-page + GBP alignment" },
    ],
    ctaTitle: "Want us to fix this with you?",
    ctaText: "Reply to this email and we will prioritize the highest-impact fixes first.",
    ctaSubject: "SEO Audit Results - I want help",
  };
}

async function generateAiAnalysis(lead) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY || "";
  if (!apiKey) return fallbackAnalysis(lead);

  const endpoint = process.env.OPENROUTER_API_KEY
    ? "https://openrouter.ai/api/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";

  const model = process.env.OPENROUTER_API_KEY ? (process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini") : (process.env.OPENAI_MODEL || "gpt-4o-mini");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (process.env.OPENROUTER_API_KEY) {
    headers["HTTP-Referer"] = "https://gofieldwise.com";
    headers["X-Title"] = "GoFieldWise SEO Tools";
  }

  const prompt = `You are an SEO analyst. Return strict JSON only with keys: score (0-100), headline, findings (array of 4 objects with level critical|warning|good and text), metrics (array of 2 objects with label and value), ctaTitle, ctaText, ctaSubject. Input lead: ${JSON.stringify(lead)}. Keep findings practical for local service businesses. Email-only follow-up.`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You output strict JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) return fallbackAnalysis(lead);
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    if (!parsed || typeof parsed.score !== "number" || !Array.isArray(parsed.findings)) {
      return fallbackAnalysis(lead);
    }

    return parsed;
  } catch {
    return fallbackAnalysis(lead);
  }
}

async function sendResendEmail(payload) {
  const apiKey = process.env.RESEND_API_KEY || "";
  if (!apiKey) return { ok: false, skipped: true };

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return { ok: response.ok };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const lead = {
    type: sanitize(req.body?.type),
    source: sanitize(req.body?.source),
    createdAt: sanitize(req.body?.createdAt || new Date().toISOString()),
    business_name: sanitize(req.body?.business_name),
    owner_name: sanitize(req.body?.owner_name),
    email: sanitize(req.body?.email),
    phone: sanitize(req.body?.phone),
    trade: sanitize(req.body?.trade),
    city: sanitize(req.body?.city),
    website: sanitize(req.body?.website),
    keyword: sanitize(req.body?.keyword),
  };

  if (!lead.business_name || !lead.email || !lead.phone) {
    return res.status(400).json({ ok: false, error: "business_name, email, and phone are required" });
  }

  const analysis = await generateAiAnalysis(lead);

  const ownerEmailText = [
    `New SEO lead: ${lead.type}`,
    "",
    `Business: ${lead.business_name}`,
    `Owner: ${lead.owner_name || "n/a"}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    `Trade: ${lead.trade || "n/a"}`,
    `City: ${lead.city || "n/a"}`,
    `Website: ${lead.website || "n/a"}`,
    `Keyword: ${lead.keyword || "n/a"}`,
    `Source: ${lead.source || "n/a"}`,
    `Time: ${lead.createdAt}`,
    "",
    "Analysis summary:",
    `Score: ${analysis.score}`,
    `Headline: ${analysis.headline}`,
    ...((analysis.findings || []).map((f) => `- [${f.level}] ${f.text}`)),
  ].join("\n");

  await sendResendEmail({
    from: "GoFieldWise SEO Tools <biz@gofieldwise.com>",
    to: ["biz@gofieldwise.com"],
    subject: `New SEO Lead - ${lead.business_name} (${lead.type || "tool"})`,
    text: ownerEmailText,
  });

  const leadEmailText = [
    `Hi ${lead.owner_name || "there"},`,
    "",
    `Thanks for using our free ${lead.type?.replace(/_/g, " ") || "SEO"} tool for ${lead.business_name}.`,
    "",
    `${analysis.headline}`,
    `Score: ${analysis.score}/100`,
    "",
    "Top findings:",
    ...((analysis.findings || []).map((f) => `- ${f.text}`)),
    "",
    `${analysis.ctaText || "Reply to this email if you want help implementing these fixes."}`,
    "",
    "Email-only follow-up. No calls ever.",
    "",
    "Erick",
    "GoFieldWise Oklahoma SEO",
    "biz@gofieldwise.com",
  ].join("\n");

  await sendResendEmail({
    from: "Erick at GoFieldWise <biz@gofieldwise.com>",
    to: [lead.email],
    subject: `Your SEO report for ${lead.business_name}`,
    text: leadEmailText,
  });

  return res.status(200).json({ ok: true, analysis });
}
