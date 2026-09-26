<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue';
import BaseNotice from './BaseNotice.vue';

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
  <BaseNotice v-if="needRefresh" role="status">
    New noodles are ready.
    <template #action>
      <button @click="update">Reload</button>
    </template>
  </BaseNotice>
</template>
