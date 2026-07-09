import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cachedFetch, clearCache } from '../src/composables/useCachedFetch'

describe('cachedFetch', () => {
  beforeEach(() => {
    clearCache()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fetches once and serves repeat calls from memory', async () => {
    const fetcher = vi.fn().mockResolvedValue({ answer: 42 })

    const first = await cachedFetch('key', fetcher)
    const second = await cachedFetch('key', fetcher)

    expect(first).toEqual({ answer: 42 })
    expect(second).toEqual({ answer: 42 })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('serves from sessionStorage after the memory layer is gone', async () => {
    const fetcher = vi.fn().mockResolvedValue(['a', 'b'])
    await cachedFetch('key', fetcher)

    clearCache() // simulate a fresh module (page reload)
    const result = await cachedFetch('key', fetcher)

    expect(result).toEqual(['a', 'b'])
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('refetches once the TTL has expired', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const fetcher = vi.fn().mockResolvedValue('fresh')
    await cachedFetch('key', fetcher, { ttl: 1000 })

    clearCache()
    vi.setSystemTime(new Date('2026-01-01T00:00:02Z'))
    await cachedFetch('key', fetcher, { ttl: 1000 })

    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('dedupes concurrent requests for the same key', async () => {
    let resolve!: (value: string) => void
    const fetcher = vi.fn(
      () => new Promise<string>((r) => (resolve = r)),
    )

    const [a, b] = [cachedFetch('key', fetcher), cachedFetch('key', fetcher)]
    resolve('shared')

    expect(await a).toBe('shared')
    expect(await b).toBe('shared')
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('caches different keys independently', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce('one').mockResolvedValueOnce('two')

    expect(await cachedFetch('a', fetcher)).toBe('one')
    expect(await cachedFetch('b', fetcher)).toBe('two')
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('does not cache failures', async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce('recovered')

    await expect(cachedFetch('key', fetcher)).rejects.toThrow('boom')
    expect(await cachedFetch('key', fetcher)).toBe('recovered')
  })
})
