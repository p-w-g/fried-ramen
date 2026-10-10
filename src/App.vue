<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ConfirmDialog from './components/shared/ConfirmDialog.vue';
import ErrorBanner from './components/shared/ErrorBanner.vue';
import NavBar from './components/shared/NavBar.vue';
import ThemeToggle from './components/shared/ThemeToggle.vue';
import UpdatePrompt from './components/shared/UpdatePrompt.vue';
import AppIcon from './components/shared/AppIcon.vue';
import { useBackupStore } from './stores/backup';
import { useBudgetStore } from './stores/budget';
// Small enough for Vite to inline, so it shows offline without precaching.
import RamenIcon from './assets/ramen.png';
import SettingsIcon from './assets/icons/settings.svg';

void useBackupStore().checkUp();

const route = useRoute();
const budget = useBudgetStore();
const isInBudget = computed(() => typeof route.params.slug === 'string');
</script>

<template>
  <header class="fr__topbar">
    <RouterLink :to="{ name: 'budgets' }" class="fr__home">
      <img :src="RamenIcon" alt="Fried Ramen: all budgets" />
    </RouterLink>
    <h1 v-if="isInBudget && budget.budget" class="fr__title">
      {{ budget.budget.name }}
    </h1>
    <div class="fr__topbar-actions">
      <ThemeToggle />
      <RouterLink
        :to="{ name: 'settings' }"
        class="fr__icon-button"
        aria-label="Settings"
      >
        <AppIcon :src="SettingsIcon" />
      </RouterLink>
    </div>
  </header>
  <div class="fr__notices">
    <ErrorBanner />
    <UpdatePrompt />
  </div>
  <main class="content">
    <RouterView />
  </main>
  <NavBar v-if="isInBudget" />
  <ConfirmDialog />
</template>
