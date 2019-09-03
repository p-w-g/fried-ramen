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

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
