import { HttpResponse, http } from 'msw'
import { db } from '@db/roi/db'

function buildProductResponse(product) {
  const machineRoiDefaults = db.findMachineRoiDefaultsByProductId(product.id) ?? null

  return {
    ...product,
    machine_roi_defaults: machineRoiDefaults,
  }
}

export const handlerRoi = [
  http.get('/api/roi/products', () => {
    const activeProducts = db.products
      .filter(product => product.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(buildProductResponse)

    return HttpResponse.json({
      products: activeProducts,
      total: activeProducts.length,
    }, {
      status: 200,
    })
  }),

  http.get('/api/roi/products/:id', ({ params }) => {
    const product = db.findProductById(params.id)
    if (!product)
      return HttpResponse.json({ message: 'Product not found' }, { status: 404 })

    return HttpResponse.json(buildProductResponse(product), {
      status: 200,
    })
  }),

  http.get('/api/roi/products/:id/defaults', ({ params }) => {
    const product = db.findProductById(params.id)
    if (!product)
      return HttpResponse.json({ message: 'Product not found' }, { status: 404 })

    const machineRoiDefaults = db.findMachineRoiDefaultsByProductId(params.id)
    if (!machineRoiDefaults)
      return HttpResponse.json({ message: 'Machine ROI defaults not found' }, { status: 404 })

    return HttpResponse.json({
      product_id: product.id,
      product_code: product.code,
      machine_roi_defaults: machineRoiDefaults,
    }, {
      status: 200,
    })
  }),
]
