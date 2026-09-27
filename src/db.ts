import Dexie, { type EntityTable } from 'dexie';
import {
  openingBalance,
  toDay,
  type Budget,
  type Category,
  type Expense,
  type Posting,
} from './domain';

export type Meta =
  | { key: 'lastExportedAt'; value: number }
  | { key: 'lastBudgetId'; value: number }
  | { key: 'firstStartDone'; value: number };

export const db = new Dexie('fried-ramen') as Dexie & {
  budgets: EntityTable<Budget, 'id'>;
  categories: EntityTable<Category, 'id'>;
  expenses: EntityTable<Expense, 'id'>;
  postings: EntityTable<Posting, 'id'>;
  meta: EntityTable<Meta, 'key'>;
};

db.version(1).stores({
  budgets: '++id, &slug',
  categories: '++id, budgetId, &[budgetId+name]',
  expenses: '++id, budgetId',
  meta: 'key',
});

db.version(2)
  .stores({ postings: '++id, budgetId' })
  .upgrade(async (tx) => {
    const expenses = await tx.table<Expense>('expenses').toArray();
    await tx
      .table('postings')
      .bulkAdd(openingBalance(expenses, toDay(new Date())));
  });
