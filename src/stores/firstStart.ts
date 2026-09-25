import { db } from '@/db';
import { toCents } from '@/domain';

/** Shape written by the Vue CLI build to localStorage. */
type LegacyExpense = {
  Expense?: string;
  Amount?: number | string;
  Description?: string;
  Label?: string;
};

const LEGACY_KEYS = { expenses: 'allExpensesList', categories: 'labels' };

function readJson<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null');
  } catch {
    return null;
  }
}

/**
 * On the very first start, creates the "Current" budget filled from the
 * legacy localStorage keys, if any. Never again afterwards: someone who
 * deletes every budget wants a clean slate, not their old data back.
 * Runs inside one transaction so two tabs opening at once cannot both import.
 * The legacy keys are removed only once that transaction has committed.
 */
export async function runFirstStart() {
  await db.transaction(
    'rw',
    [db.budgets, db.categories, db.expenses, db.meta],
    async () => {
      if (await db.meta.get('firstStartDone')) return;
      await db.meta.put({ key: 'firstStartDone', value: Date.now() });
      // Installs from before this flag already have their budgets.
      if ((await db.budgets.count()) > 0) return;

      const budgetId = await db.budgets.add({
        name: 'Current',
        slug: 'current',
      });
      const legacyExpenses =
        readJson<LegacyExpense[]>(LEGACY_KEYS.expenses) ?? [];
      const legacyCategories = readJson<string[]>(LEGACY_KEYS.categories) ?? [];
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
    },
  );
  localStorage.removeItem(LEGACY_KEYS.expenses);
  localStorage.removeItem(LEGACY_KEYS.categories);
}
