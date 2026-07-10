import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useLeaguesStore } from '../stores/leagues'

export interface FilterState {
  q: string
  sport: string
  country: string
}

/** Pure: URL search string -> filter values. */
export function parseFilters(search: string): FilterState {
  const params = new URLSearchParams(search)
  return {
    q: params.get('q') ?? '',
    sport: params.get('sport') ?? '',
    country: params.get('country') ?? '',
  }
}

/** Pure: filter values -> URL search string ('' when all filters are off). */
export function buildSearch({ q, sport, country }: FilterState): string {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (sport) params.set('sport', sport)
  if (country) params.set('country', country)
  const s = params.toString()
  return s ? `?${s}` : ''
}

/**
 * Two-way sync between the store's filters and the URL query string,
 * so filtered views are shareable and survive a reload. Uses
 * replaceState to avoid polluting history with every keystroke.
 */
export function useUrlFilters(): void {
  const store = useLeaguesStore()
  const { searchTerm, selectedSport, selectedCountry } = storeToRefs(store)

  const initial = parseFilters(window.location.search)
  searchTerm.value = initial.q
  selectedSport.value = initial.sport
  selectedCountry.value = initial.country

  watch([searchTerm, selectedSport, selectedCountry], ([q, sport, country]) => {
    const target = buildSearch({ q, sport, country })
    const current = window.location.search
    if (target !== current) {
      history.replaceState(null, '', `${window.location.pathname}${target || ''}${window.location.hash}`)
    }
  })
}
