<script setup lang="ts">
import BackupPanel from '@/components/form/BackupPanel.vue';
import { useSettingsStore } from '@/stores/settings';

const settings = useSettingsStore();
</script>

<template>
  <div class="fr__page">
    <h1>Settings</h1>
    <section class="fr__setting">
      <h2 class="fr__subheading">Currency</h2>
      <label class="fr__switch">
        <input
          type="checkbox"
          role="switch"
          :checked="settings.currencyMode"
          aria-describedby="currency-mode-hint"
          @change="
            settings.setCurrencyMode(
              ($event.target as HTMLInputElement).checked,
            )
          "
        />
        Currency mode
      </label>
      <p id="currency-mode-hint" class="fr__hint">
        Gives budgets a currency, shows them in another one, and adds a
        converter. Exchange rates come from frankfurter.dev once a day, and only
        while this is on.
      </p>
    </section>
    <BackupPanel />
  </div>
</template>

<style>
.fr__setting {
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
