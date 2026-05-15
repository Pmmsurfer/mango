"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { NewAccountDialog } from "@/components/account/new-account-dialog";

export function PipelineTopBar({
  totalCount,
  regions,
}: {
  totalCount: number;
  regions: string[];
}) {
  const router = useRouter();
  const search = useSearchParams();
  const [q, setQ] = useState(search.get("q") ?? "");
  const region = search.get("region") ?? "all";

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(Array.from(search.entries()));
      if (q) params.set("q", q);
      else params.delete("q");
      router.replace(`/app/pipeline?${params.toString()}`, { scroll: false });
    }, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function setRegion(value: string) {
    const params = new URLSearchParams(Array.from(search.entries()));
    if (value === "all") params.delete("region");
    else params.set("region", value);
    router.replace(`/app/pipeline?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-line bg-surface px-6 py-4">
      <div>
        <h1 className="font-display text-2xl text-ink">Pipeline</h1>
        <p className="font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
          {totalCount} account{totalCount === 1 ? "" : "s"}
        </p>
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-mute" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search accounts…"
            className="w-56 rounded-full border border-line bg-cream/60 px-9 py-2 text-sm outline-none transition focus:border-mango focus:bg-surface"
          />
        </div>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-full border border-line bg-cream/60 px-3 py-2 text-sm outline-none focus:border-mango focus:bg-surface"
        >
          <option value="all">All regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <NewAccountDialog
          trigger={
            <button className="inline-flex items-center gap-1.5 rounded-full bg-mango px-4 py-2 text-sm font-medium text-white transition hover:bg-mango-deep">
              <Plus className="size-3.5" /> New account
            </button>
          }
        />
      </div>
    </div>
  );
}
