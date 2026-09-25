<script setup lang="ts">
import NavBar from './components/shared/NavBar.vue';
import UpdatePrompt from './components/shared/UpdatePrompt.vue';
import { useBackupStore } from './stores/backup';

useBackupStore().checkUp();
</script>

<template>
  <main class="content">
    <RouterView />
  </main>
  <NavBar />
  <UpdatePrompt />
</template>
