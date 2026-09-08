// src/hooks/useCountdown.ts
// Returns a human-readable time-left string that refreshes every 30s.

import { useState, useEffect } from 'react'

function fmt(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return 'closing…'
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  if (h > 0) return `closes in ${h}h ${m}m`
  return `closes in ${m}m`
}

export function useCountdown(iso: string | null): string {
  // `tick` exists only to force a re-render every 30s; the label itself is
  // always derived fresh from `iso` below, so it's never stale on mount or
  // when `iso` changes.
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!iso) return
    const id = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [iso])

  return iso ? fmt(iso) : ''
}
