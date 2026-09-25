<script setup lang="ts">
import { ref } from 'vue';
import Chevron from '@/assets/icons/chevron_right.svg';

const isOpen = ref(false);
</script>

<template>
  <div>
    <slot name="header" />
    <transition name="fade" appear>
      <slot v-if="isOpen" name="content" />
    </transition>
    <input
      class="accordion"
      type="image"
      :src="Chevron"
      alt="Accordion toggle"
      :class="isOpen ? 'accordion--open' : 'accordion--close'"
      @click="isOpen = !isOpen"
    />
  </div>
</template>

<style scoped>
.accordion {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
  transform: rotate(90deg);
  -webkit-tap-highlight-color: transparent;

  &.accordion--open {
    transform: rotate(270deg);
  }
}
</style>
