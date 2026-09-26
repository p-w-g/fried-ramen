<script setup lang="ts">
import { lastError } from '@/errors';
import BaseNotice from './BaseNotice.vue';
</script>

<template>
  <BaseNotice v-if="lastError" tone="danger" role="alert">
    <p>Something went wrong, so your last change may not be saved.</p>
    <p class="fr__error-detail">{{ lastError }}</p>
    <template #action>
      <button type="button" @click="lastError = null">Dismiss</button>
    </template>
  </BaseNotice>
</template>

<style scoped>
.fr__error-detail {
  font-size: 0.8rem;
}
</style>
