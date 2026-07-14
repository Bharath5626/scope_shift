const BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiError {
  message: string
  status?: number
  code?: string
}

class ApiErrorImpl extends Error implements ApiError {
  status?: number
  code?: string

  constructor(message: string, status?: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function apiFetch<T>(path: string, opts: RequestInit = {}, retries = 2): Promise<T> {
  const token = localStorage.getItem('scopeai_token')
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

  try {
    const res = await fetch(`${BASE}${path}`, {
      ...opts,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers ?? {}),
      },
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const message = body.message || body.error || `HTTP ${res.status}: ${res.statusText}`
      throw new ApiErrorImpl(message, res.status, body.code)
    }

    const json = await res.json()
    return (json.data !== undefined ? json.data : json) as T
  } catch (error) {
    clearTimeout(timeoutId)

    // Retry on network errors or 5xx errors
    if (retries > 0 && shouldRetry(error)) {
      await sleep(1000 * (3 - retries)) // Exponential backoff
      return apiFetch<T>(path, opts, retries - 1)
    }

    if (error instanceof ApiErrorImpl) {
      throw error
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiErrorImpl('Request timeout. Please try again.')
      }
      if (error.message.includes('fetch')) {
        throw new ApiErrorImpl('Network error. Please check your connection.')
      }
      throw new ApiErrorImpl(error.message)
    }

    throw new ApiErrorImpl('An unexpected error occurred')
  }
}

function shouldRetry(error: unknown): boolean {
  if (error instanceof ApiErrorImpl) {
    // Retry on 5xx errors and 429 (rate limit)
    return (error.status && error.status >= 500) || error.status === 429
  }
  // Retry on network errors
  return error instanceof Error && error.message.includes('fetch')
}

export const api = {
  get:    <T>(path: string)               => apiFetch<T>(path),
  post:   <T>(path: string, body: unknown) => apiFetch<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => apiFetch<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: <T>(path: string)               => apiFetch<T>(path, { method: 'DELETE' }),
}
