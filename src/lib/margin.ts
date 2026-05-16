import type { Reorder, Product } from "./types";

export type MarginWindow = "30d" | "90d" | "all";

export function windowCutoff(window: MarginWindow): number {
  const now = Date.now();
  if (window === "30d") return now - 30 * 86400000;
  if (window === "90d") return now - 90 * 86400000;
  return 0;
}

export type MarginRollup = {
  revenueCents: number;
  cogsCents: number;
  grossCents: number;
  marginPct: number | null;
  countTagged: number;
  countUntagged: number;
};

export function rollupReorders(
  reorders: Reorder[],
  productCostFallback: Map<string, number>,
  window: MarginWindow = "all"
): MarginRollup {
  const cutoff = windowCutoff(window);
  let revenue = 0;
  let cogs = 0;
  let tagged = 0;
  let untagged = 0;

  for (const r of reorders) {
    if (new Date(r.occurred_at).getTime() < cutoff) continue;
    const cents = Math.round((r.dollars ?? 0) * 100);
    const units = r.units ?? 0;

    if (!r.product_id) {
      untagged++;
      continue;
    }

    const snapshot = r.unit_cost_cents ?? productCostFallback.get(r.product_id) ?? 0;
    revenue += cents;
    cogs += snapshot * units;
    tagged++;
  }

  const gross = revenue - cogs;
  const marginPct = revenue > 0 ? gross / revenue : null;

  return {
    revenueCents: revenue,
    cogsCents: cogs,
    grossCents: gross,
    marginPct,
    countTagged: tagged,
    countUntagged: untagged,
  };
}

export type SkuRollup = {
  product: Product;
  revenueCents: number;
  cogsCents: number;
  grossCents: number;
  marginPct: number | null;
  units: number;
  reorderCount: number;
};

export function rollupBySku(
  reorders: Reorder[],
  products: Product[],
  window: MarginWindow = "all"
): SkuRollup[] {
  const cutoff = windowCutoff(window);
  const byProduct = new Map<string, SkuRollup>();
  for (const p of products) {
    byProduct.set(p.id, {
      product: p,
      revenueCents: 0,
      cogsCents: 0,
      grossCents: 0,
      marginPct: null,
      units: 0,
      reorderCount: 0,
    });
  }

  for (const r of reorders) {
    if (!r.product_id) continue;
    if (new Date(r.occurred_at).getTime() < cutoff) continue;
    const row = byProduct.get(r.product_id);
    if (!row) continue;
    const cents = Math.round((r.dollars ?? 0) * 100);
    const units = r.units ?? 0;
    const snapshot = r.unit_cost_cents ?? row.product.unit_cost_cents;
    row.revenueCents += cents;
    row.cogsCents += snapshot * units;
    row.units += units;
    row.reorderCount += 1;
  }

  for (const row of byProduct.values()) {
    row.grossCents = row.revenueCents - row.cogsCents;
    row.marginPct = row.revenueCents > 0 ? row.grossCents / row.revenueCents : null;
  }

  return Array.from(byProduct.values()).sort(
    (a, b) => b.revenueCents - a.revenueCents
  );
}
