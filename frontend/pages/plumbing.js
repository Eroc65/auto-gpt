import Head from 'next/head';

export default function PlumbingPage() {
  return (
    <>
      <Head>
        <title>AI Answering Service for Plumbers | GoFieldWise — $200/mo</title>
        <meta name="description" content="GoFieldWise answers every plumbing call 24/7. Burst pipe? Clogged drain? The AI captures job details and books the appointment before a competitor picks up. $200/month." />
        <link rel="canonical" href="https://gofieldwise.com/plumbing" />
        <meta property="og:title" content="AI Answering Service for Plumbers | GoFieldWise" />
        <meta property="og:url" content="https://gofieldwise.com/plumbing" />
      </Head>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px', fontFamily: 'system-ui, sans-serif' }}>
        <nav style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          <a href="/" style={{ color: '#888' }}>GoFieldWise</a> &rsaquo; Plumbing
        </nav>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', lineHeight: 1.15, marginBottom: '16px', color: '#083344' }}>
          AI Answering Service for Plumbing Companies
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#444', lineHeight: 1.7, marginBottom: '32px' }}>
          Plumbing emergencies don&apos;t wait for business hours. GoFieldWise answers every call instantly,
          day or night — capturing job details and booking appointments while you&apos;re on the job.
        </p>
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
          <p style={{ fontWeight: '700', marginBottom: '12px', color: '#083344' }}>Built for plumbing businesses:</p>
          <ul style={{ paddingLeft: '20px', lineHeight: 2.2, color: '#333' }}>
            <li>Emergency call triage — burst pipes get priority routing instantly</li>
            <li>Captures address, issue type, urgency, and photos via text follow-up</li>
            <li>After-hours coverage without after-hours staffing costs</li>
            <li>Books drain cleaning, water heater, remodel, and inspection calls</li>
            <li>Automated follow-up on estimates that didn&apos;t convert</li>
          </ul>
        </div>
        <div style={{ background: '#083344', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '12px' }}>When a pipe bursts, speed wins the job</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>GoFieldWise answers in under 3 seconds — before the customer calls your competitor.</p>
          <a href="/demo" style={{ display: 'inline-block', background: '#D4A017', color: '#083344', padding: '14px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '15px' }}>
            See it in action →
          </a>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '12px' }}>$200/month flat. No contracts.</p>
        </div>
        <div style={{ marginTop: '40px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {[{l:'HVAC',h:'/hvac'},{l:'Electrical',h:'/electrical'},{l:'Roofing',h:'/roofing'},{l:'Cleaning',h:'/cleaning'},{l:'See Pricing',h:'/pricing'}]
            .map((x,i)=><a key={i} href={x.h} style={{color:'#2563eb',fontSize:'14px',textDecoration:'underline'}}>{x.l}</a>)}
        </div>
      </main>
    </>
  );
}
