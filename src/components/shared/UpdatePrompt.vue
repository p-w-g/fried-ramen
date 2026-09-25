<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue';

const { needRefresh, updateServiceWorker } = useRegisterSW();
</script>

<template>
  <div v-if="needRefresh" class="fr__update-prompt" role="status">
    New noodles are ready.
    <button @click="updateServiceWorker()">Reload</button>
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
