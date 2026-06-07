import TradePage from "../components/TradePage";

export default function ElectricianSeo() {
  return (
    <TradePage
      title="Electrician SEO Oklahoma | Google Page 1 Rankings | GoFieldWise"
      description="GoFieldWise helps Oklahoma electricians rank for electrician near me and panel upgrade searches organically. Free ranking audit."
      canonical="https://gofieldwise.com/electrician-seo"
      ogTitle="Electrician SEO Services Oklahoma | GoFieldWise"
      breadcrumb="Electrician SEO Oklahoma"
      eyebrow="Local SEO for Electricians"
      h1="Electrician SEO Services Oklahoma — Get Found on Google Without Ads"
      intro="Panel upgrades, EV charger installs, whole-home rewiring — high-value jobs that start with a Google search. GoFieldWise puts your electrical company in front of Oklahoma homeowners when they're ready to hire."
      chips={["electrician near me Oklahoma", "panel upgrade Tulsa", "EV charger OKC", "electrician Broken Arrow", "whole home rewiring Oklahoma", "licensed electrician OKC"]}
      cta={{
        title: "Free Electrician SEO Audit",
        text: "See which searches your competitors are winning right now.",
        href: "mailto:biz@gofieldwise.com?subject=Free Electrician SEO Audit",
        label: "Get your free audit →",
      }}
      related={[
        { label: "HVAC SEO", href: "/hvac-seo" },
        { label: "Plumbing SEO", href: "/plumbing-seo" },
        { label: "Cleaning SEO", href: "/cleaning-seo" },
        { label: "Contractor Websites", href: "/website-design" },
      ]}
    />
  );
}
