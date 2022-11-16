<template>
  <div>
    <slot name="header" />
    <transition name="fade" appear>
      <slot v-if="isOpen" name="content"></slot>
    </transition>
    <input
      class="accordion"
      type="image"
      :src="Chevron"
      alt="Accordion toggle"
      @click="toggleAccordion"
      :class="isOpen ? 'accordion--open' : 'accordion--close'"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Chevron from '@/assets/icons/chevron_right.svg';

export default defineComponent({
  name: 'fr-accordion',
  setup() {
    return {
      Chevron,
    };
  },
  data: () => ({
    isOpen: false,
  }),
  methods: {
    toggleAccordion() {
      this.isOpen = !this.isOpen;
    },
  },
});
</script>
<style lang="scss" scoped>
.accordion {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
  transform: rotate(90deg);
  -webkit-tap-highlight-color: transparent;

  &--open {
    transform: rotate(270deg);
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.fade-enter-from,
.fade-leave-to {
  transform: translateY(-50px);
  opacity: 0;
}
</style>
