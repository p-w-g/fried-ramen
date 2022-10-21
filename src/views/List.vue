<template>
  <div class="fr__grid-container">
    <div class="fr__heading">
      <header>
        <h1>{{ randomTitle }}</h1>
        <accordion>
          <template #content>
            <the-expense-form />
          </template>
        </accordion>
      </header>
    </div>

    <the-expense-list />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import TheExpenseForm from '@/components/form/ExpenseForm.vue';
import TheExpenseList from '@/components/list/Expenses.vue';
import Accordion from '@/components/shared/Accordion.vue';

const themNomNoms = [
  '🌮 Tuesday.',
  '☕️ run.',
  '🍔 it is.',
  '🍕 Time',
  '🍣 just like that',
];

export default defineComponent({
  name: 'ExpenseList',

  components: { TheExpenseForm, TheExpenseList, Accordion },

  computed: {
    randomTitle() {
      return themNomNoms[Math.floor(Math.random() * themNomNoms.length)];
    },
  },
});
</script>
