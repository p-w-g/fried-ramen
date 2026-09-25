import { describe, expect, it } from 'vitest';
import { db } from '@/db';
import { ensureFirstBudget } from './legacyImport';

const seedLegacy = (expenses: unknown, labels: unknown) => {
  localStorage.setItem('allExpensesList', JSON.stringify(expenses));
  localStorage.setItem('labels', JSON.stringify(labels));
};

describe('first start', () => {
  it('creates an empty "Current" budget when there is no legacy data', async () => {
    await ensureFirstBudget();

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

    await ensureFirstBudget();

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

    await ensureFirstBudget();

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

    await Promise.all([ensureFirstBudget(), ensureFirstBudget()]);
    await ensureFirstBudget();

    expect(await db.budgets.count()).toBe(1);
    expect(await db.expenses.count()).toBe(1);
  });

  it('leaves the legacy keys in place as a fallback', async () => {
    seedLegacy(
      [{ Expense: 'Coffee', Amount: 5, Id: 1, isPostponed: false }],
      [],
    );

    await ensureFirstBudget();

    expect(localStorage.getItem('allExpensesList')).toContain('Coffee');
  });

  it('starts empty instead of crashing on corrupt or null legacy data', async () => {
    localStorage.setItem('allExpensesList', '{not json');
    localStorage.setItem('labels', 'null');

    await ensureFirstBudget();

    expect(await db.budgets.count()).toBe(1);
    expect(await db.expenses.count()).toBe(0);
  });
});
