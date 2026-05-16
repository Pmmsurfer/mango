"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { MarginWindow } from "@/lib/margin";

const OPTIONS: { id: MarginWindow; label: string }[] = [
  { id: "30d", label: "30d" },
  { id: "90d", label: "90d" },
  { id: "all", label: "All time" },
];

export function MarginWindowToggle({
  active,
  paramName = "win",
}: {
  active: MarginWindow;
  paramName?: string;
}) {
  const router = useRouter();
  const search = useSearchParams();

  function setWindow(value: MarginWindow) {
    const params = new URLSearchParams(Array.from(search.entries()));
    if (value === "90d") params.delete(paramName);
    else params.set(paramName, value);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  }

  return (
    <div className="inline-flex rounded-full border border-line bg-cream/40 p-0.5 text-xs">
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          onClick={() => setWindow(o.id)}
          className={cn(
            "rounded-full px-3 py-1 transition",
            active === o.id ? "bg-surface text-ink shadow-sm" : "text-ink-mute hover:text-ink"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
