import TradePage from "../components/TradePage";

export default function WebsiteDesign() {
  return (
    <TradePage
      title="Website Design for Contractors Oklahoma | GoFieldWise | From $497"
      description="Professional websites built for HVAC, plumbing, electrical and cleaning companies in Oklahoma. SEO built in from day one. Live in 2 weeks. Starting at $497."
      canonical="https://gofieldwise.com/website-design"
      ogTitle="Contractor Website Design Oklahoma | GoFieldWise"
      breadcrumb="Contractor Website Design Oklahoma"
      eyebrow="Built to rank on Google"
      h1="Contractor Website Design in Oklahoma — Built to Rank From Day One"
      intro="Most contractor websites look good but don't rank. GoFieldWise builds websites for Oklahoma trades businesses engineered to show up on Google."
      prices={[
        { price: "$497", label: "One-time build", desc: "Design, copy, SEO, launch" },
        { price: "$197/mo", label: "SEO retainer", desc: "Monthly optimization" },
        { price: "2 weeks", label: "Time to live", desc: "Deposit to live site" },
      ]}
      cta={{
        title: "Get a free website mockup",
        text: "We build a preview with your business name in 24 hours. No cost, no commitment.",
        href: "mailto:biz@gofieldwise.com?subject=Free Website Mockup Request",
        label: "Request free mockup →",
        sub: "Live in 2 weeks. SEO built in.",
      }}
      related={[
        { label: "HVAC SEO", href: "/hvac-seo" },
        { label: "Plumbing SEO", href: "/plumbing-seo" },
        { label: "Electrician SEO", href: "/electrician-seo" },
        { label: "Cleaning SEO", href: "/cleaning-seo" },
      ]}
    />
  );
}
