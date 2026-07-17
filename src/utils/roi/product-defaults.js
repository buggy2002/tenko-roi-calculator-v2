import { defaultInput } from './presets'

function toCamelCase(key) {
  return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function toSnakeCase(key) {
  return key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

export function mapInputToMachineRoiDefaults(input) {
  if (!input || typeof input !== 'object')
    return null

  const payload = {}

  Object.keys(defaultInput).forEach(key => {
    const numberValue = Number(input[key])

    if (Number.isFinite(numberValue))
      payload[toSnakeCase(key)] = numberValue
  })

  return payload
}

export function mapMachineRoiDefaultsToInput(machineDefaults) {
  if (!machineDefaults || typeof machineDefaults !== 'object')
    return null

  const overrides = {}
  let matched = false

  Object.entries(machineDefaults).forEach(([key, value]) => {
    const camelKey = toCamelCase(key)
    const numberValue = Number(value)

    if (camelKey in defaultInput && Number.isFinite(numberValue)) {
      overrides[camelKey] = numberValue
      matched = true
    }
  })

  if (!matched)
    return null

  return { ...defaultInput, ...overrides }
}
