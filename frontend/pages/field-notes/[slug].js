import Head from "next/head";
import Link from "next/link";

import { posts, getPostBySlug, formatPostDate } from "../../lib/posts";

export async function getStaticPaths() {
  return {
    paths: posts.map((p) => ({ params: { slug: p.slug } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) return { notFound: true };
  return { props: { post } };
}

export default function FieldNotePost({ post }) {
  const canonical = `https://gofieldwise.com/field-notes/${post.slug}`;
  const paragraphs = post.body.split("\n\n");
  const coverUrl = post.cover ? `https://gofieldwise.com${post.cover}` : null;
  const pageTitle = `${post.title} — Field Notes | GoFieldwise`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={post.summary} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={post.summary} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        {coverUrl && <meta property="og:image" content={coverUrl} />}
        {coverUrl && <meta property="og:image:width" content="1200" />}
        {coverUrl && <meta property="og:image:height" content="630" />}
        {coverUrl && <meta property="og:image:alt" content={post.coverAlt || post.title} />}
        <meta name="twitter:card" content="summary_large_image" />
        {coverUrl && <meta name="twitter:image" content={coverUrl} />}
        {coverUrl && <meta name="twitter:image:alt" content={post.coverAlt || post.title} />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.title,
              description: post.summary,
              datePublished: post.date,
              ...(coverUrl ? { image: coverUrl } : {}),
              author: { "@type": "Organization", name: "GoFieldwise" },
              publisher: { "@type": "Organization", name: "GoFieldwise" },
              url: canonical
            })
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
            <Link href="/field-notes" className="active">Field Notes</Link>
          </div>
        </nav>

        <article className="post">
          <div className="post-meta">
            <span className="tag">{post.category}</span>
            <span className="date">{formatPostDate(post.date)}</span>
          </div>
          <h1>{post.title}</h1>
          {post.cover && (
            <img
              className="cover"
              src={post.cover}
              alt={post.coverAlt || post.title}
              width={1200}
              height={630}
              loading="eager"
            />
          )}
          <p className="summary">{post.summary}</p>

          <div className="body">
            {paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className="cta-block">
            <Link href={post.cta.href} className="hero-cta-primary">
              {post.cta.label} →
            </Link>
            <Link href="/field-notes" className="ghost-link">
              ← See all Field Notes
            </Link>
          </div>
        </article>
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
        .post {
          max-width: 70ch;
          margin: 0 auto;
          padding: 18px;
          border: 1px solid rgba(245, 197, 66, 0.22);
          border-radius: 12px;
          background: rgba(11, 15, 26, 0.55);
        }
        .post-meta {
          display: flex;
          gap: 10px;
          align-items: center;
          font-size: 0.88rem;
          margin-bottom: 8px;
        }
        .post-meta .tag {
          color: #0b0f1a;
          background: linear-gradient(120deg, #f5c542, #ffd671);
          padding: 3px 8px;
          border-radius: 999px;
          font-weight: 700;
        }
        .post-meta .date { color: rgba(248, 250, 252, 0.65); }
        .post h1 {
          color: #f8fafc;
          margin: 4px 0 8px;
          line-height: 1.2;
        }
        .cover {
          display: block;
          width: 100%;
          height: auto;
          aspect-ratio: 1200 / 630;
          border-radius: 12px;
          border: 1px solid rgba(245, 197, 66, 0.22);
          margin: 6px 0 16px;
        }
        .summary {
          color: rgba(248, 250, 252, 0.9);
          font-size: 1.05rem;
          margin: 0 0 16px;
        }
        .body p {
          color: rgba(248, 250, 252, 0.88);
          line-height: 1.65;
          margin: 0 0 12px;
        }
        .cta-block {
          margin-top: 22px;
          padding-top: 16px;
          border-top: 1px solid rgba(245, 197, 66, 0.22);
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
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
