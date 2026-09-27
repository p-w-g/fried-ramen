import { describe, expect, it } from 'vitest';
import { categoryShares, wholePercentages } from './charts';
import type { Expense } from './domain';

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

  it('has nothing to show for no spending, and no zero-width slices', () => {
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
