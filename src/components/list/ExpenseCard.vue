<template>
  <!-- TODO:
    - header with title, amount in same level but far to right
    - description in optional body

    - icons to the right of body

-->
  <div class="fr__card-header">
    <h3>{{ obj.Expense }}</h3>
    <h4>{{ obj.Amount }}</h4>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import store from '@/store/index';

// import RevertIcon from '@/assets/icons/history-24px.svg';
// import ChillIcon from '@/assets/icons/ac_unit-24px.svg';
// import CheckIcon from '@/assets/icons/check_circle_outline-24px.svg';

export default defineComponent({
  name: 'TheExpenseCard',

  setup() {
    return {
      // RevertIcon,
      // ChillIcon,
      // CheckIcon,
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
