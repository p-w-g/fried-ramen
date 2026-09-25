import { describe, expect, it, vi } from 'vitest';
import { db } from '@/db';
import { runFirstStart } from './firstStart';

const seedLegacy = (expenses: unknown, labels: unknown) => {
  localStorage.setItem('allExpensesList', JSON.stringify(expenses));
  localStorage.setItem('labels', JSON.stringify(labels));
};

describe('first start', () => {
  it('creates an empty "Current" budget when there is no legacy data', async () => {
    await runFirstStart();

    expect(await db.budgets.toArray()).toMatchObject([
      { name: 'Current', slug: 'current' },
    ]);
    expect(await db.expenses.count()).toBe(0);
  });

  it('imports legacy expenses and categories, keeping order', async () => {
    seedLegacy(
      [
        {
          Expense: 'Coffee',
          Amount: 4.5,
          Description: 'flat',
          Id: 7,
          Label: 'food',
          isPostponed: false,
        },
        { Expense: '', Amount: '', Id: 9, isPostponed: false },
      ],
      ['food', 'travel'],
    );

    await runFirstStart();

    expect(await db.expenses.toArray()).toMatchObject([
      {
        name: 'Coffee',
        amountCents: 450,
        description: 'flat',
        category: 'food',
      },
      { name: '', amountCents: 0, description: '', category: null },
    ]);
    expect((await db.categories.toArray()).map((c) => c.name)).toEqual([
      'food',
      'travel',
    ]);
  });

  it('recreates categories that legacy expenses still point at', async () => {
    seedLegacy(
      [
        {
          Expense: 'Shoes',
          Amount: 25,
          Id: 1,
          Label: 'orphan',
          isPostponed: false,
        },
      ],
      ['food'],
    );

    await runFirstStart();

    expect((await db.categories.toArray()).map((c) => c.name)).toEqual([
      'food',
      'orphan',
    ]);
  });

  it('imports only once, even when started twice at the same time', async () => {
    seedLegacy(
      [{ Expense: 'Coffee', Amount: 5, Id: 1, isPostponed: false }],
      [],
    );

    await Promise.all([runFirstStart(), runFirstStart()]);
    await runFirstStart();

    expect(await db.budgets.count()).toBe(1);
    expect(await db.expenses.count()).toBe(1);
  });

  it('removes the legacy keys once they are imported', async () => {
    seedLegacy(
      [{ Expense: 'Coffee', Amount: 5, Id: 1, isPostponed: false }],
      [],
    );

    await runFirstStart();

    expect(localStorage.getItem('allExpensesList')).toBeNull();
    expect(localStorage.getItem('labels')).toBeNull();
  });

  it('keeps the legacy keys when the import fails, to try again', async () => {
    seedLegacy(
      [{ Expense: 'Coffee', Amount: 5, Id: 1, isPostponed: false }],
      [],
    );
    const failingWrite = vi
      .spyOn(db.expenses, 'bulkAdd')
      .mockRejectedValueOnce(new Error('disk full'));

    await expect(runFirstStart()).rejects.toThrow('disk full');
    failingWrite.mockRestore();

    expect(localStorage.getItem('allExpensesList')).toContain('Coffee');
    expect(await db.budgets.count()).toBe(0);
    await runFirstStart();
    expect(await db.expenses.count()).toBe(1);
  });

  it('starts empty instead of crashing on corrupt or null legacy data', async () => {
    localStorage.setItem('allExpensesList', '{not json');
    localStorage.setItem('labels', 'null');

    await runFirstStart();

    expect(await db.budgets.count()).toBe(1);
    expect(await db.expenses.count()).toBe(0);
  });

  it('never runs again, so deleting every budget gives a clean slate', async () => {
    seedLegacy(
      [{ Expense: 'Coffee', Amount: 5, Id: 1, isPostponed: false }],
      [],
    );
    await runFirstStart();

    await db.budgets.clear();
    await db.expenses.clear();
    await runFirstStart();

    expect(await db.budgets.count()).toBe(0);
    expect(await db.expenses.count()).toBe(0);
  });

  it('leaves installs from before the flag as they are', async () => {
    await db.budgets.add({ name: 'Japan', slug: 'japan' });
    seedLegacy(
      [{ Expense: 'Coffee', Amount: 5, Id: 1, isPostponed: false }],
      [],
    );

    await runFirstStart();
    await db.budgets.clear();
    await runFirstStart();

    expect(await db.budgets.count()).toBe(0);
    expect(await db.expenses.count()).toBe(0);
  });
});
