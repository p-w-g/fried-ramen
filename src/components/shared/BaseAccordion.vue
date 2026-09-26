<script setup lang="ts">
import { ref } from 'vue';
import AppIcon from './AppIcon.vue';
import Chevron from '@/assets/icons/chevron_right.svg';

const { label } = defineProps<{ label: string }>();

const isOpen = ref(false);
</script>

<template>
  <div class="fr__accordion">
    <button
      type="button"
      class="fr__accordion-toggle"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      {{ label }}
      <AppIcon
        :src="Chevron"
        class="fr__chevron"
        :class="{ 'fr__chevron--open': isOpen }"
      />
    </button>
    <transition name="fade" appear>
      <div v-if="isOpen" class="fr__accordion-panel">
        <slot />
      </div>
    </transition>
  </div>
</template>

<style>
.fr__accordion {
  background: var(--surface);
  border: 1px solid var(--divider);
  border-radius: var(--radius-container);
}

button.fr__accordion-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border: 0;
  border-radius: var(--radius-container);
  background: transparent;
  padding: 0.5rem 0.75rem 0.5rem 1rem;
}

.fr__accordion-panel {
  padding: 0 1rem 1rem;
}

.fr__chevron {
  color: var(--text-muted);
  transform: rotate(90deg);
  transition: transform 0.2s ease;

  &.fr__chevron--open {
    transform: rotate(270deg);
  }
}
</style>
