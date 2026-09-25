import { defineStore } from 'pinia';
import { liveQuery, type Subscription } from 'dexie';
import { computed, ref, shallowRef } from 'vue';
import { db } from '@/db';
import {
  sumCents,
  toCents,
  type Budget,
  type Expense,
  type ExpenseDraft,
} from '@/domain';
import { ensureFirstBudget } from './legacyImport';

export const useBudgetStore = defineStore('budget', () => {
  const budget = shallowRef<Budget | null>(null);
  const expenses = shallowRef<Expense[]>([]);
  const categories = shallowRef<string[]>([]);
  const status = ref<'loading' | 'open' | 'missing'>('loading');
  let requestedSlug = '';
  let subscription: Subscription | undefined;

  const totalCents = computed(() => sumCents(expenses.value));
  const unassigned = computed(() =>
    expenses.value.filter((expense) => expense.category === null),
  );
  const expensesIn = (category: string) =>
    expenses.value.filter((expense) => expense.category === category);

  function openedBudgetId() {
    if (!budget.value) throw new Error('No budget is open yet');
    return budget.value.id;
  }

  /** The budget to show when the URL does not name one. */
  async function defaultSlug() {
    await ensureFirstBudget();
    const last = await db.meta.get('lastBudgetId');
    const lastOpened = last && (await db.budgets.get(last.value));
    const fallback = lastOpened || (await db.budgets.orderBy('id').first());
    if (!fallback) throw new Error('ensureFirstBudget left no budget behind');
    return fallback.slug;
  }

  async function open(slug: string) {
    requestedSlug = slug;
    await ensureFirstBudget();
    const found = await db.budgets.where({ slug }).first();
    if (slug !== requestedSlug) return; // a newer open() took over

    subscription?.unsubscribe();
    if (!found) {
      showMissing();
      return;
    }
    watchBudget(found.id);
    await db.meta.put({ key: 'lastBudgetId', value: found.id });
  }

  /** Re-resolves the current URL, e.g. after a backup replaced every budget. */
  const reopen = () => open(requestedSlug);

  function showMissing() {
    budget.value = null;
    expenses.value = [];
    categories.value = [];
    status.value = 'missing';
  }

  function watchBudget(budgetId: number) {
    subscription = liveQuery(() =>
      Promise.all([
        db.budgets.get(budgetId),
        db.expenses.where({ budgetId }).toArray(),
        db.categories.where({ budgetId }).toArray(),
      ]),
    ).subscribe(([storedBudget, storedExpenses, storedCategories]) => {
      if (!storedBudget) {
        showMissing();
        return;
      }
      budget.value = storedBudget;
      expenses.value = storedExpenses;
      categories.value = storedCategories.map((category) => category.name);
      status.value = 'open';
    });
  }

  async function addExpense(draft: ExpenseDraft) {
    await db.expenses.add({
      budgetId: openedBudgetId(),
      name: draft.name,
      amountCents: toCents(draft.amount),
      description: draft.description,
      category: null,
    });
  }

  async function updateExpense(id: number, draft: ExpenseDraft) {
    await db.expenses.update(id, {
      name: draft.name,
      amountCents: toCents(draft.amount),
      description: draft.description,
    });
  }

  async function assignCategory(id: number, category: string | null) {
    await db.expenses.update(id, { category });
  }

  async function completeExpense(id: number) {
    await db.expenses.delete(id);
  }

  async function addCategory(name: string) {
    const isNew = name !== '' && !categories.value.includes(name);
    if (isNew) await db.categories.add({ budgetId: openedBudgetId(), name });
  }

  async function deleteCategoryIfEmpty(name: string) {
    const budgetId = openedBudgetId();
    await db.transaction('rw', db.categories, db.expenses, async () => {
      const inUse = await db.expenses
        .where({ budgetId })
        .filter((expense) => expense.category === name)
        .count();
      if (inUse === 0) await db.categories.where({ budgetId, name }).delete();
    });
  }

  async function clearBudget() {
    const budgetId = openedBudgetId();
    await db.transaction('rw', db.categories, db.expenses, async () => {
      await db.expenses.where({ budgetId }).delete();
      await db.categories.where({ budgetId }).delete();
    });
  }

  return {
    budget,
    expenses,
    categories,
    status,
    totalCents,
    unassigned,
    expensesIn,
    defaultSlug,
    open,
    reopen,
    addExpense,
    updateExpense,
    assignCategory,
    completeExpense,
    addCategory,
    deleteCategoryIfEmpty,
    clearBudget,
  };
});
