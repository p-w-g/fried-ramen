<template>
  <div class="fr__content-column">
    <h2>All: {{ totalExpenses }}</h2>
    <expense-card
      v-for="(expense, index) in unassignedExpenses"
      :key="index"
      :expense="expense"
      draggable="true"
      @dragstart="pullCard($event, expense)"
    />
    <expenses-wrapper
      v-for="(label, index) in labels"
      :label="label"
      :key="index"
    />
    <img
      :src="FlameIcon"
      class="fr__button fr__button--advance"
      @click="removeAllTasks()"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import store from '@/store/index';
// eslint-disable-next-line no-unused-vars
import { expenseModel } from '@/models';

import ExpensesWrapper from '@/components/list/ExpensesWrapper.vue';
import FlameIcon from '@/assets/icons/whatshot-24px.svg';
import ExpenseCard from '@/components/list/ExpenseCard.vue';

export default defineComponent({
  name: 'ExpensesList',

  setup() {
    return {
      FlameIcon,
    };
  },

  components: {
    ExpensesWrapper,
    ExpenseCard,
  },

  computed: {
    totalExpenses(): number {
      return store.getters.totalTotal;
    },
    labels(): Array<string> {
      return store.getters.labels;
    },
    unassignedExpenses(): Array<expenseModel> {
      return store.getters.filterUnassigned;
    },

    postponedExpensesTotal(): number {
      return store.getters.frozenTotal;
    },
    postponedExpenses(): number {
      return store.getters.filterFrozen;
    },
    activeExpensesTotal(): number {
      return store.getters.activeTotal;
    },
    activeExpenses(): number {
      return store.getters.filterActive;
    },
  },

  mounted() {
    store.dispatch('loadJsonAttemptAction');
  },

  methods: {
    removeAllTasks() {
      store.dispatch('removeAllTasksAction');
    },

    pullCard(event: DragEvent, card: expenseModel) {
      event.dataTransfer.dropEffect = 'move';
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('cardID', card.Id.toString());
    },
  },
});
</script>
