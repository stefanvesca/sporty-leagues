import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useLeaguesStore } from '../src/stores/leagues'
import type { League } from '../src/api/types'

const sample: League[] = [
  { idLeague: '1', strLeague: 'English Premier League', strSport: 'Soccer', strLeagueAlternate: 'EPL', strCountry: 'England' },
  { idLeague: '2', strLeague: 'NBA', strSport: 'Basketball', strLeagueAlternate: 'National Basketball Association', strCountry: 'United States' },
  { idLeague: '3', strLeague: 'Formula 1', strSport: 'Motorsport', strLeagueAlternate: 'F1', strCountry: '' },
  { idLeague: '4', strLeague: 'La Liga', strSport: 'Soccer', strLeagueAlternate: '', strCountry: 'Spain' },
]

vi.mock('../src/api/sportsDb', () => ({
  fetchAllLeagues: vi.fn(async () => sample),
  fetchLeagueDetails: vi.fn(async () => null),
}))

describe('leagues store', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
  })

  it('loads leagues and derives the sport list, sorted', async () => {
    const store = useLeaguesStore()
    await store.loadLeagues()

    expect(store.status).toBe('ready')
    expect(store.leagues).toHaveLength(4)
    expect(store.availableSports).toEqual(['Basketball', 'Motorsport', 'Soccer'])
  })

  it('derives the country list, sorted, skipping empty values', async () => {
    const store = useLeaguesStore()
    await store.loadLeagues()

    expect(store.availableCountries).toEqual(['England', 'Spain', 'United States'])
  })

  it('filters by search term, case-insensitively', async () => {
    const store = useLeaguesStore()
    await store.loadLeagues()

    store.searchTerm = 'premier'
    expect(store.filteredLeagues.map((l) => l.strLeague)).toEqual(['English Premier League'])
  })

  it('matches the alternate league name too', async () => {
    const store = useLeaguesStore()
    await store.loadLeagues()

    store.searchTerm = 'national basketball'
    expect(store.filteredLeagues.map((l) => l.strLeague)).toEqual(['NBA'])
  })

  it('filters by sport', async () => {
    const store = useLeaguesStore()
    await store.loadLeagues()

    store.selectedSport = 'Soccer'
    expect(store.filteredLeagues.map((l) => l.strLeague)).toEqual([
      'English Premier League',
      'La Liga',
    ])
  })

  it('filters by country', async () => {
    const store = useLeaguesStore()
    await store.loadLeagues()

    store.selectedCountry = 'Spain'
    expect(store.filteredLeagues.map((l) => l.strLeague)).toEqual(['La Liga'])
  })

  it('combines search, sport, and country filters', async () => {
    const store = useLeaguesStore()
    await store.loadLeagues()

    store.selectedSport = 'Soccer'
    store.selectedCountry = 'England'
    store.searchTerm = 'league'
    expect(store.filteredLeagues.map((l) => l.strLeague)).toEqual(['English Premier League'])
  })

  it('clears all filters', async () => {
    const store = useLeaguesStore()
    await store.loadLeagues()

    store.searchTerm = 'x'
    store.selectedSport = 'Soccer'
    store.selectedCountry = 'Spain'
    store.clearFilters()

    expect(store.searchTerm).toBe('')
    expect(store.selectedSport).toBe('')
    expect(store.selectedCountry).toBe('')
    expect(store.filteredLeagues).toHaveLength(4)
  })

  it('backfills missing countries from lookupleague', async () => {
    const { fetchLeagueDetails } = await import('../src/api/sportsDb')
    vi.mocked(fetchLeagueDetails).mockResolvedValue({
      idLeague: '3',
      strLeague: 'Formula 1',
      strSport: 'Motorsport',
      strCountry: 'World',
      strDescriptionEN: null,
      intFormedYear: null,
      strWebsite: null,
      strCurrentSeason: null,
    })

    const store = useLeaguesStore()
    await store.loadLeagues()
    await store.enrichCountries()

    expect(store.leagues.find((l) => l.idLeague === '3')?.strCountry).toBe('World')
    // Leagues that already had a country are not re-fetched.
    expect(vi.mocked(fetchLeagueDetails)).not.toHaveBeenCalledWith('1')
  })

  it('flags the capped free-tier response', async () => {
    const store = useLeaguesStore()
    await store.loadLeagues()

    // 4 sample leagues <= cap of 5
    expect(store.freeTierLimited).toBe(true)
    expect(store.demoMode).toBe(false)
  })

  it('reports errors from the API', async () => {
    const { fetchAllLeagues } = await import('../src/api/sportsDb')
    vi.mocked(fetchAllLeagues).mockRejectedValueOnce(new Error('down'))

    const store = useLeaguesStore()
    await store.loadLeagues()

    expect(store.status).toBe('error')
    expect(store.error).toBe('down')
  })
})
