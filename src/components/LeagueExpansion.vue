<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { fetchLeagueDetails, fetchSeasonBadges } from '../api/sportsDb'
import type { LeagueDetails, SeasonBadge } from '../api/types'

const props = defineProps<{
  leagueId: string
  leagueName: string
}>()

const status = ref<'loading' | 'ready' | 'error'>('loading')
const seasons = ref<SeasonBadge[]>([])
const seasonIndex = ref(0)
const details = ref<LeagueDetails | null>(null)
const showFullDescription = ref(false)

const season = computed(() => seasons.value[seasonIndex.value])

const website = computed(() => {
  const raw = details.value?.strWebsite
  if (!raw) return null
  return { href: raw.startsWith('http') ? raw : `https://${raw}`, label: raw.replace(/^www\./, '') }
})

const metaEntries = computed(() => {
  const d = details.value
  if (!d) return []
  const entries: { label: string; value: string }[] = []
  if (d.strCountry) entries.push({ label: 'Country', value: d.strCountry })
  if (d.intFormedYear) entries.push({ label: 'Formed', value: d.intFormedYear })
  if (d.strCurrentSeason) entries.push({ label: 'Current season', value: d.strCurrentSeason })
  return entries
})

async function load(): Promise<void> {
  status.value = 'loading'
  showFullDescription.value = false
  try {
    // Both cached + deduped; prefetch on hover usually makes these instant.
    const [seasonList, leagueDetails] = await Promise.all([
      fetchSeasonBadges(props.leagueId),
      fetchLeagueDetails(props.leagueId).catch(() => null),
    ])
    seasons.value = seasonList.filter((s) => s.strBadge)
    seasonIndex.value = 0
    details.value = leagueDetails
    status.value = 'ready'
  } catch {
    status.value = 'error'
  }
}

watch(() => props.leagueId, load, { immediate: true })
</script>

<template>
  <div class="border-t border-line bg-surface-raised px-4 py-4">
    <template v-if="status === 'loading'">
      <div
        class="flex items-center gap-4"
        aria-busy="true"
      >
        <div
          class="h-20 w-20 animate-pulse rounded-lg bg-surface-sunken"
          aria-hidden="true"
        />
        <div class="flex-1 space-y-2">
          <div
            class="h-4 w-24 animate-pulse rounded bg-surface-sunken"
            aria-hidden="true"
          />
          <div
            class="h-3 w-3/4 animate-pulse rounded bg-surface-sunken"
            aria-hidden="true"
          />
        </div>
        <span class="sr-only">Loading league details…</span>
      </div>
    </template>

    <template v-else-if="status === 'ready'">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
        <!-- Season badge browser -->
        <div
          v-if="season"
          class="flex shrink-0 items-center gap-2 self-center sm:self-start"
        >
          <button
            type="button"
            class="rounded-full p-1.5 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
            :disabled="seasonIndex === 0"
            aria-label="Previous season"
            @click="seasonIndex--"
          >
            <svg
              class="h-4 w-4 rotate-90"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path d="m3 5 3 3 3-3" />
            </svg>
          </button>
          <div class="w-28 text-center">
            <img
              :src="`${season.strBadge}/small`"
              :alt="`${leagueName} badge, ${season.strSeason} season`"
              class="mx-auto h-20 w-20 object-contain drop-shadow-sm"
              loading="lazy"
            >
            <p class="mt-1 text-sm font-bold">
              {{ season.strSeason }}
            </p>
            <p class="text-xs text-ink-muted">
              Season {{ seasonIndex + 1 }} of {{ seasons.length }}
            </p>
          </div>
          <button
            type="button"
            class="rounded-full p-1.5 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
            :disabled="seasonIndex === seasons.length - 1"
            aria-label="Next season"
            @click="seasonIndex++"
          >
            <svg
              class="h-4 w-4 -rotate-90"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path d="m3 5 3 3 3-3" />
            </svg>
          </button>
        </div>
        <p
          v-else
          class="shrink-0 self-center text-sm text-ink-muted sm:self-start sm:pt-1"
        >
          No season badge available.
        </p>

        <!-- League details -->
        <div class="min-w-0 flex-1">
          <dl
            v-if="metaEntries.length"
            class="flex flex-wrap gap-x-5 gap-y-1"
          >
            <div
              v-for="entry in metaEntries"
              :key="entry.label"
              class="text-sm"
            >
              <dt class="inline text-ink-muted">
                {{ entry.label }}:
              </dt>
              <dd class="inline font-medium">
                {{ entry.value }}
              </dd>
            </div>
            <div
              v-if="website"
              class="text-sm"
            >
              <dt class="inline text-ink-muted">
                Website:
              </dt>
              <dd class="inline">
                <a
                  :href="website.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-medium underline decoration-brand decoration-2 underline-offset-2 transition-colors hover:text-brand"
                >{{ website.label }}</a>
              </dd>
            </div>
          </dl>

          <template v-if="details?.strDescriptionEN">
            <p
              class="mt-2 text-sm leading-relaxed text-ink-muted"
              :class="{ 'line-clamp-4': !showFullDescription }"
            >
              {{ details.strDescriptionEN }}
            </p>
            <button
              type="button"
              class="mt-1 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
              :aria-expanded="showFullDescription"
              @click="showFullDescription = !showFullDescription"
            >
              {{ showFullDescription ? 'Show less' : 'Read more' }}
            </button>
          </template>
          <p
            v-else-if="!metaEntries.length && !website"
            class="text-sm text-ink-muted"
          >
            No further details available for this league.
          </p>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="flex items-center justify-center gap-4">
        <p class="text-sm text-ink-muted">
          Couldn't load league details.
        </p>
        <button
          type="button"
          class="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-brand-contrast transition-colors hover:bg-brand-hover"
          @click="load"
        >
          Retry
        </button>
      </div>
    </template>
  </div>
</template>
