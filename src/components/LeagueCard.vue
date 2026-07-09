<script setup lang="ts">
import type { League } from '../api/types'
import SeasonBadge from './SeasonBadge.vue'

defineProps<{
  league: League
  expanded: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>

<template>
  <article
    class="overflow-hidden rounded-card border border-line bg-surface transition-colors"
    :class="expanded ? 'border-brand' : 'hover:border-ink-muted/50'"
  >
    <button
      type="button"
      class="group flex w-full items-center gap-3 px-4 py-3 text-left"
      :aria-expanded="expanded"
      @click="$emit('toggle')"
    >
      <!-- Signature red rule: grows on hover, locks in when expanded -->
      <span
        aria-hidden="true"
        class="w-0.5 self-stretch rounded-full transition-all"
        :class="expanded ? 'bg-brand' : 'bg-line group-hover:bg-brand-hover'"
      />
      <span class="min-w-0 flex-1">
        <span class="type-display block text-base font-bold uppercase leading-snug">
          {{ league.strLeague }}
        </span>
        <span class="mt-0.5 block text-xs text-ink-muted">
          {{ league.strSport }}
          <template v-if="league.strLeagueAlternate">
            · {{ league.strLeagueAlternate }}
          </template>
        </span>
      </span>
      <svg
        class="h-4 w-4 shrink-0 text-ink-muted transition-transform"
        :class="{ 'rotate-180': expanded }"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <path d="m3 5 3 3 3-3" />
      </svg>
    </button>

    <SeasonBadge
      v-if="expanded"
      :league-id="league.idLeague"
      :league-name="league.strLeague"
    />
  </article>
</template>
