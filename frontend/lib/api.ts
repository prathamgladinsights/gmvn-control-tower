const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

// ── Properties ────────────────────────────────────────────
export async function getProperties() {
  return apiFetch('/api/properties')
}
export async function getProperty(id: number) {
  return apiFetch(`/api/properties/${id}`)
}

// ── Dashboard Stats ────────────────────────────────────────
export async function getDashboardStats() {
  return apiFetch('/api/stats/overview')
}
export async function getPropertyStats(propertyId: number) {
  return apiFetch(`/api/stats/property/${propertyId}`)
}

// ── Feedback ──────────────────────────────────────────────
export async function getFeedbackCalls(propertyId?: number, limit = 50) {
  const q = propertyId ? `?property_id=${propertyId}&limit=${limit}` : `?limit=${limit}`
  return apiFetch(`/api/feedback${q}`)
}

// ── Google Reviews ────────────────────────────────────────
export async function getGoogleReviews(propertyId?: number) {
  const q = propertyId ? `?property_id=${propertyId}` : ''
  return apiFetch(`/api/reviews${q}`)
}

// ── Requisitions ──────────────────────────────────────────
export async function getRequisitions(propertyId?: number, status?: string) {
  const params = new URLSearchParams()
  if (propertyId) params.set('property_id', String(propertyId))
  if (status) params.set('status', status)
  return apiFetch(`/api/requisitions?${params}`)
}
export async function createRequisition(data: object) {
  return apiFetch('/api/requisitions', { method: 'POST', body: JSON.stringify(data) })
}
export async function updateRequisition(id: number, data: object) {
  return apiFetch(`/api/requisitions/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

// ── Alerts ────────────────────────────────────────────────
export async function getAlerts(propertyId?: number, status?: string) {
  const params = new URLSearchParams()
  if (propertyId) params.set('property_id', String(propertyId))
  if (status) params.set('status', status)
  return apiFetch(`/api/alerts?${params}`)
}
export async function createAlert(data: object) {
  return apiFetch('/api/alerts', { method: 'POST', body: JSON.stringify(data) })
}
export async function updateAlert(id: number, data: object) {
  return apiFetch(`/api/alerts/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

// ── Inventory Items ───────────────────────────────────────
export async function getInventoryItems() {
  return apiFetch('/api/inventory-items')
}

// ── AI Insights ───────────────────────────────────────────
export async function getInsights(propertyId?: number) {
  const q = propertyId ? `?property_id=${propertyId}` : ''
  return apiFetch(`/api/insights${q}`)
}

// ── Users (admin) ─────────────────────────────────────────
export async function getUsers() {
  return apiFetch('/api/users')
}
export async function createUser(data: object) {
  return apiFetch('/api/users', { method: 'POST', body: JSON.stringify(data) })
}
export async function updateUser(id: number, data: object) {
  return apiFetch(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}
