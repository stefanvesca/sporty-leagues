<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLeaguesStore } from '../stores/leagues'
import SearchBar from './SearchBar.vue'
import FilterSelect from './FilterSelect.vue'

const store = useLeaguesStore()
const { searchTerm, selectedSport, selectedCountry, availableSports, availableCountries } =
  storeToRefs(store)
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
    <SearchBar v-model="searchTerm" />
    <FilterSelect
      v-model="selectedSport"
      :options="availableSports"
      all-label="All sports"
      label="Filter by sport"
    />
    <FilterSelect
      v-if="availableCountries.length"
      v-model="selectedCountry"
      :options="availableCountries"
      all-label="All countries"
      label="Filter by country"
    />
  </div>
</template>
