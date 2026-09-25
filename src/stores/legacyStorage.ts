import type { Expense } from '@/domain';

/** Shape written by the Vue CLI build; existing installs still hold it. */
type LegacyExpense = {
  Expense: string;
  Amount: number | string;
  Description?: string;
  Id: number;
  Label?: string;
  isPostponed: boolean;
};

const EXPENSES_KEY = 'allExpensesList';
const CATEGORIES_KEY = 'labels';

function readJson<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null');
  } catch {
    return null;
  }
}

const fromLegacy = (legacy: LegacyExpense): Expense => ({
  id: legacy.Id,
  name: legacy.Expense ?? '',
  amount: Number(legacy.Amount) || 0,
  description: legacy.Description ?? '',
  category: legacy.Label || null,
});

const toLegacy = (expense: Expense): LegacyExpense => ({
  Expense: expense.name,
  Amount: expense.amount,
  Description: expense.description,
  Id: expense.id,
  Label: expense.category ?? '',
  isPostponed: false,
});

export const loadExpenses = (): Expense[] =>
  (readJson<LegacyExpense[]>(EXPENSES_KEY) ?? []).map(fromLegacy);

export const loadCategories = (): string[] =>
  readJson<string[]>(CATEGORIES_KEY) ?? [];

export const saveExpenses = (expenses: Expense[]) =>
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses.map(toLegacy)));

export const saveCategories = (categories: string[]) =>
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
