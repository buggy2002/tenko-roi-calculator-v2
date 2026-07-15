import { deriveAbsenceYear, deriveBonusYear, deriveSocialSecurityYear } from '@/utils/roi/presets'

export const baseMachineRoiDefaults = {
  people_per_day: 50,
  days_per_month: 26,
  minutes_per_person: 4,
  wait_minutes: 2,
  tenko_minutes_per_person: 2,
  work_days_year: 312,
  staff_count: 1,
  salary_per_month: 18000,
  ot_hours_per_day: 0,
  ot_multiplier: 1.5,
  social_security_year: deriveSocialSecurityYear(18000),
  bonus_year: deriveBonusYear(18000),
  absence_year: deriveAbsenceYear(18000),
  employee_avg_salary: 18000,
  work_hours_day: 8,
  employee_cost_factor: 1.2,
  alc_buy: 30000,
  alc_maint: 5000,
  alc_cal: 2500,
  alc_life: 3,
  bp_buy: 70000,
  bp_maint: 8000,
  bp_cal: 2500,
  bp_life: 3,
  temp_buy: 2000,
  temp_maint: 1000,
  temp_cal: 2500,
  temp_life: 3,
  tenko_monthly: 23900,
  tenko_setup: 0,
  tenko_other_year: 0,
  years: 3,
}

export function createMachineRoiDefaults(overrides = {}) {
  const merged = {
    ...baseMachineRoiDefaults,
    ...overrides,
  }

  // ต้นทุน จนท. ที่ไม่ได้ override ให้ตามสูตร default จากเงินเดือนของเครื่องนั้น
  if (!('social_security_year' in overrides))
    merged.social_security_year = deriveSocialSecurityYear(merged.salary_per_month)
  if (!('bonus_year' in overrides))
    merged.bonus_year = deriveBonusYear(merged.salary_per_month)
  if (!('absence_year' in overrides))
    merged.absence_year = deriveAbsenceYear(merged.salary_per_month)

  return merged
}
