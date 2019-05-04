<template>
  <div>
    <h3>All your money goes here</h3>
    <form action="#">
      <label for="account">account: </label>
      <input
        id="account"
        v-model="account"
        type="number"
        placeholder="123..."
        name="srodki"
      >
      <br>
      <label for="cash">cash: </label>
      <input
        id="cash"
        v-model="cash"
        type="number"
        placeholder="123..."
        name="srodki"
      >
      <br>
      <label for="savings">savings: </label>
      <input
        id="savings"
        v-model="savings"
        type="number"
        placeholder="123..."
        name="srodki"
      >
      <br>
      <label for="invoiced">invoiced: </label>
      <input
        id="invoiced"
        v-model="invoiced"
        type="number"
        placeholder="123..."
        name="srodki"
      >
      <br>
      <label for="misc">misc: </label>
      <input
        id="misc"
        v-model="misc"
        type="number"
        placeholder="123..."
        name="srodki"
      >
    </form>
    <div>
      <p><b>Total: </b>{{ total }}</p>
      <p><b>High Liquidity: {{ liquidMore }}</b> stands for: {{ liquidRatioMore }}</p>
      <p><b>Low Liquidity: {{ liquidLess }}</b> stands for: {{ liquidRatioLess }}</p>
      <p><b>Misc:</b> stands for: {{ miscRatio }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Inset',
  data: () => ({
    account: '',
    cash: '',
    savings: '0',
    invoiced: '0',
    misc: '0',
  }),

  computed: {
    total() {
      return parseInt(this.account) + parseInt(this.cash) + parseInt(this.savings) + parseInt(this.invoiced) + parseInt(this.misc);
    },
    liquidMore() {
      return parseInt(this.account) + parseInt(this.cash);
    },
    liquidLess() {
      return parseInt(this.savings) + parseInt(this.invoiced);
    },
    liquidRatioMore() {
      return `${(parseFloat(this.liquidMore / this.total) * 100).toFixed(2)}% of all assets`;
    },
    liquidRatioLess() {
      return `${(parseFloat(this.liquidLess / this.total) * 100).toFixed(2)}% of all assets`;
    },
    miscRatio() {
      return `${((this.misc / this.total) * 100).toFixed(2)}% of all assets`;
    },
  },
};
</script>

<style>
label{
  width: 70px;
  padding: auto;
  text-align: start;
}
</style>
