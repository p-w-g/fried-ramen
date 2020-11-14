<template>
  <div id="app">
    <expense-list />
  </div>
</template>

<script>
import ExpenseList from './components/List.vue';

export default {
  name: 'App',
  components: {
    ExpenseList,
  },
};
</script>
<style lang='scss'>
@import '@/assets/main.scss'
</style>
