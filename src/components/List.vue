<template>
  <div class="fr__grid-container">
    <div class="fr__heading">
      <header>
        <h1>{{ randomTitle }}</h1>
        <form
          id="expenses-form"
          class="fr__form"
          @submit.prevent="addNewExpense"
        >
          <fieldset>
            <div class="fr__label-wrapper">
              <label for="expense">Expense</label>
              <input
                id="expense"
                v-model="expense"
                type="text"
                class="fr__input-box"
              >
            </div>
            <div class="fr__label-wrapper">
              <label for="amount">Amount</label>
              <input
                id="amount"
                v-model="amount"
                type="number"
                class="fr__input-box"
              >
            </div>
            <button
              hidden
              aria-hidden="true"
            />

            <add-icon
              name="expenses-form"
              class="fr__button"
              @click="addNewExpense"
            />
          </fieldset>
        </form>
      </header>
    </div>

    <div class="fr__content-column">
      <table>
        <thead>
          <tr>
            <th>
              Active:
            </th>
            <th>
              <b>{{ activeExpensesTotal }}</b>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(obj, index) in activeExpenses"
            :key="index"
            :expense="obj.expense"
          >
            <td>
              <b>{{ obj.expense }}</b>
            </td>
            <td>
              {{ obj.amount }}
            </td>
            <td>
              <check-icon
                class="fr__button fr__button--expedite"
                @click="remove(obj.id)"
              />

              <chill-icon
                class="fr__button fr__button--postpone"
                @click="freeze(obj.id)"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <table>
        <thead>
          <tr>
            <th>
              Postponed:
            </th>
            <th>
              <b>{{ postponedExpensesTotal }}</b>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(obj, index) in postponedExpenses"
            :key="index"
            :expense="obj.expense"
          >
            <td>
              <b>{{ obj.expense }}</b>
            </td>
            <td>
              {{ obj.amount }}
            </td>
            <td>
              <flame-icon
                class="fr__button fr__button--advance"
                @click="advance(obj.id)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import FlameIcon from '../assets/icons/whatshot-24px.svg';
import ChillIcon from '../assets/icons/ac_unit-24px.svg';
import CheckIcon from '../assets/icons/check_circle_outline-24px.svg';
import AddIcon from '../assets/icons/add-24px.svg';

const themNomNoms = [
  'Am famished.',
  'Coffee run.',
  'Burgers it is.',
  'Pizza Time',
];

export default {
  name: 'ExpenseList',
  components: {
    FlameIcon,
    ChillIcon,
    CheckIcon,
    AddIcon,
  },
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
      return !(
        this.postponedExpenses.length < 1 || this.activeExpenses.length < 1
      );
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
        ? (this.newObjectPush(), this.resetForm(), this.saveExpenseList())
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
        if (index === this.expenseList[i].id) {
          this.expenseList[i].isCurrentExpensePostponed = true;
        }
      }

      this.saveExpenseList();
    },
    advance(index) {
      for (let i = 0; i < this.expenseList.length; i++) {
        if (index === this.expenseList[i].id) {
          this.expenseList[i].isCurrentExpensePostponed = false;
        }
      }

      this.saveExpenseList();
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
        if (index === this.expenseList[i].id) {
          this.$delete(this.expenseList, i);
        }
      }
      this.saveExpenseList();
    },
    saveExpenseList() {
      localStorage.setItem('expenseList', JSON.stringify(this.expenseList));
    },
    loadexpenseList() {
      try {
        this.expenseList = JSON.parse(localStorage.getItem('expenseList'));
      } catch (e) {
        localStorage.removeItem('expenseList');
      }
    },
  },
};
</script>
