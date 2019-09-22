<template>
  <div class="fr--grid-container">
    <div class="fr--heading">
      <header>
        <h1>{{ randomTitle }}</h1>
        <h2 v-if="activeExpenses < 1 && postponedExpenses < 1">
          Here be your expenses
        </h2>
        <summary
          v-else
          class=" fr--summary"
        >
          <p v-if="activeExpenses.length > 0">
            Active: <b>{{ activeExpensesTotal }}</b>
          </p>

          <p v-if="postponedExpenses.length > 0">
            Postponed: <b>{{ postponedExpensesTotal }}</b>
          </p>
        </summary>
        <form
          id="expenses-form"
          class="fr--form"
          @submit.prevent="addNewExpense"
        >
          <fieldset>
            <div class="fr--label-wrapper">
              <label for="expense">Expense</label>
              <input
                id="expense"
                v-model="expense"
                type="text"
                class="fr--input-box"
              >
            </div>
            <div class="fr--label-wrapper">
              <label for="amount">Amount</label>
              <input
                id="amount"
                v-model="amount"
                type="number"
                class="fr--input-box"
              >
            </div>
            <button
              name="expenses-form"
              class="fr--button"
            >
              Add
            </button>
          </fieldset>
        </form>
      </header>
    </div>

    <div
      class="fr--content-column"
    >
      <article class="fr--inline-flex">
        <p
          v-for="(obj, index) in activeExpenses"
          :key="index"
          :expense="obj.expense"
          class="expense-card "
        >
          <b>{{ obj.expense }}:</b>
          {{ obj.amount }}
          <button
            class="fr--button fr--button__expedite"
            @click="remove(obj.id)"
          >
            Expedite
          </button>
          <button
            class="fr--button fr--button__postpone"
            @click="freeze(obj.id)"
          >
            Postpone
          </button>
        </p>
      </article>

      <article class="fr--inline-flex">
        <p
          v-for="(obj, index) in postponedExpenses"
          :key="index"
          :expense="obj.expense"
          class="expense-card"
        >
          <b>{{ obj.expense }}:</b>
          {{ obj.amount }}
          <button
            class="fr--button fr--button__advance"
            @click="advance(obj.id)"
          >
            Advance
          </button>
        </p>
      </article>
    </div>
  </div>
</template>

<script>
const themNomNoms = [
  'Am famished.',
  'Coffee run.',
  'Burgers it is.',
];

export default {
  name: 'List',
  data: () => ({
    expenseList: [],
    expense: '',
    amount: '',
    isCurrentExpensePostponed: false,
    id: 0,
  }),

  computed: {
    totalExpenses() {
      return this.reducer(this.expenseList);
    },
    postponedExpensesTotal() {
      return this.reducer(this.postponedExpenses);
    },
    postponedExpenses() {
      return this.expenseList.filter(u => u.isCurrentExpensePostponed);
    },
    activeExpensesTotal() {
      return this.reducer(this.activeExpenses);
    },
    activeExpenses() {
      return this.expenseList.filter(u => !u.isCurrentExpensePostponed);
    },
    totalExpensesToggle() {
      return !((this.postponedExpenses.length < 1 || this.activeExpenses.length < 1));
    },
    randomTitle() {
      return themNomNoms[Math.floor(Math.random() * themNomNoms.length)];
    },
  },

  mounted() {
    if (localStorage.getItem('expenseList')) {
      this.loadexpenseList();
    }
  },

  methods: {
    addNewExpense() {
      return this.amount !== ''
        ? (this.newObjectPush(), this.resetForm(), this.saveexpenseList())
        : null;
    },
    newObjectPush() {
      this.expenseList.push({
        expense: this.expense,
        amount: this.amount,
        isCurrentExpensePostponed: false,
        id: this.id++,
      });
    },
    freeze(index) {
      for (let i = 0; i < this.expenseList.length; i++) {
        if (
          index === this.expenseList[i].id
        ) {
          this.expenseList[i].isCurrentExpensePostponed = true;
        }
      }

      this.saveexpenseList();
    },
    advance(index) {
      for (let i = 0; i < this.expenseList.length; i++) {
        if (
          index === this.expenseList[i].id
        ) {
          this.expenseList[i].isCurrentExpensePostponed = false;
        }
      }

      this.saveexpenseList();
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
      for (let i = 0; i < this.expenseList.length; i++) {
        if (
          index === this.expenseList[i].id
        ) {
          this.$delete(this.expenseList, i);
        }
      }
      this.saveexpenseList();
    },
    saveexpenseList() {
      localStorage.setItem('expenseList', JSON.stringify(this.expenseList));
    },
    loadexpenseList() {
      try {
        this.expenseList = JSON.parse(localStorage.getItem('expenseList'));
        // this.id = this.expenseList.length;
      } catch (e) {
        localStorage.removeItem('expenseList');
      }
    },
  },
};
</script>
