// All calls go to /api/... (Vite forwards them to Spring Boot on port 8080).

async function get(path) {
  const res = await fetch(path)
  if (res.status === 204) return null
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

export const getLatest = () => get('/api/readings/latest')
export const getHistory = (limit = 30) => get(`/api/readings?limit=${limit}`)
export const getConfig = () => get('/api/config')
export const getStats = () => get('/api/stats')
export const getAlerts = (limit = 8, type = '') =>
  get(`/api/alerts?limit=${limit}${type ? `&type=${type}` : ''}`)

export async function simulate() {
  const res = await fetch('/api/simulate', { method: 'POST' })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}
