import Link from "next/link";

export default function SiteNav() {
  return (
    <header className="site-nav">
      <div className="site-nav-inner">
        <Link href="/" className="brand">GoFieldwise</Link>
        <nav className="links" aria-label="Primary">
          <Link href="/leadlaunch">LeadLaunch</Link>
          <Link href="/plumbing">Plumbing</Link>
          <Link href="/hvac">HVAC</Link>
          <Link href="/electrical">Electrical</Link>
          <Link href="/landscaping">Landscaping</Link>
          <Link href="/cleaning-services">Cleaning</Link>
          <Link href="/marketing-ai">Marketing AI</Link>
          <Link href="/platform">Platform</Link>
          <Link href="/dispatch-assistant" className="trial-link">Live Demo</Link>
        </nav>
      </div>
      <style jsx>{`
        .site-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(11, 15, 26, 0.95);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(245, 197, 66, 0.25);
        }
        .site-nav-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .brand {
          color: #f5c542;
          font-weight: 800;
          letter-spacing: 0.02em;
          text-decoration: none;
          white-space: nowrap;
        }
        .links {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .links :global(a) {
          color: #e5e7eb;
          text-decoration: none;
          font-size: 0.92rem;
          font-weight: 600;
        }
        .links :global(a:hover) {
          color: #f5c542;
        }
        .links :global(.trial-link) {
          border: 1px solid #d4a017;
          border-radius: 999px;
          padding: 6px 10px;
          color: #0b0f1a;
          background: #f5c542;
        }
        .links :global(.trial-link:hover) {
          color: #0b0f1a;
          background: #ffd671;
        }
        @media (max-width: 840px) {
          .site-nav-inner {
            flex-direction: column;
            align-items: flex-start;
          }
          .links {
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>
    </header>
  );
}
