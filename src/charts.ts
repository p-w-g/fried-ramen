import type { Expense } from './domain';

export type Slice = { label: string; cents: number; isOther?: true };

export const UNCATEGORISED = 'Uncategorised';

/** Past five, slices get too thin to compare; the rest fold into Other. */
const MAX_CATEGORIES = 5;

/**
 * Where the money went, biggest first. A donut cannot draw below zero, so
 * negative amounts (refunds, savings) are left out and flagged instead.
 */
export function categoryShares(expenses: Expense[]) {
  const totals = new Map<string, number>();
  for (const expense of expenses) {
    if (expense.amountCents <= 0) continue;
    const label = expense.category ?? UNCATEGORISED;
    totals.set(label, (totals.get(label) ?? 0) + expense.amountCents);
  }

  const biggestFirst: Slice[] = [...totals]
    .map(([label, cents]) => ({ label, cents }))
    .sort((a, b) => b.cents - a.cents || a.label.localeCompare(b.label));

  const rest = biggestFirst.slice(MAX_CATEGORIES);
  const slices: Slice[] =
    rest.length === 0
      ? biggestFirst
      : [
          ...biggestFirst.slice(0, MAX_CATEGORIES),
          { label: 'Other', cents: sumSlices(rest), isOther: true },
        ];

  return {
    slices,
    hasNegatives: expenses.some((expense) => expense.amountCents < 0),
  };
}

export const sumSlices = (slices: Slice[]) =>
  slices.reduce((sum, slice) => sum + slice.cents, 0);

/** Colours follow slice order, so the mini and full donut always agree. */
export const sliceColor = (slice: Slice, index: number) =>
  slice.isOther ? 'var(--series-other)' : `var(--series-${index + 1})`;

/**
 * Whole percentages that add up to exactly 100: rounding each on its own
 * can show 101%. The slices that lost most to rounding down get the rest.
 */
export function wholePercentages(slices: Slice[]) {
  const total = sumSlices(slices);
  const exact = slices.map((slice) => (slice.cents / total) * 100);
  const percentages = exact.map(Math.floor);
  const missing = 100 - percentages.reduce((sum, value) => sum + value, 0);
  const byLargestRemainder = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder);
  for (const { index } of byLargestRemainder.slice(0, missing)) {
    percentages[index]! += 1;
  }
  return percentages;
}
