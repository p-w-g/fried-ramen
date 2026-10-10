import { defineStore } from 'pinia';
import { ref } from 'vue';
import { db, getMeta } from '@/db';
import type { Currency } from '@/domain';

/** Choices for this device; backups leave them out, like the theme. */
export const useSettingsStore = defineStore('settings', () => {
  /** Off: no currency labels, no converter, no requests to the rates API. */
  const currencyMode = ref(false);
  /** What budgets are shown in; undefined shows each in its own currency. */
  const displayCurrency = ref<Currency>();
  let loading: Promise<void> | undefined;

  /** Loads once; route guards await it before deciding what is reachable. */
  const load = () =>
    (loading ??= Promise.all([
      getMeta('currencyMode'),
      getMeta('displayCurrency'),
    ]).then(([mode, display]) => {
      currencyMode.value = mode ?? false;
      displayCurrency.value = display;
    }));

  async function setCurrencyMode(on: boolean) {
    await db.meta.put({ key: 'currencyMode', value: on });
    currencyMode.value = on;
  }

  async function setDisplayCurrency(currency: Currency | undefined) {
    if (currency)
      await db.meta.put({ key: 'displayCurrency', value: currency });
    else await db.meta.delete('displayCurrency');
    displayCurrency.value = currency;
  }

  return {
    currencyMode,
    displayCurrency,
    load,
    setCurrencyMode,
    setDisplayCurrency,
  };
});
