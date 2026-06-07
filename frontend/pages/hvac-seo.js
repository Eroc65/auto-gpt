import TradePage from "../components/TradePage";

export default function HvacSeo() {
  return (
    <TradePage
      title="HVAC SEO Services Oklahoma | Rank #1 on Google | GoFieldWise"
      description="GoFieldWise gets Oklahoma HVAC companies to page 1 of Google for AC repair near me - no ad spend. Free audit included."
      canonical="https://gofieldwise.com/hvac-seo"
      ogTitle="HVAC SEO Services Oklahoma | GoFieldWise"
      breadcrumb="HVAC SEO Oklahoma"
      eyebrow="Local SEO for HVAC"
      h1="HVAC SEO Services in Oklahoma — Get More AC Repair Calls From Google"
      intro="When someone in Tulsa searches “AC repair near me,” your competitors show up on page 1. GoFieldWise fixes that — without running ads."
      chips={["AC repair Tulsa", "HVAC service Oklahoma City", "furnace repair near me", "air conditioning Broken Arrow", "emergency AC repair", "heat pump Tulsa", "HVAC company Edmond"]}
      cta={{
        title: "Free HVAC SEO Audit for Oklahoma Companies",
        text: "We check your rankings, Maps listing, and show exactly what's holding you back. No cost. No commitment.",
        href: "mailto:biz@gofieldwise.com?subject=Free HVAC SEO Audit",
        label: "Get your free audit →",
      }}
      related={[
        { label: "Plumbing SEO", href: "/plumbing-seo" },
        { label: "Electrician SEO", href: "/electrician-seo" },
        { label: "Cleaning SEO", href: "/cleaning-seo" },
        { label: "Contractor Websites", href: "/website-design" },
      ]}
    />
  );
}
