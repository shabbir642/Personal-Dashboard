import { TaskPriority, TaskStatus } from "./types";
import type { TagTone } from "../components/sb/primitives";

export function fmtDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toLowerCase();
}

export function fmtTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase()
    .replace(" ", "");
}

export function fmtRelative(iso: string | Date, now: Date = new Date()): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 14) return "last week";
  return `${Math.floor(diffDays / 7)}w ago`;
}

export function dayLabel(date: Date, today: Date = new Date()): string {
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((t.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "today";
  if (diff === 1) return "yesterday";
  const wk = d
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const md = d
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toLowerCase();
  return `${wk} · ${md}`;
}

export function fmtDuration(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// Map task priority to the design's category tag tone.
export function priorityTone(priority: TaskPriority): TagTone {
  if (priority === "high") return "work";
  if (priority === "medium") return "learn";
  return "health";
}

export const PRIORITY_OPTIONS: TaskPriority[] = ["low", "medium", "high"];
export const STATUS_OPTIONS: TaskStatus[] = ["todo", "in-progress", "done"];

export function weekDelta(now: number, prev: number): string {
  if (prev === 0 && now === 0) return "no change";
  if (prev === 0) return `+${now} vs last`;
  const pct = Math.round(((now - prev) / prev) * 100);
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}% vs last`;
}
