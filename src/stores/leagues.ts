import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { fetchAllLeagues, fetchLeagueDetails } from '../api/sportsDb'
import type { League } from '../api/types'

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

// Below this count we assume the free-tier cap kicked in and offer demo data.
const FREE_TIER_CAP = 5

// all_leagues has no country field; when the list is this small it's cheap
// to backfill each league from lookupleague so the country filter works live.
const ENRICH_MAX = 10

export const useLeaguesStore = defineStore('leagues', () => {
  const leagues = shallowRef<League[]>([])
  const status = ref<LoadStatus>('idle')
  const error = ref<string | null>(null)

  const searchTerm = ref('')
  const selectedSport = ref('')
  const selectedCountry = ref('')
  const demoMode = ref(false)

  const availableSports = computed(() =>
    [...new Set(leagues.value.map((league) => league.strSport))].sort(),
  )

  const availableCountries = computed(() =>
    [...new Set(leagues.value.map((l) => l.strCountry).filter((c): c is string => !!c))].sort(),
  )

  const filteredLeagues = computed(() => {
    const query = searchTerm.value.trim().toLowerCase()
    return leagues.value.filter((league) => {
      if (selectedSport.value && league.strSport !== selectedSport.value) {
        return false
      }
      if (selectedCountry.value && league.strCountry !== selectedCountry.value) {
        return false
      }
      if (!query) return true
      return (
        league.strLeague.toLowerCase().includes(query) ||
        (league.strLeagueAlternate ?? '').toLowerCase().includes(query)
      )
    })
  })

  /** True when the live API returned the capped free-tier response. */
  const freeTierLimited = computed(
    () => !demoMode.value && status.value === 'ready' && leagues.value.length <= FREE_TIER_CAP,
  )

  async function enrichCountries(): Promise<void> {
    const current = leagues.value
    if (!current.length || current.length > ENRICH_MAX) return
    if (current.every((l) => l.strCountry)) return
    const enriched = await Promise.all(
      current.map(async (league) => {
        if (league.strCountry) return league
        try {
          const details = await fetchLeagueDetails(league.idLeague)
          return { ...league, strCountry: details?.strCountry ?? null }
        } catch {
          return league
        }
      }),
    )
    // Only apply if the list hasn't been swapped (e.g. demo mode) meanwhile.
    if (leagues.value === current) {
      leagues.value = enriched
    }
  }

  async function loadLeagues(): Promise<void> {
    status.value = 'loading'
    error.value = null
    try {
      leagues.value = await fetchAllLeagues()
      demoMode.value = false
      status.value = 'ready'
      void enrichCountries()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Unknown error'
      status.value = 'error'
    }
  }

  async function loadDemoData(): Promise<void> {
    status.value = 'loading'
    error.value = null
    const { default: demoLeagues } = await import('../data/leagues.fallback.json')
    leagues.value = demoLeagues as League[]
    demoMode.value = true
    status.value = 'ready'
  }

  function clearFilters(): void {
    searchTerm.value = ''
    selectedSport.value = ''
    selectedCountry.value = ''
  }

  return {
    leagues,
    status,
    error,
    searchTerm,
    selectedSport,
    selectedCountry,
    demoMode,
    availableSports,
    availableCountries,
    filteredLeagues,
    freeTierLimited,
    loadLeagues,
    loadDemoData,
    enrichCountries,
    clearFilters,
  }
})
