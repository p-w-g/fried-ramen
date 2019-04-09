<template>
  <div>
    <h1>List component</h1>
    <p>{{ ramen }}</p>
    <form 
      v-on:submit.prevent
      action="#"
      id="the-form"
    >
    <input 
      type="text"
      v-model="title" 
      placeholder="Just anything">
    <button name="the-form"></button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'List',
  props: {
    ramen: String,
    title: String,
  },
  
methods: {
  debug (event) {
    console.log(event.target.name)
  }
} 
};
</script>
