/** Formats a "YYYY-MM" string as "Mon YYYY" (e.g. "2021-03" -> "Mar 2021"). Falls back gracefully. */
export function formatMonthYear(value?: string | null): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, year, month] = match;
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/** Formats a start/end ("YYYY-MM") pair as "Mar 2021 - Present" or "Mar 2021 - Jun 2022". */
export function formatDateRange(startDate?: string | null, endDate?: string | null): string {
  const start = formatMonthYear(startDate);
  const end = endDate ? formatMonthYear(endDate) : "Present";
  if (!start) return end;
  return `${start} — ${end}`;
}

/** Extracts a sortable year (endDate takes priority; ongoing/ null endDate sorts as most recent). */
export function endYearForSort(startDate?: string | null, endDate?: string | null): number {
  if (!endDate) return startDate ? 9999 : 0;
  const match = /^(\d{4})/.exec(endDate);
  return match ? Number(match[1]) : 0;
}

/** Formats a full "YYYY-MM-DD" date as "Mon DD, YYYY" (e.g. certification issue dates). */
export function formatFullDate(value?: string | null): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
