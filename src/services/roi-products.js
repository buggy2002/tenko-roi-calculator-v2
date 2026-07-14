import {
  findMachineRoiDefaultsByProductId,
  findProductById,
  products,
} from '@/plugins/fake-api/roi/products'

function buildProductResponse(product) {
  return {
    ...product,
    machine_roi_defaults: findMachineRoiDefaultsByProductId(product.id) ?? null,
  }
}

export function listRoiProducts() {
  const activeProducts = products
    .filter(product => product.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(buildProductResponse)

  return Promise.resolve({
    products: activeProducts,
    total: activeProducts.length,
  })
}

export function getRoiProduct(productId) {
  const product = findProductById(productId)

  return Promise.resolve(product ? buildProductResponse(product) : null)
}

export function getRoiProductDefaults(productId) {
  const product = findProductById(productId)
  const machineRoiDefaults = findMachineRoiDefaultsByProductId(productId)

  if (!product || !machineRoiDefaults)
    return Promise.resolve(null)

  return Promise.resolve({
    product_id: product.id,
    product_code: product.code,
    machine_roi_defaults: machineRoiDefaults,
  })
}
