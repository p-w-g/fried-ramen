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

export const sumCents = (expenses: Expense[]) =>
  expenses.reduce((total, expense) => total + expense.amountCents, 0);
