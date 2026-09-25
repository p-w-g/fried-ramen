<script setup lang="ts">
import { computed, ref } from 'vue';
import { sumAmounts } from '@/domain';
import { useBudgetStore } from '@/stores/budget';
import { droppedExpenseId } from './dragAndDrop';
import ExpenseCard from './ExpenseCard.vue';

const { category } = defineProps<{ category: string }>();

const budget = useBudgetStore();
const isOpen = ref(true);

const expenses = computed(() => budget.expensesIn(category));
const total = computed(() => sumAmounts(expenses.value));

function assignDropped(event: DragEvent) {
  const id = droppedExpenseId(event);
  if (id !== null) budget.assignCategory(id, category);
}
</script>

<template>
  <div @drop="assignDropped" @dragenter.prevent @dragover.prevent>
    <h2
      class="fr__glassy"
      :class="isOpen ? 'fr__glassy--open' : 'fr__glassy--closed'"
      @click="isOpen = !isOpen"
    >
      {{ category }}: {{ total }}
    </h2>
    <transition name="fade" appear>
      <div v-show="isOpen">
        <ExpenseCard
          v-for="expense in expenses"
          :key="expense.id"
          :expense="expense"
        />
      </div>
    </transition>
  </div>
</template>
