import type { Language, PresetKey, RoiInput, RoiResult } from './types'

export type RoiScenarioRecord = {
  id: string
  name: string
  language: Language
  presetKey: PresetKey | null
  formulaVersion: string
  customerName: string | null
  notes: string | null
  input: RoiInput
  result: RoiResult
  createdAt: string
  updatedAt: string
}

export type CreateRoiScenarioInput = {
  name: string
  language: Language
  presetKey: PresetKey | null
  formulaVersion: string
  customerName?: string | null
  notes?: string | null
  input: RoiInput
  result: RoiResult
}

export type UpdateRoiScenarioInput = Partial<CreateRoiScenarioInput>

export type ScenarioSortMode = 'recent' | 'name'

export type StoredScenario = {
  localId: string
  remoteId: string | null
  name: string
  customerName: string
  notes: string
  language: Language
  presetKey: PresetKey
  input: RoiInput
  autoOTEnabled: boolean
  otEdited: boolean
  factorChoice: string
  savedAt: string
}

export type StoredScenarioBundle = {
  items: StoredScenario[]
  openTabIds: string[]
  currentLocalId: string | null
  sortMode?: ScenarioSortMode
}

export type ScenarioListGroup = {
  value: string
  items: StoredScenario[]
}
