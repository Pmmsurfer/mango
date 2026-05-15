"use client";

import Link from "next/link";
import { AvatarCircle } from "@/components/ui/avatar-circle";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils";
import type { Account } from "@/lib/types";

type AccountCardProps = {
  account: Pick<
    Account,
    "id" | "name" | "doors_count" | "location_text" | "tags" | "banner"
  >;
  draggable?: boolean;
  className?: string;
};

export function AccountCard({ account, draggable, className }: AccountCardProps) {
  const tag = account.tags?.[0];
  const variant = mapTagVariant(tag);
  return (
    <Link
      href={`/app/accounts/${account.id}`}
      className={cn(
        "group block rounded-md border border-line bg-surface px-3 py-2.5 transition",
        draggable
          ? "cursor-grab hover:border-mango/40 active:cursor-grabbing"
          : "hover:border-mango/40",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium leading-tight text-ink group-hover:text-mango-deep">
          {account.name}
        </span>
        <AvatarCircle name={account.name} size={20} />
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="font-data text-[10px] text-ink-mute">
          {account.doors_count} {account.doors_count === 1 ? "door" : "doors"}
          {account.location_text ? ` · ${account.location_text}` : ""}
        </span>
      </div>
      {tag ? (
        <div className="mt-2">
          <Tag variant={variant}>{tag}</Tag>
        </div>
      ) : null}
    </Link>
  );
}

function mapTagVariant(tag?: string) {
  if (!tag) return "neutral" as const;
  const t = tag.toLowerCase();
  if (t.includes("hot") || t.includes("premium")) return "hot" as const;
  if (t.includes("warm")) return "warm" as const;
  if (t.includes("cold")) return "cold" as const;
  if (t.includes("green") || t.includes("distributor")) return "green" as const;
  if (t.includes("flag")) return "flag" as const;
  return "neutral" as const;
}
