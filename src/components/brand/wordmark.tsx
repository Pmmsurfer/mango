import { cn } from "@/lib/utils";
import { Logo } from "./logo";

export function Wordmark({
  className,
  size = 26,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Logo size={size} />
      <span className="font-display text-[1.35rem] leading-none text-ink">
        Mango
      </span>
    </div>
  );
}
