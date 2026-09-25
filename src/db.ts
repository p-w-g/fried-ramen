import Dexie, { type EntityTable } from 'dexie';
import type { Budget, Category, Expense } from './domain';

export type Meta =
  | { key: 'lastExportedAt'; value: number }
  | { key: 'lastBudgetId'; value: number };

export const db = new Dexie('fried-ramen') as Dexie & {
  budgets: EntityTable<Budget, 'id'>;
  categories: EntityTable<Category, 'id'>;
  expenses: EntityTable<Expense, 'id'>;
  meta: EntityTable<Meta, 'key'>;
};

db.version(1).stores({
  budgets: '++id, &slug',
  categories: '++id, budgetId, &[budgetId+name]',
  expenses: '++id, budgetId',
  meta: 'key',
});
