import { defineStore } from 'pinia';
import { ref } from 'vue';
import { db, getMeta } from '@/db';

/** Choices for this device; backups leave them out, like the theme. */
export const useSettingsStore = defineStore('settings', () => {
  /** Off: no currency labels, no converter, no requests to the rates API. */
  const currencyMode = ref(false);
  let loading: Promise<void> | undefined;

  /** Loads once; route guards await it before deciding what is reachable. */
  const load = () =>
    (loading ??= getMeta('currencyMode').then((stored) => {
      currencyMode.value = stored ?? false;
    }));

  async function setCurrencyMode(on: boolean) {
    await db.meta.put({ key: 'currencyMode', value: on });
    currencyMode.value = on;
  }

  return { currencyMode, load, setCurrencyMode };
});
