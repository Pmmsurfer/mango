import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, Pencil } from "lucide-react";
import { Tag } from "@/components/ui/tag";
import { EmptyState } from "@/components/ui/empty-state";
import {
  NewProductDialog,
  EditProductDialog,
} from "@/components/products/product-dialog";
import { MarginWindowToggle } from "@/components/products/margin-window";
import {
  rollupBySku,
  rollupReorders,
  type MarginWindow,
} from "@/lib/margin";
import { dollars, percent } from "@/lib/format";
import type { Product, Reorder } from "@/lib/types";

export const dynamic = "force-dynamic";

type Search = Promise<{ win?: MarginWindow }>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { win = "90d" } = await searchParams;
  const window = (["30d", "90d", "all"] as const).includes(win) ? win : "90d";

  const supabase = await createClient();
  const [{ data: products }, { data: reorders }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .order("active", { ascending: false })
      .order("name", { ascending: true }),
    supabase.from("reorders").select("*"),
  ]);

  const ps = (products ?? []) as Product[];
  const rs = (reorders ?? []) as Reorder[];
  const costFallback = new Map(ps.map((p) => [p.id, p.unit_cost_cents]));
  const totals = rollupReorders(rs, costFallback, window);
  const skuRollup = rollupBySku(rs, ps, window);

  return (
    <>
      <div className="border-b border-line bg-surface px-6 py-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl text-ink">Products</h1>
            <p className="font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
              {ps.length} SKU{ps.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <MarginWindowToggle active={window} />
            <NewProductDialog
              trigger={
                <button className="inline-flex items-center gap-1.5 rounded-full bg-mango px-4 py-2 text-sm font-medium text-white transition hover:bg-mango-deep">
                  <Plus className="size-3.5" /> New SKU
                </button>
              }
            />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <BrandMetric label="Revenue" value={dollars(totals.revenueCents)} />
          <BrandMetric label="COGS" value={dollars(totals.cogsCents)} />
          <BrandMetric label="Gross" value={dollars(totals.grossCents)} />
          <BrandMetric label="Margin" value={percent(totals.marginPct)} />
        </div>
        {totals.countUntagged > 0 ? (
          <p className="mt-3 font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
            {totals.countUntagged} untagged reorder
            {totals.countUntagged === 1 ? "" : "s"} excluded from margin —{" "}
            <Link
              href="/app/accounts"
              className="text-ink-soft underline-offset-4 hover:underline"
            >
              tag them
            </Link>
          </p>
        ) : null}
      </div>

      <div className="flex-1 px-6 py-6">
        {ps.length === 0 ? (
          <EmptyState
            title="No SKUs yet"
            description="Add your products with unit cost and wholesale price. Then tag reorders to see margins per door, per buyer, per SKU."
            action={
              <NewProductDialog
                trigger={
                  <button className="inline-flex items-center gap-1.5 rounded-full bg-mango px-4 py-2 text-sm font-medium text-white transition hover:bg-mango-deep">
                    <Plus className="size-3.5" /> New SKU
                  </button>
                }
              />
            }
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-cream/40 text-left">
                <tr>
                  <Th>SKU</Th>
                  <Th>Product</Th>
                  <Th className="text-right">Cost</Th>
                  <Th className="text-right">Wholesale</Th>
                  <Th className="text-right">Margin</Th>
                  <Th className="text-right">Revenue ({window})</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {ps.map((p) => {
                  const baseMargin =
                    p.wholesale_price_cents > 0
                      ? (p.wholesale_price_cents - p.unit_cost_cents) /
                        p.wholesale_price_cents
                      : null;
                  const roll = skuRollup.find((r) => r.product.id === p.id);
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-line/60 last:border-0"
                    >
                      <td className="px-4 py-3 font-data text-[11px] uppercase tracking-[0.1em] text-ink-soft">
                        {p.sku ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ink">{p.name}</span>
                          {!p.active ? <Tag variant="cold">Inactive</Tag> : null}
                        </div>
                        {p.case_pack !== 12 ? (
                          <div className="font-data text-[10px] text-ink-mute">
                            {p.case_pack}/case
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-right font-data text-ink-soft">
                        {dollars(p.unit_cost_cents, true)}
                      </td>
                      <td className="px-4 py-3 text-right font-data text-ink-soft">
                        {dollars(p.wholesale_price_cents, true)}
                      </td>
                      <td className="px-4 py-3 text-right font-data text-ink">
                        {percent(baseMargin)}
                      </td>
                      <td className="px-4 py-3 text-right font-data text-ink">
                        {roll && roll.revenueCents > 0
                          ? dollars(roll.revenueCents)
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <EditProductDialog
                          product={p}
                          trigger={
                            <button
                              aria-label="Edit"
                              className="inline-flex size-7 items-center justify-center rounded-full border border-line text-ink-mute transition hover:border-mango hover:text-ink"
                            >
                              <Pencil className="size-3" />
                            </button>
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function BrandMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <div className="font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl text-ink">{value}</div>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={
        "px-4 py-2.5 font-data text-[10px] font-medium uppercase tracking-[0.18em] text-ink-mute " +
        className
      }
    >
      {children}
    </th>
  );
}
