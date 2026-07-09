export const ROI_PRINT_SNAPSHOT_KEY = 'tenko-roi-print-snapshot'

export function writeRoiPrintSnapshot(payload) {
  if (typeof window === 'undefined')
    return

  window.localStorage.setItem(ROI_PRINT_SNAPSHOT_KEY, JSON.stringify(payload))
}

export function readRoiPrintSnapshot() {
  if (typeof window === 'undefined')
    return null

  const raw = window.localStorage.getItem(ROI_PRINT_SNAPSHOT_KEY)

  if (!raw)
    return null

  try {
    return JSON.parse(raw)
  }
  catch {
    return null
  }
}
