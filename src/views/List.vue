<template>
  <div class="fr__grid-container">
    <div class="fr__heading">
      <header>
        <h1>{{ randomTitle }}</h1>
        <accordion>
          <template #content>
            <expense-form />
          </template>
        </accordion>
      </header>
    </div>

    <expenses-list />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import ExpenseForm from '@/components/form/ExpenseForm.vue';
import ExpensesList from '@/components/list/Expenses.vue';
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

  components: { ExpenseForm, ExpensesList, Accordion },

  computed: {
    randomTitle() {
      return themNomNoms[Math.floor(Math.random() * themNomNoms.length)];
    },
  },
});
</script>
