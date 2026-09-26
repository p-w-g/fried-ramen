<script setup lang="ts">
import ConfirmDialog from './components/shared/ConfirmDialog.vue';
import ErrorBanner from './components/shared/ErrorBanner.vue';
import NavBar from './components/shared/NavBar.vue';
import ThemeToggle from './components/shared/ThemeToggle.vue';
import UpdatePrompt from './components/shared/UpdatePrompt.vue';
import { useBackupStore } from './stores/backup';
// Small enough for Vite to inline, so it shows offline without precaching.
import RamenIcon from './assets/ramen.png';

void useBackupStore().checkUp();
</script>

<template>
  <header class="fr__topbar">
    <RouterLink :to="{ name: 'budgets' }" class="fr__home">
      <img :src="RamenIcon" alt="Fried Ramen: all budgets" />
    </RouterLink>
    <ThemeToggle />
  </header>
  <div class="fr__notices">
    <ErrorBanner />
    <UpdatePrompt />
  </div>
  <main class="content">
    <RouterView />
  </main>
  <NavBar />
  <ConfirmDialog />
</template>
