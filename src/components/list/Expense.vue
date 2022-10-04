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
  </td>
  <td>
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
      CheckIcon,
    };
  },

  props: {
    obj: Object,
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
      const Id = this.obj.Id;
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
    this.selected = this.obj.Label;
  },
});
</script>
