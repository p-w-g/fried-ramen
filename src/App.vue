<template>
  <div id="app">
    <expense-list />
    <footern />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ExpenseList from './views/List.vue';
import Footern from './components/shared/Footern.vue';

export default defineComponent({
  name: 'App',
  components: {
    ExpenseList,
    Footern,
  },
});
</script>
<style lang="scss">
@import '@/assets/main.scss';
</style>
