import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function LeadLaunchPage() {
  const [monthlyLeads, setMonthlyLeads] = useState(80);
  const [missedRate, setMissedRate] = useState(22);
  const [avgJobValue, setAvgJobValue] = useState(450);
  const [closeRate, setCloseRate] = useState(55);

  const roi = useMemo(() => {
    const leadsLost = Math.round(monthlyLeads * (missedRate / 100));
    const recoverableLeads = Math.round(leadsLost * 0.6);
    const additionalJobs = Math.round(recoverableLeads * (closeRate / 100));
    const addedRevenue = additionalJobs * avgJobValue;
    return {
      leadsLost,
      recoverableLeads,
      additionalJobs,
      addedRevenue,
    };
  }, [monthlyLeads, missedRate, avgJobValue, closeRate]);

  const formatUSD = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <>
      <Head>
        <title>GoFieldwise LeadLaunch | Websites + Follow-Up System</title>
        <meta
          name="description"
          content="LeadLaunch gives home service businesses a high-converting website and follow-up system so every lead gets answered and booked faster."
        />
      </Head>

      <main className="page-shell">
        <section className="hero leadlaunch-hero">
          <p className="eyebrow">GoFieldwise LeadLaunch</p>
          <h1>Launch a lead machine in 14 days.</h1>
          <p>
            Built for plumbers, HVAC, electricians, and cleaning teams that need more booked jobs,
            fewer missed calls, and clearer follow-up.
          </p>
          <div className="hero-actions">
            <Link href="/platform" className="hero-cta-primary">Book A Strategy Call</Link>
            <Link href="/dispatch-assistant" className="ghost-link">See Live Demo</Link>
          </div>
          <div className="hero-kpis">
            <article>
              <strong>14 Days</strong>
              <span>to launch</span>
            </article>
            <article>
              <strong>24/7</strong>
              <span>lead capture flow</span>
            </article>
            <article>
              <strong>Flat Rate</strong>
              <span>simple monthly ops</span>
            </article>
          </div>
        </section>

        <section className="dispatch-card">
          <h2>What LeadLaunch Includes</h2>
          <div className="results-grid leadlaunch-grid">
            <article className="panel">
              <h3>Conversion-Focused Website</h3>
              <p>Fast, mobile-first pages with clear service, trust, and booking paths.</p>
            </article>
            <article className="panel">
              <h3>Follow-Up Automation</h3>
              <p>Lead response, reminders, and reactivation sequences that reduce missed revenue.</p>
            </article>
            <article className="panel">
              <h3>Pipeline Visibility</h3>
              <p>Simple KPI snapshots so you can see contact rate, booked jobs, and close movement.</p>
            </article>
          </div>
        </section>

        <section className="dispatch-card">
          <h2>Offer Tiers</h2>
          <div className="offerings">
            <article className="offering-card">
              <h2>Starter</h2>
              <p className="offering-subtitle">For solo owner-operators</p>
              <ul>
                <li>5-page website</li>
                <li>Call and form conversion setup</li>
                <li>Basic follow-up sequence</li>
              </ul>
            </article>
            <article className="offering-card">
              <h2>Growth</h2>
              <p className="offering-subtitle">For teams adding technicians</p>
              <ul>
                <li>Service-area page expansion</li>
                <li>Advanced lead routing and reminders</li>
                <li>Weekly KPI reporting</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="dispatch-card">
          <h2>Estimate Your Monthly Revenue Lift</h2>
          <p>
            Use your own numbers to see what faster response and tighter follow-up could recover.
          </p>
          <div className="roi-grid">
            <div className="panel roi-controls">
              <label>
                Monthly inbound leads
                <input
                  type="number"
                  min="1"
                  value={monthlyLeads}
                  onChange={(e) => setMonthlyLeads(Number(e.target.value || 0))}
                />
              </label>
              <label>
                Current missed lead rate (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={missedRate}
                  onChange={(e) => setMissedRate(Number(e.target.value || 0))}
                />
              </label>
              <label>
                Average job value ($)
                <input
                  type="number"
                  min="50"
                  value={avgJobValue}
                  onChange={(e) => setAvgJobValue(Number(e.target.value || 0))}
                />
              </label>
              <label>
                Close rate on recovered leads (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={closeRate}
                  onChange={(e) => setCloseRate(Number(e.target.value || 0))}
                />
              </label>
            </div>

            <div className="panel roi-results">
              <h3>Projected Impact</h3>
              <ul>
                <li>Leads currently slipping: <strong>{roi.leadsLost}</strong></li>
                <li>Leads potentially recovered: <strong>{roi.recoverableLeads}</strong></li>
                <li>Extra jobs booked: <strong>{roi.additionalJobs}</strong></li>
                <li>Estimated monthly revenue lift: <strong>{formatUSD(roi.addedRevenue)}</strong></li>
              </ul>
              <p>
                Conservative model based on recovering 60% of currently missed leads.
              </p>
            </div>
          </div>
        </section>

        <section className="dispatch-card">
          <h2>LeadLaunch FAQ</h2>
          <div className="faq-grid">
            <article className="panel">
              <h3>How fast can we go live?</h3>
              <p>Most shops launch in 10-14 days once assets and service areas are confirmed.</p>
            </article>
            <article className="panel">
              <h3>Do I need a full office team?</h3>
              <p>No. The workflow is designed for owner-operators and small crews without dedicated office staff.</p>
            </article>
            <article className="panel">
              <h3>Can this work with my current tools?</h3>
              <p>Yes. We can start with lightweight integrations and keep your existing booking and invoicing stack.</p>
            </article>
          </div>
        </section>

        <section className="dispatch-card final-cta">
          <h2>Stop losing jobs to slow follow-up.</h2>
          <p>LeadLaunch helps you answer faster and book more of the work you already paid to generate.</p>
          <div className="actions">
            <Link href="/platform" className="hero-cta-primary">Start LeadLaunch</Link>
            <Link href="/marketing-ai" className="ghost-link">Build Campaign Assets</Link>
          </div>
        </section>
      </main>

      <style jsx>{`
        .leadlaunch-hero {
          position: relative;
          overflow: hidden;
        }

        .leadlaunch-hero::before {
          content: "";
          position: absolute;
          inset: auto -80px -120px auto;
          width: 320px;
          height: 320px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(245, 197, 66, 0.32), rgba(245, 197, 66, 0));
          pointer-events: none;
        }

        .hero-cta-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 11px;
          padding: 11px 14px;
          font-weight: 700;
          color: #0b0f1a;
          background: linear-gradient(120deg, #f5c542, #ffd671);
        }

        .hero-kpis {
          margin-top: 14px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .hero-kpis article {
          border: 1px solid rgba(245, 197, 66, 0.35);
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 10px;
          display: grid;
          gap: 2px;
        }

        .hero-kpis strong {
          font-size: 1.15rem;
          color: #f5c542;
        }

        .hero-kpis span {
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.86);
        }

        .leadlaunch-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .roi-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .roi-controls {
          display: grid;
          gap: 10px;
        }

        .roi-controls label {
          font-weight: 700;
          color: #1d2b3f;
        }

        .roi-results ul {
          margin: 0;
          padding-left: 18px;
          display: grid;
          gap: 8px;
        }

        .roi-results p {
          margin-top: 12px;
          color: #44536a;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .final-cta {
          text-align: center;
        }

        @media (max-width: 860px) {
          .leadlaunch-grid {
            grid-template-columns: 1fr;
          }

          .roi-grid {
            grid-template-columns: 1fr;
          }

          .faq-grid {
            grid-template-columns: 1fr;
          }

          .hero-kpis {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
