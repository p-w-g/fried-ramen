<script setup lang="ts">
import { computed, ref } from 'vue';
import LineChart from '@/components/charts/LineChart.vue';
import { runningTotal, type Period } from '@/charts';
import { useBudgetStore } from '@/stores/budget';

const budget = useBudgetStore();

const by = ref<Period>('day');
const points = computed(() => runningTotal(budget.postings, by.value));
</script>

<template>
  <section class="fr__chart-page">
    <h2 class="fr__subheading">Total over time</h2>
    <div class="fr__segmented" role="group" aria-label="Show by">
      <button type="button" :aria-pressed="by === 'day'" @click="by = 'day'">
        Daily
      </button>
      <button
        type="button"
        :aria-pressed="by === 'month'"
        @click="by = 'month'"
      >
        Monthly
      </button>
    </div>
    <p v-if="points.length === 0" class="fr__empty">
      No history yet: it starts with the next expense you add or change.
    </p>
    <LineChart v-else :key="by" :points="points" :by="by" />
  </section>
</template>
