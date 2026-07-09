<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLeaguesStore } from '../stores/leagues'

const store = useLeaguesStore()
const { freeTierLimited, demoMode } = storeToRefs(store)
</script>

<template>
  <div
    v-if="freeTierLimited || demoMode"
    class="flex flex-col gap-2 rounded-card border border-line bg-surface px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
  >
    <p
      v-if="demoMode"
      class="text-ink-muted"
    >
      <span class="mr-2 rounded bg-brand px-1.5 py-0.5 text-xs font-semibold uppercase text-brand-contrast">Demo data</span>
      Showing a bundled snapshot of real TheSportsDB leagues. Badge lookups still hit the live API.
    </p>
    <p
      v-else
      class="text-ink-muted"
    >
      The free API tier currently returns only {{ store.leagues.length }} leagues.
      Load the bundled snapshot to try search and sport filters on the full list.
    </p>

    <button
      v-if="demoMode"
      type="button"
      class="shrink-0 self-start rounded-md border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:border-brand-hover sm:self-auto"
      @click="store.loadLeagues()"
    >
      Back to live API
    </button>
    <button
      v-else
      type="button"
      class="shrink-0 self-start rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-brand-contrast transition-colors hover:bg-brand-hover sm:self-auto"
      @click="store.loadDemoData()"
    >
      Load demo dataset
    </button>
  </div>
</template>
