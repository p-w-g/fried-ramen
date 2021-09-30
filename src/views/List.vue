<template>
  <div class="fr__grid-container">
    <div class="fr__heading">
      <header>
        <h1>{{ randomTitle }}</h1>
        <the-expense-form />
      </header>
    </div>

    <the-expense-list />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import TheExpenseForm from '@/components/form/ExpenseForm.vue';
import TheExpenseList from '@/components/list/ExpenseWrapper.vue';

const themNomNoms = [
  '🌮 Tuesday.',
  '☕️ run.',
  '🍔 it is.',
  '🍕 Time',
  '🍣 just like that'
];

export default defineComponent({
  name: 'ExpenseList',

  components: { TheExpenseForm, TheExpenseList },

  computed: {
    randomTitle() {
      return themNomNoms[Math.floor(Math.random() * themNomNoms.length)];
    }
  }
});
</script>
