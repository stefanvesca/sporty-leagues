<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLeaguesStore } from '../stores/leagues'
import { useTheme } from '../composables/useTheme'
import logoWhite from '../assets/logo-white.svg'

const store = useLeaguesStore()
const { selectedSport, availableSports, filteredLeagues, status } = storeToRefs(store)
const { theme, toggleTheme } = useTheme()
</script>

<template>
  <header class="sticky top-0 z-10">
    <!-- Red app bar: logo + sport rail, as on sportytv -->
    <div class="bg-header">
      <div class="mx-auto flex max-w-5xl items-center gap-4 px-4 sm:px-6">
        <img
          :src="logoWhite"
          alt="Sporty"
          class="h-5 w-auto shrink-0"
        >
        <nav
          aria-label="Filter by sport"
          class="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ul class="flex items-stretch">
            <li
              v-for="sport in ['', ...availableSports]"
              :key="sport || 'all'"
            >
              <button
                type="button"
                class="whitespace-nowrap px-3 py-4 text-sm text-white transition-[font-weight,box-shadow] hover:shadow-[inset_0_-3px_0_0_rgba(255,255,255,0.5)]"
                :class="{ 'font-bold text-white shadow-[inset_0_-3px_0_0_white]': selectedSport === sport }"
                :aria-pressed="selectedSport === sport"
                @click="selectedSport = sport"
              >
                {{ sport || 'All' }}
              </button>
            </li>
          </ul>
        </nav>
        <button
          type="button"
          class="shrink-0 rounded-full p-2 text-white transition-colors hover:bg-white/15"
          :aria-label="`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`"
          @click="toggleTheme"
        >
          <span aria-hidden="true">{{ theme === 'light' ? '☾' : '☀' }}</span>
        </button>
      </div>
    </div>

    <!-- Charcoal subnav: section title + live result count -->
    <div class="bg-subnav">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5 sm:px-6">
        <h1 class="text-sm font-bold text-white">
          Leagues
        </h1>
        <p
          v-if="status === 'ready'"
          class="text-xs tabular-nums text-white/70"
          role="status"
        >
          {{ filteredLeagues.length }} {{ filteredLeagues.length === 1 ? 'league' : 'leagues' }}
        </p>
      </div>
    </div>
  </header>
</template>
