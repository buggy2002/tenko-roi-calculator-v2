import { ofetch } from 'ofetch'
import {
  findMachineRoiDefaultsByProductId,
  findProductById,
  products as mockProducts,
} from '@/plugins/fake-api/roi/products'

const rawBaseURL = (import.meta.env.VITE_API_BASE_URL || '').trim()

const api = ofetch.create({
  baseURL: rawBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function hasProductApiConfig() {
  return Boolean(rawBaseURL)
}

function buildMockProductResponse(product) {
  return {
    ...product,
    machine_roi_defaults: findMachineRoiDefaultsByProductId(product.id) ?? null,
    factory_defaults: findMachineRoiDefaultsByProductId(product.id) ?? null,
    defaults_updated_at: null,
  }
}

function listMockProducts() {
  const activeProducts = mockProducts
    .filter(product => product.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(buildMockProductResponse)

  return {
    products: activeProducts,
    total: activeProducts.length,
  }
}

export async function listRoiProducts() {
  if (!hasProductApiConfig())
    return listMockProducts()

  try {
    return await api('/api/roi/products')
  }
  catch {
    // API ล่มให้ใช้ catalog ในโค้ดชั่วคราว หน้าเว็บยังทำงานได้
    return listMockProducts()
  }
}

export async function getRoiProduct(productId) {
  if (!hasProductApiConfig()) {
    const product = findProductById(productId)

    return product ? buildMockProductResponse(product) : null
  }

  try {
    return await api(`/api/roi/products/${productId}`)
  }
  catch {
    const product = findProductById(productId)

    return product ? buildMockProductResponse(product) : null
  }
}

export function updateRoiProductDefaults(productId, machineRoiDefaults, { password, formulaVersion } = {}) {
  return api(`/api/roi/products/${productId}/defaults`, {
    method: 'PUT',
    headers: {
      'X-Settings-Password': password ?? '',
    },
    body: {
      machineRoiDefaults,
      formulaVersion: formulaVersion ?? null,
    },
  })
}

export function resetRoiProductDefaults(productId, { password } = {}) {
  return api(`/api/roi/products/${productId}/defaults/reset`, {
    method: 'POST',
    headers: {
      'X-Settings-Password': password ?? '',
    },
  })
}
