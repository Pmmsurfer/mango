import { formatDistanceToNow, format } from "date-fns";

export function relative(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function shortDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy");
}

export function compactDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d");
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdPrecise = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function dollars(cents: number | null | undefined, precise = false): string {
  if (cents == null) return "—";
  return (precise ? usdPrecise : usd).format(cents / 100);
}

export function percent(value: number | null | undefined, digits = 0): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function centsFromDollarString(raw: string | null | undefined): number | null {
  if (raw == null || raw === "") return null;
  const num = Number(String(raw).replace(/[,$\s]/g, ""));
  if (!Number.isFinite(num)) return null;
  return Math.round(num * 100);
}
