<template>
  <td>
    <b>{{ obj.Expense }}</b>
  </td>
  <td>
    {{ obj.Amount }}
  </td>
  <td>
    <img
      :src="CheckIcon"
      class="fr__button fr__button--expedite"
      @click="remove(obj.Id)"
    />

    <!-- <img
      :src="ChillIcon"
      class="fr__button fr__button--postpone"
      @click="freeze(obj.Id)"
    />
  </td> -->
    <!-- <td>
    <img
      :src="RevertIcon"
      class="fr__button fr__button--advance"
      @click="advance(obj.Id)"
    />
  </td> -->
  </td>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import store from '@/store/index';

import RevertIcon from '@/assets/icons/history-24px.svg';
import ChillIcon from '@/assets/icons/ac_unit-24px.svg';
import CheckIcon from '@/assets/icons/check_circle_outline-24px.svg';
export default defineComponent({
  name: 'TheExpense',

  setup() {
    return {
      RevertIcon,
      ChillIcon,
      CheckIcon
    };
  },
  props: {
    obj: Object
  },
  methods: {
    freeze(index: number) {
      store.dispatch({
        type: 'freezeThisExpenseAction',
        index
      });
    },
    advance(index: number) {
      store.dispatch({
        type: 'advanceThisExpenseAction',
        index
      });
    },
    remove(index: number) {
      store.dispatch({
        type: 'removeThisTaskAction',
        index
      });
    },
    saveExpenseList() {
      store.dispatch('saveToLocalStorageAction');
    },
    removeAllTasks() {
      store.dispatch('removeAllTasksAction');
    }
  }
});
</script>
