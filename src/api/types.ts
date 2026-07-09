export interface League {
  idLeague: string
  strLeague: string
  strSport: string
  /** Omitted by the free API tier — render only when present. */
  strLeagueAlternate?: string | null
}

export interface SeasonBadge {
  strSeason: string
  strBadge: string | null
}

export interface AllLeaguesResponse {
  leagues: League[] | null
}

export interface SearchAllSeasonsResponse {
  seasons: SeasonBadge[] | null
}
