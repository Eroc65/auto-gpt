import Head from 'next/head';
import Link from 'next/link';
export default function WebsiteDesign() {
  return (<>
    <Head>
      <title>Website Design for Contractors Oklahoma | GoFieldWise | From $497</title>
      <meta name="description" content="Professional websites built for HVAC, plumbing, electrical and cleaning companies in Oklahoma. SEO built in from day one. Live in 2 weeks. Starting at $497." />
      <link rel="canonical" href="https://gofieldwise.com/website-design" />
    </Head>
    <main style={{maxWidth:'800px',margin:'0 auto',padding:'60px 24px'}}>
      <nav style={{marginBottom:'24px',fontSize:'14px',color:'#666'}}><Link href="/">GoFieldWise</Link> &rsaquo; Contractor Website Design Oklahoma</nav>
      <h1 style={{fontSize:'2.25rem',fontWeight:'800',lineHeight:1.2,marginBottom:'16px'}}>Contractor Website Design in Oklahoma — Built to Rank on Google From Day One</h1>
      <p style={{fontSize:'1.125rem',lineHeight:1.7,color:'#444',marginBottom:'32px'}}>Most contractor websites look good but do not rank. GoFieldWise builds websites for Oklahoma trades businesses engineered to show up on Google.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'16px',marginBottom:'40px'}}>
        {[{price:'$497',label:'One-time build',desc:'Design, copy, SEO, launch'},{price:'$197/mo',label:'SEO retainer',desc:'Monthly optimization'},{price:'2 weeks',label:'Time to live',desc:'Deposit to live site'}].map((item,i)=>(
          <div key={i} style={{background:'#f9fafb',border:'1px solid #e5e7eb',borderRadius:'10px',padding:'20px',textAlign:'center'}}>
            <p style={{fontSize:'1.75rem',fontWeight:'800',margin:'0 0 4px',color:'#111'}}>{item.price}</p>
            <p style={{fontWeight:'600',margin:'0 0 4px',fontSize:'14px'}}>{item.label}</p>
            <p style={{fontSize:'13px',color:'#666',margin:0}}>{item.desc}</p>
          </div>
        ))}
      </div>
      <div style={{background:'#0f1a2e',borderRadius:'12px',padding:'40px',textAlign:'center',color:'#fff'}}>
        <h2 style={{fontSize:'1.75rem',fontWeight:'800',marginBottom:'12px'}}>Get a free website mockup</h2>
        <p style={{color:'rgba(255,255,255,0.75)',marginBottom:'24px'}}>We build a preview with your business name in 24 hours. No cost, no commitment.</p>
        <a href="mailto:biz@gofieldwise.com?subject=Free Website Mockup Request" style={{display:'inline-block',background:'#FF6B35',color:'#fff',padding:'14px 32px',borderRadius:'8px',fontWeight:'700',textDecoration:'none'}}>Request free mockup &rarr;</a>
      </div>
    </main>
  </>);
}