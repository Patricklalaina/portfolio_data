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

interface ExperienceStat {
  value: string;
  label: string;
}

/**
 * Computes total experience from the earliest experience entry's startDate to today,
 * and picks whichever unit (days, months, years) makes it readable:
 * under a month shows days, under a year shows months, otherwise years.
 * Never rounds down to "0" unless the elapsed time is genuinely zero.
 */
export function computeExperienceStat(experiences?: { startDate?: string | null }[] | null): ExperienceStat {
  const starts = (experiences ?? []).map((e) => e.startDate).filter(Boolean) as string[];
  const earliest = starts.length > 0 ? [...starts].sort()[0] : null;
  const match = earliest ? /^(\d{4})-(\d{2})$/.exec(earliest) : null;

  if (!match) return { value: "0", label: "Days Experience" };

  const [, yearStr, monthStr] = match;
  const start = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  const now = new Date();

  const totalDays = Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  const pluralize = (count: number, unit: string) => `${unit}${count === 1 ? "" : "s"}`;

  if (totalDays < 30) {
    return { value: `${totalDays}`, label: `${pluralize(totalDays, "Day")} Experience` };
  }

  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months -= 1;
  months = Math.max(0, months);

  if (months < 12) {
    return { value: `${months}`, label: `${pluralize(months, "Month")} Experience` };
  }

  let years = now.getFullYear() - start.getFullYear();
  if (now.getMonth() < start.getMonth() || (now.getMonth() === start.getMonth() && now.getDate() < start.getDate())) {
    years -= 1;
  }
  years = Math.max(0, years);

  return { value: `${years}+`, label: `${pluralize(years, "Year")} Experience` };
}

export function formatFullDate(value?: string | null): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
