import TradePage from "../components/TradePage";

export default function PlumbingSeo() {
  return (
    <TradePage
      title="Plumbing SEO Oklahoma | Get More Calls From Google | GoFieldWise"
      description="We get Oklahoma plumbers to page 1 for emergency plumber near me and drain cleaning searches without ads. Free audit."
      canonical="https://gofieldwise.com/plumbing-seo"
      ogTitle="Plumbing SEO Services Oklahoma | GoFieldWise"
      breadcrumb="Plumbing SEO Oklahoma"
      eyebrow="Local SEO for Plumbers"
      h1="Plumbing SEO Services Oklahoma — Page 1 Rankings Without Paid Ads"
      intro="When a pipe bursts at 2am, homeowners call whoever shows up first on Google. GoFieldWise makes sure that's your plumbing company."
      chips={["emergency plumber Tulsa", "drain cleaning Oklahoma City", "water heater repair near me", "slab leak Oklahoma", "plumber Broken Arrow", "clogged drain Edmond"]}
      cta={{
        title: "Free Plumbing SEO Audit",
        text: "We show you exactly why competitors get calls you should be getting.",
        href: "mailto:biz@gofieldwise.com?subject=Free Plumbing SEO Audit",
        label: "Get your free audit →",
      }}
      related={[
        { label: "HVAC SEO", href: "/hvac-seo" },
        { label: "Electrician SEO", href: "/electrician-seo" },
        { label: "Cleaning SEO", href: "/cleaning-seo" },
        { label: "Contractor Websites", href: "/website-design" },
      ]}
    />
  );
}
