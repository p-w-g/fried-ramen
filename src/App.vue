<template>
  <div id="app">
    <expense-list />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ExpenseList from './components/List.vue';

export default defineComponent({
  name: 'App',
  components: {
    ExpenseList
  }
});
</script>
<style lang="scss">
@import '@/assets/main.scss';
</style>
