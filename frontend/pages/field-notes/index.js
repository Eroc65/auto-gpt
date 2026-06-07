import Head from "next/head";
import Link from "next/link";

import { getAllPosts, formatPostDate } from "../../lib/posts";

export default function FieldNotesIndex() {
  const posts = getAllPosts();

  return (
    <>
      <Head>
        <title>Field Notes — Operator playbooks for home service teams | GoFieldwise</title>
        <meta
          name="description"
          content="Short, practical playbooks for home service operators: speed-to-lead fixes, dispatch process wins, and tool benchmarks from real shops."
        />
        <link rel="canonical" href="https://gofieldwise.com/field-notes" />
        <meta
          property="og:title"
          content="Field Notes — Operator playbooks for home service teams | GoFieldwise"
        />
        <meta
          property="og:description"
          content="Short, practical playbooks for home service operators: speed-to-lead fixes, dispatch process wins, and tool benchmarks from real shops."
        />
        <meta property="og:url" content="https://gofieldwise.com/field-notes" />
        <meta property="og:type" content="website" />
      </Head>

      <main className="page-shell">
        <nav className="top-nav">
          <Link href="/" className="brand">GoFieldwise</Link>
          <div className="nav-links">
            <Link href="/demo">Demo</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/connect">Connect</Link>
            <Link href="/field-notes" className="active">Field Notes</Link>
          </div>
        </nav>

        <section className="hero">
          <p className="eyebrow">Field Notes</p>
          <h1>Operator playbooks from real shops.</h1>
          <p>
            Short, practical updates for home service teams: speed-to-lead fixes, call script
            upgrades, dispatch process wins, and lessons from the field. One update each week.
            No fluff.
          </p>
        </section>

        <section className="posts-grid">
          {posts.map((post) => (
            <article key={post.slug} className="post-card panel">
              {post.cover && (
                <Link href={`/field-notes/${post.slug}`}>
                  <img
                    src={post.cover}
                    alt={post.coverAlt || post.title}
                    width={1200}
                    height={630}
                    loading="lazy"
                    style={{ display: "block", width: "100%", height: "auto", aspectRatio: "1200 / 630", borderRadius: 10, border: "1px solid rgba(245,197,66,0.18)", marginBottom: 12 }}
                  />
                </Link>
              )}
              <div className="post-meta">
                <span className="tag">{post.category}</span>
                <span className="date">{formatPostDate(post.date)}</span>
              </div>
              <h2>
                <Link href={`/field-notes/${post.slug}`}>{post.title}</Link>
              </h2>
              <p>{post.summary}</p>
              <Link href={`/field-notes/${post.slug}`} className="read-more">
                Read more →
              </Link>
            </article>
          ))}
        </section>

        <section className="dispatch-card field-notes">
          <h2>Want one each week?</h2>
          <p>
            One concise update each week with templates you can apply the same day. Subscribe and
            we will send the next one straight to your inbox.
          </p>
          <div className="actions">
            <Link href="/#field-notes" className="hero-cta-primary">Subscribe</Link>
            <Link href="/demo" className="ghost-link">Try Live Demo</Link>
          </div>
        </section>
      </main>

      <style jsx>{`
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
        .top-nav .nav-links :global(a.active),
        .top-nav .nav-links :global(a:hover) {
          color: #f5c542;
        }
        .eyebrow { color: #f5c542; font-weight: 700; letter-spacing: 0.04em; }
        .hero h1 { margin: 6px 0 8px; color: #f8fafc; }
        .hero p { color: rgba(248, 250, 252, 0.86); max-width: 60ch; }
        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 14px;
          margin: 18px 0;
        }
        .post-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px;
          border: 1px solid rgba(245, 197, 66, 0.22);
          border-radius: 12px;
          background: rgba(11, 15, 26, 0.55);
        }
        .post-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
        }
        .post-meta .tag {
          color: #0b0f1a;
          background: linear-gradient(120deg, #f5c542, #ffd671);
          padding: 3px 8px;
          border-radius: 999px;
          font-weight: 700;
        }
        .post-meta .date { color: rgba(248, 250, 252, 0.65); }
        .post-card h2 { margin: 0; font-size: 1.15rem; }
        .post-card h2 :global(a) {
          color: #f8fafc;
          text-decoration: none;
        }
        .post-card h2 :global(a:hover) { color: #f5c542; }
        .post-card p { color: rgba(248, 250, 252, 0.84); margin: 0; }
        .read-more {
          color: #f5c542;
          text-decoration: none;
          font-weight: 700;
          margin-top: auto;
        }
        .read-more:hover { text-decoration: underline; }
        .field-notes { border: 1px solid rgba(245, 197, 66, 0.22); background: rgba(11, 15, 26, 0.55); }
        .field-notes h2 { color: #f8fafc; }
        .field-notes p { color: rgba(248, 250, 252, 0.88); }
        .actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
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
        .ghost-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 11px;
          padding: 11px 14px;
          font-weight: 700;
          color: #f5c542;
          border: 1px solid rgba(245, 197, 66, 0.5);
        }
        @media (max-width: 760px) {
          .top-nav { flex-direction: column; align-items: flex-start; gap: 8px; }
        }
      `}</style>
    </>
  );
}
