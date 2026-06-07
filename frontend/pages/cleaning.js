import TradePage from "../components/TradePage";

export default function CleaningPage() {
  return (
    <TradePage
      title="AI Answering Service for Cleaning Companies | GoFieldWise — $200/mo"
      description="GoFieldWise answers every cleaning inquiry, qualifies the job, and books the appointment automatically. Residential, commercial, move-out — handled 24/7."
      canonical="https://gofieldwise.com/cleaning"
      ogTitle="AI Answering Service for Cleaning Companies | GoFieldWise"
      breadcrumb="Cleaning"
      accent="#4ADE80"
      icon="✨"
      ogImage="/images/og/gofieldwise-og-cleaning.webp"
      eyebrow="AI Answering Service for Cleaning Pros"
      h1="AI Answering Service for Cleaning Companies"
      intro="People searching for a cleaning service want to book fast. If they call and hit voicemail, they move on. GoFieldWise answers instantly, qualifies the job, and gets them booked."
      kpis={[
        { stat: "< 60 sec", label: "From call to booked" },
        { stat: "24/7", label: "Nights & weekends covered" },
        { stat: "$200/mo", label: "Flat pricing" },
      ]}
      bullets={{
        title: "GoFieldWise for cleaning businesses",
        items: [
          "Answers inquiry calls and texts — including nights and weekends",
          "Qualifies home size, service type, frequency, and preferred schedule",
          "Books standard, deep clean, and move-out appointments automatically",
          "Sends confirmation and reminder texts to reduce no-shows",
          "Follows up on quotes that didn't convert",
        ],
      }}
      cta={{
        title: "Turn every inquiry into a booked appointment",
        text: "GoFieldWise works while you clean — answering, qualifying, and booking on autopilot.",
        href: "/demo",
        label: "Try the demo →",
        sub: "$200/month. No contracts.",
      }}
      related={[
        { label: "HVAC", href: "/hvac" },
        { label: "Plumbing", href: "/plumbing" },
        { label: "Electrical", href: "/electrical" },
        { label: "Roofing", href: "/roofing" },
        { label: "See Pricing", href: "/pricing" },
      ]}
    />
  );
}
