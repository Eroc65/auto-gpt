import Head from 'next/head';

export default function ElectricalPage() {
  return (
    <>
      <Head>
        <title>AI Answering Service for Electricians | GoFieldWise — $200/mo</title>
        <meta name="description" content="GoFieldWise answers every electrical service call 24/7. Panel upgrades, EV charger installs, emergency repairs — the AI books it while you're on the job." />
        <link rel="canonical" href="https://gofieldwise.com/electrical" />
        <meta property="og:title" content="AI Answering Service for Electricians | GoFieldWise" />
        <meta property="og:url" content="https://gofieldwise.com/electrical" />
      </Head>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px', fontFamily: 'system-ui, sans-serif' }}>
        <nav style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          <a href="/" style={{ color: '#888' }}>GoFieldWise</a> &rsaquo; Electrical
        </nav>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', lineHeight: 1.15, marginBottom: '16px', color: '#111' }}>
          AI Answering Service for Electrical Contractors
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#444', lineHeight: 1.7, marginBottom: '32px' }}>
          Panel upgrades, EV charger installs, whole-home rewiring — these are high-value jobs that start with
          a phone call. GoFieldWise makes sure every one of those calls gets answered and booked.
        </p>
        <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
          <p style={{ fontWeight: '700', marginBottom: '12px', color: '#111' }}>How GoFieldWise handles electrical calls:</p>
          <ul style={{ paddingLeft: '20px', lineHeight: 2.2, color: '#333' }}>
            <li>Answers and qualifies panel upgrades, EV charger, and repair calls instantly</li>
            <li>Captures service address, job type, home age, and timeline</li>
            <li>Routes emergency calls immediately to your on-call tech</li>
            <li>Books estimate appointments directly into your schedule</li>
            <li>Follows up automatically on quotes that went quiet</li>
          </ul>
        </div>
        <div style={{ background: '#111', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '12px' }}>High-value jobs go to whoever answers first</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>A panel upgrade is worth $3,000+. GoFieldWise pays for itself on one job a month.</p>
          <a href="/demo" style={{ display: 'inline-block', background: '#F5C518', color: '#111', padding: '14px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '15px' }}>
            Try the demo →
          </a>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '12px' }}>$200/month. No per-call fees.</p>
        </div>
      </main>
    </>
  );
}
