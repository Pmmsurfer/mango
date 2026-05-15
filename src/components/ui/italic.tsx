import { cn } from "@/lib/utils";

export function Italic({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <em className={cn("accent-italic not-italic", className)}>{children}</em>;
}
