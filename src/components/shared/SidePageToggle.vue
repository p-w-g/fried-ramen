<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useLeave } from '@/leave';
import AppIcon from './AppIcon.vue';

/** A top bar icon that opens a side page, and on that page closes it. */
const { page, label, icon } = defineProps<{
  page: 'settings' | 'convert';
  label: string;
  icon: string;
}>();

const route = useRoute();
const leave = useLeave();
const isOpen = computed(() => route.name === page);
</script>

<template>
  <button
    v-if="isOpen"
    type="button"
    class="fr__icon-button fr__icon-button--open"
    :aria-label="`Close ${label.toLowerCase()}`"
    @click="leave"
  >
    <AppIcon :src="icon" />
  </button>
  <RouterLink
    v-else
    :to="{ name: page }"
    class="fr__icon-button"
    :aria-label="label"
  >
    <AppIcon :src="icon" />
  </RouterLink>
</template>

<style>
.fr__icon-button.fr__icon-button--open {
  color: var(--text);
  background: var(--accent-soft);
  border-radius: var(--radius-control);
}
</style>
