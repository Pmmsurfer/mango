import { cn } from "@/lib/utils";

function hashCode(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
}

const palette = [
  "#E67A2E",
  "#5B7A3E",
  "#C45A14",
  "#8a5a1c",
  "#4a6230",
  "#9b6b3a",
];

export function AvatarCircle({
  name,
  size = 28,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const bg = palette[hashCode(name) % palette.length];
  return (
    <span
      style={{ width: size, height: size, background: bg, fontSize: size * 0.4 }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white",
        className
      )}
    >
      {initials || "?"}
    </span>
  );
}
