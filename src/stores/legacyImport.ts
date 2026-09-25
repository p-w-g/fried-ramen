import { db } from '@/db';
import { toCents } from '@/domain';

/** Shape written by the Vue CLI build to localStorage. */
type LegacyExpense = {
  Expense?: string;
  Amount?: number | string;
  Description?: string;
  Label?: string;
};

function readJson<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null');
  } catch {
    return null;
  }
}

/**
 * Creates the first budget, filled from the legacy localStorage keys if any.
 * Runs inside one transaction so two tabs opening at once cannot both import.
 * The legacy keys are left in place as a fallback.
 */
export const ensureFirstBudget = () =>
  db.transaction('rw', db.budgets, db.categories, db.expenses, async () => {
    if ((await db.budgets.count()) > 0) return;

    const budgetId = await db.budgets.add({
      name: 'Current',
      slug: 'current',
    });
    const legacyExpenses = readJson<LegacyExpense[]>('allExpensesList') ?? [];
    const legacyCategories = readJson<string[]>('labels') ?? [];
    // Legacy category deletion could remove the wrong entry, orphaning
    // expenses that still point at it; recreate those so nothing hides.
    const usedCategories = legacyExpenses.map((legacy) => legacy.Label ?? '');

    await db.categories.bulkAdd(
      [...new Set([...legacyCategories, ...usedCategories])]
        .filter((name) => name !== '')
        .map((name) => ({ budgetId, name })),
    );
    await db.expenses.bulkAdd(
      legacyExpenses.map((legacy) => ({
        budgetId,
        name: legacy.Expense ?? '',
        amountCents: toCents(Number(legacy.Amount) || 0),
        description: legacy.Description ?? '',
        category: legacy.Label || null,
      })),
    );
  });
