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
