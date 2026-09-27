<script setup lang="ts">
import { computed } from 'vue';
import DonutChart from '@/components/charts/DonutChart.vue';
import {
  categoryShares,
  sliceColor,
  sumSlices,
  wholePercentages,
} from '@/charts';
import { formatAmount } from '@/domain';
import { useBudgetStore } from '@/stores/budget';

const budget = useBudgetStore();

const shares = computed(() => categoryShares(budget.expenses));
const shownCents = computed(() => sumSlices(shares.value.slices));
const percentages = computed(() => wholePercentages(shares.value.slices));
</script>

<template>
  <section class="fr__chart-page">
    <h2 class="fr__subheading">Where the money went</h2>
    <p v-if="shares.slices.length === 0" class="fr__empty">
      Nothing spent yet.
    </p>
    <figure v-else class="fr__overview">
      <div class="fr__overview-donut">
        <DonutChart :slices="shares.slices" />
        <p class="fr__overview-total">
          <span class="fr__amount">
            {{ formatAmount(shownCents)
            }}<span v-if="shares.hasNegatives" aria-hidden="true">*</span>
          </span>
          <span class="fr__total-label">Total</span>
        </p>
      </div>
      <ul class="fr__legend">
        <li v-for="(slice, index) in shares.slices" :key="index">
          <span
            class="fr__swatch"
            :style="{ background: sliceColor(slice, index) }"
          />
          <span class="fr__legend-label">{{ slice.label }}</span>
          <span class="fr__amount">{{ formatAmount(slice.cents) }}</span>
          <span class="fr__legend-share">{{ percentages[index] }}%</span>
        </li>
      </ul>
      <figcaption v-if="shares.hasNegatives" class="fr__hint">
        * negative amounts are not shown
      </figcaption>
    </figure>
  </section>
</template>

<style>
.fr__overview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin: 0;
}

/* The total sits in the donut's hole. */
.fr__overview-donut {
  display: grid;
  width: min(16rem, 100%);

  & > * {
    grid-area: 1 / 1;
  }
}

.fr__overview-total {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;

  & .fr__amount {
    font-size: 1.5rem;
    font-weight: 600;
  }
}

.fr__legend {
  align-self: stretch;

  & li {
    display: grid;
    grid-template-columns: auto 1fr auto 3rem;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--divider);
  }
}

.fr__swatch {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 3px;
}

.fr__legend-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fr__legend-share {
  color: var(--text-muted);
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
