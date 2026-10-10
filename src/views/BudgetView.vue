<script setup lang="ts">
import ExpenseForm from '@/components/form/ExpenseForm.vue';
import ExpenseList from '@/components/list/ExpenseList.vue';
import BaseAccordion from '@/components/shared/BaseAccordion.vue';
import CurrencySelect from '@/components/shared/CurrencySelect.vue';
import { useBudgetStore } from '@/stores/budget';
import { useBudgetsStore } from '@/stores/budgets';
import { useMoneyStore } from '@/stores/money';
import { useSettingsStore } from '@/stores/settings';
import type { Currency } from '@/domain';

const budget = useBudgetStore();
const budgets = useBudgetsStore();
const money = useMoneyStore();
const settings = useSettingsStore();

function setCurrency(currency: Currency | undefined) {
  if (budget.budget) void budgets.setCurrency(budget.budget.id, currency);
}
</script>

<template>
  <div class="fr__page fr__page--split">
    <div class="fr__pane fr__pane--pinned">
      <header class="fr__summary">
        <p class="fr__total">
          <span class="fr__total-label">Total</span>
          <span class="fr__amount">{{ money.total(budget.expenses) }}</span>
        </p>
        <div v-if="settings.currencyMode" class="fr__field-row fr__currencies">
          <CurrencySelect
            id="budget-currency"
            label="Currency"
            :model-value="budget.budget?.currency"
            @update:model-value="setCurrency"
          />
        </div>
      </header>
      <BaseAccordion label="Add expense">
        <ExpenseForm />
      </BaseAccordion>
    </div>
    <ExpenseList />
  </div>
</template>

<style>
.fr__currencies {
  margin-top: 1rem;
}
</style>
