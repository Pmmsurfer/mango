import { cn } from "@/lib/utils";

type TagVariant = "hot" | "warm" | "cold" | "green" | "flag" | "neutral";

const variantClasses: Record<TagVariant, string> = {
  hot: "bg-mango/10 text-mango-deep border-mango/30",
  warm: "bg-[#F7E8D2] text-[#8a5a1c] border-[#E8C99A]",
  cold: "bg-[#EDE7DA] text-ink-soft border-line",
  green: "bg-leaf/10 text-leaf border-leaf/30",
  flag: "bg-[#FBE5E5] text-[#9b3838] border-[#E8C2C2]",
  neutral: "bg-[#F4ECD9] text-ink-soft border-line",
};

export function Tag({
  variant = "neutral",
  children,
  className,
}: {
  variant?: TagVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
