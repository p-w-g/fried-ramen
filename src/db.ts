import Dexie, { type EntityTable, type Table } from 'dexie';
import {
  openingBalance,
  toDay,
  type Budget,
  type Category,
  type Currency,
  type Expense,
  type NumberLocale,
  type Posting,
  type Rate,
} from './domain';

export type Meta =
  | { key: 'lastExportedAt'; value: number }
  | { key: 'lastBudgetId'; value: number }
  | { key: 'firstStartDone'; value: number }
  | { key: 'converter'; value: boolean }
  | { key: 'budgetCurrencies'; value: boolean }
  | { key: 'displayCurrency'; value: Currency }
  | { key: 'numberLocale'; value: NonNullable<NumberLocale> };

/** Reads one setting with the type its key promises. */
export async function getMeta<K extends Meta['key']>(key: K) {
  const row = await db.meta.get(key);
  return row?.value as Extract<Meta, { key: K }>['value'] | undefined;
}

export const db = new Dexie('fried-ramen') as Dexie & {
  budgets: EntityTable<Budget, 'id'>;
  categories: EntityTable<Category, 'id'>;
  expenses: EntityTable<Expense, 'id'>;
  postings: EntityTable<Posting, 'id'>;
  meta: EntityTable<Meta, 'key'>;
  rates: Table<Rate, [string, string]>;
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

db.version(3).stores({ rates: '[base+quote]' });
