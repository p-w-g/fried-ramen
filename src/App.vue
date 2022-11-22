<template>
  <div class="content">
    <expense-list />
  </div>
  <footern />
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
