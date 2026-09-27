import { defineStore } from 'pinia';
import { liveQuery, type Subscription } from 'dexie';
import { computed, ref, shallowRef } from 'vue';
import { db } from '@/db';
import { forgetBudget, post, today } from '@/postings';
import {
  sumCents,
  toCents,
  type Budget,
  type Expense,
  type ExpenseDraft,
} from '@/domain';

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

  /** The budget to show when the URL names none; null when none exist. */
  async function defaultSlug() {
    const last = await db.meta.get('lastBudgetId');
    const lastOpened = last && (await db.budgets.get(last.value));
    const fallback = lastOpened || (await db.budgets.orderBy('id').first());
    return fallback?.slug ?? null;
  }

  async function open(slug: string) {
    requestedSlug = slug;
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
    const day = today();
    const budgetId = openedBudgetId();
    const amountCents = toCents(draft.amount);
    await db.transaction('rw', db.expenses, db.postings, async () => {
      await db.expenses.add({
        budgetId,
        name: draft.name,
        amountCents,
        description: draft.description,
        category: null,
      });
      await post(day, budgetId, null, amountCents);
    });
  }

  /** A changed amount is posted today as the difference, never backdated. */
  async function updateExpense(id: number, draft: ExpenseDraft) {
    const day = today();
    const amountCents = toCents(draft.amount);
    await db.transaction('rw', db.expenses, db.postings, async () => {
      const before = await db.expenses.get(id);
      if (!before) return;
      await db.expenses.update(id, {
        name: draft.name,
        amountCents,
        description: draft.description,
      });
      await post(
        day,
        before.budgetId,
        before.category,
        amountCents - before.amountCents,
      );
    });
  }

  async function assignCategory(id: number, category: string | null) {
    const day = today();
    await db.transaction('rw', db.expenses, db.postings, async () => {
      const before = await db.expenses.get(id);
      if (!before || before.category === category) return;
      await db.expenses.update(id, { category });
      await post(day, before.budgetId, before.category, -before.amountCents);
      await post(day, before.budgetId, category, before.amountCents);
    });
  }

  /** The money was still spent, so its postings stay. */
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
    await db.transaction(
      'rw',
      db.categories,
      db.expenses,
      db.postings,
      async () => {
        await db.expenses.where({ budgetId }).delete();
        await db.categories.where({ budgetId }).delete();
        await forgetBudget(budgetId);
      },
    );
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
