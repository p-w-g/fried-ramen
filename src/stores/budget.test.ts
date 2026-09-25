import { describe, expect, it, vi } from 'vitest';
import { db } from '@/db';
import { useBudgetStore } from './budget';

const draft = (name: string, amount: number) => ({
  name,
  amount,
  description: '',
});

async function openBudget() {
  const budget = useBudgetStore();
  await budget.open();
  await vi.waitFor(() => expect(budget.ready).toBe(true));
  return budget;
}

const names = (expenses: { name: string }[]) => expenses.map((e) => e.name);

describe('expenses', () => {
  it('keeps insertion order and sums totals exactly in cents', async () => {
    const budget = await openBudget();
    await budget.addExpense(draft('coffee', 0.1));
    await budget.addExpense(draft('tea', 0.2));

    await vi.waitFor(() => {
      expect(names(budget.expenses)).toEqual(['coffee', 'tea']);
      expect(budget.totalCents).toBe(30);
    });
  });

  it('ignores ids that do not exist instead of touching another expense', async () => {
    const budget = await openBudget();
    await budget.addExpense(draft('a', 1));
    await budget.completeExpense(99);
    await budget.updateExpense(99, draft('x', 0));
    await budget.assignCategory(99, 'food');

    expect(await db.expenses.toArray()).toMatchObject([
      { name: 'a', amountCents: 100, category: null },
    ]);
  });

  it('keeps categorised and unassigned expenses apart', async () => {
    const budget = await openBudget();
    await budget.addCategory('food');
    await budget.addExpense(draft('coffee', 5));
    await budget.addExpense(draft('shoes', 25));
    const [coffee] = await db.expenses.toArray();
    await budget.assignCategory(coffee!.id, 'food');

    await vi.waitFor(() => {
      expect(names(budget.unassigned)).toEqual(['shoes']);
      expect(names(budget.expensesIn('food'))).toEqual(['coffee']);
    });
  });
});

describe('categories', () => {
  it('rejects blank and duplicate names', async () => {
    const budget = await openBudget();
    await budget.addCategory('food');
    await vi.waitFor(() => expect(budget.categories).toEqual(['food']));
    await budget.addCategory('food');
    await budget.addCategory('');

    expect(await db.categories.count()).toBe(1);
  });

  it('only deletes a category nobody uses', async () => {
    const budget = await openBudget();
    await budget.addCategory('food');
    await budget.addExpense(draft('coffee', 5));
    const [coffee] = await db.expenses.toArray();
    await budget.assignCategory(coffee!.id, 'food');

    await budget.deleteCategoryIfEmpty('food');
    expect(await db.categories.count()).toBe(1);

    await budget.completeExpense(coffee!.id);
    await budget.deleteCategoryIfEmpty('food');
    expect(await db.categories.count()).toBe(0);
  });

  it('clearing a budget leaves other budgets alone', async () => {
    const budget = await openBudget();
    const otherId = await db.budgets.add({ name: 'Japan', slug: 'japan' });
    await db.expenses.add({
      budgetId: otherId,
      name: 'ramen',
      amountCents: 900,
      description: '',
      category: null,
    });
    await budget.addExpense(draft('coffee', 5));

    await budget.clearBudget();

    expect(names(await db.expenses.toArray())).toEqual(['ramen']);
  });
});
