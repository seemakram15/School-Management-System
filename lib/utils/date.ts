export function getDaysBetween(start: Date | string, end: Date | string): number {
  const a = new Date(start);
  const b = new Date(end);
  return Math.round(Math.abs((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}

export function isWeekend(date: Date | string): boolean {
  const d = new Date(date);
  return d.getDay() === 0 || d.getDay() === 6;
}

export function addDays(date: Date | string, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function startOfMonth(date: Date | string): Date {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(date: Date | string): Date {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function isSameDay(a: Date | string, b: Date | string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate();
}

export function toInputDate(date: Date | string): string {
  return new Date(date).toISOString().split("T")[0];
}

export function getWorkingDays(start: Date | string, end: Date | string): number {
  let count = 0;
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    if (!isWeekend(cur)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}
