<script setup lang="ts">
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import ExpenseForm from '@/components/form/ExpenseForm.vue';
import ExpenseList from '@/components/list/ExpenseList.vue';
import BaseAccordion from '@/components/shared/BaseAccordion.vue';
import { useBudgetStore } from '@/stores/budget';

const themNomNoms = [
  '🌮 Tuesday!',
  '☕️ run...',
  '🍔🍔🍔 it is.',
  '🍕 all the way',
  '🍣 happens',
];

const randomTitle = themNomNoms[Math.floor(Math.random() * themNomNoms.length)];

const route = useRoute();
const budget = useBudgetStore();

watch(
  () => route.query.budget,
  (slug) => {
    if (typeof slug === 'string') budget.open(slug);
  },
  { immediate: true },
);
</script>

<template>
  <div v-if="budget.status === 'open'" class="fr__grid-container">
    <div class="fr__heading">
      <header>
        <h1>{{ randomTitle }}</h1>
        <BaseAccordion>
          <template #content>
            <ExpenseForm />
          </template>
        </BaseAccordion>
      </header>
    </div>

    <ExpenseList />
  </div>
  <div v-else-if="budget.status === 'missing'" class="fr__grid-container">
    <div class="fr__heading">
      <h1>🍜 No such budget</h1>
    </div>
    <div class="fr__content-column">
      <p>There is no budget called “{{ route.query.budget }}”.</p>
      <RouterLink :to="{ name: 'budgets' }" class="fr__link-button">
        Go to budgets
      </RouterLink>
    </div>
  </div>
</template>
