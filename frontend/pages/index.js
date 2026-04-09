import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [showCallModal, setShowCallModal] = useState(false);

  return (
    <>
      <Head>
        <title>GoFieldwise | From Call to Cash, Automated</title>
        <meta
          name="description"
          content="GoFieldwise runs your field operation from first call to final payment. AI answers calls, books jobs, follows up, and helps you get paid faster."
        />
      </Head>

      <main className="page-shell">
        <section className="hero home-hero">
          <p className="eyebrow">AI-Powered Field Operations</p>
          <h1>Run your field business like a machine.</h1>
          <p>
            GoFieldwise runs your entire field operation from first call to final payment. AI answers calls,
            books jobs, follows up, and helps you get paid faster.
          </p>
          <div className="hero-actions">
            <Link href="/leadlaunch" className="hero-cta-primary">Launch Lead Machine</Link>
            <Link href="/dispatch-assistant" className="ghost-link">See Interactive Demo</Link>
            <button type="button" onClick={() => setShowCallModal(true)}>Call AI Receptionist</button>
          </div>
          <div className="hero-kpis">
            <article>
              <strong>24/7</strong>
              <span>AI call coverage</span>
            </article>
            <article>
              <strong>&lt; 60 sec</strong>
              <span>Speed-to-lead response</span>
            </article>
            <article>
              <strong>$200/mo</strong>
              <span>Flat pricing</span>
            </article>
          </div>
        </section>

        <section className="dispatch-card">
          <h2>What Makes GoFieldwise Different</h2>
          <div className="results-grid">
            <article className="panel">
              <h3>AI Answers Calls</h3>
              <p>Capture every inbound opportunity, even after hours and on weekends.</p>
            </article>
            <article className="panel">
              <h3>AI Books Jobs</h3>
              <p>Route the right job to the right technician with less scheduling chaos.</p>
            </article>
            <article className="panel">
              <h3>AI Follows Up + Gets You Paid</h3>
              <p>Automate reminders, reactivation, invoice nudges, and payment collection.</p>
            </article>
          </div>
        </section>

        <section className="dispatch-card">
          <h2>LeadLaunch For Home Service Teams</h2>
          <p>
            Need a focused website and follow-up engine first? LeadLaunch is the fastest path to more booked jobs
            without adding office overhead.
          </p>
          <div className="actions">
            <Link href="/leadlaunch" className="hero-cta-primary">See LeadLaunch Plans</Link>
            <Link href="/marketing-ai" className="ghost-link">Generate Outreach Assets</Link>
          </div>
        </section>

        <section className="dispatch-card">
          <h2>From Call to Cash, Automated</h2>
          <div className="metric-table-wrap">
            <table className="metric-table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>What Happens</th>
                  <th>Outcome</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1. Call Intake</td>
                  <td>AI answers instantly and captures job details.</td>
                  <td>No missed opportunities.</td>
                </tr>
                <tr>
                  <td>2. Job Booking</td>
                  <td>AI confirms service type, urgency, and schedules slot.</td>
                  <td>More jobs booked.</td>
                </tr>
                <tr>
                  <td>3. Dispatch + Work</td>
                  <td>Tech receives clear details and timeline updates.</td>
                  <td>Cleaner operations.</td>
                </tr>
                <tr>
                  <td>4. Invoice + Follow-Up</td>
                  <td>Invoice sent, payment nudges triggered, review request queued.</td>
                  <td>Faster cash collection and more reviews.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="dispatch-card">
          <h2>Built for Your Trade</h2>
          <div className="service-jump">
            <Link href="/plumbing">Plumbing</Link>
            <Link href="/hvac">HVAC</Link>
            <Link href="/electrical">Electrical</Link>
            <Link href="/landscaping">Landscaping</Link>
            <Link href="/cleaning-services">Cleaning Services</Link>
          </div>
        </section>

        <section className="dispatch-card final-cta">
          <h2>More jobs. Less chaos.</h2>
          <p>GoFieldwise.</p>
          <div className="actions">
            <Link href="/platform" className="hero-cta-primary">Launch Platform</Link>
            <Link href="/marketing-ai" className="ghost-link">Generate Campaign Assets</Link>
          </div>
        </section>
      </main>

      {showCallModal ? (
        <div className="demo-modal">
          <div className="modal-content">
            <h3>Call the AI Receptionist</h3>
            <p>
              Dial <strong>(602) 932-0967</strong> to hear how GoFieldwise answers, qualifies, and books jobs.
            </p>
            <div className="actions">
              <button type="button" onClick={() => setShowCallModal(false)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .home-hero {
          position: relative;
          overflow: hidden;
        }

        .home-hero::after {
          content: "";
          position: absolute;
          right: -80px;
          top: -80px;
          width: 220px;
          height: 220px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(245, 197, 66, 0.35), rgba(245, 197, 66, 0));
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

        .final-cta {
          text-align: center;
        }

        .demo-modal {
          position: fixed;
          inset: 0;
          background: rgba(11, 15, 26, 0.76);
          display: grid;
          place-items: center;
          z-index: 200;
          padding: 16px;
        }

        .modal-content {
          width: min(520px, 100%);
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #d5dbea;
          padding: 18px;
        }

        .modal-content h3 {
          margin: 0 0 6px;
        }

        .modal-content p {
          margin: 0;
          color: #2a3345;
        }

        @media (max-width: 760px) {
          .hero-kpis {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
