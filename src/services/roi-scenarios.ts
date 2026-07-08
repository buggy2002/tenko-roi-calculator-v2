import { ofetch } from 'ofetch'
import type {
  CreateRoiScenarioInput,
  RoiScenarioRecord,
  UpdateRoiScenarioInput,
} from '@/utils/roi/scenario-types'

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
  return api<RoiScenarioRecord[]>('/api/roi/scenarios')
}

export function createScenario(payload: CreateRoiScenarioInput) {
  return api<RoiScenarioRecord>('/api/roi/scenarios', {
    method: 'POST',
    body: payload,
  })
}

export function updateScenario(id: string, payload: UpdateRoiScenarioInput) {
  return api<RoiScenarioRecord>(`/api/roi/scenarios/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export function deleteScenarioRequest(id: string) {
  return api<void>(`/api/roi/scenarios/${id}`, {
    method: 'DELETE',
  })
}
