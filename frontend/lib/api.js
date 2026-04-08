const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001";

export function getApiBase() {
  return API_BASE;
}

export async function signup({ email, password, organizationName }) {
  return apiFetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      organization_name: organizationName,
    }),
  });
}

export async function login({ email, password }) {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);

  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const detail = payload && payload.detail ? payload.detail : `HTTP ${response.status}`;
    throw new Error(String(detail));
  }

  return payload;
}

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const detail = payload && payload.detail ? payload.detail : `HTTP ${response.status}`;
    throw new Error(String(detail));
  }

  return payload;
}

export async function checkSchedulingConflict({ token, technicianId, scheduledTime, excludeJobId, bufferMinutes }) {
  const query = new URLSearchParams({
    technician_id: String(technicianId),
    scheduled_time: scheduledTime,
  });
  if (excludeJobId != null && excludeJobId !== "") {
    query.set("exclude_job_id", String(excludeJobId));
  }
  if (bufferMinutes != null && bufferMinutes !== "") {
    query.set("buffer_minutes", String(bufferMinutes));
  }

  return apiFetch(`/api/jobs/scheduling/conflict?${query.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getNextSlot({
  token,
  technicianId,
  requestedTime,
  searchHours,
  stepMinutes,
  excludeJobId,
  bufferMinutes,
}) {
  const query = new URLSearchParams({
    technician_id: String(technicianId),
    requested_time: requestedTime,
    search_hours: String(searchHours),
    step_minutes: String(stepMinutes),
  });
  if (excludeJobId != null && excludeJobId !== "") {
    query.set("exclude_job_id", String(excludeJobId));
  }
  if (bufferMinutes != null && bufferMinutes !== "") {
    query.set("buffer_minutes", String(bufferMinutes));
  }

  return apiFetch(`/api/jobs/scheduling/next-slot?${query.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function dispatchJob({ token, jobId, technicianId, scheduledTime }) {
  return apiFetch(`/api/jobs/${jobId}/dispatch`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      technician_id: Number(technicianId),
      scheduled_time: scheduledTime,
    }),
  });
}

export async function markJobOnMyWay({ token, jobId }) {
  return apiFetch(`/api/jobs/${jobId}/on-my-way`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function markJobStarted({ token, jobId }) {
  return apiFetch(`/api/jobs/${jobId}/start`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function completeJob({ token, jobId, completionNotes }) {
  return apiFetch(`/api/jobs/${jobId}/complete`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ completion_notes: completionNotes || null }),
  });
}

export async function getJobTimeline({ token, jobId }) {
  return apiFetch(`/api/jobs/${jobId}/timeline`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function submitPublicLeadIntake({
  intakeKey,
  orgId,
  name,
  phone,
  email,
  service,
  company,
  details,
}) {
  const serviceLine = service ? `Service interest: ${service}` : "";
  const companyLine = company ? `Business: ${company}` : "";
  const detailBlock = details ? `Details: ${details}` : "";
  const rawMessage = [serviceLine, companyLine, detailBlock].filter(Boolean).join("\n");
  const route = intakeKey
    ? `/api/leads/intake/by-key/${encodeURIComponent(intakeKey)}`
    : `/api/leads/intake/${orgId}`;

  return apiFetch(route, {
    method: "POST",
    body: JSON.stringify({
      name: name || null,
      phone: phone || null,
      email: email || null,
      source: "web_form",
      raw_message: rawMessage || null,
    }),
  });
}

export async function listLeads({ token }) {
  return apiFetch("/api/leads", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getCurrentUser({ token }) {
  return apiFetch("/api/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateLeadStatus({ token, leadId, status }) {
  return apiFetch(`/api/leads/${leadId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}

export async function qualifyLead({
  token,
  leadId,
  emergency,
  budgetConfirmed,
  requestedWithin48h,
  serviceCategory,
}) {
  return apiFetch(`/api/leads/${leadId}/qualify`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      emergency: Boolean(emergency),
      budget_confirmed: Boolean(budgetConfirmed),
      requested_within_48h: Boolean(requestedWithin48h),
      service_category: serviceCategory || null,
    }),
  });
}

export async function bookLead({ token, leadId, technicianId, scheduledTime }) {
  return apiFetch(`/api/leads/${leadId}/book`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      technician_id: Number(technicianId),
      scheduled_time: scheduledTime,
    }),
  });
}

export async function getLeadConversionMetrics({ token, days = 7 }) {
  const query = new URLSearchParams({ days: String(days) });
  return apiFetch(`/api/reports/lead-conversion?${query.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getOperationalDashboard({ token }) {
  return apiFetch("/api/reports/operational-dashboard", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getOperatorQueue({ token, limit = 5 }) {
  const query = new URLSearchParams({ limit: String(limit) });
  return apiFetch(`/api/reports/operator-queue?${query.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function acknowledgeOperatorQueueItem({ token, itemType, entityId }) {
  return apiFetch("/api/reports/operator-queue/ack", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      item_type: itemType,
      entity_id: Number(entityId),
    }),
  });
}

export async function unacknowledgeOperatorQueueItem({ token, itemType, entityId }) {
  return apiFetch("/api/reports/operator-queue/unack", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      item_type: itemType,
      entity_id: Number(entityId),
    }),
  });
}

export async function getOperatorQueueHistory({ token, limit = 20 }) {
  const query = new URLSearchParams({ limit: String(limit) });
  return apiFetch(`/api/reports/operator-queue/history?${query.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getLeadActivity({ token, leadId, action, sinceHours }) {
  const query = new URLSearchParams();
  if (action) {
    query.set("action", action);
  }
  if (sinceHours != null && sinceHours !== "") {
    query.set("since_hours", String(sinceHours));
  }
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch(`/api/leads/${leadId}/activity${suffix}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function listOrganizationUsers({ token }) {
  return apiFetch("/api/auth/users", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateUserRole({ token, userId, role }) {
  return apiFetch(`/api/auth/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });
}

export async function getRoleAuditLog({ token, limit = 100, actorUserId, targetUserId, days }) {
  const query = new URLSearchParams({ limit: String(limit) });
  if (actorUserId != null && actorUserId !== "") {
    query.set("actor_user_id", String(actorUserId));
  }
  if (targetUserId != null && targetUserId !== "") {
    query.set("target_user_id", String(targetUserId));
  }
  if (days != null && days !== "") {
    query.set("days", String(days));
  }

  return apiFetch(`/api/auth/users/role-audit?${query.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getRoleAuditExportUrl({ limit = 500, actorUserId, targetUserId, days }) {
  const query = new URLSearchParams({ limit: String(limit) });
  if (actorUserId != null && actorUserId !== "") {
    query.set("actor_user_id", String(actorUserId));
  }
  if (targetUserId != null && targetUserId !== "") {
    query.set("target_user_id", String(targetUserId));
  }
  if (days != null && days !== "") {
    query.set("days", String(days));
  }
  return `${API_BASE}/api/auth/users/role-audit/export.csv?${query.toString()}`;
}

export async function listJobs({ token }) {
  return apiFetch("/api/jobs", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function listTechnicians({ token }) {
  return apiFetch("/api/technicians", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getAIGuideSettings({ token }) {
  return apiFetch("/api/org/ai-guide", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateAIGuideSettings({ token, enabled, stage }) {
  return apiFetch("/api/org/ai-guide", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ enabled: Boolean(enabled), stage }),
  });
}

export async function listHelpArticles({ token, contextKey }) {
  const query = new URLSearchParams();
  if (contextKey) {
    query.set("context_key", contextKey);
  }
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch(`/api/help/articles${suffix}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createHelpArticle({ token, payload }) {
  return apiFetch("/api/help/articles", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function listCoachingSnippets({ token, trade }) {
  const query = new URLSearchParams();
  if (trade) {
    query.set("trade", trade);
  }
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch(`/api/coaching/snippets${suffix}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createCoachingSnippet({ token, payload }) {
  return apiFetch("/api/coaching/snippets", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function listMarketingServicePackages({ token }) {
  return apiFetch("/api/marketing/service-packages", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function listMarketingCampaigns({ token }) {
  return apiFetch("/api/marketing/campaigns", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createMarketingCampaign({ token, payload }) {
  return apiFetch("/api/marketing/campaigns", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function launchMarketingCampaign({ token, campaignId }) {
  return apiFetch(`/api/marketing/campaigns/${campaignId}/launch`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function runReactivationEngine({ token, lookbackDays = 180, limit = 250, dryRun = false }) {
  return apiFetch("/api/marketing/reactivation/run", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ lookback_days: lookbackDays, limit, dry_run: dryRun }),
  });
}

export async function listMarketingImageTemplates({ token }) {
  return apiFetch("/api/marketing/ai-images/templates", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function listMarketingImageChannels({ token }) {
  return apiFetch("/api/marketing/ai-images/channels", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function listMarketingImageTradeTemplates({ token }) {
  return apiFetch("/api/marketing/ai-images/trade-templates", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function listMarketingImageCampaignPacks({ token }) {
  return apiFetch("/api/marketing/ai-images/campaign-packs", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function listMarketingImageCustomPacks({ token }) {
  return apiFetch("/api/marketing/ai-images/custom-packs", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createMarketingImageCustomPack({ token, payload }) {
  return apiFetch("/api/marketing/ai-images/custom-packs", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function updateMarketingImageCustomPack({ token, packId, payload }) {
  return apiFetch(`/api/marketing/ai-images/custom-packs/${packId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function deleteMarketingImageCustomPack({ token, packId }) {
  return apiFetch(`/api/marketing/ai-images/custom-packs/${packId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function generateMarketingImage({
  token,
  prompt,
  size = "1024x1024",
  quality = "high",
  templateCode = "social_promo",
  channelCode = "instagram_feed",
  tradeCode = "general_home_services",
  businessName,
  serviceType,
  offerText,
  ctaText,
  primaryColor,
}) {
  return apiFetch("/api/marketing/ai-images/generate", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      prompt,
      size,
      quality,
      template_code: templateCode,
      channel_code: channelCode,
      trade_code: tradeCode,
      business_name: businessName || null,
      service_type: serviceType || null,
      offer_text: offerText || null,
      cta_text: ctaText || null,
      primary_color: primaryColor || null,
    }),
  });
}

export async function getCommProfile({ token }) {
  return apiFetch("/api/org/comm-profile", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateCommProfile({ token, payload }) {
  return apiFetch("/api/org/comm-profile", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function getPublicStatus() {
  return apiFetch("/api/status", { method: "GET" });
}

export async function listVoiceTranscriptions({ token, limit = 25 }) {
  const query = new URLSearchParams({ limit: String(limit) });
  return apiFetch(`/api/voice/transcriptions?${query.toString()}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createVoiceTranscription({
  token,
  audioFile,
  source = "call_recording",
  callerPhone,
  callId,
  language,
}) {
  const form = new FormData();
  form.append("audio_file", audioFile);
  form.append("source", source || "call_recording");
  if (callerPhone) {
    form.append("caller_phone", callerPhone);
  }
  if (callId) {
    form.append("call_id", callId);
  }
  if (language) {
    form.append("language", language);
  }

  const response = await fetch(`${API_BASE}/api/voice/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const detail = payload && payload.detail ? payload.detail : `HTTP ${response.status}`;
    throw new Error(String(detail));
  }

  return payload;
}

export async function createLeadFromVoiceTranscript({ token, transcriptId }) {
  return apiFetch(`/api/voice/transcriptions/${transcriptId}/create-lead`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function runMarketingExpertOperator({ token, payload }) {
  return apiFetch("/api/marketing/expert/operator", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}
