<script setup lang="ts">
import ExpenseForm from '@/components/form/ExpenseForm.vue';
import ExpenseList from '@/components/list/ExpenseList.vue';
import BaseAccordion from '@/components/shared/BaseAccordion.vue';
import { formatAmount } from '@/domain';
import { useBudgetStore } from '@/stores/budget';

const budget = useBudgetStore();
</script>

<template>
  <div class="fr__page">
    <header class="fr__summary">
      <p class="fr__total">
        <span class="fr__total-label">Total</span>
        <span class="fr__amount">{{ formatAmount(budget.totalCents) }}</span>
      </p>
    </header>
    <BaseAccordion label="Add expense">
      <ExpenseForm />
    </BaseAccordion>
    <ExpenseList />
  </div>
</template>
