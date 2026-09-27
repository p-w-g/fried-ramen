<template>
  <div class="fr__page">
    <div class="fr__segmented fr__chart-tabs">
      <RouterLink :to="{ name: 'overview' }">Overview</RouterLink>
      <RouterLink :to="{ name: 'trends' }">Trends</RouterLink>
    </div>
    <RouterView />
  </div>
</template>

<style>
.fr__chart-tabs {
  margin-top: 1rem;
}
</style>
