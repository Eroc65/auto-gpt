// Field Notes content. Plain data for now; swap to MDX or a CMS later if needed.
// Each post: slug, title, category, date (ISO), summary, body (string with \n\n paragraphs), cta {label, href}.

export const posts = [
  {
    slug: "never-miss-after-hours-call",
    title: "How to never miss an after-hours call",
    category: "Speed-to-lead",
    date: "2026-06-04",
    cover: "/images/blog/gofieldwise-never-miss-after-hours-call.webp",
    coverAlt: "GoFieldWise Field Notes cover — how home service businesses can stop missing after-hours calls",
    summary:
      "The cost of one missed call after 5 PM is bigger than most owners think. Here are three checks to run tonight.",
    body: [
      "The cost of one missed call after 5 PM is bigger than most owners think. A homeowner with a leaking water heater on a Tuesday night is not waiting until morning. They are calling the next number on Google. By Wednesday at 9 AM, the job is gone.",
      "The fix is not \"answer your phone more.\" The fix is a system that picks up every time, captures the urgency, books the slot, and tells the customer what happens next.",
      "Three checks to run on your current setup tonight:",
      "1. Call your own business number at 9 PM. Count the rings before voicemail picks up. If it is more than four, you are losing calls before voicemail even plays.",
      "2. Listen to your voicemail greeting. If it says \"leave a message and we will get back to you,\" rewrite it. Replace it with what you can actually book and when. Homeowners hate ambiguity at 9 PM.",
      "3. Send yourself a text from your business number. If the auto-reply does not come within 10 seconds, missed calls become missed leads.",
      "The win is not catching every call yourself. It is making sure something productive happens on every call you do not catch — capture, qualify, book, confirm. That is the system. Once it is running, after-hours stops being a coverage problem and becomes a revenue channel.",
      "If you want to see what that looks like in 60 seconds, try the live demo. It picks up, qualifies, and books while you watch."
    ].join("\n\n"),
    cta: { label: "Try the live demo", href: "/demo" }
  },
  {
    slug: "real-dispatch-summary",
    title: "What a real dispatch summary should look like",
    category: "Dispatch",
    date: "2026-05-28",
    cover: "/images/blog/gofieldwise-real-dispatch-summary.webp",
    coverAlt: "GoFieldWise Field Notes cover — what a real dispatch summary should include for field service techs",
    summary:
      "Most dispatch summaries fail one test: can the tech walk in and start working? Here is the six-field template that passes.",
    body: [
      "Most dispatch summaries fail one test: can the tech walk into the job and start working, or do they need to call the customer back to figure out what is going on?",
      "If the answer is \"call back,\" the summary failed.",
      "A real summary has six fields. Every job, every time:",
      "1. Customer name, address, gate code or access notes.",
      "2. Phone number plus the best time to reach them.",
      "3. The actual problem in the customer's words — \"no hot water since last night,\" not \"plumbing service requested.\"",
      "4. Urgency level — emergency, today, this week, scheduled.",
      "5. What the customer expects when you arrive — diagnostic, repair, replacement quote.",
      "6. Notes on anything weird — dog in the yard, prior tech visited, warranty in play.",
      "That is it. No more. No less.",
      "What you do not need: a sales pitch script, a five-paragraph intake narrative, a list of every previous job. The tech needs to know what to fix and what the customer wants. Background noise costs time.",
      "The hardest part is not writing the summary. It is getting one every time, on every call, including the 11 PM ones nobody is awake for. That is where most shops break. The owner writes great summaries when they take the call. The fill-in receptionist writes okay ones. After-hours generates nothing usable, so the tech shows up at 8 AM cold.",
      "Fixing this is mechanical. Either you train every intake person on the six fields, or you put the intake on a system that captures them every time without you having to think about it."
    ].join("\n\n"),
    cta: { label: "See GoFieldwise Connect", href: "/connect" }
  },
  {
    slug: "software-for-one-van-shops",
    title: "Why most field service software fails one-van shops",
    category: "Tools that work",
    date: "2026-05-21",
    cover: "/images/blog/gofieldwise-field-service-software-one-van-shops.webp",
    coverAlt: "GoFieldWise Field Notes cover — why most field service software fails one-van home service shops",
    summary:
      "Most platforms were built for 30-tech shops. When a one-van operator adopts the same tool, the math stops working.",
    body: [
      "Most field service platforms were built for shops with 30+ techs and a full back-office team. When a one-van shop adopts the same tool, the math stops working.",
      "Three reasons it breaks:",
      "1. Per-seat pricing punishes small teams disproportionately. Paying $80 a seat for \"the owner, the tech, and the accountant on weekends\" is fine at five seats. At three seats it is half your software budget for a feature set you mostly do not use.",
      "2. Setup time is owner time. Enterprise tools assume a configurator on staff. A one-van shop's configurator is the same person doing 8 AM service calls. The setup keeps getting bumped to \"this weekend.\" It never happens. The software becomes a paid login nobody opens.",
      "3. The features you actually need are spread across three add-ons. Calls, scheduling, follow-ups, invoicing — bundled in the marketing page, billed separately on the contract. By the time you have added what you need, the price is triple the quoted starting tier.",
      "What a one-van shop actually needs: one login, one flat price, intake-to-invoice in one workflow, and live in under an hour. If the trial requires onboarding calls, it is built for someone else.",
      "If you want a real benchmark: time how long it took your current tool to send the first usable customer text after install. Then time the same thing with whatever you compare it to. Pick the one with the shorter clock. Everything else is marketing."
    ].join("\n\n"),
    cta: { label: "See pricing", href: "/pricing" }
  }
];

export function getAllPosts() {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug) {
  return posts.find((p) => p.slug === slug) || null;
}

export function getLatestPosts(limit = 3) {
  return getAllPosts().slice(0, limit);
}

export function formatPostDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
