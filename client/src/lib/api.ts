export const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api'

export type ApiError = Error & { field?: string }

export function isApiError(err: unknown): err is ApiError {
  return err instanceof Error
}

function getToken() {
  return localStorage.getItem('token')
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.error ?? `Request failed: ${res.status}`) as ApiError
    err.field = body.field
    throw err
  }

  return res.json()
}
