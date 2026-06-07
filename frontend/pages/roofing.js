import TradePage from "../components/TradePage";

export default function RoofingPage() {
  return (
    <TradePage
      title="AI Answering Service for Roofing Companies | GoFieldWise — $200/mo"
      description="GoFieldWise captures every roofing lead — storm damage calls, inspection requests, replacement quotes — 24/7. Never lose a job to voicemail again. $200/month flat."
      canonical="https://gofieldwise.com/roofing"
      ogTitle="AI Answering Service for Roofing Companies | GoFieldWise"
      breadcrumb="Roofing"
      accent="#FB923C"
      icon="🏠"
      ogImage="/images/og/gofieldwise-og-roofing.webp"
      eyebrow="AI Answering Service for Roofers"
      h1="AI Answering Service for Roofing Companies"
      intro="After a storm, every roofing company in your market gets flooded with calls at the same time. GoFieldWise answers every single one — capturing lead details while competitors send them to voicemail."
      kpis={[
        { stat: "100%", label: "Storm-surge calls answered" },
        { stat: "24/7", label: "Weekend storm coverage" },
        { stat: "$200/mo", label: "Flat, no per-lead fees" },
      ]}
      bullets={{
        title: "Why roofing companies need GoFieldWise",
        items: [
          "Storm surge handling — answers dozens of simultaneous calls without missing one",
          "Captures address, damage description, insurance carrier, and urgency",
          "Books inspection appointments directly into your team's schedule",
          "After-hours coverage for weekend storm calls",
          "Automated follow-up on inspection no-shows and unsigned estimates",
        ],
      }}
      cta={{
        title: "The next storm is your biggest growth opportunity",
        text: "Only if you answer the call. GoFieldWise makes sure you do.",
        href: "/demo",
        label: "See how it works →",
        sub: "$200/month flat. No contracts.",
      }}
      related={[
        { label: "HVAC", href: "/hvac" },
        { label: "Plumbing", href: "/plumbing" },
        { label: "Electrical", href: "/electrical" },
        { label: "Cleaning", href: "/cleaning" },
        { label: "See Pricing", href: "/pricing" },
      ]}
    />
  );
}
