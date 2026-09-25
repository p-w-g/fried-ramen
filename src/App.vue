<script setup lang="ts">
import BudgetView from './views/BudgetView.vue';
import UpdatePrompt from './components/shared/UpdatePrompt.vue';
import { useBudgetStore } from './stores/budget';
import { useBackupStore } from './stores/backup';

const budget = useBudgetStore();
budget.open();
useBackupStore().checkUp();
</script>

<template>
  <div class="content">
    <BudgetView v-if="budget.ready" />
  </div>
  <UpdatePrompt />
</template>
