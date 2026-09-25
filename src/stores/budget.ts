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
  const ready = ref(false);
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

  async function open() {
    await ensureFirstBudget();
    const first = await db.budgets.orderBy('id').first();
    if (!first) throw new Error('ensureFirstBudget left no budget behind');
    watchBudget(first);
  }

  function watchBudget(opened: Budget) {
    subscription?.unsubscribe();
    budget.value = opened;
    subscription = liveQuery(() =>
      Promise.all([
        db.expenses.where({ budgetId: opened.id }).toArray(),
        db.categories.where({ budgetId: opened.id }).toArray(),
      ]),
    ).subscribe(([storedExpenses, storedCategories]) => {
      expenses.value = storedExpenses;
      categories.value = storedCategories.map((category) => category.name);
      ready.value = true;
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
    ready,
    totalCents,
    unassigned,
    expensesIn,
    open,
    addExpense,
    updateExpense,
    assignCategory,
    completeExpense,
    addCategory,
    deleteCategoryIfEmpty,
    clearBudget,
  };
});
