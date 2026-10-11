<script setup lang="ts">
import BackupPanel from '@/components/form/BackupPanel.vue';
import { useLeave } from '@/leave';
import { useSettingsStore, type Switch } from '@/stores/settings';

const settings = useSettingsStore();
/** Every switch saves as it flips, so leaving needs no save of its own. */
const leave = useLeave();

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
