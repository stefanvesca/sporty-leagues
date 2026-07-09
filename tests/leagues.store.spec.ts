import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useLeaguesStore } from '../src/stores/leagues'
import type { League } from '../src/api/types'

const sample: League[] = [
  { idLeague: '1', strLeague: 'English Premier League', strSport: 'Soccer', strLeagueAlternate: 'EPL' },
  { idLeague: '2', strLeague: 'NBA', strSport: 'Basketball', strLeagueAlternate: 'National Basketball Association' },
  { idLeague: '3', strLeague: 'Formula 1', strSport: 'Motorsport', strLeagueAlternate: 'F1' },
  { idLeague: '4', strLeague: 'La Liga', strSport: 'Soccer', strLeagueAlternate: '' },
]

vi.mock('../src/api/sportsDb', () => ({
  fetchAllLeagues: vi.fn(async () => sample),
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

  it('combines search and sport filters', async () => {
    const store = useLeaguesStore()
    await store.loadLeagues()

    store.selectedSport = 'Soccer'
    store.searchTerm = 'liga'
    expect(store.filteredLeagues.map((l) => l.strLeague)).toEqual(['La Liga'])
  })

  it('clears both filters', async () => {
    const store = useLeaguesStore()
    await store.loadLeagues()

    store.searchTerm = 'x'
    store.selectedSport = 'Soccer'
    store.clearFilters()

    expect(store.searchTerm).toBe('')
    expect(store.selectedSport).toBe('')
    expect(store.filteredLeagues).toHaveLength(4)
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
