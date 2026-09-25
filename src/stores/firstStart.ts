import { db } from '@/db';

/**
 * On the very first start, creates an empty "Current" budget so the app
 * opens straight into expense entry. Never again afterwards: someone who
 * deletes every budget wants a clean slate. One transaction, so two tabs
 * opening at once cannot both create it.
 */
export const runFirstStart = () =>
  db.transaction('rw', db.budgets, db.meta, async () => {
    if (await db.meta.get('firstStartDone')) return;
    await db.meta.put({ key: 'firstStartDone', value: Date.now() });
    await db.budgets.add({ name: 'Current', slug: 'current' });
  });
