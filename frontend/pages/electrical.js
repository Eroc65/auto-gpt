import TradePage from "../components/TradePage";

export default function ElectricalPage() {
  return (
    <TradePage
      title="AI Answering Service for Electricians | GoFieldWise — $200/mo"
      description="GoFieldWise answers every electrical service call 24/7. Panel upgrades, EV charger installs, emergency repairs — the AI books it while you're on the job."
      canonical="https://gofieldwise.com/electrical"
      ogTitle="AI Answering Service for Electricians | GoFieldWise"
      breadcrumb="Electrical"
      accent="#FDE047"
      icon="⚡"
      ogImage="/images/og/gofieldwise-og-electrical.webp"
      eyebrow="AI Answering Service for Electricians"
      h1="AI Answering Service for Electrical Contractors"
      intro="Panel upgrades, EV charger installs, whole-home rewiring — these are high-value jobs that start with a phone call. GoFieldWise makes sure every one of those calls gets answered and booked."
      kpis={[
        { stat: "$3,000+", label: "Average panel upgrade job" },
        { stat: "24/7", label: "Every call answered" },
        { stat: "$200/mo", label: "Pays for itself on one job" },
      ]}
      bullets={{
        title: "How GoFieldWise handles electrical calls",
        items: [
          "Answers and qualifies panel upgrades, EV charger, and repair calls instantly",
          "Captures service address, job type, home age, and timeline",
          "Routes emergency calls immediately to your on-call tech",
          "Books estimate appointments directly into your schedule",
          "Follows up automatically on quotes that went quiet",
        ],
      }}
      cta={{
        title: "High-value jobs go to whoever answers first",
        text: "A panel upgrade is worth $3,000+. GoFieldWise pays for itself on one job a month.",
        href: "/demo",
        label: "Try the demo →",
        sub: "$200/month. No per-call fees.",
      }}
      related={[
        { label: "HVAC", href: "/hvac" },
        { label: "Plumbing", href: "/plumbing" },
        { label: "Roofing", href: "/roofing" },
        { label: "Cleaning", href: "/cleaning" },
        { label: "See Pricing", href: "/pricing" },
      ]}
    />
  );
}
