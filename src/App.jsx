import { useState, useEffect } from "react";

const FROM_EMAIL = "biz@gofieldwise.com";
const TRADES = ["HVAC","Plumbing","Electrical","Cleaning","Roofing","Landscaping","Local SEO Services"];
const OK_CITIES = ["Tulsa","Oklahoma City","Broken Arrow","Norman","Edmond","Lawton","Moore","Midwest City","Enid","Stillwater","Owasso","Bixby","Yukon","Jenks","Sapulpa"];
const PACKAGES = [
  { id:"starter",   name:"Starter Site",    price:497, monthly:197, desc:"New website + local SEO" },
  { id:"dominator", name:"Local Dominator", price:0,   monthly:397, desc:"SEO for existing site" },
  { id:"leader",    name:"Market Leader",   price:0,   monthly:697, desc:"Full SEO + content + links" },
];

// Best primary keyword per trade — city gets appended automatically
const TRADE_KEYWORDS = {
  "HVAC":                "HVAC repair near me",
  "Plumbing":            "emergency plumber near me",
  "Electrical":          "electrician near me",
  "Cleaning":            "house cleaning service near me",
  "Roofing":             "roofing company near me",
  "Landscaping":         "landscaping company near me",
  "Local SEO Services":  "local SEO services Oklahoma",
};
const TABS = [
  { id:"gsc",       label:"GSC Dashboard",     icon:"ti-chart-line", step:null, desc:"Monthly maintenance hub for all active clients. Track indexing health, keyword rankings, and auto-generate maintenance reports for every site you manage." },
  { id:"portfolio", label:"Website Portfolio", icon:"ti-browser",    step:null, desc:"Show clients what their new website will look like. Switch between HVAC, Plumbing, Electrical & Cleaning mockups. Use this during your sales pitch." },
  { id:"finder",    label:"Smart Finder",      icon:"ti-radar",      step:1,    desc:"STEP 1 — Find businesses that need your help. Searches Google Maps, Yelp, Facebook & Angi for small local trades businesses with no website or weak SEO." },
  { id:"indexing",  label:"Index Health",      icon:"ti-shield-check",step:null, desc:"Audit any client's website to find how many pages Google can't see. Use this as a free audit to show prospects what's wrong — great sales tool." },
  { id:"seowork",   label:"SEO Delivery",      icon:"ti-rocket",     step:null, desc:"Auto-generate a complete SEO plan for any client URL — keyword strategy, optimized title tags, meta descriptions, H1s, and a 90-day content calendar. One click." },
  { id:"creative",  label:"Creative Studio",   icon:"ti-palette",    step:null, desc:"Generate AI image prompts for client websites, Google Business Profile photos, and Facebook ads. Connects to your local Open Generative AI studio." },
  { id:"agent",     label:"AI Sales Agent",    icon:"ti-robot",      step:4,    desc:"STEP 4 — View your sales pipeline. See which prospects are interested, generate AI replies to their emails, and track every lead from cold to closed." },
  { id:"queue",     label:"Email Queue",       icon:"ti-inbox",      step:2,    desc:"STEP 2 — Review and send emails. All outreach emails land here. Review AI-written emails before sending, then export to your local dashboard to send." },
  { id:"campaign",  label:"Campaigns",         icon:"ti-send",       step:null, desc:"Build 4-email nurture sequences for prospects who showed interest. AI writes the whole sequence based on their specific situation and recommended package." },
  { id:"proposal",  label:"Proposals",         icon:"ti-file-text",  step:3,    desc:"STEP 3 — Generate proposals. When a prospect is interested, load their info here and AI writes a full personalized proposal. Add to email queue to send." },
  { id:"onboard",   label:"Onboarding",        icon:"ti-checklist",  step:5,    desc:"STEP 5 — After closing a deal. Track every onboarding task for each client: account access, on-page fixes, GBP setup, citations, and monthly reporting." },
  { id:"invoice",   label:"Invoice",           icon:"ti-receipt",    step:null, desc:"Generate professional invoices for clients. Pick their package, add line items, and copy the invoice to send via email or paste into Google Docs." },
];

function classify(p){
  if(!p.hasWebsite) return {label:"No Website",pkg:"starter",color:"danger"};
  if(["Weak SEO - page 2-3"].includes(p.seoStatus)) return {label:"Weak SEO",pkg:"dominator",color:"warning"};
  if(["Some SEO - page 1 bottom"].includes(p.seoStatus)) return {label:"Needs Optimization",pkg:"leader",color:"warning"};
  return {label:"Competitive",pkg:"leader",color:"success"};
}
function recPkg(p){return PACKAGES.find(x=>x.id===classify(p).pkg);}

const bs=(a)=>({padding:"6px 13px",fontSize:12,cursor:"pointer",borderRadius:"var(--border-radius-md)",fontWeight:a?500:400,background:a?"var(--color-background-info)":"transparent",color:a?"var(--color-text-info)":"var(--color-text-secondary)",border:a?"0.5px solid var(--color-border-info)":"0.5px solid var(--color-border-tertiary)"});
const card={background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",padding:"1rem 1.25rem"};
const lbl={fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:4};
const ib=(t)=>({padding:"10px 14px",background:`var(--color-background-${t})`,border:`0.5px solid var(--color-border-${t})`,borderRadius:"var(--border-radius-md)"});

// ── Tooltip component ─────────────────────────────────────────────
function Tooltip({text,children}){
  const [show,setShow]=useState(false);
  return(
    <div style={{position:"relative",display:"inline-flex"}}
      onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      {children}
      {show&&text&&(
        <div style={{position:"absolute",bottom:"calc(100% + 10px)",left:"50%",transform:"translateX(-50%)",background:"#0f1117",border:"1px solid #4f7ef8",borderRadius:8,padding:"10px 13px",fontSize:11,color:"#e8eaf0",lineHeight:1.6,width:240,zIndex:9999,boxShadow:"0 8px 24px rgba(0,0,0,.6)",pointerEvents:"none",whiteSpace:"normal"}}>
          {text}
          <div style={{position:"absolute",top:"100%",left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"6px solid transparent",borderRight:"6px solid transparent",borderTop:"6px solid #4f7ef8"}}/>
        </div>
      )}
    </div>
  );
}

function Badge({type,children}){return <span style={{fontSize:11,fontWeight:500,padding:"2px 8px",borderRadius:6,background:`var(--color-background-${type})`,color:`var(--color-text-${type})`,whiteSpace:"nowrap"}}>{children}</span>;}
function CopyBtn({text}){const [ok,setOk]=useState(false);return <button onClick={()=>{navigator.clipboard?.writeText(text);setOk(true);setTimeout(()=>setOk(false),1500);}} style={{padding:"8px 12px",fontSize:12,cursor:"pointer",borderRadius:6,border:"0.5px solid var(--color-border-tertiary)",background:ok?"var(--color-background-success)":"transparent",color:ok?"var(--color-text-success)":"var(--color-text-secondary)",minHeight:44}}><i className={`ti ti-${ok?"check":"copy"}`} style={{marginRight:4}} aria-hidden="true"/>{ok?"Copied!":"Copy"}</button>;}

// ── Mobile responsive hook ────────────────────────────────────────
function useIsMobile(){
  const [mobile,setMobile]=useState(()=>typeof window!=="undefined"?window.innerWidth<600:false);
  useEffect(()=>{
    if(typeof window==="undefined")return;
    const handler=()=>setMobile(window.innerWidth<600);
    window.addEventListener("resize",handler);
    return()=>window.removeEventListener("resize",handler);
  },[]);
  return mobile;
}

// ── Responsive grid helper ────────────────────────────────────────
// usage: grid(isMobile, "1fr 1fr", 10) → single col on mobile, 2-col on desktop
const grid=(mobile,cols,gap=10)=>({
  display:"grid",
  gridTemplateColumns:mobile?"1fr":cols,
  gap,
});

// ── Full-width mobile button style ───────────────────────────────
const mbtn=(mobile,extra={})=>({
  width:mobile?"100%":"auto",
  minHeight:44,
  padding:"10px 16px",
  fontSize:13,
  cursor:"pointer",
  borderRadius:"var(--border-radius-md)",
  border:"0.5px solid var(--color-border-secondary)",
  background:"transparent",
  color:"var(--color-text-primary)",
  ...extra,
});

async function callClaude(prompt,useSearch=false,maxTokens=2500){
  const endpoint=import.meta.env.VITE_ANTHROPIC_API_URL||"/api/anthropic/messages";
  const body={model:"claude-sonnet-4-20250514",max_tokens:maxTokens,messages:[{role:"user",content:prompt}]};
  if(useSearch)body.tools=[{type:"web_search_20250305",name:"web_search"}];
  const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(!res.ok){const err=await res.text();throw new Error(`API error ${res.status}: ${err.slice(0,100)}`);}
  const data=await res.json();
  if(data.error)throw new Error(data.error.message||"Claude API error");
  return data.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"";
}

// ── SMART FINDER (Real business search) ──────────────────────────
function SmartFinder({prospects,setProspects,emailQueue,setEmailQueue}){
  const [trade,setTrade]=useState("HVAC");
  const [city,setCity]=useState("Tulsa");
  const [custom,setCustom]=useState("");
  const [loading,setLoading]=useState(false);
  const [phase,setPhase]=useState("");
  const [expanded,setExpanded]=useState(null);
  const [analyzing,setAnalyzing]=useState(null);
  const [genId,setGenId]=useState(null);
  const [deepData,setDeepData]=useState({});
  const target=custom||city;
  const shown=prospects.filter(p=>p.trade===trade&&p.city===target);


  async function find(){
    setLoading(true);
    setPhase(`Searching Google Maps, Yelp, Facebook & Angi for under-served ${trade} businesses in ${target}...`);
    try{
      // Phase 1: Multi-source search targeting weak/invisible businesses
      const searchText = await callClaude(
        `You are a local SEO prospector. Find small independent ${trade} businesses in ${target}, Oklahoma that have weak or no online presence. These businesses NEED SEO help.\n\n` +
        `Run these 5 searches in order:\n\n` +
        `SEARCH 1 — Google Maps (most important):\n` +
        `Search "https://www.google.com/maps/search/${encodeURIComponent(trade)}+${encodeURIComponent(target)}+Oklahoma" or "${trade} near ${target} Oklahoma maps"\n` +
        `On Google Maps, look PAST the top 3 results (the "Local Pack"). Find businesses listed in positions 4-20 on the map. These are the ones NOT showing in the coveted top 3 box. Note which ones have: no website linked, fewer than 20 reviews, photos missing, or incomplete profiles.\n\n` +
        `SEARCH 2 — Yelp directory:\n` +
        `Search "site:yelp.com ${trade} ${target} Oklahoma"\n` +
        `Yelp often lists small operators who have no Google presence. Note any with under 10 Yelp reviews.\n\n` +
        `SEARCH 3 — Google page 2:\n` +
        `Search "${trade} repair ${target} Oklahoma" — look at positions 11-30 (page 2 and 3), not the top results.\n\n` +
        `SEARCH 4 — Facebook:\n` +
        `Search "${trade} ${target} Oklahoma Facebook page" — small operators who only have a Facebook page and no website.\n\n` +
        `SEARCH 5 — Angi/HomeAdvisor:\n` +
        `Search "${trade} ${target} OK site:angi.com" — contractors relying on lead-gen directories instead of their own website.\n\n` +
        `STRICT EXCLUSION RULES — do NOT include:\n` +
        `- National chains or franchises (Service Experts, One Hour, Mr. Rooter, Roto-Rooter, ARS, Trane, Carrier dealers with big web presence)\n` +
        `- Any business with 100+ Google reviews\n` +
        `- Businesses ranking #1, #2, or #3 in Google Maps Local Pack for their main keyword\n` +
        `- Businesses with a well-optimized professional website\n\n` +
        `ONLY return businesses that have at least one of:\n` +
        `- No website linked on Google Maps or anywhere\n` +
        `- Fewer than 30 Google reviews\n` +
        `- Not appearing in the Google Maps top 3 box\n` +
        `- Website that is missing the city name in the title tag\n` +
        `- Incomplete Google Business Profile (no photos, no hours, no description)\n` +
        `- Only a Facebook page, no standalone website\n\n` +
        `Return exactly 5 businesses. Each must be a small independent local operator that GoFieldWise can realistically help.\n\n` +
        `Return a JSON array with 5 objects. Each object has EXACTLY these keys:\n` +
        `name (string), phone (string or null), address (string or null), website (string URL or null), hasWebsite (boolean), facebookUrl (string or null), yelpUrl (string or null), mapsUrl (string), googleReviews (integer), googleRating (number or null), yelpReviews (integer), facebookLikes (integer), hasGBP (boolean), hasFacebook (boolean), hasYelp (boolean), googleRank (integer or null), mapsRank (integer or null), seoStatus (string), weakness (string), mainKeyword (string), estimatedMonthlySearches (integer), city (string), trade (string)\n\n` +
        `Key rules:\n` +
        `- mapsUrl: each business gets their own Maps URL: "https://www.google.com/maps/search/" + encodeURIComponent(businessName + " " + "${target}" + " Oklahoma")\n` +
        `- mapsRank: their position on Google Maps (4-20 for weak, null if not on Maps at all)\n` +
        `- seoStatus: exactly one of: "No website" | "Weak SEO - page 2-3" | "Some SEO - page 1 bottom" | "Strong SEO - top 3"\n` +
        `- weakness: 8 words max, be specific: "No website, Facebook only" / "Only 4 Google reviews" / "Not in Maps top 3" / "No photos on GBP" / "City missing from title tag"\n` +
        `- googleReviews: must be under 100 for every result returned\n` +
        `- googleRank: position 11-30 if on page 2-3, null if unknown\n` +
        `- city: "${target}", trade: "${trade}"\n` +
        `- Use 0 for unknown integer counts, null for unknown strings or numbers\n\n` +
        `Return ONLY the JSON array. Start with [ and end with ]. No markdown, no code fences, no explanation text.`,
        true,
        3500
      );

      // Robust JSON extraction — strip markdown fences if present
      let cleaned = searchText.trim();
      cleaned = cleaned.replace(/```json\s*/gi,"").replace(/```\s*/gi,"").trim();
      const s = cleaned.indexOf("[");
      const e = cleaned.lastIndexOf("]");
      if(s === -1 || e === -1 || e <= s){
        // Phase 2 fallback: simpler prompt
        setPhase("Retrying search for under-served businesses...");
        const fallback = await callClaude(
          `Search Yelp, Angi, and Facebook for small independent ${trade} businesses in ${target}, Oklahoma with weak online presence.\n\n` +
          `I need businesses that: have no website OR fewer than 30 Google reviews OR only appear on page 2-3 of Google. NOT national chains or top-ranked companies.\n\n` +
          `Return exactly 5 businesses as a JSON array. Use this exact structure:\n` +
          `[{"name":"Smith Heating & Air","phone":"(918) 555-0142","address":"456 Oak Ave, ${target}, OK","website":null,"hasWebsite":false,"facebookUrl":"https://facebook.com/smithheatingair","yelpUrl":null,"mapsUrl":"https://www.google.com/maps/search/${encodeURIComponent(trade)}+${encodeURIComponent(target)}+OK","googleReviews":7,"googleRating":4.2,"yelpReviews":0,"facebookLikes":230,"hasGBP":true,"hasFacebook":true,"hasYelp":false,"googleRank":14,"seoStatus":"Weak SEO - page 2-3","weakness":"No website, only Facebook page","mainKeyword":"${trade} ${target}","estimatedMonthlySearches":600,"city":"${target}","trade":"${trade}"}]\n\n` +
          `Fill in real business data. Start with [ end with ]. JSON only.`,
          true,
          3000
        );
        let fc = fallback.trim().replace(/```json\s*/gi,"").replace(/```\s*/gi,"").trim();
        const fs = fc.indexOf("["), fe = fc.lastIndexOf("]");
        if(fs === -1 || fe === -1) throw new Error("Search returned no results. Check your internet connection and try again.");
        fc = fc.slice(fs, fe+1);
        const parsed = JSON.parse(fc);
        if(!Array.isArray(parsed) || parsed.length === 0) throw new Error("No businesses found in search results.");
        const items = parsed.map((p,i)=>({
          ...p,
          id: Date.now()+i,
          emailStatus:"not_sent",
          generatedEmail:null,
          notes:"",
          interested:false,
          priority: !p.hasWebsite?"Hot":p.seoStatus==="Weak SEO - page 2-3"?"Hot":p.seoStatus==="Some SEO - page 1 bottom"?"Warm":"Cold"
        }));
        setProspects(prev=>[...prev.filter(p=>!(p.city===target&&p.trade===trade)),...items]);
        setPhase(`Found ${items.length} ${trade} businesses in ${target}.`);
        setLoading(false);
        return;
      }

      const jsonStr = cleaned.slice(s, e+1);
      const parsed = JSON.parse(jsonStr);
      if(!Array.isArray(parsed) || parsed.length === 0) throw new Error("Search returned an empty list. Try a different city or trade.");

      const items = parsed.map((p,i)=>({
        ...p,
        id: Date.now()+i,
        emailStatus:"not_sent",
        generatedEmail:null,
        notes:"",
        interested:false,
        priority: !p.hasWebsite?"Hot":p.seoStatus==="Weak SEO - page 2-3"?"Hot":p.seoStatus==="Some SEO - page 1 bottom"?"Warm":"Cold"
      }));
      setProspects(prev=>[...prev.filter(p=>!(p.city===target&&p.trade===trade)),...items]);
      setPhase(`Found ${items.length} real ${trade} businesses in ${target}.`);
    }catch(err){
      setPhase(`Error: ${err.message}`);
    }
    setLoading(false);
  }

  async function deepAnalyze(prospect){
    setAnalyzing(prospect.id);setExpanded(prospect.id);
    try{
      const text=await callClaude(
        `Perform a comprehensive local SEO + backlink audit for "${prospect.name}", a ${prospect.trade} company in ${prospect.city}, Oklahoma.\n\n` +
        (prospect.website?`Their website: ${prospect.website}\n`:`They have NO website.\n`) +
        (prospect.facebookUrl?`Facebook: ${prospect.facebookUrl}\n`:`No Facebook page.\n`) +
        (prospect.yelpUrl?`Yelp: ${prospect.yelpUrl}\n`:`Not on Yelp.\n`) +
        `Google reviews: ${prospect.googleReviews||0} (${prospect.googleRating||"no"} star rating)\n\n` +
        `Use web search to research ALL of the following:\n\n` +
        `ON-PAGE AUDIT:\n` +
        (prospect.website
          ? `- Fetch ${prospect.website} and extract the actual title tag, H1, meta description\n- Check if city name appears in title, H1, and body content\n- Estimate page speed (Fast/Medium/Slow) based on site tech\n`
          : `- Note that no website exists and explain the ranking impact\n`) +
        `\nCOMPETITOR RESEARCH:\n` +
        `- Search "${prospect.mainKeyword||prospect.trade+" "+prospect.city}" and identify the top 3 ranking businesses\n` +
        `- For each competitor note their website URL if visible\n` +
        `- Estimate competitor backlink strength (strong = established brand directories, news mentions; weak = few citations)\n\n` +
        `BACKLINK RESEARCH (critical — search for each):\n` +
        (prospect.website
          ? `- Search "site:${prospect.website}" to estimate how many pages are indexed\n` +
            `- Search "${prospect.name} ${prospect.city}" to find any directory listings, mentions, citations that link to them\n` +
            `- Check if they appear on: BBB, Angi, HomeAdvisor, Thumbtack, Houzz, local chamber of commerce, Oklahoma.gov or city sites\n` +
            `- Search "link:${prospect.website}" or "${prospect.name} review" to find external sites referencing them\n` +
            `- Compare to top competitor: do competitors appear on more directories?\n`
          : `- Note they have no website so they have zero backlinks\n- List the top 5 directories where they should be listed once they have a site\n`) +
        `\nReturn ONLY this JSON object (no other text):\n` +
        `{\n` +
        `  "titleTag": "actual title tag or 'No website'",\n` +
        `  "titleTagScore": "Good/Needs work/Missing/No website",\n` +
        `  "h1": "actual H1 or 'No website'",\n` +
        `  "h1Score": "Good/Needs work/Missing/No website",\n` +
        `  "metaDesc": "actual meta desc or 'No website'",\n` +
        `  "metaScore": "Good/Needs work/Missing/No website",\n` +
        `  "hasCityInTitle": true/false,\n` +
        `  "hasCityInH1": true/false,\n` +
        `  "pageSpeedEstimate": "Fast/Medium/Slow/No website",\n` +
        `  "indexedPages": estimated number of indexed pages or 0,\n` +
        `  "competitor1": "name of #1 ranked competitor",\n` +
        `  "competitor1url": "their website url or null",\n` +
        `  "competitor2": "name of #2 ranked competitor",\n` +
        `  "competitor2url": "their website url or null",\n` +
        `  "competitor3": "name of #3 ranked competitor",\n` +
        `  "competitor3url": "their website url or null",\n` +
        `  "backlinkScore": "Strong/Moderate/Weak/None — overall assessment",\n` +
        `  "estimatedReferringDomains": estimated number of unique sites linking to them (0-200),\n` +
        `  "backlinkSources": ["list of actual directories/sites found linking to or mentioning them"],\n` +
        `  "backlinkGaps": ["top directories/sites they are missing from that competitors use"],\n` +
        `  "topBacklinkOpportunities": ["3-5 specific sites/directories they should get listed on with brief reason"],\n` +
        `  "competitorBacklinkAdvantage": "plain English: how competitors' backlink profiles compare to theirs",\n` +
        `  "missingPages": ["service page they're missing 1", "service page 2"],\n` +
        `  "quickWins": ["most impactful specific fix 1", "fix 2", "fix 3", "fix 4"],\n` +
        `  "estimatedNewCallsPerMonth": "e.g. 12-20 new inbound calls",\n` +
        `  "summary": "2-sentence plain English summary of their overall SEO situation including backlinks"\n` +
        `}`,
        true
      );
      const s=text.indexOf("{"),e=text.lastIndexOf("}");
      if(s>-1&&e>-1){const data=JSON.parse(text.slice(s,e+1));setDeepData(prev=>({...prev,[prospect.id]:data}));}
    }catch(err){console.error("Deep analyze error:",err);}
    setAnalyzing(null);
  }

  async function queueOutreach(prospect){
    setGenId(prospect.id);
    const pkg=recPkg(prospect);
    try{
      const emailText=await callClaude(
        `Write a cold outreach email for ${prospect.name}, a ${prospect.trade} company in ${prospect.city}, Oklahoma.\n\n` +
        `Real data about them:\n` +
        `- Website: ${prospect.hasWebsite?prospect.website:"NONE — they have no website at all"}\n` +
        `- Google reviews: ${prospect.googleReviews||0} (${prospect.googleRating||"no rating"})\n` +
        `- Facebook: ${prospect.hasFacebook?prospect.facebookUrl:"Not found"}\n` +
        `- Yelp: ${prospect.hasYelp?prospect.yelpUrl:"Not listed"}\n` +
        `- Main SEO issue: ${prospect.weakness}\n` +
        `- Current ranking: position ${prospect.googleRank||"unknown"} for "${prospect.mainKeyword}"\n\n` +
        `From GoFieldWise (biz@gofieldwise.com). Recommended package: ${pkg?.name} at $${pkg?.monthly}/month${pkg?.price?" + $"+pkg.price+" setup":""}.\n\n` +
        `Write a 120-word personalized email that:\n` +
        `- References something SPECIFIC about their actual situation (use the real data above)\n` +
        `- Mentions the exact keyword opportunity and what it's worth to them\n` +
        `- Offers a free audit call as CTA\n` +
        `- Sounds like a real person wrote it, not a template\n\n` +
        `Format:\nSUBJECT: [subject line]\n\n[email body]\n\nBest,\nGoFieldWise Team\nbiz@gofieldwise.com`
      );
      const lines=emailText.trim().split("\n");
      const subject=lines.find(l=>l.startsWith("SUBJECT:"))?.replace("SUBJECT:","").trim()||`Quick question — ${prospect.name}`;
      const body=lines.filter(l=>!l.startsWith("SUBJECT:")).join("\n").trim();
      setEmailQueue(prev=>[...prev.filter(e=>!(e.prospectId===prospect.id&&e.type==="initial_outreach")),{id:`${prospect.id}-${Date.now()}`,prospectId:prospect.id,businessName:prospect.name,to:prospect.email||`owner@${prospect.name.toLowerCase().replace(/[^a-z]/g,"")}.com`,from:FROM_EMAIL,subject,body,status:"queued",type:"initial_outreach",trade:prospect.trade,city:prospect.city,pkg:pkg?.name,createdAt:new Date().toISOString()}]);
      setProspects(prev=>prev.map(p=>p.id===prospect.id?{...p,emailStatus:"queued"}:p));
    }catch(err){console.error(err);}
    setGenId(null);
  }

  const platformLink=(url,label,icon,active)=>(
    <a href={active&&url?url:"#"} target={active&&url?"_blank":"_self"} rel="noopener noreferrer" onClick={e=>{if(!active||!url)e.preventDefault();}}
      style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:6,fontSize:11,fontWeight:500,textDecoration:"none",border:"0.5px solid",borderColor:active?"var(--color-border-secondary)":"var(--color-border-tertiary)",background:active?"var(--color-background-primary)":"transparent",color:active?"var(--color-text-primary)":"var(--color-text-secondary)",cursor:active&&url?"pointer":"default",opacity:active?1:0.55}}>
      <i className={`ti ti-${icon}`} style={{fontSize:13}} aria-hidden="true"/>
      {active?<span style={{color:"var(--color-text-success)"}}>✓</span>:<span style={{color:"var(--color-text-danger)"}}>✗</span>}
      {label}
    </a>
  );

  const scoreColor=(score)=>score===undefined?"secondary":score>=70?"success":score>=40?"warning":"danger";
  const seoScore=(p)=>{let s=0;if(p.hasWebsite)s+=25;if(p.hasGBP)s+=25;if(p.googleReviews>20)s+=15;if(p.googleReviews>50)s+=10;if(p.hasFacebook)s+=10;if(p.hasYelp)s+=10;if(p.googleRank&&p.googleRank<=10)s+=10;return Math.min(s,100);};

  const noWeb=shown.filter(p=>!p.hasWebsite);
  const weak=shown.filter(p=>p.hasWebsite&&p.seoStatus!=="Strong SEO - top 3");

  return(
    <div>
      <div style={{...ib("info"),marginBottom:"1.5rem"}}>
        <p style={{margin:"0 0 3px",fontSize:13,fontWeight:500,color:"var(--color-text-info)"}}><i className="ti ti-radar" style={{marginRight:6}} aria-hidden="true"/>Smart Finder — 5 sources: Google Maps · Yelp · Google page 2–3 · Facebook · Angi</p>
        <p style={{margin:0,fontSize:12,color:"var(--color-text-info)"}}>Skips the top 3 Maps results and national chains. Targets small independents with <strong>no website</strong>, <strong>few reviews</strong>, or <strong>buried past position 4 on Google Maps</strong> — the exact businesses that need GoFieldWise.</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:"1rem"}}>
        <div><label style={lbl}>Trade</label><select value={trade} onChange={e=>setTrade(e.target.value)} style={{width:"100%",fontSize:13}}>{TRADES.map(t=><option key={t}>{t}</option>)}</select></div>
        <div><label style={lbl}>City</label><select value={city} onChange={e=>{setCity(e.target.value);setCustom("");}} style={{width:"100%",fontSize:13}}>{OK_CITIES.map(c=><option key={c}>{c}</option>)}</select></div>
        <div><label style={lbl}>Or type any city</label><input value={custom} onChange={e=>setCustom(e.target.value)} placeholder="e.g. Bixby, Claremore..." style={{width:"100%",fontSize:13,boxSizing:"border-box"}}/></div>
      </div>

      <button onClick={find} disabled={loading} style={{width:"100%",padding:"11px",fontSize:14,fontWeight:500,cursor:loading?"not-allowed":"pointer",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-secondary)",background:loading?"var(--color-background-secondary)":"transparent",color:loading?"var(--color-text-secondary)":"var(--color-text-primary)",marginBottom:"1rem"}}>
        {loading?<><i className="ti ti-loader" style={{marginRight:8,animation:"spin 1s linear infinite"}} aria-hidden="true"/>Searching real businesses...</>:<><i className="ti ti-world-search" style={{marginRight:8}} aria-hidden="true"/>Find Real {trade} Businesses in {target} — Google, Maps, Facebook &amp; Yelp ↗</>}
      </button>

      {phase&&<div style={{...ib(loading?"info":"success"),marginBottom:"1rem"}}><p style={{margin:0,fontSize:13,color:loading?"var(--color-text-info)":"var(--color-text-success)"}}>{phase}</p></div>}

      {shown.length>0&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:"1.5rem"}}>
            {[["No website",noWeb.length,"danger","→ Starter Site $497"],["Need SEO",weak.length,"warning","→ Local Dominator $397/mo"],["On Google Maps",shown.filter(p=>p.hasGBP).length,"info","have GBP listing"],["Total found",shown.length,"secondary",`real ${trade} businesses`]].map(([l,v,c,s],i)=>(
              <div key={i} style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"12px 14px"}}>
                <p style={{fontSize:22,fontWeight:500,margin:"0 0 2px",color:`var(--color-text-${c})`}}>{v}</p>
                <p style={{fontSize:12,fontWeight:500,margin:"0 0 2px"}}>{l}</p>
                <p style={{fontSize:11,color:"var(--color-text-secondary)",margin:0}}>{s}</p>
              </div>
            ))}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {shown.sort((a,b)=>({Hot:0,Warm:1,Cold:2})[a.priority]-({Hot:0,Warm:1,Cold:2})[b.priority]).map(p=>{
              const cls=classify(p);const pkg=recPkg(p);const score=seoScore(p);const dd=deepData[p.id];const isExpanded=expanded===p.id;const inQueue=emailQueue.some(e=>e.prospectId===p.id&&e.type==="initial_outreach");
              return(
                <div key={p.id} style={{border:isExpanded?"1px solid var(--color-border-info)":"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",overflow:"hidden",transition:"border .15s"}}>
                  {/* Card header */}
                  <div style={{padding:"14px 16px",cursor:"pointer"}} onClick={()=>setExpanded(isExpanded?null:p.id)}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,flexWrap:"wrap"}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                          <span style={{fontSize:15,fontWeight:500}}>{p.name}</span>
                          <Badge type={cls.color}>{cls.label}</Badge>
                          <Badge type={scoreColor(score)}>SEO {score}/100</Badge>
                          {p.priority==="Hot"&&<Badge type="danger">Hot lead</Badge>}
                          {p.interested&&<Badge type="success">Interested ✓</Badge>}
                        </div>
                        {p.phone&&<p style={{fontSize:12,color:"var(--color-text-secondary)",margin:"0 0 8px"}}>{p.phone}{p.address?` · ${p.address}`:""}</p>}

                        {/* Platform presence row */}
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                          {platformLink(p.website,"Website","world-www",p.hasWebsite)}
                          {platformLink(p.mapsUrl,"Maps","map-pin",p.hasGBP)}
                          {platformLink(p.facebookUrl,"Facebook","brand-facebook",p.hasFacebook)}
                          {platformLink(p.yelpUrl,"Yelp","star",p.hasYelp)}
                        </div>

                        {/* Review counts + Maps rank */}
                        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8,alignItems:"center"}}>
                          {p.googleReviews>0
                            ? <span style={{fontSize:11,padding:"2px 7px",borderRadius:6,background:p.googleReviews<20?"var(--color-background-danger)":"var(--color-background-secondary)",color:p.googleReviews<20?"var(--color-text-danger)":"var(--color-text-secondary)"}}><i className="ti ti-brand-google" style={{marginRight:4,fontSize:10}} aria-hidden="true"/>{p.googleReviews} reviews {p.googleRating&&`· ${p.googleRating}★`}</span>
                            : <span style={{fontSize:11,padding:"2px 7px",borderRadius:6,background:"var(--color-background-danger)",color:"var(--color-text-danger)"}}><i className="ti ti-brand-google" style={{marginRight:4,fontSize:10}} aria-hidden="true"/>0 Google reviews</span>
                          }
                          {p.mapsRank&&<span style={{fontSize:11,padding:"2px 7px",borderRadius:6,background:p.mapsRank>3?"var(--color-background-warning)":"var(--color-background-secondary)",color:p.mapsRank>3?"var(--color-text-warning)":"var(--color-text-secondary)"}}><i className="ti ti-map-pin" style={{marginRight:4,fontSize:10}} aria-hidden="true"/>Maps #{p.mapsRank}</span>}
                          {p.googleRank&&p.googleRank>10&&<span style={{fontSize:11,padding:"2px 7px",borderRadius:6,background:"var(--color-background-warning)",color:"var(--color-text-warning)"}}><i className="ti ti-search" style={{marginRight:4,fontSize:10}} aria-hidden="true"/>Google pos #{p.googleRank}</span>}
                          {!p.hasGBP&&<span style={{fontSize:11,padding:"2px 7px",borderRadius:6,background:"var(--color-background-danger)",color:"var(--color-text-danger)"}}><i className="ti ti-map-pin-off" style={{marginRight:4,fontSize:10}} aria-hidden="true"/>Not on Maps</span>}
                          {p.yelpReviews>0&&<span style={{fontSize:11,color:"var(--color-text-secondary)"}}><i className="ti ti-star" style={{marginRight:4,fontSize:10}} aria-hidden="true"/>Yelp: {p.yelpReviews}</span>}
                          {p.facebookLikes>0&&<span style={{fontSize:11,color:"var(--color-text-secondary)"}}><i className="ti ti-thumb-up" style={{marginRight:4,fontSize:10}} aria-hidden="true"/>FB: {p.facebookLikes.toLocaleString()}</span>}
                        </div>

                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          <Badge type="secondary">{p.weakness}</Badge>
                          <Badge type="info">Recommend: {pkg?.name} — {pkg?.price?`$${pkg.price} + `:""}${pkg?.monthly}/mo</Badge>
                          {p.mainKeyword&&<Badge type="secondary">{p.mainKeyword} · ~{p.estimatedMonthlySearches?.toLocaleString()}/mo</Badge>}
                        </div>
                      </div>

                      <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
                        <button onClick={e=>{e.stopPropagation();queueOutreach(p);}} disabled={genId===p.id||inQueue}
                          style={{padding:"6px 12px",fontSize:12,cursor:genId===p.id||inQueue?"not-allowed":"pointer",borderRadius:"var(--border-radius-md)",border:inQueue?"0.5px solid var(--color-border-success)":"0.5px solid var(--color-border-secondary)",background:inQueue?"var(--color-background-success)":"transparent",color:inQueue?"var(--color-text-success)":"var(--color-text-primary)",whiteSpace:"nowrap"}}>
                          {genId===p.id?<><i className="ti ti-loader" style={{marginRight:4,animation:"spin 1s linear infinite"}}/>Writing...</>:inQueue?<><i className="ti ti-check" style={{marginRight:4}}/>In Queue</>:<><i className="ti ti-send" style={{marginRight:4}}/>Queue Outreach ↗</>}
                        </button>
                        <button onClick={e=>{e.stopPropagation();deepAnalyze(p);}} disabled={analyzing===p.id}
                          style={{padding:"5px 12px",fontSize:12,cursor:analyzing===p.id?"not-allowed":"pointer",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-info)",background:dd?"var(--color-background-info)":"transparent",color:"var(--color-text-info)",whiteSpace:"nowrap"}}>
                          {analyzing===p.id?<><i className="ti ti-loader" style={{marginRight:4,animation:"spin 1s linear infinite"}}/>Analyzing...</>:dd?<><i className="ti ti-eye" style={{marginRight:4}}/>View audit</>:<><i className="ti ti-zoom-scan" style={{marginRight:4}}/>SEO + Backlinks ↗</>}
                        </button>
                        {inQueue&&!p.interested&&<button onClick={e=>{e.stopPropagation();setProspects(prev=>prev.map(x=>x.id===p.id?{...x,interested:true,emailStatus:"responded"}:x));}} style={{padding:"5px 12px",fontSize:12,cursor:"pointer",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-success)",background:"transparent",color:"var(--color-text-success)",whiteSpace:"nowrap"}}><i className="ti ti-thumb-up" style={{marginRight:4}}/>Mark Interested</button>}
                      </div>
                    </div>
                  </div>

                  {/* Expanded deep analysis */}
                  {isExpanded&&(
                    <div style={{borderTop:"0.5px solid var(--color-border-tertiary)",padding:"14px 16px",background:"var(--color-background-secondary)"}}>
                      {!dd&&analyzing!==p.id&&(
                        <div style={{textAlign:"center",padding:"1rem"}}>
                          <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:"0 0 10px"}}>Click "SEO + Backlinks" to audit their website, find directory citations, check backlink gaps vs competitors, and get specific recommendations.</p>
                          <button onClick={()=>deepAnalyze(p)} style={{padding:"8px 18px",fontSize:13,cursor:"pointer",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-info)",background:"var(--color-background-info)",color:"var(--color-text-info)"}}>
                            <i className="ti ti-zoom-scan" style={{marginRight:6}} aria-hidden="true"/>Run SEO + Backlink Audit ↗
                          </button>
                        </div>
                      )}
                      {analyzing===p.id&&<div style={{textAlign:"center",padding:"1.5rem"}}><i className="ti ti-loader" style={{fontSize:24,color:"var(--color-text-info)",animation:"spin 1s linear infinite",display:"block",marginBottom:10}} aria-hidden="true"/><p style={{fontSize:13,color:"var(--color-text-secondary)",margin:"0 0 4px",fontWeight:500}}>Running full SEO + backlink audit...</p><p style={{fontSize:12,color:"var(--color-text-secondary)",margin:0}}>Fetching website · Checking title/H1/meta · Searching directory citations · Finding backlink gaps · Identifying competitors</p></div>}
                      {dd&&(
                        <div>
                          <p style={{fontSize:13,fontWeight:500,margin:"0 0 12px"}}>Full SEO + Backlink Audit — {p.name}</p>

                          {dd.summary&&<div style={{...ib("info"),marginBottom:12}}><p style={{margin:0,fontSize:12,color:"var(--color-text-info)"}}>{dd.summary}</p></div>}

                          {/* On-page elements */}
                          <p style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:".04em"}}>On-page elements</p>
                          <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
                            {[["Title tag",dd.titleTag,dd.titleTagScore],["H1 heading",dd.h1,dd.h1Score],["Meta description",dd.metaDesc,dd.metaScore],["Indexed pages",dd.indexedPages!==undefined?`~${dd.indexedPages} pages indexed by Google`:"Unknown","Good"]].map(([label,val,score],i)=>{
                              const sc=score==="Good"?"success":score==="Missing"||score==="No website"?"danger":"warning";
                              return val?(<div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"8px 10px",background:"var(--color-background-primary)",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-tertiary)"}}>
                                <div style={{flex:1,minWidth:0}}>
                                  <span style={{fontSize:11,color:"var(--color-text-secondary)",display:"block",marginBottom:2}}>{label}</span>
                                  <span style={{fontSize:12,color:"var(--color-text-primary)",wordBreak:"break-word"}}>{val}</span>
                                </div>
                                <Badge type={sc}>{score||"—"}</Badge>
                              </div>):null;
                            })}
                          </div>

                          {/* Backlink analysis */}
                          <p style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:".04em"}}>
                            <i className="ti ti-link" style={{marginRight:5}} aria-hidden="true"/>Backlink profile
                          </p>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                            <div style={{padding:"10px 12px",background:"var(--color-background-primary)",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-tertiary)"}}>
                              <p style={{fontSize:10,color:"var(--color-text-secondary)",margin:"0 0 3px",textTransform:"uppercase",letterSpacing:".04em"}}>Backlink strength</p>
                              <div style={{display:"flex",alignItems:"center",gap:8}}>
                                <p style={{fontSize:16,fontWeight:500,margin:0}}>{dd.estimatedReferringDomains??0} <span style={{fontSize:11,fontWeight:400,color:"var(--color-text-secondary)"}}>referring domains</span></p>
                                <Badge type={dd.backlinkScore==="Strong"?"success":dd.backlinkScore==="Moderate"?"warning":dd.backlinkScore==="None"?"danger":"danger"}>{dd.backlinkScore||"None"}</Badge>
                              </div>
                            </div>
                            <div style={{padding:"10px 12px",background:"var(--color-background-primary)",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-tertiary)"}}>
                              <p style={{fontSize:10,color:"var(--color-text-secondary)",margin:"0 0 3px",textTransform:"uppercase",letterSpacing:".04em"}}>vs competitors</p>
                              <p style={{fontSize:12,color:"var(--color-text-primary)",margin:0,lineHeight:1.5}}>{dd.competitorBacklinkAdvantage||"Not analyzed"}</p>
                            </div>
                          </div>

                          {dd.backlinkSources?.length>0&&(
                            <div style={{marginBottom:10}}>
                              <p style={{fontSize:11,color:"var(--color-text-secondary)",margin:"0 0 6px",fontWeight:500}}>Links/citations found:</p>
                              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                                {dd.backlinkSources.map((src,i)=><span key={i} style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:"var(--color-background-success)",color:"var(--color-text-success)",border:"0.5px solid var(--color-border-success)"}}><i className="ti ti-check" style={{marginRight:3,fontSize:10}} aria-hidden="true"/>{src}</span>)}
                              </div>
                            </div>
                          )}

                          {dd.backlinkGaps?.length>0&&(
                            <div style={{marginBottom:14}}>
                              <p style={{fontSize:11,color:"var(--color-text-secondary)",margin:"0 0 6px",fontWeight:500}}>Missing from (competitors are listed here):</p>
                              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                                {dd.backlinkGaps.map((gap,i)=><span key={i} style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:"var(--color-background-danger)",color:"var(--color-text-danger)",border:"0.5px solid var(--color-border-danger)"}}><i className="ti ti-x" style={{marginRight:3,fontSize:10}} aria-hidden="true"/>{gap}</span>)}
                              </div>
                            </div>
                          )}

                          {dd.topBacklinkOpportunities?.length>0&&(
                            <>
                              <p style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:".04em"}}>Top backlink opportunities</p>
                              <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:14}}>
                                {dd.topBacklinkOpportunities.map((opp,i)=>(
                                  <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"8px 10px",background:"var(--color-background-primary)",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-info)"}}>
                                    <i className="ti ti-external-link" style={{fontSize:12,color:"var(--color-text-info)",marginTop:2,flexShrink:0}} aria-hidden="true"/>
                                    <span style={{fontSize:12,color:"var(--color-text-primary)"}}>{opp}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}

                          {/* Competitor landscape */}
                          {(dd.competitor1||dd.competitor2)&&(
                            <>
                              <p style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:".04em"}}>Top competitors ranking above them</p>
                              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
                                {[["#1",dd.competitor1,dd.competitor1url],["#2",dd.competitor2,dd.competitor2url],["#3",dd.competitor3,dd.competitor3url]].filter(([,v])=>v).map(([rank,name,url])=>(
                                  <div key={rank} style={{padding:"6px 10px",background:"var(--color-background-primary)",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-tertiary)"}}>
                                    <span style={{fontSize:10,color:"var(--color-text-secondary)"}}>{rank} · </span>
                                    <span style={{fontSize:12,fontWeight:500}}>{name}</span>
                                    {url&&<a href={url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:10,color:"var(--color-text-info)",marginLeft:6,textDecoration:"none"}}><i className="ti ti-external-link" style={{fontSize:10}} aria-hidden="true"/></a>}
                                  </div>
                                ))}
                              </div>
                            </>
                          )}

                          {/* Quick wins */}
                          {dd.quickWins?.length>0&&(
                            <>
                              <p style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:".04em"}}>Quick wins to push to page 1</p>
                              <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
                                {dd.quickWins.map((win,i)=>(
                                  <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"8px 10px",background:"var(--color-background-success)",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-success)"}}>
                                    <i className="ti ti-arrow-right" style={{fontSize:13,color:"var(--color-text-success)",marginTop:1,flexShrink:0}} aria-hidden="true"/>
                                    <span style={{fontSize:12,color:"var(--color-text-success)"}}>{win}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}

                          {dd.estimatedNewCallsPerMonth&&<div style={{...ib("warning"),marginBottom:12}}><p style={{margin:0,fontSize:12,color:"var(--color-text-warning)"}}><i className="ti ti-phone" style={{marginRight:6}} aria-hidden="true"/><strong>Estimated impact:</strong> {dd.estimatedNewCallsPerMonth} additional inbound calls/month from page 1 + backlink improvements.</p></div>}

                          <button onClick={()=>queueOutreach(p)} disabled={genId===p.id||emailQueue.some(e=>e.prospectId===p.id&&e.type==="initial_outreach")}
                            style={{width:"100%",padding:"9px",fontSize:13,fontWeight:500,cursor:"pointer",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-secondary)",background:"transparent",color:"var(--color-text-primary)"}}>
                            <i className="ti ti-send" style={{marginRight:6}} aria-hidden="true"/>Generate outreach email using this full audit ↗
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {p.interested&&<div style={{padding:"10px 16px",background:"var(--color-background-success)",borderTop:"0.5px solid var(--color-border-success)"}}><p style={{margin:0,fontSize:12,color:"var(--color-text-success)"}}><i className="ti ti-star" style={{marginRight:6}} aria-hidden="true"/>Interested! Go to Campaigns to build their nurture sequence, then Proposals for their proposal.</p></div>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── WEBSITE PORTFOLIO ─────────────────────────────────────────────
const SITE_THEMES={
  HVAC:{bg:"#0D2340",accent:"#FF6B35",accentTxt:"#fff",statBg:"#FF6B35",statTxt:"#fff",cardBg:"#EBF1FB",card2Bg:"#FFF0EA",navTxt:"rgba(255,255,255,.7)",rvwBorder:"#e0e8f0",secBg:"#F8FAFD",txtDk:"#0D2340",txtMd:"#4B6080",footBg:"#081420",url:"premierairok.com",name:"Premier Air & Heat",tagline:"Tulsa's most trusted HVAC experts",sub:"Fast, reliable heating & cooling. Licensed & insured. Same-day appointments. Serving Tulsa since 2009.",phone:"(918) 555-0147",city:"Tulsa, OK",stars:"312",years:"15",jobs:"2,400+",s4:"Same day",s4l:"Available",i1:"ti-wind",i2:"ti-flame",i3:"ti-tool",i4:"ti-home",sv1:"AC repair & install",sv2:"Heating & furnace",sv3:"Maintenance plans",sv4:"New system install",d1:"All makes & models. Fast diagnosis.",d2:"Gas furnaces, heat pumps, emergency repair.",d3:"Tune-ups, filter changes, seasonal checkups.",d4:"Energy-efficient systems. Financing available.",r1:'"AC went out on the hottest day. Premier had someone here in 2 hours. Incredible service."',rn1:"Mike R., Tulsa",r2:'"Best HVAC company in Tulsa. Fair prices, honest techs. Won\'t use anyone else."',rn2:"Sandra L., Broken Arrow",r3:'"New unit installed in one day. Clean, professional, great price."',rn3:"James T., Owasso",cta:"Ready to get comfortable?",ctaSub:"Call now or enter your number — we'll call back in 5 minutes.",ctaBtn:"Call me now"},
  Plumbing:{bg:"#083344",accent:"#D4A017",accentTxt:"#083344",statBg:"#D4A017",statTxt:"#083344",cardBg:"#E8F4F8",card2Bg:"#FDF6E3",navTxt:"rgba(255,255,255,.7)",rvwBorder:"#cce0ea",secBg:"#F2F8FB",txtDk:"#083344",txtMd:"#336",footBg:"#041C26",url:"tulsaproplumbers.com",name:"Tulsa Pro Plumbers",tagline:"When water won't wait, we're already on our way",sub:"Licensed master plumbers serving Tulsa since 2007. We fix it right the first time, guaranteed.",phone:"(918) 555-0203",city:"Tulsa, OK",stars:"520",years:"18",jobs:"4,100+",s4:"60 min",s4l:"Response",i1:"ti-droplet",i2:"ti-flame",i3:"ti-tool",i4:"ti-home",sv1:"Drain cleaning",sv2:"Water heater repair",sv3:"Leak & pipe repair",sv4:"Bathroom & kitchen",d1:"Clogged drains cleared fast.",d2:"Tank & tankless. Same-day restored.",d3:"Burst pipes, slab leaks, repiping.",d4:"Fixture installs, remodels, toilet repair.",r1:'"Pipe burst at 11pm. There in 45 min. Saved my floors."',rn1:"Dana K., Tulsa",r2:'"Total bathroom remodel — meticulous, on time, fair price."',rn2:"Tom H., Broken Arrow",r3:'"Found a slab leak two other plumbers missed."',rn3:"Rachel M., Jenks",cta:"Plumbing problem right now?",ctaSub:"Don't wait. Water damage gets worse every minute.",ctaBtn:"Call now"},
  Electrical:{bg:"#111827",accent:"#F5C518",accentTxt:"#111827",statBg:"#F5C518",statTxt:"#111827",cardBg:"#1E2535",card2Bg:"#1E2535",navTxt:"rgba(255,255,255,.7)",rvwBorder:"#ddd",secBg:"#F9F9F7",txtDk:"#111827",txtMd:"#444",footBg:"#0B1018",url:"okcelectricco.com",name:"OKC Electric Co.",tagline:"Oklahoma City's go-to electrical contractor",sub:"Panel upgrades, EV charger installation, whole-home rewiring. 2-year labor warranty.",phone:"(405) 555-0182",city:"Oklahoma City, OK",stars:"218",years:"12",jobs:"1,800+",s4:"2-yr",s4l:"Warranty",i1:"ti-bolt",i2:"ti-car",i3:"ti-home",i4:"ti-bulb",sv1:"Panel upgrades",sv2:"EV charger install",sv3:"Whole-home rewiring",sv4:"Lighting & outlets",d1:"200A upgrades, subpanels, code compliance.",d2:"Level 2 chargers. All vehicles. Permit included.",d3:"Old wiring replaced safely.",d4:"Recessed lighting, ceiling fans, GFCI.",r1:'"Had my panel and two EV chargers installed. Fast, clean."',rn1:"Chris B., Edmond",r2:'"Rewired our whole house. Passed inspection first try."',rn2:"Lisa N., Yukon",r3:'"Called about a tripping breaker. Fixed next morning."',rn3:"Paul W., Moore",cta:"Need an electrician in OKC?",ctaSub:"Free quotes. No trip fees. Book online or call now.",ctaBtn:"Call (405) 555-0182"},
  Cleaning:{bg:"#1B5E20",accent:"#fff",accentTxt:"#1B5E20",statBg:"#2E7D32",statTxt:"#fff",cardBg:"#E8F5E9",card2Bg:"#E8F5E9",navTxt:"#555",rvwBorder:"#c8e6c9",secBg:"#F1F8F1",txtDk:"#1B4020",txtMd:"#2E5020",footBg:"#0D3311",url:"shinecleanok.com",name:"Shine Clean",tagline:"A spotless home, on your schedule",sub:"Professional home & office cleaning. Eco-friendly products, background-checked cleaners, 100% guaranteed.",phone:"(918) 555-0091",city:"Broken Arrow, OK",stars:"410",years:"8",jobs:"3,200+",s4:"100%",s4l:"Guaranteed",i1:"ti-home",i2:"ti-sparkles",i3:"ti-building",i4:"ti-briefcase",sv1:"Standard cleaning",sv2:"Deep cleaning",sv3:"Move in/out",sv4:"Office cleaning",d1:"Weekly, bi-weekly, or monthly.",d2:"Top-to-bottom detail. First clean perfect.",d3:"Security deposit ready. Landlord approved.",d4:"After-hours commercial. Recurring plans.",r1:'"Every two weeks for a year. Never disappointed."',rn1:"Amy G., Broken Arrow",r2:'"Got my full deposit back after move-out clean!"',rn2:"Marcus J., Tulsa",r3:'"Eco-friendly products matter to our family."',rn3:"Jennifer R., Jenks",cta:"Book your first cleaning today",ctaSub:"First-time customers get 15% off. No contracts.",ctaBtn:"Book online now"},
};

function SiteMockup({trade}){
  const t=SITE_THEMES[trade]||SITE_THEMES.HVAC;
  const navBg=trade==="Cleaning"?"#fff":t.bg;const navBdr=trade==="Cleaning"?"1px solid #e8f0e8":"none";
  const cardTxt=trade==="Electrical"?"#fff":t.txtDk;const cardSub=trade==="Electrical"?"rgba(255,255,255,.65)":t.txtMd;
  return(
    <div style={{fontFamily:"system-ui,sans-serif",background:"#fff"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 20px",background:navBg,borderBottom:navBdr}}>
        <div style={{fontSize:15,fontWeight:700,color:t.accent}}>{t.name}</div>
        <div style={{display:"flex",gap:16,fontSize:10,color:t.navTxt}}><span>Services</span><span>About</span><span>Reviews</span><span>Contact</span></div>
        <div style={{padding:"6px 14px",borderRadius:6,background:t.accent,color:t.accentTxt,fontSize:10,fontWeight:700}}>{t.phone}</div>
      </div>
      <div style={{padding:"36px 20px 28px",background:t.bg,textAlign:"center"}}>
        <div style={{display:"inline-block",background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.85)",padding:"3px 10px",borderRadius:20,fontSize:9,fontWeight:700,marginBottom:12}}>Serving {t.city} &amp; surrounding areas</div>
        <div style={{fontSize:22,fontWeight:800,color:"#fff",lineHeight:1.2,marginBottom:8}}>{t.tagline.split(",")[0]}<br/><span style={{color:t.accent}}>{t.tagline.includes(",")&&t.tagline.split(",")[1].trim()}</span></div>
        <div style={{fontSize:11,color:"rgba(255,255,255,.75)",lineHeight:1.6,marginBottom:16,maxWidth:420,margin:"0 auto 16px"}}>{t.sub}</div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:18,flexWrap:"wrap"}}>
          <div style={{padding:"9px 18px",borderRadius:7,background:t.accent,color:t.accentTxt,fontSize:11,fontWeight:700}}>Get a free estimate</div>
          <div style={{padding:"9px 18px",borderRadius:7,background:"transparent",color:"#fff",fontSize:11,fontWeight:600,border:"1.5px solid rgba(255,255,255,.25)"}}>Call {t.phone}</div>
        </div>
        <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
          {[`★ ${t.stars} reviews`,"Licensed & insured","24/7 available",`${t.years} yrs experience`].map((b,i)=><span key={i} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:20,fontSize:9,fontWeight:600,background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.9)"}}>{b}</span>)}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",background:t.statBg,padding:"14px 20px",textAlign:"center"}}>
        {[[t.jobs,"Homes served"],[t.years+" yrs","In business"],["4.9★","Google rating"],[t.s4,t.s4l]].map(([v,l],i)=><div key={i}><div style={{fontSize:16,fontWeight:800,color:t.statTxt}}>{v}</div><div style={{fontSize:9,marginTop:2,color:`${t.statTxt}bb`}}>{l}</div></div>)}
      </div>
      <div style={{padding:"22px 20px",background:"#fff"}}>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:t.accent,marginBottom:4}}>What we do</div>
        <div style={{fontSize:17,fontWeight:800,color:t.txtDk,marginBottom:14}}>Complete {trade.toLowerCase()} services</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {[[t.sv1,t.d1,t.i1,t.cardBg],[t.sv2,t.d2,t.i2,t.card2Bg],[t.sv3,t.d3,t.i3,t.cardBg],[t.sv4,t.d4,t.i4,t.card2Bg]].map(([name,desc,icon,bg],i)=><div key={i} style={{borderRadius:8,padding:"12px 10px",background:bg}}><i className={`ti ${icon}`} style={{fontSize:18,color:t.accent,display:"block",marginBottom:6}} aria-hidden="true"/><div style={{fontSize:10,fontWeight:700,color:cardTxt,marginBottom:3}}>{name}</div><div style={{fontSize:9,color:cardSub,lineHeight:1.5}}>{desc}</div></div>)}
        </div>
      </div>
      <div style={{padding:"20px",background:t.secBg}}>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:t.accent,marginBottom:4}}>What customers say</div>
        <div style={{fontSize:15,fontWeight:800,color:t.txtDk,marginBottom:12}}>{t.stars} five-star reviews on Google</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {[[t.r1,t.rn1],[t.r2,t.rn2],[t.r3,t.rn3]].map(([r,n],i)=><div key={i} style={{borderRadius:8,padding:"12px",background:"#fff",border:`0.5px solid ${t.rvwBorder}`}}><div style={{fontSize:11,color:t.accent,marginBottom:5}}>★★★★★</div><div style={{fontSize:9,color:"#334",lineHeight:1.6,marginBottom:6}}>{r}</div><div style={{fontSize:9,fontWeight:700,color:t.txtDk}}>— {n}</div></div>)}
        </div>
      </div>
      <div style={{padding:"26px 20px",background:t.bg,textAlign:"center"}}>
        <div style={{fontSize:18,fontWeight:800,color:"#fff",marginBottom:6}}>{t.cta}</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginBottom:16}}>{t.ctaSub}</div>
        <div style={{display:"flex",gap:8,justifyContent:"center"}}>
          <div style={{padding:"9px 18px",borderRadius:7,background:t.accent,color:t.accentTxt,fontSize:11,fontWeight:700}}>{t.ctaBtn}</div>
          <div style={{padding:"9px 18px",borderRadius:7,background:"transparent",color:"#fff",fontSize:11,border:"1.5px solid rgba(255,255,255,.25)",fontWeight:600}}>Learn more</div>
        </div>
      </div>
      <div style={{padding:"12px 20px",display:"flex",justifyContent:"space-between",background:t.footBg,fontSize:9,color:"rgba(255,255,255,.4)"}}>
        <span>© 2025 {t.name} · {t.city}</span>
        <span style={{color:"rgba(255,255,255,.6)",fontWeight:600}}>Website by GoFieldWise</span>
      </div>
    </div>
  );
}

function WebsitePortfolio(){
  const [active,setActive]=useState("HVAC");const [copied,setCopied]=useState(false);
  const t=SITE_THEMES[active];
  const pitch=`Hey [Owner Name], I was checking out local ${active.toLowerCase()} companies in [city] today and noticed you don't have a website yet.\n\nHere's the thing — when someone in [city] searches "${active.toLowerCase()} near me," your competitors show up and you're invisible. Those are real customers calling someone else.\n\nI build websites for ${active.toLowerCase()} companies in Oklahoma that are designed specifically to show up on Google and turn visitors into phone calls. One-time fee of $497 to build, then $197 a month for SEO and maintenance.\n\nI can show you exactly what your site would look like with your business name — takes me 10 minutes to put together. No cost, no commitment.\n\nWorth a quick look?\n\n[Your Name] | GoFieldWise | biz@gofieldwise.com`;
  const tradeColors={HVAC:"#1B3A6B",Plumbing:"#083344",Electrical:"#111827",Cleaning:"#1B5E20"};
  return(
    <div>
      <div style={{...ib("info"),marginBottom:"1.5rem"}}><p style={{margin:"0 0 3px",fontSize:13,fontWeight:500,color:"var(--color-text-info)"}}><i className="ti ti-browser" style={{marginRight:6}} aria-hidden="true"/>Show these mockups to prospects — switch between trades, scroll to show the full site</p><p style={{margin:0,fontSize:12,color:"var(--color-text-info)"}}>Each site: custom domain · mobile-ready · click-to-call · Google-ready SEO · "Website by GoFieldWise" footer branding</p></div>
      <div style={{display:"flex",gap:8,marginBottom:"1.25rem",flexWrap:"wrap"}}>
        {["HVAC","Plumbing","Electrical","Cleaning"].map(trade=><button key={trade} onClick={()=>setActive(trade)} style={{...bs(active===trade),...(active===trade?{background:tradeColors[trade],borderColor:tradeColors[trade],color:"#fff"}:{})}}>{trade}</button>)}
      </div>
      <div style={{border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",overflow:"hidden",marginBottom:"1.25rem"}}>
        <div style={{background:"#f1f0eb",padding:"8px 12px",display:"flex",alignItems:"center",gap:8,borderBottom:"0.5px solid #ddd"}}>
          <div style={{display:"flex",gap:5}}>{["#ff5f57","#febc2e","#28c840"].map((c,i)=><div key={i} style={{width:9,height:9,borderRadius:"50%",background:c}}/>)}</div>
          <div style={{flex:1,background:"#fff",borderRadius:4,padding:"3px 10px",fontSize:11,color:"#666",border:"0.5px solid #ddd"}}>{t?.url}</div>
        </div>
        <div style={{maxHeight:540,overflowY:"auto"}}><SiteMockup trade={active}/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:"1.25rem"}}>
        {[["One-time build","$497","Site design + setup"],["Monthly retainer","$197/mo","SEO + maintenance"],["Live in","~2 weeks","From deposit to launch"]].map(([l,v,s],i)=><div key={i} style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"12px 14px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:500,margin:"0 0 3px"}}>{v}</div><div style={{fontSize:11,fontWeight:500,margin:"0 0 2px"}}>{l}</div><div style={{fontSize:11,color:"var(--color-text-secondary)"}}>{s}</div></div>)}
      </div>
      <div style={card}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><p style={{margin:0,fontSize:13,fontWeight:500}}><i className="ti ti-message" style={{marginRight:6}} aria-hidden="true"/>Pitch script — {active} with no website</p><button onClick={()=>{navigator.clipboard?.writeText(pitch);setCopied(true);setTimeout(()=>setCopied(false),1800);}} style={{padding:"4px 10px",fontSize:11,cursor:"pointer",borderRadius:6,border:"0.5px solid var(--color-border-tertiary)",background:copied?"var(--color-background-success)":"transparent",color:copied?"var(--color-text-success)":"var(--color-text-secondary)"}}><i className={`ti ti-${copied?"check":"copy"}`} style={{marginRight:4}} aria-hidden="true"/>{copied?"Copied!":"Copy script"}</button></div><pre style={{fontSize:12,lineHeight:1.7,margin:0,whiteSpace:"pre-wrap",fontFamily:"var(--font-sans)",color:"var(--color-text-secondary)",background:"var(--color-background-secondary)",padding:"12px 14px",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-tertiary)"}}>{pitch}</pre></div>
    </div>
  );
}

// ── EMAIL QUEUE ───────────────────────────────────────────────────
function EmailQueue({emailQueue,setEmailQueue,prospects,setProspects}){
  const [filter,setFilter]=useState("all");const [genSeqId,setGenSeqId]=useState(null);
  const filtered=emailQueue.filter(e=>filter==="all"||e.status===filter);
  const counts=emailQueue.reduce((a,e)=>{a[e.status]=(a[e.status]||0)+1;return a;},{});
  function exportQueue(){const b=new Blob([JSON.stringify(emailQueue.filter(e=>e.status==="queued"),null,2)],{type:"application/json"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="email_queue.json";a.click();URL.revokeObjectURL(u);}
  async function genFU(email){setGenSeqId(email.id);const p=prospects.find(x=>x.id===email.prospectId);if(!p){setGenSeqId(null);return;}try{const text=await callClaude(`Write a follow-up email for ${p.name} who hasn't responded. Situation: ${p.seoStatus}. Issue: ${p.weakness}. Google reviews: ${p.googleReviews||0}. Under 80 words. Different angle from first email. From GoFieldWise.\nSUBJECT: [subject]\n\n[body]\n\nGoFieldWise Team`);const lines=text.trim().split("\n");const subject=lines.find(l=>l.startsWith("SUBJECT:"))?.replace("SUBJECT:","").trim()||"Following up";const body=lines.filter(l=>!l.startsWith("SUBJECT:")).join("\n").trim();setEmailQueue(prev=>[...prev,{id:`${email.prospectId}-fu-${Date.now()}`,prospectId:email.prospectId,businessName:email.businessName,to:email.to,from:FROM_EMAIL,subject,body,status:"queued",type:"follow_up",trade:email.trade,city:email.city,pkg:email.pkg,createdAt:new Date().toISOString()}]);}catch{}setGenSeqId(null);}
  const SL={not_sent:"Not sent",sent:"Sent",followed_up:"Followed up",responded:"Responded!",not_interested:"Not interested"};const SC={not_sent:"secondary",sent:"info",followed_up:"warning",responded:"success",not_interested:"danger"};const TL={initial_outreach:"Initial",follow_up:"Follow-up",proposal:"Proposal"};
  return(
    <div>
      <div style={{...ib("info"),marginBottom:"1.5rem"}}><p style={{margin:"0 0 4px",fontSize:13,fontWeight:500,color:"var(--color-text-info)"}}><i className="ti ti-inbox" style={{marginRight:6}} aria-hidden="true"/>All emails send from: <strong>{FROM_EMAIL}</strong></p><p style={{margin:0,fontSize:12,color:"var(--color-text-info)"}}>Export Queue → save as <code>email_queue.json</code> → run <code>node emailer.js send</code> to send.</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:"1.25rem"}}>{[["Queued",counts.queued||0,"info"],["Sent",counts.sent||0,"success"],["Responded",counts.responded||0,"success"],["Total",emailQueue.length,"secondary"]].map(([l,v,c])=><div key={l} style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"10px 12px",textAlign:"center"}}><p style={{fontSize:22,fontWeight:500,margin:"0 0 2px",color:`var(--color-text-${c})`}}>{v}</p><p style={{fontSize:11,color:"var(--color-text-secondary)",margin:0}}>{l}</p></div>)}</div>
      <div style={{display:"flex",gap:8,marginBottom:"1rem",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:6}}>{["all","queued","sent","responded"].map(f=><button key={f} onClick={()=>setFilter(f)} style={{...bs(filter===f),fontSize:12,textTransform:"capitalize"}}>{f}</button>)}</div>
        <button onClick={exportQueue} disabled={!emailQueue.filter(e=>e.status==="queued").length} style={{padding:"7px 14px",fontSize:12,fontWeight:500,cursor:"pointer",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-success)",background:"var(--color-background-success)",color:"var(--color-text-success)"}}><i className="ti ti-download" style={{marginRight:6}} aria-hidden="true"/>Export Queue (JSON)</button>
      </div>
      {filtered.length===0?<div style={{padding:"2.5rem",textAlign:"center",border:"0.5px dashed var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)"}}><i className="ti ti-inbox" style={{fontSize:32,color:"var(--color-text-secondary)",display:"block",marginBottom:8}} aria-hidden="true"/><p style={{fontSize:14,color:"var(--color-text-secondary)",margin:0}}>No emails here. Use Smart Finder to find businesses and queue outreach.</p></div>:
      <div style={{display:"flex",flexDirection:"column",gap:8}}>{filtered.map(email=><div key={email.id} style={{border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",overflow:"hidden"}}><div style={{padding:"12px 16px",background:"var(--color-background-secondary)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}><div><div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}><span style={{fontSize:14,fontWeight:500}}>{email.businessName}</span><Badge type={SC[email.status]||"secondary"}>{SL[email.status]||email.status}</Badge>{email.type&&<Badge type="secondary">{TL[email.type]||email.type}</Badge>}{email.pkg&&<Badge type="info">{email.pkg}</Badge>}</div><p style={{margin:0,fontSize:12,color:"var(--color-text-secondary)"}}><strong>To:</strong> {email.to} · <strong>From:</strong> {email.from}</p></div><div style={{display:"flex",gap:6}}>{email.status==="sent"&&<button onClick={()=>genFU(email)} disabled={genSeqId===email.id} style={{padding:"5px 10px",fontSize:11,cursor:"pointer",borderRadius:6,border:"0.5px solid var(--color-border-warning)",background:"transparent",color:"var(--color-text-warning)",whiteSpace:"nowrap"}}>{genSeqId===email.id?<><i className="ti ti-loader" style={{marginRight:4,animation:"spin 1s linear infinite"}}/>...</>:<><i className="ti ti-repeat" style={{marginRight:4}}/>Follow-up ↗</>}</button>}<button onClick={()=>setEmailQueue(prev=>prev.filter(e=>e.id!==email.id))} style={{padding:"5px 8px",fontSize:11,cursor:"pointer",borderRadius:6,border:"0.5px solid var(--color-border-tertiary)",background:"transparent",color:"var(--color-text-secondary)"}}><i className="ti ti-trash" style={{fontSize:12}} aria-hidden="true"/></button></div></div><div style={{padding:"12px 16px"}}><p style={{fontSize:12,fontWeight:500,color:"var(--color-text-secondary)",margin:"0 0 6px"}}>Subject: {email.subject}</p><pre style={{fontSize:12,lineHeight:1.6,margin:0,whiteSpace:"pre-wrap",fontFamily:"var(--font-sans)",color:"var(--color-text-primary)",background:"var(--color-background-secondary)",padding:"10px 12px",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-tertiary)",maxHeight:140,overflow:"auto"}}>{email.body}</pre><div style={{display:"flex",gap:6,marginTop:8}}><CopyBtn text={`Subject: ${email.subject}\n\n${email.body}`}/></div></div></div>)}</div>}
    </div>
  );
}

// ── CAMPAIGNS ─────────────────────────────────────────────────────
function CampaignManager({prospects,setProspects,emailQueue,setEmailQueue}){
  const [selId,setSelId]=useState("");const [sequences,setSequences]=useState({});const [genSeq,setGenSeq]=useState(false);const [activeIdx,setActiveIdx]=useState(0);
  const interested=prospects.filter(p=>p.interested||p.emailStatus==="responded");const prospect=interested.find(p=>p.id===parseInt(selId));const seq=sequences[selId];
  async function buildCampaign(){if(!prospect)return;setGenSeq(true);const pkg=recPkg(prospect);try{const text=await callClaude(`Create a 4-email nurture sequence for ${prospect.name} (${prospect.trade}, ${prospect.city} OK) who responded showing interest.\nReal data: Website: ${prospect.website||"none"} · Google reviews: ${prospect.googleReviews||0} · Weakness: ${prospect.weakness}\nPackage: ${pkg?.name} at $${pkg?.monthly}/month.\nEmail 1 (Day 1): Thank them, confirm audit call\nEmail 2 (Day 3): Share specific audit findings (use their real data)\nEmail 3 (Day 5): Present ${pkg?.name} as solution with ROI estimate\nEmail 4 (Day 10): Final check-in, urgency\nEach under 120 words. From GoFieldWise (biz@gofieldwise.com).\nReturn ONLY JSON array: [{day,subject,body}]`);const s=text.indexOf("["),e=text.lastIndexOf("]");const parsed=JSON.parse(text.slice(s,e+1));setSequences(prev=>({...prev,[selId]:parsed}));const items=parsed.map((em,i)=>({id:`${prospect.id}-camp-${i}-${Date.now()}`,prospectId:prospect.id,businessName:prospect.name,to:prospect.email||`owner@${prospect.name.toLowerCase().replace(/[^a-z]/g,"")}.com`,from:FROM_EMAIL,subject:em.subject,body:em.body,status:"queued",type:i===2?"proposal":"follow_up",trade:prospect.trade,city:prospect.city,pkg:pkg?.name,sendOnDay:em.day,createdAt:new Date().toISOString()}));setEmailQueue(prev=>[...prev.filter(e=>!e.id.startsWith(`${prospect.id}-camp-`)),...items]);setActiveIdx(0);}catch{}setGenSeq(false);}
  return(<div><div style={{...ib("success"),marginBottom:"1.5rem"}}><p style={{margin:0,fontSize:13,color:"var(--color-text-success)"}}><i className="ti ti-player-play" style={{marginRight:6}} aria-hidden="true"/>For prospects who replied with interest. Mark as "Interested" in Smart Finder first.</p></div>{interested.length===0?<div style={{padding:"2.5rem",textAlign:"center",border:"0.5px dashed var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)"}}><i className="ti ti-users" style={{fontSize:32,color:"var(--color-text-secondary)",display:"block",marginBottom:8}} aria-hidden="true"/><p style={{fontSize:14,color:"var(--color-text-secondary)",margin:0}}>No interested prospects yet. Find businesses → queue outreach → click "Mark Interested" when they reply.</p></div>:<><div style={{marginBottom:"1.25rem"}}><label style={lbl}>Select interested prospect</label><select value={selId} onChange={e=>{setSelId(e.target.value);setActiveIdx(0);}} style={{width:"100%",fontSize:13}}><option value="">— Choose —</option>{interested.map(p=><option key={p.id} value={p.id}>{p.name} · {p.trade} · {p.city}</option>)}</select></div>{prospect&&<><div style={{...card,padding:"12px 14px",marginBottom:"1.25rem"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><p style={{fontSize:14,fontWeight:500,margin:"0 0 3px"}}>{prospect.name}</p><p style={{fontSize:12,color:"var(--color-text-secondary)",margin:0}}>{prospect.trade} · {prospect.city} · Recommend: {recPkg(prospect)?.name}</p></div><Badge type="success">Interested ✓</Badge></div></div><button onClick={buildCampaign} disabled={genSeq} style={{width:"100%",padding:"10px",fontSize:14,fontWeight:500,cursor:genSeq?"not-allowed":"pointer",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-secondary)",background:genSeq?"var(--color-background-secondary)":"transparent",color:genSeq?"var(--color-text-secondary)":"var(--color-text-primary)",marginBottom:"1.25rem"}}>{genSeq?<><i className="ti ti-loader" style={{marginRight:8,animation:"spin 1s linear infinite"}} aria-hidden="true"/>Building...</>:<><i className="ti ti-sparkles" style={{marginRight:8}} aria-hidden="true"/>{seq?"Rebuild":"Build"} 4-email nurture campaign ↗</>}</button>{seq&&<div><div style={{...ib("success"),marginBottom:"1rem"}}><p style={{margin:0,fontSize:12,color:"var(--color-text-success)"}}><i className="ti ti-check" style={{marginRight:6}} aria-hidden="true"/>4 emails added to Email Queue. Export and run <code>node emailer.js send</code>.</p></div><div style={{display:"flex",gap:8,marginBottom:"1rem",flexWrap:"wrap"}}>{seq.map((_,i)=><button key={i} onClick={()=>setActiveIdx(i)} style={{...bs(activeIdx===i),fontSize:12}}>Day {seq[i].day} — Email {i+1}</button>)}</div>{seq[activeIdx]&&<div style={card}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><p style={{margin:0,fontSize:13,fontWeight:500}}>Subject: {seq[activeIdx].subject}</p><CopyBtn text={`Subject: ${seq[activeIdx].subject}\n\n${seq[activeIdx].body}`}/></div><pre style={{fontSize:13,lineHeight:1.7,margin:0,whiteSpace:"pre-wrap",fontFamily:"var(--font-sans)",color:"var(--color-text-primary)",background:"var(--color-background-secondary)",padding:"1rem",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-tertiary)"}}>{seq[activeIdx].body}</pre></div>}</div>}</>}</>}</div>);
}

// ── PROPOSAL BUILDER ──────────────────────────────────────────────
function ProposalBuilder({prospects,emailQueue,setEmailQueue}){
  const [f,setF]=useState({businessName:"",ownerName:"",trade:"HVAC",city:"",phone:"",to:"",issues:"",pkg:"dominator",startDate:"",yourName:"GoFieldWise Team",yourBiz:"GoFieldWise"});
  const [usePros,setUsePros]=useState("");const [proposal,setProposal]=useState("");const [generating,setGenerating]=useState(false);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));const pkg=PACKAGES.find(p=>p.id===f.pkg);
  function load(id){const p=prospects.find(x=>x.id===parseInt(id));if(!p)return;const rec=recPkg(p);setF(prev=>({...prev,businessName:p.name,trade:p.trade,city:p.city,phone:p.phone||"",pkg:rec?.id||"dominator",issues:`${p.weakness}. Status: ${p.seoStatus}. Google reviews: ${p.googleReviews||0} (${p.googleRating||"no"}★). Website: ${p.website||"none"}. Facebook: ${p.hasFacebook?"yes":"no"}. Yelp: ${p.hasYelp?"yes":"no"}.`}));setUsePros(id);}
  async function generate(){if(!f.businessName)return;setGenerating(true);setProposal("");try{const text=await callClaude(`Write a professional local SEO proposal from GoFieldWise. Plain text only, no markdown.\nClient: ${f.businessName}${f.ownerName?" ("+f.ownerName+")":""} | Trade: ${f.trade} | City: ${f.city}, OK\nPackage: ${pkg?.name} — ${pkg?.price?"$"+pkg.price+" setup + ":""}$${pkg?.monthly}/mo\nIssues found: ${f.issues}\nProposed start: ${f.startDate||"TBD"}\nSections: 1) Executive Summary (personalized to their real situation) 2) What We Found 3) Our Solution 4) 30/60/90 day milestones 5) Investment & terms 6) Why this works for ${f.trade} 7) Next steps\nClose: GoFieldWise Team | biz@gofieldwise.com | gofieldwise.com\nUnder 600 words. Professional but human.`);setProposal(text);if(f.to){setEmailQueue(prev=>[...prev,{id:`proposal-${Date.now()}`,prospectId:parseInt(usePros)||null,businessName:f.businessName,to:f.to,from:FROM_EMAIL,subject:`GoFieldWise SEO Proposal — ${f.businessName}`,body:text,status:"queued",type:"proposal",trade:f.trade,city:f.city,pkg:pkg?.name,createdAt:new Date().toISOString()}]);}}catch{}setGenerating(false);}
  const fld=(key,label,ph,type="text")=><div key={key}><label style={lbl}>{label}</label><input type={type} value={f[key]||""} onChange={e=>set(key,e.target.value)} placeholder={ph} style={{width:"100%",fontSize:13,boxSizing:"border-box"}}/></div>;
  return(<div>{prospects.filter(p=>p.interested||p.emailStatus==="responded").length>0&&<div style={{marginBottom:"1.25rem"}}><label style={lbl}>Load from interested prospect (auto-fills real data)</label><select value={usePros} onChange={e=>load(e.target.value)} style={{width:"100%",fontSize:13}}><option value="">— Choose —</option>{prospects.filter(p=>p.interested||p.emailStatus==="responded").map(p=><option key={p.id} value={p.id}>{p.name} · {p.trade} · {p.city}</option>)}</select></div>}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:"1rem"}}>{fld("businessName","Business name *","e.g. Superior Air Services")}{fld("ownerName","Owner name","e.g. John Smith")}{fld("to","Their email (adds to queue)","john@superiorair.com","email")}{fld("phone","Phone","(918) 555-0000")}{fld("city","City","e.g. Tulsa")}{fld("startDate","Start date","","date")}</div><div style={{marginBottom:"1rem"}}><label style={lbl}>Package</label><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>{PACKAGES.map(p=><div key={p.id} onClick={()=>set("pkg",p.id)} style={{border:f.pkg===p.id?"2px solid var(--color-border-info)":"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-md)",padding:"10px 12px",cursor:"pointer",background:f.pkg===p.id?"var(--color-background-info)":"transparent"}}><p style={{fontSize:12,fontWeight:500,margin:"0 0 2px",color:f.pkg===p.id?"var(--color-text-info)":"var(--color-text-primary)"}}>{p.name}</p><p style={{fontSize:11,color:"var(--color-text-secondary)",margin:"0 0 3px"}}>{p.desc}</p><p style={{fontSize:12,fontWeight:500,margin:0,color:f.pkg===p.id?"var(--color-text-info)":"var(--color-text-primary)"}}>{p.price?`$${p.price} + `:""}${p.monthly}/mo</p></div>)}</div></div><div style={{marginBottom:"1.25rem"}}><label style={lbl}>Audit notes / real findings</label><textarea value={f.issues} onChange={e=>set("issues",e.target.value)} placeholder="Auto-fills when you load a prospect above, or enter manually..." style={{width:"100%",height:80,fontSize:13,resize:"vertical",boxSizing:"border-box"}}/></div><button onClick={generate} disabled={generating||!f.businessName} style={{width:"100%",padding:"11px",fontSize:14,fontWeight:500,cursor:generating||!f.businessName?"not-allowed":"pointer",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-secondary)",background:generating||!f.businessName?"var(--color-background-secondary)":"transparent",color:generating||!f.businessName?"var(--color-text-secondary)":"var(--color-text-primary)",marginBottom:"1.25rem"}}>{generating?<><i className="ti ti-loader" style={{marginRight:8,animation:"spin 1s linear infinite"}} aria-hidden="true"/>Writing...</>:<><i className="ti ti-file-text" style={{marginRight:8}} aria-hidden="true"/>Generate Proposal{f.to?" + Add to Queue":""} ↗</>}</button>{proposal&&<div style={card}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}><p style={{margin:0,fontSize:13,fontWeight:500}}><i className="ti ti-file-check" style={{marginRight:6,color:"var(--color-text-success)"}} aria-hidden="true"/>Proposal — {f.businessName}</p><div style={{display:"flex",gap:6}}><CopyBtn text={proposal}/></div></div><pre style={{fontSize:13,lineHeight:1.8,margin:"0 0 1rem",whiteSpace:"pre-wrap",fontFamily:"var(--font-sans)",color:"var(--color-text-primary)",background:"var(--color-background-secondary)",padding:"1.25rem",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-tertiary)"}}>{proposal}</pre>{f.to&&<div style={ib("success")}><p style={{margin:0,fontSize:12,color:"var(--color-text-success)"}}><i className="ti ti-check" style={{marginRight:6}} aria-hidden="true"/>Added to Email Queue. Export → <code>node emailer.js send</code></p></div>}</div>}</div>);
}

// ── ONBOARDING ────────────────────────────────────────────────────
// ── ONBOARDING ACCESS ITEMS ───────────────────────────────────────
const ACCESS_ITEMS = [
  {
    id:"gsc", icon:"ti-brand-google", label:"Google Search Console",
    why:"This is how GoFieldWise sees your Google rankings, which pages are indexed, and how many people find you. Without this we're flying blind.",
    timeRequired:"5 minutes",
    clientHas:true,
    howToGet:"Go to search.google.com/search-console → Sign in with your Google account → click Settings (gear icon bottom left) → Users and permissions → Add User → enter biz@gofieldwise.com → set permission to Full → click Add.",
    ifNotSetup:"If you have never set up Google Search Console: go to search.google.com/search-console → click Start now → add your website URL → Google will give you a verification code → email it to biz@gofieldwise.com and we handle the rest.",
    doneForYou:"We set up Google Search Console for you, verify your website with Google, and configure all tracking — included in every package. All we need is your Google account email address so we can send you a sharing invite.",
    doneForYouNeed:"The Gmail or Google account email you use to sign into things like YouTube, Google Maps, or your Android phone. This is different from your business email — it usually ends in @gmail.com.",
    included:true,
    link:"https://search.google.com/search-console",
    linkLabel:"Open Google Search Console"
  },
  {
    id:"gbp", icon:"ti-map-pin", label:"Google Business Profile",
    why:"Your Google Business Profile is the listing that appears on Google Maps. It drives local calls. We need manager access to update your description, add photos, respond to reviews, and post weekly.",
    timeRequired:"3 minutes",
    clientHas:true,
    howToGet:"Go to business.google.com → sign in → click on your business → click the 3 dots menu (···) → Business Profile Settings → Managers → Invite new manager → enter biz@gofieldwise.com → set role to Manager → click Invite.",
    ifNotSetup:"If you do not have a Google Business Profile yet: go to business.google.com → click Manage now → add your business name → Google will ask you to verify by phone or postcard. Let us know and we will walk you through it.",
    doneForYou:"We create and fully optimize your Google Business Profile from scratch — included in every package. We write the description, add all services, upload photos, and set up weekly posting. Google will mail a postcard to your business address with a verification code (takes 5-7 days) — just read us that code when it arrives.",
    doneForYouNeed:"Your business name, address, phone number, and business hours. Plus the postcard verification code when it arrives in the mail.",
    included:true,
    link:"https://business.google.com",
    linkLabel:"Open Google Business Profile"
  },
  {
    id:"website", icon:"ti-world-www", label:"Website Backend Access",
    why:"To update your title tags, meta descriptions, page content, and add new service pages we need to log into your website backend.",
    timeRequired:"2 minutes",
    clientHas:true,
    howToGet:"Send us your website login credentials to biz@gofieldwise.com. Tell us your platform:\n• WordPress: yourdomain.com/wp-admin → username + password\n• Wix: add us as a Contributor at manage.wix.com → Roles & Permissions\n• Squarespace: Settings → Permissions → Invite Contributor\n• GoDaddy: My Products → Websites → Share Access\n• Custom/Other: email us and we'll tell you exactly what we need",
    ifNotSetup:"Not sure what platform your site uses? Right-click your website → View Page Source → look for 'wp-content' (WordPress), 'wixstatic' (Wix), or 'squarespace' (Squarespace). Screenshot it and send to biz@gofieldwise.com.",
    doneForYou:"If you don't have a website yet — we build it for you. New website starts at $497 one-time + $197/month. If you have a site already and just need the SEO fixes applied, send us your login and we log in and make every change ourselves. No technical knowledge required on your end.",
    doneForYouNeed:"No website: just say the word and we start building. Existing site: email your login to biz@gofieldwise.com.",
    included:false,
    includeNote:"Website build: $497 one-time. SEO fixes on existing site: included in Local Dominator & Market Leader.",
    link:"",
    linkLabel:""
  },
  {
    id:"ga", icon:"ti-chart-bar", label:"Google Analytics 4",
    why:"Google Analytics shows us how many people visit your site, where they come from, and which pages they land on. We use this to measure whether the SEO work is bringing in more traffic month over month.",
    timeRequired:"5 minutes",
    clientHas:true,
    howToGet:"Go to analytics.google.com → click the gear icon (Admin, bottom left) → Account Access Management → click the + button → enter biz@gofieldwise.com → set role to Editor → click Add.",
    ifNotSetup:"If you do not have Google Analytics: go to analytics.google.com → click Start measuring → follow the setup wizard. Or just email biz@gofieldwise.com and we will set it up for you as part of onboarding.",
    doneForYou:"We set up Google Analytics 4 on your website, connect it to Google Search Console, and configure conversion tracking so you can see exactly how many phone calls and form fills come from Google — included in every package. All we need is your Google account email.",
    doneForYouNeed:"The Gmail or Google account email you use to sign into Google — not your business email. It usually ends in @gmail.com. Also need access to your website backend to install the tracking code.",
    included:true,
    link:"https://analytics.google.com",
    linkLabel:"Open Google Analytics"
  },
  {
    id:"photos", icon:"ti-camera", label:"Business Photos",
    why:"Google ranks businesses higher when their profile has 10+ real photos. Photos of your team, truck, job sites, and before/afters build trust and improve Maps visibility.",
    timeRequired:"15 minutes",
    clientHas:false,
    howToGet:"Send 10-15 photos to biz@gofieldwise.com via email, text, or Google Drive. Best photos to send:\n• Your team or yourself in uniform\n• Your truck or van with logo\n• A job in progress\n• Before and after shots\n• Your service area or completed work\nPhone photos are perfectly fine — no professional shoot needed.",
    ifNotSetup:"No photos yet? That is okay. Text us at least 3 photos of anything work-related and we will start with those.",
    doneForYou:"No photos? No problem. We generate professional AI imagery for your trade — branded to your colors, showing realistic job sites, team photos, and service trucks. These go on your website and GBP immediately so you don't have to wait. Included in every package. Real photos from you can always be added later as you take them.",
    doneForYouNeed:"Nothing — we generate everything. Just tell us your brand colors if you have them (optional).",
    included:true,
    link:"",
    linkLabel:""
  },
  {
    id:"bizinfo", icon:"ti-id-badge", label:"Business Information",
    why:"We need your exact business details to make sure your name, address, and phone number match perfectly across Google, Yelp, BBB, and 50+ directories. Inconsistent info hurts your local rankings.",
    timeRequired:"5 minutes",
    clientHas:false,
    howToGet:"Email biz@gofieldwise.com with:\n• Legal business name (exactly as registered)\n• Service address or city you serve (no P.O. Box)\n• Primary phone number (the one on your truck/signs)\n• Business hours (including holidays/emergency)\n• List of all services you offer\n• Year you started the business\n• License number (if applicable in your trade)",
    ifNotSetup:"",
    doneForYou:"We research and pre-fill as much as we can from your existing online presence — Google, Yelp, Facebook. We'll send you a simple one-page form with what we found and ask you to confirm or correct it. Takes 5 minutes to review, zero minutes to fill out from scratch.",
    doneForYouNeed:"Just review and approve the form we send you. Reply with any corrections.",
    included:true,
    link:"",
    linkLabel:""
  },
];

const OB=[
  {phase:"Day 1 — Send us access",icon:"ti-key",tasks:[
    {id:"gsc",l:"Add GoFieldWise to Google Search Console",d:"search.google.com/search-console → Settings → Users and permissions → Add User → biz@gofieldwise.com → Full access → Add."},
    {id:"gbp",l:"Add GoFieldWise to Google Business Profile",d:"business.google.com → your business → ··· → Business Profile Settings → Managers → Invite → biz@gofieldwise.com → Manager role → Invite."},
    {id:"ga",l:"Add GoFieldWise to Google Analytics",d:"analytics.google.com → Admin (gear) → Account Access Management → + → biz@gofieldwise.com → Editor → Add."},
    {id:"web",l:"Send website login to biz@gofieldwise.com",d:"WordPress: yourdomain.com/wp-admin + password. Wix/Squarespace: invite as Contributor. Other: email us and we'll tell you what we need."},
    {id:"photos",l:"Send 10+ photos to biz@gofieldwise.com",d:"Team, truck, job sites, before/afters. Phone photos are fine. Text or email to biz@gofieldwise.com."},
    {id:"bizinfo",l:"Email your business info",d:"Legal name, phone, address, hours, services list, year started. Email to biz@gofieldwise.com."},
  ]},
  {phase:"Week 1 — We do this for you",icon:"ti-wand",tasks:[
    {id:"audit",l:"Full site audit completed",d:"We check indexed pages, title tags, H1s, meta descriptions, page speed, and backlinks."},
    {id:"titles",l:"Title tags and meta descriptions rewritten",d:"Every page gets optimized copy with your city + trade + primary keyword. Under 60 chars."},
    {id:"h1",l:"H1 headings fixed",d:"One H1 per page with primary keyword and city. Google uses this to understand what each page is about."},
    {id:"schema",l:"LocalBusiness schema added",d:"JSON-LD code that tells Google your name, address, phone, hours, and services. Helps Maps rankings."},
    {id:"sitemap",l:"Sitemap submitted to Google",d:"We submit your sitemap.xml and request indexing for all key pages in Google Search Console."},
  ]},
  {phase:"Week 2 — Google Business Profile",icon:"ti-map-pin",tasks:[
    {id:"gbpdesc",l:"GBP description rewritten",d:"200-750 chars with your primary keywords, city, and what makes you different. Published to your GBP."},
    {id:"gbpphotos",l:"Photos uploaded to GBP",d:"We upload all photos you sent, properly categorized. Goal: 15+ photos on profile."},
    {id:"gbpservices",l:"Services list added to GBP",d:"Every service you offer gets its own entry with description. Google matches these to search queries."},
    {id:"gbppost1",l:"First Google Post published",d:"Weekly posting starts. Tip, offer, or job showcase. Keeps your profile active in Google's eyes."},
    {id:"reviews",l:"Review request script delivered",d:"We send you a simple text message script to send to happy customers. Goal: 2+ new reviews per month."},
  ]},
  {phase:"Week 3-4 — Authority building",icon:"ti-award",tasks:[
    {id:"yelp",l:"Yelp profile claimed and optimized",d:"Claim at biz.yelp.com. Same NAP as Google. Add all services and 5+ photos."},
    {id:"bbb",l:"BBB listing submitted",d:"bbb.org/business → submit your business. Free listing adds credibility and a backlink."},
    {id:"angi",l:"Angi listing claimed",d:"pro.angi.com → claim your profile. Angi ranks well in local search and passes link authority."},
    {id:"apple",l:"Apple Maps listing claimed",d:"mapsconnect.apple.com → claim your business. iPhone users see Apple Maps by default."},
    {id:"bing",l:"Bing Places listing set up",d:"bingplaces.com → import from Google Business Profile. 5-minute setup."},
    {id:"report",l:"Monthly reporting dashboard set up",d:"We set up your GSC Dashboard in the Growth Engine. You will receive a report on the 1st of each month."},
    {id:"call",l:"30-day check-in call scheduled",d:"15-30 minute call to review early wins, answer questions, and plan month 2."},
  ]},
];

function Onboarding(){
  const [view,setView]=useState("checklist");
  const [cname,setCname]=useState("");
  const [clientEmail,setClientEmail]=useState("");
  const [clientGoogleEmail,setClientGoogleEmail]=useState("");
  const [clientTrade,setClientTrade]=useState("HVAC");
  const [clientPkg,setClientPkg]=useState("dominator");
  const [checked,setChecked]=useState({});
  const [expanded,setExpanded]=useState({});
  const [saved,setSaved]=useState({});
  const [active,setActive]=useState("");
  const [expandedAccess,setExpandedAccess]=useState(null);
  const [accessMode,setAccessMode]=useState({});
  const [genEmail,setGenEmail]=useState(false);
  const [onboardEmail,setOnboardEmail]=useState("");
  const [copiedEmail,setCopiedEmail]=useState(false);

  useEffect(()=>{(async()=>{try{const r=await window.storage.get("gfw_onboarding_v2");if(r?.value){const d=JSON.parse(r.value);setSaved(d);}}catch{}})();},[]);

  function saveData(name,data){
    const u={...saved,[name]:{checks:data,email:clientEmail,trade:clientTrade,pkg:clientPkg}};
    setSaved(u);
    window.storage?.set("gfw_onboarding_v2",JSON.stringify(u)).catch(()=>{});
  }
  function load(n){
    setActive(n);setCname(n);
    const d=saved[n];
    if(d){setChecked(d.checks||{});setClientEmail(d.email||"");setClientTrade(d.trade||"HVAC");setClientPkg(d.pkg||"dominator");}
  }
  function toggle(id){const u={...checked,[id]:!checked[id]};setChecked(u);if(active)saveData(active,u);}
  function startNew(){if(!cname.trim())return;setActive(cname);setChecked({});saveData(cname,{});}

  async function generateOnboardEmail(){
    setGenEmail(true);setOnboardEmail("");
    const pkg=PACKAGES.find(p=>p.id===clientPkg);
    try{
      const txt=await callClaude(
        `Write a friendly, clear onboarding welcome email from GoFieldWise to a new client.\n\n`+
        `Client: ${active||cname}\nTrade: ${clientTrade}\nPackage: ${pkg?.name} — ${pkg?.monthly}/month\n\n`+
        `The email must:\n`+
        `1. Welcome them warmly and confirm their package\n`+
        `2. Tell them we need 6 things from them to get started (list them clearly with exactly what to do):\n`+
        `   a) Their Google account email — IMPORTANT: make clear this is NOT their business email. This is the Gmail or Google address they use to sign into things like YouTube, Google Maps, or their Android phone. It usually ends in @gmail.com. We need this to connect their Google Search Console and get their business showing up on Google. Do not assume the email we are writing to is the right one.\n`+
        `   b) Google Business Profile — invite biz@gofieldwise.com as Manager at business.google.com → ··· → Business Profile Settings → Managers. If they don't have one yet, just let us know and we set it up.\n`+
        `   c) Website login — email their username + password for their website backend to biz@gofieldwise.com. Tell them this is just so we can update their pages to rank higher — we don't change anything without telling them first.\n`+
        `   d) 10+ photos — text or email photos of their team, truck, job sites, before/afters to biz@gofieldwise.com. Phone photos are perfect.\n`+
        `   e) Business info — their legal business name, phone number, address, hours, and list of services. Just reply to this email with it.\n`+
        `   f) Google Analytics — if they have it, add biz@gofieldwise.com as Editor at analytics.google.com → Admin → Account Access Management. If they don't have it, we set it up for free.\n`+
        `3. Tell them what WE will do once we have access (audit, fix title tags, set up GBP, build citations)\n`+
        `4. Set a clear timeline: once they send access → we start within 24 hours → they see first results in 30 days\n`+
        `5. Tell them to reply to this email with any questions — and that they can just hit reply to send us anything from the list above\n\n`+
        `Tone: warm, confident, plain English. Write like a real person, not a corporation. No jargon.\n`+
        `Sign off: Erick | GoFieldWise | biz@gofieldwise.com | gofieldwise.com\n`+
        `Under 400 words. Plain text only.`
      );
      setOnboardEmail(txt.trim());
    }catch(e){console.error(e);}
    setGenEmail(false);
  }

  const total=OB.flatMap(p=>p.tasks).length;
  const done=Object.values(checked).filter(Boolean).length;
  const pct=Math.round((done/total)*100);

  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:"1.5rem",flexWrap:"wrap",alignItems:"center"}}>
        {[["checklist","Onboarding Checklist","ti-checklist"],["access","What Client Needs to Provide","ti-key"],["email","Welcome Email","ti-mail"]].map(([id,label,icon])=>(
          <button key={id} onClick={()=>setView(id)} style={{...bs(view===id),fontSize:12}}>
            <i className={`ti ${icon}`} style={{marginRight:5,fontSize:12}} aria-hidden="true"/>{label}
          </button>
        ))}
      </div>

      {/* ── WHAT CLIENT NEEDS TO PROVIDE ── */}
      {view==="access"&&(
        <div>
          <div style={{...ib("info"),marginBottom:"1.5rem"}}>
            <p style={{margin:"0 0 4px",fontSize:13,fontWeight:500,color:"var(--color-text-info)"}}>
              <i className="ti ti-key" style={{marginRight:6}} aria-hidden="true"/>
              Send this tab to clients or use it to walk them through setup on a call
            </p>
            <p style={{margin:0,fontSize:12,color:"var(--color-text-info)"}}>
              6 things we need from every client. Each one has exact step-by-step instructions so they never get stuck.
            </p>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {ACCESS_ITEMS.map((item,i)=>{
              const isOpen=expandedAccess===item.id;
              const dfy=!!accessMode[item.id];
              return(
                <div key={item.id} style={{border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",overflow:"hidden"}}>
                  {/* Header */}
                  <div style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",background:isOpen?"var(--color-background-secondary)":"transparent"}} onClick={()=>setExpandedAccess(isOpen?null:item.id)}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:"var(--color-background-info)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <i className={`ti ${item.icon}`} style={{fontSize:16,color:"var(--color-text-info)"}} aria-hidden="true"/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2,flexWrap:"wrap"}}>
                        <span style={{fontSize:13,fontWeight:500}}>{i+1}. {item.label}</span>
                        <Badge type="secondary">⏱ {item.timeRequired}</Badge>
                        {item.clientHas&&<Badge type="info">Client usually has this</Badge>}
                        {!item.clientHas&&<Badge type="warning">Client needs to gather this</Badge>}
                        {item.included&&<Badge type="success">✓ Included</Badge>}
                      </div>
                      <p style={{fontSize:12,color:"var(--color-text-secondary)",margin:0}}>{item.why}</p>
                    </div>
                    <i className={`ti ti-chevron-${isOpen?"up":"down"}`} style={{fontSize:14,color:"var(--color-text-secondary)",flexShrink:0}} aria-hidden="true"/>
                  </div>

                  {/* Expanded */}
                  {isOpen&&(
                    <div style={{padding:"16px",borderTop:"0.5px solid var(--color-border-tertiary)"}}>

                      {/* Toggle: DIY vs Done For You */}
                      <div style={{display:"flex",gap:0,marginBottom:"1rem",borderRadius:"var(--border-radius-md)",overflow:"hidden",border:"0.5px solid var(--color-border-tertiary)"}}>
                        <button onClick={()=>setAccessMode(prev=>({...prev,[item.id]:false}))} style={{flex:1,padding:"8px",fontSize:12,fontWeight:500,cursor:"pointer",border:"none",background:!dfy?"var(--color-background-info)":"var(--color-background-secondary)",color:!dfy?"var(--color-text-info)":"var(--color-text-secondary)"}}>
                          <i className="ti ti-user" style={{marginRight:5,fontSize:12}} aria-hidden="true"/>Client does it (quick)
                        </button>
                        <button onClick={()=>setAccessMode(prev=>({...prev,[item.id]:true}))} style={{flex:1,padding:"8px",fontSize:12,fontWeight:500,cursor:"pointer",border:"none",borderLeft:"0.5px solid var(--color-border-tertiary)",background:dfy?"var(--color-background-success)":"var(--color-background-secondary)",color:dfy?"var(--color-text-success)":"var(--color-text-secondary)"}}>
                          <i className="ti ti-rocket" style={{marginRight:5,fontSize:12}} aria-hidden="true"/>We do it for them
                        </button>
                      </div>

                      {!dfy?(
                        <>
                          <p style={{fontSize:11,fontWeight:700,color:"var(--color-text-secondary)",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:".05em"}}>Exact steps for the client:</p>
                          <div style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"12px 14px",marginBottom:"1rem",border:"0.5px solid var(--color-border-tertiary)"}}>
                            <pre style={{fontSize:12,lineHeight:1.8,margin:0,whiteSpace:"pre-wrap",fontFamily:"var(--font-sans)",color:"var(--color-text-primary)"}}>{item.howToGet}</pre>
                          </div>
                          {item.ifNotSetup&&(
                            <div style={{...ib("warning"),marginBottom:"1rem"}}>
                              <p style={{margin:"0 0 4px",fontSize:11,fontWeight:600,color:"var(--color-text-warning)",textTransform:"uppercase",letterSpacing:".04em"}}>Don't have this yet?</p>
                              <p style={{margin:0,fontSize:12,color:"var(--color-text-warning)",lineHeight:1.6}}>{item.ifNotSetup}</p>
                            </div>
                          )}
                          {item.link&&(
                            <a href={item.link} target="_blank" rel="noopener noreferrer"
                              style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:"var(--border-radius-md)",background:"var(--color-background-info)",border:"0.5px solid var(--color-border-info)",color:"var(--color-text-info)",textDecoration:"none",fontSize:12,fontWeight:500}}>
                              <i className="ti ti-external-link" style={{fontSize:12}} aria-hidden="true"/>{item.linkLabel}
                            </a>
                          )}
                        </>
                      ):(
                        <>
                          <div style={{...ib("success"),marginBottom:"1rem"}}>
                            <p style={{margin:"0 0 6px",fontSize:12,fontWeight:600,color:"var(--color-text-success)"}}>
                              <i className="ti ti-rocket" style={{marginRight:6}} aria-hidden="true"/>
                              What GoFieldWise does:
                            </p>
                            <p style={{margin:0,fontSize:12,color:"var(--color-text-success)",lineHeight:1.7}}>{item.doneForYou}</p>
                          </div>
                          <div style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"12px 14px",border:"0.5px solid var(--color-border-tertiary)",marginBottom:"1rem"}}>
                            <p style={{fontSize:11,fontWeight:700,color:"var(--color-text-secondary)",margin:"0 0 6px",textTransform:"uppercase",letterSpacing:".04em"}}>All we need from the client:</p>
                            <p style={{fontSize:13,color:"var(--color-text-primary)",margin:0,lineHeight:1.7}}>{item.doneForYouNeed}</p>
                          </div>
                          {item.includeNote&&(
                            <div style={{...ib("warning")}}>
                              <p style={{margin:0,fontSize:12,color:"var(--color-text-warning)"}}>
                                <i className="ti ti-info-circle" style={{marginRight:6}} aria-hidden="true"/>
                                {item.includeNote}
                              </p>
                            </div>
                          )}
                          {item.included&&!item.includeNote&&(
                            <div style={{...ib("success")}}>
                              <p style={{margin:0,fontSize:12,color:"var(--color-text-success)"}}>
                                <i className="ti ti-circle-check" style={{marginRight:6}} aria-hidden="true"/>
                                Included in all GoFieldWise packages — no extra charge.
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{...ib("success"),marginTop:"1.25rem"}}>
            <p style={{margin:"0 0 4px",fontSize:12,fontWeight:500,color:"var(--color-text-success)"}}>
              <i className="ti ti-clock" style={{marginRight:6}} aria-hidden="true"/>Total time for the client: under 30 minutes
            </p>
            <p style={{margin:0,fontSize:12,color:"var(--color-text-success)"}}>
              Once we have all 6 items we start the same day. Most clients complete this within 48 hours of signing.
              Switch to the Welcome Email tab to generate a ready-to-send email that walks them through all of this automatically.
            </p>
          </div>
        </div>
      )}

      {/* ── WELCOME EMAIL ── */}
      {view==="email"&&(
        <div>
          <div style={{...ib("info"),marginBottom:"1.25rem"}}>
            <p style={{margin:0,fontSize:12,color:"var(--color-text-info)"}}>
              <i className="ti ti-mail" style={{marginRight:6}} aria-hidden="true"/>
              AI writes the complete welcome email with exact step-by-step instructions for every access item. Send this the same day they sign.
            </p>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:"1rem"}}>
            <div><label style={lbl}>Client / business name</label><input value={active||cname} onChange={e=>setCname(e.target.value)} placeholder="e.g. Smith's HVAC" style={{width:"100%",fontSize:13,boxSizing:"border-box"}}/></div>
            <div><label style={lbl}>Business email</label><input value={clientEmail} onChange={e=>setClientEmail(e.target.value)} placeholder="info@smithsplumbing.com" style={{width:"100%",fontSize:13,boxSizing:"border-box"}}/></div>
            <div><label style={lbl}>Personal email</label><input value={clientGoogleEmail||""} onChange={e=>setClientGoogleEmail(e.target.value)} placeholder="johnsmith@gmail.com" style={{width:"100%",fontSize:13,boxSizing:"border-box"}}/></div>
            <div><label style={lbl}>Trade</label><select value={clientTrade} onChange={e=>setClientTrade(e.target.value)} style={{width:"100%",fontSize:13}}>{TRADES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div><label style={lbl}>Package</label><select value={clientPkg} onChange={e=>setClientPkg(e.target.value)} style={{width:"100%",fontSize:13}}>
              {PACKAGES.map(p=><option key={p.id} value={p.id}>{p.name} — ${p.monthly}/mo</option>)}
            </select></div>
          </div>

          <button onClick={generateOnboardEmail} disabled={genEmail||!(active||cname)} style={{width:"100%",padding:"11px",fontSize:14,fontWeight:500,cursor:genEmail||!(active||cname)?"not-allowed":"pointer",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-secondary)",background:genEmail||!(active||cname)?"var(--color-background-secondary)":"transparent",color:genEmail||!(active||cname)?"var(--color-text-secondary)":"var(--color-text-primary)",marginBottom:"1.25rem"}}>
            {genEmail?<><i className="ti ti-loader" style={{marginRight:8,animation:"spin 1s linear infinite"}} aria-hidden="true"/>Writing welcome email...</>:<><i className="ti ti-mail" style={{marginRight:8}} aria-hidden="true"/>Generate Client Welcome Email ↗</>}
          </button>

          {onboardEmail&&(
            <div style={card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
                <div>
                  <p style={{fontSize:13,fontWeight:500,margin:"0 0 2px"}}>Welcome email — {active||cname}</p>
                  <p style={{fontSize:11,color:"var(--color-text-secondary)",margin:0}}>To: {clientEmail||"client email"} · From: biz@gofieldwise.com</p>
                </div>
                <button onClick={()=>{navigator.clipboard?.writeText(onboardEmail);setCopiedEmail(true);setTimeout(()=>setCopiedEmail(false),1800);}} style={{padding:"5px 12px",fontSize:11,cursor:"pointer",borderRadius:6,border:"0.5px solid var(--color-border-tertiary)",background:copiedEmail?"var(--color-background-success)":"transparent",color:copiedEmail?"var(--color-text-success)":"var(--color-text-secondary)"}}>
                  <i className={`ti ti-${copiedEmail?"check":"copy"}`} style={{marginRight:4}} aria-hidden="true"/>{copiedEmail?"Copied!":"Copy email"}
                </button>
              </div>
              <pre style={{fontSize:12,lineHeight:1.8,margin:"0 0 1rem",whiteSpace:"pre-wrap",fontFamily:"var(--font-sans)",color:"var(--color-text-primary)",background:"var(--color-background-secondary)",padding:"14px 16px",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-tertiary)"}}>{onboardEmail}</pre>
              <div style={{...ib("success")}}>
                <p style={{margin:0,fontSize:12,color:"var(--color-text-success)"}}>
                  <i className="ti ti-send" style={{marginRight:6}} aria-hidden="true"/>
                  Copy → open your email → paste → send from biz@gofieldwise.com. Or add to Email Queue and send from the dashboard.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CHECKLIST ── */}
      {view==="checklist"&&(
        <div>
          {Object.keys(saved).length>0&&(
            <div style={{marginBottom:"1rem"}}>
              <label style={lbl}>Load existing client</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {Object.keys(saved).map(n=><button key={n} onClick={()=>load(n)} style={{...bs(active===n),fontSize:11}}>{n}</button>)}
              </div>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:"1rem"}}>
            <div><label style={lbl}>Client / business name</label><input value={cname} onChange={e=>setCname(e.target.value)} placeholder="e.g. Smith's HVAC" style={{width:"100%",fontSize:13,boxSizing:"border-box"}}/></div>
            <div style={{display:"flex",alignItems:"flex-end",gap:8}}>
              <button onClick={startNew} style={{padding:"8px 16px",fontSize:13,cursor:"pointer",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-secondary)",background:"transparent",color:"var(--color-text-primary)"}}>Start checklist</button>
              <button onClick={()=>{setView("email");}} style={{padding:"8px 16px",fontSize:13,cursor:"pointer",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-info)",background:"var(--color-background-info)",color:"var(--color-text-info)"}}>
                <i className="ti ti-mail" style={{marginRight:6}} aria-hidden="true"/>Generate welcome email
              </button>
            </div>
          </div>

          {active&&(
            <>
              <div style={{marginBottom:"1.5rem"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:13,fontWeight:500}}>{active}</span>
                  <span style={{fontSize:13,fontWeight:500,color:pct===100?"var(--color-text-success)":"var(--color-text-secondary)"}}>{pct}% complete</span>
                </div>
                <div style={{height:6,background:"var(--color-background-secondary)",borderRadius:3}}>
                  <div style={{height:"100%",width:`${pct}%`,background:pct===100?"var(--color-border-success)":"var(--color-border-info)",borderRadius:3,transition:"width .3s"}}/>
                </div>
                <p style={{fontSize:12,color:"var(--color-text-secondary)",margin:"6px 0 0"}}>{done}/{total} tasks complete</p>
              </div>

              {OB.map((ph,pi)=>(
                <div key={pi} style={{marginBottom:"1rem",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",overflow:"hidden"}}>
                  <div style={{padding:"10px 16px",background:"var(--color-background-secondary)",borderBottom:"0.5px solid var(--color-border-tertiary)",display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:13,fontWeight:500}}><i className={`ti ${ph.icon}`} style={{marginRight:8}} aria-hidden="true"/>{ph.phase}</span>
                    <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>{ph.tasks.filter(t=>checked[t.id]).length}/{ph.tasks.length}</span>
                  </div>
                  {ph.tasks.map((task,ti)=>(
                    <div key={task.id} style={{borderBottom:ti<ph.tasks.length-1?"0.5px solid var(--color-border-tertiary)":"none"}}>
                      <div style={{padding:"11px 16px",display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer"}} onClick={()=>toggle(task.id)}>
                        <div style={{width:18,height:18,borderRadius:4,border:checked[task.id]?"none":"1.5px solid var(--color-border-secondary)",background:checked[task.id]?"var(--color-background-success)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                          {checked[task.id]&&<i className="ti ti-check" style={{fontSize:12,color:"var(--color-text-success)"}} aria-hidden="true"/>}
                        </div>
                        <span style={{flex:1,fontSize:13,fontWeight:500,textDecoration:checked[task.id]?"line-through":"none",color:checked[task.id]?"var(--color-text-secondary)":"var(--color-text-primary)"}}>{task.l}</span>
                        <button onClick={e=>{e.stopPropagation();setExpanded(p=>({...p,[task.id]:!p[task.id]}));}} style={{padding:"2px 6px",fontSize:11,cursor:"pointer",borderRadius:6,border:"0.5px solid var(--color-border-tertiary)",background:"transparent",color:"var(--color-text-secondary)",flexShrink:0}}>
                          <i className={`ti ti-chevron-${expanded[task.id]?"up":"down"}`} style={{fontSize:12}} aria-hidden="true"/>
                        </button>
                      </div>
                      {expanded[task.id]&&(
                        <div style={{padding:"0 16px 12px 46px"}}>
                          <p style={{fontSize:12,color:"var(--color-text-secondary)",margin:0,lineHeight:1.6}}>{task.d}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {pct===100&&(
                <div style={ib("success")}>
                  <p style={{margin:0,fontSize:13,fontWeight:500,color:"var(--color-text-success)"}}>
                    <i className="ti ti-circle-check" style={{marginRight:8}} aria-hidden="true"/>
                    Onboarding complete for {active}! Add them to the GSC Dashboard to start monthly tracking.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── INVOICE ───────────────────────────────────────────────────────
function Invoice(){const today=new Date().toISOString().split("T")[0];const due=new Date(Date.now()+14*86400000).toISOString().split("T")[0];const [f,setF]=useState({yourBiz:"GoFieldWise",yourEmail:FROM_EMAIL,clientBiz:"",clientName:"",clientEmail:"",num:"INV-001",issued:today,due,pkg:"dominator",notes:"Payment due within 14 days. Thank you for your business!"});const [items,setItems]=useState([{desc:"Local Dominator — Monthly SEO Service",qty:1,rate:397}]);const [prev,setPrev]=useState(false);const set=(k,v)=>setF(p=>({...p,[k]:v}));const sub=items.reduce((s,i)=>s+(parseFloat(i.qty)||0)*(parseFloat(i.rate)||0),0);function loadPkg(id){const p=PACKAGES.find(x=>x.id===id);if(!p)return;set("pkg",id);setItems([{desc:`${p.name} — Monthly SEO Service`,qty:1,rate:p.monthly}]);}
const txt=`INVOICE — ${f.yourBiz}\n${f.yourEmail}\n\nInvoice #: ${f.num}\nIssued: ${f.issued} | Due: ${f.due}\n\nBill to: ${f.clientBiz}\n${f.clientName} | ${f.clientEmail}\n\n`+items.map(i=>`${i.desc}  ×${i.qty}  $${parseFloat(i.rate||0).toFixed(2)}  = $${((parseFloat(i.qty)||0)*(parseFloat(i.rate)||0)).toFixed(2)}`).join("\n")+`\n\nTotal Due: $${sub.toFixed(2)}\n\n${f.notes}`;
return(<div><div style={{display:"flex",gap:8,marginBottom:"1.5rem"}}><button onClick={()=>setPrev(false)} style={bs(!prev)}>Edit</button><button onClick={()=>setPrev(true)} style={bs(prev)}>Preview & copy</button></div>{!prev?<div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:"1rem"}}>{[["yourBiz","Your business","GoFieldWise"],["yourEmail","Your email",FROM_EMAIL],["clientBiz","Client business","Superior Air Services"],["clientName","Client name","John Smith"],["clientEmail","Client email","john@superiorair.com"],["num","Invoice #","INV-001"]].map(([k,l,ph])=><div key={k}><label style={lbl}>{l}</label><input value={f[k]||""} onChange={e=>set(k,e.target.value)} placeholder={ph} style={{width:"100%",fontSize:13,boxSizing:"border-box"}}/></div>)}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:"1rem"}}><div><label style={lbl}>Issued</label><input type="date" value={f.issued} onChange={e=>set("issued",e.target.value)} style={{width:"100%",fontSize:13,boxSizing:"border-box"}}/></div><div><label style={lbl}>Due date</label><input type="date" value={f.due} onChange={e=>set("due",e.target.value)} style={{width:"100%",fontSize:13,boxSizing:"border-box"}}/></div></div><div style={{marginBottom:"1rem"}}><label style={lbl}>Package</label><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>{PACKAGES.map(p=><div key={p.id} onClick={()=>loadPkg(p.id)} style={{border:f.pkg===p.id?"2px solid var(--color-border-info)":"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-md)",padding:"10px 12px",cursor:"pointer",background:f.pkg===p.id?"var(--color-background-info)":"transparent"}}><p style={{fontSize:12,fontWeight:500,margin:"0 0 2px",color:f.pkg===p.id?"var(--color-text-info)":"var(--color-text-primary)"}}>{p.name}</p><p style={{fontSize:12,margin:0,color:"var(--color-text-secondary)"}}>${p.monthly}/mo</p></div>)}</div></div><div style={{marginBottom:"1rem"}}><label style={lbl}>Line items</label><div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:8}}>{items.map((item,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 56px 76px 28px",gap:8}}><input value={item.desc} onChange={e=>setItems(p=>p.map((x,idx)=>idx===i?{...x,desc:e.target.value}:x))} style={{fontSize:12,boxSizing:"border-box"}}/><input type="number" value={item.qty} onChange={e=>setItems(p=>p.map((x,idx)=>idx===i?{...x,qty:e.target.value}:x))} style={{fontSize:12,textAlign:"center"}}/><input type="number" value={item.rate} onChange={e=>setItems(p=>p.map((x,idx)=>idx===i?{...x,rate:e.target.value}:x))} style={{fontSize:12,textAlign:"right"}}/><button onClick={()=>setItems(p=>p.filter((_,idx)=>idx!==i))} style={{cursor:"pointer",borderRadius:6,border:"0.5px solid var(--color-border-tertiary)",background:"transparent",color:"var(--color-text-secondary)",padding:"3px"}}><i className="ti ti-x" style={{fontSize:12}} aria-hidden="true"/></button></div>)}</div><button onClick={()=>setItems(p=>[...p,{desc:"",qty:1,rate:0}])} style={{fontSize:12,cursor:"pointer",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-tertiary)",background:"transparent",color:"var(--color-text-secondary)",padding:"5px 12px"}}><i className="ti ti-plus" style={{marginRight:4}}/>Add line item</button></div><div style={{display:"flex",justifyContent:"flex-end",marginBottom:"1rem"}}><div style={{width:200,background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"12px 14px"}}><div style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{fontSize:13,color:"var(--color-text-secondary)"}}>Subtotal</span><span style={{fontSize:13}}>${sub.toFixed(2)}</span></div><div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderTop:"0.5px solid var(--color-border-tertiary)",marginTop:4}}><span style={{fontSize:14,fontWeight:500}}>Total Due</span><span style={{fontSize:14,fontWeight:500}}>${sub.toFixed(2)}</span></div></div></div><div><label style={lbl}>Payment notes</label><textarea value={f.notes} onChange={e=>set("notes",e.target.value)} style={{width:"100%",height:56,fontSize:12,resize:"vertical",boxSizing:"border-box"}}/></div></div>:<div style={card}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"1.5rem"}}><div><p style={{fontSize:18,fontWeight:500,margin:"0 0 3px"}}>{f.yourBiz}</p><p style={{fontSize:12,color:"var(--color-text-secondary)",margin:0}}>{f.yourEmail}</p></div><div style={{textAlign:"right"}}><p style={{fontSize:14,fontWeight:500,margin:"0 0 2px"}}>Invoice #{f.num}</p><p style={{fontSize:12,color:"var(--color-text-secondary)",margin:"0 0 1px"}}>Issued: {f.issued}</p><p style={{fontSize:12,color:"var(--color-text-danger)",fontWeight:500,margin:0}}>Due: {f.due}</p></div></div><div style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"10px 12px",marginBottom:"1.25rem"}}><p style={{fontSize:11,color:"var(--color-text-secondary)",margin:"0 0 4px",textTransform:"uppercase",letterSpacing:".04em"}}>Bill to</p><p style={{fontSize:14,fontWeight:500,margin:"0 0 2px"}}>{f.clientBiz}</p><p style={{fontSize:12,color:"var(--color-text-secondary)",margin:0}}>{f.clientName} · {f.clientEmail}</p></div><div style={{border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-md)",overflow:"hidden",marginBottom:"1.25rem"}}><div style={{display:"grid",gridTemplateColumns:"1fr 50px 70px 80px",padding:"8px 12px",background:"var(--color-background-secondary)",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>{["Description","Qty","Rate","Amount"].map(h=><span key={h} style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)",textTransform:"uppercase",letterSpacing:".04em"}}>{h}</span>)}</div>{items.map((item,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 50px 70px 80px",padding:"10px 12px",borderBottom:i<items.length-1?"0.5px solid var(--color-border-tertiary)":"none"}}><span style={{fontSize:13}}>{item.desc}</span><span style={{fontSize:13,textAlign:"center"}}>{item.qty}</span><span style={{fontSize:13,textAlign:"right"}}>${parseFloat(item.rate||0).toFixed(2)}</span><span style={{fontSize:13,textAlign:"right",fontWeight:500}}>${((parseFloat(item.qty)||0)*(parseFloat(item.rate)||0)).toFixed(2)}</span></div>)}</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}><p style={{margin:0,fontSize:12,color:"var(--color-text-secondary)"}}>{f.notes}</p><p style={{fontSize:18,fontWeight:500,margin:0}}>Total: ${sub.toFixed(2)}</p></div><CopyBtn text={txt}/></div>}</div>);}

// ── INDEXING HEALTH ───────────────────────────────────────────────
const INDEX_ISSUES = [
  { id:"thin",    label:"Thin or duplicate content",         risk:"high",  detail:"Pages with fewer than 300 words or near-identical content to other pages get dropped from Google's index. Google sees no unique value in ranking them." },
  { id:"buried",  label:"Pages buried 4+ clicks deep",       risk:"high",  detail:"Google's crawler has a crawl budget. Pages that require 4+ clicks from the homepage often don't get crawled at all, let alone indexed." },
  { id:"noindex", label:"Accidental noindex tags",            risk:"high",  detail:"A single noindex meta tag or X-Robots-Tag header tells Google to exclude that page. Developers sometimes leave these on after testing." },
  { id:"robots",  label:"Blocked by robots.txt",             risk:"high",  detail:"A misconfigured robots.txt can block entire folders. Business owners rarely check this and it can silently kill dozens of pages." },
  { id:"slow",    label:"Slow pages not getting crawled",    risk:"med",   detail:"Google allocates crawl budget based on page speed. Slow sites get crawled less frequently, meaning new or updated pages can take months to be indexed." },
  { id:"orphan",  label:"Orphan pages (no internal links)",  risk:"med",   detail:"If a page has no internal links pointing to it, Google may never discover it even if it exists. Service area and location pages are especially vulnerable." },
  { id:"soft404", label:"Soft 404 errors",                   risk:"med",   detail:"Pages that show content but return no search results (e.g. 'no products found') get treated as errors and deindexed." },
  { id:"dup_url", label:"Duplicate URLs (www vs non-www)",   risk:"med",   detail:"If a site is accessible at both www and non-www without a canonical tag or redirect, Google splits its authority between two URLs." },
  { id:"new",     label:"New pages not yet picked up",       risk:"low",   detail:"New pages don't get indexed automatically. Without a sitemap submission and internal links, new pages can take weeks or months to be indexed." },
  { id:"changed", label:"Updated pages not re-crawled",      risk:"low",   detail:"Changing a page's content doesn't automatically trigger re-indexing. Without signaling through Search Console, Google may keep showing the old version." },
];

const MONITORING_TASKS = [
  { id:"m1", phase:"Monthly",   label:"Run site: search in Google",            detail:'Type "site:clientdomain.com" in Google. Compare page count to last month. A sudden drop of 10%+ is a red flag that needs immediate investigation.' },
  { id:"m2", phase:"Monthly",   label:"Check Google Search Console coverage",  detail:"Go to GSC → Indexing → Pages. Review 'Not indexed' reasons. The most common culprits: Crawled but not indexed, Discovered but not indexed, Duplicate pages." },
  { id:"m3", phase:"Monthly",   label:"Submit updated sitemap",                detail:"Every time new pages are added or existing pages are significantly updated, resubmit the sitemap in GSC → Sitemaps. This tells Google exactly what to crawl." },
  { id:"m4", phase:"Monthly",   label:"Request indexing for new/changed pages",detail:"In GSC, use the URL Inspection tool on any new or updated page. Click 'Request indexing' — this jumps the queue and typically gets the page indexed within days." },
  { id:"m5", phase:"Quarterly", label:"Audit for orphan pages",                detail:"Export all URLs from a crawl tool (Screaming Frog free version handles 500 URLs). Cross-reference against pages with incoming internal links. Flag any with zero internal links." },
  { id:"m6", phase:"Quarterly", label:"Check robots.txt for blockers",         detail:'Visit clientdomain.com/robots.txt. Make sure no important folders are accidentally disallowed. Pay attention to "Disallow: /services/" or similar broad blocks.' },
  { id:"m7", phase:"Quarterly", label:"Audit thin content pages",              detail:"Pull all indexed pages from GSC. Filter for pages with fewer than 300 words. These are at high risk of being deindexed. Expand content or consolidate into stronger pages." },
  { id:"m8", phase:"Quarterly", label:"Verify canonical tags are correct",     detail:"On service pages and location pages, confirm the canonical tag points to itself (self-referencing). A canonical pointing to the homepage accidentally strips those pages from ranking." },
  { id:"m9", phase:"Bi-annual", label:"Full technical crawl audit",            detail:"Run a complete crawl using Screaming Frog or similar. Export all URLs, check status codes, find redirect chains, flag noindex tags, identify missing titles and H1s." },
  { id:"m10",phase:"Bi-annual", label:"Review Core Web Vitals in GSC",        detail:"GSC → Experience → Core Web Vitals. Poor CWV scores hurt crawl budget allocation. Pages scoring 'Poor' on LCP, CLS, or INP get crawled less often." },
];

function IndexingHealth(){
  const [url,setUrl]=useState("");
  const [clientName,setClientName]=useState("");
  const [loading,setLoading]=useState(false);
  const [auditData,setAuditData]=useState(null);
  const [phase,setPhase]=useState("");
  const [savedClients,setSavedClients]=useState({});
  const [activeClient,setActiveClient]=useState("");
  const [monChecked,setMonChecked]=useState({});
  const [expandedIssue,setExpandedIssue]=useState(null);
  const [expandedTask,setExpandedTask]=useState(null);
  const [generatingReport,setGeneratingReport]=useState(false);
  const [report,setReport]=useState("");
  const [activeTab,setActiveTab]=useState("audit");

  useEffect(()=>{(async()=>{try{const r=await window.storage.get("gfw_indexing");if(r?.value){const d=JSON.parse(r.value);setSavedClients(d.clients||{});}}catch{}})();},[]);
  function saveAll(clients){window.storage?.set("gfw_indexing",JSON.stringify({clients})).catch(()=>{});}
  function loadClient(name){setActiveClient(name);setClientName(name);const c=savedClients[name];if(c){setUrl(c.url||"");setAuditData(c.auditData||null);setMonChecked(c.monChecked||{});}}
  function saveClient(){if(!clientName.trim())return;const updated={...savedClients,[clientName]:{url,auditData,monChecked,savedAt:new Date().toISOString()}};setSavedClients(updated);setActiveClient(clientName);saveAll(updated);}
  function toggleMon(id){const u={...monChecked,[id]:!monChecked[id]};setMonChecked(u);}

  const indexScore=(d)=>{
    if(!d)return null;
    let s=100;
    if(d.indexedPages===0)return 0;
    const gap=d.totalPages>0?(d.totalPages-d.indexedPages)/d.totalPages:0;
    s-=Math.round(gap*50);
    if(d.hasRobotsBlocker)s-=20;
    if(d.hasNoindexIssues)s-=15;
    if(d.hasDuplicateContent)s-=10;
    if(d.orphanPageCount>3)s-=10;
    return Math.max(0,Math.min(100,s));
  };

  async function runAudit(){
    if(!url.trim())return;
    setLoading(true);setAuditData(null);setReport("");
    const domain=url.replace(/^https?:\/\//,"").replace(/\/.*$/,"");
    setPhase("Searching Google for indexed pages...");
    try{
      const text=await callClaude(
        `Perform a Google indexing health audit for the website: ${url}\nDomain: ${domain}\n\n` +
        `Use web search to find real data:\n` +
        `1. Search "site:${domain}" in Google — count how many pages appear in results. This is the indexed page count.\n` +
        `2. Search "${domain} robots.txt" — try to fetch ${url.replace(/\/$/,"")}/robots.txt to check for disallow rules\n` +
        `3. Search for the business/site to understand what industry/trade they're in and what pages they likely have\n` +
        `4. Search "site:${domain} service" and "site:${domain} location" to see if service and location pages are indexed\n` +
        `5. Look for any technical red flags: site down, redirect loops, thin content signals\n` +
        `6. Check if Google Sitemap exists: try ${url.replace(/\/$/,"")}/sitemap.xml\n` +
        `7. Search "${domain} review" or "${domain} directory" to find any external citations\n\n` +
        `Based on your research, return ONLY this JSON object:\n` +
        `{\n` +
        `  "domain": "${domain}",\n` +
        `  "siteExists": true/false,\n` +
        `  "indexedPages": actual number found via site: search (integer),\n` +
        `  "totalPages": estimated total pages the site likely has (integer),\n` +
        `  "indexingGapPercent": percentage of pages NOT indexed (0-100),\n` +
        `  "indexingGrade": "A (90%+ indexed) / B (75-89%) / C (50-74%) / D (30-49%) / F (under 30%)",\n` +
        `  "hasSitemap": true/false based on whether sitemap.xml was found,\n` +
        `  "hasRobotsBlocker": true/false — are important pages blocked?,\n` +
        `  "hasNoindexIssues": true/false — any signs of noindex meta tags?,\n` +
        `  "hasDuplicateContent": true/false — signs of thin/duplicate pages?,\n` +
        `  "hasCanonicalIssues": true/false,\n` +
        `  "orphanPageCount": estimated number of pages with no internal links (0-20),\n` +
        `  "servicePageIndexed": true/false — are service pages showing in Google?,\n` +
        `  "locationPageIndexed": true/false — are location/city pages showing?,\n` +
        `  "topIndexedPages": ["list of 3-5 actual page URLs found in site: search"],\n` +
        `  "missingFromIndex": ["3-5 types of pages that should exist but aren't showing in Google"],\n` +
        `  "criticalIssues": ["list of 2-4 most urgent problems found"],\n` +
        `  "quickFixes": ["3-5 specific actions to improve indexing immediately"],\n` +
        `  "estimatedTrafficLoss": "plain English estimate of traffic being lost due to indexing gaps",\n` +
        `  "industry": "what type of business/trade this site serves",\n` +
        `  "summary": "2-3 sentence plain English summary of their indexing health for a business owner"\n` +
        `}\nReturn ONLY the JSON. No other text.`,
        true
      );
      const s=text.indexOf("{"),e=text.lastIndexOf("}");
      if(s>-1&&e>-1){
        const data=JSON.parse(text.slice(s,e+1));
        setAuditData(data);setPhase("");
        if(clientName){const updated={...savedClients,[clientName]:{url,auditData:data,monChecked,savedAt:new Date().toISOString()}};setSavedClients(updated);setActiveClient(clientName);saveAll(updated);}
      }else{setPhase("Could not parse audit results. Try again.");}
    }catch(err){setPhase("Error: "+err.message);}
    setLoading(false);
  }

  async function generateReport(){
    if(!auditData)return;
    setGeneratingReport(true);setReport("");
    try{
      const text=await callClaude(
        `Write a plain-English indexing health report for a business owner. No jargon, no markdown symbols.\n\n` +
        `Business website: ${url}\n` +
        `Industry: ${auditData.industry||"local trade business"}\n` +
        `Indexed pages: ${auditData.indexedPages} out of approximately ${auditData.totalPages} total pages\n` +
        `Indexing grade: ${auditData.indexingGrade}\n` +
        `Critical issues: ${(auditData.criticalIssues||[]).join(", ")}\n` +
        `Missing from index: ${(auditData.missingFromIndex||[]).join(", ")}\n` +
        `Traffic loss estimate: ${auditData.estimatedTrafficLoss}\n\n` +
        `Write a report with these sections (plain text, no markdown):\n` +
        `1. What we found (2-3 sentences, written for a non-technical owner)\n` +
        `2. What this means for your business (dollar/call impact framing)\n` +
        `3. The 3 most urgent fixes (numbered list, plain English)\n` +
        `4. What we'll do each month to keep your pages indexed (GoFieldWise service pitch)\n` +
        `5. Next steps\n\n` +
        `Close with: GoFieldWise | biz@gofieldwise.com | gofieldwise.com\n` +
        `Keep under 400 words. Sound like a real person who cares, not a robot.`
      );
      setReport(text);
    }catch(err){console.error(err);}
    setGeneratingReport(false);
  }

  const score=indexScore(auditData);
  const gradeColor=(g)=>{if(!g)return "secondary";const first=g[0];return first==="A"?"success":first==="B"?"success":first==="C"?"warning":first==="D"?"danger":"danger";};
  const riskColor={high:"danger",med:"warning",low:"secondary"};
  const phaseGroups=["Monthly","Quarterly","Bi-annual"];
  const monDone=Object.values(monChecked).filter(Boolean).length;

  return(
    <div>
      {/* Header */}
      <div style={{...ib("warning"),marginBottom:"1.5rem"}}>
        <p style={{margin:"0 0 4px",fontSize:13,fontWeight:500,color:"var(--color-text-warning)"}}>
          <i className="ti ti-shield-check" style={{marginRight:6}} aria-hidden="true"/>Index Health Skill — Prevent client websites from disappearing from Google
        </p>
        <p style={{margin:0,fontSize:12,color:"var(--color-text-warning)"}}>
          Most business sites are missing 30–60% of their pages from Google's index — and the owner has no idea. This tool audits, monitors, and fixes that gap. Use it as a monthly deliverable and upsell.
        </p>
      </div>

      {/* Sub-tabs */}
      <div style={{display:"flex",gap:8,marginBottom:"1.5rem",flexWrap:"wrap"}}>
        {[["audit","Indexing Audit","ti-zoom-scan"],["issues","Why Pages Disappear","ti-alert-triangle"],["monitor","Monthly Monitor","ti-calendar"],["report","Client Report","ti-file-text"]].map(([id,label,icon])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{...bs(activeTab===id),fontSize:12}}>
            <i className={`ti ${icon}`} style={{marginRight:5,fontSize:12}} aria-hidden="true"/>{label}
          </button>
        ))}
      </div>

      {/* ── AUDIT TAB ── */}
      {activeTab==="audit"&&(
        <div>
          {/* Saved clients */}
          {Object.keys(savedClients).length>0&&(
            <div style={{marginBottom:"1rem"}}>
              <label style={lbl}>Load saved client</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {Object.keys(savedClients).map(n=><button key={n} onClick={()=>loadClient(n)} style={{...bs(activeClient===n),fontSize:11}}>{n}</button>)}
              </div>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:"1rem"}}>
            <div>
              <label style={lbl}>Client / business name</label>
              <input value={clientName} onChange={e=>setClientName(e.target.value)} placeholder="e.g. Superior Air Services" style={{width:"100%",fontSize:13,boxSizing:"border-box"}}/>
            </div>
            <div>
              <label style={lbl}>Website URL</label>
              <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://superiorairservicellc.com" style={{width:"100%",fontSize:13,boxSizing:"border-box"}}/>
            </div>
          </div>

          <button onClick={runAudit} disabled={loading||!url.trim()} style={{width:"100%",padding:"11px",fontSize:14,fontWeight:500,cursor:loading||!url.trim()?"not-allowed":"pointer",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-secondary)",background:loading||!url.trim()?"var(--color-background-secondary)":"transparent",color:loading||!url.trim()?"var(--color-text-secondary)":"var(--color-text-primary)",marginBottom:"1rem"}}>
            {loading?<><i className="ti ti-loader" style={{marginRight:8,animation:"spin 1s linear infinite"}} aria-hidden="true"/>Running indexing audit...</>:<><i className="ti ti-zoom-scan" style={{marginRight:8}} aria-hidden="true"/>Run Google Indexing Audit ↗</>}
          </button>

          {phase&&<div style={{...ib(loading?"info":"danger"),marginBottom:"1rem"}}><p style={{margin:0,fontSize:13,color:loading?"var(--color-text-info)":"var(--color-text-danger)"}}>{phase}</p></div>}

          {auditData&&(
            <div>
              {/* Score cards */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:"1.25rem"}}>
                {[
                  {label:"Grade",value:auditData.indexingGrade?.split(" ")[0]||"?",sub:"Indexing grade",c:gradeColor(auditData.indexingGrade)},
                  {label:"Indexed",value:auditData.indexedPages??0,sub:`of ~${auditData.totalPages||"?"} pages`,c:"info"},
                  {label:"Gap",value:`${auditData.indexingGapPercent??0}%`,sub:"pages missing from Google",c:auditData.indexingGapPercent>40?"danger":auditData.indexingGapPercent>20?"warning":"success"},
                  {label:"SEO Score",value:score!==null?`${score}/100`:"?",sub:"index health",c:score>=70?"success":score>=40?"warning":"danger"},
                ].map((s,i)=>(
                  <div key={i} style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"12px 14px",textAlign:"center"}}>
                    <p style={{fontSize:20,fontWeight:500,margin:"0 0 3px",color:`var(--color-text-${s.c})`}}>{s.value}</p>
                    <p style={{fontSize:11,fontWeight:500,margin:"0 0 2px"}}>{s.label}</p>
                    <p style={{fontSize:10,color:"var(--color-text-secondary)",margin:0}}>{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Visual gap bar */}
              <div style={{...card,marginBottom:"1.25rem",padding:"14px 16px"}}>
                <p style={{fontSize:13,fontWeight:500,margin:"0 0 10px"}}>Pages built vs pages Google can see</p>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                  <span style={{fontSize:12,color:"var(--color-text-secondary)",width:90,flexShrink:0}}>Built (~{auditData.totalPages||0})</span>
                  <div style={{flex:1,height:10,background:"var(--color-background-secondary)",borderRadius:5,overflow:"hidden"}}>
                    <div style={{height:"100%",width:"100%",background:"var(--color-border-secondary)",borderRadius:5}}/>
                  </div>
                  <span style={{fontSize:12,color:"var(--color-text-secondary)",width:40,textAlign:"right"}}>{auditData.totalPages||0}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                  <span style={{fontSize:12,color:"var(--color-text-success)",width:90,flexShrink:0}}>Indexed ({auditData.indexedPages||0})</span>
                  <div style={{flex:1,height:10,background:"var(--color-background-secondary)",borderRadius:5,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${auditData.totalPages>0?Math.min(100,Math.round((auditData.indexedPages/auditData.totalPages)*100)):0}%`,background:"var(--color-border-success)",borderRadius:5,transition:"width .5s"}}/>
                  </div>
                  <span style={{fontSize:12,color:"var(--color-text-success)",width:40,textAlign:"right"}}>{auditData.indexedPages||0}</span>
                </div>
                {auditData.indexingGapPercent>0&&<div style={{...ib("danger"),padding:"8px 12px"}}><p style={{margin:0,fontSize:12,color:"var(--color-text-danger)"}}><i className="ti ti-alert-triangle" style={{marginRight:6}} aria-hidden="true"/><strong>~{auditData.indexingGapPercent}% of pages are invisible to Google</strong> — {auditData.estimatedTrafficLoss}</p></div>}
              </div>

              {/* Summary */}
              {auditData.summary&&<div style={{...ib("info"),marginBottom:"1.25rem"}}><p style={{margin:0,fontSize:13,color:"var(--color-text-info)"}}>{auditData.summary}</p></div>}

              {/* Status checks */}
              <p style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:".04em"}}>Technical status checks</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6,marginBottom:"1.25rem"}}>
                {[
                  ["Sitemap found",auditData.hasSitemap,"ti-sitemap"],
                  ["Service pages indexed",auditData.servicePageIndexed,"ti-tool"],
                  ["Location pages indexed",auditData.locationPageIndexed,"ti-map-pin"],
                  ["Robots.txt blocker",!auditData.hasRobotsBlocker,"ti-robot"],
                  ["Noindex issues",!auditData.hasNoindexIssues,"ti-eye-off"],
                  ["Canonical tag issues",!auditData.hasCanonicalIssues,"ti-link"],
                ].map(([label,ok,icon],i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"var(--color-background-primary)",borderRadius:"var(--border-radius-md)",border:`0.5px solid ${ok?"var(--color-border-success)":"var(--color-border-danger)"}`}}>
                    <i className={`ti ${icon}`} style={{fontSize:14,color:ok?"var(--color-text-success)":"var(--color-text-danger)",flexShrink:0}} aria-hidden="true"/>
                    <span style={{fontSize:12,flex:1}}>{label}</span>
                    <Badge type={ok?"success":"danger"}>{ok?"✓ OK":"✗ Issue"}</Badge>
                  </div>
                ))}
              </div>

              {/* Critical issues */}
              {auditData.criticalIssues?.length>0&&(
                <>
                  <p style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:".04em"}}>Critical issues found</p>
                  <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:"1.25rem"}}>
                    {auditData.criticalIssues.map((issue,i)=>(
                      <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"8px 10px",background:"var(--color-background-danger)",border:"0.5px solid var(--color-border-danger)",borderRadius:"var(--border-radius-md)"}}>
                        <i className="ti ti-alert-circle" style={{fontSize:14,color:"var(--color-text-danger)",marginTop:1,flexShrink:0}} aria-hidden="true"/>
                        <span style={{fontSize:12,color:"var(--color-text-danger)"}}>{issue}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Missing from index */}
              {auditData.missingFromIndex?.length>0&&(
                <>
                  <p style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:".04em"}}>Missing from Google's index</p>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:"1.25rem"}}>
                    {auditData.missingFromIndex.map((m,i)=><span key={i} style={{fontSize:11,padding:"4px 9px",borderRadius:6,background:"var(--color-background-danger)",color:"var(--color-text-danger)",border:"0.5px solid var(--color-border-danger)"}}><i className="ti ti-eye-off" style={{marginRight:4,fontSize:10}} aria-hidden="true"/>{m}</span>)}
                  </div>
                </>
              )}

              {/* Quick fixes */}
              {auditData.quickFixes?.length>0&&(
                <>
                  <p style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:".04em"}}>Quick fixes to get pages indexed</p>
                  <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:"1.25rem"}}>
                    {auditData.quickFixes.map((fix,i)=>(
                      <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"8px 10px",background:"var(--color-background-success)",border:"0.5px solid var(--color-border-success)",borderRadius:"var(--border-radius-md)"}}>
                        <i className="ti ti-arrow-right" style={{fontSize:13,color:"var(--color-text-success)",marginTop:1,flexShrink:0}} aria-hidden="true"/>
                        <span style={{fontSize:12,color:"var(--color-text-success)"}}>{fix}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Top indexed pages */}
              {auditData.topIndexedPages?.length>0&&(
                <div style={{...card,marginBottom:"1.25rem"}}>
                  <p style={{fontSize:12,fontWeight:500,margin:"0 0 8px"}}>Pages currently indexed by Google</p>
                  {auditData.topIndexedPages.map((pg,i)=>(
                    <div key={i} style={{fontSize:12,color:"var(--color-text-secondary)",padding:"4px 0",borderBottom:i<auditData.topIndexedPages.length-1?"0.5px solid var(--color-border-tertiary)":"none"}}>
                      <i className="ti ti-check" style={{color:"var(--color-text-success)",marginRight:8,fontSize:11}} aria-hidden="true"/>{pg}
                    </div>
                  ))}
                </div>
              )}

              <div style={{display:"flex",gap:8}}>
                <button onClick={saveClient} style={{padding:"8px 16px",fontSize:13,cursor:"pointer",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-secondary)",background:"transparent",color:"var(--color-text-primary)"}}>
                  <i className="ti ti-device-floppy" style={{marginRight:6}} aria-hidden="true"/>Save audit for {clientName||"this client"}
                </button>
                <button onClick={()=>setActiveTab("report")} style={{padding:"8px 16px",fontSize:13,cursor:"pointer",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-info)",background:"var(--color-background-info)",color:"var(--color-text-info)"}}>
                  <i className="ti ti-file-text" style={{marginRight:6}} aria-hidden="true"/>Generate client report →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── WHY PAGES DISAPPEAR TAB ── */}
      {activeTab==="issues"&&(
        <div>
          <div style={{...ib("warning"),marginBottom:"1.5rem"}}>
            <p style={{margin:"0 0 4px",fontSize:13,fontWeight:500,color:"var(--color-text-warning)"}}>
              <i className="ti ti-bulb" style={{marginRight:6}} aria-hidden="true"/>Use this as a sales tool
            </p>
            <p style={{margin:0,fontSize:12,color:"var(--color-text-warning)"}}>
              Walk prospects through these issues during your audit call. Most owners have never heard of indexing problems and are shocked to learn pages they're paying for aren't visible on Google. This creates instant urgency.
            </p>
          </div>

          <div style={{...card,marginBottom:"1.5rem",padding:"14px 16px"}}>
            <p style={{fontSize:13,fontWeight:500,margin:"0 0 8px"}}><i className="ti ti-chart-bar" style={{marginRight:6}} aria-hidden="true"/>The indexing gap problem</p>
            <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:"0 0 12px",lineHeight:1.7}}>Most business websites have a problem the owner has no idea about: a huge chunk of their pages aren't actually showing up in Google. They built the site, paid for the pages, and assumed Google was indexing all of them. But indexing isn't automatic — and the gap between "pages on your site" and "pages Google can rank" is bigger than most owners realize.</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {[["30–60%","of pages missing from Google's index on average"],["0%","chance of ranking if a page isn't indexed"],["Weeks","new pages can take to be picked up without help"]].map(([v,l],i)=>(
                <div key={i} style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"12px",textAlign:"center"}}>
                  <p style={{fontSize:20,fontWeight:500,margin:"0 0 4px",color:"var(--color-text-danger)"}}>{v}</p>
                  <p style={{fontSize:11,color:"var(--color-text-secondary)",margin:0,lineHeight:1.5}}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          <p style={{fontSize:13,fontWeight:500,margin:"0 0 10px"}}>10 reasons pages disappear from Google <span style={{fontSize:11,color:"var(--color-text-secondary)",fontWeight:400}}>(click to expand)</span></p>
          <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:"1.5rem"}}>
            {INDEX_ISSUES.map((issue)=>(
              <div key={issue.id} style={{border:`0.5px solid var(--color-border-${riskColor[issue.risk]})`,borderRadius:"var(--border-radius-md)",overflow:"hidden"}}>
                <div style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",background:expandedIssue===issue.id?`var(--color-background-${riskColor[issue.risk]})`:"transparent"}} onClick={()=>setExpandedIssue(expandedIssue===issue.id?null:issue.id)}>
                  <Badge type={riskColor[issue.risk]}>{issue.risk==="high"?"High risk":issue.risk==="med"?"Medium":"Low"}</Badge>
                  <span style={{flex:1,fontSize:13,fontWeight:500}}>{issue.label}</span>
                  <i className={`ti ti-chevron-${expandedIssue===issue.id?"up":"down"}`} style={{fontSize:12,color:"var(--color-text-secondary)"}} aria-hidden="true"/>
                </div>
                {expandedIssue===issue.id&&<div style={{padding:"0 14px 12px"}}><p style={{fontSize:12,color:"var(--color-text-secondary)",margin:0,lineHeight:1.6}}>{issue.detail}</p></div>}
              </div>
            ))}
          </div>

          <div style={{...card,padding:"14px 16px"}}>
            <p style={{fontSize:13,fontWeight:500,margin:"0 0 8px"}}><i className="ti ti-message" style={{marginRight:6}} aria-hidden="true"/>How to bring this up with a prospect</p>
            <div style={{fontSize:12,color:"var(--color-text-secondary)",lineHeight:1.7,background:"var(--color-background-secondary)",padding:"12px 14px",borderRadius:"var(--border-radius-md)"}}>
              <em>"Quick question — do you know how many of your website pages are actually showing up on Google right now? Most business owners assume it's all of them, but on average we find 30 to 60% are missing. It's called an indexing gap. I can run a free check on your site in about 5 minutes and show you exactly what Google can and can't see. Want me to pull that up?"</em>
            </div>
          </div>
        </div>
      )}

      {/* ── MONTHLY MONITOR TAB ── */}
      {activeTab==="monitor"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem",flexWrap:"wrap",gap:8}}>
            <div>
              <p style={{fontSize:13,fontWeight:500,margin:"0 0 3px"}}>Monthly indexing monitoring checklist</p>
              <p style={{fontSize:12,color:"var(--color-text-secondary)",margin:0}}>Deliver this as a monthly service. Saves clients from silent deindexing. Use as a $97–$197/mo add-on.</p>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>{monDone}/{MONITORING_TASKS.length} done</span>
              <button onClick={()=>setMonChecked({})} style={{padding:"5px 10px",fontSize:11,cursor:"pointer",borderRadius:6,border:"0.5px solid var(--color-border-tertiary)",background:"transparent",color:"var(--color-text-secondary)"}}>Reset</button>
            </div>
          </div>

          {/* Progress */}
          <div style={{height:6,background:"var(--color-background-secondary)",borderRadius:3,marginBottom:"1.5rem",overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.round((monDone/MONITORING_TASKS.length)*100)}%`,background:monDone===MONITORING_TASKS.length?"var(--color-border-success)":"var(--color-border-info)",borderRadius:3,transition:"width .3s"}}/>
          </div>

          {phaseGroups.map(phase=>{
            const tasks=MONITORING_TASKS.filter(t=>t.phase===phase);
            const done=tasks.filter(t=>monChecked[t.id]).length;
            return(
              <div key={phase} style={{marginBottom:"1.25rem",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",overflow:"hidden"}}>
                <div style={{padding:"10px 16px",background:"var(--color-background-secondary)",borderBottom:"0.5px solid var(--color-border-tertiary)",display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:13,fontWeight:500}}><i className="ti ti-calendar" style={{marginRight:8}} aria-hidden="true"/>{phase} tasks</span>
                  <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>{done}/{tasks.length}</span>
                </div>
                {tasks.map((task,ti)=>(
                  <div key={task.id} style={{borderBottom:ti<tasks.length-1?"0.5px solid var(--color-border-tertiary)":"none"}}>
                    <div style={{padding:"11px 16px",display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer"}} onClick={()=>toggleMon(task.id)}>
                      <div style={{width:18,height:18,borderRadius:4,border:monChecked[task.id]?"none":"1.5px solid var(--color-border-secondary)",background:monChecked[task.id]?"var(--color-background-success)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                        {monChecked[task.id]&&<i className="ti ti-check" style={{fontSize:12,color:"var(--color-text-success)"}} aria-hidden="true"/>}
                      </div>
                      <span style={{flex:1,fontSize:13,fontWeight:500,textDecoration:monChecked[task.id]?"line-through":"none",color:monChecked[task.id]?"var(--color-text-secondary)":"var(--color-text-primary)"}}>{task.label}</span>
                      <button onClick={e=>{e.stopPropagation();setExpandedTask(expandedTask===task.id?null:task.id);}} style={{padding:"2px 6px",fontSize:11,cursor:"pointer",borderRadius:6,border:"0.5px solid var(--color-border-tertiary)",background:"transparent",color:"var(--color-text-secondary)",flexShrink:0}}>
                        <i className={`ti ti-chevron-${expandedTask===task.id?"up":"down"}`} style={{fontSize:12}} aria-hidden="true"/>
                      </button>
                    </div>
                    {expandedTask===task.id&&<div style={{padding:"0 16px 12px 46px"}}><p style={{fontSize:12,color:"var(--color-text-secondary)",margin:0,lineHeight:1.6}}>{task.detail}</p></div>}
                  </div>
                ))}
              </div>
            );
          })}

          <div style={{...ib("info"),marginTop:"1rem"}}>
            <p style={{margin:"0 0 4px",fontSize:12,fontWeight:500,color:"var(--color-text-info)"}}>Pricing this as a service</p>
            <p style={{margin:0,fontSize:12,color:"var(--color-text-info)"}}>Monthly indexing monitoring (tasks marked Monthly) takes 20–30 min/client. At $97/mo that's $190+/hr. Add it to any Local Dominator or Market Leader package, or sell standalone to clients who already have an SEO agency but need someone watching their indexing.</p>
          </div>
        </div>
      )}

      {/* ── CLIENT REPORT TAB ── */}
      {activeTab==="report"&&(
        <div>
          {!auditData?(
            <div style={{padding:"2.5rem",textAlign:"center",border:"0.5px dashed var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)"}}>
              <i className="ti ti-zoom-scan" style={{fontSize:32,color:"var(--color-text-secondary)",display:"block",marginBottom:8}} aria-hidden="true"/>
              <p style={{fontSize:14,color:"var(--color-text-secondary)",margin:"0 0 12px"}}>Run an indexing audit first to generate a client report.</p>
              <button onClick={()=>setActiveTab("audit")} style={{padding:"8px 16px",fontSize:13,cursor:"pointer",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-info)",background:"var(--color-background-info)",color:"var(--color-text-info)"}}>← Go to Audit</button>
            </div>
          ):(
            <div>
              <div style={{...ib("info"),marginBottom:"1.25rem"}}>
                <p style={{margin:0,fontSize:13,color:"var(--color-text-info)"}}>
                  <i className="ti ti-file-text" style={{marginRight:6}} aria-hidden="true"/>
                  AI-written plain English report for <strong>{clientName||url}</strong> — send this to the client after their audit. No jargon. Designed to create urgency and close the deal.
                </p>
              </div>
              <button onClick={generateReport} disabled={generatingReport} style={{width:"100%",padding:"10px",fontSize:14,fontWeight:500,cursor:generatingReport?"not-allowed":"pointer",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-secondary)",background:generatingReport?"var(--color-background-secondary)":"transparent",color:generatingReport?"var(--color-text-secondary)":"var(--color-text-primary)",marginBottom:"1.25rem"}}>
                {generatingReport?<><i className="ti ti-loader" style={{marginRight:8,animation:"spin 1s linear infinite"}} aria-hidden="true"/>Writing client report...</>:<><i className="ti ti-sparkles" style={{marginRight:8}} aria-hidden="true"/>Generate client-ready indexing report ↗</>}
              </button>
              {report&&(
                <div style={card}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
                    <p style={{margin:0,fontSize:13,fontWeight:500}}><i className="ti ti-file-check" style={{marginRight:6,color:"var(--color-text-success)"}} aria-hidden="true"/>Indexing Health Report — {clientName||url}</p>
                    <CopyBtn text={report}/>
                  </div>
                  <pre style={{fontSize:13,lineHeight:1.8,margin:0,whiteSpace:"pre-wrap",fontFamily:"var(--font-sans)",color:"var(--color-text-primary)",background:"var(--color-background-secondary)",padding:"1.25rem",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-tertiary)"}}>{report}</pre>
                  <div style={{...ib("warning"),marginTop:"1rem"}}>
                    <p style={{margin:0,fontSize:12,color:"var(--color-text-warning)"}}>
                      <i className="ti ti-bulb" style={{marginRight:6}} aria-hidden="true"/>
                      <strong>Delivery tip:</strong> Send this as a PDF (paste into Google Docs → export). Subject line: "Your website's indexing health report — {clientName}". Follow up in 2 days. Clients who see the gap almost always say yes to the fix.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── CREATIVE STUDIO ───────────────────────────────────────────────
const CONTENT_TYPES = [
  { id:"hero",      label:"Website Hero Image",      icon:"ti-photo",          desc:"Full-width banner for the top of a client website" },
  { id:"gbp",       label:"Google Business Photos",  icon:"ti-map-pin",        desc:"Professional photos for Google Business Profile" },
  { id:"fb_ad",     label:"Facebook / Instagram Ad", icon:"ti-brand-facebook",  desc:"Eye-catching ad creative for social campaigns" },
  { id:"before",    label:"Before / After Shot",     icon:"ti-arrows-left-right",desc:"Job showcase for website and social media" },
  { id:"team",      label:"Team / About Photo",      icon:"ti-users",          desc:"Professional team photo for trust-building" },
  { id:"seasonal",  label:"Seasonal Promotion",      icon:"ti-calendar",       desc:"Summer AC tune-up, winter heating deal, etc." },
];

const STYLE_PRESETS = {
  HVAC:       { palette:"deep navy blue and bright orange", style:"professional, clean, modern HVAC service company", mood:"trustworthy and urgent" },
  Plumbing:   { palette:"royal blue and gold", style:"reliable, established local plumbing company", mood:"dependable and expert" },
  Electrical: { palette:"dark charcoal and electric yellow", style:"professional electrical contractor", mood:"precise and safe" },
  Cleaning:   { palette:"fresh green and crisp white", style:"clean, fresh, eco-friendly home cleaning", mood:"bright and inviting" },
  Roofing:    { palette:"slate gray and crimson red", style:"sturdy, dependable roofing contractor", mood:"strong and protective" },
  Landscaping:{ palette:"earthy green and warm brown", style:"lush, professional landscaping company", mood:"natural and vibrant" },
};

const SETUP_STEPS = [
  { step:1, title:"Install pnpm (if not already installed)", cmd:"npm install -g pnpm", note:"Run this once in any terminal." },
  { step:2, title:"Clone the Open Generative AI repository", cmd:"git clone https://github.com/Anil-matcha/Open-Generative-AI.git\ncd Open-Generative-AI", note:"Creates a local folder with the full studio." },
  { step:3, title:"Install dependencies", cmd:"pnpm install", note:"Downloads all required packages. Takes 1-2 minutes." },
  { step:4, title:"Start the studio", cmd:"pnpm dev", note:"Opens at http://localhost:3000 in your browser. Keep this terminal open while using." },
  { step:5, title:"Add your API key (optional)", cmd:"", note:"Open the app settings → enter your Muapi.ai API key for cloud generation, or use the built-in local Stable Diffusion engine (no key needed)." },
];

function CreativeStudio({ prospects }){
  const [activeTab, setActiveTab] = useState("generate");
  const [trade, setTrade] = useState("HVAC");
  const [contentType, setContentType] = useState("hero");
  const [clientName, setClientName] = useState("");
  const [city, setCity] = useState("Tulsa");
  const [customDetails, setCustomDetails] = useState("");
  const [generating, setGenerating] = useState(false);
  const [prompts, setPrompts] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [studioPort, setStudioPort] = useState("3000");
  const [expandedStep, setExpandedStep] = useState(null);

  const ct = CONTENT_TYPES.find(c => c.id === contentType);
  const preset = STYLE_PRESETS[trade] || STYLE_PRESETS.HVAC;

  function copyPrompt(text, idx){
    navigator.clipboard?.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  }

  async function generatePrompts(){
    setGenerating(true); setPrompts(null);
    try {
      const text = await callClaude(
        `You are a professional AI art director specializing in local service business marketing in Oklahoma.\n\n` +
        `Generate 3 detailed image generation prompts for:\n` +
        `- Business type: ${trade} company\n` +
        `- Client name: ${clientName || "a local " + trade + " company"}\n` +
        `- City: ${city}, Oklahoma\n` +
        `- Content type: ${ct?.label} — ${ct?.desc}\n` +
        `- Brand palette: ${preset.palette}\n` +
        `- Visual style: ${preset.style}\n` +
        `- Mood/tone: ${preset.mood}\n` +
        (customDetails ? `- Additional details: ${customDetails}\n` : "") +
        `\nPrompt guidelines:\n` +
        `- Each prompt should be 50-80 words\n` +
        `- Include: subject, setting, lighting, color palette, mood, camera angle, quality modifiers\n` +
        `- Make them specific to ${trade} work in Oklahoma (weather, homes, environment)\n` +
        `- Prompt 1: Safe, professional, photo-realistic\n` +
        `- Prompt 2: More dynamic, action-oriented (worker on the job)\n` +
        `- Prompt 3: Lifestyle/emotional (happy customer, finished result)\n` +
        `- End each prompt with: "professional photography, 4K, sharp focus, commercial quality"\n` +
        `- Also provide a short negative prompt (things to exclude)\n\n` +
        `Return ONLY a JSON object:\n` +
        `{\n` +
        `  "prompt1": { "title": "Professional & Clean", "text": "...", "useFor": "website hero image or GBP cover" },\n` +
        `  "prompt2": { "title": "Action Shot", "text": "...", "useFor": "Facebook ad or social post" },\n` +
        `  "prompt3": { "title": "Lifestyle / Emotional", "text": "...", "useFor": "testimonial section or About page" },\n` +
        `  "negativePrompt": "...",\n` +
        `  "recommendedSize": "1792x1024 for hero, 1024x1024 for GBP, 1080x1080 for social",\n` +
        `  "styleTag": "best style tag to use in Open Generative AI (e.g. Photorealistic, Cinematic, Commercial Photography)"\n` +
        `}\n` +
        `Return ONLY the JSON object. No markdown, no explanation.`
      );
      const s = text.indexOf("{"), e = text.lastIndexOf("}");
      if(s > -1 && e > -1) setPrompts(JSON.parse(text.slice(s, e+1)));
    } catch(err){ console.error(err); }
    setGenerating(false);
  }

  const promptList = prompts ? [
    { key:"prompt1", ...prompts.prompt1 },
    { key:"prompt2", ...prompts.prompt2 },
    { key:"prompt3", ...prompts.prompt3 },
  ] : [];

  return (
    <div>
      <div style={{...ib("info"), marginBottom:"1.5rem"}}>
        <p style={{margin:"0 0 3px", fontSize:13, fontWeight:500, color:"var(--color-text-info)"}}>
          <i className="ti ti-palette" style={{marginRight:6}} aria-hidden="true"/>Creative Studio — AI-generated images & videos for client websites, ads, and Google profiles
        </p>
        <p style={{margin:0, fontSize:12, color:"var(--color-text-info)"}}>
          Powered by Open Generative AI (open-source, runs locally). Generate hero images, Facebook ad creatives, and GBP photos tailored to each client's trade and city.
        </p>
      </div>

      <div style={{display:"flex", gap:8, marginBottom:"1.5rem", flexWrap:"wrap"}}>
        {[["generate","Generate Prompts","ti-sparkles"],["setup","Studio Setup","ti-terminal"],["workflow","Client Workflow","ti-list"]].map(([id,label,icon])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{...bs(activeTab===id), fontSize:12}}>
            <i className={`ti ${icon}`} style={{marginRight:5, fontSize:12}} aria-hidden="true"/>{label}
          </button>
        ))}
        <a href={`http://localhost:${studioPort}`} target="_blank" rel="noopener noreferrer"
          style={{padding:"6px 13px", fontSize:12, borderRadius:"var(--border-radius-md)", border:"0.5px solid var(--color-border-success)", background:"var(--color-background-success)", color:"var(--color-text-success)", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:5, marginLeft:"auto"}}>
          <i className="ti ti-external-link" style={{fontSize:12}} aria-hidden="true"/>Open Studio
        </a>
      </div>

      {/* ── GENERATE TAB ── */}
      {activeTab==="generate"&&(
        <div>
          {/* Load from prospect */}
          {prospects.length > 0 && (
            <div style={{marginBottom:"1rem"}}>
              <label style={lbl}>Load from a prospect (auto-fills trade & city)</label>
              <select onChange={e => {
                const p = prospects.find(x => x.id === parseInt(e.target.value));
                if(p){ setTrade(p.trade); setCity(p.city); setClientName(p.name); }
              }} style={{width:"100%", fontSize:13}}>
                <option value="">— Or fill in manually below —</option>
                {prospects.map(p => <option key={p.id} value={p.id}>{p.name} · {p.trade} · {p.city}</option>)}
              </select>
            </div>
          )}

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:"1rem"}}>
            <div>
              <label style={lbl}>Trade</label>
              <select value={trade} onChange={e => setTrade(e.target.value)} style={{width:"100%", fontSize:13}}>
                {TRADES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Client name (optional)</label>
              <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Smith's HVAC" style={{width:"100%", fontSize:13, boxSizing:"border-box"}}/>
            </div>
            <div>
              <label style={lbl}>City</label>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Tulsa" style={{width:"100%", fontSize:13, boxSizing:"border-box"}}/>
            </div>
          </div>

          {/* Content type selector */}
          <div style={{marginBottom:"1rem"}}>
            <label style={lbl}>Content type</label>
            <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8}}>
              {CONTENT_TYPES.map(c => (
                <div key={c.id} onClick={()=>setContentType(c.id)} style={{border:contentType===c.id?"2px solid var(--color-border-info)":"0.5px solid var(--color-border-tertiary)", borderRadius:"var(--border-radius-md)", padding:"10px 12px", cursor:"pointer", background:contentType===c.id?"var(--color-background-info)":"transparent"}}>
                  <i className={`ti ${c.icon}`} style={{fontSize:16, color:contentType===c.id?"var(--color-text-info)":"var(--color-text-secondary)", display:"block", marginBottom:4}} aria-hidden="true"/>
                  <p style={{fontSize:12, fontWeight:500, margin:"0 0 2px", color:contentType===c.id?"var(--color-text-info)":"var(--color-text-primary)"}}>{c.label}</p>
                  <p style={{fontSize:10, color:"var(--color-text-secondary)", margin:0, lineHeight:1.4}}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Brand palette preview */}
          <div style={{...card, marginBottom:"1rem", padding:"10px 14px"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div>
                <p style={{fontSize:11, color:"var(--color-text-secondary)", margin:"0 0 3px", textTransform:"uppercase", letterSpacing:".04em"}}>Auto-detected brand style for {trade}</p>
                <p style={{fontSize:12, color:"var(--color-text-primary)", margin:0}}>
                  <span style={{fontWeight:500}}>Palette:</span> {preset.palette} &nbsp;·&nbsp;
                  <span style={{fontWeight:500}}>Mood:</span> {preset.mood}
                </p>
              </div>
            </div>
          </div>

          <div style={{marginBottom:"1.25rem"}}>
            <label style={lbl}>Additional details (optional — specific job, season, service, offer)</label>
            <input value={customDetails} onChange={e => setCustomDetails(e.target.value)} placeholder="e.g. summer AC tune-up special, technician working on rooftop unit, happy family in cool home" style={{width:"100%", fontSize:13, boxSizing:"border-box"}}/>
          </div>

          <button onClick={generatePrompts} disabled={generating} style={{width:"100%", padding:"11px", fontSize:14, fontWeight:500, cursor:generating?"not-allowed":"pointer", borderRadius:"var(--border-radius-md)", border:"0.5px solid var(--color-border-secondary)", background:generating?"var(--color-background-secondary)":"transparent", color:generating?"var(--color-text-secondary)":"var(--color-text-primary)", marginBottom:"1.25rem"}}>
            {generating
              ? <><i className="ti ti-loader" style={{marginRight:8, animation:"spin 1s linear infinite"}} aria-hidden="true"/>Writing prompts...</>
              : <><i className="ti ti-sparkles" style={{marginRight:8}} aria-hidden="true"/>Generate 3 AI image prompts for {ct?.label} ↗</>}
          </button>

          {prompts && (
            <div>
              {/* Recommended settings bar */}
              <div style={{...ib("secondary"), marginBottom:"1rem", display:"flex", gap:16, flexWrap:"wrap"}}>
                <span style={{fontSize:12, color:"var(--color-text-secondary)"}}><strong>Recommended size:</strong> {prompts.recommendedSize}</span>
                <span style={{fontSize:12, color:"var(--color-text-secondary)"}}><strong>Style tag:</strong> {prompts.styleTag}</span>
              </div>

              {/* Prompts */}
              <div style={{display:"flex", flexDirection:"column", gap:10, marginBottom:"1rem"}}>
                {promptList.map((p, i) => (
                  <div key={p.key} style={card}>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
                      <div>
                        <p style={{fontSize:13, fontWeight:500, margin:"0 0 2px"}}>{p.title}</p>
                        <p style={{fontSize:11, color:"var(--color-text-secondary)", margin:0}}>Best for: {p.useFor}</p>
                      </div>
                      <div style={{display:"flex", gap:6}}>
                        <button onClick={()=>copyPrompt(p.text, i)} style={{padding:"4px 10px", fontSize:11, cursor:"pointer", borderRadius:6, border:"0.5px solid var(--color-border-tertiary)", background:copiedIdx===i?"var(--color-background-success)":"transparent", color:copiedIdx===i?"var(--color-text-success)":"var(--color-text-secondary)"}}>
                          <i className={`ti ti-${copiedIdx===i?"check":"copy"}`} style={{marginRight:4}} aria-hidden="true"/>{copiedIdx===i?"Copied!":"Copy"}
                        </button>
                        <a href={`http://localhost:${studioPort}`} target="_blank" rel="noopener noreferrer"
                          onClick={()=>copyPrompt(p.text, i)}
                          style={{padding:"4px 10px", fontSize:11, borderRadius:6, border:"0.5px solid var(--color-border-info)", background:"var(--color-background-info)", color:"var(--color-text-info)", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:4}}>
                          <i className="ti ti-external-link" style={{fontSize:11}} aria-hidden="true"/>Copy &amp; Open Studio
                        </a>
                      </div>
                    </div>
                    <div style={{background:"var(--color-background-secondary)", padding:"10px 12px", borderRadius:"var(--border-radius-md)", border:"0.5px solid var(--color-border-tertiary)"}}>
                      <p style={{fontSize:12, color:"var(--color-text-primary)", margin:0, lineHeight:1.7}}>{p.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Negative prompt */}
              {prompts.negativePrompt && (
                <div style={{...card, padding:"10px 14px"}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6}}>
                    <p style={{fontSize:12, fontWeight:500, margin:0, color:"var(--color-text-danger)"}}>
                      <i className="ti ti-ban" style={{marginRight:6}} aria-hidden="true"/>Negative prompt (paste into the negative prompt field)
                    </p>
                    <button onClick={()=>copyPrompt(prompts.negativePrompt, 99)} style={{padding:"3px 8px", fontSize:11, cursor:"pointer", borderRadius:6, border:"0.5px solid var(--color-border-tertiary)", background:copiedIdx===99?"var(--color-background-success)":"transparent", color:copiedIdx===99?"var(--color-text-success)":"var(--color-text-secondary)"}}>
                      <i className={`ti ti-${copiedIdx===99?"check":"copy"}`} style={{marginRight:4}} aria-hidden="true"/>{copiedIdx===99?"Copied!":"Copy"}
                    </button>
                  </div>
                  <p style={{fontSize:12, color:"var(--color-text-secondary)", margin:0, lineHeight:1.6}}>{prompts.negativePrompt}</p>
                </div>
              )}

              <div style={{...ib("warning"), marginTop:"1rem"}}>
                <p style={{margin:0, fontSize:12, color:"var(--color-text-warning)"}}>
                  <i className="ti ti-bulb" style={{marginRight:6}} aria-hidden="true"/>
                  <strong>Workflow:</strong> Click "Copy & Open Studio" → paste prompt into Open Generative AI → select style tag "{prompts.styleTag}" → set size → generate. Download the best result and add it to the client's website or GBP.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SETUP TAB ── */}
      {activeTab==="setup"&&(
        <div>
          <div style={{...ib("info"), marginBottom:"1.5rem"}}>
            <p style={{margin:"0 0 4px", fontSize:13, fontWeight:500, color:"var(--color-text-info)"}}>
              <i className="ti ti-brand-github" style={{marginRight:6}} aria-hidden="true"/>Open Generative AI — free, open-source, runs 100% on your computer
            </p>
            <p style={{margin:0, fontSize:12, color:"var(--color-text-info)"}}>
              Built on Next.js and Electron. Supports image generation (Stable Diffusion local + cloud via Muapi.ai) and video workflows. One-time setup, then it runs locally any time you need it.
            </p>
          </div>

          <div style={{marginBottom:"1.25rem"}}>
            <label style={lbl}>Studio local port (default 3000)</label>
            <div style={{display:"flex", gap:8}}>
              <input value={studioPort} onChange={e=>setStudioPort(e.target.value)} style={{width:100, fontSize:13}} placeholder="3000"/>
              <a href={`http://localhost:${studioPort}`} target="_blank" rel="noopener noreferrer" style={{padding:"6px 14px", fontSize:12, borderRadius:"var(--border-radius-md)", border:"0.5px solid var(--color-border-success)", background:"var(--color-background-success)", color:"var(--color-text-success)", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:6}}>
                <i className="ti ti-external-link" style={{fontSize:12}} aria-hidden="true"/>Test connection (http://localhost:{studioPort})
              </a>
            </div>
          </div>

          <p style={{fontSize:13, fontWeight:500, margin:"0 0 12px"}}>One-time setup — run these commands in your terminal</p>
          <div style={{display:"flex", flexDirection:"column", gap:8, marginBottom:"1.5rem"}}>
            {SETUP_STEPS.map((s, i) => (
              <div key={s.step} style={{border:"0.5px solid var(--color-border-tertiary)", borderRadius:"var(--border-radius-lg)", overflow:"hidden"}}>
                <div style={{padding:"10px 14px", display:"flex", alignItems:"center", gap:12, cursor:s.cmd?"pointer":"default"}} onClick={()=>s.cmd&&setExpandedStep(expandedStep===i?null:i)}>
                  <div style={{width:24, height:24, borderRadius:"50%", background:"var(--color-background-info)", color:"var(--color-text-info)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0}}>{s.step}</div>
                  <span style={{flex:1, fontSize:13, fontWeight:500}}>{s.title}</span>
                  {s.cmd&&<i className={`ti ti-chevron-${expandedStep===i?"up":"down"}`} style={{fontSize:12, color:"var(--color-text-secondary)"}} aria-hidden="true"/>}
                </div>
                {(s.cmd||expandedStep===i)&&(
                  <div style={{padding:"0 14px 12px 50px"}}>
                    {s.cmd&&(
                      <div style={{position:"relative", marginBottom:8}}>
                        <pre style={{fontSize:12, background:"var(--color-background-secondary)", padding:"10px 40px 10px 12px", borderRadius:"var(--border-radius-md)", border:"0.5px solid var(--color-border-tertiary)", margin:0, fontFamily:"'Cascadia Code','Consolas',monospace", color:"var(--color-text-primary)", whiteSpace:"pre-wrap", lineHeight:1.6}}>{s.cmd}</pre>
                        <button onClick={()=>navigator.clipboard?.writeText(s.cmd)} style={{position:"absolute", top:6, right:6, padding:"3px 6px", fontSize:10, cursor:"pointer", borderRadius:4, border:"0.5px solid var(--color-border-tertiary)", background:"var(--color-background-primary)", color:"var(--color-text-secondary)"}}>
                          <i className="ti ti-copy" style={{fontSize:11}} aria-hidden="true"/>
                        </button>
                      </div>
                    )}
                    <p style={{fontSize:12, color:"var(--color-text-secondary)", margin:0, lineHeight:1.5}}>{s.note}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{...card, padding:"14px 16px"}}>
            <p style={{fontSize:13, fontWeight:500, margin:"0 0 10px"}}>What you can generate for GoFieldWise clients</p>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
              {[
                ["Website hero images","Full-width banners for new client sites. Each trade gets its own branded style."],
                ["Google Business Profile photos","Unlock the '10+ photos' GBP optimization signal for every client."],
                ["Facebook & Instagram ads","Ad creatives for campaigns — no stock photo subscriptions needed."],
                ["Before/after job shots","Simulate job results for clients who don't have their own photos yet."],
                ["Seasonal promotions","Summer AC tune-up, winter heating, spring cleaning — auto-branded."],
                ["Team & about page photos","Professional-looking team imagery for small operators without photo budgets."],
              ].map(([title, desc], i)=>(
                <div key={i} style={{padding:"10px 12px", background:"var(--color-background-secondary)", borderRadius:"var(--border-radius-md)"}}>
                  <p style={{fontSize:12, fontWeight:500, margin:"0 0 3px"}}>{title}</p>
                  <p style={{fontSize:11, color:"var(--color-text-secondary)", margin:0, lineHeight:1.5}}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{marginTop:"1rem", ...ib("warning")}}>
            <p style={{margin:0, fontSize:12, color:"var(--color-text-warning)"}}>
              <i className="ti ti-alert-triangle" style={{marginRight:6}} aria-hidden="true"/>
              <strong>API key note:</strong> The core cloud generation uses Muapi.ai. For free local generation, use the built-in Stable Diffusion engine (no API key needed — images generate on your machine). For faster/higher quality, get a Muapi.ai key from their site and paste it into Open Generative AI settings.
            </p>
          </div>
        </div>
      )}

      {/* ── WORKFLOW TAB ── */}
      {activeTab==="workflow"&&(
        <div>
          <p style={{fontSize:13, fontWeight:500, margin:"0 0 16px"}}>How to use Creative Studio in your GoFieldWise client workflow</p>
          {[
            { step:"1", title:"New website client (Starter Site $497)", color:"danger", items:["Generate a Website Hero Image prompt for their trade and city","Open studio → paste prompt → generate 4 variations","Pick the best → download at 1792x1024","Drop into the new website as the homepage banner","Generate 3 GBP photos (team, job site, service truck)","Upload all to their Google Business Profile on day 1 of onboarding"] },
            { step:"2", title:"Existing site client (Local Dominator / Market Leader)", color:"warning", items:["Each month, generate fresh seasonal content (summer AC, winter heating, etc.)","Use Before/After prompts to create showcase images if client lacks job photos","Generate a new Facebook ad creative for their monthly Google Post","Use the Seasonal Promotion template for holidays and peak seasons","Deliver 4-6 new images per month as part of your retainer deliverables"] },
            { step:"3", title:"Facebook ad campaigns (upsell)", color:"info", items:["Generate 3 Facebook Ad prompts for the client's main service","Create 3 variations in Open Generative AI studio","A/B test different styles (professional, action shot, lifestyle)","Pair with the outreach email copy from the Email Queue tab","Offer as a $97/month social media content add-on"] },
            { step:"4", title:"Proposal closer (sales tool)", color:"success", items:["Before the proposal call, generate a mock hero image with the client's trade and city","Show them during the call: 'This is the kind of imagery we'd use on your site'","Most clients who see a visual mockup convert immediately","Takes 5 minutes — saves the deal"] },
          ].map((phase, i) => (
            <div key={i} style={{marginBottom:"1.25rem", border:`0.5px solid var(--color-border-${phase.color})`, borderRadius:"var(--border-radius-lg)", overflow:"hidden"}}>
              <div style={{padding:"10px 16px", background:`var(--color-background-${phase.color})`, borderBottom:`0.5px solid var(--color-border-${phase.color})`}}>
                <p style={{margin:0, fontSize:13, fontWeight:500, color:`var(--color-text-${phase.color})`}}>
                  <span style={{marginRight:8}}>Step {phase.step}</span>{phase.title}
                </p>
              </div>
              <div style={{padding:"12px 16px"}}>
                {phase.items.map((item, j) => (
                  <div key={j} style={{display:"flex", gap:10, alignItems:"flex-start", marginBottom:j < phase.items.length-1 ? 8 : 0}}>
                    <i className="ti ti-arrow-right" style={{fontSize:12, color:"var(--color-text-secondary)", marginTop:2, flexShrink:0}} aria-hidden="true"/>
                    <span style={{fontSize:13, color:"var(--color-text-primary)", lineHeight:1.5}}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{...card, padding:"12px 16px"}}>
            <p style={{fontSize:12, fontWeight:500, margin:"0 0 6px"}}>Pricing creative services as an add-on</p>
            <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8}}>
              {[["Website images","Included in $497 Starter Site build"],["Monthly content","$97/mo add-on — 6 images/month"],["Ad creatives","$97/mo add-on — 3 ad sets/month"]].map(([l,v],i)=>(
                <div key={i} style={{background:"var(--color-background-secondary)", borderRadius:"var(--border-radius-md)", padding:"10px 12px", textAlign:"center"}}>
                  <p style={{fontSize:12, fontWeight:500, margin:"0 0 3px"}}>{l}</p>
                  <p style={{fontSize:11, color:"var(--color-text-secondary)", margin:0}}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── AI SALES AGENT ────────────────────────────────────────────────
const FUNNEL_STAGES = [
  { id:"cold",           label:"Cold Outreach Sent",   color:"secondary", emoji:"🧊", desc:"Initial email sent, no reply yet" },
  { id:"interested",     label:"Showed Interest",       color:"info",      emoji:"🔥", desc:"Replied positively, wants to know more" },
  { id:"audit",          label:"Audit Requested",       color:"info",      emoji:"🔍", desc:"Asked for the free audit call" },
  { id:"proposal",       label:"Reviewing Proposal",    color:"warning",   emoji:"📄", desc:"Proposal sent, waiting on decision" },
  { id:"closing",        label:"Ready to Close",        color:"warning",   emoji:"💰", desc:"Asking about pricing or next steps" },
  { id:"onboarding",     label:"Signed — Onboarding",   color:"success",   emoji:"✅", desc:"Deal closed, starting work" },
  { id:"active",         label:"Active Client",         color:"success",   emoji:"⭐", desc:"Paying monthly client" },
  { id:"not_interested", label:"Not Interested",        color:"danger",    emoji:"❌", desc:"Declined — door left open" },
];

const RESPONSE_PLAYBOOK = [
  {
    stage:"interested",
    trigger:"Replies positively — 'sounds interesting', 'tell me more', 'how does it work'",
    aiDoes:"Thanks them, confirms free audit call, asks for best time this week. Short and easy to say yes to.",
    example:"'Hey [Name], glad this caught your attention! I'd love to run a quick free audit on [Business] — should only take 15 minutes and I'll show you exactly where the gaps are. Any time work this week?'"
  },
  {
    stage:"audit",
    trigger:"Asks for the audit — 'yes, run the audit', 'I'd like to see it', 'what do you find?'",
    aiDoes:"Confirms audit is underway. Tells them what you're checking. Sets expectation for turnaround (24 hours).",
    example:"'Perfect — I'm pulling up your Google Rankings, Maps listing, and website right now. I'll send you a summary by tomorrow. Is your email best for that?'"
  },
  {
    stage:"proposal",
    trigger:"Wants a proposal — 'what would this cost?', 'send me details', 'what's involved?'",
    aiDoes:"Confirms the right package based on their situation. Sets expectation for receiving the proposal within 24 hours.",
    example:"'Based on what I found, the Local Dominator plan at $397/month would push you to page 1 for [keyword] in 60-90 days. I'll send over a full proposal by tomorrow morning.'"
  },
  {
    stage:"closing",
    trigger:"Ready to move — 'how do we start?', 'I'm interested', 'send me the agreement'",
    aiDoes:"Celebrates the decision. Confirms package + start date. Tells them to expect a simple agreement by email.",
    example:"'Awesome — really looking forward to working with [Business]! I'll get the agreement over today. Once you sign I'll reach out to start the onboarding process this week.'"
  },
  {
    stage:"objection_price",
    trigger:"Price concern — 'that's too expensive', 'can you do less?', 'we have a tight budget'",
    aiDoes:"Acknowledges the concern without discounting. Reframes ROI. Offers the Starter package as entry point.",
    example:"'I totally get it — it's an investment. Most of our HVAC clients are getting 10-15 extra calls a month from page 1 rankings. Even 5 new jobs covers the cost. Want to start with the $197/month Starter plan instead?'"
  },
  {
    stage:"objection_timing",
    trigger:"Not now — 'maybe later', 'busy right now', 'check back in a few months'",
    aiDoes:"Respects the timeline. Asks when to follow up. Leaves door completely open with zero pressure.",
    example:"'No problem at all — timing is everything. When would be a good time for me to check back in? I'll reach out then, no pressure.'"
  },
];

function AISalesAgent({ prospects, emailQueue, setEmailQueue }) {
  const [activeTab, setActiveTab] = useState("pipeline");
  const [funnel, setFunnel] = useState({});
  const [selectedLead, setSelectedLead] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [aiReply, setAiReply] = useState("");
  const [simulateEmail, setSimulateEmail] = useState("");
  const [simulateTrade, setSimulateTrade] = useState("HVAC");
  const [simulateCity, setSimulateCity] = useState("Tulsa");
  const [simulateBiz, setSimulateBiz] = useState("");
  const [simulateStage, setSimulateStage] = useState("cold");
  const [classifyResult, setClassifyResult] = useState(null);
  const [classifying, setClassifying] = useState(false);

  // Build pipeline from emailQueue + prospects
  const pipeline = Object.values(
    emailQueue.reduce((acc, e) => {
      const key = e.to;
      if (!acc[key]) {
        acc[key] = {
          to: key,
          businessName: e.businessName,
          trade: e.trade,
          city: e.city,
          emails: [],
          stage: funnel[key]?.stage || "cold",
          lastActivity: e.createdAt,
          needsReview: funnel[key]?.needsHumanReview || false,
          reviewReason: funnel[key]?.reviewReason || "",
        };
      }
      acc[key].emails.push(e);
      if (e.createdAt > acc[key].lastActivity) acc[key].lastActivity = e.createdAt;
      return acc;
    }, {})
  ).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

  function updateStage(to, stage) {
    setFunnel(prev => ({ ...prev, [to]: { ...(prev[to] || {}), stage, lastUpdated: new Date().toISOString() } }));
    window.storage?.set("gfw_funnel", JSON.stringify({ ...funnel, [to]: { ...(funnel[to] || {}), stage } })).catch(() => {});
  }

  useEffect(() => {
    (async () => { try { const r = await window.storage.get("gfw_funnel"); if (r?.value) setFunnel(JSON.parse(r.value)); } catch {} })();
  }, []);

  async function generateAIReply(lead, incomingEmail) {
    setGenerating(true); setAiReply("");
    try {
      const prompt = await callClaude(
        `You are the AI sales agent for GoFieldWise, an Oklahoma local SEO company.\n\n` +
        `Write a reply email to this prospect.\n\n` +
        `Prospect: ${lead.businessName} | Trade: ${lead.trade} | City: ${lead.city}\n` +
        `Current funnel stage: ${funnel[lead.to]?.stage || lead.stage || "interested"}\n\n` +
        `Their message:\n"${incomingEmail}"\n\n` +
        `Reply rules:\n` +
        `- Under 120 words\n` +
        `- Sound like a real helpful person\n` +
        `- Move them to the next step in the funnel\n` +
        `- One clear call to action\n` +
        `- Sign off: Erick | GoFieldWise | biz@gofieldwise.com\n\n` +
        `Write ONLY the email body, starting directly with the greeting.`
      );
      setAiReply(prompt);
    } catch (e) { console.error(e); }
    setGenerating(false);
  }

  async function classifyAndRespond() {
    if (!simulateEmail.trim()) return;
    setClassifying(true); setClassifyResult(null); setAiReply("");
    try {
      const prospectInfo = { businessName: simulateBiz || "the business", trade: simulateTrade, city: simulateCity, stage: simulateStage, weakness: "weak SEO presence" };
      const classText = await callClaude(
        `Classify this email reply from a prospect for GoFieldWise (Oklahoma local SEO company).\n\n` +
        `Prospect: ${prospectInfo.businessName} | Trade: ${prospectInfo.trade} | Stage: ${prospectInfo.stage}\n\n` +
        `Their message: "${simulateEmail}"\n\n` +
        `Return ONLY this JSON:\n` +
        `{"classification":"interested|wants_audit|wants_proposal|ready_to_close|objection_price|objection_timing|not_interested|question|already_has_seo","sentiment":"positive|neutral|negative","urgency":"high|medium|low","newStage":"interested|audit|proposal|closing|onboarding|not_interested|cold","keyIntent":"one sentence","suggestedAction":"what to do next in 10 words","shouldAutoRespond":true}`
      );
      const s = classText.indexOf("{"), e2 = classText.lastIndexOf("}");
      const cls = s > -1 ? JSON.parse(classText.slice(s, e2 + 1)) : null;
      setClassifyResult(cls);

      if (cls && cls.shouldAutoRespond) {
        const replyText = await callClaude(
          `Write a reply email for GoFieldWise to ${prospectInfo.businessName} (${prospectInfo.trade}, ${prospectInfo.city}).\n` +
          `Their message: "${simulateEmail}"\n` +
          `Classification: ${cls.classification} — ${cls.keyIntent}\n` +
          `Moving them to stage: ${cls.newStage}\n\n` +
          `Rules: Under 120 words. Human tone. One CTA. Sign off: Erick | GoFieldWise | biz@gofieldwise.com\n` +
          `Write ONLY the email body.`
        );
        setAiReply(replyText.trim());
      }
    } catch (e) { console.error(e); }
    setClassifying(false);
  }

  function queueReply(lead) {
    if (!aiReply) return;
    const item = {
      id: `agent-${lead.to}-${Date.now()}`,
      prospectId: null,
      businessName: lead.businessName,
      to: lead.to,
      from: FROM_EMAIL,
      subject: `Re: GoFieldWise — ${lead.businessName}`,
      body: aiReply,
      status: "queued",
      type: "ai_response",
      trade: lead.trade,
      city: lead.city,
      aiGenerated: true,
      createdAt: new Date().toISOString(),
    };
    setEmailQueue(prev => [...prev, item]);
    setAiReply("");
    alert(`✓ AI reply queued for ${lead.businessName}. Go to Email Queue tab to review and export.`);
  }

  const stageInfo = (id) => FUNNEL_STAGES.find(s => s.id === id) || FUNNEL_STAGES[0];

  return (
    <div>
      <div style={{...ib("info"), marginBottom:"1.5rem"}}>
        <p style={{margin:"0 0 4px", fontSize:13, fontWeight:500, color:"var(--color-text-info)"}}>
          <i className="ti ti-robot" style={{marginRight:6}} aria-hidden="true"/>AI Sales Agent — automates email responses from cold outreach through closing and onboarding
        </p>
        <p style={{margin:0, fontSize:12, color:"var(--color-text-info)"}}>
          The local <code>emailer.js</code> agent reads replies, classifies intent, and generates responses. Run <code>node emailer.js autorespond</code> to process inbox automatically. Review responses here before sending.
        </p>
      </div>

      <div style={{display:"flex", gap:8, marginBottom:"1.5rem", flexWrap:"wrap"}}>
        {[["pipeline","Sales Pipeline","ti-chart-bar"],["simulate","Test AI Response","ti-flask"],["playbook","Response Playbook","ti-book"],["setup","Agent Setup","ti-settings"]].map(([id,label,icon])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{...bs(activeTab===id), fontSize:12}}>
            <i className={`ti ${icon}`} style={{marginRight:5, fontSize:12}} aria-hidden="true"/>{label}
          </button>
        ))}
      </div>

      {/* ── PIPELINE TAB ── */}
      {activeTab==="pipeline"&&(
        <div>
          {/* Funnel stats */}
          <div style={{display:"flex", gap:6, flexWrap:"wrap", marginBottom:"1.5rem", overflowX:"auto"}}>
            {FUNNEL_STAGES.slice(0,6).map(stage => {
              const count = pipeline.filter(p => (funnel[p.to]?.stage || "cold") === stage.id).length;
              return (
                <div key={stage.id} style={{background:"var(--color-background-secondary)", borderRadius:"var(--border-radius-md)", padding:"10px 14px", textAlign:"center", minWidth:90, flex:"0 0 auto"}}>
                  <p style={{fontSize:16, margin:"0 0 2px"}}>{stage.emoji}</p>
                  <p style={{fontSize:18, fontWeight:500, margin:"0 0 2px", color:`var(--color-text-${stage.color})`}}>{count}</p>
                  <p style={{fontSize:10, color:"var(--color-text-secondary)", margin:0, lineHeight:1.3}}>{stage.label}</p>
                </div>
              );
            })}
          </div>

          {pipeline.length === 0 ? (
            <div style={{padding:"2.5rem", textAlign:"center", border:"0.5px dashed var(--color-border-tertiary)", borderRadius:"var(--border-radius-lg)"}}>
              <i className="ti ti-users" style={{fontSize:32, color:"var(--color-text-secondary)", display:"block", marginBottom:8}} aria-hidden="true"/>
              <p style={{fontSize:14, color:"var(--color-text-secondary)", margin:"0 0 8px"}}>No prospects in pipeline yet.</p>
              <p style={{fontSize:12, color:"var(--color-text-secondary)", margin:0}}>Use the Smart Finder to find businesses, queue outreach emails, and they'll appear here as you send and receive replies.</p>
            </div>
          ) : (
            <div style={{display:"flex", flexDirection:"column", gap:8}}>
              {pipeline.map(lead => {
                const stage = stageInfo(funnel[lead.to]?.stage || lead.stage || "cold");
                const isSelected = selectedLead?.to === lead.to;
                return (
                  <div key={lead.to} style={{border:isSelected?"1px solid var(--color-border-info)":"0.5px solid var(--color-border-tertiary)", borderRadius:"var(--border-radius-lg)", overflow:"hidden"}}>
                    <div style={{padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, flexWrap:"wrap", cursor:"pointer"}} onClick={()=>setSelectedLead(isSelected?null:lead)}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap"}}>
                          <span style={{fontSize:15}}>{stage.emoji}</span>
                          <span style={{fontSize:14, fontWeight:500}}>{lead.businessName}</span>
                          <Badge type={stage.color}>{stage.label}</Badge>
                          {lead.needsReview&&<Badge type="danger">⚠ Needs review</Badge>}
                        </div>
                        <p style={{fontSize:12, color:"var(--color-text-secondary)", margin:0}}>{lead.trade} · {lead.city} · {lead.to} · {lead.emails.length} email{lead.emails.length!==1?"s":""}</p>
                      </div>
                      <div style={{display:"flex", flexDirection:"column", gap:5, alignItems:"flex-end", flexShrink:0}}>
                        <select value={funnel[lead.to]?.stage||"cold"} onClick={e=>e.stopPropagation()} onChange={e=>{e.stopPropagation();updateStage(lead.to,e.target.value);}} style={{fontSize:11, padding:"4px 8px", borderRadius:6}}>
                          {FUNNEL_STAGES.map(s=><option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
                        </select>
                        <button onClick={e=>{e.stopPropagation();setSelectedLead(isSelected?null:lead);}} style={{padding:"4px 10px", fontSize:11, cursor:"pointer", borderRadius:6, border:"0.5px solid var(--color-border-info)", background:"var(--color-background-info)", color:"var(--color-text-info)", whiteSpace:"nowrap"}}>
                          {isSelected?"Hide":"AI Reply ↗"}
                        </button>
                      </div>
                    </div>

                    {isSelected&&(
                      <div style={{borderTop:"0.5px solid var(--color-border-tertiary)", padding:"14px 16px", background:"var(--color-background-secondary)"}}>
                        {lead.needsReview&&(
                          <div style={{...ib("danger"), marginBottom:12}}>
                            <p style={{margin:0, fontSize:12, color:"var(--color-text-danger)"}}>
                              <i className="ti ti-alert-circle" style={{marginRight:6}} aria-hidden="true"/><strong>Flagged for review:</strong> {lead.reviewReason}
                            </p>
                          </div>
                        )}

                        <p style={{fontSize:12, fontWeight:500, color:"var(--color-text-secondary)", margin:"0 0 8px", textTransform:"uppercase", letterSpacing:".04em"}}>Generate AI reply</p>
                        <div style={{marginBottom:"0.75rem"}}>
                          <label style={lbl}>Paste their latest reply (or describe the situation)</label>
                          <textarea id={`reply-${lead.to}`} placeholder={`Paste ${lead.businessName}'s reply here, then click Generate...`} style={{width:"100%", height:80, fontSize:12, resize:"vertical", boxSizing:"border-box"}}/>
                        </div>
                        <button onClick={()=>generateAIReply(lead, document.getElementById(`reply-${lead.to}`)?.value||"")} disabled={generating}
                          style={{padding:"7px 14px", fontSize:12, cursor:generating?"not-allowed":"pointer", borderRadius:"var(--border-radius-md)", border:"0.5px solid var(--color-border-secondary)", background:"transparent", color:"var(--color-text-primary)", marginBottom:"1rem"}}>
                          {generating?<><i className="ti ti-loader" style={{marginRight:4, animation:"spin 1s linear infinite"}}/>Generating...</>:<><i className="ti ti-sparkles" style={{marginRight:4}}/>Generate AI reply ↗</>}
                        </button>

                        {aiReply&&(
                          <div>
                            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
                              <p style={{margin:0, fontSize:12, fontWeight:500}}>AI-generated reply</p>
                              <div style={{display:"flex", gap:6}}>
                                <CopyBtn text={aiReply}/>
                                <button onClick={()=>queueReply(lead)} style={{padding:"3px 8px", fontSize:11, cursor:"pointer", borderRadius:6, border:"0.5px solid var(--color-border-success)", background:"var(--color-background-success)", color:"var(--color-text-success)"}}>
                                  <i className="ti ti-send" style={{marginRight:4}}/>Queue & send
                                </button>
                              </div>
                            </div>
                            <pre style={{fontSize:12, lineHeight:1.7, margin:0, whiteSpace:"pre-wrap", fontFamily:"var(--font-sans)", color:"var(--color-text-primary)", background:"var(--color-background-primary)", padding:"10px 12px", borderRadius:"var(--border-radius-md)", border:"0.5px solid var(--color-border-tertiary)"}}>{aiReply}</pre>
                          </div>
                        )}

                        {/* Email history */}
                        {lead.emails.length > 0 && (
                          <div style={{marginTop:"1rem"}}>
                            <p style={{fontSize:11, fontWeight:500, color:"var(--color-text-secondary)", margin:"0 0 6px", textTransform:"uppercase", letterSpacing:".04em"}}>Email history ({lead.emails.length})</p>
                            {lead.emails.slice(-3).reverse().map((e,i)=>(
                              <div key={i} style={{padding:"8px 10px", background:"var(--color-background-primary)", borderRadius:"var(--border-radius-md)", border:"0.5px solid var(--color-border-tertiary)", marginBottom:5}}>
                                <div style={{display:"flex", justifyContent:"space-between", marginBottom:3}}>
                                  <span style={{fontSize:11, fontWeight:500}}>{e.subject}</span>
                                  <Badge type={e.status==="sent"?"success":e.status==="queued"?"info":"secondary"}>{e.status}</Badge>
                                </div>
                                <p style={{fontSize:11, color:"var(--color-text-secondary)", margin:0, lineHeight:1.5}}>{e.body?.slice(0,120)}...</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SIMULATE TAB ── */}
      {activeTab==="simulate"&&(
        <div>
          <div style={{...ib("warning"), marginBottom:"1.5rem"}}>
            <p style={{margin:0, fontSize:12, color:"var(--color-text-warning)"}}>
              <i className="ti ti-flask" style={{marginRight:6}} aria-hidden="true"/>Test the AI response engine with any email. Paste a prospect reply to see how the AI classifies it and what it would send back.
            </p>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:"1rem"}}>
            <div><label style={lbl}>Business name</label><input value={simulateBiz} onChange={e=>setSimulateBiz(e.target.value)} placeholder="e.g. Smith's HVAC" style={{width:"100%", fontSize:13, boxSizing:"border-box"}}/></div>
            <div><label style={lbl}>Trade</label><select value={simulateTrade} onChange={e=>setSimulateTrade(e.target.value)} style={{width:"100%", fontSize:13}}>{TRADES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div><label style={lbl}>Current stage</label><select value={simulateStage} onChange={e=>setSimulateStage(e.target.value)} style={{width:"100%", fontSize:13}}>{FUNNEL_STAGES.map(s=><option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}</select></div>
          </div>

          <div style={{marginBottom:"1.25rem"}}>
            <label style={lbl}>Paste prospect's reply email</label>
            <textarea value={simulateEmail} onChange={e=>setSimulateEmail(e.target.value)} placeholder={"Paste the email they sent back, e.g.:\n\n'Hey, yeah I've been wanting to get more calls from Google. What does this involve? How much does it cost?'"} style={{width:"100%", height:120, fontSize:13, resize:"vertical", boxSizing:"border-box"}}/>
          </div>

          <button onClick={classifyAndRespond} disabled={classifying||!simulateEmail.trim()} style={{width:"100%", padding:"10px", fontSize:14, fontWeight:500, cursor:classifying||!simulateEmail.trim()?"not-allowed":"pointer", borderRadius:"var(--border-radius-md)", border:"0.5px solid var(--color-border-secondary)", background:classifying||!simulateEmail.trim()?"var(--color-background-secondary)":"transparent", color:classifying||!simulateEmail.trim()?"var(--color-text-secondary)":"var(--color-text-primary)", marginBottom:"1.25rem"}}>
            {classifying?<><i className="ti ti-loader" style={{marginRight:8, animation:"spin 1s linear infinite"}} aria-hidden="true"/>Classifying & generating response...</>:<><i className="ti ti-robot" style={{marginRight:8}} aria-hidden="true"/>Run AI Agent on this email ↗</>}
          </button>

          {classifyResult&&(
            <div>
              <p style={{fontSize:13, fontWeight:500, margin:"0 0 10px"}}>AI Classification</p>
              <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:"1rem"}}>
                {[
                  ["Intent", classifyResult.classification?.replace(/_/g," "), classifyResult.sentiment==="positive"?"success":classifyResult.sentiment==="negative"?"danger":"warning"],
                  ["Moving to", classifyResult.newStage, "info"],
                  ["Urgency", classifyResult.urgency, classifyResult.urgency==="high"?"danger":classifyResult.urgency==="medium"?"warning":"secondary"],
                ].map(([l,v,c],i)=>(
                  <div key={i} style={{background:"var(--color-background-secondary)", borderRadius:"var(--border-radius-md)", padding:"10px 12px"}}>
                    <p style={{fontSize:10, color:"var(--color-text-secondary)", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:".04em"}}>{l}</p>
                    <Badge type={c}>{v}</Badge>
                  </div>
                ))}
              </div>
              <div style={{...card, marginBottom:"1rem", padding:"10px 14px"}}>
                <p style={{fontSize:11, color:"var(--color-text-secondary)", margin:"0 0 4px"}}>Key intent</p>
                <p style={{fontSize:13, margin:"0 0 8px"}}>{classifyResult.keyIntent}</p>
                <p style={{fontSize:11, color:"var(--color-text-secondary)", margin:"0 0 4px"}}>Suggested action</p>
                <p style={{fontSize:13, margin:0}}>{classifyResult.suggestedAction}</p>
              </div>
              {!classifyResult.shouldAutoRespond&&<div style={{...ib("danger"), marginBottom:"1rem"}}><p style={{margin:0, fontSize:12, color:"var(--color-text-danger)"}}><i className="ti ti-alert-circle" style={{marginRight:6}} aria-hidden="true"/>This reply should be handled manually — too complex or sensitive for auto-response.</p></div>}
            </div>
          )}

          {aiReply&&(
            <div style={card}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
                <p style={{margin:0, fontSize:13, fontWeight:500}}><i className="ti ti-robot" style={{marginRight:6, color:"var(--color-text-success)"}} aria-hidden="true"/>AI-generated response</p>
                <CopyBtn text={aiReply}/>
              </div>
              <pre style={{fontSize:13, lineHeight:1.7, margin:0, whiteSpace:"pre-wrap", fontFamily:"var(--font-sans)", color:"var(--color-text-primary)", background:"var(--color-background-secondary)", padding:"1rem", borderRadius:"var(--border-radius-md)", border:"0.5px solid var(--color-border-tertiary)"}}>{aiReply}</pre>
            </div>
          )}
        </div>
      )}

      {/* ── PLAYBOOK TAB ── */}
      {activeTab==="playbook"&&(
        <div>
          <p style={{fontSize:13, color:"var(--color-text-secondary)", margin:"0 0 1.25rem", lineHeight:1.7}}>
            The AI agent uses this playbook to decide how to respond at each stage. Every response moves the prospect one step closer to closing. Review these to understand how the automation works.
          </p>
          {RESPONSE_PLAYBOOK.map((p, i) => (
            <div key={i} style={{...card, marginBottom:"1rem", padding:"14px 16px"}}>
              <div style={{display:"flex", gap:10, alignItems:"flex-start", marginBottom:10}}>
                <Badge type="info">{FUNNEL_STAGES.find(s=>s.id===p.stage)?.emoji} {p.stage}</Badge>
              </div>
              <p style={{fontSize:12, fontWeight:500, color:"var(--color-text-secondary)", margin:"0 0 4px"}}>Triggered when prospect says:</p>
              <p style={{fontSize:13, margin:"0 0 10px", color:"var(--color-text-primary)"}}>{p.trigger}</p>
              <p style={{fontSize:12, fontWeight:500, color:"var(--color-text-secondary)", margin:"0 0 4px"}}>AI does:</p>
              <p style={{fontSize:13, margin:"0 0 10px", color:"var(--color-text-primary)"}}>{p.aiDoes}</p>
              <p style={{fontSize:12, fontWeight:500, color:"var(--color-text-secondary)", margin:"0 0 4px"}}>Example response tone:</p>
              <div style={{background:"var(--color-background-secondary)", padding:"10px 12px", borderRadius:"var(--border-radius-md)", border:"0.5px solid var(--color-border-tertiary)"}}>
                <p style={{fontSize:12, color:"var(--color-text-primary)", margin:0, lineHeight:1.7, fontStyle:"italic"}}>{p.example}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SETUP TAB ── */}
      {activeTab==="setup"&&(
        <div>
          <div style={{...ib("success"), marginBottom:"1.5rem"}}>
            <p style={{margin:"0 0 4px", fontSize:13, fontWeight:500, color:"var(--color-text-success)"}}>
              <i className="ti ti-circle-check" style={{marginRight:6}} aria-hidden="true"/>Everything runs from your local machine — no third-party automation tools needed
            </p>
            <p style={{margin:0, fontSize:12, color:"var(--color-text-success)"}}>
              The emailer.js agent handles the full cycle: read inbox → classify intent → generate response → queue/send. You control whether it sends automatically or waits for your approval.
            </p>
          </div>

          <p style={{fontSize:13, fontWeight:500, margin:"0 0 12px"}}>Step 1 — Add ANTHROPIC_API_KEY to your .env</p>
          <div style={{background:"var(--color-background-secondary)", padding:"10px 14px", borderRadius:"var(--border-radius-md)", border:"0.5px solid var(--color-border-tertiary)", marginBottom:"1.25rem", fontFamily:"'Cascadia Code','Consolas',monospace", fontSize:12}}>
            <p style={{margin:"0 0 4px", color:"var(--color-text-secondary)"}}># C:\Users\erock\Claude_bot\LocalClaudeAgent\.env</p>
            <p style={{margin:"0 0 4px", color:"var(--color-text-primary)"}}>GOFIELDWISE_EMAIL_PASSWORD=your_password</p>
            <p style={{margin:"0 0 4px", color:"var(--color-text-primary)"}}>ANTHROPIC_API_KEY=sk-ant-...</p>
            <p style={{margin:"0 0 4px", color:"var(--color-text-secondary)"}}># Optional: auto-send without approval</p>
            <p style={{margin:0, color:"var(--color-text-primary)"}}>AUTO_SEND=false</p>
            <p style={{margin:0, color:"var(--color-text-secondary)"}}># Optional: check every 30 min in watch mode</p>
            <p style={{margin:0, color:"var(--color-text-primary)"}}>WATCH_INTERVAL_MIN=15</p>
          </div>

          <p style={{fontSize:13, fontWeight:500, margin:"0 0 12px"}}>Step 2 — Run modes</p>
          <div style={{display:"flex", flexDirection:"column", gap:8, marginBottom:"1.5rem"}}>
            {[
              { cmd:"node emailer.js autorespond", label:"One-time cycle", desc:"Checks inbox, classifies all replies, generates AI responses, queues them. Run this manually whenever you want to process replies." },
              { cmd:"node emailer.js watch",       label:"Daemon mode (recommended)", desc:"Runs autorespond every 15 minutes automatically. Keep this terminal open. Set WATCH_INTERVAL_MIN to change frequency." },
              { cmd:"node emailer.js send",         label:"Send queued emails", desc:"Sends all emails in the queue — both your original outreach and AI-generated responses waiting for approval." },
              { cmd:"node emailer.js status",       label:"Pipeline summary", desc:"Shows your funnel breakdown, how many leads are at each stage, and who needs human review." },
            ].map((r, i) => (
              <div key={i} style={{...card, padding:"12px 14px"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6}}>
                  <div>
                    <Badge type="secondary">{r.label}</Badge>
                    <p style={{fontSize:12, color:"var(--color-text-secondary)", margin:"4px 0 0"}}>{r.desc}</p>
                  </div>
                  <button onClick={()=>navigator.clipboard?.writeText(r.cmd)} style={{padding:"4px 10px", fontSize:11, cursor:"pointer", borderRadius:6, border:"0.5px solid var(--color-border-tertiary)", background:"transparent", color:"var(--color-text-secondary)", whiteSpace:"nowrap", flexShrink:0, marginLeft:12}}>
                    <i className="ti ti-copy" style={{marginRight:4}} aria-hidden="true"/>Copy
                  </button>
                </div>
                <pre style={{fontSize:12, background:"var(--color-background-secondary)", padding:"8px 12px", borderRadius:"var(--border-radius-md)", margin:0, fontFamily:"'Cascadia Code','Consolas',monospace", color:"var(--color-text-primary)"}}>{r.cmd}</pre>
              </div>
            ))}
          </div>

          <div style={{...ib("warning")}}>
            <p style={{margin:"0 0 6px", fontSize:12, fontWeight:500, color:"var(--color-text-warning)"}}>
              <i className="ti ti-shield" style={{marginRight:6}} aria-hidden="true"/>Approval mode vs Auto-send mode
            </p>
            <p style={{margin:0, fontSize:12, color:"var(--color-text-warning)", lineHeight:1.7}}>
              With <code>AUTO_SEND=false</code> (default): AI generates responses and queues them with status <code>queued_ai</code>. You review them in the Email Queue tab, then run <code>node emailer.js send</code> to send.<br/><br/>
              With <code>AUTO_SEND=true</code>: responses go out immediately after generation. Recommended only after you've tested the AI responses and trust the outputs. Start with approval mode.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SEO DELIVERY ──────────────────────────────────────────────────
const WHAT_AI_NEEDS = [
  { service:"Keyword Strategy",        needs:["Client website URL","Their trade (HVAC/Plumbing/etc)","Target city/service area"],                      canAutomate:true,  how:"AI fetches the site, identifies the trade, and generates targeted keywords automatically." },
  { service:"Title Tag & Meta Fixes",  needs:["Website URL","Access to read current title/H1/meta"],                                                   canAutomate:true,  how:"AI fetches the live page and rewrites all tags. You copy-paste into their CMS." },
  { service:"Content Calendar",        needs:["Trade","City","Current GSC ranking data (optional)"],                                                    canAutomate:true,  how:"AI generates 12 blog post ideas with keywords and outlines. You or client publishes them." },
  { service:"On-Page Implementation",  needs:["CMS access (WordPress/Wix login)","Specific pages to fix"],                                             canAutomate:false, how:"You log in and make the changes manually, or client does it. AI writes exactly what to change." },
  { service:"Google Search Console",   needs:["GSC access (client adds you as Full User)","CSV export of current rankings"],                           canAutomate:true,  how:"Import CSV into Local SEO Tool to find sweet-spot keywords. AI generates the fix for each." },
  { service:"GBP Optimization",        needs:["GBP manager access","Business photos","List of all services"],                                          canAutomate:false, how:"AI writes the description, service list, and post copy. You paste it into their GBP manually." },
  { service:"Citation Building",       needs:["Business name, address, phone (NAP)","List of target directories"],                                     canAutomate:false, how:"AI generates consistent NAP data and a submission checklist. Manual submission per directory." },
  { service:"Monthly Reporting",       needs:["GSC access","GBP insights screenshot","Last month's baseline"],                                         canAutomate:true,  how:"AI generates a plain-English client report from the data you paste in." },
];

const PLATFORMS = ["WordPress","Wix","Squarespace","Webflow","Shopify","Custom HTML","Not sure"];

function SEODelivery({ prospects }) {
  const [activeTab, setActiveTab] = useState("auto");
  const [url, setUrl] = useState("");
  const [clientName, setClientName] = useState("");
  const [trade, setTrade] = useState("HVAC");
  const [city, setCity] = useState("Tulsa");
  const [platform, setPlatform] = useState("WordPress");
  const [gscData, setGscData] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("");
  const [result, setResult] = useState(null);
  const [usePros, setUsePros] = useState("");
  const [activeSection, setActiveSection] = useState("keywords");
  const [copyState, setCopyState] = useState({});

  function loadProspect(id) {
    const p = prospects.find(x => x.id === parseInt(id));
    if (!p) return;
    setUsePros(id);
    setClientName(p.name);
    setTrade(p.trade);
    setCity(p.city);
    if (p.website) setUrl(p.website);
  }

  function copySection(key, text) {
    navigator.clipboard?.writeText(text);
    setCopyState(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopyState(prev => ({ ...prev, [key]: false })), 1800);
  }

  async function runFullAudit() {
    if (!url.trim()) return;
    setLoading(true); setResult(null); setPhase("Fetching live website...");
    try {
      // Step 1: fetch live site + generate everything in one comprehensive call
      setPhase("Analyzing site, researching keywords, generating optimized content...");
      const raw = await callClaude(
        `You are a local SEO expert. Perform a complete SEO optimization for this business:\n\n` +
        `Business: ${clientName || "the business"}\n` +
        `Website: ${url}\n` +
        `Trade: ${trade}\n` +
        `City: ${city}, Oklahoma\n` +
        `Platform: ${platform}\n` +
        (gscData ? `Google Search Console data:\n${gscData.slice(0, 1000)}\n` : "") +
        `\nUse web search to:\n` +
        `1. Fetch ${url} and read the actual current title tag, H1, meta description, and main body content\n` +
        `2. Search "${trade} ${city} Oklahoma" to see who ranks #1, #2, #3 — those are the competitors\n` +
        `3. Find 8-10 real keywords this ${trade} business in ${city} should target\n\n` +
        `Return ONLY this JSON object (no other text):\n` +
        `{\n` +
        `  "currentTitle": "actual title tag from their site",\n` +
        `  "currentH1": "actual H1 from their site",\n` +
        `  "currentMeta": "actual meta description or Not found",\n` +
        `  "newTitle": "optimized title tag under 60 chars with city + trade + brand",\n` +
        `  "newH1": "optimized H1 with primary keyword",\n` +
        `  "newMeta": "optimized meta description under 155 chars",\n` +
        `  "primaryKeyword": "their #1 target keyword",\n` +
        `  "keywords": [{"keyword":"...","monthlySearches":number,"difficulty":"Low/Medium/High","intent":"commercial/informational","priority":"High/Medium"}],\n` +
        `  "competitors": [{"name":"...","url":"...","whyTheyRank":"one sentence"}],\n` +
        `  "contentGaps": ["topic 1","topic 2","topic 3"],\n` +
        `  "quickWins": ["specific fix 1","specific fix 2","specific fix 3","fix 4","fix 5"],\n` +
        `  "contentCalendar": [{"week":1,"title":"blog post title","keyword":"target keyword","outline":"3-sentence outline","wordCount":600},{"week":2,"title":"...","keyword":"...","outline":"...","wordCount":600},{"week":3,"title":"...","keyword":"...","outline":"...","wordCount":600},{"week":4,"title":"...","keyword":"...","outline":"...","wordCount":600},{"week":5,"title":"...","keyword":"...","outline":"...","wordCount":600},{"week":6,"title":"...","keyword":"...","outline":"...","wordCount":600},{"week":7,"title":"...","keyword":"...","outline":"...","wordCount":600},{"week":8,"title":"...","keyword":"...","outline":"...","wordCount":600}],\n` +
        `  "gbpDescription": "optimized Google Business Profile description 200-750 chars with keywords",\n` +
        `  "schemaNeeded": "LocalBusiness schema — name, address, phone, hours, services",\n` +
        `  "implementationSteps": [{"step":1,"platform":"${platform}","action":"exact step to take","where":"where in the CMS to find it"},{"step":2,"platform":"${platform}","action":"...","where":"..."},{"step":3,"platform":"${platform}","action":"...","where":"..."},{"step":4,"platform":"${platform}","action":"...","where":"..."},{"step":5,"platform":"${platform}","action":"...","where":"..."}],\n` +
        `  "estimatedTimeToPage1": "realistic estimate in weeks",\n` +
        `  "summary": "3-sentence plain English summary of their situation and biggest opportunity"\n` +
        `}`,
        true, 4000
      );
      const s = raw.indexOf("{"), e = raw.lastIndexOf("}");
      if (s === -1 || e === -1) throw new Error("Could not parse audit results. Try again.");
      const data = JSON.parse(raw.slice(s, e + 1));
      setResult(data);
      setPhase("");
      setActiveSection("keywords");
    } catch (err) { setPhase("Error: " + err.message); }
    setLoading(false);
  }

  const sectionBtn = (id, label, icon) => (
    <button onClick={() => setActiveSection(id)} style={{ ...bs(activeSection === id), fontSize: 12 }}>
      <i className={`ti ${icon}`} style={{ marginRight: 5, fontSize: 12 }} aria-hidden="true" />{label}
    </button>
  );

  const diffColor = { Low: "success", Medium: "warning", High: "danger" };

  return (
    <div>
      {/* Header info */}
      <div style={{ ...ib("info"), marginBottom: "1.5rem" }}>
        <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 500, color: "var(--color-text-info)" }}>
          <i className="ti ti-rocket" style={{ marginRight: 6 }} aria-hidden="true" />
          SEO Delivery — AI automatically generates the full SEO plan for any client in one click
        </p>
        <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-info)" }}>
          Enter a client's URL → AI fetches the live site → generates keywords, fixed title tags, content calendar, GBP copy, and step-by-step implementation instructions for their specific platform.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[["auto", "Auto SEO Audit", "ti-rocket"], ["needs", "What AI Needs", "ti-checklist"], ["flow", "Full Service Map", "ti-sitemap"]].map(([id, label, icon]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{ ...bs(activeTab === id), fontSize: 12 }}>
            <i className={`ti ${icon}`} style={{ marginRight: 5 }} aria-hidden="true" />{label}
          </button>
        ))}
      </div>

      {/* ── AUTO AUDIT TAB ── */}
      {activeTab === "auto" && (
        <div>
          {/* Load from prospect */}
          {prospects.length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={lbl}>Load a prospect (auto-fills fields)</label>
              <select value={usePros} onChange={e => loadProspect(e.target.value)} style={{ width: "100%", fontSize: 13 }}>
                <option value="">— Or fill in manually below —</option>
                {prospects.filter(p => p.hasWebsite && p.website).map(p => (
                  <option key={p.id} value={p.id}>{p.name} · {p.trade} · {p.city} · {p.website}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1rem" }}>
            <div>
              <label style={lbl}>Client name</label>
              <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Superior Air Services" style={{ width: "100%", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={lbl}>Website URL *</label>
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://superiorairservicellc.com" style={{ width: "100%", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={lbl}>Trade</label>
              <select value={trade} onChange={e => { const t=e.target.value; setTrade(t); if(!clientName) setCity(""); }} style={{ width: "100%", fontSize: 13 }}>{TRADES.map(t => <option key={t}>{t}</option>)}</select>
            </div>
            <div>
              <label style={lbl}>City</label>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Tulsa" style={{ width: "100%", fontSize: 13, boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={lbl}>Website platform</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PLATFORMS.map(p => (
                <button key={p} onClick={() => setPlatform(p)} style={{ ...bs(platform === p), fontSize: 11 }}>{p}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={lbl}>Paste Google Search Console data (optional — paste from GSC → Performance → Export)</label>
            <textarea value={gscData} onChange={e => setGscData(e.target.value)} placeholder="Optional: paste GSC export here for more accurate keyword targeting..." style={{ width: "100%", height: 70, fontSize: 12, resize: "vertical", boxSizing: "border-box" }} />
          </div>

          <button onClick={runFullAudit} disabled={loading || !url.trim()} style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: 500, cursor: loading || !url.trim() ? "not-allowed" : "pointer", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", background: loading || !url.trim() ? "var(--color-background-secondary)" : "transparent", color: loading || !url.trim() ? "var(--color-text-secondary)" : "var(--color-text-primary)", marginBottom: "1.25rem" }}>
            {loading ? <><i className="ti ti-loader" style={{ marginRight: 8, animation: "spin 1s linear infinite" }} aria-hidden="true" />{phase}</> : <><i className="ti ti-rocket" style={{ marginRight: 8 }} aria-hidden="true" />Run Full Auto SEO Audit for {clientName || "client"} ↗</>}
          </button>

          {phase && !loading && <div style={{ ...ib("danger"), marginBottom: "1rem" }}><p style={{ margin: 0, fontSize: 13, color: "var(--color-text-danger)" }}>{phase}</p></div>}

          {/* Results */}
          {result && (
            <div>
              {/* Summary banner */}
              <div style={{ ...ib("success"), marginBottom: "1.25rem" }}>
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 500, color: "var(--color-text-success)" }}>
                  <i className="ti ti-circle-check" style={{ marginRight: 6 }} aria-hidden="true" />Audit complete for {clientName} · Estimated time to page 1: {result.estimatedTimeToPage1}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-success)" }}>{result.summary}</p>
              </div>

              {/* Section tabs */}
              <div style={{ display: "flex", gap: 6, marginBottom: "1.25rem", flexWrap: "wrap" }}>
                {sectionBtn("keywords", "Keywords", "ti-search")}
                {sectionBtn("tags", "Title & Meta Fixes", "ti-code")}
                {sectionBtn("content", "Content Calendar", "ti-calendar")}
                {sectionBtn("gbp", "GBP Copy", "ti-map-pin")}
                {sectionBtn("implement", "How to Implement", "ti-tool")}
                {sectionBtn("competitors", "Competitors", "ti-users")}
              </div>

              {/* Keywords */}
              {activeSection === "keywords" && (
                <div style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Target keywords for {clientName}</p>
                    <button onClick={() => copySection("kw", result.keywords?.map(k => `${k.keyword} — ${k.monthlySearches}/mo — ${k.difficulty} — ${k.intent}`).join("\n"))} style={{ padding: "3px 8px", fontSize: 11, cursor: "pointer", borderRadius: 6, border: "0.5px solid var(--color-border-tertiary)", background: copyState.kw ? "var(--color-background-success)" : "transparent", color: copyState.kw ? "var(--color-text-success)" : "var(--color-text-secondary)" }}>
                      <i className={`ti ti-${copyState.kw ? "check" : "copy"}`} style={{ marginRight: 4 }} />{copyState.kw ? "Copied!" : "Copy all"}
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {result.keywords?.map((k, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 10px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)", flexWrap: "wrap" }}>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: k.priority === "High" ? 500 : 400 }}>{k.keyword}</span>
                        <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{k.monthlySearches?.toLocaleString()}/mo</span>
                        <Badge type={diffColor[k.difficulty] || "secondary"}>{k.difficulty}</Badge>
                        <Badge type="secondary">{k.intent}</Badge>
                        {k.priority === "High" && <Badge type="info">Priority</Badge>}
                      </div>
                    ))}
                  </div>
                  {result.contentGaps?.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: ".04em" }}>Content gaps vs competitors</p>
                      {result.contentGaps.map((g, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "6px 0", borderBottom: i < result.contentGaps.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                          <i className="ti ti-alert-triangle" style={{ fontSize: 12, color: "var(--color-text-warning)", marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
                          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{g}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Title & Meta */}
              {activeSection === "tags" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Title Tag", current: result.currentTitle, fixed: result.newTitle, key: "title", limit: "60 chars max" },
                    { label: "H1 Heading", current: result.currentH1, fixed: result.newH1, key: "h1", limit: "Include primary keyword" },
                    { label: "Meta Description", current: result.currentMeta, fixed: result.newMeta, key: "meta", limit: "155 chars max" },
                  ].map(item => (
                    <div key={item.key} style={card}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{item.label} <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontWeight: 400 }}>— {item.limit}</span></p>
                        <button onClick={() => copySection(item.key, item.fixed)} style={{ padding: "3px 8px", fontSize: 11, cursor: "pointer", borderRadius: 6, border: "0.5px solid var(--color-border-tertiary)", background: copyState[item.key] ? "var(--color-background-success)" : "transparent", color: copyState[item.key] ? "var(--color-text-success)" : "var(--color-text-secondary)" }}>
                          <i className={`ti ti-${copyState[item.key] ? "check" : "copy"}`} style={{ marginRight: 4 }} />{copyState[item.key] ? "Copied!" : "Copy new"}
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div style={{ background: "var(--color-background-danger)", borderRadius: "var(--border-radius-md)", padding: "10px 12px" }}>
                          <p style={{ fontSize: 10, color: "var(--color-text-danger)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: ".04em" }}>Current (needs fixing)</p>
                          <p style={{ fontSize: 12, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.5 }}>{item.current || "Not found"}</p>
                        </div>
                        <div style={{ background: "var(--color-background-success)", borderRadius: "var(--border-radius-md)", padding: "10px 12px" }}>
                          <p style={{ fontSize: 10, color: "var(--color-text-success)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: ".04em" }}>Optimized (use this)</p>
                          <p style={{ fontSize: 12, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{item.fixed}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{ ...ib("info") }}>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-info)" }}>
                      <i className="ti ti-info-circle" style={{ marginRight: 6 }} aria-hidden="true" />
                      <strong>How to apply:</strong> Go to Implementation tab for step-by-step instructions specific to {platform}.
                    </p>
                  </div>
                </div>
              )}

              {/* Content Calendar */}
              {activeSection === "content" && (
                <div style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>8-week content calendar for {clientName}</p>
                    <button onClick={() => copySection("cal", result.contentCalendar?.map(w => `Week ${w.week}: ${w.title}\nKeyword: ${w.keyword}\nOutline: ${w.outline}\nTarget: ~${w.wordCount} words`).join("\n\n"))} style={{ padding: "3px 8px", fontSize: 11, cursor: "pointer", borderRadius: 6, border: "0.5px solid var(--color-border-tertiary)", background: copyState.cal ? "var(--color-background-success)" : "transparent", color: copyState.cal ? "var(--color-text-success)" : "var(--color-text-secondary)" }}>
                      <i className={`ti ti-${copyState.cal ? "check" : "copy"}`} style={{ marginRight: 4 }} />{copyState.cal ? "Copied!" : "Copy all"}
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.contentCalendar?.map((w, i) => (
                      <div key={i} style={{ padding: "12px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)" }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-background-info)", color: "var(--color-text-info)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>W{w.week}</div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 3px" }}>{w.title}</p>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                              <Badge type="info">{w.keyword}</Badge>
                              <Badge type="secondary">~{w.wordCount} words</Badge>
                            </div>
                            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>{w.outline}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GBP */}
              {activeSection === "gbp" && (
                <div style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Optimized Google Business Profile description</p>
                    <button onClick={() => copySection("gbp", result.gbpDescription)} style={{ padding: "3px 8px", fontSize: 11, cursor: "pointer", borderRadius: 6, border: "0.5px solid var(--color-border-tertiary)", background: copyState.gbp ? "var(--color-background-success)" : "transparent", color: copyState.gbp ? "var(--color-text-success)" : "var(--color-text-secondary)" }}>
                      <i className={`ti ti-${copyState.gbp ? "check" : "copy"}`} style={{ marginRight: 4 }} />{copyState.gbp ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div style={{ background: "var(--color-background-secondary)", padding: "12px 14px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)", marginBottom: "1rem" }}>
                    <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, color: "var(--color-text-primary)" }}>{result.gbpDescription}</p>
                  </div>
                  <div style={{ ...ib("info") }}>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-info)" }}>
                      <i className="ti ti-map-pin" style={{ marginRight: 6 }} aria-hidden="true" />
                      <strong>How to apply:</strong> Copy → go to Google Business Profile → Edit profile → Business description → paste → Save. Also add: schema markup ({result.schemaNeeded}).
                    </p>
                  </div>
                </div>
              )}

              {/* Implementation steps */}
              {activeSection === "implement" && (
                <div>
                  <div style={{ ...ib("warning"), marginBottom: "1rem" }}>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-warning)" }}>
                      <i className="ti ti-tool" style={{ marginRight: 6 }} aria-hidden="true" />
                      These are step-by-step instructions specific to <strong>{platform}</strong>. After each step, request indexing in Google Search Console → URL Inspection.
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1rem" }}>
                    {result.implementationSteps?.map((s, i) => (
                      <div key={i} style={{ padding: "12px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)", display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--color-background-success)", color: "var(--color-text-success)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{s.step}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 4px" }}>{s.action}</p>
                          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0 }}>Where: {s.where}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={card}>
                    <p style={{ fontSize: 12, fontWeight: 500, margin: "0 0 10px" }}>Quick wins to do right now</p>
                    {result.quickWins?.map((w, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "6px 0", borderBottom: i < result.quickWins.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                        <i className="ti ti-arrow-right" style={{ fontSize: 12, color: "var(--color-text-success)", marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
                        <span style={{ fontSize: 12, color: "var(--color-text-primary)" }}>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competitors */}
              {activeSection === "competitors" && (
                <div style={card}>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 12px" }}>Who's outranking {clientName} right now</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.competitors?.map((c, i) => (
                      <div key={i} style={{ padding: "12px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <Badge type="danger">#{i + 1}</Badge>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                          {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--color-text-info)", textDecoration: "none" }}><i className="ti ti-external-link" style={{ fontSize: 11 }} /></a>}
                        </div>
                        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0 }}>{c.whyTheyRank}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── WHAT AI NEEDS TAB ── */}
      {activeTab === "needs" && (
        <div>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 1.25rem", lineHeight: 1.7 }}>
            For every service you offer, here's exactly what the AI needs to do the work — and what requires you to manually log in vs what's fully automated.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {WHAT_AI_NEEDS.map((s, i) => (
              <div key={i} style={{ border: `0.5px solid ${s.canAutomate ? "var(--color-border-success)" : "var(--color-border-warning)"}`, borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", background: s.canAutomate ? "var(--color-background-success)" : "var(--color-background-warning)", display: "flex", alignItems: "center", gap: 10 }}>
                  <i className={`ti ti-${s.canAutomate ? "robot" : "user"}`} style={{ fontSize: 14, color: s.canAutomate ? "var(--color-text-success)" : "var(--color-text-warning)" }} aria-hidden="true" />
                  <span style={{ fontSize: 13, fontWeight: 500, color: s.canAutomate ? "var(--color-text-success)" : "var(--color-text-warning)" }}>{s.service}</span>
                  <Badge type={s.canAutomate ? "success" : "warning"}>{s.canAutomate ? "🤖 AI automated" : "👤 Needs you"}</Badge>
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: ".04em" }}>What AI needs:</p>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                    {s.needs.map((n, j) => <Badge key={j} type="secondary">{n}</Badge>)}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>{s.how}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SERVICE MAP TAB ── */}
      {activeTab === "flow" && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 12px" }}>Full service delivery map — what's automated vs what you do manually</p>
          {[
            { phase: "SALES PHASE", color: "info", steps: [
              { tool: "Smart Finder", what: "AI finds prospects with weak SEO or no website", auto: true },
              { tool: "Email Queue", what: "AI writes personalized outreach email", auto: true },
              { tool: "AI Sales Agent", what: "AI reads replies, classifies intent, writes responses", auto: true },
              { tool: "Proposals tab", what: "AI writes full personalized proposal", auto: true },
            ]},
            { phase: "ONBOARDING PHASE", color: "warning", steps: [
              { tool: "Onboarding tab", what: "Checklist guides you to request GSC, GBP, website access", auto: false },
              { tool: "Index Health tab", what: "AI audits how many pages Google sees", auto: true },
              { tool: "SEO Delivery tab (this tab)", what: "AI generates full keyword strategy, fixes, content calendar", auto: true },
              { tool: "You → CMS", what: "You log into WordPress/Wix and paste the fixes", auto: false },
            ]},
            { phase: "ONGOING DELIVERY (monthly)", color: "success", steps: [
              { tool: "SEO Delivery → run again", what: "AI checks new rankings, generates next month's content", auto: true },
              { tool: "Index Health → monthly", what: "AI monitors indexed pages, flags any drops", auto: true },
              { tool: "Content creation", what: "AI writes blog posts from the content calendar", auto: true },
              { tool: "Reporting", what: "AI generates plain-English client report from GSC data", auto: true },
              { tool: "Invoice tab", what: "Generate and send monthly invoice", auto: true },
            ]},
          ].map((phase, pi) => (
            <div key={pi} style={{ marginBottom: "1.25rem", border: `0.5px solid var(--color-border-${phase.color})`, borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", background: `var(--color-background-${phase.color})`, borderBottom: `0.5px solid var(--color-border-${phase.color})` }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: `var(--color-text-${phase.color})`, textTransform: "uppercase", letterSpacing: ".05em" }}>{phase.phase}</p>
              </div>
              {phase.steps.map((s, si) => (
                <div key={si} style={{ padding: "10px 16px", display: "flex", gap: 12, alignItems: "center", borderBottom: si < phase.steps.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none", flexWrap: "wrap" }}>
                  <i className={`ti ti-${s.auto ? "robot" : "user"}`} style={{ fontSize: 14, color: s.auto ? "var(--color-text-success)" : "var(--color-text-warning)", flexShrink: 0 }} aria-hidden="true" />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: 2 }}>{s.tool}</span>
                    <span style={{ fontSize: 13, color: "var(--color-text-primary)" }}>{s.what}</span>
                  </div>
                  <Badge type={s.auto ? "success" : "warning"}>{s.auto ? "🤖 AI" : "👤 You"}</Badge>
                </div>
              ))}
            </div>
          ))}
          <div style={{ ...ib("info") }}>
            <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 500, color: "var(--color-text-info)" }}>Bottom line: what requires you vs the AI</p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-info)", lineHeight: 1.7 }}>
              <strong>You do:</strong> Request access (GSC, GBP, CMS), log into the client's CMS to paste fixes, submit to directories manually.<br />
              <strong>AI does:</strong> Everything else — finding prospects, writing emails, proposals, SEO audits, keyword research, title tags, content calendars, blog posts, GBP descriptions, client reports, invoices.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── GSC DASHBOARD ─────────────────────────────────────────────────
const MONTHLY_TASKS = [
  { id:"m1", label:"Run site: check",           auto:true,  desc:"Search site:domain.com in Google. Count indexed pages vs last month. Drop of 10%+ = red flag." },
  { id:"m2", label:"Check GSC coverage errors", auto:false, desc:"GSC → Indexing → Pages → review 'Not indexed' reasons. Screenshot and save." },
  { id:"m3", label:"Submit sitemap",            auto:false, desc:"GSC → Sitemaps → resubmit sitemap.xml after any new pages added." },
  { id:"m4", label:"Request indexing (new pgs)",auto:false, desc:"URL Inspection on new/updated pages → Request indexing." },
  { id:"m5", label:"Rank tracking check",       auto:true,  desc:"Search primary keyword for client city. Record their position. Compare to last month." },
  { id:"m6", label:"GBP weekly post",           auto:true,  desc:"Generate and publish one Google Post for the client. Offer, tip, or job showcase." },
  { id:"m7", label:"Review velocity check",     auto:false, desc:"How many new reviews this month? Goal: 2+ per month. Send review request SMS if below." },
  { id:"m8", label:"Core Web Vitals check",     auto:false, desc:"GSC → Experience → Core Web Vitals. Flag any 'Poor' pages." },
  { id:"m9", label:"Publish blog post",         auto:true,  desc:"Publish next blog post from content calendar. 500-700 words. Submit URL for indexing." },
  { id:"m10",label:"Send client report",        auto:true,  desc:"AI generates monthly report from this data. Send via email to client." },
];

function GSCDashboard(){
  const [clients,setClients]=useState([]);
  const [showAdd,setShowAdd]=useState(false);
  const [newClient,setNewClient]=useState({name:"",url:"",trade:"HVAC",city:"",email:"",googleEmail:"",pkg:"dominator",keyword:""});
  const [selected,setSelected]=useState(null);
  const [checks,setChecks]=useState({});
  const [running,setRunning]=useState(null);
  const [report,setReport]=useState({});
  const [genReport,setGenReport]=useState(null);
  const [activeView,setActiveView]=useState("overview");
  const [history,setHistory]=useState({});

  useEffect(()=>{(async()=>{
    try{const r=await window.storage.get("gfw_gsc_clients");if(r?.value)setClients(JSON.parse(r.value));}catch{}
    try{const r=await window.storage.get("gfw_gsc_checks");if(r?.value)setChecks(JSON.parse(r.value));}catch{}
    try{const r=await window.storage.get("gfw_gsc_history");if(r?.value)setHistory(JSON.parse(r.value));}catch{}
  })();},[]);

  function saveClients(c){setClients(c);window.storage?.set("gfw_gsc_clients",JSON.stringify(c)).catch(()=>{});}
  function saveChecks(c){setChecks(c);window.storage?.set("gfw_gsc_checks",JSON.stringify(c)).catch(()=>{});}
  function saveHistory(h){setHistory(h);window.storage?.set("gfw_gsc_history",JSON.stringify(h)).catch(()=>{});}

  function addClient(){
    if(!newClient.name||!newClient.url)return;
    const keyword=newClient.keyword||TRADE_KEYWORDS[newClient.trade]||`${newClient.trade} ${newClient.city}`;
    const c={...newClient,keyword,id:Date.now(),addedAt:new Date().toISOString(),status:"active",lastCheck:null,lastReport:null};
    const updated=[...clients,c];
    saveClients(updated);
    setNewClient({name:"",url:"",trade:"HVAC",city:"",email:"",googleEmail:"",pkg:"dominator",keyword:""});
    setShowAdd(false);
    setSelected(c.id);
  }

  async function runMonthlyCheck(client){
    setRunning(client.id);
    const domain=client.url.replace(/^https?:\/\//,"").replace(/\/.*$/,"");
    const keyword=client.keyword||`${client.trade} ${client.city}`;
    const month=new Date().toISOString().slice(0,7);
    try{
      const txt=await callClaude(
        `You are an SEO analyst running a monthly check. Be accurate — the client will fact-check this with their own Google searches.\n\n`+
        `Client: ${client.name}\nWebsite: ${client.url} (domain: ${domain})\nKeyword: ${keyword}, Oklahoma\n\n`+
        `Run ALL 5 searches and cross-reference before drawing conclusions:\n\n`+
        `SEARCH 1 — Brand: Search "${client.name}" directly. Does the site appear? What page/position? Does Google suggest alternate spelling?\n`+
        `SEARCH 2 — Domain index: Search "site:${domain}" to count indexed pages. If site: shows 0 but Search 1 shows the site appearing, the site IS indexed — site: counts are unreliable estimates.\n`+
        `SEARCH 3 — Keyword rank: Search "${keyword} Oklahoma" — find exact position on page 1, 2, or 3.\n`+
        `SEARCH 4 — Reviews/GBP: Search "${client.name} reviews" — find review count, rating, GBP status.\n`+
        `SEARCH 5 — Competitors: Search "${keyword} Oklahoma" — identify who holds positions 1, 2, 3.\n\n`+
        `RULES:\n`+
        `- If site appears in brand search but site: shows 0, report as INDEXED. Never contradict what a basic Google search shows.\n`+
        `- Wins = real verified positives only. Not "no penalty found".\n`+
        `- Issues = verified problems you actually found, not assumptions.\n\n`+
        `Return ONLY this JSON:\n`+
        `{"indexedPages":integer,"brandSearchResult":"Appears on page X / Not found / Did-you-mean shown","rankPosition":integer or null,"googleReviews":integer,"googleRating":number or null,"hasGBP":true or false,"siteStatus":"Up/Down/Unknown","topCompetitor1":"name","topCompetitor2":"name","wins":["real positive 1","real positive 2","real positive 3"],"issues":["verified problem 1"],"opportunities":["specific improvement"],"nextAction":"specific actionable priority","overallHealth":"Good/Fair/Needs attention","rawFindings":"2 sentences of what you actually found"}`,
        true,3000
      );
      const s=txt.indexOf("{"),e=txt.lastIndexOf("}");
      if(s>-1&&e>-1){
        const data=JSON.parse(txt.slice(s,e+1));
        const key=`${client.id}`;
        const newChecks={...checks,[key]:{...data,checkedAt:new Date().toISOString(),month}};
        saveChecks(newChecks);
        const h={...history};
        if(!h[key])h[key]=[];
        h[key]=[{...data,month,checkedAt:new Date().toISOString()},...h[key]].slice(0,12);
        saveHistory(h);
        const updated=clients.map(c=>c.id===client.id?{...c,lastCheck:new Date().toISOString()}:c);
        saveClients(updated);
      }
    }catch(err){console.error(err);}
    setRunning(null);
  }

  async function generateMonthlyReport(client){
    setGenReport(client.id);
    const data=checks[`${client.id}`];
    const prev=history[`${client.id}`]?.[1];
    const month=new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"});
    try{
      const txt=await callClaude(
        `Write a monthly SEO progress report for ${client.name}. This goes directly to the client — plain English, no jargon.\n\n`+
        `VERIFIED DATA:\n`+
        `- Brand search result: ${data?.brandSearchResult||"site appears in Google"}\n`+
        `- Indexed pages: ${data?.indexedPages||"unknown"}\n`+
        `- Keyword rank: ${data?.rankPosition?`position #${data.rankPosition}`:"not yet in top 30"} for "${data?.rankKeyword||client.keyword}"\n`+
        `- Google reviews: ${data?.googleReviews||0} ${data?.googleRating?`(${data.googleRating}★)`:""}\n`+
        `- GBP: ${data?.hasGBP?"Active":"Not yet set up"}\n`+
        `- Site: ${data?.siteStatus}\n`+
        `- Real wins: ${(data?.wins||[]).join("; ")}\n`+
        `- Issues: ${(data?.issues||[]).join("; ")||"none critical"}\n`+
        `- Priority action: ${data?.nextAction}\n`+
        (prev?`- Last month rank: #${prev.rankPosition||"?"}, indexed: ${prev.indexedPages||"?"}\n`:"")+
        `\nTONE RULES:\n`+
        `- Write like a real person — warm, clear, confident. Not a robot generating a status update.\n`+
        `- Only report what data confirms. Lead with real wins. Frame challenges as opportunity.\n`+
        `- Use "we" throughout. Positive and momentum-focused.\n\n`+
        `SECTIONS (plain text only, no symbols, no dashes, no markdown):\n`+
        `1. This Month's Highlights (2-3 sentences, lead with strongest verified positive)\n`+
        `2. Where We Stand on Google (accurate ranking update, framed as opportunity)\n`+
        `3. What We Got Done (3 specific completed tasks in plain English)\n`+
        `4. Our Plan for Next Month (2-3 specific goals)\n`+
        `5. Things We Need From You\n`+
        `   Write in plain English a non-technical business owner instantly understands.\n`+
        `   ${(data?.indexedPages||0)<10?`Always include this first: "The Gmail address linked to your Google account — this is separate from your business email. Right now Google does not have your business fully on its radar yet. Think of it like having a store with no address — people cannot find you even if they are looking. To fix this we need access to your Google account (not your regular business email — the Gmail or Google address you use to sign into things like YouTube, Google Maps, or Android). Just reply with that email address and we handle everything from there. Takes us about 10 minutes once we have it."`:""}\n`+
        `   ${!data?.hasGBP?`Also include: "A quick phone call — Google will mail a postcard to your business address with a 6-digit code to verify your Google Maps listing. When it arrives just call or text us the code and we do the rest."`:""}\n`+
        `   Keep every item to 2-3 sentences. Zero jargon. If nothing is needed write "Nothing this month — you are all set."\n\n`+
        `Close with: GoFieldWise | biz@gofieldwise.com | gofieldwise.com\n`+
        `300-360 words. Month: ${month}.`
      );
      setReport(prev=>({...prev,[client.id]:txt.trim()}));
    }catch(err){console.error(err);}
    setGenReport(null);
  }

  const sel=selected?clients.find(c=>c.id===selected):null;
  const selData=sel?checks[`${sel.id}`]:null;
  const selHistory=sel?history[`${sel.id}`]||[]:[];
  const healthColor={Good:"success",Fair:"warning","Needs attention":"danger"};
  const pkgLabel={starter:"Starter Site $197/mo",dominator:"Local Dominator $397/mo",leader:"Market Leader $697/mo"};
  const dueCheck=(c)=>{
    if(!c.lastCheck)return true;
    const last=new Date(c.lastCheck);
    const now=new Date();
    return(now-last)>25*24*60*60*1000;
  };

  return(
    <div>
      <div style={{...ib("info"),marginBottom:"1.5rem"}}>
        <p style={{margin:"0 0 4px",fontSize:13,fontWeight:500,color:"var(--color-text-info)"}}>
          <i className="ti ti-chart-line" style={{marginRight:6}} aria-hidden="true"/>GSC Client Dashboard — monthly maintenance hub for every site you manage
        </p>
        <p style={{margin:0,fontSize:12,color:"var(--color-text-info)"}}>
          Add your active clients here. AI runs monthly checks: indexed pages, keyword rankings, review count, competitor movement. One click generates the monthly client report.
        </p>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:"1.5rem",flexWrap:"wrap",alignItems:"center"}}>
        {[["overview","All Clients","ti-layout-grid"],["tasks","Monthly Tasks","ti-checklist"],["history","Rank History","ti-history"]].map(([id,label,icon])=>(
          <button key={id} onClick={()=>setActiveView(id)} style={{...bs(activeView===id),fontSize:12}}>
            <i className={`ti ${icon}`} style={{marginRight:5,fontSize:12}} aria-hidden="true"/>{label}
          </button>
        ))}
        <button onClick={()=>setShowAdd(v=>!v)} style={{...bs(false),marginLeft:"auto",fontSize:12,borderColor:"var(--color-border-success)",color:"var(--color-text-success)"}}>
          <i className="ti ti-plus" style={{marginRight:5,fontSize:12}} aria-hidden="true"/>Add client
        </button>
      </div>

      {/* Add client form */}
      {showAdd&&(
        <div style={{...card,marginBottom:"1.25rem"}}>
          <p style={{fontSize:13,fontWeight:500,margin:"0 0 12px"}}>Add active client to GSC Dashboard</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:"1rem"}}>
            {[["name","Business name","e.g. Superior Air Services"],["url","Website URL","https://superiorairservicellc.com"],["city","City","e.g. Tulsa"]].map(([k,l,ph])=>(
              <div key={k}><label style={lbl}>{l}</label><input value={newClient[k]||""} onChange={e=>setNewClient(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={{width:"100%",fontSize:13,boxSizing:"border-box"}}/></div>
            ))}
            <div>
              <label style={lbl}>Business email</label>
              <input value={newClient.email||""} onChange={e=>setNewClient(p=>({...p,email:e.target.value}))} placeholder="info@smithsplumbing.com" style={{width:"100%",fontSize:13,boxSizing:"border-box"}}/>
            </div>
            <div>
              <label style={lbl}>Personal email</label>
              <input value={newClient.googleEmail||""} onChange={e=>setNewClient(p=>({...p,googleEmail:e.target.value}))} placeholder="johnsmith@gmail.com" style={{width:"100%",fontSize:13,boxSizing:"border-box"}}/>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <label style={lbl}>Primary keyword <span style={{color:"var(--color-text-success)",fontStyle:"italic"}}>— auto-suggested from trade, edit freely</span></label>
              <input
                value={newClient.keyword||(TRADE_KEYWORDS[newClient.trade]||"")}
                onChange={e=>setNewClient(p=>({...p,keyword:e.target.value}))}
                placeholder={TRADE_KEYWORDS[newClient.trade]||"e.g. HVAC repair Tulsa"}
                style={{width:"100%",fontSize:13,boxSizing:"border-box",borderColor:newClient.keyword?"var(--color-border-success)":"var(--color-border-tertiary)"}}
              />
              {TRADE_KEYWORDS[newClient.trade]&&!newClient.keyword&&(
                <p style={{fontSize:11,color:"var(--color-text-success)",margin:"4px 0 0"}}>
                  <i className="ti ti-sparkles" style={{marginRight:4,fontSize:11}} aria-hidden="true"/>
                  Suggested: "{TRADE_KEYWORDS[newClient.trade]}" — click to accept or type your own
                </p>
              )}
            </div>
            <div><label style={lbl}>Trade</label><select value={newClient.trade} onChange={e=>{const t=e.target.value;setNewClient(p=>({...p,trade:t,keyword:p.keyword||(TRADE_KEYWORDS[t]||"")}));}} style={{width:"100%",fontSize:13}}>{TRADES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div><label style={lbl}>Package</label><select value={newClient.pkg} onChange={e=>setNewClient(p=>({...p,pkg:e.target.value}))} style={{width:"100%",fontSize:13}}>
              <option value="starter">Starter Site — $197/mo</option>
              <option value="dominator">Local Dominator — $397/mo</option>
              <option value="leader">Market Leader — $697/mo</option>
            </select></div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={addClient} style={{padding:"8px 18px",fontSize:13,cursor:"pointer",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-success)",background:"var(--color-background-success)",color:"var(--color-text-success)"}}>Add client</button>
            <button onClick={()=>setShowAdd(false)} style={{padding:"8px 14px",fontSize:13,cursor:"pointer",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-tertiary)",background:"transparent",color:"var(--color-text-secondary)"}}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── OVERVIEW ── */}
      {activeView==="overview"&&(
        clients.length===0?(
          <div style={{padding:"3rem",textAlign:"center",border:"0.5px dashed var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)"}}>
            <i className="ti ti-chart-line" style={{fontSize:36,color:"var(--color-text-secondary)",display:"block",marginBottom:10}} aria-hidden="true"/>
            <p style={{fontSize:14,color:"var(--color-text-secondary)",margin:"0 0 8px",fontWeight:500}}>No clients added yet</p>
            <p style={{fontSize:12,color:"var(--color-text-secondary)",margin:"0 0 16px"}}>Add your active clients to track their monthly SEO health, run automated checks, and generate reports.</p>
            <button onClick={()=>setShowAdd(true)} style={{padding:"8px 18px",fontSize:13,cursor:"pointer",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-success)",background:"var(--color-background-success)",color:"var(--color-text-success)"}}>
              <i className="ti ti-plus" style={{marginRight:6}} aria-hidden="true"/>Add first client
            </button>
          </div>
        ):(
          <div>
            {/* Summary stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:"1.5rem"}}>
              {[
                ["Active clients",clients.filter(c=>c.status==="active").length,"info"],
                ["Check due now",clients.filter(c=>dueCheck(c)).length,"warning"],
                ["Checked this month",clients.filter(c=>c.lastCheck&&new Date(c.lastCheck).toISOString().slice(0,7)===new Date().toISOString().slice(0,7)).length,"success"],
                ["Monthly revenue","$"+clients.reduce((s,c)=>s+({starter:197,dominator:397,leader:697}[c.pkg]||0),0).toLocaleString(),"success"],
              ].map(([l,v,c],i)=>(
                <div key={i} style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"12px 14px",textAlign:"center"}}>
                  <p style={{fontSize:20,fontWeight:500,margin:"0 0 3px",color:`var(--color-text-${c})`}}>{v}</p>
                  <p style={{fontSize:11,color:"var(--color-text-secondary)",margin:0,lineHeight:1.3}}>{l}</p>
                </div>
              ))}
            </div>

            {/* Client list */}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {clients.map(client=>{
                const data=checks[`${client.id}`];
                const hc=healthColor[data?.overallHealth]||"secondary";
                const due=dueCheck(client);
                const isSelected=selected===client.id;
                return(
                  <div key={client.id} style={{border:isSelected?"1px solid var(--color-border-info)":"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",overflow:"hidden"}}>
                    {/* Header row */}
                    <div style={{padding:"12px 16px",cursor:"pointer"}} onClick={()=>setSelected(isSelected?null:client.id)}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:8}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                            <span style={{fontSize:14,fontWeight:500}}>{client.name}</span>
                            <Badge type="secondary">{client.trade} · {client.city}</Badge>
                            <Badge type="info">{pkgLabel[client.pkg]}</Badge>
                            {data&&<Badge type={hc}>{data.overallHealth}</Badge>}
                            {due&&<Badge type="warning">⏰ Check due</Badge>}
                          </div>
                          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                            <a href={client.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:11,color:"var(--color-text-info)",textDecoration:"none"}}><i className="ti ti-external-link" style={{marginRight:3,fontSize:10}} aria-hidden="true"/>{client.url}</a>
                            {data&&<span style={{fontSize:11,color:"var(--color-text-secondary)"}}><i className="ti ti-search" style={{marginRight:3,fontSize:10}} aria-hidden="true"/>Rank #{data.rankPosition||"?"} · {data.indexedPages||"?"} indexed · {data.googleReviews||0} reviews</span>}
                            {client.lastCheck&&<span style={{fontSize:11,color:"var(--color-text-secondary)"}}>Last checked: {new Date(client.lastCheck).toLocaleDateString()}</span>}
                          </div>
                        </div>
                        <button onClick={e=>{e.stopPropagation();saveClients(clients.filter(c=>c.id!==client.id));if(selected===client.id)setSelected(null);}} style={{padding:"4px 8px",fontSize:11,cursor:"pointer",borderRadius:6,border:"0.5px solid var(--color-border-tertiary)",background:"transparent",color:"var(--color-text-secondary)",flexShrink:0}}>
                          <i className="ti ti-trash" style={{fontSize:12}} aria-hidden="true"/>
                        </button>
                      </div>
                      {/* Action buttons always on own row */}
                      <div style={{display:"flex",gap:8}} onClick={e=>e.stopPropagation()}>
                        <button onClick={()=>runMonthlyCheck(client)} disabled={running===client.id}
                          style={{flex:1,padding:"8px",fontSize:12,fontWeight:500,cursor:running===client.id?"not-allowed":"pointer",borderRadius:6,border:"0.5px solid var(--color-border-info)",background:"var(--color-background-info)",color:"var(--color-text-info)",textAlign:"center"}}>
                          {running===client.id
                            ?<><i className="ti ti-loader" style={{marginRight:6,animation:"spin 1s linear infinite"}} aria-hidden="true"/>Running check...</>
                            :<><i className="ti ti-refresh" style={{marginRight:6}} aria-hidden="true"/>Run Monthly Check ↗</>}
                        </button>
                        {data&&(
                          <button onClick={()=>generateMonthlyReport(client)} disabled={genReport===client.id}
                            style={{flex:1,padding:"8px",fontSize:12,fontWeight:500,cursor:genReport===client.id?"not-allowed":"pointer",borderRadius:6,border:"0.5px solid var(--color-border-success)",background:"var(--color-background-success)",color:"var(--color-text-success)",textAlign:"center"}}>
                            {genReport===client.id
                              ?<><i className="ti ti-loader" style={{marginRight:6,animation:"spin 1s linear infinite"}}/>Writing report...</>
                              :<><i className="ti ti-file-text" style={{marginRight:6}}/>Generate Report ↗</>}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Report shows directly below card — always visible after generation */}
                    {report[client.id]&&(
                      <div style={{borderTop:"0.5px solid var(--color-border-success)",padding:"14px 16px",background:"var(--color-background-success)"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                          <p style={{margin:0,fontSize:12,fontWeight:500,color:"var(--color-text-success)"}}>
                            <i className="ti ti-file-check" style={{marginRight:6}} aria-hidden="true"/>
                            Monthly Report — {new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"})}
                          </p>
                          <CopyBtn text={report[client.id]}/>
                        </div>
                        <pre style={{fontSize:12,lineHeight:1.7,margin:"0 0 8px",whiteSpace:"pre-wrap",fontFamily:"var(--font-sans)",color:"var(--color-text-primary)",maxHeight:280,overflow:"auto",background:"var(--color-background-primary)",padding:"12px 14px",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-tertiary)"}}>{report[client.id]}</pre>
                        <p style={{fontSize:11,color:"var(--color-text-success)",margin:0}}>
                          <i className="ti ti-send" style={{marginRight:4}} aria-hidden="true"/>
                          Copy → email to {client.email||"client"} from biz@gofieldwise.com
                        </p>
                      </div>
                    )}

                    {/* Expanded detail */}
                    {isSelected&&(
                      <div style={{borderTop:"0.5px solid var(--color-border-tertiary)",padding:"14px 16px",background:"var(--color-background-secondary)"}}>
                        {!data?(
                          <div style={{textAlign:"center",padding:"1rem"}}>
                            <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:"0 0 10px"}}>No data yet. Click "Run check" to get this month's rankings, indexed pages, and reviews.</p>
                          </div>
                        ):(
                          <div>
                            {/* Metrics grid */}
                            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:"1rem"}}>
                              {[
                                {l:"Google rank",v:`#${data.rankPosition||"?"}`,s:data.rankPosition&&data.rankPosition<=10?"success":data.rankPosition&&data.rankPosition<=20?"warning":"danger"},
                                {l:"Indexed pages",v:data.indexedPages||0,s:"info"},
                                {l:"Reviews",v:`${data.googleReviews||0} (${data.googleRating||"?"}★)`,s:"secondary"},
                                {l:"Site status",v:data.siteStatus||"?",s:data.siteStatus==="Up"?"success":"danger"},
                              ].map((m,i)=>(
                                <div key={i} style={{background:"var(--color-background-primary)",borderRadius:"var(--border-radius-md)",padding:"10px 12px",textAlign:"center",border:"0.5px solid var(--color-border-tertiary)"}}>
                                  <p style={{fontSize:16,fontWeight:500,margin:"0 0 3px",color:`var(--color-text-${m.s})`}}>{m.v}</p>
                                  <p style={{fontSize:10,color:"var(--color-text-secondary)",margin:0}}>{m.l}</p>
                                </div>
                              ))}
                            </div>

                            {/* Competitors */}
                            {(data.topCompetitor1||data.topCompetitor2)&&(
                              <div style={{marginBottom:"1rem"}}>
                                <p style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)",margin:"0 0 6px",textTransform:"uppercase",letterSpacing:".04em"}}>Ranking above them for "{data.rankKeyword}"</p>
                                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                                  {[["#1",data.topCompetitor1],["#2",data.topCompetitor2]].filter(([,v])=>v).map(([rank,name])=>(
                                    <span key={rank} style={{fontSize:11,padding:"3px 9px",borderRadius:6,background:"var(--color-background-danger)",color:"var(--color-text-danger)",border:"0.5px solid var(--color-border-danger)"}}>{rank} {name}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Raw findings summary */}
                            {data.rawFindings&&(
                              <div style={{...ib("info"),marginBottom:"1rem"}}>
                                <p style={{margin:"0 0 4px",fontSize:11,fontWeight:500,color:"var(--color-text-info)",textTransform:"uppercase",letterSpacing:".04em"}}>What we actually found</p>
                                <p style={{margin:0,fontSize:12,color:"var(--color-text-info)",lineHeight:1.6}}>{data.rawFindings}</p>
                              </div>
                            )}

                            {/* Brand search result */}
                            {data.brandSearchResult&&(
                              <div style={{marginBottom:"1rem",padding:"8px 12px",background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-tertiary)"}}>
                                <p style={{fontSize:11,color:"var(--color-text-secondary)",margin:"0 0 3px",textTransform:"uppercase",letterSpacing:".04em"}}>Brand search result</p>
                                <p style={{fontSize:13,margin:0,fontWeight:500}}>{data.brandSearchResult}</p>
                              </div>
                            )}

                            {/* Issues */}
                            {data.issues?.length>0&&(
                              <div style={{marginBottom:"0.75rem"}}>
                                <p style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)",margin:"0 0 6px",textTransform:"uppercase",letterSpacing:".04em"}}>Issues found</p>
                                {data.issues.map((issue,i)=>(
                                  <div key={i} style={{fontSize:12,color:"var(--color-text-danger)",padding:"4px 0",display:"flex",gap:6,alignItems:"flex-start"}}>
                                    <i className="ti ti-alert-triangle" style={{fontSize:11,marginTop:2,flexShrink:0}} aria-hidden="true"/>{issue}
                                  </div>
                                ))}
                              </div>
                            )}
                            {data.wins?.length>0&&(
                              <div style={{marginBottom:"0.75rem"}}>
                                <p style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)",margin:"0 0 6px",textTransform:"uppercase",letterSpacing:".04em"}}>Wins this month</p>
                                {data.wins.map((win,i)=>(
                                  <div key={i} style={{fontSize:12,color:"var(--color-text-success)",padding:"4px 0",display:"flex",gap:6,alignItems:"flex-start"}}>
                                    <i className="ti ti-arrow-up" style={{fontSize:11,marginTop:2,flexShrink:0}} aria-hidden="true"/>{win}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Next action */}
                            {data.nextAction&&<div style={{...ib("warning"),marginBottom:"1rem"}}><p style={{margin:0,fontSize:12,color:"var(--color-text-warning)"}}><i className="ti ti-arrow-right" style={{marginRight:6}} aria-hidden="true"/><strong>Priority this month:</strong> {data.nextAction}</p></div>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* ── MONTHLY TASKS ── */}
      {activeView==="tasks"&&(
        <div>
          <div style={{...ib("info"),marginBottom:"1.25rem"}}>
            <p style={{margin:0,fontSize:12,color:"var(--color-text-info)"}}>
              <i className="ti ti-robot" style={{marginRight:6}} aria-hidden="true"/>
              <strong>Auto tasks</strong> run when you click "Run check" on any client. <strong>Manual tasks</strong> require you to log into GSC or GBP. Takes ~30 min/client/month.
            </p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {MONTHLY_TASKS.map((task,i)=>(
              <div key={task.id} style={{border:`0.5px solid ${task.auto?"var(--color-border-success)":"var(--color-border-warning)"}`,borderRadius:"var(--border-radius-md)",overflow:"hidden"}}>
                <div style={{padding:"10px 14px",display:"flex",gap:10,alignItems:"center",background:task.auto?"var(--color-background-success)":"var(--color-background-warning)"}}>
                  <i className={`ti ti-${task.auto?"robot":"user"}`} style={{fontSize:14,color:task.auto?"var(--color-text-success)":"var(--color-text-warning)",flexShrink:0}} aria-hidden="true"/>
                  <span style={{flex:1,fontSize:13,fontWeight:500,color:task.auto?"var(--color-text-success)":"var(--color-text-warning)"}}>{task.label}</span>
                  <Badge type={task.auto?"success":"warning"}>{task.auto?"🤖 AI automated":"👤 Manual (you)"}</Badge>
                </div>
                <div style={{padding:"8px 14px"}}><p style={{margin:0,fontSize:12,color:"var(--color-text-secondary)",lineHeight:1.5}}>{task.desc}</p></div>
              </div>
            ))}
          </div>
          <div style={{...card,marginTop:"1.25rem",padding:"14px 16px"}}>
            <p style={{fontSize:12,fontWeight:500,margin:"0 0 8px"}}>Time estimate per client per month</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {[["AI automated tasks","5 min","Just click Run check"],["Manual GSC tasks","15 min","GSC login + submit"],["GBP & report","10 min","Post + email report"]].map(([l,v,s],i)=>(
                <div key={i} style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"10px 12px",textAlign:"center"}}>
                  <p style={{fontSize:16,fontWeight:500,margin:"0 0 3px"}}>{v}</p>
                  <p style={{fontSize:11,fontWeight:500,margin:"0 0 2px"}}>{l}</p>
                  <p style={{fontSize:11,color:"var(--color-text-secondary)",margin:0}}>{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── RANK HISTORY ── */}
      {activeView==="history"&&(
        <div>
          {clients.length===0?(
            <div style={{padding:"2.5rem",textAlign:"center",color:"var(--color-text-secondary)"}}>Add clients and run monthly checks to build ranking history.</div>
          ):(
            <div>
              <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:"0 0 1.25rem"}}>Ranking history builds automatically each month when you run checks. Shows position trends over time.</p>
              {clients.map(client=>{
                const hist=history[`${client.id}`]||[];
                if(!hist.length)return(
                  <div key={client.id} style={{...card,marginBottom:10,padding:"12px 14px"}}>
                    <p style={{fontSize:13,fontWeight:500,margin:"0 0 4px"}}>{client.name}</p>
                    <p style={{fontSize:12,color:"var(--color-text-secondary)",margin:0}}>No history yet — run your first monthly check to start tracking.</p>
                  </div>
                );
                return(
                  <div key={client.id} style={{...card,marginBottom:10,padding:"14px 16px"}}>
                    <p style={{fontSize:13,fontWeight:500,margin:"0 0 12px"}}>{client.name} — Rank history for "{hist[0]?.rankKeyword}"</p>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {hist.map((h,i)=>{
                        const prev=hist[i+1];
                        const improved=prev&&h.rankPosition&&prev.rankPosition&&h.rankPosition<prev.rankPosition;
                        const dropped=prev&&h.rankPosition&&prev.rankPosition&&h.rankPosition>prev.rankPosition;
                        return(
                          <div key={i} style={{background:improved?"var(--color-background-success)":dropped?"var(--color-background-danger)":"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"10px 14px",textAlign:"center",border:`0.5px solid ${improved?"var(--color-border-success)":dropped?"var(--color-border-danger)":"var(--color-border-tertiary)"}`}}>
                            <p style={{fontSize:14,fontWeight:500,margin:"0 0 3px",color:improved?"var(--color-text-success)":dropped?"var(--color-text-danger)":"var(--color-text-primary)"}}>
                              #{h.rankPosition||"?"}
                              {improved&&" ↑"}{dropped&&" ↓"}
                            </p>
                            <p style={{fontSize:10,color:"var(--color-text-secondary)",margin:"0 0 2px"}}>{h.month}</p>
                            <p style={{fontSize:10,color:"var(--color-text-secondary)",margin:0}}>{h.indexedPages||"?"} indexed</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── APP SHELL ──────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]=useState("gsc");
  const [prospects,setProspects]=useState([]);
  const [emailQueue,setEmailQueue]=useState([]);
  const [dashStatus,setDashStatus]=useState("checking"); // "online"|"offline"|"checking"
  const DASH="http://localhost:3333";

  useEffect(()=>{(async()=>{try{const r=await window.storage.get("gfw_prospects_v4");if(r?.value)setProspects(JSON.parse(r.value));}catch{}try{const r=await window.storage.get("gfw_queue_v4");if(r?.value)setEmailQueue(JSON.parse(r.value));}catch{}})();},[]);
  useEffect(()=>{if(prospects.length)window.storage?.set("gfw_prospects_v4",JSON.stringify(prospects)).catch(()=>{});},[prospects]);
  useEffect(()=>{if(emailQueue.length)window.storage?.set("gfw_queue_v4",JSON.stringify(emailQueue)).catch(()=>{});},[emailQueue]);

  // Check if local dashboard is running
  useEffect(()=>{
    const check=async()=>{
      try{
        const r=await fetch(`${DASH}/api/status`,{signal:AbortSignal.timeout(2000)});
        setDashStatus(r.ok?"online":"offline");
      }catch{setDashStatus("offline");}
    };
    check();
    const t=setInterval(check,30000);
    return()=>clearInterval(t);
  },[]);

  // Export queue to local dashboard
  async function exportToDashboard(){
    const queued=emailQueue.filter(e=>e.status==="queued");
    if(!queued.length){alert("No queued emails to export. Queue some emails first.");return;}
    const json=JSON.stringify(queued,null,2);
    const blob=new Blob([json],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download="email_queue.json";
    a.click();
    URL.revokeObjectURL(url);
    alert(`✓ Exported ${queued.length} queued emails.\n\nSave this file to:\nC:\\Users\\erock\\Claude_bot\\LocalClaudeAgent\\email_queue.json\n\nThen in your dashboard click "Send all emails".`);
  }

  const queuedCount=emailQueue.filter(e=>e.status==="queued").length;
  const interestedCount=prospects.filter(p=>p.interested).length;
  const [showGuide,setShowGuide]=useState(true);
  const isMobile=useIsMobile();

  const STEPS=[
    {num:1,tab:"finder",   icon:"ti-radar",   label:"Find prospects",  color:"danger",  desc:"Smart Finder → pick trade & city → Find Businesses."},
    {num:2,tab:"queue",    icon:"ti-inbox",   label:"Queue emails",    color:"warning", desc:"Email Queue → review → Export Queue."},
    {num:3,tab:null,       icon:"ti-device-desktop",label:"Send",      color:"warning", desc:"localhost:3333 → Send all emails."},
    {num:4,tab:"agent",    icon:"ti-robot",   label:"AI replies",      color:"info",    desc:"AI reads replies and responds automatically."},
    {num:5,tab:"proposal", icon:"ti-file-text",label:"Proposals",      color:"info",    desc:"Proposals tab → AI writes full proposal."},
    {num:6,tab:"onboard",  icon:"ti-checklist",label:"Onboard",        color:"success", desc:"Checklist → Invoice when done."},
  ];

  return(
    <div style={{maxWidth:760,margin:"0 auto",padding:isMobile?"1rem 10px":"1.5rem 0"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.75rem",flexWrap:"wrap",gap:8}}>
        <div>
          <h2 style={{fontSize:isMobile?16:20,fontWeight:500,margin:"0 0 3px"}}>GoFieldWise — Growth Engine</h2>
          <p style={{fontSize:11,color:"var(--color-text-secondary)",margin:0}}>{FROM_EMAIL} · Oklahoma SEO</p>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {queuedCount>0&&<Badge type="info">{queuedCount}</Badge>}
          {interestedCount>0&&<Badge type="success">{interestedCount}</Badge>}
          <button onClick={()=>setShowGuide(v=>!v)} style={{padding:"6px 10px",fontSize:11,cursor:"pointer",borderRadius:6,border:"0.5px solid var(--color-border-tertiary)",background:showGuide?"var(--color-background-info)":"transparent",color:showGuide?"var(--color-text-info)":"var(--color-text-secondary)",minHeight:36}}>
            <i className="ti ti-help" style={{fontSize:11}} aria-hidden="true"/>
          </button>
        </div>
      </div>

      {/* Guide — 2 cols on mobile, 3 on desktop */}
      {showGuide&&(
        <div style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-lg)",border:"0.5px solid var(--color-border-tertiary)",marginBottom:"1.25rem",overflow:"hidden"}}>
          <div style={{padding:"10px 14px",borderBottom:"0.5px solid var(--color-border-tertiary)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <p style={{margin:0,fontSize:13,fontWeight:500}}>How to use GoFieldWise</p>
            <button onClick={()=>setShowGuide(false)} style={{padding:"6px 10px",fontSize:11,cursor:"pointer",borderRadius:6,border:"0.5px solid var(--color-border-tertiary)",background:"transparent",color:"var(--color-text-secondary)",minHeight:36}}>✕</button>
          </div>
          <div style={{padding:"10px",display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(3,1fr)",gap:8}}>
            {STEPS.map(s=>(
              <div key={s.num} onClick={()=>s.tab&&setTab(s.tab)}
                style={{background:"var(--color-background-primary)",borderRadius:"var(--border-radius-md)",padding:"10px",border:`0.5px solid var(--color-border-${s.color})`,cursor:s.tab?"pointer":"default"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:`var(--color-background-${s.color})`,color:`var(--color-text-${s.color})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0}}>{s.num}</div>
                  <span style={{fontSize:11,fontWeight:600,color:`var(--color-text-${s.color})`}}>{s.label}</span>
                </div>
                <p style={{fontSize:10,color:"var(--color-text-secondary)",margin:0,lineHeight:1.5}}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection bar */}
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",border:`0.5px solid ${dashStatus==="online"?"var(--color-border-success)":"var(--color-border-tertiary)"}`,marginBottom:"1.25rem",flexWrap:"wrap"}}>
        <div style={{width:8,height:8,borderRadius:"50%",flexShrink:0,background:dashStatus==="online"?"var(--color-text-success)":dashStatus==="checking"?"var(--color-text-warning)":"var(--color-text-secondary)",animation:dashStatus==="checking"?"pulse 1.5s ease infinite":"none"}}/>
        <span style={{flex:1,fontSize:12,fontWeight:500,color:dashStatus==="online"?"var(--color-text-success)":"var(--color-text-secondary)"}}>
          {dashStatus==="online"?"✓ Agent running":dashStatus==="checking"?"Checking...":"Agent starting — Windows Service running"}
        </span>
        {dashStatus==="online"&&<a href={DASH} target="_blank" rel="noopener noreferrer" style={{padding:"7px 12px",fontSize:11,fontWeight:500,borderRadius:6,border:"0.5px solid var(--color-border-success)",background:"var(--color-background-success)",color:"var(--color-text-success)",textDecoration:"none",minHeight:36,display:"inline-flex",alignItems:"center",gap:4}}><i className="ti ti-external-link" style={{fontSize:11}} aria-hidden="true"/>Dashboard</a>}
        {queuedCount>0&&<button onClick={exportToDashboard} style={{padding:"7px 12px",fontSize:11,fontWeight:500,cursor:"pointer",borderRadius:6,border:"0.5px solid var(--color-border-info)",background:"var(--color-background-info)",color:"var(--color-text-info)",minHeight:36}}><i className="ti ti-download" style={{marginRight:4,fontSize:11}} aria-hidden="true"/>Export {queuedCount}</button>}
      </div>

      {/* Tabs — scrollable on mobile */}
      <div style={{display:"flex",gap:6,marginBottom:"1.5rem",overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:4,scrollbarWidth:"none",msOverflowStyle:"none"}}>
        {TABS.map(t=>(
          <Tooltip key={t.id} text={isMobile?null:t.desc}>
            <button onClick={()=>setTab(t.id)} style={{
              ...bs(tab===t.id),fontSize:11,padding:"8px 10px",position:"relative",flexShrink:0,minHeight:40,whiteSpace:"nowrap",
              ...(t.id==="gsc"&&tab!=="gsc"?{borderColor:"var(--color-border-success)",color:"var(--color-text-success)",background:"var(--color-background-success)"}:{}),
            }}>
              {t.step&&<span style={{position:"absolute",top:-5,right:-5,width:15,height:15,borderRadius:"50%",background:"var(--color-background-warning)",color:"var(--color-text-warning)",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{t.step}</span>}
              {t.id==="gsc"&&<span style={{marginRight:3,fontSize:9}}>📌</span>}
              <i className={`ti ${t.icon}`} style={{marginRight:4,fontSize:12}} aria-hidden="true"/>
              {isMobile?t.label.split(" ")[0]:t.label}
              {t.id==="queue"&&queuedCount>0&&<span style={{marginLeft:4,fontSize:9,background:"var(--color-background-info)",color:"var(--color-text-info)",padding:"1px 4px",borderRadius:8}}>{queuedCount}</span>}
              {t.id==="campaign"&&interestedCount>0&&<span style={{marginLeft:4,fontSize:9,background:"var(--color-background-success)",color:"var(--color-text-success)",padding:"1px 4px",borderRadius:8}}>{interestedCount}</span>}
            </button>
          </Tooltip>
        ))}
      </div>

      {tab==="portfolio"&&<WebsitePortfolio/>}
      {tab==="finder"&&<SmartFinder prospects={prospects} setProspects={setProspects} emailQueue={emailQueue} setEmailQueue={setEmailQueue}/>}
      {tab==="gsc"&&<GSCDashboard/>}
      {tab==="indexing"&&<IndexingHealth/>}
      {tab==="seowork"&&<SEODelivery prospects={prospects}/>}
      {tab==="creative"&&<CreativeStudio prospects={prospects}/>}
      {tab==="agent"&&<AISalesAgent prospects={prospects} emailQueue={emailQueue} setEmailQueue={setEmailQueue}/>}
      {tab==="queue"&&<EmailQueue emailQueue={emailQueue} setEmailQueue={setEmailQueue} prospects={prospects} setProspects={setProspects}/>}
      {tab==="campaign"&&<CampaignManager prospects={prospects} setProspects={setProspects} emailQueue={emailQueue} setEmailQueue={setEmailQueue}/>}
      {tab==="proposal"&&<ProposalBuilder prospects={prospects} emailQueue={emailQueue} setEmailQueue={setEmailQueue}/>}
      {tab==="onboard"&&<Onboarding/>}
      {tab==="invoice"&&<Invoice/>}
      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        ::-webkit-scrollbar{height:3px;width:3px}
        ::-webkit-scrollbar-thumb{background:var(--color-border-tertiary);border-radius:3px}
        input,select,textarea{font-size:16px!important}
        a,button{-webkit-tap-highlight-color:transparent}
      `}</style>
    </div>
  );
}
