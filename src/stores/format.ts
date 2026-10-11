import { defineStore } from 'pinia';
import {
  formatAmount,
  formatBareMoney,
  formatCompactAmount,
  formatMoney,
  readLocaleAmount,
  type Currency,
} from '@/domain';
import { useSettingsStore } from './settings';

/** The number formatters, in the format chosen in settings. */
export const useFormatStore = defineStore('format', () => {
  const settings = useSettingsStore();

  return {
    amount: (cents: number) => formatAmount(cents, settings.numberLocale),
    compact: (cents: number) =>
      formatCompactAmount(cents, settings.numberLocale),
    money: (cents: number, currency: Currency) =>
      formatMoney(cents, currency, settings.numberLocale),
    bareMoney: (cents: number, currency: Currency) =>
      formatBareMoney(cents, currency, settings.numberLocale),
    read: (typed: string) => readLocaleAmount(typed, settings.numberLocale),
  };
});
