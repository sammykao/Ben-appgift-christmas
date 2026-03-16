type DateInput = Date | string;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function toISODateLocal(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function todayLocalDateString(): string {
  return toISODateLocal(new Date());
}

export function parseISODateLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateLocal(
  input: DateInput,
  options: Intl.DateTimeFormatOptions
): string {
  const date = typeof input === "string" ? parseISODateLocal(input) : input;
  return date.toLocaleDateString(undefined, options);
}

export function addDaysLocal(dateStr: string, days: number): string {
  const date = parseISODateLocal(dateStr);
  date.setDate(date.getDate() + days);
  return toISODateLocal(date);
}

export function getLocalYear(date: Date): number {
  return date.getFullYear();
}

export function getLocalMonth(date: Date): number {
  return date.getMonth() + 1;
}

export function getLocalDayOfMonth(date: Date): number {
  return date.getDate();
}
