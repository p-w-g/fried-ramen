<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Period, Point } from '@/charts';
import { formatAmount, formatCompactAmount } from '@/domain';

const { points, by } = defineProps<{ points: Point[]; by: Period }>();

/** The point a finger or pointer is on; the latest one otherwise. */
const scrubbed = ref<number | null>(null);
const shownIndex = computed(() => scrubbed.value ?? points.length - 1);
const shown = computed(() => points[shownIndex.value]!);

/** Zero always shows, so a dip below it reads as one. */
const low = computed(() => Math.min(0, ...points.map((point) => point.cents)));
const high = computed(() => {
  const top = Math.max(0, ...points.map((point) => point.cents));
  return top === low.value ? low.value + 1 : top;
});

const xOf = (index: number) =>
  points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
const yOf = (cents: number) =>
  100 - ((cents - low.value) / (high.value - low.value)) * 100;

const line = computed(() =>
  points.map((point, index) => `${xOf(index)},${yOf(point.cents)}`).join(' '),
);

const dayLabel = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
});
const monthLabel = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  year: 'numeric',
});
function labelOf(period: string) {
  const [year, month, day = 1] = period.split('-').map(Number);
  const date = new Date(year!, month! - 1, day);
  return (by === 'day' ? dayLabel : monthLabel).format(date);
}

function scrub(event: PointerEvent) {
  const plot = event.currentTarget as HTMLElement;
  const { left, width } = plot.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (event.clientX - left) / width));
  scrubbed.value = Math.round(ratio * (points.length - 1));
}
</script>

<template>
  <figure class="fr__trend">
    <p class="fr__trend-readout">
      <span class="fr__amount">{{ formatAmount(shown.cents) }}</span>
      <span class="fr__total-label">{{ labelOf(shown.period) }}</span>
    </p>
    <div
      class="fr__trend-plot"
      @pointermove="scrub"
      @pointerdown="scrub"
      @pointerleave="scrubbed = null"
    >
      <span class="fr__trend-scale">{{ formatCompactAmount(high) }}</span>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line class="fr__trend-grid" x1="0" x2="100" :y1="0" :y2="0" />
        <line
          class="fr__trend-baseline"
          x1="0"
          x2="100"
          :y1="yOf(0)"
          :y2="yOf(0)"
        />
        <polyline class="fr__trend-line" :points="line" />
      </svg>
      <span
        class="fr__trend-marker"
        :style="{
          left: `${xOf(shownIndex)}%`,
          top: `${yOf(shown.cents)}%`,
        }"
      />
    </div>
    <div class="fr__trend-axis" aria-hidden="true">
      <span>{{ labelOf(points[0]!.period) }}</span>
      <span>{{ labelOf(points.at(-1)!.period) }}</span>
    </div>
    <!-- A table ignores a 1px height, so the hiding goes on a wrapper. -->
    <div class="fr__visually-hidden">
      <table>
        <caption>
          Total over time, by
          {{
            by
          }}
        </caption>
        <tr v-for="point in points" :key="point.period">
          <th scope="row">{{ labelOf(point.period) }}</th>
          <td>{{ formatAmount(point.cents) }}</td>
        </tr>
      </table>
    </div>
  </figure>
</template>

<style>
.fr__trend {
  margin: 0;
}

.fr__trend-readout {
  display: flex;
  flex-direction: column;
  /* Room for the scale label that sits above the plot. */
  margin: 0 0 2rem;

  & .fr__amount {
    font-size: 1.5rem;
    font-weight: 600;
  }
}

.fr__trend-plot {
  position: relative;
  height: 12rem;
  /* A sideways drag scrubs the line; an upright one still scrolls the page. */
  touch-action: pan-y;

  & svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  & line,
  & polyline {
    fill: none;
    vector-effect: non-scaling-stroke;
  }
}

.fr__trend-grid {
  stroke: var(--divider);
  stroke-width: 1;
}

.fr__trend-baseline {
  stroke: var(--control-border);
  stroke-width: 1;
}

.fr__trend-line {
  stroke: var(--accent);
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.fr__trend-marker {
  position: absolute;
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 2px var(--bg);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.fr__trend-scale {
  position: absolute;
  top: 0;
  left: 0;
  transform: translateY(-100%);
  font-size: 0.75rem;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.fr__trend-axis {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
