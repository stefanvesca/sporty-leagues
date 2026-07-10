export interface League {
  idLeague: string
  strLeague: string
  strSport: string
  /** Omitted by the free API tier — render only when present. */
  strLeagueAlternate?: string | null
  /** Not in all_leagues responses; enriched via lookupleague or bundled data. */
  strCountry?: string | null
}

/** Full record from lookupleague.php — the fields we display. */
export interface LeagueDetails {
  idLeague: string
  strLeague: string
  strSport: string
  strCountry: string | null
  strDescriptionEN: string | null
  intFormedYear: string | null
  strWebsite: string | null
  strCurrentSeason: string | null
}

export interface SeasonBadge {
  strSeason: string
  strBadge: string | null
}

export interface AllLeaguesResponse {
  leagues: League[] | null
}

export interface LookupLeagueResponse {
  leagues: LeagueDetails[] | null
}

export interface SearchAllSeasonsResponse {
  seasons: SeasonBadge[] | null
}
