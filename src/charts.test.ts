import { describe, expect, it } from 'vitest';
import { categoryShares, runningTotal, wholePercentages } from './charts';
import type { Expense, Posting } from './domain';

let nextId = 1;
const expense = (category: string | null, amountCents: number): Expense => ({
  id: nextId++,
  budgetId: 1,
  name: '',
  amountCents,
  description: '',
  category,
});

describe('categoryShares', () => {
  it('sums each category, biggest first, with no category as its own slice', () => {
    const { slices } = categoryShares([
      expense('food', 500),
      expense(null, 2500),
      expense('food', 700),
    ]);

    expect(slices).toEqual([
      { label: 'Uncategorised', cents: 2500 },
      { label: 'food', cents: 1200 },
    ]);
  });

  it('shows five categories as they are, and folds the rest into Other', () => {
    const five = ['a', 'b', 'c', 'd', 'e'].map((name, i) =>
      expense(name, 1000 - i * 100),
    );
    expect(categoryShares(five).slices.map((slice) => slice.label)).toEqual([
      'a',
      'b',
      'c',
      'd',
      'e',
    ]);

    const { slices } = categoryShares([
      ...five,
      expense('f', 60),
      expense('g', 50),
    ]);
    expect(slices.at(-1)).toEqual({
      label: 'Other',
      cents: 110,
      isOther: true,
    });
    expect(slices).toHaveLength(6);
  });

  it('leaves out negative amounts and says so', () => {
    const { slices, hasNegatives } = categoryShares([
      expense('food', 500),
      expense('food', -200),
      expense('refunds', -900),
    ]);

    expect(slices).toEqual([{ label: 'food', cents: 500 }]);
    expect(hasNegatives).toBe(true);
  });

  it('has nothing to show while every amount is zero, and no zero-width slices', () => {
    expect(categoryShares([expense('food', 0)])).toEqual({
      slices: [],
      hasNegatives: false,
    });
  });
});

describe('wholePercentages', () => {
  const slices = (...cents: number[]) =>
    cents.map((value) => ({ label: '', cents: value }));

  it('adds up to 100 where rounding each would give 101', () => {
    // 59.52, 28.57 and 11.90 would each round up, to 60 + 29 + 12.
    expect(wholePercentages(slices(2500, 1200, 500))).toEqual([59, 29, 12]);
  });

  it('adds up to 100 where rounding each would give 99', () => {
    expect(wholePercentages(slices(1, 1, 1))).toEqual([34, 33, 33]);
  });
});

describe('runningTotal', () => {
  const posting = (day: string, deltaCents: number): Posting => ({
    id: 0,
    budgetId: 1,
    day,
    category: null,
    deltaCents,
  });
  const today = new Date(2026, 8, 27, 12);

  it('climbs day by day, carrying the total over quiet days', () => {
    const points = runningTotal(
      [
        posting('2026-09-25', 500),
        posting('2026-09-27', 4500),
        posting('2026-09-25', 300),
      ],
      'day',
      today,
    );

    expect(points).toHaveLength(30);
    expect(points.slice(-3)).toEqual([
      { period: '2026-09-25', cents: 800 },
      { period: '2026-09-26', cents: 800 },
      { period: '2026-09-27', cents: 5300 },
    ]);
  });

  it('starts from everything posted before the window', () => {
    const points = runningTotal(
      [posting('2026-01-10', 1000), posting('2026-09-27', 200)],
      'day',
      today,
    );

    expect(points[0]).toEqual({ period: '2026-08-29', cents: 1000 });
    expect(points.at(-1)!.cents).toBe(1200);
  });

  it('dips on a correction, and sums a month into one point', () => {
    const points = runningTotal(
      [
        posting('2026-08-03', 5000),
        posting('2026-09-02', 2000),
        posting('2026-09-20', -800),
      ],
      'month',
      today,
    );

    expect(points).toHaveLength(12);
    expect(points[0]!.period).toBe('2025-10');
    expect(points.slice(-2)).toEqual([
      { period: '2026-08', cents: 5000 },
      { period: '2026-09', cents: 6200 },
    ]);
  });

  it('crosses a year boundary in months without skipping one', () => {
    const periods = runningTotal(
      [posting('2026-01-01', 1)],
      'month',
      new Date(2026, 1, 15),
    ).map((point) => point.period);

    expect(periods.slice(-3)).toEqual(['2025-12', '2026-01', '2026-02']);
  });

  it('has no line before anything was posted', () => {
    expect(runningTotal([], 'day', today)).toEqual([]);
  });
});
