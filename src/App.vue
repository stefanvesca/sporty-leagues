<script setup lang="ts">
import { onMounted } from 'vue'
import { useLeaguesStore } from './stores/leagues'
import { useTheme } from './composables/useTheme'
import AppHeader from './components/AppHeader.vue'
import FilterToolbar from './components/FilterToolbar.vue'
import DemoDataNotice from './components/DemoDataNotice.vue'
import LeagueList from './components/LeagueList.vue'

const store = useLeaguesStore()
const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
  store.loadLeagues()
})
</script>

<template>
  <AppHeader />
  <main class="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:px-6">
    <h1 class="type-display text-2xl font-extrabold uppercase sm:text-3xl">
      Sports leagues
    </h1>
    <FilterToolbar />
    <DemoDataNotice />
    <LeagueList />
  </main>
  <footer class="mx-auto max-w-5xl px-4 pb-8 pt-4 text-xs text-ink-muted sm:px-6">
    Data from
    <a
      href="https://www.thesportsdb.com"
      target="_blank"
      rel="noopener noreferrer"
      class="underline decoration-brand decoration-2 underline-offset-2 transition-colors hover:text-ink"
    >TheSportsDB</a>
  </footer>
</template>
