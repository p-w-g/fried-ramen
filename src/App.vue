<template>
  <div id="app">
    <expense-list />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ExpenseList from './components/List.vue';
import pkgjson from '../package.json';

console.info('v:', pkgjson.version);
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
