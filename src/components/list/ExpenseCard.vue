<template>
  <div :class="!editable ? 'fr__card' : 'fr__card fr__card--edit-mode'">
    <div class="fr__card-header" v-if="editable">
      <input
        :placeholder="expense.Expense"
        v-model="Expense"
        type="text"
        class="fr__input-box"
      />
      <input
        :placeholder="expense.Amount"
        v-model.number="Amount"
        type="number"
        class="fr__input-box"
      />
    </div>
    <div class="fr__card-header" v-else>
      <h3>{{ expense.Expense }}</h3>
      <h4>{{ expense.Amount }}</h4>
    </div>
    <div
      :class="
        expense.Description
          ? 'fr__card-body'
          : 'fr__card-body fr__card-body--no-desc'
      "
    >
      <p v-if="expense.Description && !editable">
        {{ expense.Description }}
      </p>
      <input
        v-if="editable"
        :placeholder="expense.Description"
        v-model="Description"
        type="text"
        class="fr__input-box"
      />
      <ul class="fr__card-options">
        <li>
          <img
            :src="CheckIcon"
            class="fr__button fr__button--expedite"
            @click="remove(expense.Id)"
          />
        </li>
        <li v-if="!editable">
          <img
            :src="EditIcon"
            class="fr__button fr__button--expedite"
            @click="startEditing()"
          />
        </li>
        <li v-if="editable">
          <img
            :src="SaveIcon"
            class="fr__button fr__button--expedite"
            @click="stopEditing()"
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
import EditIcon from '@/assets/icons/edit_square.svg';
import SaveIcon from '@/assets/icons/save_as.svg';

export default defineComponent({
  name: 'TheExpenseCard',

  setup() {
    return {
      CheckIcon,
      EditIcon,
      SaveIcon,
    };
  },

  props: {
    expense: Object,
  },

  data() {
    return {
      selected: '',
      editable: false,
      Expense: '',
      Amount: '',
      Description: '',
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

    startEditing() {
      this.editable = true;
    },

    stopEditing() {
      this.editable = false;

      store.dispatch({
        type: 'updateExpenseAction',
        Expense: this.Expense,
        Amount: this.Amount,
        Description: this.Description,
        Id: this.expense.Id,
      });
    },
  },

  mounted() {
    this.selected = this.expense.Label;
    this.Expense = this.expense.Expense;
    this.Amount = this.expense.Amount;
    this.Description = this.expense.Description;
  },
});
</script>

<style lang="scss">
.fr {
  &__card {
    /* From https://css.glass */
    background: rgba(210, 221, 239, 0.3);
    border-radius: 16px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 0 1rem;
    margin: 1rem;

    &--edit-mode {
      background: rgb(218, 225, 231);
    }

    &-options {
      margin-top: 5px;
      margin-bottom: 5px;
    }
  }

  &__card-header {
    > h3,
    > h4 {
      margin-top: 5px;
      margin-bottom: 5px;
    }

    > input {
      margin: 5px;
    }
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
