import { defineStore } from 'pinia';
import { liveQuery, type Subscription } from 'dexie';
import { ref, shallowRef } from 'vue';
import { db } from '@/db';
import { toSlug, type Budget } from '@/domain';

/** A name the person has to change; the message says why. */
export class BudgetNameError extends Error {}

/** Must run inside a transaction on db.budgets so two saves cannot race. */
async function checkName(name: string, renamingId?: number) {
  const trimmed = name.trim();
  if (trimmed === '') throw new BudgetNameError('Give the budget a name.');

  const slug = toSlug(trimmed);
  const clash = await db.budgets.where({ slug }).first();
  if (clash && clash.id !== renamingId) {
    throw new BudgetNameError(
      `A budget called “${clash.name}” already exists.`,
    );
  }
  return { name: trimmed, slug };
}

export const useBudgetsStore = defineStore('budgets', () => {
  const budgets = shallowRef<Budget[]>([]);
  /** Cents per budget id; budgets without expenses are missing. */
  const totals = shallowRef(new Map<number, number>());
  const isLoaded = ref(false);
  let subscription: Subscription | undefined;

  function watchAll() {
    subscription ??= liveQuery(() =>
      Promise.all([db.budgets.toArray(), db.expenses.toArray()]),
    ).subscribe(([storedBudgets, storedExpenses]) => {
      const sums = new Map<number, number>();
      for (const { budgetId, amountCents } of storedExpenses) {
        sums.set(budgetId, (sums.get(budgetId) ?? 0) + amountCents);
      }
      budgets.value = storedBudgets;
      totals.value = sums;
      isLoaded.value = true;
    });
  }

  const totalOf = (id: number) => totals.value.get(id) ?? 0;

  const create = (name: string) =>
    db.transaction('rw', db.budgets, async (): Promise<Budget> => {
      const fields = await checkName(name);
      const id = await db.budgets.add(fields);
      return { id, ...fields };
    });

  const rename = (id: number, name: string) =>
    db.transaction('rw', db.budgets, async () => {
      await db.budgets.update(id, await checkName(name, id));
    });

  const remove = (id: number) =>
    db.transaction('rw', db.budgets, db.categories, db.expenses, async () => {
      await db.expenses.where({ budgetId: id }).delete();
      await db.categories.where({ budgetId: id }).delete();
      await db.budgets.delete(id);
    });

  return { budgets, isLoaded, watchAll, totalOf, create, rename, remove };
});
