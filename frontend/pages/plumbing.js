import TradePage from "../components/TradePage";

export default function PlumbingPage() {
  return (
    <TradePage
      title="AI Answering Service for Plumbers | GoFieldWise — $200/mo"
      description="GoFieldWise answers every plumbing call 24/7. Burst pipe? Clogged drain? The AI captures job details and books the appointment before a competitor picks up. $200/month."
      canonical="https://gofieldwise.com/plumbing"
      ogTitle="AI Answering Service for Plumbers | GoFieldWise"
      breadcrumb="Plumbing"
      eyebrow="AI Answering Service"
      h1="AI Answering Service for Plumbing Companies"
      intro="Plumbing emergencies don't wait for business hours. GoFieldWise answers every call instantly, day or night — capturing job details and booking appointments while you're on the job."
      bullets={{
        title: "Built for plumbing businesses",
        items: [
          "Emergency call triage — burst pipes get priority routing instantly",
          "Captures address, issue type, urgency, and photos via text follow-up",
          "After-hours coverage without after-hours staffing costs",
          "Books drain cleaning, water heater, remodel, and inspection calls",
          "Automated follow-up on estimates that didn't convert",
        ],
      }}
      cta={{
        title: "When a pipe bursts, speed wins the job",
        text: "GoFieldWise answers in under 3 seconds — before the customer calls your competitor.",
        href: "/demo",
        label: "See it in action →",
        sub: "$200/month flat. No contracts.",
      }}
      related={[
        { label: "HVAC", href: "/hvac" },
        { label: "Electrical", href: "/electrical" },
        { label: "Roofing", href: "/roofing" },
        { label: "Cleaning", href: "/cleaning" },
        { label: "See Pricing", href: "/pricing" },
      ]}
    />
  );
}
