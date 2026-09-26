import { describe, expect, it, vi } from 'vitest';
import { db } from '@/db';
import { BudgetNameError, useBudgetsStore } from './budgets';

describe('budgets', () => {
  it('creates a budget whose slug replaces spaces with underscores', async () => {
    const created = await useBudgetsStore().create('  April Tour of Japan ');

    expect(created).toMatchObject({
      name: 'April Tour of Japan',
      slug: 'april_tour_of_japan',
    });
  });

  it.each([
    ['the same name', 'Japan'],
    ['a name differing only in case and spacing', ' japan  '],
  ])('refuses %s as an existing budget', async (_case, name) => {
    const budgets = useBudgetsStore();
    await budgets.create('Japan');

    await expect(budgets.create(name)).rejects.toThrow(
      new BudgetNameError('A budget called “Japan” already exists.'),
    );
    expect(await db.budgets.count()).toBe(1);
  });

  it('refuses a blank name', async () => {
    await expect(useBudgetsStore().create('   ')).rejects.toThrow(
      BudgetNameError,
    );
  });

  it('explains the clash when two identical names are saved at once', async () => {
    const budgets = useBudgetsStore();

    const [first, second] = await Promise.allSettled([
      budgets.create('Japan'),
      budgets.create('japan'),
    ]);

    expect(first.status).toBe('fulfilled');
    expect(second.status === 'rejected' && second.reason).toBeInstanceOf(
      BudgetNameError,
    );
    expect(await db.budgets.count()).toBe(1);
  });

  it('renames a budget and moves its slug along', async () => {
    const budgets = useBudgetsStore();
    const japan = await budgets.create('Japan');

    await budgets.rename(japan.id, 'Japan 2027');

    expect(await db.budgets.get(japan.id)).toMatchObject({
      name: 'Japan 2027',
      slug: 'japan_2027',
    });
  });

  it('lets a budget keep its own name on rename, but not take another', async () => {
    const budgets = useBudgetsStore();
    const japan = await budgets.create('Japan');
    await budgets.create('Debt');

    await budgets.rename(japan.id, 'JAPAN');
    await expect(budgets.rename(japan.id, 'debt')).rejects.toThrow(
      BudgetNameError,
    );
    expect((await db.budgets.get(japan.id))?.name).toBe('JAPAN');
  });

  it('deletes a budget with everything in it, leaving others alone', async () => {
    const budgets = useBudgetsStore();
    const japan = await budgets.create('Japan');
    const debt = await budgets.create('Debt');
    for (const budgetId of [japan.id, debt.id]) {
      await db.categories.add({ budgetId, name: 'food' });
      await db.expenses.add({
        budgetId,
        name: 'ramen',
        amountCents: 900,
        description: '',
        category: 'food',
      });
    }

    await budgets.remove(japan.id);

    expect(await db.budgets.toArray()).toMatchObject([{ name: 'Debt' }]);
    expect(await db.categories.where({ budgetId: japan.id }).count()).toBe(0);
    expect(await db.expenses.where({ budgetId: japan.id }).count()).toBe(0);
    expect(await db.expenses.where({ budgetId: debt.id }).count()).toBe(1);
  });

  it('can delete every budget', async () => {
    const budgets = useBudgetsStore();
    const only = await budgets.create('Only');

    await budgets.remove(only.id);

    expect(await db.budgets.count()).toBe(0);
  });

  it('sums each budget on its own, and an empty one to 0', async () => {
    const budgets = useBudgetsStore();
    const japan = await budgets.create('Japan');
    const debt = await budgets.create('Debt');
    const empty = await budgets.create('Empty');
    const add = (budgetId: number, amountCents: number) =>
      db.expenses.add({
        budgetId,
        name: '',
        amountCents,
        description: '',
        category: null,
      });
    await add(japan.id, 18_000_000);
    await add(japan.id, 50);
    await add(debt.id, 999);

    budgets.watchAll();

    await vi.waitFor(() => expect(budgets.totalOf(japan.id)).toBe(18_000_050));
    expect(budgets.totalOf(debt.id)).toBe(999);
    expect(budgets.totalOf(empty.id)).toBe(0);
  });
});
