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

/** Computes whole years of experience from the earliest experience entry's startDate to today. */
export function computeYearsOfExperience(experiences?: { startDate?: string | null }[] | null): number {
  if (!experiences || experiences.length === 0) return 0;
  const starts = experiences.map((e) => e.startDate).filter(Boolean) as string[];
  if (starts.length === 0) return 0;
  const earliest = [...starts].sort()[0];
  const match = /^(\d{4})-(\d{2})$/.exec(earliest);
  if (!match) return 0;
  const [, yearStr, monthStr] = match;
  const start = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  if (now.getMonth() < start.getMonth()) years -= 1;
  return Math.max(0, years);
}

export function formatFullDate(value?: string | null): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
