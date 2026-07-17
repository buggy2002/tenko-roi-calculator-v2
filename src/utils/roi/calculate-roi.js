import { FORMULA_VERSION } from "./constants.js"

function nonNegative(value) {
  return Math.max(0, Number.isFinite(value) ? value : 0)
}
export function calculateAutoOt(input) {
  const people = nonNegative(input.peoplePerDay)
  const min = nonNegative(input.minutesPerPerson)
  const wait = nonNegative(input.waitMinutes)
  const staff = Math.max(0.0001, nonNegative(input.staffCount))
  const staffMinutesDay = people * (min + wait)
  const capacityDay = staff * 480
  
  return Math.max(0, (staffMinutesDay - capacityDay) / staff / 60)
}
export function getUtilStatus(percent) {
  if (percent < 60)
    return { status: "Excellent", statusColor: "green" }
  if (percent < 80)
    return { status: "Normal", statusColor: "yellow" }
  if (percent <= 100)
    return { status: "Busy", statusColor: "orange" }
  
  return { status: "Overloaded", statusColor: "red" }
}
export function calculateRoi(rawInput) {
  const people = nonNegative(rawInput.peoplePerDay)
  const daysM = nonNegative(rawInput.daysPerMonth)
  const daysY = daysM * 12
  const min = nonNegative(rawInput.minutesPerPerson)
  const wait = nonNegative(rawInput.waitMinutes)
  const tenkoMin = nonNegative(rawInput.tenkoMinutesPerPerson)
  const staff = Math.max(0.0001, nonNegative(rawInput.staffCount))
  const cycle = min + wait
  const staffMinutesDay = people * cycle
  const capacityDay = staff * 480
  const util = capacityDay > 0 ? staffMinutesDay / capacityDay : 0
  const utilPct = util * 100
  const status = getUtilStatus(utilPct)
  const salary = nonNegative(rawInput.salaryPerMonth)
  const otH = nonNegative(rawInput.otHoursPerDay)
  const otMul = Math.max(1, nonNegative(rawInput.otMultiplier))
  const social = nonNegative(rawInput.socialSecurityYear)
  const bonus = nonNegative(rawInput.bonusYear)
  const absence = nonNegative(rawInput.absenceYear)
  const utilForCost = Math.min(util, 1)
  const baseSalaryFull = staff * salary * 12
  const baseSalaryCost = baseSalaryFull * utilForCost
  const hourly = salary / 30 / 8
  const otCost = staff * otH * daysM * 12 * hourly * otMul
  const staffExtras = staff * (social + bonus + absence) * utilForCost
  const oldLabor = baseSalaryCost + otCost + staffExtras

  const oldDep = nonNegative(rawInput.alcBuy) / Math.max(1, nonNegative(rawInput.alcLife)) +
        nonNegative(rawInput.bpBuy) / Math.max(1, nonNegative(rawInput.bpLife)) +
        nonNegative(rawInput.tempBuy) / Math.max(1, nonNegative(rawInput.tempLife))

  const oldMaint = nonNegative(rawInput.alcMaint) +
        nonNegative(rawInput.bpMaint) +
        nonNegative(rawInput.tempMaint)

  const oldCal = nonNegative(rawInput.alcCal) +
        nonNegative(rawInput.bpCal) +
        nonNegative(rawInput.tempCal)

  const oldTotal = oldLabor + oldDep + oldMaint + oldCal
  const newMonthly = nonNegative(rawInput.tenkoMonthly) * 12
  const newSetup = nonNegative(rawInput.tenkoSetup)
  const newOther = nonNegative(rawInput.tenkoOtherYear)
  const newTotal = newMonthly + newSetup + newOther
  const newRecurring = newMonthly + newOther
  const oldTimeYear = (people * daysY * cycle) / 60
  const newTimeYear = (people * daysY * tenkoMin) / 60
  const timeSaveYear = Math.max(0, oldTimeYear - newTimeYear)
  const timeSaveDay = Math.max(0, (people * (cycle - tenkoMin)) / 60)
  const factor = nonNegative(rawInput.employeeCostFactor)
  const empSalary = nonNegative(rawInput.employeeAvgSalary)
  const workDays = Math.max(1, nonNegative(rawInput.workDaysYear))
  const workHours = Math.max(1, nonNegative(rawInput.workHoursDay))
  const costPerMin = (empSalary * 12 * factor) / (workDays * workHours * 60)
  const oldProd = people * daysY * cycle * costPerMin
  const newProd = people * daysY * tenkoMin * costPerMin
  const prodSave = Math.max(0, oldProd - newProd)
  const oldGrand = oldTotal + oldProd
  const newGrand = newTotal + newProd
  const annualSave = oldGrand - newGrand

  // ROI เทียบกับต้นทุนแบบเดิม = ลดต้นทุนไปกี่ % ของของเดิม
  const roi = oldGrand > 0 ? (annualSave / oldGrand) * 100 : 0
  const isWorth = annualSave > 0
  const years = Math.max(1, Math.min(10, Math.round(nonNegative(rawInput.years))))
  const oldData = [0]
  const newData = [0]
  for (let i = 1; i <= years; i += 1) {
    oldData.push(oldGrand * i)
    newData.push((newRecurring + newProd) * i + (i === 1 ? newSetup : 0))
  }
  
  return {
    formulaVersion: FORMULA_VERSION,
    people,
    daysM,
    daysY,
    min,
    wait,
    tenkoMin,
    staff,
    cycle,
    util,
    utilPct,
    ...status,
    baseSalaryCost,
    otCost,
    staffExtras,
    oldLabor,
    oldDep,
    oldMaint,
    oldCal,
    oldTotal,
    newMonthly,
    newSetup,
    newOther,
    newTotal,
    newRecurring,
    oldTimeYear,
    newTimeYear,
    timeSaveYear,
    timeSaveDay,
    costPerMin,
    oldProd,
    newProd,
    prodSave,
    oldGrand,
    newGrand,
    annualSave,
    roi,
    isWorth,
    years,
    oldData,
    newData,
    otH,
  }
}
