import { db } from './db';
import type { Budget, Category, Expense } from './domain';

export type Backup = {
  app: 'fried-ramen';
  version: 1;
  exportedAt: string;
  budgets: Budget[];
  categories: Category[];
  expenses: Expense[];
};

export class InvalidBackupError extends Error {}

export async function createBackup(now = new Date()): Promise<Backup> {
  return db.transaction(
    'r',
    db.budgets,
    db.categories,
    db.expenses,
    async () => ({
      app: 'fried-ramen',
      version: 1,
      exportedAt: now.toISOString(),
      budgets: await db.budgets.toArray(),
      categories: await db.categories.toArray(),
      expenses: await db.expenses.toArray(),
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
    async () => {
      await Promise.all([
        db.budgets.clear(),
        db.categories.clear(),
        db.expenses.clear(),
      ]);
      await db.budgets.bulkAdd(backup.budgets);
      await db.categories.bulkAdd(backup.categories);
      await db.expenses.bulkAdd(backup.expenses);
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
  if (data.version !== 1) {
    throw new InvalidBackupError(
      `Backup version ${String(data.version)} is not supported.`,
    );
  }

  const { budgets, categories, expenses } = data;
  const valid =
    Array.isArray(budgets) &&
    budgets.every(isBudget) &&
    Array.isArray(categories) &&
    categories.every(isCategory) &&
    Array.isArray(expenses) &&
    expenses.every(isExpense);
  if (!valid) throw new InvalidBackupError('This backup is damaged.');

  const budgetIds = new Set(budgets.map((budget) => budget.id));
  const orphaned = [...categories, ...expenses].some(
    (row) => !budgetIds.has(row.budgetId),
  );
  if (orphaned) throw new InvalidBackupError('This backup is damaged.');

  return data as Backup;
}
