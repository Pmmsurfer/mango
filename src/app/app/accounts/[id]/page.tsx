import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Tag } from "@/components/ui/tag";
import { AvatarCircle } from "@/components/ui/avatar-circle";
import { EmptyState } from "@/components/ui/empty-state";
import { DetailTabs } from "@/components/account/detail-tabs";
import { InteractionRow } from "@/components/account/interaction-row";
import { AddBuyerDialog } from "@/components/account/add-buyer-dialog";
import { LogInteractionDialog } from "@/components/account/log-interaction-dialog";
import {
  LogReorderDialog,
  type ProductOption,
} from "@/components/radar/radar-actions";
import { MarginWindowToggle } from "@/components/products/margin-window";
import { rollupReorders, type MarginWindow } from "@/lib/margin";
import {
  STAGE_LABELS,
  INTERACTION_LABELS,
  type Account,
  type Buyer,
  type Interaction,
  type InteractionType,
  type Product,
  type Reorder,
} from "@/lib/types";
import { relative, shortDate, dollars, percent } from "@/lib/format";

export const dynamic = "force-dynamic";

type Search = Promise<{ tab?: string; type?: string; win?: MarginWindow }>;

export default async function AccountDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Search;
}) {
  const { id } = await params;
  const { tab = "overview", type, win = "90d" } = await searchParams;
  const window: MarginWindow = (["30d", "90d", "all"] as const).includes(win)
    ? win
    : "90d";

  const supabase = await createClient();

  const [
    { data: account },
    { data: buyers },
    { data: interactions },
    { data: reorders },
    { data: products },
  ] = await Promise.all([
    supabase.from("accounts").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("buyers")
      .select("*")
      .eq("account_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("interactions")
      .select("*")
      .eq("account_id", id)
      .order("occurred_at", { ascending: false }),
    supabase
      .from("reorders")
      .select("*")
      .eq("account_id", id)
      .order("occurred_at", { ascending: false }),
    supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true }),
  ]);

  if (!account) notFound();
  const a = account as Account;
  const bs = (buyers ?? []) as Buyer[];
  const is = (interactions ?? []) as Interaction[];
  const rs = (reorders ?? []) as Reorder[];
  const ps = (products ?? []) as Product[];
  const productsById = new Map(ps.map((p) => [p.id, p]));

  const buyersById = new Map(bs.map((b) => [b.id, b.name]));

  const lastInteraction = is[0];
  const lastReorder = rs[0];
  const cadence = computeCadence(rs);
  const costFallback = new Map(ps.map((p) => [p.id, p.unit_cost_cents]));
  const margin = rollupReorders(rs, costFallback, window);
  const productOptions: ProductOption[] = ps
    .filter((p) => p.active)
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      wholesale_price_cents: p.wholesale_price_cents,
      unit_cost_cents: p.unit_cost_cents,
    }));

  return (
    <>
      <div className="border-b border-line bg-surface px-6 py-5">
        <Link
          href="/app/pipeline"
          className="inline-flex items-center gap-1 font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute transition hover:text-ink"
        >
          <ArrowLeft className="size-3" /> Back to pipeline
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <AvatarCircle name={a.name} size={36} />
              <h1 className="font-display text-4xl leading-tight text-ink">
                {a.name}
              </h1>
            </div>
            <p className="mt-2 font-data text-[11px] uppercase tracking-[0.18em] text-ink-mute">
              {STAGE_LABELS[a.stage]}
              {a.location_text ? ` · ${a.location_text}` : ""}
              {a.region ? ` · ${a.region}` : ""}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <LogReorderDialog accountId={a.id} products={productOptions} />
            <div className="flex flex-wrap justify-end gap-2">
              {(a.tags ?? []).map((t) => (
                <Tag key={t} variant="neutral">
                  {t}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pt-2">
        <DetailTabs
          tabs={[
            { id: "overview", label: "Overview" },
            { id: "buyers", label: `Buyers (${bs.length})` },
            { id: "history", label: `History (${is.length})` },
          ]}
        />
      </div>

      <div className="flex-1 px-6 py-6">
        {tab === "overview" ? (
          <OverviewTab
            a={a}
            buyersById={buyersById}
            lastInteractionAt={lastInteraction?.occurred_at}
            lastReorderAt={lastReorder?.occurred_at}
            cadence={cadence}
            interactions={is.slice(0, 10)}
            buyers={bs}
            margin={margin}
            marginWindow={window}
            productsById={productsById}
          />
        ) : tab === "buyers" ? (
          <BuyersTab accountId={a.id} buyers={bs} />
        ) : tab === "history" ? (
          <HistoryTab
            accountId={a.id}
            buyers={bs}
            interactions={is}
            buyersById={buyersById}
            reordersById={new Map(rs.map((r) => [r.id, r]))}
            productsById={productsById}
            filterType={type as InteractionType | undefined}
          />
        ) : null}
      </div>
    </>
  );
}

function computeCadence(reorders: Reorder[]) {
  if (reorders.length < 2) return null;
  const sorted = [...reorders].sort(
    (a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime()
  );
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push(
      (new Date(sorted[i].occurred_at).getTime() -
        new Date(sorted[i - 1].occurred_at).getTime()) /
        86400000
    );
  }
  return Math.round(gaps.reduce((s, x) => s + x, 0) / gaps.length);
}

function OverviewTab({
  a,
  lastInteractionAt,
  lastReorderAt,
  cadence,
  interactions,
  buyers,
  buyersById,
  margin,
  marginWindow,
  productsById,
}: {
  a: Account;
  lastInteractionAt?: string;
  lastReorderAt?: string;
  cadence: number | null;
  interactions: Interaction[];
  buyers: Buyer[];
  buyersById: Map<string, string>;
  margin: ReturnType<typeof rollupReorders>;
  marginWindow: MarginWindow;
  productsById: Map<string, Product>;
}) {
  void productsById; // reserved for future per-SKU breakdown in overview
  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Doors" value={String(a.doors_count)} />
          <Metric
            label="Last contact"
            value={lastInteractionAt ? relative(lastInteractionAt) : "—"}
          />
          <Metric
            label="Last reorder"
            value={lastReorderAt ? relative(lastReorderAt) : "—"}
          />
          <Metric label="Cadence" value={cadence ? `${cadence}d` : "—"} />
        </div>

        <div className="rounded-lg border border-line bg-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg text-ink">Margin</h3>
              <p className="font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
                {margin.countTagged} tagged reorder{margin.countTagged === 1 ? "" : "s"}
                {margin.countUntagged > 0
                  ? ` · ${margin.countUntagged} untagged`
                  : ""}
              </p>
            </div>
            <MarginWindowToggle active={marginWindow} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Metric label="Revenue" value={dollars(margin.revenueCents)} />
            <Metric label="COGS" value={dollars(margin.cogsCents)} />
            <Metric label="Margin" value={percent(margin.marginPct)} />
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h3 className="font-display text-lg text-ink">Recent activity</h3>
            <LogInteractionDialog
              accountId={a.id}
              buyers={buyers}
              trigger={
                <button className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs text-ink-soft transition hover:border-mango hover:text-ink">
                  <Plus className="size-3" /> Log interaction
                </button>
              }
            />
          </div>
          {interactions.length === 0 ? (
            <p className="px-4 py-6 text-sm text-ink-mute">
              No interactions yet.
            </p>
          ) : (
            <div>
              {interactions.map((i) => (
                <InteractionRow
                  key={i.id}
                  type={i.type}
                  occurred_at={i.occurred_at}
                  summary={i.summary}
                  buyerName={i.buyer_id ? buyersById.get(i.buyer_id) : null}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-lg border border-line bg-surface p-4">
          <h3 className="font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
            Notes
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
            {a.notes || (
              <span className="italic text-ink-mute">No notes yet.</span>
            )}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <h3 className="font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
            Buyers
          </h3>
          <ul className="mt-2 space-y-2">
            {buyers.length === 0 ? (
              <li className="text-sm text-ink-mute">No buyers yet.</li>
            ) : (
              buyers.map((b) => (
                <li key={b.id} className="text-sm">
                  <div className="font-medium text-ink">{b.name}</div>
                  {b.title ? (
                    <div className="text-xs text-ink-mute">{b.title}</div>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <div className="font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
        {label}
      </div>
      <div className="mt-1 font-display text-xl text-ink">{value}</div>
    </div>
  );
}

function BuyersTab({
  accountId,
  buyers,
}: {
  accountId: string;
  buyers: Buyer[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-ink">Buyers</h2>
        <AddBuyerDialog
          accountId={accountId}
          trigger={
            <button className="inline-flex items-center gap-1 rounded-full bg-mango px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-mango-deep">
              <Plus className="size-3" /> Add buyer
            </button>
          }
        />
      </div>
      {buyers.length === 0 ? (
        <EmptyState
          title="No buyers yet"
          description="Add the people you actually deal with — the buyer is the relationship."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-cream/40 text-left">
              <tr>
                <Th>Name</Th>
                <Th>Title</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
              </tr>
            </thead>
            <tbody>
              {buyers.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-line/60 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <AvatarCircle name={b.name} size={26} />
                      <span className="font-medium text-ink">{b.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{b.title ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-soft">{b.email ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-soft">{b.phone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function HistoryTab({
  accountId,
  buyers,
  interactions,
  buyersById,
  reordersById,
  productsById,
  filterType,
}: {
  accountId: string;
  buyers: Buyer[];
  interactions: Interaction[];
  buyersById: Map<string, string>;
  reordersById: Map<string, Reorder>;
  productsById: Map<string, Product>;
  filterType?: InteractionType;
}) {
  void reordersById;
  void productsById;
  const list = filterType
    ? interactions.filter((i) => i.type === filterType)
    : interactions;
  const types: InteractionType[] = [
    "email",
    "call",
    "meeting",
    "sample",
    "pitch",
    "reorder",
    "note",
    "job_change",
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <FilterChip href={`/app/accounts/${accountId}?tab=history`} active={!filterType}>
            All
          </FilterChip>
          {types.map((t) => (
            <FilterChip
              key={t}
              href={`/app/accounts/${accountId}?tab=history&type=${t}`}
              active={filterType === t}
            >
              {INTERACTION_LABELS[t]}
            </FilterChip>
          ))}
        </div>
        <LogInteractionDialog
          accountId={accountId}
          buyers={buyers}
          trigger={
            <button className="inline-flex items-center gap-1 rounded-full bg-mango px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-mango-deep">
              <Plus className="size-3" /> Log interaction
            </button>
          }
        />
      </div>
      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        {list.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-mute">No interactions match.</p>
        ) : (
          list.map((i) => (
            <InteractionRow
              key={i.id}
              type={i.type}
              occurred_at={i.occurred_at}
              summary={i.summary}
              buyerName={i.buyer_id ? buyersById.get(i.buyer_id) : null}
            />
          ))
        )}
      </div>
      <p className="font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
        Showing {list.length} of {interactions.length} ·{" "}
        {interactions[0] ? `last on ${shortDate(interactions[0].occurred_at)}` : "no history"}
      </p>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={
        "rounded-full border px-2.5 py-1 text-xs transition " +
        (active
          ? "border-mango bg-mango/10 text-ink"
          : "border-line text-ink-mute hover:border-mango/40 hover:text-ink")
      }
    >
      {children}
    </Link>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 font-data text-[10px] font-medium uppercase tracking-[0.18em] text-ink-mute">
      {children}
    </th>
  );
}
