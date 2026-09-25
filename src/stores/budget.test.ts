import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { useBudgetStore } from './budget';

const draft = (name: string, amount: number) => ({
  name,
  amount,
  description: '',
});

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
});

describe('expenses', () => {
  it('gives a new expense an id no current expense has', () => {
    const budget = useBudgetStore();
    budget.addExpense(draft('a', 1));
    budget.addExpense(draft('b', 2));
    budget.completeExpense(2);
    budget.addExpense(draft('c', 3));

    expect(budget.expenses.map((e) => e.id)).toEqual([1, 2]);
  });

  it('ignores ids that do not exist instead of touching another expense', () => {
    const budget = useBudgetStore();
    budget.addExpense(draft('a', 1));
    budget.completeExpense(99);
    budget.updateExpense(99, draft('x', 0));
    budget.assignCategory(99, 'food');

    expect(budget.expenses).toEqual([
      { id: 1, name: 'a', amount: 1, description: '', category: null },
    ]);
  });

  it('keeps categorised and unassigned totals apart', () => {
    const budget = useBudgetStore();
    budget.addCategory('food');
    budget.addExpense(draft('coffee', 5));
    budget.addExpense(draft('shoes', 25));
    budget.assignCategory(1, 'food');

    expect(budget.total).toBe(30);
    expect(budget.unassigned.map((e) => e.name)).toEqual(['shoes']);
    expect(budget.expensesIn('food').map((e) => e.name)).toEqual(['coffee']);
  });
});

describe('categories', () => {
  it('rejects blank and duplicate names', () => {
    const budget = useBudgetStore();
    budget.addCategory('food');
    budget.addCategory('food');
    budget.addCategory('');

    expect(budget.categories).toEqual(['food']);
  });

  it('only deletes a category nobody uses', () => {
    const budget = useBudgetStore();
    budget.addCategory('food');
    budget.addExpense(draft('coffee', 5));
    budget.assignCategory(1, 'food');

    budget.deleteCategoryIfEmpty('food');
    expect(budget.categories).toEqual(['food']);

    budget.completeExpense(1);
    budget.deleteCategoryIfEmpty('food');
    expect(budget.categories).toEqual([]);
  });
});

describe('persistence in the legacy localStorage format', () => {
  it('reads data written by the Vue CLI build', () => {
    localStorage.setItem(
      'allExpensesList',
      JSON.stringify([
        {
          Expense: 'Coffee',
          Amount: 5,
          Description: 'flat',
          Id: 3,
          Label: 'food',
          isPostponed: false,
        },
        { Expense: '', Amount: '', Id: 4, isPostponed: false },
      ]),
    );
    localStorage.setItem('labels', JSON.stringify(['food']));

    const budget = useBudgetStore();

    expect(budget.expenses).toEqual([
      {
        id: 3,
        name: 'Coffee',
        amount: 5,
        description: 'flat',
        category: 'food',
      },
      { id: 4, name: '', amount: 0, description: '', category: null },
    ]);
    expect(budget.categories).toEqual(['food']);
  });

  it('writes back in the format the Vue CLI build reads', async () => {
    const budget = useBudgetStore();
    budget.addCategory('food');
    budget.addExpense(draft('Coffee', 5));
    budget.assignCategory(1, 'food');
    await nextTick();

    expect(JSON.parse(localStorage.getItem('allExpensesList')!)).toEqual([
      {
        Expense: 'Coffee',
        Amount: 5,
        Description: '',
        Id: 1,
        Label: 'food',
        isPostponed: false,
      },
    ]);
    expect(JSON.parse(localStorage.getItem('labels')!)).toEqual(['food']);
  });

  it('starts empty instead of crashing on corrupt or null storage', () => {
    localStorage.setItem('allExpensesList', '{not json');
    localStorage.setItem('labels', 'null');

    const budget = useBudgetStore();

    expect(budget.expenses).toEqual([]);
    expect(budget.categories).toEqual([]);
  });
});
