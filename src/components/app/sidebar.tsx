"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Columns3, Radar, Users, Settings, Building2, LogOut, Package } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { signOut } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const items = [
  { href: "/app/pipeline", label: "Pipeline", icon: Columns3 },
  { href: "/app/radar", label: "Radar", icon: Radar },
  { href: "/app/accounts", label: "Accounts", icon: Building2 },
  { href: "/app/buyers", label: "Buyers", icon: Users },
  { href: "/app/products", label: "Products", icon: Package },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  brandName,
  userEmail,
}: {
  brandName: string;
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-line bg-surface">
      <div className="px-5 py-5">
        <Link href="/app/pipeline">
          <Wordmark />
        </Link>
      </div>
      <nav className="flex-1 px-3">
        <ul className="flex flex-col gap-0.5">
          {items.map((it) => {
            const active =
              pathname === it.href ||
              (it.href !== "/app/pipeline" && pathname.startsWith(it.href));
            const Icon = it.icon;
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition",
                    active
                      ? "bg-mango/10 text-ink"
                      : "text-ink-soft hover:bg-cream hover:text-ink"
                  )}
                >
                  <Icon className={cn("size-4", active ? "text-mango" : "text-ink-mute")} />
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-line px-4 py-4">
        <div className="mb-2 text-[13px] font-medium text-ink">{brandName}</div>
        {userEmail ? (
          <div className="mb-3 truncate font-data text-[10px] uppercase tracking-[0.12em] text-ink-mute">
            {userEmail}
          </div>
        ) : null}
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-ink-mute transition hover:bg-cream hover:text-ink"
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
