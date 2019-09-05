<template>
  <div id="app">
    <h1>Can I afford some fancy ramen this month?</h1>
    <List />
  </div>
</template>

<script>
import List from './components/List.vue';

export default {
  name: 'App',
  components: {
    List,
  },
};
</script>
<style src='@/assets/main.css'>
</style>
