import Head from 'next/head';
import Link from 'next/link';
export default function HvacSeo() {
  return (<>
    <Head>
      <title>HVAC SEO Services Oklahoma | Rank #1 on Google | GoFieldWise</title>
      <meta name="description" content="GoFieldWise gets Oklahoma HVAC companies to page 1 of Google for AC repair near me — no ad spend. Free audit included." />
      <link rel="canonical" href="https://gofieldwise.com/hvac-seo" />
    </Head>
    <main style={{maxWidth:'800px',margin:'0 auto',padding:'60px 24px'}}>
      <nav style={{marginBottom:'24px',fontSize:'14px',color:'#666'}}><Link href="/">GoFieldWise</Link> &rsaquo; HVAC SEO Oklahoma</nav>
      <h1 style={{fontSize:'2.25rem',fontWeight:'800',lineHeight:1.2,marginBottom:'16px'}}>HVAC SEO Services in Oklahoma — Get More AC Repair Calls From Google</h1>
      <p style={{fontSize:'1.125rem',lineHeight:1.7,color:'#444',marginBottom:'32px'}}>When someone in Tulsa searches &ldquo;AC repair near me&rdquo; your competitors show up on page 1. GoFieldWise fixes that — without running ads.</p>
      <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'40px'}}>
        {['AC repair Tulsa','HVAC service Oklahoma City','furnace repair near me','air conditioning Broken Arrow','emergency AC repair','heat pump Tulsa','HVAC company Edmond'].map((kw,i)=>(
          <span key={i} style={{background:'#f3f4f6',border:'1px solid #d1d5db',borderRadius:'20px',padding:'4px 12px',fontSize:'13px'}}>{kw}</span>
        ))}
      </div>
      <div style={{background:'#0f1a2e',borderRadius:'12px',padding:'40px',textAlign:'center',color:'#fff'}}>
        <h2 style={{fontSize:'1.75rem',fontWeight:'800',marginBottom:'12px'}}>Free HVAC SEO Audit for Oklahoma Companies</h2>
        <p style={{color:'rgba(255,255,255,0.75)',marginBottom:'24px'}}>We check your rankings, Maps listing, and show exactly what is holding you back. No cost. No commitment.</p>
        <a href="mailto:biz@gofieldwise.com?subject=Free HVAC SEO Audit" style={{display:'inline-block',background:'#FF6B35',color:'#fff',padding:'14px 32px',borderRadius:'8px',fontWeight:'700',textDecoration:'none'}}>Get your free audit &rarr;</a>
      </div>
      <div style={{marginTop:'40px',display:'flex',flexWrap:'wrap',gap:'12px'}}>
        {[{label:'Plumbing SEO',href:'/plumbing-seo'},{label:'Electrician SEO',href:'/electrician-seo'},{label:'Cleaning SEO',href:'/cleaning-seo'},{label:'Contractor Websites',href:'/website-design'}]
          .map((l,i)=><Link key={i} href={l.href} style={{color:'#2563eb',textDecoration:'underline',fontSize:'14px'}}>{l.label}</Link>)}
      </div>
    </main>
  </>);
}