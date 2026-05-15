import {
  Mail,
  Phone,
  Users,
  Package,
  RefreshCw,
  Megaphone,
  FileText,
  ArrowRightLeft,
} from "lucide-react";
import { INTERACTION_LABELS, type InteractionType } from "@/lib/types";
import { relative, shortDate } from "@/lib/format";

const ICONS: Record<InteractionType, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  call: Phone,
  meeting: Users,
  sample: Package,
  reorder: RefreshCw,
  pitch: Megaphone,
  note: FileText,
  job_change: ArrowRightLeft,
};

export function InteractionRow({
  type,
  occurred_at,
  summary,
  buyerName,
}: {
  type: InteractionType;
  occurred_at: string;
  summary: string | null;
  buyerName?: string | null;
}) {
  const Icon = ICONS[type] ?? FileText;
  return (
    <div className="flex items-start gap-3 border-b border-line/60 px-4 py-3 last:border-0">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cream text-ink-soft">
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm font-medium text-ink">
            {INTERACTION_LABELS[type]}
          </span>
          {buyerName ? (
            <span className="text-xs text-ink-mute">· {buyerName}</span>
          ) : null}
          <span
            title={shortDate(occurred_at)}
            className="ml-auto font-data text-[10px] uppercase tracking-[0.12em] text-ink-mute"
          >
            {relative(occurred_at)}
          </span>
        </div>
        {summary ? (
          <p className="mt-0.5 text-[13px] text-ink-soft">{summary}</p>
        ) : null}
      </div>
    </div>
  );
}
