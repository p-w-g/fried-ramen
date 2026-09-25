<script setup lang="ts">
import { computed, ref } from 'vue';
import { fromCents, sumCents } from '@/domain';
import { useBudgetStore } from '@/stores/budget';
import { hoveredDropZone } from './dragAndDrop';
import ExpenseCard from './ExpenseCard.vue';

const { category } = defineProps<{ category: string }>();

const budget = useBudgetStore();
const isOpen = ref(true);

const expenses = computed(() => budget.expensesIn(category));
const total = computed(() => fromCents(sumCents(expenses.value)));
</script>

<template>
  <div
    :data-drop-category="category"
    :class="{ 'fr__drop-zone--hovered': hoveredDropZone === category }"
  >
    <h2
      class="fr__glassy"
      :class="isOpen ? 'fr__glassy--open' : 'fr__glassy--closed'"
    >
      <button
        type="button"
        class="fr__icon-button"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      >
        {{ category }}: {{ total }}
      </button>
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
