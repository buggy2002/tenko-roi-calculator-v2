import {
  findMachineRoiDefaultsByProductId,
  findProductById,
  machineRoiDefaults,
  products,
} from '@/plugins/fake-api/roi/products'

export const db = {
  products,
  machineRoiDefaults,
  findProductById,
  findMachineRoiDefaultsByProductId,
}
