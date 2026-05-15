import type { AccountStage, InteractionType } from "./types";

type SeedAccount = {
  name: string;
  banner: string;
  location_text: string;
  region: string;
  doors_count: number;
  stage: AccountStage;
  tags: string[];
  notes?: string;
  reorderCadenceDays?: number; // for on_shelf / reordering accounts
  buyers: { name: string; title: string; email: string; phone?: string }[];
};

export const SEED_ACCOUNTS: SeedAccount[] = [
  {
    name: "Erewhon Calabasas",
    banner: "Erewhon",
    location_text: "Calabasas, CA",
    region: "So Cal",
    doors_count: 1,
    stage: "reordering",
    tags: ["hot", "premium"],
    notes: "Top performer. Buyer is responsive — keep cadence tight.",
    reorderCadenceDays: 21,
    buyers: [
      { name: "Sasha Patel", title: "Grocery Buyer", email: "sasha.patel@erewhonmarket.example" },
    ],
  },
  {
    name: "Whole Foods PNW",
    banner: "Whole Foods Market",
    location_text: "Bellevue, WA",
    region: "Pacific Northwest",
    doors_count: 42,
    stage: "reordering",
    tags: ["regional"],
    notes: "Multi-store reorder. Coordinator handles all doors.",
    reorderCadenceDays: 35,
    buyers: [
      { name: "Diego Romero", title: "Regional Buyer, Grocery", email: "diego.r@wholefoods.example" },
      { name: "Marie Chen", title: "Category Coordinator", email: "marie.c@wholefoods.example" },
    ],
  },
  {
    name: "Bristol Farms Beverly Hills",
    banner: "Bristol Farms",
    location_text: "Beverly Hills, CA",
    region: "So Cal",
    doors_count: 14,
    stage: "on_shelf",
    tags: ["warm"],
    notes: "Shelved 8 weeks ago. Watch the reorder window.",
    reorderCadenceDays: 28,
    buyers: [
      { name: "Hannah Okafor", title: "Grocery Buyer", email: "hannah@bristolfarms.example" },
    ],
  },
  {
    name: "Sprouts Mountain West",
    banner: "Sprouts",
    location_text: "Phoenix, AZ",
    region: "Mountain West",
    doors_count: 78,
    stage: "on_shelf",
    tags: ["regional", "warm"],
    notes: "Slower reorder cadence — distributor-driven.",
    reorderCadenceDays: 45,
    buyers: [
      { name: "Tariq Brooks", title: "Regional Category Manager", email: "tbrooks@sprouts.example" },
    ],
  },
  {
    name: "Foxtrot Chicago",
    banner: "Foxtrot",
    location_text: "Chicago, IL",
    region: "Midwest",
    doors_count: 12,
    stage: "pitched",
    tags: ["hot"],
    notes: "Pitched 2 weeks ago — buyer asked for samples.",
    buyers: [
      { name: "Ava Lindgren", title: "Buyer, Grocery & Snacks", email: "ava.l@foxtrot.example" },
    ],
  },
  {
    name: "Pod Foods Northeast",
    banner: "Pod Foods",
    location_text: "New York, NY",
    region: "Northeast",
    doors_count: 6,
    stage: "approved",
    tags: ["distributor"],
    notes: "Approved — first PO expected in 3 weeks.",
    buyers: [
      { name: "Felix Donovan", title: "Account Manager", email: "felix@podfoods.example" },
      { name: "Priya Anand", title: "Buyer, Emerging Brands", email: "priya@podfoods.example" },
    ],
  },
  {
    name: "Mom's Organic Market DC",
    banner: "Mom's Organic",
    location_text: "Rockville, MD",
    region: "DC Metro",
    doors_count: 18,
    stage: "approved",
    tags: ["warm"],
    notes: "PO out for 18 doors. First ship next month.",
    buyers: [
      { name: "Cole Whitman", title: "Grocery Buyer", email: "cwhitman@momsorganic.example" },
    ],
  },
  {
    name: "Gelson's So Cal",
    banner: "Gelson's",
    location_text: "Los Angeles, CA",
    region: "So Cal",
    doors_count: 27,
    stage: "on_shelf",
    tags: ["regional"],
    notes: "Shelved across 27 doors. Distributor handles reorders.",
    reorderCadenceDays: 30,
    buyers: [
      { name: "Naomi Becker", title: "Senior Grocery Buyer", email: "n.becker@gelsons.example" },
    ],
  },
  {
    name: "Lassens Natural Foods",
    banner: "Lassens",
    location_text: "Ventura, CA",
    region: "So Cal",
    doors_count: 10,
    stage: "pitched",
    tags: ["warm"],
    notes: "Pitched at Expo West. Following up next week.",
    buyers: [
      { name: "Owen Travers", title: "Buyer", email: "owen@lassens.example" },
    ],
  },
  {
    name: "Central Market Texas",
    banner: "Central Market",
    location_text: "Austin, TX",
    region: "Texas",
    doors_count: 9,
    stage: "researching",
    tags: ["cold"],
    notes: "Need warm intro. Met someone at Foxtrot who might connect.",
    buyers: [
      { name: "Jasmine Wu", title: "Specialty Buyer", email: "j.wu@centralmarket.example" },
    ],
  },
  {
    name: "Pop Up Grocer",
    banner: "Pop Up Grocer",
    location_text: "Tribeca, NYC",
    region: "Northeast",
    doors_count: 6,
    stage: "researching",
    tags: ["warm", "discovery"],
    notes: "Submitted application via website. Awaiting response.",
    buyers: [
      { name: "Rio Halsey", title: "Founder & Buyer", email: "rio@popupgrocer.example" },
    ],
  },
  {
    name: "Citarella",
    banner: "Citarella",
    location_text: "Manhattan, NY",
    region: "Northeast",
    doors_count: 4,
    stage: "researching",
    tags: ["cold"],
    notes: "Cold lead — high-end Manhattan grocer. Worth a try Q3.",
    buyers: [
      { name: "Marco Bellini", title: "Specialty Buyer", email: "m.bellini@citarella.example" },
    ],
  },
];

// Deterministic PRNG so seed is reproducible per-user.
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const INTERACTION_TEMPLATES: { type: InteractionType; lines: string[] }[] = [
  {
    type: "email",
    lines: [
      "Sent intro deck",
      "Followed up on samples",
      "Replied with availability",
      "Sent pricing one-pager",
      "Confirmed delivery window",
      "Asked about resets",
    ],
  },
  {
    type: "call",
    lines: [
      "15 min call — covered SKU mix",
      "Quick check-in call",
      "Discussed shelf placement",
      "Reviewed sell-through numbers",
    ],
  },
  {
    type: "meeting",
    lines: [
      "In-store walkthrough",
      "Buyer review meeting",
      "Category review session",
      "Quarterly business review",
    ],
  },
  {
    type: "sample",
    lines: [
      "Dropped off samples (4 SKUs)",
      "Mailed sample box",
      "Hand-delivered new flavor",
    ],
  },
  {
    type: "pitch",
    lines: ["First pitch meeting", "Re-pitch with updated story"],
  },
  {
    type: "note",
    lines: [
      "Buyer mentioned promo calendar",
      "Need to circle back next quarter",
      "Sell-through trending up",
    ],
  },
];

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

export type SeedOutput = {
  account: {
    name: string;
    banner: string;
    location_text: string;
    region: string;
    doors_count: number;
    stage: AccountStage;
    tags: string[];
    notes: string | null;
  };
  buyers: { name: string; title: string; email: string; phone: string | null }[];
  interactions: {
    type: InteractionType;
    summary: string;
    occurred_at: string;
    buyerIndex: number | null;
  }[];
  reorders: { occurred_at: string; units: number; dollars: number }[];
};

export function buildSeed(seedKey: string): SeedOutput[] {
  // Stable hash from seed string.
  let h = 2166136261;
  for (let i = 0; i < seedKey.length; i++) {
    h = (h ^ seedKey.charCodeAt(i)) >>> 0;
    h = Math.imul(h, 16777619) >>> 0;
  }
  const rng = mulberry32(h);
  const now = Date.now();
  const day = 86400000;

  return SEED_ACCOUNTS.map((a) => {
    const interactionCount = 5 + Math.floor(rng() * 11); // 5–15
    const interactions: SeedOutput["interactions"] = [];
    for (let i = 0; i < interactionCount; i++) {
      const tmpl = pick(INTERACTION_TEMPLATES, rng);
      const summary = pick(tmpl.lines, rng);
      const daysAgo = Math.floor(rng() * 180);
      const hours = Math.floor(rng() * 10) + 8;
      const occurred = new Date(now - daysAgo * day);
      occurred.setHours(hours, Math.floor(rng() * 60), 0, 0);
      interactions.push({
        type: tmpl.type,
        summary,
        occurred_at: occurred.toISOString(),
        buyerIndex:
          a.buyers.length > 0 && rng() > 0.3
            ? Math.floor(rng() * a.buyers.length)
            : null,
      });
    }
    interactions.sort((x, y) => (x.occurred_at < y.occurred_at ? 1 : -1));

    const reorders: SeedOutput["reorders"] = [];
    if (
      (a.stage === "on_shelf" || a.stage === "reordering") &&
      a.reorderCadenceDays
    ) {
      const count = 2 + Math.floor(rng() * 7); // 2–8
      // Most recent reorder offset depends on stage.
      const recencyFactor =
        a.stage === "reordering" ? 0.5 : 1.0 + rng() * 0.4; // reordering = recent
      let cursor = a.reorderCadenceDays * recencyFactor;
      for (let i = 0; i < count; i++) {
        const jitter = (rng() - 0.5) * a.reorderCadenceDays * 0.3;
        const occurred = new Date(now - (cursor + jitter) * day);
        const baseUnits = 36 + Math.floor(rng() * 96);
        const units = baseUnits * Math.max(1, Math.floor(a.doors_count / 6));
        const unitPrice = 4.5 + rng() * 1.5;
        reorders.push({
          occurred_at: occurred.toISOString(),
          units,
          dollars: Math.round(units * unitPrice * 100) / 100,
        });
        cursor += a.reorderCadenceDays * (0.85 + rng() * 0.4);
      }
      reorders.sort((x, y) => (x.occurred_at < y.occurred_at ? 1 : -1));

      // Also seed corresponding 'reorder' interactions for the recent ones.
      reorders.slice(0, Math.min(3, reorders.length)).forEach((r) => {
        interactions.push({
          type: "reorder",
          summary: `Reorder · ${r.units} units · $${r.dollars.toFixed(0)}`,
          occurred_at: r.occurred_at,
          buyerIndex: null,
        });
      });
      interactions.sort((x, y) => (x.occurred_at < y.occurred_at ? 1 : -1));
    }

    return {
      account: {
        name: a.name,
        banner: a.banner,
        location_text: a.location_text,
        region: a.region,
        doors_count: a.doors_count,
        stage: a.stage,
        tags: a.tags,
        notes: a.notes ?? null,
      },
      buyers: a.buyers.map((b) => ({
        name: b.name,
        title: b.title,
        email: b.email,
        phone: b.phone ?? null,
      })),
      interactions,
      reorders,
    };
  });
}
