import { db } from './db';
import { toDay } from './domain';

/*
 * Postings are the fixed past. eslint.config.js lets only this file and
 * backup.ts write to db.postings: nothing edits a posting, and only wiping
 * or deleting its budget removes one.
 */

/** Call inside a transaction that includes db.postings. */
export async function post(
  budgetId: number,
  category: string | null,
  deltaCents: number,
) {
  if (deltaCents === 0) return;
  await db.postings.add({
    budgetId,
    day: toDay(new Date()),
    category,
    deltaCents,
  });
}

/** Call inside a transaction that includes db.postings. */
export const forgetBudget = (budgetId: number) =>
  db.postings.where({ budgetId }).delete();
