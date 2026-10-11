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

export const toCents = (amount: number) => Math.round(amount * 100);

export const fromCents = (cents: number) => cents / 100;

/** The number formats on offer, besides following the phone's own. */
export const NUMBER_LOCALES = [
  'en-US',
  'sv-SE',
  'de-DE',
  'en-IN',
  'ja-JP',
] as const;

/** A chosen number format; undefined follows the phone. */
export type NumberLocale = (typeof NUMBER_LOCALES)[number] | undefined;

/** Always two decimals, so amounts line up in a column. */
export const formatAmount = (cents: number, locale: NumberLocale) =>
  new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(fromCents(cents));

/** With the currency's own sign and decimals: yen have none, so ¥1,585. */
export const formatMoney = (
  cents: number,
  currency: Currency,
  locale: NumberLocale,
) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
    fromCents(cents),
  );

/**
 * The number alone, for when the currency is said next to it: in that
 * currency's decimals, and none when they are all zeros.
 */
export const formatBareMoney = (
  cents: number,
  currency: Currency,
  locale: NumberLocale,
) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    trailingZeroDisplay: 'stripIfInteger',
  })
    .formatToParts(fromCents(cents))
    .filter((part) => part.type !== 'currency' && part.type !== 'literal')
    .map((part) => part.value)
    .join('');

/** Exact while it fits a glance; 132K, 8.24M or 300万 once it would not. */
export function formatCompactAmount(cents: number, locale: NumberLocale) {
  const amount = fromCents(cents);
  return Math.abs(amount) < 10_000
    ? formatAmount(cents, locale)
    : new Intl.NumberFormat(locale, {
        notation: 'compact',
        maximumSignificantDigits: 3,
      }).format(amount);
}

/** Its short words keyed the way readLocaleAmount compares them. */
const wordKey = (word: string) => word.toLowerCase().replace(/\.$/, '');

/**
 * How a number format writes numbers, learned from Intl rather than kept
 * as tables: its separators, and its short words with what each is worth
 * (万 is 10 000, L is 100 000, M is 1 000 000).
 */
function numberStyle(locale: NumberLocale) {
  const parts = new Intl.NumberFormat(locale).formatToParts(1234567.8);
  const group = parts.find((part) => part.type === 'group')?.value ?? '';
  const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';

  const words = new Map<string, number>();
  const short = new Intl.NumberFormat(locale, { notation: 'compact' });
  for (let exponent = 3; exponent <= 15; exponent++) {
    const shortParts = short.formatToParts(10 ** exponent);
    const word = shortParts.find((part) => part.type === 'compact')?.value;
    const lead = Number(
      shortParts.find((part) => part.type === 'integer')?.value,
    );
    if (word && !words.has(wordKey(word))) {
      words.set(wordKey(word), 10 ** exponent / lead);
    }
  }
  return { group, decimal, words };
}

/**
 * Reads an amount the way a number format writes it, short words too:
 * 300万, 30L, 1.5M, 4 755 330,5. Null when it does not read as one.
 */
export function readLocaleAmount(typed: string, locale: NumberLocale) {
  const { group, decimal, words } = numberStyle(locale);
  const text = typed.replace(/\s/g, '');
  const [, number = '', word = ''] = /^(.*?)(\p{L}[\p{L}.]*)?$/u.exec(text)!;
  const worth = word ? words.get(wordKey(word)) : 1;
  if (worth === undefined) return null;

  // Spaces, Swedish grouping among them, are already gone with the rest.
  const isGroupedBySpace = /\s/.test(group);
  const ungrouped = isGroupedBySpace ? number : number.replaceAll(group, '');
  const plain = ungrouped.replace(decimal, '.');
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(plain)) return null;
  return Number(plain) * worth;
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
