import { ofetch } from 'ofetch'

const rawBaseURL = (import.meta.env.VITE_API_BASE_URL || '').trim()

const api = ofetch.create({
  baseURL: rawBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function hasScenarioApiConfig() {
  return Boolean(rawBaseURL)
}
export function listScenarios() {
  return api('/api/roi/scenarios')
}
export function createScenario(payload) {
  return api('/api/roi/scenarios', {
    method: 'POST',
    body: payload,
  })
}
export function updateScenario(id, payload) {
  return api(`/api/roi/scenarios/${id}`, {
    method: 'PUT',
    body: payload,
  })
}
export function deleteScenarioRequest(id) {
  return api(`/api/roi/scenarios/${id}`, {
    method: 'DELETE',
  })
}
