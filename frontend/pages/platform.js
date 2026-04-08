import { useEffect, useState } from "react";

import {
  createMarketingCampaign,
  runMarketingExpertOperator,
  createLeadFromVoiceTranscript,
  createVoiceTranscription,
  createCoachingSnippet,
  createHelpArticle,
  getAIGuideSettings,
  getCommProfile,
  launchMarketingCampaign,
  listCoachingSnippets,
  listHelpArticles,
  listMarketingCampaigns,
  listMarketingServicePackages,
  listVoiceTranscriptions,
  login,
  runReactivationEngine,
  updateAIGuideSettings,
  updateCommProfile,
} from "../lib/api";

export default function PlatformPage() {
  const [token, setToken] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  const [aiGuide, setAiGuide] = useState({ enabled: false, stage: "onboarding" });
  const [helpArticles, setHelpArticles] = useState([]);
  const [coachingSnippets, setCoachingSnippets] = useState([]);
  const [servicePackages, setServicePackages] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [commProfile, setCommProfile] = useState({ active: false });
  const [voiceTranscripts, setVoiceTranscripts] = useState([]);
  const [voiceFile, setVoiceFile] = useState(null);
  const [voiceForm, setVoiceForm] = useState({
    source: "call_recording",
    caller_phone: "",
    call_id: "",
    language: "",
  });

  const [helpForm, setHelpForm] = useState({ slug: "", title: "", category: "general", context_key: "general", body: "" });
  const [coachForm, setCoachForm] = useState({ title: "", trade: "general", issue_pattern: "", senior_tip: "", checklist: "" });
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    kind: "review_harvester",
    channel: "sms",
    lookback_days: 90,
    template: "",
  });
  const [marketingExpertForm, setMarketingExpertForm] = useState({
    business_name: "",
    website_url: "",
    vertical: "plumbing",
    service_area: "",
    weekly_ad_budget_usd: 500,
    primary_goal: "book_more_jobs",
    current_channels: "google_ads, facebook_ads",
    notes: "",
  });
  const [marketingExpertPlan, setMarketingExpertPlan] = useState(null);

  useEffect(() => {
    const savedToken = window.localStorage.getItem("fdp.dispatch.token") || "";
    const savedEmail = window.localStorage.getItem("fdp.dispatch.email") || "";
    if (savedToken) setToken(savedToken);
    if (savedEmail) setAuthEmail(savedEmail);
  }, []);

  async function withBusy(fn) {
    setBusy(true);
    setError("");
    setResult("");
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function onLogin() {
    await withBusy(async () => {
      const response = await login({ email: authEmail, password: authPassword });
      setToken(response.access_token);
      window.localStorage.setItem("fdp.dispatch.token", response.access_token);
      window.localStorage.setItem("fdp.dispatch.email", authEmail);
    });
  }

  async function refreshAll() {
    await withBusy(async () => {
      const [guide, help, coach, packs, comm, campaignRows, voiceRows] = await Promise.all([
        getAIGuideSettings({ token }),
        listHelpArticles({ token }),
        listCoachingSnippets({ token }),
        listMarketingServicePackages({ token }),
        getCommProfile({ token }),
        listMarketingCampaigns({ token }),
        listVoiceTranscriptions({ token, limit: 20 }),
      ]);
      setAiGuide(guide);
      setHelpArticles(Array.isArray(help) ? help : []);
      setCoachingSnippets(Array.isArray(coach) ? coach : []);
      setServicePackages(Array.isArray(packs) ? packs : []);
      setCommProfile(comm || { active: false });
      setCampaigns(Array.isArray(campaignRows) ? campaignRows : []);
      setVoiceTranscripts(Array.isArray(voiceRows) ? voiceRows : []);
    });
  }

  async function uploadVoiceTranscript() {
    if (!voiceFile) {
      setError("Select an audio file first.");
      return;
    }

    await withBusy(async () => {
      const created = await createVoiceTranscription({
        token,
        audioFile: voiceFile,
        source: voiceForm.source,
        callerPhone: voiceForm.caller_phone || undefined,
        callId: voiceForm.call_id || undefined,
        language: voiceForm.language || undefined,
      });
      const rows = await listVoiceTranscriptions({ token, limit: 20 });
      setVoiceTranscripts(Array.isArray(rows) ? rows : []);
      setVoiceFile(null);
      setResult(`Voice transcript created #${created.id}.`);
    });
  }

  async function createLeadFromTranscript(transcriptId) {
    await withBusy(async () => {
      const created = await createLeadFromVoiceTranscript({ token, transcriptId });
      setResult(`Lead created from transcript #${transcriptId}: lead #${created.id}.`);
    });
  }

  async function saveAIGuide() {
    await withBusy(async () => {
      const out = await updateAIGuideSettings({ token, enabled: aiGuide.enabled, stage: aiGuide.stage });
      setAiGuide(out);
      setResult("AI Guide settings updated.");
    });
  }

  async function addHelpArticle() {
    await withBusy(async () => {
      await createHelpArticle({ token, payload: helpForm });
      const rows = await listHelpArticles({ token });
      setHelpArticles(Array.isArray(rows) ? rows : []);
      setResult("Help article created.");
    });
  }

  async function addCoachingSnippet() {
    await withBusy(async () => {
      await createCoachingSnippet({ token, payload: coachForm });
      const rows = await listCoachingSnippets({ token });
      setCoachingSnippets(Array.isArray(rows) ? rows : []);
      setResult("Coaching snippet created.");
    });
  }

  async function runReactivation() {
    await withBusy(async () => {
      const run = await runReactivationEngine({ token, lookbackDays: 180, limit: 250, dryRun: false });
      setResult(`Reactivation queued ${run.queued_count} of ${run.candidate_count} candidates.`);
    });
  }

  async function addCampaign() {
    await withBusy(async () => {
      const created = await createMarketingCampaign({ token, payload: campaignForm });
      setCampaigns((current) => [created, ...(Array.isArray(current) ? current : [])]);
      setResult(`Campaign created: ${created.name}`);
      setCampaignForm((prev) => ({ ...prev, name: "", template: "" }));
    });
  }

  async function launchCampaign(campaignId) {
    await withBusy(async () => {
      const out = await launchMarketingCampaign({ token, campaignId });
      setCampaigns((current) => (Array.isArray(current)
        ? current.map((item) => (item.id === campaignId ? { ...item, status: "launched" } : item))
        : current));
      setResult(`Campaign launched with ${out.generated_recipients} queued recipients.`);
    });
  }

  async function saveCommProfile() {
    await withBusy(async () => {
      const out = await updateCommProfile({ token, payload: commProfile });
      setCommProfile(out);
      setResult("Communication profile saved.");
    });
  }

  async function generateMarketingExpertPlan() {
    if (!marketingExpertForm.business_name || !marketingExpertForm.service_area) {
      setError("Business name and service area are required.");
      return;
    }

    const channels = marketingExpertForm.current_channels
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    await withBusy(async () => {
      const out = await runMarketingExpertOperator({
        token,
        payload: {
          business_name: marketingExpertForm.business_name,
          website_url: marketingExpertForm.website_url || null,
          vertical: marketingExpertForm.vertical,
          service_area: marketingExpertForm.service_area,
          weekly_ad_budget_usd: Number(marketingExpertForm.weekly_ad_budget_usd),
          primary_goal: marketingExpertForm.primary_goal,
          current_channels: channels,
          notes: marketingExpertForm.notes || null,
        },
      });
      setMarketingExpertPlan(out);
      setResult("AI Marketing Expert plan generated.");
    });
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Platform Control</p>
        <h1>AI Guide, Contextual Help, Coaching, And Messaging Profiles</h1>
        <p>Use this page to operate the new platform systems without touching the database.</p>
        <div className="hero-actions">
          <a className="ghost-link" href="/">Marketing Site</a>
          <a className="ghost-link" href="/leads">Lead Inbox</a>
          <a className="ghost-link" href="/growth">Growth Infrastructure</a>
          <button type="button" onClick={refreshAll} disabled={!token || busy}>Refresh Platform Data</button>
        </div>
      </section>

      <section className="dispatch-card">
        <header className="dispatch-head">
          <h2>Operator Access</h2>
        </header>
        <div className="form-grid">
          <label>
            Email
            <input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} />
          </label>
        </div>
        <div className="actions">
          <button type="button" onClick={onLogin} disabled={busy}>Login</button>
        </div>
        {error ? <p className="submit-error">{error}</p> : null}
        {result ? <p className="submit-note">{result}</p> : null}
      </section>

      <section className="dispatch-card">
        <h2>AI Guide</h2>
        <div className="form-grid">
          <label>
            Enabled
            <select value={aiGuide.enabled ? "yes" : "no"} onChange={(e) => setAiGuide((prev) => ({ ...prev, enabled: e.target.value === "yes" }))}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label>
            Stage
            <input value={aiGuide.stage || "onboarding"} onChange={(e) => setAiGuide((prev) => ({ ...prev, stage: e.target.value }))} />
          </label>
        </div>
        <div className="actions">
          <button type="button" onClick={saveAIGuide} disabled={!token || busy}>Save AI Guide</button>
        </div>
      </section>

      <section className="dispatch-card">
        <h2>Communication Tenant Profile</h2>
        <div className="form-grid">
          <label>
            Active
            <select value={commProfile.active ? "yes" : "no"} onChange={(e) => setCommProfile((p) => ({ ...p, active: e.target.value === "yes" }))}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label>
            Twilio Account SID
            <input value={commProfile.twilio_account_sid || ""} onChange={(e) => setCommProfile((p) => ({ ...p, twilio_account_sid: e.target.value }))} />
          </label>
          <label>
            Twilio Auth Token
            <input type="password" value={commProfile.twilio_auth_token || ""} onChange={(e) => setCommProfile((p) => ({ ...p, twilio_auth_token: e.target.value }))} />
          </label>
          <label>
            Messaging Service SID
            <input value={commProfile.twilio_messaging_service_sid || ""} onChange={(e) => setCommProfile((p) => ({ ...p, twilio_messaging_service_sid: e.target.value }))} />
          </label>
          <label>
            Twilio Phone
            <input value={commProfile.twilio_phone_number || ""} onChange={(e) => setCommProfile((p) => ({ ...p, twilio_phone_number: e.target.value }))} />
          </label>
          <label>
            Retell Agent ID
            <input value={commProfile.retell_agent_id || ""} onChange={(e) => setCommProfile((p) => ({ ...p, retell_agent_id: e.target.value }))} />
          </label>
          <label>
            Retell Phone
            <input value={commProfile.retell_phone_number || ""} onChange={(e) => setCommProfile((p) => ({ ...p, retell_phone_number: e.target.value }))} />
          </label>
        </div>
        <div className="actions">
          <button type="button" onClick={saveCommProfile} disabled={!token || busy}>Save Communication Profile</button>
        </div>
      </section>

      <section className="dispatch-card">
        <h2>Voice Transcription Intake</h2>
        <div className="form-grid">
          <label>
            Source
            <select value={voiceForm.source} onChange={(e) => setVoiceForm((p) => ({ ...p, source: e.target.value }))}>
              <option value="call_recording">call_recording</option>
              <option value="voicemail">voicemail</option>
              <option value="customer_upload">customer_upload</option>
            </select>
          </label>
          <label>
            Caller Phone
            <input value={voiceForm.caller_phone} onChange={(e) => setVoiceForm((p) => ({ ...p, caller_phone: e.target.value }))} placeholder="555-111-2222" />
          </label>
          <label>
            Call ID
            <input value={voiceForm.call_id} onChange={(e) => setVoiceForm((p) => ({ ...p, call_id: e.target.value }))} placeholder="CALL-123" />
          </label>
          <label>
            Language (optional)
            <input value={voiceForm.language} onChange={(e) => setVoiceForm((p) => ({ ...p, language: e.target.value }))} placeholder="en" />
          </label>
          <label className="span-2">
            Audio File
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                setVoiceFile(file);
              }}
            />
          </label>
        </div>
        <div className="actions">
          <button type="button" onClick={uploadVoiceTranscript} disabled={!token || busy || !voiceFile}>
            Upload + Transcribe
          </button>
        </div>
        <div className="results-grid">
          {(voiceTranscripts || []).slice(0, 5).map((item) => (
            <article className="panel" key={item.id}>
              <h3>Transcript #{item.id}</h3>
              <p><strong>Source:</strong> {item.source}</p>
              <p><strong>Model:</strong> {item.transcription_model}</p>
              <p><strong>Caller:</strong> {item.caller_phone || "unknown"}</p>
              <p><strong>Urgency:</strong> {item.extracted?.urgency || "unknown"}</p>
              <p><strong>Service:</strong> {item.extracted?.service_type || "unknown"}</p>
              <p>{item.transcript_text}</p>
              <div className="actions">
                <button
                  type="button"
                  onClick={() => createLeadFromTranscript(item.id)}
                  disabled={!token || busy}
                >
                  Create Lead From Transcript
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dispatch-card">
        <h2>Contextual Help</h2>
        <div className="form-grid">
          <label>Slug<input value={helpForm.slug} onChange={(e) => setHelpForm((p) => ({ ...p, slug: e.target.value }))} /></label>
          <label>Title<input value={helpForm.title} onChange={(e) => setHelpForm((p) => ({ ...p, title: e.target.value }))} /></label>
          <label>Category<input value={helpForm.category} onChange={(e) => setHelpForm((p) => ({ ...p, category: e.target.value }))} /></label>
          <label>Context Key<input value={helpForm.context_key} onChange={(e) => setHelpForm((p) => ({ ...p, context_key: e.target.value }))} /></label>
          <label className="span-2">Body<textarea rows={3} value={helpForm.body} onChange={(e) => setHelpForm((p) => ({ ...p, body: e.target.value }))} /></label>
        </div>
        <div className="actions">
          <button type="button" onClick={addHelpArticle} disabled={!token || busy}>Create Help Article</button>
        </div>
        <ul>
          {helpArticles.slice(0, 5).map((item) => <li key={item.id}>{item.title} ({item.context_key})</li>)}
        </ul>
      </section>

      <section className="dispatch-card">
        <h2>Tribal Coaching</h2>
        <div className="form-grid">
          <label>Title<input value={coachForm.title} onChange={(e) => setCoachForm((p) => ({ ...p, title: e.target.value }))} /></label>
          <label>Trade<input value={coachForm.trade} onChange={(e) => setCoachForm((p) => ({ ...p, trade: e.target.value }))} /></label>
          <label>Issue Pattern<input value={coachForm.issue_pattern} onChange={(e) => setCoachForm((p) => ({ ...p, issue_pattern: e.target.value }))} /></label>
          <label className="span-2">Senior Tip<textarea rows={3} value={coachForm.senior_tip} onChange={(e) => setCoachForm((p) => ({ ...p, senior_tip: e.target.value }))} /></label>
          <label className="span-2">Checklist<textarea rows={2} value={coachForm.checklist} onChange={(e) => setCoachForm((p) => ({ ...p, checklist: e.target.value }))} /></label>
        </div>
        <div className="actions">
          <button type="button" onClick={addCoachingSnippet} disabled={!token || busy}>Create Coaching Snippet</button>
        </div>
        <ul>
          {coachingSnippets.slice(0, 5).map((item) => <li key={item.id}>{item.trade}: {item.title}</li>)}
        </ul>
      </section>

      <section className="dispatch-card">
        <h2>Growth Packages + Reactivation</h2>
        <div className="actions">
          <button type="button" onClick={runReactivation} disabled={!token || busy}>Run Reactivation Now</button>
        </div>
        <div className="results-grid">
          {servicePackages.map((pkg) => (
            <article className="panel" key={pkg.code}>
              <h3>{pkg.name}</h3>
              <p>${pkg.monthly_price_usd}/mo</p>
              <p>{pkg.summary}</p>
              {Array.isArray(pkg.includes) && pkg.includes.length > 0 ? (
                <ul>
                  {pkg.includes.slice(0, 5).map((line, idx) => (
                    <li key={`${pkg.code}-inc-${idx}`}>{line}</li>
                  ))}
                </ul>
              ) : null}
              {pkg.checkout_url ? (
                <div className="actions">
                  <a className="ghost-link" href={pkg.checkout_url} target="_blank" rel="noreferrer">
                    Buy This Service
                  </a>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="dispatch-card">
        <h2>AI Marketing Expert Operator</h2>
        <div className="form-grid">
          <label>
            Business Name
            <input value={marketingExpertForm.business_name} onChange={(e) => setMarketingExpertForm((p) => ({ ...p, business_name: e.target.value }))} />
          </label>
          <label>
            Website URL
            <input value={marketingExpertForm.website_url} onChange={(e) => setMarketingExpertForm((p) => ({ ...p, website_url: e.target.value }))} placeholder="https://example.com" />
          </label>
          <label>
            Vertical
            <input value={marketingExpertForm.vertical} onChange={(e) => setMarketingExpertForm((p) => ({ ...p, vertical: e.target.value }))} />
          </label>
          <label>
            Service Area
            <input value={marketingExpertForm.service_area} onChange={(e) => setMarketingExpertForm((p) => ({ ...p, service_area: e.target.value }))} placeholder="Phoenix metro" />
          </label>
          <label>
            Weekly Ad Budget (USD)
            <input
              type="number"
              min={1}
              max={50000}
              value={marketingExpertForm.weekly_ad_budget_usd}
              onChange={(e) => setMarketingExpertForm((p) => ({ ...p, weekly_ad_budget_usd: Number(e.target.value) }))}
            />
          </label>
          <label>
            Primary Goal
            <input value={marketingExpertForm.primary_goal} onChange={(e) => setMarketingExpertForm((p) => ({ ...p, primary_goal: e.target.value }))} />
          </label>
          <label className="span-2">
            Current Channels (comma separated)
            <input value={marketingExpertForm.current_channels} onChange={(e) => setMarketingExpertForm((p) => ({ ...p, current_channels: e.target.value }))} placeholder="google_ads, facebook_ads, local_seo" />
          </label>
          <label className="span-2">
            Notes
            <textarea rows={3} value={marketingExpertForm.notes} onChange={(e) => setMarketingExpertForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Seasonality, promos, team capacity, margin goals" />
          </label>
        </div>
        <div className="actions">
          <button type="button" onClick={generateMarketingExpertPlan} disabled={!token || busy || !marketingExpertForm.business_name || !marketingExpertForm.service_area}>
            Generate Growth Plan
          </button>
        </div>

        {marketingExpertPlan ? (
          <div className="results-grid">
            <article className="panel">
              <h3>Strategy Summary</h3>
              <p>{marketingExpertPlan.strategy_summary}</p>
              <p><strong>Positioning:</strong> {marketingExpertPlan.positioning}</p>
            </article>

            <article className="panel">
              <h3>Offer Stack</h3>
              <ul>
                {(marketingExpertPlan.offers || []).map((offer, idx) => (
                  <li key={`offer-${idx}`}>
                    <strong>{offer.title}</strong>: {offer.audience} | {offer.hook} | CTA: {offer.cta}
                  </li>
                ))}
              </ul>
            </article>

            <article className="panel">
              <h3>Channel Plan</h3>
              <ul>
                {(marketingExpertPlan.channel_plan || []).map((item, idx) => (
                  <li key={`channel-${idx}`}>
                    <strong>{item.channel}</strong> (${item.weekly_budget_usd}/wk): {item.objective}
                  </li>
                ))}
              </ul>
            </article>

            <article className="panel">
              <h3>Execution (30 Days)</h3>
              <p><strong>Week 1:</strong> {(marketingExpertPlan.execution?.week_1 || []).join("; ")}</p>
              <p><strong>Week 2:</strong> {(marketingExpertPlan.execution?.week_2 || []).join("; ")}</p>
              <p><strong>Week 3:</strong> {(marketingExpertPlan.execution?.week_3 || []).join("; ")}</p>
              <p><strong>Week 4:</strong> {(marketingExpertPlan.execution?.week_4 || []).join("; ")}</p>
            </article>

            <article className="panel">
              <h3>KPI Targets</h3>
              <ul>
                {(marketingExpertPlan.kpi_targets || []).map((line, idx) => (
                  <li key={`kpi-${idx}`}>{line}</li>
                ))}
              </ul>
            </article>
          </div>
        ) : null}
      </section>

      <section className="dispatch-card">
        <h2>Campaign Orchestrator</h2>
        <div className="form-grid">
          <label>Campaign Name<input value={campaignForm.name} onChange={(e) => setCampaignForm((p) => ({ ...p, name: e.target.value }))} /></label>
          <label>
            Kind
            <select value={campaignForm.kind} onChange={(e) => setCampaignForm((p) => ({ ...p, kind: e.target.value }))}>
              <option value="review_harvester">review_harvester</option>
              <option value="reactivation">reactivation</option>
            </select>
          </label>
          <label>
            Channel
            <select value={campaignForm.channel} onChange={(e) => setCampaignForm((p) => ({ ...p, channel: e.target.value }))}>
              <option value="sms">sms</option>
              <option value="email">email</option>
              <option value="internal">internal</option>
            </select>
          </label>
          <label>
            Lookback Days
            <input type="number" min={7} max={730} value={campaignForm.lookback_days} onChange={(e) => setCampaignForm((p) => ({ ...p, lookback_days: Number(e.target.value) }))} />
          </label>
          <label className="span-2">Template<textarea rows={2} value={campaignForm.template} onChange={(e) => setCampaignForm((p) => ({ ...p, template: e.target.value }))} /></label>
        </div>
        <div className="actions">
          <button type="button" onClick={addCampaign} disabled={!token || busy || !campaignForm.name}>Create Campaign</button>
        </div>
        <div className="metric-table-wrap">
          <table className="metric-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Kind</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Run</th>
              </tr>
            </thead>
            <tbody>
              {(campaigns || []).map((campaign) => (
                <tr key={campaign.id}>
                  <td>{campaign.name}</td>
                  <td>{campaign.kind}</td>
                  <td>{campaign.channel}</td>
                  <td>{campaign.status}</td>
                  <td>
                    <button
                      type="button"
                      aria-label={`Launch ${campaign.name}`}
                      onClick={() => launchCampaign(campaign.id)}
                      disabled={!token || busy || campaign.status !== "draft"}
                    >
                      Launch
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
