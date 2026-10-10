import { expect, it, vi } from 'vitest';
import { db } from '@/db';
import type { Currency, Expense } from '@/domain';
import { useBudgetStore } from './budget';
import { useMoneyStore } from './money';
import { useSettingsStore } from './settings';

async function openBudget(currency?: Currency) {
  await db.budgets.add({ name: 'Japan', slug: 'japan', currency });
  const budget = useBudgetStore();
  await budget.open('japan');
  await vi.waitFor(() => expect(budget.status).toBe('open'));
}

const expense = (amountCents: number): Expense => ({
  id: amountCents,
  budgetId: 1,
  name: '',
  amountCents,
  description: '',
  category: null,
});

it('labels amounts with the budget currency in currency mode', async () => {
  await openBudget('JPY');
  await useSettingsStore().setCurrencyMode(true);
  const money = useMoneyStore();

  expect(money.amount(158_511)).toBe('¥1,585');
  expect(money.total([expense(100_000), expense(58_511)])).toBe('¥1,585');
});

it('reads as before with currency mode off, even for a budget with one', async () => {
  await openBudget('JPY');
  const money = useMoneyStore();

  expect(money.amount(158_511)).toBe('1,585.11');
});

it('reads as before for a budget without a currency', async () => {
  await openBudget();
  await useSettingsStore().setCurrencyMode(true);

  expect(useMoneyStore().amount(450)).toBe('4.50');
});
