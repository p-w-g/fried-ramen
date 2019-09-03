<template>
  <div>
    <h3>All your expenses go here</h3>
    <form
      id="expenses-form"
      action="#"
      @submit.prevent="addNewTodoTask"
    >
      <input
        id="task"
        v-model="task"
        type="text"
        placeholder="For?"
      >
      <input
        id="value"
        v-model="value"
        type="number"
        placeholder="How much?"
      >
      <button name="expenses-form">
        Add
      </button>
    </form>
    <div>
      <p>Total: <b>{{ totalCost }}</b></p>
      <p>Active: <b>{{ activeCosts }}</b></p>
      <p>Frozen: <b>{{ frozenCosts }}</b></p>

      <article>
        <p
          v-for="obj in activeTasks"
          :key="obj.id"
          :task="obj.task"
          class="task-card"
        >
          <b>{{ obj.task }}:</b>
          {{ obj.value }}
          <button @click="remove(obj.id)">
            Paid off
          </button>
          <button @click="freeze(obj.id)">
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
          v-for="obj in frozenTasks"
          :key="obj.id"
          :task="obj.task"
          class="task-card"
        >
          <b>{{ obj.task }}:</b>
          {{ obj.value }}

          <button @click="defrost(obj.id)">
            defrost
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
    task: '',
    value: '',
    totalMinus: 0,
    isCurrentTaskFrozen: false,
    id: 0,
  }),

  computed: {
    totalCost() {
      return this.reducer(this.todos);
    },
    frozenCosts() {
      return this.reducer(this.frozenTasks);
    },
    frozenTasks() {
      return this.todos.filter(u => u.isCurrentTaskFrozen);
    },
    activeCosts() {
      return this.reducer(this.activeTasks);
    },
    activeTasks() {
      return this.todos.filter(u => !u.isCurrentTaskFrozen);
    },
  },

  mounted() {
    if (localStorage.getItem('todos')) {
      this.loadTodos();
    }
  },

  methods: {
    addNewTodoTask() {
      return (this.value !== '') ? (this.newObjectPush(), this.resetForm(), this.saveTodos()) : null;
    },
    newObjectPush() {
      this.todos.push({
        task: this.task,
        value: this.value,
        isCurrentTaskFrozen: false,
        id: this.id++,
      });
    },
    freeze(index) {
      this.todos[index].isCurrentTaskFrozen = true;
      this.saveTodos();
    },
    defrost(index) {
      this.todos[index].isCurrentTaskFrozen = false;
      this.saveTodos();
    },
    parser10(notAStrinObviously) {
      return parseInt(notAStrinObviously, 10);
    },
    reducer(arrayOfObjects) {
      return arrayOfObjects.reduce(
        (accumulator, currentObject) => accumulator + this.parser10(currentObject.value), 0,
      );
    },
    resetForm() {
      this.task = '';
      this.value = '';
    },
    remove(index) {
      this.$delete(this.todos[index]);
      this.saveTodos();
    },
    saveTodos() {
      localStorage.setItem('todos', JSON.stringify(this.todos));
    },
    loadTodos() {
      try {
        this.todos = JSON.parse(localStorage.getItem('todos'));
        this.id = this.todos.length;
      } catch (e) {
        localStorage.removeItem('todos');
      }
    },
  },

};
</script>
<style>
.done {
  background-color: #89b2db;
}
</style>
