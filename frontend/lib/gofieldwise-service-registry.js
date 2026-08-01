export const GOFIELDWISE_SERVICE_REGISTRY_VERSION = "2026-07-24";

const SERVICE_REGISTRY = [
  {
    id: "seo-hvac",
    group: "seo-services",
    category: "local-seo",
    name: "HVAC SEO",
    route: "/hvac-seo",
    publicUrl: "https://gofieldwise.com/hvac-seo",
    status: "live",
    owner: "growth-engine",
    notes: "Oklahoma local SEO page for HVAC companies.",
  },
  {
    id: "seo-plumbing",
    group: "seo-services",
    category: "local-seo",
    name: "Plumbing SEO",
    route: "/plumbing-seo",
    publicUrl: "https://gofieldwise.com/plumbing-seo",
    status: "live",
    owner: "growth-engine",
    notes: "Oklahoma local SEO page for plumbing companies.",
  },
  {
    id: "seo-electrician",
    group: "seo-services",
    category: "local-seo",
    name: "Electrician SEO",
    route: "/electrician-seo",
    publicUrl: "https://gofieldwise.com/electrician-seo",
    status: "live",
    owner: "growth-engine",
    notes: "Oklahoma local SEO page for electrical contractors.",
  },
  {
    id: "seo-cleaning",
    group: "seo-services",
    category: "local-seo",
    name: "Cleaning SEO",
    route: "/cleaning-seo",
    publicUrl: "https://gofieldwise.com/cleaning-seo",
    status: "live",
    owner: "growth-engine",
    notes: "Oklahoma local SEO page for cleaning companies.",
  },
  {
    id: "website-design",
    group: "core-services",
    category: "website-design",
    name: "Contractor Website Design",
    route: "/website-design",
    publicUrl: "https://gofieldwise.com/website-design",
    status: "live",
    owner: "growth-engine",
    notes: "SEO-first website offering for contractor clients.",
  },
  {
    id: "connect",
    group: "core-services",
    category: "front-office-integration",
    name: "GoFieldWise Connect",
    route: "/connect",
    publicUrl: "https://gofieldwise.com/connect",
    status: "live",
    owner: "growth-engine",
    notes: "AI front-office integration layer for CRM and dispatch workflows.",
  },
  {
    id: "free-seo-audit",
    group: "lead-gen-tools",
    category: "lead-gen",
    name: "Free SEO Audit",
    route: "/free-seo-audit",
    publicUrl: "https://gofieldwise.com/free-seo-audit",
    status: "live",
    owner: "growth-engine",
    notes: "Lead capture tool for SEO audits.",
  },
  {
    id: "free-rank-checker",
    group: "lead-gen-tools",
    category: "lead-gen",
    name: "Free Rank Checker",
    route: "/free-rank-checker",
    publicUrl: "https://gofieldwise.com/free-rank-checker",
    status: "live",
    owner: "growth-engine",
    notes: "Lead capture tool for ranking checks.",
  },
  {
    id: "free-gbp-check",
    group: "lead-gen-tools",
    category: "lead-gen",
    name: "Free GBP Check",
    route: "/free-gbp-check",
    publicUrl: "https://gofieldwise.com/free-gbp-check",
    status: "live",
    owner: "growth-engine",
    notes: "Lead capture tool for Google Business Profile audits.",
  },
  {
    id: "free-competitor-peek",
    group: "lead-gen-tools",
    category: "lead-gen",
    name: "Free Competitor Peek",
    route: "/free-competitor-peek",
    publicUrl: "https://gofieldwise.com/free-competitor-peek",
    status: "live",
    owner: "growth-engine",
    notes: "Lead capture tool for competitor gap checks.",
  },
  {
    id: "rank-rent-fort-worth",
    group: "rank-and-rent",
    category: "rank-and-rent",
    name: "Fort Worth Garage Door Repair",
    route: "/api/twilio/voice/fort-worth",
    status: "active",
    owner: "growth-engine",
    notes: "Whisper-forwarding rank-and-rent number for Fort Worth.",
  },
  {
    id: "rank-rent-el-paso",
    group: "rank-and-rent",
    category: "rank-and-rent",
    name: "El Paso Garage Door Repair",
    route: "/api/twilio/voice/el-paso",
    status: "active",
    owner: "growth-engine",
    notes: "Whisper-forwarding rank-and-rent number for El Paso.",
  },
  {
    id: "rank-rent-arlington",
    group: "rank-and-rent",
    category: "rank-and-rent",
    name: "Arlington Garage Door Repair",
    route: "/api/twilio/voice/arlington",
    status: "active",
    owner: "growth-engine",
    notes: "Whisper-forwarding rank-and-rent number for Arlington.",
  },
];

export function getServiceRegistry() {
  return [...SERVICE_REGISTRY];
}

export function getServiceRegistryItem(id) {
  return SERVICE_REGISTRY.find((item) => item.id === id) || null;
}

export function getServiceRegistrySummary() {
  return SERVICE_REGISTRY.reduce(
    (acc, item) => {
      acc.groups[item.group] = acc.groups[item.group] || [];
      acc.groups[item.group].push(item);
      return acc;
    },
    { version: GOFIELDWISE_SERVICE_REGISTRY_VERSION, groups: {} }
  );
}

export function formatServiceRegistryContext() {
  const groups = getServiceRegistrySummary().groups;
  return Object.entries(groups)
    .map(([group, items]) => {
      const lines = items
        .map((item) => `- ${item.name} (${item.route}) [${item.status}]`)
        .join("\n");
      return `${group}:\n${lines}`;
    })
    .join("\n\n");
}
