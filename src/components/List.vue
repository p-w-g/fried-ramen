<template>
  <div>
    <header>
    <h1>{{ randomTitle }}</h1>
    <h2>All your expenses go here</h2>
    <form
      id="expenses-form"
      class="fr--form"
      @submit.prevent="addNewExpense"
    >
      <input
        id="expense"
        v-model="expense"
        type="text"
        placeholder="Expense?"
        class="fr--input-box"
      >
      <input
        id="amount"
        v-model="amount"
        type="number"
        placeholder="Amount?"
        class="fr--input-box"
      >
      <button
        name="expenses-form"
        class="fr--button"
      >
        Add
      </button>
    </form>
    </header>
    <div>
      <article
        v-show="activeExpenses.length > 0"
        class="fr--content-column"
      >
        Active <b>{{ activeExpensesTotal }}</b>

        <p
          v-for="obj in activeExpenses"
          :key="obj.id"
          :expense="obj.expense"
          class="expense-card"
        >
          <b>{{ obj.expense }}:</b>
          {{ obj.amount }}
          <button
            class="fr--button__expedite"
            @click="remove(obj.id)"
          >
            Expedite
          </button>
          <button
            class="fr--button__postpone"
            @click="freeze(obj.id)"
          >
            Postpone
          </button>
        </p>
      </article>
    </div>

    <div>
      <article
        v-show="postponedExpenses.length > 0"
        class="fr--content-column"
      >
        Postponed <b>{{ postponedExpensesTotal }}</b>
        <p
          v-for="obj in postponedExpenses"
          :key="obj.id"
          :expense="obj.expense"
          class="expense-card"
        >
          <b>{{ obj.expense }}:</b>
          {{ obj.amount }}
          <button
            class="fr--button__advance"
            @click="advance(obj.id)"
          >
            Advance
          </button>
        </p>
      </article>
    </div>
    <summary
      v-show="totalExpensesToggle"
      class="fr--content-column"
    >
      <p>
        Total:
        <b>{{ totalExpenses }}</b>
      </p>
    </summary>
  </div>
</template>

<script>
let themNomNoms = [
  'Burger Tiem!',
  'Coffee run...',
  'Am I stuck with ramen again?'
]

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
    totalExpensesToggle() {
      return !((this.postponedExpenses.length < 1 || this.activeExpenses.length < 1));
    },
    randomTitle(){
      return themNomNoms[Math.floor(Math.random() * themNomNoms.length)];
    }
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
