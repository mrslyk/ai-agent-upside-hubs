const KEY = 'upside_access_token'

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setAccessToken(token: string) {
  localStorage.setItem(KEY, token)
}

export function clearAccessToken() {
  localStorage.removeItem(KEY)
}
