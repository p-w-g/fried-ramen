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
      <div class="fr__field-row">
        <div class="fr__field">
          <label for="budget-name">New budget</label>
          <input id="budget-name" v-model="newName" type="text" />
        </div>
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

    <BackupPanel />
  </div>
</template>
