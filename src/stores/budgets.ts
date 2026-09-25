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
  const isLoaded = ref(false);
  let subscription: Subscription | undefined;

  function watchAll() {
    subscription ??= liveQuery(() => db.budgets.toArray()).subscribe(
      (stored) => {
        budgets.value = stored;
        isLoaded.value = true;
      },
    );
  }

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

  return { budgets, isLoaded, watchAll, create, rename, remove };
});
