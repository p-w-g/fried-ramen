<script setup lang="ts">
import { theme, toggleTheme } from '@/theme';
import AppIcon from './AppIcon.vue';
import DarkIcon from '@/assets/icons/dark_mode.svg';
import LightIcon from '@/assets/icons/light_mode.svg';
</script>

<template>
  <button
    type="button"
    class="fr__icon-button fr__theme-toggle"
    :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
    @click="toggleTheme"
  >
    <AppIcon :src="theme === 'dark' ? LightIcon : DarkIcon" />
  </button>
</template>

<style>
button.fr__theme-toggle {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  color: var(--text-muted);

  &:hover {
    color: var(--text);
  }
}
</style>
