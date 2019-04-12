<template>
  <div>
    <h1>List of food I'd wanna eat this week</h1>
    <p>{{ ramen }}</p>
    <form
      id="the-form"
      action="#"
      @submit.prevent="addNewTodoTask"
    >
      <input
        id="title"
        v-model="title"
        type="text"
        placeholder="Yakiniku"
      >
      <input
        id="occurence"
        v-model="occurence"
        type="text"
        placeholder="sunday perhaps?"
      >
      <button name="the-form">
        SubMe
      </button>
    </form>
    <div>
      <p
        v-for="obj in todos"
        :id="'todo-' + obj.id"
        :key="obj.id"
        class="task-card"
        @click="makeMeDone(obj.id)"
      >
       boring print: title: {{ obj.title }}, occurence: {{ obj.occurence }}, stateDone: {{obj.isDone}}, id: {{obj.id}}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'List',
  props: {
    ramen: String,
  },
  data: () => ({
    todos: [],
    title: '',
    occurence: '',
    id: 0,
    isDone: false,
  }),
  methods: {
    addNewTodoTask() {
      this.todos.push({
        title: this.title,
        occurence: this.occurence,
        id: this.id++,
        isDone: false,
      });

      this.resetForm();
    },
    resetForm() {
      this.title = '';
      this.occurence = '';
    },
    // makeMeDone(event){
    //   this.isDone = true;
    //   console.log("Am I dun?: ", this.isDone, "from: ", event.target.id);
      
    // }
    makeMeDone(passMeAnID){
      this.isDone = true;
      console.log("Am I dun?: ", this.isDone, "from: ", passMeAnID);
      
    }
  },
};
</script>
<style>

.done{
  background-color: #89b2db;
}
</style>
