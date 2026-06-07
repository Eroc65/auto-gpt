import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

import { trackIntentClick } from "../lib/analytics";
import { getLatestPosts, formatPostDate } from "../lib/posts";

export default function Home() {
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com";
  const xUrl = process.env.NEXT_PUBLIC_X_URL || "https://x.com";
  const twitterUrl = "https://twitter.com";
  const [email, setEmail] = useState("");
  const [subscribeState, setSubscribeState] = useState({ status: "idle", message: "" });
  const latestPosts = getLatestPosts(3);

  async function handleSubscribe(event) {
    event.preventDefault();
    if (!email.trim()) {
      setSubscribeState({ status: "error", message: "Enter a valid email address." });
      return;
    }

    try {
      setSubscribeState({ status: "loading", message: "Subscribing..." });
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "field-notes-home" }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSubscribeState({
          status: "error",
          message: payload.error || "Subscription failed. Try again.",
        });
        return;
      }

      setSubscribeState({
        status: "success",
        message: payload.message || "You are subscribed to Field Notes.",
      });
      setEmail("");
    } catch (error) {
      setSubscribeState({ status: "error", message: "Network error. Please retry." });
    }
  }

  return (
    <>
      <Head>
        <title>AI Receptionist for HVAC, Plumbing & Home Service Businesses | GoFieldWise</title>
        <meta
          name="description" content="GoFieldWise answers every call, books jobs, and follows up automatically — 24/7. Built for HVAC, plumbing, electrical, roofing, and cleaning businesses. $200/month flat. No contracts."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://gofieldwise.com/" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0B0F1A" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap" />
        <meta property="og:title" content="AI Receptionist for HVAC, Plumbing & Home Service Businesses | GoFieldWise" />
        <meta
          property="og:description"
          content="GoFieldWise answers every call, books jobs, and follows up automatically — 24/7. Built for HVAC, plumbing, electrical, roofing, and cleaning businesses. $200/month flat. No contracts."
        />
        <meta property="og:url" content="https://gofieldwise.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://gofieldwise.com/social/home-og.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "GoFieldWise",
              url: "https://gofieldwise.com",
              description:
                "Local SEO and website design for Oklahoma trades businesses including HVAC, plumbing, electrical, and cleaning companies.",
              telephone: "+18552476985",
              email: "support@gofieldwise.com",
              areaServed: { "@type": "State", name: "Oklahoma" },
              serviceType: ["Local SEO", "Website Design", "Google Business Profile Optimization"],
            }),
          }}
        />
      </Head>

      <main className="page-shell">
        <nav className="top-nav">
          <Link href="/" className="brand">GoFieldwise</Link>
          <div className="nav-links">
            <Link href="/demo">Demo</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/connect">Connect</Link>
            <Link href="/field-notes">Field Notes</Link>
          </div>
        </nav>

        <section className="hero home-hero">
          <p className="eyebrow">AI Front Office for Home Service Businesses</p>
          <h1>Never Lose a Job to a Missed Call Again</h1>
          <p>
            GoFieldWise answers every call, books jobs, and follows up automatically - 24/7. Built
            for HVAC, plumbing, electrical, roofing, and cleaning businesses. $200/month flat. No
            contracts.
          </p>
          <div className="actions">
            <Link href="/demo" className="hero-cta-primary" onClick={() => trackIntentClick("try_live_demo", "home")}>
              Try Live Demo
            </Link>
            <Link href="/pricing" className="ghost-link" onClick={() => trackIntentClick("see_pricing", "home")}>
              See Pricing
            </Link>
          </div>
          <p className="trust-line">Live in under 60 minutes. No contracts. Flat monthly pricing.</p>
          <div className="hero-kpis">
            <article><strong>24/7</strong><span>AI call coverage</span></article>
            <article><strong>&lt; 60 sec</strong><span>Speed-to-lead workflow</span></article>
            <article><strong>$200/mo</strong><span>Flat pricing</span></article>
          </div>
        </section>

        <section className="dispatch-card connect-highlight">
          <h2>GoFieldWise Connect — Keep Your CRM, Add an AI Front Office</h2>
          <p>Already using Jobber, Housecall Pro, QuickBooks, or Google Calendar? GoFieldWise Connect layers AI answering, lead recovery, and automated follow-up on top of your existing tools — no rip-and-replace.</p>
          <div className="results-grid">
            <article className="panel"><h3>Sidecar Mode</h3><p>GoFieldWise answers calls and qualifies leads while your current CRM stays the system of record for jobs and invoices.</p></article>
            <article className="panel"><h3>Hybrid Mode</h3><p>AI call handling and missed-call recovery stack on top of your existing dispatch and invoicing workflow.</p></article>
            <article className="panel"><h3>Full Standalone</h3><p>Replace your front office stack entirely with one AI-powered system from first call to paid invoice.</p></article>
          </div>
          <div className="actions" style={{ marginTop: 14 }}>
            <Link href="/connect" className="hero-cta-primary" onClick={() => trackIntentClick("connect_learn_more", "home")}>See GoFieldWise Connect</Link>
          </div>
        </section>

        <section className="dispatch-card">
          <h2>From First Ring to Paid Invoice - On Autopilot</h2>
          <div className="results-grid">
            <article className="panel"><h3>24/7 AI Receptionist</h3><p>Every inbound call and message gets answered instantly, even after hours.</p></article>
            <article className="panel"><h3>Booking + Dispatch</h3><p>Intake turns into scheduled jobs with technician-ready context in one workflow.</p></article>
            <article className="panel"><h3>Customer Updates</h3><p>Appointment confirmations, on-the-way texts, and follow-ups send automatically.</p></article>
            <article className="panel"><h3>Invoicing + Payments</h3><p>Close jobs, send invoices, collect payments, and export records without admin chaos.</p></article>
          </div>
        </section>

        <section className="dispatch-card">
          <h2>Built for Small Service Teams That Need Speed</h2>
          <p>Ideal for plumbing, HVAC, electrical, roofing, pest control, lawn care, cleaning, and handyman businesses with 1-15 techs.</p>
          <div className="results-grid">
            <article className="panel"><h3>Owner-operators tired of missed calls</h3><p>Replace voicemail and late callbacks with instant response coverage.</p></article>
            <article className="panel"><h3>Teams that need faster booking response</h3><p>Capture job details and dispatch quickly when urgency is high.</p></article>
            <article className="panel"><h3>Shops that want one system instead of five tools</h3><p>Keep call handling, scheduling, messaging, and invoicing in one workflow.</p></article>
          </div>
        </section>

        <section className="pain-band">
          <h2>This Is Costing You Thousands Every Month</h2>
          <p>If any of this sounds familiar, you are not alone, and you do not have to keep running your business this way.</p>
          <div className="results-grid">
            <article className="panel"><h3>Missing Calls While You Are on a Job</h3><p>When you cannot answer, new customers call the next company.</p></article>
            <article className="panel"><h3>Losing Jobs to Whoever Picks Up First</h3><p>Homeowners choose whoever answers first, not whoever is best.</p></article>
            <article className="panel"><h3>Doing Admin Work at Night</h3><p>Invoices, follow-ups, and dispatch updates steal your evenings.</p></article>
            <article className="panel"><h3>Paying for Office Help You Cannot Scale</h3><p>Reception staffing is expensive and still leaves coverage gaps.</p></article>
          </div>
        </section>

        <section className="dispatch-card">
          <h2>How It Works</h2>
          <p>Here is what happens when a customer reaches out, without you lifting a finger.</p>
          <div className="results-grid">
            <article className="panel"><h3>1. Customer Reaches Out</h3><p>Call, text, or form submission is answered instantly.</p></article>
            <article className="panel"><h3>2. AI Qualifies and Books</h3><p>The AI captures details, urgency, and preferred schedule.</p></article>
            <article className="panel"><h3>3. Tech Gets Full Context</h3><p>Your team receives customer, job, and routing details.</p></article>
            <article className="panel"><h3>4. Customer Gets Updates</h3><p>Confirmations and status messages send automatically.</p></article>
            <article className="panel"><h3>5. Invoice and Follow-Up</h3><p>Close out the job, request payment, and trigger follow-ups.</p></article>
          </div>
        </section>

        <section className="dispatch-card">
          <h2>Trusted by Home Service Operators</h2>
          <div className="panel testimonial">
            <p>"We stopped losing jobs to voicemail and late callbacks in the first week."</p>
            <span>Owner, Plumbing Company</span>
          </div>
          <div className="panel testimonial" style={{ marginTop: 10 }}>
            <p>"Dispatch and follow-up became consistent without adding office staff."</p>
            <span>Operations Manager, HVAC Team</span>
          </div>
        </section>

        <section className="dispatch-card">
          <h2>Simple, Flat Pricing</h2>
          <p>One plan for your whole team. No per-seat fees. No per-lead fees.</p>
          <p><strong>$200/month</strong> includes unlimited users, unlimited jobs, unlimited calls/messages, AI receptionist, scheduling, messaging, workflows, and exports.</p>
          <div className="panel" style={{ marginTop: 12 }}>
            <h3>Done-for-You Growth Ops (Optional)</h3>
            <p>Managed ads, landing page optimization, conversion tuning, and reporting delivered inside your GoFieldwise stack.</p>
            <p><strong>$700-$950/mo add-on</strong></p>
          </div>
          <div className="actions">
            <Link href="/pricing" className="hero-cta-primary">Start Subscription</Link>
            <Link href="/demo" className="ghost-link">Try Live Demo</Link>
          </div>
        </section>

        <section className="dispatch-card">
          <h2>Frequently Asked Questions</h2>
          <div className="results-grid">
            <article className="panel"><h3>Is there a contract?</h3><p>No. Month-to-month. Cancel anytime.</p></article>
            <article className="panel"><h3>Do I pay per user?</h3><p>No. Unlimited users are included.</p></article>
            <article className="panel"><h3>Can I keep my current tools?</h3><p>Yes. GoFieldwise can run alongside your existing setup as you transition.</p></article>
            <article className="panel"><h3>What if AI can’t handle a request?</h3><p>Escalation rules route complex issues to your team with full context.</p></article>
          </div>
        </section>

        <section className="dispatch-card field-notes-teaser">
          <div className="teaser-header">
            <h2>Field Notes</h2>
            <Link href="/field-notes" className="see-all">See all →</Link>
          </div>
          <p>Short, practical playbooks for operators. New every week.</p>
          <div className="results-grid teaser-grid">
            {latestPosts.map((post) => (
              <article key={post.slug} className="panel teaser-card">
                <div className="teaser-meta">
                  <span className="tag">{post.category}</span>
                  <span className="date">{formatPostDate(post.date)}</span>
                </div>
                <h3>
                  <Link href={`/field-notes/${post.slug}`}>{post.title}</Link>
                </h3>
                <p>{post.summary}</p>
                <Link href={`/field-notes/${post.slug}`} className="read-more">
                  Read more →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="field-notes" className="dispatch-card field-notes">
          <h2>Subscribe to Field Notes</h2>
          <p>Short, practical playbooks for operators: speed-to-lead fixes, call script upgrades, dispatch process wins, and lessons from the field.</p>
          <div className="results-grid">
            <article className="panel">
              <h3>What you get</h3>
              <p>Action-first updates built for home service teams, not generic marketing fluff.</p>
            </article>
            <article className="panel">
              <h3>Frequency</h3>
              <p>One concise update each week with templates you can apply the same day.</p>
            </article>
          </div>
          <form className="field-notes-form" onSubmit={handleSubscribe}>
            <label htmlFor="field-notes-email">Email address</label>
            <div className="field-notes-input-row">
              <input
                id="field-notes-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
              />
              <button type="submit" disabled={subscribeState.status === "loading"}>
                {subscribeState.status === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
            </div>
            {subscribeState.message ? (
              <p className={`field-notes-message ${subscribeState.status === "success" ? "success" : "error"}`}>
                {subscribeState.message}
              </p>
            ) : null}
          </form>
        </section>

        <section className="dispatch-card final-cta">
          <h2>Ready to Stop Losing Jobs to Missed Calls?</h2>
          <p>Start with the live demo and see how GoFieldwise handles real customer requests from first contact to booked job.</p>
          <div className="actions">
            <Link href="/demo" className="hero-cta-primary">Try Live Demo</Link>
            <Link href="/support" className="ghost-link">Book Setup Call</Link>
          </div>
        </section>

        <section className="landing-social-footer">
          <span>Follow GoFieldwise</span>
          <div className="socials">
            <a href={facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M13.5 9H16V6h-2.5C10.9 6 9 7.9 9 10.5V13H7v3h2v5h3v-5h2.3l.7-3H12v-2.5c0-.8.7-1.5 1.5-1.5z" /></svg>
            </a>
            <a href={xUrl} target="_blank" rel="noreferrer" aria-label="X">
              <svg viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M18.2 3H21l-6.5 7.4L22 21h-6.2l-4.9-6.4L5.3 21H3l7-8L2 3h6.3l4.5 5.9L18.2 3zm-1.1 16h1.7L7.2 4.9H5.4L17.1 19z" /></svg>
            </a>
            <a href={twitterUrl} target="_blank" rel="noreferrer" aria-label="Twitter">
              <svg viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M22 5.9c-.7.3-1.5.5-2.3.6.8-.5 1.4-1.2 1.7-2.2-.8.4-1.7.8-2.6.9A4 4 0 0 0 12 8.5c0 .3 0 .6.1.9-3.3-.2-6.3-1.8-8.2-4.3-.3.6-.5 1.2-.5 1.9 0 1.4.7 2.6 1.8 3.3-.7 0-1.3-.2-1.8-.5 0 1.9 1.3 3.5 3.1 3.8-.3.1-.7.1-1 .1-.2 0-.5 0-.8-.1.5 1.6 2 2.8 3.8 2.8A8 8 0 0 1 3 18.3 11.2 11.2 0 0 0 9.1 20c7.3 0 11.3-6.2 11.3-11.5v-.5c.8-.5 1.4-1.2 1.9-2.1z" /></svg>
            </a>
          </div>
        </section>
      </main>

      <style jsx global>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          margin: 0;
          color: #f8fafc;
          font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          background:
            radial-gradient(1200px 600px at 50% -10%, rgba(245,197,66,0.10), transparent 60%),
            radial-gradient(900px 480px at 88% 8%, rgba(59,130,246,0.06), transparent 55%),
            #0B0F1A;
          background-attachment: fixed;
        }
        h1, h2, h3 { font-family: 'Poppins', 'Inter', sans-serif; line-height: 1.14; letter-spacing: -0.01em; }

        .page-shell { max-width: 1140px; margin: 0 auto; padding: 0 20px 72px; }

        .top-nav { position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px); margin-top: 14px; }

        /* Hero */
        .hero {
          text-align: center;
          padding: 72px 28px 44px;
          margin: 18px 0 22px;
          border-radius: 26px;
          border: 1px solid rgba(245,197,66,0.18);
          background:
            radial-gradient(760px 340px at 50% -5%, rgba(245,197,66,0.13), transparent 70%),
            linear-gradient(180deg, rgba(18,24,38,0.92), rgba(11,15,26,0.55));
        }
        .hero .eyebrow {
          display: inline-block; margin: 0 0 18px;
          text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.76rem; font-weight: 700;
          color: #F5C542; background: rgba(245,197,66,0.10);
          border: 1px solid rgba(245,197,66,0.30); padding: 6px 14px; border-radius: 999px;
        }
        .hero h1 {
          font-size: clamp(2.1rem, 5.2vw, 3.5rem); font-weight: 800; margin: 0 auto 16px; max-width: 17ch;
          background: linear-gradient(180deg, #ffffff, #c8d2e2);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .hero > p { max-width: 60ch; margin: 0 auto 24px; font-size: clamp(1rem, 1.6vw, 1.18rem); color: rgba(248,250,252,0.82); }
        .hero .actions { justify-content: center; }

        /* Buttons */
        .hero-cta-primary { box-shadow: 0 10px 26px rgba(245,197,66,0.24); transition: transform .15s ease, box-shadow .15s ease; }
        .hero-cta-primary:hover { transform: translateY(-1px); box-shadow: 0 14px 32px rgba(245,197,66,0.34); }
        .ghost-link {
          display: inline-flex; align-items: center; justify-content: center; text-decoration: none;
          padding: 11px 18px; border-radius: 11px; font-weight: 700; color: #f8fafc;
          border: 1px solid rgba(248,250,252,0.22); background: rgba(255,255,255,0.03); transition: all .15s ease;
        }
        .ghost-link:hover { border-color: rgba(245,197,66,0.55); color: #F5C542; background: rgba(245,197,66,0.06); }

        /* Section cards */
        .dispatch-card {
          background: linear-gradient(180deg, rgba(18,24,38,0.70), rgba(18,24,38,0.40));
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 40px 30px; margin: 18px 0;
        }
        .dispatch-card > h2 { font-size: clamp(1.55rem, 3vw, 2.15rem); font-weight: 800; margin: 0 0 10px; text-align: center; }
        .dispatch-card > p { text-align: center; max-width: 66ch; margin: 0 auto 24px; color: rgba(248,250,252,0.78); }
        .dispatch-card strong { color: #F5C542; }
        .connect-highlight { border-color: rgba(245,197,66,0.30); background: linear-gradient(180deg, rgba(245,197,66,0.07), rgba(18,24,38,0.40)); }
        .final-cta { text-align: center; border-color: rgba(245,197,66,0.30); background: linear-gradient(180deg, rgba(245,197,66,0.10), rgba(18,24,38,0.5)); }

        /* Card grid */
        .results-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(232px, 1fr)); gap: 16px; }
        .panel {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 22px; transition: transform .18s ease, border-color .18s ease, background .18s ease;
        }
        .panel:hover { transform: translateY(-3px); border-color: rgba(245,197,66,0.38); background: rgba(245,197,66,0.045); }
        .panel h3 { margin: 0 0 8px; font-size: 1.06rem; font-weight: 700; color: #ffffff; }
        .panel p { margin: 0; color: rgba(248,250,252,0.74); font-size: 0.96rem; }
        .testimonial p { font-size: 1.06rem; font-style: italic; color: #ffffff; }
        .testimonial span { display: block; margin-top: 10px; color: #F5C542; font-weight: 700; font-size: 0.9rem; }

        @media (max-width: 760px) {
          .page-shell { padding: 0 14px 56px; }
          .hero { padding: 46px 18px 32px; border-radius: 18px; }
          .dispatch-card { padding: 26px 18px; border-radius: 16px; }
          .results-grid { grid-template-columns: 1fr; }
          .hero .actions, .dispatch-card .actions, .final-cta .actions { flex-direction: column; align-items: stretch; }
          .hero .actions a, .dispatch-card .actions a, .final-cta .actions a { width: 100%; }
        }
      `}</style>

      <style jsx>{`
        .actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
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
        .hero-kpis { margin-top: 14px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
        .hero-kpis article { border: 1px solid rgba(245,197,66,0.35); border-radius: 12px; padding: 10px; display: grid; gap: 2px; }
        .hero-kpis strong { font-size: 1.15rem; color: #f5c542; }
        .hero-kpis span { font-size: 0.88rem; color: rgba(255,255,255,0.86); }
        .trust-line { margin: 8px 0 0; color: rgba(255,255,255,0.86); font-size: 0.93rem; }
        .pain-band {
          background: #111827;
          color: #fff;
          border: 1px solid rgba(245, 197, 66, 0.2);
          border-radius: 12px;
          padding: 16px;
        }
        .pain-band :global(.panel) { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.2); }
        .pain-band h2, .pain-band h3, .pain-band p { color: #fff; }
        .landing-social-footer {
          margin: 6px 0 18px;
          border: 1px solid rgba(245, 197, 66, 0.24);
          border-radius: 12px;
          padding: 12px 14px;
          background: rgba(11, 15, 26, 0.88);
          color: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .socials { display: inline-flex; align-items: center; gap: 8px; }
        .socials a {
          width: 34px; height: 34px; border-radius: 8px; border: 1px solid rgba(245,197,66,0.35);
          display: inline-flex; align-items: center; justify-content: center; color: #f5c542; background: rgba(255,255,255,0.04);
        }
        .socials a:hover { background: rgba(245,197,66,0.12); }
        .socials svg { width: 18px; height: 18px; fill: currentColor; }
        .field-notes { border: 1px solid rgba(245, 197, 66, 0.22); background: rgba(11, 15, 26, 0.55); }
        .field-notes h2, .field-notes h3 { color: #f8fafc; }
        .field-notes p { color: rgba(248, 250, 252, 0.88); }
        .field-notes-form { margin-top: 12px; display: grid; gap: 8px; }
        .field-notes-form label { font-weight: 700; color: #f5c542; }
        .field-notes-input-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .field-notes-input-row input {
          flex: 1 1 240px;
          min-height: 42px;
          padding: 0 12px;
          border-radius: 10px;
          border: 1px solid rgba(245, 197, 66, 0.35);
          background: rgba(255, 255, 255, 0.06);
          color: #f8fafc;
        }
        .field-notes-input-row input::placeholder { color: rgba(248, 250, 252, 0.56); }
        .field-notes-input-row button {
          min-height: 42px;
          border: 0;
          border-radius: 10px;
          padding: 0 14px;
          font-weight: 700;
          cursor: pointer;
          color: #0b0f1a;
          background: linear-gradient(120deg, #f5c542, #ffd671);
        }
        .field-notes-input-row button[disabled] { opacity: 0.65; cursor: not-allowed; }
        .field-notes-message { margin: 0; font-size: 0.92rem; }
        .field-notes-message.success { color: #6ee7b7; }
        .field-notes-message.error { color: #fca5a5; }
        .top-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          margin-bottom: 16px;
          border: 1px solid rgba(245, 197, 66, 0.22);
          border-radius: 12px;
          background: rgba(11, 15, 26, 0.55);
        }
        .top-nav .brand {
          font-weight: 800;
          color: #f5c542;
          text-decoration: none;
          font-size: 1.05rem;
        }
        .top-nav .nav-links {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }
        .top-nav .nav-links :global(a) {
          color: rgba(248, 250, 252, 0.88);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
        }
        .top-nav .nav-links :global(a:hover) { color: #f5c542; }
        .field-notes-teaser { border: 1px solid rgba(245, 197, 66, 0.22); background: rgba(11, 15, 26, 0.55); }
        .field-notes-teaser h2, .field-notes-teaser h3 { color: #f8fafc; }
        .field-notes-teaser p { color: rgba(248, 250, 252, 0.88); }
        .teaser-header { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
        .see-all { color: #f5c542; text-decoration: none; font-weight: 700; font-size: 0.95rem; }
        .see-all:hover { text-decoration: underline; }
        .teaser-grid { margin-top: 12px; }
        .teaser-card { display: flex; flex-direction: column; gap: 8px; }
        .teaser-meta { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; }
        .teaser-meta .tag {
          color: #0b0f1a;
          background: linear-gradient(120deg, #f5c542, #ffd671);
          padding: 3px 8px;
          border-radius: 999px;
          font-weight: 700;
        }
        .teaser-meta .date { color: rgba(248, 250, 252, 0.65); }
        .teaser-card h3 { margin: 0; font-size: 1.05rem; }
        .teaser-card h3 :global(a) { color: #f8fafc; text-decoration: none; }
        .teaser-card h3 :global(a:hover) { color: #f5c542; }
        .teaser-card .read-more { color: #f5c542; text-decoration: none; font-weight: 700; margin-top: auto; }
        .teaser-card .read-more:hover { text-decoration: underline; }
        @media (max-width: 760px) {
          .hero-kpis { grid-template-columns: 1fr; }
          .landing-social-footer { flex-direction: column; align-items: flex-start; }
          .field-notes-input-row { flex-direction: column; }
          .field-notes-input-row button { width: 100%; }
          .top-nav { flex-direction: column; align-items: flex-start; gap: 8px; }
        }
      `}</style>
    </>
  );
}
