<template>
  <div id="app">
    <h1>Fried Ramen budget planner.</h1>
    <hr>
    <Inset />
    <hr>
    <List />
    <hr>
    <h3>Summary Component NA yet</h3>
  </div>
</template>

<script>
import List from './components/List.vue';
import Inset from './components/Inset.vue';

export default {
  name: 'App',
  components: {
    List,
    Inset,
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
