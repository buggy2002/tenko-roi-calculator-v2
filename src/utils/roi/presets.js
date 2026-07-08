export const defaultInput = {
    peoplePerDay: 50,
    daysPerMonth: 26,
    minutesPerPerson: 4,
    waitMinutes: 2,
    tenkoMinutesPerPerson: 2,
    workDaysYear: 312,
    staffCount: 1,
    salaryPerMonth: 18000,
    otHoursPerDay: 0,
    otMultiplier: 1.5,
    socialSecurityYear: 9000,
    bonusYear: 18000,
    absenceYear: 12000,
    employeeAvgSalary: 18000,
    workHoursDay: 8,
    employeeCostFactor: 1.2,
    alcBuy: 30000,
    alcMaint: 5000,
    alcCal: 2500,
    alcLife: 3,
    bpBuy: 70000,
    bpMaint: 8000,
    bpCal: 2500,
    bpLife: 3,
    tempBuy: 2000,
    tempMaint: 1000,
    tempCal: 2500,
    tempLife: 3,
    tenkoMonthly: 23900,
    tenkoSetup: 0,
    tenkoOtherYear: 0,
    years: 3
};
export const roiPresets = {
    default: {
        ...defaultInput,
        key: "default",
        name: "Default",
        autoOT: true
    },
    honda: {
        ...defaultInput,
        key: "honda",
        name: "Honda Motor Cycle Logistics",
        peoplePerDay: 180,
        staffCount: 2,
        otHoursPerDay: 4,
        tenkoMinutesPerPerson: 2,
        autoOT: false
    },
    petchana: {
        ...defaultInput,
        key: "petchana",
        name: "\u0e40\u0e1e\u0e0a\u0e23\u0e0a\u0e19\u0e30 \u0e17\u0e23\u0e32\u0e19\u0e2a\u0e1b\u0e2d\u0e23\u0e4c\u0e15",
        peoplePerDay: 60,
        staffCount: 1,
        tenkoMinutesPerPerson: 2,
        autoOT: true
    }
};
