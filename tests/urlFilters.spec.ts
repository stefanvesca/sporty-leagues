import { describe, expect, it } from 'vitest'
import { buildSearch, parseFilters } from '../src/composables/useUrlFilters'

describe('URL filter helpers', () => {
  it('parses filters from a query string', () => {
    expect(parseFilters('?q=grand+prix&sport=Motorsport&country=World')).toEqual({
      q: 'grand prix',
      sport: 'Motorsport',
      country: 'World',
    })
  })

  it('defaults missing params to empty strings', () => {
    expect(parseFilters('')).toEqual({ q: '', sport: '', country: '' })
    expect(parseFilters('?sport=Soccer')).toEqual({ q: '', sport: 'Soccer', country: '' })
  })

  it('builds a query string, omitting empty filters', () => {
    expect(buildSearch({ q: 'liga', sport: 'Soccer', country: '' })).toBe('?q=liga&sport=Soccer')
    expect(buildSearch({ q: '', sport: '', country: '' })).toBe('')
  })

  it('round-trips values with spaces and unicode', () => {
    const state = { q: 'première ligue', sport: 'American Football', country: 'Côte d\'Ivoire' }
    expect(parseFilters(buildSearch(state))).toEqual(state)
  })
})
