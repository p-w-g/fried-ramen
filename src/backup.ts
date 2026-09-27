import { db } from './db';
import type { Budget, Category, Expense, Posting } from './domain';

export type Backup = {
  app: 'fried-ramen';
  version: 2;
  exportedAt: string;
  budgets: Budget[];
  categories: Category[];
  expenses: Expense[];
  postings: Posting[];
};

export class InvalidBackupError extends Error {}

export async function createBackup(now = new Date()): Promise<Backup> {
  return db.transaction(
    'r',
    db.budgets,
    db.categories,
    db.expenses,
    db.postings,
    async () => ({
      app: 'fried-ramen',
      version: 2,
      exportedAt: now.toISOString(),
      budgets: await db.budgets.toArray(),
      categories: await db.categories.toArray(),
      expenses: await db.expenses.toArray(),
      postings: await db.postings.toArray(),
    }),
  );
}

/** Replaces everything in one transaction; a failure leaves data untouched. */
export async function restoreBackup(backup: Backup) {
  await db.transaction(
    'rw',
    db.budgets,
    db.categories,
    db.expenses,
    db.postings,
    async () => {
      await Promise.all([
        db.budgets.clear(),
        db.categories.clear(),
        db.expenses.clear(),
        db.postings.clear(),
      ]);
      await db.budgets.bulkAdd(backup.budgets);
      await db.categories.bulkAdd(backup.categories);
      await db.expenses.bulkAdd(backup.expenses);
      await db.postings.bulkAdd(backup.postings);
    },
  );
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
const isId = (value: unknown) => Number.isInteger(value);
const isString = (value: unknown) => typeof value === 'string';

const isBudget = (value: unknown): value is Budget =>
  isRecord(value) &&
  isId(value.id) &&
  isString(value.name) &&
  isString(value.slug);

const isCategory = (value: unknown): value is Category =>
  isRecord(value) &&
  isId(value.id) &&
  isId(value.budgetId) &&
  isString(value.name);

const isExpense = (value: unknown): value is Expense =>
  isRecord(value) &&
  isId(value.id) &&
  isId(value.budgetId) &&
  isString(value.name) &&
  Number.isInteger(value.amountCents) &&
  isString(value.description) &&
  (value.category === null || isString(value.category));

const isPosting = (value: unknown): value is Posting =>
  isRecord(value) &&
  isId(value.id) &&
  isId(value.budgetId) &&
  isString(value.day) &&
  /^\d{4}-\d{2}-\d{2}$/.test(value.day) &&
  (value.category === null || isString(value.category)) &&
  Number.isInteger(value.deltaCents);

export function parseBackup(text: string): Backup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new InvalidBackupError('This file is not valid JSON.');
  }

  if (!isRecord(data) || data.app !== 'fried-ramen') {
    throw new InvalidBackupError('This is not a Fried Ramen backup.');
  }
  if (data.version !== 1 && data.version !== 2) {
    throw new InvalidBackupError(
      `Backup version ${String(data.version)} is not supported.`,
    );
  }

  const { budgets, categories, expenses } = data;
  // Version 1 predates postings: that history is unknown, not empty by mistake.
  const postings = data.version === 1 ? [] : data.postings;
  const valid =
    Array.isArray(budgets) &&
    budgets.every(isBudget) &&
    Array.isArray(categories) &&
    categories.every(isCategory) &&
    Array.isArray(expenses) &&
    expenses.every(isExpense) &&
    Array.isArray(postings) &&
    postings.every(isPosting);
  if (!valid) throw new InvalidBackupError('This backup is damaged.');

  const budgetIds = new Set(budgets.map((budget) => budget.id));
  const orphaned = [...categories, ...expenses, ...postings].some(
    (row) => !budgetIds.has(row.budgetId),
  );
  if (orphaned) throw new InvalidBackupError('This backup is damaged.');

  return { ...data, version: 2, postings } as Backup;
}
