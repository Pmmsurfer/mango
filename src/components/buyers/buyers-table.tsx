"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRightLeft } from "lucide-react";
import { AvatarCircle } from "@/components/ui/avatar-circle";
import { ChangeJobDialog } from "@/components/buyers/change-job-dialog";
import { relative } from "@/lib/format";

export type BuyerRow = {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  account_id: string;
  account_name: string;
  last_contacted_at: string | null;
};

export function BuyersTable({
  rows,
  accountOptions,
}: {
  rows: BuyerRow[];
  accountOptions: { id: string; name: string }[];
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q) return rows;
    const needle = q.toLowerCase();
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(needle) ||
        (r.title ?? "").toLowerCase().includes(needle) ||
        r.account_name.toLowerCase().includes(needle) ||
        (r.email ?? "").toLowerCase().includes(needle)
    );
  }, [rows, q]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-mute" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search buyers, titles, accounts…"
          className="w-full rounded-full border border-line bg-surface px-9 py-2 text-sm outline-none focus:border-mango"
        />
      </div>
      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-cream/40 text-left">
            <tr>
              <Th>Name</Th>
              <Th>Title</Th>
              <Th>Account</Th>
              <Th>Last contacted</Th>
              <Th>Email</Th>
              <Th>{" "}</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-b border-line/60 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <AvatarCircle name={b.name} size={26} />
                    <span className="font-medium text-ink">{b.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-soft">{b.title ?? "—"}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/app/accounts/${b.account_id}`}
                    className="text-ink hover:text-mango-deep hover:underline underline-offset-4"
                  >
                    {b.account_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {b.last_contacted_at ? relative(b.last_contacted_at) : "—"}
                </td>
                <td className="px-4 py-3 text-ink-soft">{b.email ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <ChangeJobDialog
                    buyer={{ id: b.id, name: b.name, account_id: b.account_id }}
                    accountOptions={accountOptions}
                    trigger={
                      <button
                        title="Buyer changed jobs"
                        className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-ink-soft transition hover:border-mango hover:text-ink"
                      >
                        <ArrowRightLeft className="size-3" /> Changed jobs
                      </button>
                    }
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-ink-mute">
                  No buyers match.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 font-data text-[10px] font-medium uppercase tracking-[0.18em] text-ink-mute">
      {children}
    </th>
  );
}
