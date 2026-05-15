import { cn } from "@/lib/utils";

type LogoProps = {
  size?: number;
  className?: string;
  title?: string;
};

export function Logo({ size = 26, className, title = "Mango" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label={title}
      className={cn("shrink-0", className)}
    >
      <title>{title}</title>
      <g transform="rotate(-15 20 20)">
        {/* Leaf */}
        <path
          d="M19.5 6.5 C 20.8 4.6, 23.6 4.0, 25.2 5.6 C 23.8 7.0, 22.0 7.6, 20.2 7.4 C 19.9 7.3, 19.6 7.0, 19.5 6.5 Z"
          fill="#5B7A3E"
        />
        {/* Stem */}
        <path
          d="M19.6 6.7 C 19.7 8.2, 19.9 9.5, 20.2 10.6"
          stroke="#4a6230"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
        {/* Mango body (teardrop) */}
        <path
          d="M20 10.5 C 27.5 10.5, 32 16.5, 32 23.5 C 32 30.5, 26.5 35, 20 35 C 13.5 35, 8 30.5, 8 23.5 C 8 16.5, 12.5 10.5, 20 10.5 Z"
          fill="#E67A2E"
        />
        {/* Highlight */}
        <ellipse cx="15.5" cy="17" rx="3.2" ry="1.8" fill="#F0A05E" opacity="0.7" />
      </g>
    </svg>
  );
}
