"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function DetailTabs({
  tabs,
}: {
  tabs: { id: string; label: string }[];
}) {
  const pathname = usePathname();
  const search = useSearchParams();
  const active = search.get("tab") ?? tabs[0]?.id;
  return (
    <div className="flex gap-1 border-b border-line">
      {tabs.map((t) => {
        const params = new URLSearchParams(Array.from(search.entries()));
        params.set("tab", t.id);
        return (
          <Link
            key={t.id}
            href={`${pathname}?${params.toString()}`}
            scroll={false}
            className={cn(
              "border-b-2 px-3 py-2 text-sm transition",
              active === t.id
                ? "border-mango text-ink"
                : "border-transparent text-ink-mute hover:text-ink"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
