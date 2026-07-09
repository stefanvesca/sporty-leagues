<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useLeaguesStore } from '../stores/leagues'
import LeagueCard from './LeagueCard.vue'

const store = useLeaguesStore()
const { status, error, filteredLeagues, searchTerm, selectedSport } = storeToRefs(store)

const expandedId = ref<string | null>(null)

function toggle(id: string): void {
  expandedId.value = expandedId.value === id ? null : id
}

// A card that gets filtered away shouldn't stay logically expanded.
watch(filteredLeagues, (leagues) => {
  if (expandedId.value && !leagues.some((l) => l.idLeague === expandedId.value)) {
    expandedId.value = null
  }
})
</script>

<template>
  <!-- Loading skeletons -->
  <div
    v-if="status === 'loading' || status === 'idle'"
    class="overflow-hidden rounded-card border border-line bg-surface"
    aria-busy="true"
  >
    <div class="h-10 animate-pulse bg-surface-sunken" />
    <div class="divide-y divide-line">
      <div
        v-for="n in 8"
        :key="n"
        class="flex flex-col justify-center gap-2 px-4 py-3.5"
      >
        <div class="h-3.5 w-1/3 animate-pulse rounded bg-surface-sunken" />
        <div class="h-2.5 w-1/4 animate-pulse rounded bg-surface-sunken" />
      </div>
    </div>
    <span class="sr-only">Loading leagues…</span>
  </div>

  <!-- Load failure -->
  <div
    v-else-if="status === 'error'"
    class="rounded-card border border-line bg-surface px-6 py-10 text-center"
  >
    <p class="text-base font-bold">
      Couldn't load leagues
    </p>
    <p class="mt-1 text-sm text-ink-muted">
      {{ error }}
    </p>
    <button
      type="button"
      class="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-contrast transition-colors hover:bg-brand-hover"
      @click="store.loadLeagues()"
    >
      Try again
    </button>
  </div>

  <!-- No matches -->
  <div
    v-else-if="filteredLeagues.length === 0"
    class="rounded-card border border-line bg-surface px-6 py-10 text-center"
  >
    <p class="text-base font-bold">
      No leagues match
    </p>
    <p class="mt-1 text-sm text-ink-muted">
      <template v-if="searchTerm || selectedSport">
        Try a different name or sport, or clear the filters.
      </template>
      <template v-else>
        The API returned no leagues.
      </template>
    </p>
    <button
      v-if="searchTerm || selectedSport"
      type="button"
      class="mt-4 rounded-md border border-line px-4 py-2 text-sm transition-colors hover:border-brand-hover"
      @click="store.clearFilters()"
    >
      Clear filters
    </button>
  </div>

  <!-- Results: single panel with divided rows, like sportytv's league sections -->
  <section
    v-else
    class="overflow-hidden rounded-card border border-line bg-surface"
  >
    <header class="flex items-center justify-between bg-surface-sunken px-4 py-2.5">
      <h2 class="text-sm font-bold">
        {{ selectedSport || 'All sports' }}
      </h2>
    </header>
    <ul class="divide-y divide-line">
      <li
        v-for="league in filteredLeagues"
        :key="league.idLeague"
      >
        <LeagueCard
          :league="league"
          :expanded="expandedId === league.idLeague"
          @toggle="toggle(league.idLeague)"
        />
      </li>
    </ul>
  </section>
</template>
