<script setup lang="ts">
import ErrorBanner from './components/shared/ErrorBanner.vue';
import NavBar from './components/shared/NavBar.vue';
import UpdatePrompt from './components/shared/UpdatePrompt.vue';
import { useBackupStore } from './stores/backup';

void useBackupStore().checkUp();
</script>

<template>
  <main class="content">
    <RouterView />
  </main>
  <NavBar />
  <UpdatePrompt />
  <ErrorBanner />
</template>
