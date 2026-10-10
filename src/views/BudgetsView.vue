<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import BudgetRow from '@/components/budgets/BudgetRow.vue';
import CurrencySelect from '@/components/shared/CurrencySelect.vue';
import type { Currency } from '@/domain';
import { BudgetNameError, useBudgetsStore } from '@/stores/budgets';
import { useSettingsStore } from '@/stores/settings';

const budgets = useBudgetsStore();
budgets.watchAll();
const router = useRouter();
const settings = useSettingsStore();

const newName = ref('');
const newCurrency = ref<Currency>();
const problem = ref('');

async function create() {
  try {
    const created = await budgets.create(newName.value, newCurrency.value);
    newName.value = '';
    newCurrency.value = undefined;
    problem.value = '';
    await router.push({ name: 'budget', params: { slug: created.slug } });
  } catch (error) {
    if (!(error instanceof BudgetNameError)) throw error;
    problem.value = error.message;
  }
}
</script>

<template>
  <div class="fr__page">
    <h1>Budgets</h1>
    <form id="budget-form" class="fr__stack" @submit.prevent="create">
      <div class="fr__field-row fr__new-budget">
        <div class="fr__field">
          <label for="budget-name">New budget</label>
          <input id="budget-name" v-model="newName" type="text" />
        </div>
        <CurrencySelect
          v-if="settings.currencyMode"
          id="new-budget-currency"
          v-model="newCurrency"
          label="Currency"
        />
        <button form="budget-form" class="fr__button--primary">
          Create budget
        </button>
      </div>
      <p v-if="problem" role="alert" class="fr__problem">{{ problem }}</p>
    </form>

    <section class="fr__group">
      <h2 class="fr__visually-hidden">Your budgets</h2>
      <p
        v-if="budgets.isLoaded && budgets.budgets.length === 0"
        class="fr__empty"
      >
        No budgets yet. Name one above to start.
      </p>
      <ul class="fr__rows">
        <BudgetRow
          v-for="budget in budgets.budgets"
          :key="budget.id"
          :budget="budget"
        />
      </ul>
    </section>

    <RouterLink
      v-if="settings.currencyMode"
      :to="{ name: 'convert' }"
      class="fr__link-button"
    >
      Currency converter
    </RouterLink>
  </div>
</template>

<style>
/* With a currency picker the button moves below, so the name keeps room. */
.fr__new-budget {
  flex-wrap: wrap;

  & > .fr__field:first-child {
    flex-basis: 10rem;
  }

  & > button {
    margin-left: auto;
  }
}
</style>
