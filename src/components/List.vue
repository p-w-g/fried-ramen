<template>
  <div>
    <h2>All your expenses go here</h2>
    <form
      id="expenses-form"
      @submit.prevent="addNewExpense"
    >
      <input
        id="expense"
        v-model="expense"
        type="text"
        placeholder="Expense?"
      >
      <input
        id="amount"
        v-model="amount"
        type="number"
        placeholder="Amount?"
      >
      <button name="expenses-form">
        Add
      </button>
    </form>
    <div>
      <summary>
        <p>
          Total:
          <b>{{ totalExpenses }}</b>
        </p>
        <p>
          Active:
          <b>{{ activeExpensesTotal }}</b>
        </p>
        <p>
          Frozen:
          <b>{{ postponedExpensesTotal }}</b>
        </p>
      </summary>
      <article>
        <p
          v-for="obj in activeExpenses"
          :key="obj.id"
          :expense="obj.expense"
          class="expense-card"
        >
          <b>{{ obj.expense }}:</b>
          {{ obj.amount }}
          <button @click="remove(obj.id)">
            Expedite
          </button>
          <button @click="freeze(obj.id)">
            Postpone
          </button>
        </p>
      </article>
    </div>
    <hr>
    <div>
      <article>
        Postponed
        <p
          v-for="obj in postponedExpenses"
          :key="obj.id"
          :expense="obj.expense"
          class="expense-card"
        >
          <b>{{ obj.expense }}:</b>
          {{ obj.amount }}
          <button @click="advance(obj.id)">
            Advance
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
    expense: '',
    amount: '',
    isCurrentExpensePostponed: false,
    id: 0,
  }),

  computed: {
    totalExpenses() {
      return this.reducer(this.todos);
    },
    postponedExpensesTotal() {
      return this.reducer(this.postponedExpenses);
    },
    postponedExpenses() {
      return this.todos.filter(u => u.isCurrentExpensePostponed);
    },
    activeExpensesTotal() {
      return this.reducer(this.activeExpenses);
    },
    activeExpenses() {
      return this.todos.filter(u => !u.isCurrentExpensePostponed);
    },
  },

  mounted() {
    if (localStorage.getItem('todos')) {
      this.loadTodos();
    }
  },

  methods: {
    addNewExpense() {
      return this.amount !== ''
        ? (this.newObjectPush(), this.resetForm(), this.saveTodos())
        : null;
    },
    newObjectPush() {
      this.todos.push({
        expense: this.expense,
        amount: this.amount,
        isCurrentExpensePostponed: false,
        id: this.id++,
      });
    },
    freeze(index) {
      this.todos[index].isCurrentExpensePostponed = true;
      this.saveTodos();
    },
    advance(index) {
      this.todos[index].isCurrentExpensePostponed = false;
      this.saveTodos();
    },
    parser10(notAStrinObviously) {
      return parseInt(notAStrinObviously, 10);
    },
    reducer(arrayOfObjects) {
      return arrayOfObjects.reduce(
        (accumulator, currentObject) => accumulator + this.parser10(currentObject.amount),
        0,
      );
    },
    resetForm() {
      this.expense = '';
      this.amount = '';
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
