<template>
  <!-- TODO:
    - header with title, amount in same level but far to right
    - description in optional body

    - icons to the right of body

-->
  <div class="fr__card">
    <div class="fr__card-header">
      <h3>{{ expense.Expense }}</h3>
      <h4>{{ expense.Amount }}</h4>
    </div>
    <div
      :class="
        expense.description
          ? 'fr__card-body'
          : 'fr__card-body fr__card-body--no-desc'
      "
    >
      <p v-if="expense.description">
        {{ expense.description }}
      </p>
      <ul class="fr__card-options">
        <li>
          <img
            :src="CheckIcon"
            class="fr__button fr__button--expedite"
            @click="remove(expense.Id)"
          />
        </li>
        <li>
          <select v-model="selected" @change="selectLabel()">
            <option value=""></option>
            <option
              v-for="(label, index) in labels"
              :selected="false"
              :value="label"
              :key="index"
            >
              {{ label }}
            </option>
          </select>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import store from '@/store/index';

import CheckIcon from '@/assets/icons/check_circle_outline-24px.svg';

export default defineComponent({
  name: 'TheExpenseCard',

  setup() {
    return {
      CheckIcon,
    };
  },

  props: {
    expense: Object,
  },

  data() {
    return {
      selected: '',
    };
  },

  computed: {
    labels(): Array<string> {
      return store.getters.labels;
    },
  },

  methods: {
    selectLabel() {
      const Label = this.selected;
      const Id = this.expense.Id;
      store.dispatch({
        type: 'labelThisExpenseAction',
        Id,
        Label,
      });
    },

    remove(index: number) {
      store.dispatch({
        type: 'removeThisTaskAction',
        index,
      });
    },

    saveExpenseList() {
      store.dispatch('saveToLocalStorageAction');
    },

    removeAllTasks() {
      store.dispatch('removeAllTasksAction');
    },
  },

  mounted() {
    this.selected = this.expense.Label;
  },
});
</script>

<style lang="scss">
.fr {
  &__card {
    /* From https://css.glass */
    background: rgba(220, 231, 218, 0.8);
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 0 1rem;
    margin: 1rem;
  }
  &__card-header,
  &__card-body {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  &__card-body--no-desc {
    justify-content: flex-end;
  }
}
</style>
