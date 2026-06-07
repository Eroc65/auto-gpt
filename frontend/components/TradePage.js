import Head from "next/head";
import Link from "next/link";

export default function TradePage({
  title, description, canonical, ogTitle,
  breadcrumb, eyebrow, h1, intro,
  bullets, chips, prices, kpis,
  cta, related,
}) {
  return (
    <>
      <Head>
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
        {canonical && <link rel="canonical" href={canonical} />}
        <meta property="og:title" content={ogTitle || title} />
        {canonical && <meta property="og:url" content={canonical} />}
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

        {breadcrumb && (
          <p style={{ fontSize: "0.85rem", color: "rgba(248,250,252,0.55)", margin: "2px 4px 0" }}>
            GoFieldWise › {breadcrumb}
          </p>
        )}

        <section className="hero">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>{h1}</h1>
          <p>{intro}</p>
          <div className="actions">
            <a href={cta.href} className="hero-cta-primary">{cta.label}</a>
            <Link href="/pricing" className="ghost-link">See Pricing</Link>
          </div>
        </section>

        {kpis && (
          <div className="results-grid" style={{ marginBottom: 18 }}>
            {kpis.map((k, i) => (
              <div key={i} className="panel" style={{ textAlign: "center" }}>
                <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "#F5C542", margin: "0 0 4px" }}>{k.stat}</p>
                <p style={{ margin: 0, color: "rgba(248,250,252,0.7)", fontSize: "0.9rem" }}>{k.label}</p>
              </div>
            ))}
          </div>
        )}

        {prices && (
          <div className="results-grid" style={{ marginBottom: 18 }}>
            {prices.map((k, i) => (
              <div key={i} className="panel" style={{ textAlign: "center" }}>
                <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "#F5C542", margin: "0 0 4px" }}>{k.price}</p>
                <p style={{ margin: "0 0 2px", fontWeight: 600 }}>{k.label}</p>
                <p style={{ margin: 0, color: "rgba(248,250,252,0.7)", fontSize: "0.85rem" }}>{k.desc}</p>
              </div>
            ))}
          </div>
        )}

        {bullets && (
          <section className="dispatch-card">
            <h2>{bullets.title}</h2>
            <ul style={{ maxWidth: 720, margin: "0 auto", lineHeight: 2, color: "rgba(248,250,252,0.82)" }}>
              {bullets.items.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </section>
        )}

        {chips && (
          <section className="dispatch-card">
            <h2>Searches we help you win</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {chips.map((c, i) => (
                <span key={i} style={{ background: "rgba(245,197,66,0.10)", border: "1px solid rgba(245,197,66,0.3)", color: "#F5C542", borderRadius: 999, padding: "5px 13px", fontSize: "0.85rem" }}>{c}</span>
              ))}
            </div>
          </section>
        )}

        <section className="dispatch-card final-cta">
          <h2>{cta.title}</h2>
          <p>{cta.text}</p>
          <div className="actions" style={{ justifyContent: "center" }}>
            <a href={cta.href} className="hero-cta-primary">{cta.label}</a>
          </div>
          {cta.sub && <p className="trust-line" style={{ textAlign: "center" }}>{cta.sub}</p>}
        </section>

        {related && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginTop: 8 }}>
            {related.map((r, i) => (
              <Link key={i} href={r.href} style={{ color: "#F5C542", fontWeight: 600, fontSize: "0.95rem" }}>{r.label}</Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
