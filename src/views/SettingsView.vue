<script setup lang="ts">
import BackupPanel from '@/components/form/BackupPanel.vue';
import {
  NUMBER_LOCALES,
  formatAmount,
  formatCompactAmount,
  type NumberLocale,
} from '@/domain';
import { useLeave } from '@/leave';
import { useSettingsStore, type Switch } from '@/stores/settings';

const settings = useSettingsStore();
/** Every switch saves as it flips, so leaving needs no save of its own. */
const leave = useLeave();

const FORMAT_NAMES: Record<NonNullable<NumberLocale>, string> = {
  'en-US': 'US',
  'sv-SE': 'Swedish',
  'de-DE': 'German',
  'en-IN': 'Indian',
  'ja-JP': 'Japanese',
};

/** Shows a format rather than naming it: 1,234,567.89 · 300万. */
const sample = (locale: NumberLocale) =>
  `${formatAmount(123_456_789, locale)} · ${formatCompactAmount(300_000_000, locale)}`;

const numberFormats = [
  { locale: undefined, label: `Auto, as the phone: ${sample(undefined)}` },
  ...NUMBER_LOCALES.map((locale) => ({
    locale,
    label: `${FORMAT_NAMES[locale]}: ${sample(locale)}`,
  })),
];

function chooseNumberFormat(event: Event) {
  const chosen = (event.target as HTMLSelectElement).value;
  const locale = NUMBER_LOCALES.find((known) => known === chosen);
  void settings.setNumberLocale(locale);
}

const currencySwitches: { key: Switch; label: string; hint: string }[] = [
  {
    key: 'converter',
    label: 'Converter',
    hint: 'Adds Currency to the top bar: converts an amount between currencies.',
  },
  {
    key: 'budgetCurrencies',
    label: 'Budget currencies',
    hint: 'Gives each budget a currency, and shows it in another one.',
  },
];
</script>

<template>
  <div class="fr__page">
    <h1>Settings</h1>
    <section class="fr__setting">
      <h2 class="fr__subheading">Currency</h2>
      <div v-for="item in currencySwitches" :key="item.key">
        <label class="fr__switch">
          <input
            type="checkbox"
            role="switch"
            :checked="settings.switches[item.key]"
            :aria-describedby="`${item.key}-hint`"
            @change="
              settings.setSwitch(
                item.key,
                ($event.target as HTMLInputElement).checked,
              )
            "
          />
          {{ item.label }}
        </label>
        <p :id="`${item.key}-hint`" class="fr__hint">{{ item.hint }}</p>
      </div>
      <p class="fr__hint">
        Exchange rates come from frankfurter.dev, at most once a day per
        currency pair, and only while one of these is on.
      </p>
    </section>
    <section class="fr__setting">
      <h2 class="fr__subheading">Numbers</h2>
      <div class="fr__field">
        <label for="number-format">Number format</label>
        <select
          id="number-format"
          :value="settings.numberLocale ?? ''"
          aria-describedby="number-format-hint"
          @change="chooseNumberFormat"
        >
          <option
            v-for="format in numberFormats"
            :key="format.locale ?? ''"
            :value="format.locale ?? ''"
          >
            {{ format.label }}
          </option>
        </select>
      </div>
      <p id="number-format-hint" class="fr__hint">
        How amounts are written, and how the converter reads them: 300万 or 30L
        work as typed.
      </p>
    </section>
    <BackupPanel />
    <button type="button" class="fr__button--primary" @click="leave">
      Done
    </button>
  </div>
</template>

<style>
.fr__setting {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  & .fr__subheading {
    margin-bottom: 0;
  }

  & p {
    margin: 0.25rem 0 0;
    font-size: 0.875rem;
  }
}

.fr__switch {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.75rem;
  font-weight: 500;

  & input {
    width: 1.25rem;
    height: 1.25rem;
    min-height: 0;
    margin: 0;
    accent-color: var(--accent);
  }
}
</style>
