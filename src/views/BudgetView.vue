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
          <CurrencySelect
            v-if="money.currency"
            id="display-currency"
            label="Show in"
            none-label="Its own"
            :model-value="settings.displayCurrency"
            @update:model-value="settings.setDisplayCurrency"
          />
        </div>
        <p v-if="money.rate" class="fr__hint fr__rate-note">
          Converted at 1 {{ money.rate.base }} = {{ money.rate.rate }}
          {{ money.rate.quote }}, rate from {{ money.rate.date }}. Amounts are
          typed in {{ money.rate.base }}.
        </p>
        <p v-else-if="money.isRateMissing" role="alert" class="fr__problem">
          No exchange rate yet, so this shows {{ money.currency }}. Connect to
          the internet once to get one.
        </p>
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

.fr__summary > p:not(.fr__total) {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
}
</style>
