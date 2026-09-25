<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import BackupPanel from '@/components/form/BackupPanel.vue';
import BudgetRow from '@/components/budgets/BudgetRow.vue';
import { BudgetNameError, useBudgetsStore } from '@/stores/budgets';

const budgets = useBudgetsStore();
budgets.watchAll();
const router = useRouter();

const newName = ref('');
const problem = ref('');

async function create() {
  try {
    const created = await budgets.create(newName.value);
    newName.value = '';
    problem.value = '';
    await router.push({ name: 'budget', query: { budget: created.slug } });
  } catch (error) {
    if (!(error instanceof BudgetNameError)) throw error;
    problem.value = error.message;
  }
}
</script>

<template>
  <div class="fr__grid-container">
    <div class="fr__heading">
      <header>
        <h1>🍱 Budgets</h1>
        <form id="budget-form" class="fr__form" @submit.prevent="create">
          <fieldset class="fr__label-wrapper">
            <div class="fr__label-wrapper">
              <label for="budget-name">New budget</label>
              <input
                id="budget-name"
                v-model="newName"
                type="text"
                class="fr__input-box"
              />
            </div>
            <p v-if="problem" role="alert">{{ problem }}</p>
            <button form="budget-form">Create budget</button>
          </fieldset>
        </form>
      </header>
    </div>

    <div class="fr__content-column">
      <BudgetRow
        v-for="budget in budgets.budgets"
        :key="budget.id"
        :budget="budget"
        :is-only-budget="budgets.budgets.length === 1"
      />
      <BackupPanel />
    </div>
  </div>
</template>
