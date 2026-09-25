<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue';

const { needRefresh, updateServiceWorker } = useRegisterSW();

/**
 * Reloads once the new worker takes over. The plugin only reloads pages
 * that already had a worker when they opened; this also covers a first
 * visit that catches a release in the same session.
 */
async function update() {
  navigator.serviceWorker.addEventListener(
    'controllerchange',
    () => window.location.reload(),
    { once: true },
  );
  await updateServiceWorker();
}
</script>

<template>
  <div v-if="needRefresh" class="fr__update-prompt" role="status">
    New noodles are ready.
    <button @click="update">Reload</button>
  </div>
</template>

<style scoped>
.fr__update-prompt {
  position: fixed;
  inset: auto 1rem 1rem;
  padding-left: 1rem;
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--glass-shadow);
}
</style>
