export type Budget = {
  id: number;
  name: string;
  slug: string;
  /** What its amounts are in; optional, and budgets from before have none. */
  currency?: Currency;
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

/** The currencies on offer: the common ones, so a dropdown stays short. */
export const CURRENCIES = [
  'SEK',
  'EUR',
  'USD',
  'GBP',
  'JPY',
  'NOK',
  'DKK',
  'PLN',
  'CHF',
  'CNY',
] as const;

export type Currency = (typeof CURRENCIES)[number];

/** How many of `quote` one `base` buys, as published on `date`. */
export type Rate = {
  base: Currency;
  quote: Currency;
  rate: number;
  /** The publishing day; on weekends that is the last working day. */
  date: string;
  /** The local day it was fetched, which decides when to fetch again. */
  fetchedOn: string;
};

/** Hundredths stay hundredths whatever the currency, so this only scales. */
export const convertCents = (cents: number, rate: Rate) =>
  Math.round(cents * rate.rate);

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

/** AMOUNT_PATTERN with the spaces groupThousands puts in. */
export const GROUPED_AMOUNT_PATTERN = '-?[0-9 ]*([.,][0-9]{0,2})?';

/**
 * Groups the whole part by threes with spaces, as typed: "300 000,5".
 * Spaces, not commas, so a comma or a dot stays free to be the decimal
 * mark. The rest of what was typed is left alone, for the pattern to judge.
 */
export function groupThousands(typed: string) {
  const [, sign = '', whole = '', rest = ''] = /^(-?)([0-9 ]*)(.*)$/s.exec(
    typed,
  )!;
  const digits = whole.replaceAll(' ', '');
  return sign + digits.replace(/\B(?=(\d{3})+$)/g, ' ') + rest;
}

/**
 * Where the caret belongs in a regrouped amount: after the same number of
 * typed characters as before, since grouping only moves spaces around.
 */
export function caretAfterTyped(grouped: string, typedBeforeCaret: number) {
  let position = 0;
  for (let seen = 0; seen < typedBeforeCaret; position++) {
    if (grouped[position] !== ' ') seen++;
  }
  return position;
}

export const toCents = (amount: number) => Math.round(amount * 100);

export const fromCents = (cents: number) => cents / 100;

const ledger = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Always two decimals, so amounts line up in a column. */
export const formatAmount = (cents: number) => ledger.format(fromCents(cents));

/** With the currency's own sign and decimals: yen have none, so ¥1,585. */
export const formatMoney = (cents: number, currency: Currency) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(
    fromCents(cents),
  );

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

/**
 * Expenses from before postings existed have no history. Like an opening
 * balance in bookkeeping, each one is posted once on the day history
 * starts, so charts begin at the real total instead of at zero.
 */
export const openingBalance = (
  expenses: Expense[],
  day: string,
): Omit<Posting, 'id'>[] =>
  expenses
    .filter((expense) => expense.amountCents !== 0)
    .map(({ budgetId, category, amountCents }) => ({
      budgetId,
      day,
      category,
      deltaCents: amountCents,
    }));
