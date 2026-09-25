<script setup lang="ts">
import BackupPanel from '@/components/form/BackupPanel.vue';
import ExpenseForm from '@/components/form/ExpenseForm.vue';
import ExpenseList from '@/components/list/ExpenseList.vue';
import BaseAccordion from '@/components/shared/BaseAccordion.vue';

const themNomNoms = [
  '🌮 Tuesday!',
  '☕️ run...',
  '🍔🍔🍔 it is.',
  '🍕 all the way',
  '🍣 happens',
];

const randomTitle = themNomNoms[Math.floor(Math.random() * themNomNoms.length)];
</script>

<template>
  <div class="fr__grid-container">
    <div class="fr__heading">
      <header>
        <h1>{{ randomTitle }}</h1>
        <BaseAccordion>
          <template #content>
            <div>
              <ExpenseForm />
              <BackupPanel />
            </div>
          </template>
        </BaseAccordion>
      </header>
    </div>

    <ExpenseList />
  </div>
</template>
