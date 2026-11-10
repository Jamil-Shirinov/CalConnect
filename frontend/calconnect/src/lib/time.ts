// Every time in CalConnect is Berkeley time, whatever the device's time zone.
import type { Slot } from "./types";

export const TZ = "America/Los_Angeles";

const DAY_CODES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/** "2026-10-16" for a moment, in Berkeley. */
const ymdOf = (date: Date) => date.toLocaleDateString("en-CA", { timeZone: TZ });

/** Berkeley's UTC offset in hours on a given day, e.g. -7. */
function offsetHours(ymd: string) {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "shortOffset" })
    .formatToParts(new Date(`${ymd}T12:00:00Z`))
    .find((p) => p.type === "timeZoneName")?.value;
  return Number(name?.replace("GMT", "") || 0);
}

/** The moment `hours` (may be fractional) past midnight on `ymd`, in Berkeley. */
export function berkeleyTime(ymd: string, hours: number) {
  const offset = offsetHours(ymd);
  const midnightUtc = Date.parse(`${ymd}T00:00:00Z`);
  return new Date(midnightUtc + (hours - offset) * 3600e3);
}

export type Day = { ymd: string; code: string; label: string };

/** Today and the next `count - 1` days, in Berkeley. */
export function upcomingDays(count = 7): Day[] {
  const [y, m, d] = ymdOf(new Date()).split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const noon = new Date(Date.UTC(y, m - 1, d + i, 12));
    const label =
      i === 0 ? "Today"
      : i === 1 ? "Tomorrow"
      : noon.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short", day: "numeric" });
    return { ymd: noon.toISOString().slice(0, 10), code: DAY_CODES[noon.getUTCDay()], label };
  });
}

const toHours = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h + m / 60;
};

/** Whether a weekly availability list covers `day` from `from` to `to` hours. */
export const isFree = (availability: Slot[] = [], day: string, from: number, to: number) =>
  availability.some((s) => s.day === day && toHours(s.start) <= from && to <= toHours(s.end));

export const hourLabel = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
};

export const formatDay = (date: Date) =>
  date.toLocaleDateString("en-US", { timeZone: TZ, weekday: "short", month: "short", day: "numeric" });

export const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" });

export const formatRange = (start: Date, end: Date) =>
  `${formatDay(start)} · ${formatTime(start)}–${formatTime(end)}`;

export const monthDay = (date: Date) => ({
  month: date.toLocaleDateString("en-US", { timeZone: TZ, month: "short" }).toUpperCase(),
  day: date.toLocaleDateString("en-US", { timeZone: TZ, day: "numeric" })
});

export function timeAgo(date: Date | null) {
  if (!date) return "now";
  const minutes = Math.round((Date.now() - date.getTime()) / 60e3);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 24 * 60) return `${Math.round(minutes / 60)}h`;
  return formatDay(date);
}
