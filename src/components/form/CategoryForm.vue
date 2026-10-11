<script setup lang="ts">
import { computed, ref } from 'vue';
import { useBudgetStore } from '@/stores/budget';
import { clearIfUnchanged } from './clearIfUnchanged';

const budget = useBudgetStore();

const category = ref('');

/** Only these can go: deleting one in use would orphan its expenses. */
const unused = computed(() =>
  budget.categories.filter((name) => budget.expensesIn(name).length === 0),
);

async function saveCategory() {
  const sent = category.value;
  await budget.addCategory(sent);
  clearIfUnchanged(category, sent);
}

async function deleteCategory(event: Event) {
  const select = event.target as HTMLSelectElement;
  await budget.deleteCategoryIfEmpty(select.value);
  select.value = '';
}
</script>

<template>
  <div class="fr__stack">
    <form id="labels-form" class="fr__field-row" @submit.prevent="saveCategory">
      <div class="fr__field">
        <label for="label">New category</label>
        <input id="label" v-model="category" type="text" />
      </div>
      <button form="labels-form">Add</button>
    </form>
    <div v-if="unused.length" class="fr__field">
      <label for="removal-menu">Delete an unused category</label>
      <select id="removal-menu" @change="deleteCategory">
        <option value="" disabled selected>Choose one</option>
        <option v-for="name in unused" :key="name" :value="name">
          {{ name }}
        </option>
      </select>
    </div>
  </div>
</template>
