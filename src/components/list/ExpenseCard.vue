<script setup lang="ts">
import { ref } from 'vue';
import { fromCents, type Expense, type ExpenseDraft } from '@/domain';
import { useBudgetStore } from '@/stores/budget';
import { useDragToCategory } from './dragAndDrop';
import CheckIcon from '@/assets/icons/check_circle_outline-24px.svg';
import EditIcon from '@/assets/icons/edit_square.svg';
import SaveIcon from '@/assets/icons/save_as.svg';

const { expense } = defineProps<{ expense: Expense }>();

const budget = useBudgetStore();

/** Only exists while editing, and is always copied from the current expense. */
const draft = ref<ExpenseDraft | null>(null);

function startEditing() {
  draft.value = {
    name: expense.name,
    amount: fromCents(expense.amountCents),
    description: expense.description,
  };
}

function saveEdit() {
  if (!draft.value) return;
  budget.updateExpense(expense.id, {
    ...draft.value,
    amount: Number(draft.value.amount) || 0,
  });
  draft.value = null;
}

function selectCategory(event: Event) {
  const category = (event.target as HTMLSelectElement).value;
  budget.assignCategory(expense.id, category || null);
}

const drag = useDragToCategory((category) =>
  budget.assignCategory(expense.id, category),
);

function startDrag(event: PointerEvent) {
  if (!draft.value) drag.onPointerDown(event);
}
</script>

<template>
  <div
    class="fr__card"
    :class="{
      'fr__card--edit-mode': draft,
      'fr__card--dragging': drag.isDragging.value,
    }"
    :style="
      drag.isDragging.value
        ? `transform: translate(${drag.offset.x}px, ${drag.offset.y}px)`
        : undefined
    "
    @pointerdown="startDrag"
  >
    <div v-if="draft" class="fr__card-header">
      <input
        v-model="draft.name"
        :placeholder="expense.name"
        type="text"
        class="fr__input-box"
      />
      <input
        v-model.number="draft.amount"
        :placeholder="String(fromCents(expense.amountCents))"
        type="number"
        step="0.01"
        class="fr__input-box"
      />
    </div>
    <div v-else class="fr__card-header">
      <h3>{{ expense.name }}</h3>
      <h4>{{ fromCents(expense.amountCents) }}</h4>
    </div>
    <div
      class="fr__card-body"
      :class="{ 'fr__card-body--no-desc': !expense.description }"
    >
      <p v-if="expense.description && !draft">
        {{ expense.description }}
      </p>
      <input
        v-if="draft"
        v-model="draft.description"
        :placeholder="expense.description"
        type="text"
        class="fr__input-box"
      />
      <ul class="fr__card-options">
        <li>
          <img
            v-if="!draft"
            :src="CheckIcon"
            class="fr__button fr__button--expedite"
            @click="budget.completeExpense(expense.id)"
          />
        </li>
        <li v-if="!draft">
          <img
            :src="EditIcon"
            class="fr__button fr__button--expedite"
            @click="startEditing"
          />
        </li>
        <li v-if="draft">
          <img
            :src="SaveIcon"
            class="fr__button fr__button--expedite"
            @click="saveEdit"
          />
        </li>
        <li>
          <select :value="expense.category ?? ''" @change="selectCategory">
            <option value=""></option>
            <option v-for="name in budget.categories" :key="name" :value="name">
              {{ name }}
            </option>
          </select>
        </li>
      </ul>
    </div>
  </div>
</template>

<style>
.fr__card {
  /* From https://css.glass */
  background: rgba(210, 221, 239, 0.3);
  border-radius: var(--radius);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: var(--glass-border);
  padding: 0 1rem;
  margin: 1rem;

  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;

  &.fr__card--edit-mode {
    background: var(--glass-steel);
    -webkit-user-select: auto;
    user-select: auto;
  }

  &.fr__card--dragging {
    position: relative;
    z-index: 1;
    pointer-events: none;
    opacity: 0.85;
    box-shadow: var(--glass-shadow);
  }
}

.fr__card-options {
  margin-top: 5px;
  margin-bottom: 5px;
}

.fr__card-header {
  & > h3,
  & > h4 {
    margin-top: 5px;
    margin-bottom: 5px;
  }

  & > input {
    margin: 5px;
  }
}

.fr__card-header,
.fr__card-body {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.fr__card-body--no-desc {
  justify-content: flex-end;
}
</style>
