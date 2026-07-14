import { defaultInput } from './presets'

function toCamelCase(key) {
  return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
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
