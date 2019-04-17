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
        placeholder="The job"
      >
      <input
        id="description"
        v-model="description"
        type="text"
        placeholder="the description"
      >
      <button name="the-form">
        SubMe
      </button>
    </form>
    <div>
      <article
        v-for="(obj, index) in todos"
        :id="obj.id"
        :key="obj.id"
        :title="obj.title"
        class="task-card"
      >
        <h3>
          {{ obj.title }}:
        </h3>
        <p>
          {{ obj.description }}
        </p>
        <button @click="remove(index)">
          DeleteMe
        </button>
      </article>
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
    description: '',
    id: 0,
    isDone: false,
  }),
  mounted() {
    if (localStorage.getItem('todos')) {
      try {
        this.todos = JSON.parse(localStorage.getItem('todos'));
      } catch (e) {
        localStorage.removeItem('todos');
      }
    }
  },
  methods: {
    addNewTodoTask() {
      this.todos.push({
        title: this.title,
        description: this.description,
        id: this.id++,
        isDone: false,
      });

      this.resetForm();
      this.saveTodos();
    },
    resetForm() {
      this.title = '';
      this.description = '';
    },
    // toggleDone(event){
    //   this.isDone = true;
    //   console.log('Is done?: ', this.isDone, 'from: ', event.target.id);

    // }
    toggleDone(passMeAnID) {
      this.isDone = true;
      console.log('Is done?: ', this.isDone, 'from: ', passMeAnID);
    },
    remove(index) {
      this.$delete(this.todos, index);
      this.saveTodos();
    },
    saveTodos() {
      const parsed = JSON.stringify(this.todos);
      localStorage.setItem('todos', parsed);
    },
  },
};
</script>
<style>
.done {
  background-color: #89b2db;
}
</style>
