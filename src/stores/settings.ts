import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { db, getMeta } from '@/db';
import type { Currency } from '@/domain';

/**
 * Each off by default, and while all are off the app never asks the
 * rates API. converter: the converter page. budgetCurrencies: budgets
 * get a currency and can be shown in another one.
 */
export type Switch = 'converter' | 'budgetCurrencies';

/** Choices for this device; backups leave them out, like the theme. */
export const useSettingsStore = defineStore('settings', () => {
  const switches = reactive<Record<Switch, boolean>>({
    converter: false,
    budgetCurrencies: false,
  });
  /** What budgets are shown in; undefined shows each in its own currency. */
  const displayCurrency = ref<Currency>();
  let loading: Promise<void> | undefined;

  /** Loads once; route guards await it before deciding what is reachable. */
  const load = () =>
    (loading ??= Promise.all([
      getMeta('converter'),
      getMeta('budgetCurrencies'),
      getMeta('displayCurrency'),
    ]).then(([converter, budgetCurrencies, display]) => {
      switches.converter = converter ?? false;
      switches.budgetCurrencies = budgetCurrencies ?? false;
      displayCurrency.value = display;
    }));

  async function setSwitch(key: Switch, on: boolean) {
    await db.meta.put({ key, value: on });
    switches[key] = on;
  }

  async function setDisplayCurrency(currency: Currency | undefined) {
    if (currency)
      await db.meta.put({ key: 'displayCurrency', value: currency });
    else await db.meta.delete('displayCurrency');
    displayCurrency.value = currency;
  }

  return { switches, displayCurrency, load, setSwitch, setDisplayCurrency };
});
