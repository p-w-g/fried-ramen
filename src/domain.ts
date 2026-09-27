export type Budget = {
  id: number;
  name: string;
  slug: string;
};

export type Category = {
  id: number;
  budgetId: number;
  name: string;
};

export type Expense = {
  id: number;
  budgetId: number;
  name: string;
  /** Integer cents, so totals never pick up floating point dust. */
  amountCents: number;
  description: string;
  category: string | null;
};

/**
 * One change to a budget's total, dated the day it was made. Never
 * edited afterwards: a mistake is owned by a correcting posting, as in
 * bookkeeping, so past days and months keep the totals they had.
 */
export type Posting = {
  id: number;
  budgetId: number;
  /** Local calendar day, e.g. 2026-09-27. */
  day: string;
  category: string | null;
  deltaCents: number;
};

/** What a person types: amount in whole currency units, e.g. 4.5. */
export type ExpenseDraft = {
  name: string;
  amount: number;
  description: string;
};

/** Two names that give the same slug would fight over one URL. */
export const toSlug = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, '_');

/** Up to two decimals, with a comma or a dot, as phones in any locale type it. */
export const AMOUNT_PATTERN = '-?[0-9]*([.,][0-9]{0,2})?';

/** A blank amount is a valid quick entry and counts as 0; junk gives null. */
export function parseAmount(typed: string): number | null {
  const trimmed = typed.trim();
  if (!new RegExp(`^${AMOUNT_PATTERN}$`).test(trimmed)) return null;
  if (trimmed === '') return 0;
  const amount = Number(trimmed.replace(',', '.'));
  return Number.isNaN(amount) ? null : amount;
}

export const toCents = (amount: number) => Math.round(amount * 100);

export const fromCents = (cents: number) => cents / 100;

const ledger = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Always two decimals, so amounts line up in a column. */
export const formatAmount = (cents: number) => ledger.format(fromCents(cents));

const compact = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumSignificantDigits: 3,
});

/** Exact while it fits a glance; 132K or 8.24M once it would not. */
export function formatCompactAmount(cents: number) {
  const amount = fromCents(cents);
  return Math.abs(amount) < 10_000
    ? formatAmount(cents)
    : compact.format(amount);
}

export const sumCents = (expenses: Expense[]) =>
  expenses.reduce((total, expense) => total + expense.amountCents, 0);

const twoDigits = (value: number) => String(value).padStart(2, '0');

/** The local calendar day, the one people remember a change by. */
export const toDay = (date: Date) =>
  `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
