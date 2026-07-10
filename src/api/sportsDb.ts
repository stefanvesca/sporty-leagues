import { cachedFetch } from '../composables/useCachedFetch'
import type {
  AllLeaguesResponse,
  League,
  LeagueDetails,
  LookupLeagueResponse,
  SearchAllSeasonsResponse,
  SeasonBadge,
} from './types'

// The public test key "3" works but currently caps all_leagues at 5 items;
// a premium key in .env unlocks the full dataset. See README.
const API_KEY = import.meta.env.VITE_SPORTSDB_KEY ?? '3'
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`TheSportsDB responded with ${response.status}`)
  }
  return response.json() as Promise<T>
}

export function fetchAllLeagues(): Promise<League[]> {
  return cachedFetch('all-leagues', async () => {
    const data = await getJson<AllLeaguesResponse>(`${BASE_URL}/all_leagues.php`)
    return data.leagues ?? []
  })
}

export function fetchLeagueDetails(leagueId: string): Promise<LeagueDetails | null> {
  return cachedFetch(`league:${leagueId}`, async () => {
    const data = await getJson<LookupLeagueResponse>(
      `${BASE_URL}/lookupleague.php?id=${encodeURIComponent(leagueId)}`,
    )
    return data.leagues?.[0] ?? null
  })
}

export function fetchSeasonBadges(leagueId: string): Promise<SeasonBadge[]> {
  return cachedFetch(`badges:${leagueId}`, async () => {
    const data = await getJson<SearchAllSeasonsResponse>(
      `${BASE_URL}/search_all_seasons.php?badge=1&id=${encodeURIComponent(leagueId)}`,
    )
    return data.seasons ?? []
  })
}

/** Warm the caches for a league so expanding its card feels instant. */
export function prefetchLeague(leagueId: string): void {
  fetchSeasonBadges(leagueId).catch(() => {})
  fetchLeagueDetails(leagueId).catch(() => {})
}
