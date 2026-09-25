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
}

const snapshot = async () => ({
  budgets: await db.budgets.toArray(),
  categories: await db.categories.toArray(),
  expenses: await db.expenses.toArray(),
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
      '{"app":"fried-ramen","version":2}',
      'Backup version 2 is not supported.',
    ],
    [
      'no budgets',
      '{"app":"fried-ramen","version":1,"budgets":[],"categories":[],"expenses":[]}',
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
  ])('refuses %s and leaves data untouched', async (_case, text, message) => {
    await seed();
    const before = await snapshot();

    const attempt = useBackupStore().importAll(text);

    await expect(attempt).rejects.toThrow(InvalidBackupError);
    await expect(attempt).rejects.toThrow(message);
    expect(await snapshot()).toEqual(before);
  });
});
