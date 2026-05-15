import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-surface/50 px-8 py-16 text-center",
        className
      )}
    >
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-ink-mute">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
