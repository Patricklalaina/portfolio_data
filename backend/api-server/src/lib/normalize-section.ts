/**
 * Sections are stored as loosely-typed JSONB in the database. When the shape of a
 * section changes (as it has a few times), rows saved under the old shape would
 * otherwise crash the frontend (e.g. `socialLinks.map is not a function`) until an
 * admin re-saves that section. This module transparently upgrades legacy shapes to
 * the current one on every read, so old data keeps working without manual migration.
 */

const MONTH_NAMES = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];

function parseLegacyMonth(raw: string): string | null {
  const cleaned = raw.trim();

  const monthYear = /^([A-Za-z]+)\.?\s+(\d{4})$/.exec(cleaned);
  if (monthYear) {
    const idx = MONTH_NAMES.findIndex((m) => monthYear[1].toLowerCase().startsWith(m));
    if (idx >= 0) return `${monthYear[2]}-${String(idx + 1).padStart(2, "0")}`;
  }

  const yearOnly = /^(\d{4})$/.exec(cleaned);
  if (yearOnly) return `${yearOnly[1]}-01`;

  // Already in YYYY-MM form
  if (/^\d{4}-\d{2}$/.test(cleaned)) return cleaned;

  return null;
}

/** Converts a legacy free-text "dateRange" (e.g. "Sep 2018 — Jun 2022", "2021 - Present") into startDate/endDate. */
function migrateDateRange(dateRange: string): { startDate: string; endDate: string | null } {
  const parts = dateRange.split(/\s*[—–-]\s*/);
  const startRaw = (parts[0] ?? "").trim();
  const endRaw = (parts[1] ?? "").trim();

  const startDate = parseLegacyMonth(startRaw) ?? "";
  const endDate = endRaw && !/present/i.test(endRaw) ? parseLegacyMonth(endRaw) : null;

  return { startDate, endDate: endDate ?? null };
}

function migrateDateRangeEntries(entries: unknown): unknown {
  if (!Array.isArray(entries)) return entries;
  return entries.map((entry) => {
    if (!entry || typeof entry !== "object") return entry;
    const e = entry as Record<string, unknown>;
    if (typeof e.dateRange === "string" && typeof e.startDate !== "string") {
      const { startDate, endDate } = migrateDateRange(e.dateRange);
      const { dateRange, ...rest } = e;
      return { ...rest, startDate, endDate };
    }
    return e;
  });
}

/** Converts a bare year ("2023") or "YYYY-MM" into a full "YYYY-MM-DD" for <input type="date">. */
function normalizeCertDate(value: unknown): unknown {
  if (typeof value !== "string") return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{4}-\d{2}$/.test(value)) return `${value}-01`;
  if (/^\d{4}$/.test(value)) return `${value}-01-01`;
  return value;
}

function migrateProfile(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  const profile = data as Record<string, unknown>;

  if (profile.socialLinks && !Array.isArray(profile.socialLinks)) {
    const legacy = profile.socialLinks as Record<string, unknown>;
    const iconByPlatform: Record<string, string> = {
      github: "github",
      linkedin: "linkedin",
      twitter: "twitter",
    };
    const migrated = Object.entries(legacy)
      .filter(([, url]) => typeof url === "string" && url.trim() !== "")
      .map(([platform, url], idx) => ({
        id: idx + 1,
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        url,
        iconKey: iconByPlatform[platform.toLowerCase()] ?? "link",
      }));
    return { ...profile, socialLinks: migrated };
  }

  return profile;
}

function migrateCertifications(data: unknown): unknown {
  if (!Array.isArray(data)) return data;
  return data.map((entry) => {
    if (!entry || typeof entry !== "object") return entry;
    const e = entry as Record<string, unknown>;
    if (typeof e.date === "string") {
      return { ...e, date: normalizeCertDate(e.date) };
    }
    return e;
  });
}

export function normalizeSectionData(section: string, data: unknown): unknown {
  switch (section) {
    case "profile":
      return migrateProfile(data);
    case "experience":
    case "education":
      return migrateDateRangeEntries(data);
    case "certifications":
      return migrateCertifications(data);
    default:
      return data;
  }
}
