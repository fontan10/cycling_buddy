import { useState, useEffect, useCallback, useRef } from 'react'
import { apiFetch } from '../lib/api'

const BATCH_SIZE = 8
const REFETCH_THRESHOLD = 2

async function fetchBatch(): Promise<string[]> {
  const { usernames } = await apiFetch<{ usernames: string[] }>(`/auth/suggest-usernames?count=${BATCH_SIZE}`)
  return usernames
}

export function useUsernameSuggestions() {
  const [username, setUsername] = useState('')
  const [isFetching, setIsFetching] = useState(true)
  const [isSpinning, setIsSpinning] = useState(false)
  const [refreshError, setRefreshError] = useState(false)
  const queue = useRef<string[]>([])
  const backgroundFetching = useRef(false)

  function triggerSpin() {
    setIsSpinning(true)
    setTimeout(() => setIsSpinning(false), 350)
  }

  useEffect(() => {
    fetchBatch()
      .then(names => {
        setUsername(names[0] ?? '')
        queue.current = names.slice(1)
      })
      .catch(() => {})
      .finally(() => setIsFetching(false))
  }, [])

  const refresh = useCallback(async () => {
    setRefreshError(false)
    if (queue.current.length > 0) {
      setUsername(queue.current[0])
      queue.current = queue.current.slice(1)
      triggerSpin()

      if (queue.current.length <= REFETCH_THRESHOLD && !backgroundFetching.current) {
        backgroundFetching.current = true
        fetchBatch()
          .then(names => { queue.current = [...queue.current, ...names] })
          .catch(() => {})
          .finally(() => { backgroundFetching.current = false })
      }
    } else {
      setIsFetching(true)
      try {
        const names = await fetchBatch()
        setUsername(names[0] ?? '')
        queue.current = names.slice(1)
        triggerSpin()
      } catch {
        setRefreshError(true)
      } finally {
        setIsFetching(false)
      }
    }
  }, [])

  return { username, isSpinning, isFetching, refreshError, refresh }
}
