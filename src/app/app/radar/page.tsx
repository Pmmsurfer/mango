import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Tag } from "@/components/ui/tag";
import { AvatarCircle } from "@/components/ui/avatar-circle";
import { EmptyState } from "@/components/ui/empty-state";
import { buildRadar, STATUS_LABEL, STATUS_VARIANT } from "@/lib/radar";
import { Italic } from "@/components/ui/italic";
import { relative } from "@/lib/format";
import { LogReorderDialog, RadarRowMenu } from "@/components/radar/radar-actions";
import type { Account, Reorder } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RadarPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: accountsData }, { data: reordersData }, { data: snoozed }] = await Promise.all([
    supabase
      .from("accounts")
      .select("*")
      .in("stage", ["on_shelf", "reordering"]),
    supabase
      .from("reorders")
      .select("*")
      .order("occurred_at", { ascending: true }),
    supabase
      .from("reminders")
      .select("account_id, due_date")
      .eq("completed", false)
      .gte("due_date", today),
  ]);

  const snoozedIds = new Set(
    (snoozed ?? []).map((r) => (r as { account_id: string }).account_id)
  );

  const accounts = ((accountsData ?? []) as Account[]).filter(
    (a) => !snoozedIds.has(a.id)
  );

  const reordersByAccount = new Map<string, Reorder[]>();
  for (const r of (reordersData ?? []) as Reorder[]) {
    const arr = reordersByAccount.get(r.account_id) ?? [];
    arr.push(r);
    reordersByAccount.set(r.account_id, arr);
  }

  const rows = buildRadar(accounts, reordersByAccount);

  const counts = {
    at_risk: rows.filter((r) => r.status === "at_risk" || r.status === "lost").length,
    slipping: rows.filter((r) => r.status === "slipping").length,
    on_track: rows.filter((r) => r.status === "on_track").length,
  };

  return (
    <>
      <div className="border-b border-line bg-surface px-6 py-5">
        <h1 className="font-display text-3xl text-ink">
          Reorder <Italic>radar</Italic>.
        </h1>
        <p className="mt-1 max-w-xl text-sm text-ink-soft">
          We learn each account&apos;s cadence, then flag the ones slipping past
          it. Catch the silent fade before it costs you the door.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4 font-data text-[11px] uppercase tracking-[0.18em]">
          <span className="text-ink-mute">
            <span className="text-[#9b3838]">{counts.at_risk}</span> at risk
          </span>
          <span className="text-ink-mute">
            <span className="text-[#8a5a1c]">{counts.slipping}</span> slipping
          </span>
          <span className="text-ink-mute">
            <span className="text-leaf">{counts.on_track}</span> on track
          </span>
        </div>
      </div>

      <div className="flex-1 px-6 py-6">
        {rows.length === 0 ? (
          <EmptyState
            title="Nothing on radar yet"
            description="When you have accounts shelved or reordering, this is where we'll flag the ones slipping past their typical cadence."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-cream/40 text-left">
                <tr>
                  <Th>Account</Th>
                  <Th>Days since</Th>
                  <Th>Cadence</Th>
                  <Th>Status</Th>
                  <Th>Last reorder</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.account.id}
                    className="border-b border-line/60 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/app/accounts/${r.account.id}`}
                        className="flex items-center gap-2.5"
                      >
                        <AvatarCircle name={r.account.name} size={28} />
                        <div>
                          <div className="font-medium text-ink">
                            {r.account.name}
                          </div>
                          <div className="font-data text-[10px] uppercase tracking-[0.12em] text-ink-mute">
                            {r.account.location_text ?? "—"} · {r.account.doors_count}{" "}
                            {r.account.doors_count === 1 ? "door" : "doors"}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-data text-ink-soft">
                      {r.daysSinceReorder !== null ? `${r.daysSinceReorder}d` : "—"}
                    </td>
                    <td className="px-4 py-3 font-data text-ink-soft">
                      {r.cadenceDays ? `${r.cadenceDays}d avg` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Tag variant={STATUS_VARIANT[r.status]}>
                        {STATUS_LABEL[r.status]}
                      </Tag>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {r.lastReorderAt ? relative(r.lastReorderAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <LogReorderDialog accountId={r.account.id} />
                        <RadarRowMenu accountId={r.account.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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
