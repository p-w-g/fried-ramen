import { describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { db } from '@/db';
import { InvalidBackupError } from '@/backup';
import { useBackupStore } from './backup';
import { useBudgetStore } from './budget';

async function seed() {
  const budgetId = await db.budgets.add({ name: 'Current', slug: 'current' });
  await db.categories.add({ budgetId, name: 'food' });
  await db.expenses.add({
    budgetId,
    name: 'Coffee',
    amountCents: 450,
    description: '',
    category: 'food',
  });
  await db.postings.add({
    budgetId,
    day: '2026-09-20',
    category: null,
    deltaCents: 450,
  });
}

const snapshot = async () => ({
  budgets: await db.budgets.toArray(),
  categories: await db.categories.toArray(),
  expenses: await db.expenses.toArray(),
  postings: await db.postings.toArray(),
});

describe('backup', () => {
  it('restores exactly what was exported', async () => {
    await seed();
    const before = await snapshot();
    const backup = useBackupStore();
    const json = await backup.exportAll(new Date('2026-09-25T10:00:00Z'));

    await db.expenses.clear();
    await db.expenses.add({
      budgetId: 1,
      name: 'added after export',
      amountCents: 1,
      description: '',
      category: null,
    });
    await backup.importAll(json);

    expect(await snapshot()).toEqual(before);
  });

  it('restores an export taken with no budgets at all', async () => {
    const backup = useBackupStore();
    const empty = await backup.exportAll();
    await seed();

    await backup.importAll(empty);

    expect(await snapshot()).toEqual({
      budgets: [],
      categories: [],
      expenses: [],
      postings: [],
    });
  });

  it('restores a version 1 backup, from before postings, opening its history on the day of the restore', async () => {
    await seed();
    const v1 = JSON.stringify({
      app: 'fried-ramen',
      version: 1,
      budgets: [{ id: 7, name: 'Old', slug: 'old' }],
      categories: [],
      expenses: [
        {
          id: 1,
          budgetId: 7,
          name: 'Tea',
          amountCents: 300,
          description: '',
          category: null,
        },
      ],
    });

    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-01T09:00'));

    await useBackupStore().importAll(v1);
    vi.useRealTimers();

    expect(await snapshot()).toMatchObject({
      budgets: [{ name: 'Old' }],
      expenses: [{ name: 'Tea' }],
      postings: [
        { budgetId: 7, day: '2026-10-01', category: null, deltaCents: 300 },
      ],
    });
  });

  it('remembers when the last export happened', async () => {
    await seed();
    const backup = useBackupStore();
    const exportedAt = new Date('2026-09-20T10:00:00Z');
    await backup.exportAll(exportedAt);

    setActivePinia(createPinia());
    const reloaded = useBackupStore();
    await reloaded.checkUp();

    expect(reloaded.lastExportedAt).toBe(exportedAt.getTime());
    expect(reloaded.daysSinceExport(Date.parse('2026-09-25T10:00:00Z'))).toBe(
      5,
    );
  });

  it('reopens the budget in the URL after importing', async () => {
    await seed();
    const backup = useBackupStore();
    const json = await backup.exportAll();
    const budget = useBudgetStore();
    await budget.open('current');
    await db.budgets.clear();
    await vi.waitFor(() => expect(budget.status).toBe('missing'));

    await backup.importAll(json);

    await vi.waitFor(() => expect(budget.status).toBe('open'));
    expect(budget.budget?.slug).toBe('current');
  });

  it.each([
    ['not JSON', '{nope', 'This file is not valid JSON.'],
    ['another app', '{"app":"other"}', 'This is not a Fried Ramen backup.'],
    [
      'a newer version',
      '{"app":"fried-ramen","version":3}',
      'Backup version 3 is not supported.',
    ],
    [
      'budgets that are not a list',
      '{"app":"fried-ramen","version":1,"budgets":{},"categories":[],"expenses":[]}',
      'This backup is damaged.',
    ],
    [
      'an expense of an unknown budget',
      JSON.stringify({
        app: 'fried-ramen',
        version: 1,
        budgets: [{ id: 1, name: 'a', slug: 'a' }],
        categories: [],
        expenses: [
          {
            id: 1,
            budgetId: 2,
            name: '',
            amountCents: 0,
            description: '',
            category: null,
          },
        ],
      }),
      'This backup is damaged.',
    ],
    [
      'a fractional amount',
      JSON.stringify({
        app: 'fried-ramen',
        version: 1,
        budgets: [{ id: 1, name: 'a', slug: 'a' }],
        categories: [],
        expenses: [
          {
            id: 1,
            budgetId: 1,
            name: '',
            amountCents: 0.5,
            description: '',
            category: null,
          },
        ],
      }),
      'This backup is damaged.',
    ],
    [
      'a posting of an unknown budget',
      JSON.stringify({
        app: 'fried-ramen',
        version: 2,
        budgets: [{ id: 1, name: 'a', slug: 'a' }],
        categories: [],
        expenses: [],
        postings: [
          {
            id: 1,
            budgetId: 2,
            day: '2026-09-20',
            category: null,
            deltaCents: 1,
          },
        ],
      }),
      'This backup is damaged.',
    ],
    [
      'a posting without a calendar day',
      JSON.stringify({
        app: 'fried-ramen',
        version: 2,
        budgets: [{ id: 1, name: 'a', slug: 'a' }],
        categories: [],
        expenses: [],
        postings: [
          {
            id: 1,
            budgetId: 1,
            day: 'yesterday',
            category: null,
            deltaCents: 1,
          },
        ],
      }),
      'This backup is damaged.',
    ],
    [
      'a version 2 backup missing its postings',
      JSON.stringify({
        app: 'fried-ramen',
        version: 2,
        budgets: [],
        categories: [],
        expenses: [],
      }),
      'This backup is damaged.',
    ],
  ])('refuses %s and leaves data untouched', async (_case, text, message) => {
    await seed();
    const before = await snapshot();

    const attempt = useBackupStore().importAll(text);

    await expect(attempt).rejects.toThrow(InvalidBackupError);
    await expect(attempt).rejects.toThrow(message);
    expect(await snapshot()).toEqual(before);
  });
});
