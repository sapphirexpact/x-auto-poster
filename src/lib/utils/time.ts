/** Format timestamps for America/Los_Angeles (PT) labels. */

const TZ = "America/Los_Angeles";

export function formatPT(
  iso: string | Date,
  opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  },
): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-US", { ...opts, timeZone: TZ }).format(d) + " PT";
}

export function formatPTDate(iso: string | Date): string {
  return formatPT(iso, { weekday: "short", month: "short", day: "numeric" });
}

export function formatPTTime(iso: string | Date): string {
  return formatPT(iso, { hour: "numeric", minute: "2-digit" });
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 3600_000).toISOString();
}

export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function fromDatetimeLocalValue(local: string): string {
  // Interpret as PT wall clock
  const fake = new Date(local + ":00");
  const asPT = new Date(
    fake.toLocaleString("en-US", { timeZone: TZ }),
  );
  const offset = fake.getTime() - asPT.getTime();
  return new Date(fake.getTime() + offset).toISOString();
}
