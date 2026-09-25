<script setup lang="ts">
import BudgetView from './views/BudgetView.vue';
import UpdatePrompt from './components/shared/UpdatePrompt.vue';
import { useBudgetStore } from './stores/budget';

const budget = useBudgetStore();
budget.open();
</script>

<template>
  <div class="content">
    <BudgetView v-if="budget.ready" />
  </div>
  <UpdatePrompt />
</template>
