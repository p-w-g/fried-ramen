import { describe, expect, it } from 'vitest';
import { db } from '@/db';
import { runFirstStart } from './firstStart';

describe('first start', () => {
  it('creates an empty "Current" budget', async () => {
    await runFirstStart();

    expect(await db.budgets.toArray()).toMatchObject([
      { name: 'Current', slug: 'current' },
    ]);
    expect(await db.expenses.count()).toBe(0);
  });

  it('creates it once, even when two tabs start at the same time', async () => {
    await Promise.all([runFirstStart(), runFirstStart()]);
    await runFirstStart();

    expect(await db.budgets.count()).toBe(1);
  });

  it('never runs again, so deleting every budget gives a clean slate', async () => {
    await runFirstStart();
    await db.budgets.clear();

    await runFirstStart();

    expect(await db.budgets.count()).toBe(0);
  });
});
