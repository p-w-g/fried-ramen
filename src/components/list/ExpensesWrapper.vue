<script setup lang="ts">
import { computed, ref } from 'vue';
import { formatAmount, sumCents } from '@/domain';
import AppIcon from '@/components/shared/AppIcon.vue';
import Chevron from '@/assets/icons/chevron_right.svg';
import { useBudgetStore } from '@/stores/budget';
import { hoveredDropZone } from './dragAndDrop';
import ExpenseCard from './ExpenseCard.vue';

const { category } = defineProps<{ category: string }>();

const budget = useBudgetStore();
const isOpen = ref(true);

const expenses = computed(() => budget.expensesIn(category));
const total = computed(() => formatAmount(sumCents(expenses.value)));
</script>

<template>
  <section
    :data-drop-category="category"
    class="fr__group"
    :class="{ 'fr__drop-zone--hovered': hoveredDropZone === category }"
  >
    <h2 class="fr__group-heading">
      <button
        type="button"
        class="fr__group-toggle"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      >
        <AppIcon
          :src="Chevron"
          class="fr__chevron"
          :class="{ 'fr__chevron--open': isOpen }"
        />
        <span class="fr__group-name">{{ category }}</span>
        <span class="fr__amount">{{ total }}</span>
      </button>
    </h2>
    <transition name="fade" appear>
      <ul v-show="isOpen" class="fr__rows">
        <ExpenseCard
          v-for="expense in expenses"
          :key="expense.id"
          :expense="expense"
        />
      </ul>
    </transition>
  </section>
</template>
