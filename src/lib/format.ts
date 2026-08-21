export function formatBytes(bytes: number | string | null | undefined): string {
  const n = Number(bytes ?? 0);
  if (!n) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  const value = n / 1024 ** i;
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}

export function relativeTime(input: string | null | undefined): string {
  if (!input) return "—";
  const then = new Date(input).getTime();
  const diff = Date.now() - then;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return new Date(input).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDate(input: string | null | undefined): string {
  if (!input) return "—";
  return new Date(input).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export type TimeGroup =
  | "Today"
  | "Yesterday"
  | "Previous 7 days"
  | "Previous 30 days"
  | "Older";

export function timeGroup(input: string): TimeGroup {
  const date = new Date(input);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const day = 86_400_000;
  const t = date.getTime();
  if (t >= startOfToday) return "Today";
  if (t >= startOfToday - day) return "Yesterday";
  if (t >= startOfToday - 7 * day) return "Previous 7 days";
  if (t >= startOfToday - 30 * day) return "Previous 30 days";
  return "Older";
}

export const TIME_GROUP_ORDER: TimeGroup[] = [
  "Today",
  "Yesterday",
  "Previous 7 days",
  "Previous 30 days",
  "Older",
];

export function groupByTime<T>(items: T[], getDate: (item: T) => string) {
  const groups = new Map<TimeGroup, T[]>();
  for (const item of items) {
    const key = timeGroup(getDate(item));
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  return TIME_GROUP_ORDER.filter((key) => groups.has(key)).map((key) => ({
    label: key,
    items: groups.get(key) as T[],
  }));
}

export function initials(name: string | null | undefined, email?: string | null): string {
  const source = (name ?? email ?? "?").trim();
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?").concat(parts[1]?.[0] ?? "").toUpperCase();
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;
  return "Something went wrong. Please try again.";
}
