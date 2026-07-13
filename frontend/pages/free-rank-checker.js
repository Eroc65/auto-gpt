import Head from "next/head";

import FreeSeoToolPage from "../components/FreeSeoToolPage";

export default function FreeRankCheckerPage() {
  return (
    <>
      <Head>
        <title>Free Google Keyword Rank Checker | GoFieldWise Oklahoma SEO</title>
        <meta
          name="description"
          content="Check where your business ranks on Google for your most important keyword and get a practical ranking improvement plan."
        />
        <link rel="canonical" href="https://gofieldwise.com/free-rank-checker" />
      </Head>
      <FreeSeoToolPage
        badge="Free Rank Check"
        title="Where does your business"
        highlight="rank on Google?"
        subhead="Enter your target keyword and website. We will show your estimated rank position and improvement priorities."
        source="gofieldwise.com/free-rank-checker"
        toolType="free_rank_checker"
        canonical="https://gofieldwise.com/free-rank-checker"
        submitLabel="Check my Google ranking"
        ctaDefault={{
          title: "Want to reach page 1 faster?",
          text: "Reply to your report email and we will map a focused 60-90 day ranking plan.",
          subject: "Rank Checker Results - I want page 1",
        }}
        extraFields={[
          { key: "website", label: "Business Website", type: "url", placeholder: "https://yoursite.com" },
          { key: "keyword", label: "Target Keyword", type: "text", placeholder: "e.g. HVAC repair Tulsa" },
        ]}
      />
    </>
  );
}
