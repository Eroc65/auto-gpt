import Head from "next/head";
import Link from "next/link";

import { trackIntentClick } from "../lib/analytics";

const plans = [
  {
    name: "GoFieldwise Platform",
    price: "$200/mo",
    subtitle: "Unlimited users • Unlimited jobs • Unlimited calls and messages",
    points: [
      "24/7 AI receptionist (calls, SMS, web chat)",
      "Job booking and scheduling",
      "Customer messaging and reminders",
      "Tech and team views",
      "Automations and workflows",
      "Basic reporting and exports",
      "Email and chat support",
    ],
  },
];

export default function PricingPage() {
  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "GoFieldwise Platform",
    description:
      "One simple flat-rate plan for AI front-office operations in home service businesses.",
    brand: {
      "@type": "Brand",
      name: "GoFieldwise",
    },
    offers: {
      "@type": "Offer",
      url: "https://gofieldwise.com/pricing",
      price: "200",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
  const pricingFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is there a contract?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Month-to-month. Cancel anytime.",
        },
      },
      {
        "@type": "Question",
        name: "Do I pay per user?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Unlimited users are included.",
        },
      },
      {
        "@type": "Question",
        name: "Do you replace my existing CRM?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "GoFieldwise can run alongside your current tools or become your main front office system.",
        },
      },
    ],
  };

  return (
    <>
      <Head>
        <title>GoFieldwise Pricing</title>
        <meta
          name="description"
          content="One simple GoFieldwise plan with everything included for AI front-office operations."
        />
        <meta property="og:title" content="GoFieldwise Pricing" />
        <meta
          property="og:description"
          content="One simple GoFieldwise plan with everything included for AI front-office operations."
        />
        <meta property="og:url" content="https://gofieldwise.com/pricing" />
        <meta property="og:image" content="https://gofieldwise.com/images/og/gofieldwise-og-pricing.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://gofieldwise.com/images/og/gofieldwise-og-pricing.webp" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="GoFieldwise pricing social preview" />
        <meta name="twitter:title" content="GoFieldwise Pricing" />
        <meta
          name="twitter:description"
          content="One simple GoFieldwise plan with everything included for AI front-office operations."
        />
        <meta name="twitter:image" content="https://gofieldwise.com/social/pricing-og.svg" />
        <meta name="twitter:image:alt" content="GoFieldwise pricing social preview" />
        <link rel="canonical" href="https://gofieldwise.com/pricing" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingFaqSchema) }}
        />
      </Head>

      <main className="page-shell">
        <section className="hero">
          <p className="eyebrow">GoFieldwise Pricing</p>
          <h1>One simple plan. Everything included.</h1>
          <p>
            No per-lead fees. No per-seat pricing. One flat monthly rate.
          </p>
          <div className="actions">
            <Link
              href="/support"
              className="hero-cta-primary"
              onClick={() => trackIntentClick("start_under_60_minutes", "pricing")}
            >
              Start in Under 60 Minutes
            </Link>
            <Link href="/demo" className="ghost-link" onClick={() => trackIntentClick("see_live_demo_from_pricing", "pricing")}>Try Live Demo</Link>
          </div>
        </section>

        <section className="results-grid">
          {plans.map((plan) => (
            <article key={plan.name} className="panel">
              <h2>{plan.name}</h2>
              <p className="price">{plan.price}</p>
              <p className="subtitle">{plan.subtitle}</p>
              <ul>
                {plan.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="dispatch-card">
          <h2>FAQ</h2>
          <div className="results-grid">
            <article className="panel">
              <h3>Is there a contract?</h3>
              <p>No. Month-to-month. Cancel anytime.</p>
            </article>
            <article className="panel">
              <h3>Do I pay per user?</h3>
              <p>No. Unlimited users are included.</p>
            </article>
            <article className="panel">
              <h3>Do you replace my existing CRM?</h3>
              <p>GoFieldwise can run alongside your current tools or become your main front office system.</p>
            </article>
          </div>
        </section>

        <section className="dispatch-card final-cta">
          <h2>Simple, flat pricing for growing teams.</h2>
          <p>Everything you need to run an AI front office in one plan.</p>
          <div className="actions">
            <Link
              href="/support"
              className="hero-cta-primary"
              onClick={() => trackIntentClick("start_in_under_60_minutes_footer", "pricing")}
            >
              Start in Under 60 Minutes
            </Link>
            <Link
              href="/demo"
              className="ghost-link"
              onClick={() => trackIntentClick("try_live_demo_footer", "pricing")}
            >
              Try the Live Demo
            </Link>
          </div>
        </section>
      </main>

      <style jsx>{`
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

        .price {
          margin: 4px 0 10px;
          font-size: 1.45rem;
          font-weight: 800;
          color: #f5c542;
        }

        .subtitle {
          margin: 0 0 10px;
          color: rgba(255, 255, 255, 0.84);
          font-size: 0.95rem;
        }

        ul {
          margin: 0;
          padding-left: 18px;
          display: grid;
          gap: 8px;
        }

        .final-cta {
          text-align: center;
        }
      `}</style>
    </>
  );
}
