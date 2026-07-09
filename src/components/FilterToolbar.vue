<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLeaguesStore } from '../stores/leagues'
import SearchBar from './SearchBar.vue'
import SportFilter from './SportFilter.vue'

const store = useLeaguesStore()
const { searchTerm, selectedSport, availableSports, filteredLeagues, status } = storeToRefs(store)
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
    <SearchBar v-model="searchTerm" />
    <SportFilter
      v-model="selectedSport"
      :sports="availableSports"
    />
    <p
      v-if="status === 'ready'"
      class="shrink-0 text-sm tabular-nums text-ink-muted sm:ml-auto"
      role="status"
    >
      {{ filteredLeagues.length }} {{ filteredLeagues.length === 1 ? 'league' : 'leagues' }}
    </p>
  </div>
</template>
