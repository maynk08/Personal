const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
const YEAR_MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

interface YearMonth {
  year: number;
  month: number;
}

// Calendar dates are `YYYY-MM` text and are read as text, never through `Date`, so time zones cannot shift them.
function parseYearMonth(value: string): YearMonth | null {
  const match = YEAR_MONTH_PATTERN.exec(value);
  return match === null ? null : { year: Number(match[1]), month: Number(match[2]) };
}

// "Mar 2024"
export function formatYearMonth(value: string): string {
  const parsed = parseYearMonth(value);
  return parsed === null ? value : `${MONTH_NAMES[parsed.month - 1] ?? ''} ${parsed.year}`;
}

// "Mar 2024 – Present"
export function formatYearMonthRange(start: string, end: string | null, openEndLabel = 'Present'): string {
  return `${formatYearMonth(start)} – ${end === null ? openEndLabel : formatYearMonth(end)}`;
}

export function currentYearMonth(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// "3 yrs 7 mos", counting both the first and the last month (Jan–Mar is 3 months), as profiles usually do.
export function formatDuration(start: string, end: string | null, today: string): string | null {
  const from = parseYearMonth(start);
  const to = parseYearMonth(end ?? today);
  if (from === null || to === null) {
    return null;
  }
  const months = (to.year - from.year) * 12 + (to.month - from.month) + 1;
  if (months < 1) {
    return null;
  }
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [years > 0 ? `${years} ${years === 1 ? 'yr' : 'yrs'}` : null, rest > 0 ? `${rest} ${rest === 1 ? 'mo' : 'mos'}` : null];
  return parts.filter((part) => part !== null).join(' ');
}
