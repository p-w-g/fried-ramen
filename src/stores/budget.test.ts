import { describe, expect, it, vi } from 'vitest';
import type { Collection } from 'dexie';
import { db } from '@/db';
import type { Budget } from '@/domain';
import { useBudgetStore } from './budget';
import { runFirstStart } from './firstStart';

const draft = (name: string, amount: number) => ({
  name,
  amount,
  description: '',
});

async function openBudget() {
  await runFirstStart();
  const budget = useBudgetStore();
  await budget.open('current');
  await vi.waitFor(() => expect(budget.status).toBe('open'));
  return budget;
}

/** Makes the next slug lookup resolve after any lookup that follows it. */
function slowDownFirstSlugLookup() {
  const realWhere = db.budgets.where.bind(db.budgets) as (
    query: object | string,
  ) => Collection<Budget>;
  let isFirstLookup = true;
  const slowWhere = (query: object | string) => {
    const result = realWhere(query);
    // Dexie resolves where({ slug }) through where('slug'); only slow the outer one.
    if (typeof query === 'object' && isFirstLookup) {
      isFirstLookup = false;
      const realFirst = result.first.bind(result);
      result.first = (() =>
        new Promise((resolve) => setTimeout(resolve, 30)).then(
          realFirst,
        )) as typeof result.first;
    }
    return result;
  };
  return vi
    .spyOn(db.budgets, 'where')
    .mockImplementation(slowWhere as typeof db.budgets.where);
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

describe('opening budgets by slug', () => {
  it('shows "missing" for a slug no budget has', async () => {
    const budget = useBudgetStore();
    await budget.open('nope');

    expect(budget.status).toBe('missing');
    expect(budget.budget).toBeNull();
  });

  it('defaults to the budget opened last', async () => {
    const budget = await openBudget();
    await db.budgets.add({ name: 'Japan', slug: 'japan' });
    expect(await budget.defaultSlug()).toBe('current');

    await budget.open('japan');

    expect(await budget.defaultSlug()).toBe('japan');
  });

  it('falls back to the first budget when the last one was deleted', async () => {
    await runFirstStart();
    const budget = useBudgetStore();
    const japanId = await db.budgets.add({ name: 'Japan', slug: 'japan' });
    await budget.open('japan');
    await db.budgets.delete(japanId);

    expect(await budget.defaultSlug()).toBe('current');
  });

  it('has no default when every budget was deleted', async () => {
    const budget = await openBudget();

    await db.budgets.clear();

    expect(await budget.defaultSlug()).toBeNull();
  });

  it('turns "missing" when the open budget gets deleted elsewhere', async () => {
    const budget = await openBudget();

    await db.budgets.clear();

    await vi.waitFor(() => expect(budget.status).toBe('missing'));
  });

  it('shows the newest of two quick opens, even if the older resolves last', async () => {
    const budget = await openBudget();
    await db.budgets.add({ name: 'Japan', slug: 'japan' });
    const slowFirstLookup = slowDownFirstSlugLookup();

    await Promise.all([budget.open('current'), budget.open('japan')]);
    slowFirstLookup.mockRestore();

    await vi.waitFor(() => expect(budget.budget?.slug).toBe('japan'));
  });
});
