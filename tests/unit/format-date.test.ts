import { describe, expect, it } from 'vitest';

import { formatDuration, formatYearMonth, formatYearMonthRange } from '@/lib/utils/format-date';

describe('dates', () => {
  it('formats months and ranges from YYYY-MM text', () => {
    expect(formatYearMonth('2022-03')).toBe('Mar 2022');
    expect(formatYearMonthRange('2022-03', null)).toBe('Mar 2022 – Present');
    expect(formatYearMonthRange('2019-01', '2021-12')).toBe('Jan 2019 – Dec 2021');
  });

  it.each([
    ['2019-01', '2021-12', '3 yrs'],
    ['2024-01', '2024-03', '3 mos'],
    ['2024-05', '2024-05', '1 mo'],
    ['2022-03', null, '3 yrs 8 mos'],
    ['2023-10', '2024-10', '1 yr 1 mo'],
  ])('counts %s to %s as %s, including both months', (start, end, expected) => {
    expect(formatDuration(start, end, '2025-10')).toBe(expected);
  });

  it('gives no duration for a range that ends before it starts', () => {
    expect(formatDuration('2025-05', '2025-01', '2025-10')).toBeNull();
  });
});
