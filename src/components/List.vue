<template>
  <div>
    <h3>All your costs go here</h3>
    <form
      id="the-form"
      action="#"
      @submit.prevent="addNewTodoTask"
    >
      <input
        id="title"
        v-model="title"
        type="text"
        placeholder="For?"
      >
      <input
        id="description"
        v-model="description"
        type="number"
        placeholder="How much?"
      >
      <button name="the-form">
        Add
      </button>
    </form>
    <div>
      <p>Total: <b>{{ totalCost }}</b></p>
      <article>
        <p
          v-for="(obj, index) in todos"
          :id="obj.id"
          :key="obj.id"
          :title="obj.title"
          class="task-card"
        >
          <b>{{ obj.title }}:</b>
          {{ obj.description }}
          <button @click="remove(index)">
            Remove
          </button>
          <button @click="onHold(index)">
            Freeze it
          </button>
        </p>
      </article>
    </div>
    <hr>
    <div>
      <article>
        Frozen / awaiting
        <p
          v-for="(obj, index) in freeze"
          :id="obj.id"
          :key="obj.id"
          :title="obj.title"
          class="task-card"
        >
          <b>{{ obj.title }}:</b>
          {{ obj.description }}

          <button @click="unFreeze(index)">
            Unfreeze
          </button>
        </p>
      </article>
    </div>
  </div>
</template>

<script>
export default {
  name: 'List',
  data: () => ({
    todos: [],
    freeze: [],
    title: '',
    description: '',
    id: 0,
    isDone: false,
    totalMinus: 0,
  }),
  computed: {
    totalCost() {
      let somekindofaholder = 0;
      this.todos.forEach((element) => {
        somekindofaholder += parseInt(element.description);
      });
      return somekindofaholder;
    },
  },
  mounted() {
    if (localStorage.getItem('todos') && localStorage.getItem('freeze')) {
      try {
        this.todos = JSON.parse(localStorage.getItem('todos'));
        this.freeze = JSON.parse(localStorage.getItem('freeze'));
      } catch (e) {
        localStorage.removeItem('todos');
        localStorage.removeItem('freeze');
      }
    }
  },
  methods: {
    addNewTodoTask() {
      if (this.description === '') return;
      this.todos.push({
        title: this.title,
        description: this.description,
        id: this.id++,
        isDone: false,
      });

      this.resetForm();
      this.saveTodos();
    },
    onHold(index) {
      this.freeze.push(this.todos[index]);
      this.$delete(this.todos, index);
      this.saveTodos();
    },
    unFreeze(index) {
      this.todos.push(this.freeze[index]);
      this.$delete(this.freeze, index);
      this.saveTodos();
    },
    resetForm() {
      this.title = '';
      this.description = '';
    },
    remove(index) {
      this.$delete(this.todos, index);
      this.saveTodos();
    },
    saveTodos() {
      const theListParsed = JSON.stringify(this.todos);
      const onHoldParsed = JSON.stringify(this.freeze);
      localStorage.setItem('todos', theListParsed);
      localStorage.setItem('freeze', onHoldParsed);
    },
  },
};
</script>
<style>
.done {
  background-color: #89b2db;
}
</style>
