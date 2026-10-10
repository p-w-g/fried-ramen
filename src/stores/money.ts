import { defineStore } from 'pinia';
import { computed } from 'vue';
import { formatAmount, formatMoney, sumCents, type Expense } from '@/domain';
import { useBudgetStore } from './budget';
import { useSettingsStore } from './settings';

/** How the open budget's amounts read: the one place that decides. */
export const useMoneyStore = defineStore('money', () => {
  const budget = useBudgetStore();
  const settings = useSettingsStore();

  /** Only labelled in currency mode; off, every budget reads as before. */
  const currency = computed(() =>
    settings.currencyMode ? (budget.budget?.currency ?? null) : null,
  );

  const format = (cents: number) =>
    currency.value ? formatMoney(cents, currency.value) : formatAmount(cents);

  const amount = (cents: number) => format(cents);

  const total = (expenses: Expense[]) => format(sumCents(expenses));

  return { currency, amount, total };
});
