import TradePage from "../components/TradePage";

export default function HvacPage() {
  return (
    <TradePage
      title="AI Answering Service for HVAC Companies | GoFieldWise — $200/mo"
      description="GoFieldWise answers every HVAC call 24/7, captures job details, and books appointments automatically. No missed calls. No after-hours voicemail. $200/month flat."
      canonical="https://gofieldwise.com/hvac"
      ogTitle="AI Answering Service for HVAC Companies | GoFieldWise"
      breadcrumb="HVAC"
      accent="#60A5FA"
      icon="🌡️"
      ogImage="/images/og/gofieldwise-og-hvac.webp"
      eyebrow="AI Answering Service for HVAC"
      h1="AI Answering Service for HVAC Companies"
      intro="When your tech is under a house and a new customer calls, GoFieldWise answers. It qualifies the lead, captures job details, and books the appointment — automatically, 24/7."
      kpis={[
        { stat: "< 3 sec", label: "Average answer time" },
        { stat: "24/7", label: "Coverage including weekends" },
        { stat: "$200/mo", label: "Flat pricing, no per-call fees" },
      ]}
      bullets={{
        title: "What GoFieldWise does for HVAC companies",
        items: [
          "Answers every call instantly — no voicemail, no hold music",
          "Qualifies AC repair, furnace, install, and maintenance calls",
          "Captures address, system type, urgency, and preferred time",
          "Books directly into your calendar or dispatches to your CRM",
          "Sends confirmation texts to customers automatically",
          "Follows up on missed quotes and incomplete bookings",
        ],
      }}
      cta={{
        title: "Stop losing HVAC jobs to voicemail",
        text: "Homeowners call whoever answers first. GoFieldWise makes sure that's you — every time.",
        href: "/demo",
        label: "Try the live demo →",
        sub: "No contract. Cancel anytime.",
      }}
      related={[
        { label: "Plumbing", href: "/plumbing" },
        { label: "Electrical", href: "/electrical" },
        { label: "Roofing", href: "/roofing" },
        { label: "Cleaning", href: "/cleaning" },
        { label: "See Pricing", href: "/pricing" },
      ]}
    />
  );
}
