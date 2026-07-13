import Link from "next/link";
import { useState } from "react";

const TRADE_OPTIONS = ["HVAC", "Plumbing", "Electrical", "Roofing", "Cleaning", "Landscaping"];

function levelClass(level) {
  if (level === "critical") return "fix-critical";
  if (level === "good") return "fix-good";
  return "fix-warning";
}

function levelIcon(level) {
  if (level === "critical") return "x";
  if (level === "good") return "check";
  return "!";
}

export default function FreeSeoToolPage({
  badge,
  title,
  highlight,
  subhead,
  source,
  toolType,
  canonical,
  submitLabel,
  ctaDefault,
  extraFields = [],
  includeTrade = true,
}) {
  const [form, setForm] = useState({
    website: "",
    keyword: "",
    city: "",
    business_name: "",
    owner_name: "",
    email: "",
    phone: "",
    trade: TRADE_OPTIONS[0],
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function runTool() {
    if (!form.business_name || !form.email || !form.phone) {
      setError("Please fill in business name, email, and phone.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const payload = {
        type: toolType,
        source,
        createdAt: new Date().toISOString(),
        ...form,
      };

      const response = await fetch("/api/seo-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Could not generate your report.");
      }
      setResult(data.analysis || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not run this tool right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="tool-page">
      <nav>
        <div className="logo">
          <div className="logo-mark">G</div>
          <span className="logo-name">GoFieldWise</span>
        </div>
        <Link href="/">Back to home</Link>
      </nav>

      <section className="hero">
        <div className="hero-badge">{badge}</div>
        <h1>
          {title} <span>{highlight}</span>
        </h1>
        <p className="hero-sub">{subhead}</p>
      </section>

      <section className="tool-card">
        <div className="form-grid">
          {extraFields.map((field) => (
            <div key={field.key}>
              <label>{field.label}</label>
              {field.type === "select" ? (
                <select value={form[field.key] || ""} onChange={(event) => update(field.key, event.target.value)}>
                  {(field.options || []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  value={form[field.key] || ""}
                  onChange={(event) => update(field.key, event.target.value)}
                  placeholder={field.placeholder || ""}
                />
              )}
            </div>
          ))}

          <div>
            <label>Business Name</label>
            <input
              value={form.business_name}
              onChange={(event) => update("business_name", event.target.value)}
              placeholder="Smith HVAC"
            />
          </div>

          <div>
            <label>Owner Name</label>
            <input
              value={form.owner_name}
              onChange={(event) => update("owner_name", event.target.value)}
              placeholder="John Smith"
            />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              placeholder="john@smithhvac.com"
            />
          </div>

          <div>
            <label>Phone</label>
            <input
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
              placeholder="(918) 555-0100"
            />
          </div>

          {includeTrade ? (
            <div>
              <label>Trade</label>
              <select value={form.trade} onChange={(event) => update("trade", event.target.value)}>
                {TRADE_OPTIONS.map((trade) => (
                  <option key={trade} value={trade}>
                    {trade}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <button className="btn btn-primary" onClick={runTool} disabled={busy}>
          {busy ? "Generating report..." : submitLabel}
        </button>
        <p className="privacy">No spam. Email-only follow-up. No calls ever.</p>
        {error ? <p className="error">{error}</p> : null}

        {result ? (
          <div className="result-box show">
            <div className={`score-circle ${result.score >= 70 ? "score-good" : result.score >= 45 ? "score-mid" : "score-bad"}`}>
              {result.score}
            </div>
            <h3 style={{ textAlign: "center", marginBottom: 18 }}>{result.headline || "SEO Analysis"}</h3>

            <div>
              {(result.findings || []).map((item, idx) => (
                <div className="fix-item" key={`${item.text}-${idx}`}>
                  <div className={`fix-icon ${levelClass(item.level)}`}>{levelIcon(item.level)}</div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <div className="metrics">
              {(result.metrics || []).map((metric, idx) => (
                <div key={`${metric.label}-${idx}`}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </div>

            <div className="cta-strip">
              <h3>{result.ctaTitle || ctaDefault.title}</h3>
              <p>{result.ctaText || ctaDefault.text}</p>
              <a className="btn-white" href={`mailto:biz@gofieldwise.com?subject=${encodeURIComponent(result.ctaSubject || ctaDefault.subject)}`}>
                Reply to get started
              </a>
            </div>
          </div>
        ) : null}
      </section>

      <footer>
        <p style={{ marginBottom: 6 }}>GoFieldWise Oklahoma SEO · biz@gofieldwise.com</p>
        <p>Serving HVAC, Plumbing, Electrical, Roofing, Cleaning and Landscaping businesses</p>
        <p style={{ marginTop: 10 }}>
          <Link href="/free-seo-audit">Free SEO Audit</Link> · <Link href="/free-rank-checker">Rank Checker</Link> · <Link href="/free-gbp-check">GBP Check</Link> · <Link href="/free-competitor-peek">Competitor Peek</Link>
        </p>
      </footer>

      <style jsx>{`
        * { box-sizing: border-box; }
        .tool-page {
          min-height: 100vh;
          background: #0b0f1a;
          color: #f0f4f8;
          font-family: "Segoe UI", system-ui, sans-serif;
        }
        nav {
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          max-width: 1000px;
          margin: 0 auto;
        }
        nav :global(a) { color: #6b7280; font-size: 13px; text-decoration: none; }
        .logo { display: flex; align-items: center; gap: 10px; }
        .logo-mark {
          width: 34px; height: 34px; border-radius: 8px; background: #ff6b35; color: white;
          display: flex; align-items: center; justify-content: center; font-weight: 800;
        }
        .logo-name { font-size: 16px; font-weight: 700; }
        .hero { max-width: 740px; margin: 0 auto; text-align: center; padding: 50px 24px 34px; }
        .hero-badge {
          display: inline-flex; background: rgba(255, 107, 53, 0.12); border: 1px solid rgba(255, 107, 53, 0.3);
          color: #ff6b35; border-radius: 999px; padding: 6px 14px; font-size: 12px; font-weight: 800; text-transform: uppercase;
        }
        h1 { margin: 16px 0 10px; font-size: clamp(30px, 5vw, 52px); line-height: 1.05; }
        h1 span { color: #ff6b35; }
        .hero-sub { color: #9ca3af; line-height: 1.7; }
        .tool-card {
          max-width: 760px; margin: 0 auto 50px; background: #111827; border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px; padding: 24px;
        }
        .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        label {
          display: block; margin-bottom: 6px; margin-top: 2px; font-size: 12px; color: #9ca3af; font-weight: 700;
          text-transform: uppercase; letter-spacing: .04em;
        }
        input, select {
          width: 100%; padding: 11px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,.08);
          background: #1a2235; color: #f0f4f8; outline: none;
        }
        .btn {
          width: 100%; border: 0; border-radius: 10px; margin-top: 18px; padding: 14px; font-size: 15px; font-weight: 800;
          cursor: pointer;
        }
        .btn-primary { background: #ff6b35; color: white; }
        .btn:disabled { opacity: .6; cursor: not-allowed; }
        .privacy { margin-top: 10px; text-align: center; color: #6b7280; font-size: 11px; }
        .error { margin-top: 8px; color: #ef4444; font-weight: 700; font-size: 13px; }
        .result-box {
          margin-top: 18px; background: #1a2235; border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 18px;
          display: none;
        }
        .result-box.show { display: block; }
        .score-circle {
          width: 86px; height: 86px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px; font-size: 26px; font-weight: 800; border: 3px solid;
        }
        .score-bad { color: #ef4444; border-color: #ef4444; background: rgba(239,68,68,.1); }
        .score-mid { color: #f59e0b; border-color: #f59e0b; background: rgba(245,158,11,.1); }
        .score-good { color: #22c55e; border-color: #22c55e; background: rgba(34,197,94,.1); }
        .fix-item {
          display: flex; gap: 10px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,.08);
          font-size: 14px;
        }
        .fix-item:last-child { border-bottom: 0; }
        .fix-icon {
          width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; flex-shrink: 0;
        }
        .fix-critical { background: rgba(239,68,68,.15); color: #ef4444; }
        .fix-warning { background: rgba(245,158,11,.15); color: #f59e0b; }
        .fix-good { background: rgba(34,197,94,.15); color: #22c55e; }
        .metrics {
          margin-top: 14px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px;
        }
        .metrics div { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 8px; padding: 10px; }
        .metrics span { display: block; font-size: 11px; color: #9ca3af; }
        .metrics strong { display: block; margin-top: 4px; }
        .cta-strip {
          margin-top: 16px; border-radius: 10px; padding: 18px; text-align: center; background: linear-gradient(135deg, #ff6b35, #c94a00);
        }
        .cta-strip h3 { margin: 0 0 6px; }
        .cta-strip p { margin: 0 0 14px; font-size: 13px; color: rgba(255,255,255,.88); }
        .btn-white {
          display: inline-flex; background: white; color: #ff6b35; border-radius: 8px; padding: 10px 18px; text-decoration: none; font-weight: 800;
        }
        footer {
          border-top: 1px solid rgba(255,255,255,.08); margin-top: 40px; text-align: center; padding: 30px 18px; color: #6b7280; font-size: 12px;
        }
        footer :global(a) { color: #ff6b35; text-decoration: none; }
        @media (max-width: 760px) {
          .form-grid, .metrics { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
