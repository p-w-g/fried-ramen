<script setup lang="ts">
import { computed } from 'vue';
import { sliceColor, sumSlices, type Slice } from '@/charts';

const { slices } = defineProps<{ slices: Slice[] }>();

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Background-coloured space between slices, in viewBox units. */
const GAP = 1.5;

const arcs = computed(() => {
  const total = sumSlices(slices);
  const gap = slices.length > 1 ? GAP : 0;
  let start = 0;
  return slices.map((slice, index) => {
    const length = (slice.cents / total) * CIRCUMFERENCE;
    const arc = {
      color: sliceColor(slice, index),
      dashArray: `${Math.max(length - gap, 0)} ${CIRCUMFERENCE}`,
      dashOffset: -start,
    };
    start += length;
    return arc;
  });
});
</script>

<template>
  <!-- Decorative: the legend next to it, or the link around it, says it in words. -->
  <svg viewBox="0 0 100 100" class="fr__donut" aria-hidden="true">
    <circle class="fr__donut-track" cx="50" cy="50" :r="RADIUS" />
    <circle
      v-for="(arc, index) in arcs"
      :key="index"
      cx="50"
      cy="50"
      :r="RADIUS"
      :stroke="arc.color"
      :stroke-dasharray="arc.dashArray"
      :stroke-dashoffset="arc.dashOffset"
    />
  </svg>
</template>

<style>
.fr__donut {
  display: block;
  /* Slices start at twelve o'clock and run clockwise. */
  transform: rotate(-90deg);

  & circle {
    fill: none;
    stroke-width: 16;
  }

  & .fr__donut-track {
    stroke: var(--divider);
  }
}
</style>
