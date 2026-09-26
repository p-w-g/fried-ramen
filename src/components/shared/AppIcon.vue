<script setup lang="ts">
import { computed } from 'vue';

const { src } = defineProps<{ src: string }>();

/** Quoted, since Vite inlines small SVGs as data URIs full of quotes. */
const mask = computed(() => ({ '--icon': `url(${JSON.stringify(src)})` }));
</script>

<!-- Painted with currentColor through a mask, so icons follow the theme. -->
<template>
  <span class="fr__icon" aria-hidden="true" :style="mask" />
</template>

<style>
.fr__icon {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  vertical-align: middle;
  background-color: currentColor;
  mask: var(--icon) center / contain no-repeat;
}
</style>
