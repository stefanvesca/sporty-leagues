/**
 * Response cache with three layers, per the brief's "cache responses to
 * avoid repeat calls" requirement:
 *
 *  1. in-memory Map        — instant hits within the session
 *  2. sessionStorage + TTL — survives reloads, expires stale data
 *  3. in-flight dedup      — concurrent requests for one key share a promise
 */

interface CacheEntry<T> {
  value: T
  storedAt: number
}

interface CachedFetchOptions {
  /** Milliseconds before a sessionStorage entry is considered stale. */
  ttl?: number
}

const DEFAULT_TTL = 60 * 60 * 1000 // 1 hour
const STORAGE_PREFIX = 'sportsdb:'

const memory = new Map<string, unknown>()
const inFlight = new Map<string, Promise<unknown>>()

function readStorage<T>(key: string, ttl: number): T | undefined {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key)
    if (!raw) return undefined
    const entry = JSON.parse(raw) as CacheEntry<T>
    if (Date.now() - entry.storedAt > ttl) {
      sessionStorage.removeItem(STORAGE_PREFIX + key)
      return undefined
    }
    return entry.value
  } catch {
    return undefined
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    const entry: CacheEntry<T> = { value, storedAt: Date.now() }
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry))
  } catch {
    // Quota exceeded or storage unavailable — memory layer still applies.
  }
}

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  { ttl = DEFAULT_TTL }: CachedFetchOptions = {},
): Promise<T> {
  if (memory.has(key)) {
    return memory.get(key) as T
  }

  const stored = readStorage<T>(key, ttl)
  if (stored !== undefined) {
    memory.set(key, stored)
    return stored
  }

  const pending = inFlight.get(key)
  if (pending) {
    return pending as Promise<T>
  }

  const request = fetcher()
    .then((value) => {
      memory.set(key, value)
      writeStorage(key, value)
      return value
    })
    .finally(() => {
      inFlight.delete(key)
    })

  inFlight.set(key, request)
  return request
}

/** Test hook — resets the in-memory layers. */
export function clearCache(): void {
  memory.clear()
  inFlight.clear()
}
