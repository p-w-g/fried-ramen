<template>
  <footer class="fr-footer">
    <button disabled="disabled">1</button>
    <button disabled="disabled">2</button>
    <button disabled="disabled">3</button>
    <button disabled="disabled">4</button>
  </footer>
</template>

<script>
export default {
  name: 'fr-footer',
};
</script>

<style lang="scss">
.fr-footer {
  display: flex;
  position: sticky;
  top: 100vh;
  border-radius: 16px;
  background-color: white;
  margin-top: 1em;

  > button {
    flex-grow: 1;
    margin: auto;
  }
}
</style>
