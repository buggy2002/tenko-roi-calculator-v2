import { createMachineRoiDefaults } from './product'

const createdAt = '2026-07-14T00:00:00.000Z'
const updatedAt = '2026-07-14T00:00:00.000Z'

export const products = [
  {
    id: 1,
    code: 'tenko-robot-jr',
    name: 'TENKO ROBOT',
    description: 'หุ่นยนต์ตรวจแอลกอฮอล์อัจฉริยะ สำหรับโรงงานและอุตสาหกรรมขนส่ง พร้อมส่งผลตรวจขึ้นคลาวด์แบบ Real-Time',
    category: 'roi-machine',
    is_active: true,
    sort_order: 1,
    created_at: createdAt,
    updated_at: updatedAt,
  },
  {
    id: 2,
    code: 'tenko-max',
    name: 'TENKO MAX',
    description: 'เครื่องวัดแอลกอฮอล์อัจฉริยะ ตรวจเร็ว แม่นยำ ปลอดภัย และรองรับการทำงานต่อเนื่องตลอด 24/7',
    category: 'roi-machine',
    is_active: true,
    sort_order: 2,
    created_at: createdAt,
    updated_at: updatedAt,
  },

  // {
  //   id: 3,
  //   code: 'tesuto-drive',
  //   name: 'TESUTO DRIVE',
  //   description: 'เครื่องวัดแอลกอฮอล์พกพาอัจฉริยะ เชื่อมต่อมือถือผ่าน Bluetooth เหมาะกับการใช้งานนอกสถานที่',
  //   category: 'roi-machine',
  //   is_active: true,
  //   sort_order: 3,
  //   created_at: createdAt,
  //   updated_at: updatedAt,
  // },
  {
    id: 3,
    code: 'tenko-station',
    name: 'TENKO STATION',
    description: 'สถานีตรวจวัดแอลกอฮอล์อัตโนมัติ ช่วยให้พนักงานตรวจสอบตัวเองก่อนเริ่มงานและลดความเสี่ยงอุบัติเหตุ',
    category: 'roi-machine',
    is_active: true,
    sort_order: 3,
    created_at: createdAt,
    updated_at: updatedAt,
  },
]

export const machineRoiDefaults = [
  {
    id: 1,
    product_id: 1,
    ...createMachineRoiDefaults({
      people_per_day: 180,
      staff_count: 2,
      ot_hours_per_day: 4,
      tenko_minutes_per_person: 2,
      alc_buy: 69000,
      alc_maint: 6000,
      tenko_monthly: 23900,
      tenko_setup: 15000,
      years: 3,
    }),
    created_at: createdAt,
    updated_at: updatedAt,
  },
  {
    id: 2,
    product_id: 2,
    ...createMachineRoiDefaults({
      people_per_day: 120,
      minutes_per_person: 3.5,
      wait_minutes: 1.5,
      staff_count: 1,
      salary_per_month: 22000,
      employee_avg_salary: 22000,
      alc_buy: 85000,
      alc_maint: 7000,
      bp_buy: 75000,
      tenko_monthly: 26900,
      tenko_setup: 12000,
      tenko_other_year: 3000,
      years: 5,
    }),
    created_at: createdAt,
    updated_at: updatedAt,
  },

  // {
  //   id: 3,
  //   product_id: 3,
  //   ...createMachineRoiDefaults({
  //     people_per_day: 40,
  //     days_per_month: 24,
  //     minutes_per_person: 5,
  //     wait_minutes: 1,
  //     staff_count: 1,
  //     salary_per_month: 16000,
  //     employee_avg_salary: 16000,
  //     alc_buy: 18000,
  //     alc_maint: 2000,
  //     alc_cal: 1500,
  //     tenko_monthly: 9900,
  //     tenko_setup: 0,
  //     years: 3,
  //   }),
  //   created_at: createdAt,
  //   updated_at: updatedAt,
  // },
  {
    id: 3,
    product_id: 3,
    ...createMachineRoiDefaults({
      people_per_day: 90,
      minutes_per_person: 3,
      wait_minutes: 1.5,
      tenko_minutes_per_person: 1.5,
      staff_count: 1,
      ot_hours_per_day: 2,
      salary_per_month: 20000,
      employee_avg_salary: 20000,
      alc_buy: 55000,
      alc_maint: 4500,
      temp_buy: 3500,
      temp_maint: 1500,
      tenko_monthly: 19900,
      tenko_setup: 10000,
      years: 3,
    }),
    created_at: createdAt,
    updated_at: updatedAt,
  },
]

export function findProductById(productId) {
  return products.find(product => product.id === Number(productId))
}

export function findMachineRoiDefaultsByProductId(productId) {
  return machineRoiDefaults.find(item => item.product_id === Number(productId))
}
