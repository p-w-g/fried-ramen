import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { sumAmounts, type Expense, type ExpenseDraft } from '@/domain';
import {
  loadCategories,
  loadExpenses,
  saveCategories,
  saveExpenses,
} from './legacyStorage';

export const useBudgetStore = defineStore('budget', () => {
  const expenses = ref<Expense[]>(loadExpenses());
  const categories = ref<string[]>(loadCategories());

  watch(expenses, saveExpenses, { deep: true });
  watch(categories, saveCategories, { deep: true });

  const total = computed(() => sumAmounts(expenses.value));
  const unassigned = computed(() =>
    expenses.value.filter((expense) => expense.category === null),
  );
  const expensesIn = (category: string) =>
    expenses.value.filter((expense) => expense.category === category);

  const findExpense = (id: number) =>
    expenses.value.find((expense) => expense.id === id);

  function addExpense(draft: ExpenseDraft) {
    const id = Math.max(0, ...expenses.value.map((expense) => expense.id)) + 1;
    expenses.value.push({ ...draft, id, category: null });
  }

  function updateExpense(id: number, draft: ExpenseDraft) {
    const expense = findExpense(id);
    if (expense) Object.assign(expense, draft);
  }

  function assignCategory(id: number, category: string | null) {
    const expense = findExpense(id);
    if (expense) expense.category = category;
  }

  function completeExpense(id: number) {
    expenses.value = expenses.value.filter((expense) => expense.id !== id);
  }

  function addCategory(name: string) {
    const isNew = name !== '' && !categories.value.includes(name);
    if (isNew) categories.value.push(name);
  }

  function deleteCategoryIfEmpty(name: string) {
    if (expensesIn(name).length > 0) return;
    categories.value = categories.value.filter((category) => category !== name);
  }

  function clearEverything() {
    expenses.value = [];
    categories.value = [];
  }

  return {
    expenses,
    categories,
    total,
    unassigned,
    expensesIn,
    addExpense,
    updateExpense,
    assignCategory,
    completeExpense,
    addCategory,
    deleteCategoryIfEmpty,
    clearEverything,
  };
});
