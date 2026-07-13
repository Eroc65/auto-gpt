import Head from "next/head";

import FreeSeoToolPage from "../components/FreeSeoToolPage";

export default function FreeCompetitorPeekPage() {
  return (
    <>
      <Head>
        <title>Free Competitor SEO Check | GoFieldWise Oklahoma SEO</title>
        <meta
          name="description"
          content="See who ranks above you on Google and what they are doing better. Free competitor analysis for local service businesses."
        />
        <link rel="canonical" href="https://gofieldwise.com/free-competitor-peek" />
      </Head>
      <FreeSeoToolPage
        badge="Free Competitor Peek"
        title="See who is ranking above you"
        highlight="and why"
        subhead="Enter your city and trade. We will show where your competitive gap is and what to fix first."
        source="gofieldwise.com/free-competitor-peek"
        toolType="free_competitor_peek"
        canonical="https://gofieldwise.com/free-competitor-peek"
        submitLabel="Show me who is beating me"
        ctaDefault={{
          title: "Want to close the ranking gap?",
          text: "Reply to your report email and we will build a practical outrank plan.",
          subject: "Competitor Check Results - I want to outrank them",
        }}
        extraFields={[
          { key: "city", label: "City", type: "text", placeholder: "Tulsa" },
          { key: "website", label: "Business Website", type: "url", placeholder: "https://yoursite.com" },
        ]}
      />
    </>
  );
}
