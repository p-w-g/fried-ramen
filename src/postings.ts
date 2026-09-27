import { db } from './db';
import { toDay } from './domain';

/*
 * Postings are the fixed past. eslint.config.js lets only this file and
 * backup.ts write to db.postings: nothing edits a posting, and only wiping
 * or deleting its budget removes one.
 */

/**
 * Read once when an action starts, so every posting it makes shares a day
 * even when the action runs across midnight.
 */
export const today = () => toDay(new Date());

/** Call inside a transaction that includes db.postings. */
export async function post(
  day: string,
  budgetId: number,
  category: string | null,
  deltaCents: number,
) {
  if (deltaCents === 0) return;
  await db.postings.add({ budgetId, day, category, deltaCents });
}

/** Call inside a transaction that includes db.postings. */
export const forgetBudget = (budgetId: number) =>
  db.postings.where({ budgetId }).delete();
