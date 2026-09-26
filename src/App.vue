<script setup lang="ts">
import ConfirmDialog from './components/shared/ConfirmDialog.vue';
import ErrorBanner from './components/shared/ErrorBanner.vue';
import NavBar from './components/shared/NavBar.vue';
import ThemeToggle from './components/shared/ThemeToggle.vue';
import UpdatePrompt from './components/shared/UpdatePrompt.vue';
import { useBackupStore } from './stores/backup';

void useBackupStore().checkUp();
</script>

<template>
  <header class="fr__topbar">
    <span class="fr__wordmark">Fried Ramen</span>
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
