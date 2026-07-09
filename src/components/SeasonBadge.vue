<script setup lang="ts">
import { ref, watch } from 'vue'
import { fetchSeasonBadges } from '../api/sportsDb'
import type { SeasonBadge } from '../api/types'

const props = defineProps<{
  leagueId: string
  leagueName: string
}>()

const status = ref<'loading' | 'ready' | 'empty' | 'error'>('loading')
const badge = ref<SeasonBadge | null>(null)

async function load(): Promise<void> {
  status.value = 'loading'
  try {
    const seasons = await fetchSeasonBadges(props.leagueId)
    const withBadge = seasons.find((season) => season.strBadge)
    if (withBadge) {
      badge.value = withBadge
      status.value = 'ready'
    } else {
      status.value = 'empty'
    }
  } catch {
    status.value = 'error'
  }
}

watch(() => props.leagueId, load, { immediate: true })
</script>

<template>
  <div class="flex min-h-28 items-center justify-center gap-4 border-t border-line bg-surface-raised px-4 py-4">
    <template v-if="status === 'loading'">
      <div
        class="h-20 w-20 animate-pulse rounded-lg bg-surface-sunken"
        aria-hidden="true"
      />
      <div
        class="h-4 w-24 animate-pulse rounded bg-surface-sunken"
        aria-hidden="true"
      />
      <span class="sr-only">Loading season badge…</span>
    </template>

    <template v-else-if="status === 'ready' && badge">
      <img
        :src="badge.strBadge ?? undefined"
        :alt="`${leagueName} season badge`"
        class="h-20 w-20 object-contain drop-shadow-sm"
        loading="lazy"
      >
      <div>
        <p class="text-lg font-bold">
          {{ badge.strSeason }}
        </p>
        <p class="text-xs text-ink-muted">
          Season badge
        </p>
      </div>
    </template>

    <p
      v-else-if="status === 'empty'"
      class="text-sm text-ink-muted"
    >
      No season badge available for this league.
    </p>

    <template v-else>
      <p class="text-sm text-ink-muted">
        Couldn't load the badge.
      </p>
      <button
        type="button"
        class="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-brand-contrast transition-colors hover:bg-brand-hover"
        @click="load"
      >
        Retry
      </button>
    </template>
  </div>
</template>
