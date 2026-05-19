import Head from 'next/head';

export default function RoofingPage() {
  return (
    <>
      <Head>
        <title>AI Answering Service for Roofing Companies | GoFieldWise — $200/mo</title>
        <meta name="description" content="GoFieldWise captures every roofing lead — storm damage calls, inspection requests, replacement quotes — 24/7. Never lose a job to voicemail again. $200/month flat." />
        <link rel="canonical" href="https://gofieldwise.com/roofing" />
        <meta property="og:title" content="AI Answering Service for Roofing Companies | GoFieldWise" />
        <meta property="og:url" content="https://gofieldwise.com/roofing" />
      </Head>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px', fontFamily: 'system-ui, sans-serif' }}>
        <nav style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          <a href="/" style={{ color: '#888' }}>GoFieldWise</a> &rsaquo; Roofing
        </nav>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', lineHeight: 1.15, marginBottom: '16px', color: '#1a1c1e' }}>
          AI Answering Service for Roofing Companies
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#444', lineHeight: 1.7, marginBottom: '32px' }}>
          After a storm, every roofing company in your market gets flooded with calls at the same time.
          GoFieldWise answers every single one — capturing lead details while competitors send them to voicemail.
        </p>
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
          <p style={{ fontWeight: '700', marginBottom: '12px' }}>Why roofing companies need GoFieldWise:</p>
          <ul style={{ paddingLeft: '20px', lineHeight: 2.2, color: '#333' }}>
            <li>Storm surge handling — answers dozens of simultaneous calls without missing one</li>
            <li>Captures address, damage description, insurance carrier, and urgency</li>
            <li>Books inspection appointments directly into your team&apos;s schedule</li>
            <li>After-hours coverage for weekend storm calls</li>
            <li>Automated follow-up on inspection no-shows and unsigned estimates</li>
          </ul>
        </div>
        <div style={{ background: '#1a1c1e', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '12px' }}>The next storm is your biggest growth opportunity</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>Only if you answer the call. GoFieldWise makes sure you do.</p>
          <a href="/demo" style={{ display: 'inline-block', background: '#e8570a', color: '#fff', padding: '14px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '15px' }}>
            See how it works →
          </a>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '12px' }}>$200/month flat. No contracts.</p>
        </div>
      </main>
    </>
  );
}
