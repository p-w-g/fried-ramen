import { defineStore } from 'pinia';
import { computed, ref, shallowRef, watch } from 'vue';
import {
  convertCents,
  formatAmount,
  formatMoney,
  type Expense,
  type Rate,
} from '@/domain';
import { getRate } from '@/rates';
import { useBudgetStore } from './budget';
import { useSettingsStore } from './settings';

/**
 * How the open budget's amounts read: the one place that decides. Shown
 * in another currency, each amount is converted on the fly and nothing
 * converted is ever saved; charts keep the budget's own currency.
 */
export const useMoneyStore = defineStore('money', () => {
  const budget = useBudgetStore();
  const settings = useSettingsStore();

  /** Only labelled in currency mode; off, every budget reads as before. */
  const currency = computed(() =>
    settings.currencyMode ? (budget.budget?.currency ?? null) : null,
  );

  /** The currency to show in, when it differs from the budget's own. */
  const target = computed(() => {
    const display = settings.displayCurrency;
    return currency.value && display && display !== currency.value
      ? display
      : null;
  });

  const rate = shallowRef<Rate | null>(null);
  const isFetching = ref(false);

  watch(
    [currency, target],
    async ([base, quote]) => {
      rate.value = null;
      if (!base || !quote) return;
      isFetching.value = true;
      const found = await getRate(base, quote);
      const isStillWanted = base === currency.value && quote === target.value;
      if (!isStillWanted) return; // a newer pair took over meanwhile
      rate.value = found;
      isFetching.value = false;
    },
    { immediate: true },
  );

  /** Wanted another currency, but there has never been a rate for it. */
  const isRateMissing = computed(
    () => target.value !== null && !isFetching.value && rate.value === null,
  );

  const shownCents = (cents: number) =>
    rate.value ? convertCents(cents, rate.value) : cents;

  function format(cents: number) {
    const shownIn = rate.value?.quote ?? currency.value;
    return shownIn ? formatMoney(cents, shownIn) : formatAmount(cents);
  }

  const amount = (cents: number) => format(shownCents(cents));

  /** Adds up the amounts as shown, so the column and its total agree. */
  const total = (expenses: Expense[]) =>
    format(
      expenses.reduce(
        (sum, expense) => sum + shownCents(expense.amountCents),
        0,
      ),
    );

  return { currency, rate, isRateMissing, amount, total };
});
