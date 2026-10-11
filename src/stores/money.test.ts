import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { db } from '@/db';
import type { Currency, Expense } from '@/domain';
import { useBudgetStore } from './budget';
import { useMoneyStore } from './money';
import { useSettingsStore } from './settings';

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  // Its watcher would otherwise outlive the test and react to the next one's data.
  useMoneyStore().$dispose();
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

const published = (rate: number) =>
  new Response(JSON.stringify({ date: '2026-10-09', rate }));

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

it('labels amounts with the budget currency with budget currencies on', async () => {
  await openBudget('JPY');
  await useSettingsStore().setSwitch('budgetCurrencies', true);
  const money = useMoneyStore();

  expect(money.amount(158_511)).toBe('¥1,585');
  expect(money.total([expense(100_000), expense(58_511)])).toBe('¥1,585');
});

it('reads as before with budget currencies off, even for a budget with one', async () => {
  await openBudget('JPY');
  const money = useMoneyStore();

  expect(money.amount(158_511)).toBe('1,585.11');
});

it('reads as before for a budget without a currency', async () => {
  await openBudget();
  await useSettingsStore().setSwitch('budgetCurrencies', true);

  expect(useMoneyStore().amount(450)).toBe('4.50');
});

it('shows each amount converted, and a total that adds up what is shown', async () => {
  fetchMock.mockResolvedValue(published(1.5));
  await openBudget('SEK');
  const settings = useSettingsStore();
  await settings.setSwitch('budgetCurrencies', true);
  await settings.setDisplayCurrency('EUR');
  const money = useMoneyStore();
  await vi.waitFor(() => expect(money.rate).not.toBeNull());

  expect(money.amount(333)).toBe('€5.00');
  // 6.66 × 1.5 would be 9.99; the rows as shown read 5.00 + 5.00.
  expect(money.total([expense(333), expense(333)])).toBe('€10.00');
  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.frankfurter.dev/v2/rate/SEK/EUR',
  );
});

it('stays in its own currency without a rate, and says so', async () => {
  fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
  await openBudget('SEK');
  const settings = useSettingsStore();
  await settings.setSwitch('budgetCurrencies', true);
  await settings.setDisplayCurrency('EUR');
  const money = useMoneyStore();

  await vi.waitFor(() => expect(money.isRateMissing).toBe(true));
  expect(money.amount(450)).toBe('SEK\u00a04.50');
});

it('never asks for a rate with budget currencies off', async () => {
  await openBudget('SEK');
  await useSettingsStore().setDisplayCurrency('EUR');
  const money = useMoneyStore();

  expect(money.amount(450)).toBe('4.50');
  await new Promise((resolve) => setTimeout(resolve, 10));
  expect(fetchMock).not.toHaveBeenCalled();
});
