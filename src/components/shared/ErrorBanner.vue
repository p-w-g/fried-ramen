<script setup lang="ts">
import { lastError } from '@/errors';
</script>

<template>
  <div v-if="lastError" class="fr__error-banner" role="alert">
    <p>Something went wrong, so your last change may not be saved.</p>
    <p class="fr__error-detail">{{ lastError }}</p>
    <button type="button" @click="lastError = null">Dismiss</button>
  </div>
</template>

<style scoped>
.fr__error-banner {
  position: fixed;
  inset: 1rem 1rem auto;
  z-index: 2;
  padding: 0 1rem;
  background: white;
  border: 2px solid var(--danger);
  border-radius: var(--radius);
  box-shadow: var(--glass-shadow);
}

.fr__error-detail {
  font-size: 0.8rem;
}
</style>
