import Head from "next/head";
import Link from "next/link";

export default function LeadLaunchPage() {
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

        .final-cta {
          text-align: center;
        }

        @media (max-width: 860px) {
          .leadlaunch-grid {
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
