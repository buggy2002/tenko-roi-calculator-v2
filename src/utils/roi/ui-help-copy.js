export function getFieldTooltip(language, key, label) {
  const generic = {
    th: 'ช่องนี้เป็นสมมติฐานในการคำนวณ ROI สามารถปรับให้ตรงกับข้อมูลจริงขององค์กร เช่น จำนวนพนักงาน เวลาในการตรวจ ค่าแรง หรือค่าใช้จ่ายอุปกรณ์',
    en: 'This field is an ROI assumption. Adjust it to match the customer’s real operation, labor cost, inspection time, or equipment cost.',
    ja: `${label} のROI前提です。実際の運用に合わせて調整してください。`,
  }[language]

  const overrides = {
    peoplePerDay: {
      th: 'จำนวนพนักงานหรือผู้ขับขี่ที่ต้องเข้ารับการตรวจก่อนเริ่มงานใน 1 วัน ใช้คำนวณเวลาตรวจรวม ต้นทุนเวลาของผู้เข้าตรวจ และ Inspection Staff Utilization',
      en: 'Number of employees or drivers inspected before work each day. Used to calculate total inspection time, inspection time cost, and staff utilization.',
      ja: "1日あたりの検査人数です。総作業量と年間コストの算出に使います。",
    },
    daysPerMonth: {
      th: 'จำนวนวันที่มีการตรวจจริงต่อเดือน เช่น ตรวจทุกวันทำงาน 26 วัน/เดือน ค่านี้มีผลโดยตรงต่อจำนวนครั้งตรวจต่อปีและต้นทุนรวม',
      en: 'Number of actual inspection days per month. This directly affects annual inspection volume and annual cost.',
      ja: "月あたりの実際の検査日数です。年間件数と年間コストに直接影響します。",
    },
    minutesPerPerson: {
      th: 'เวลาของวิธีเดิมต่อคน รวมจดบันทึก (นาที)',
      en: 'Time required per person using the conventional method, including alcohol test, blood pressure, temperature check, and manual recording.',
      ja: "従来方式の1人あたり時間です。検査と手書き記録を含みます。",
    },
    waitMinutes: {
      th: 'เวลารอ/เปลี่ยนคนถัดไป (นาที)',
      en: 'Lost time between one person finishing and the next person starting inspection, such as walking in, preparation, changing straws, or waiting for staff.',
      ja: "1人目の終了から次の検査開始までの待ち時間です。",
    },
    tenkoMinutesPerPerson: {
      th: 'เวลา Tenko ต่อคน รวมบันทึกอัตโนมัติ (นาที)',
      en: 'Average time Tenko uses per person including automatic data recording. Used to compare time saved versus the conventional method.',
      ja: "Tenkoの1人あたり時間です。自動記録を含みます。",
    },
    workDaysYear: {
      th: 'วันทำงานเทียบต้นทุนพนักงาน / ปี',
      en: 'Annual working days used to convert inspected employees’ average salary into cost per minute for Productivity Loss calculation.',
      ja: "年間の勤務日数です。人件費を年間コストに換算するために使います。",
    },
    staffCount: {
      th: 'จำนวน จนท.คุมการตรวจ (คน)',
      en: 'Number of staff controlling the conventional inspection process. Used to calculate inspection staff utilization and staff cost.',
      ja: "従来方式で検査を管理するスタッフ人数です。",
    },
    otHoursPerDay: {
      th: 'จำนวนชม.เฉลี่ยทำ OT / วัน / คน',
      en: 'Average OT hours per day per inspection staff. If utilization exceeds 100%, the system auto-fills OT, and the user can still edit it.',
      ja: "1人あたりの平均残業時間です。残業コストの計算に使います。",
    },
    salaryPerMonth: {
      th: 'เงินเดือน จนท. / เดือน (บาท)',
      en: 'Monthly salary of inspection staff. Used to calculate conventional labor cost based on actual inspection utilization.',
      ja: "検査スタッフの月給です。人件費の計算に使います。",
    },
    otMultiplier: {
      th: 'ตัวคูณ OT',
      en: 'OT pay multiplier compared with normal hourly wage. For example, 1.5 means OT is paid at 1.5x normal hourly wage.',
      ja: "通常時給に対する残業倍率です。",
    },
    socialSecurityYear: {
      th: 'ประกันสังคม / ปี / คน',
      en: 'Annual social security or mandatory benefit cost paid by the company per inspection staff.',
      ja: "1人あたり年間の社会保険や法定福利費です。",
    },
    bonusYear: {
      th: 'โบนัส / ปี / คน',
      en: 'Average annual bonus per inspection staff, included as part of real conventional labor cost.',
      ja: "1人あたりの年間ボーナスです。実コストに含めます。",
    },
    absenceYear: {
      th: 'ต้นทุนวันลา/ขาดงาน / ปี / คน',
      en: 'Hidden cost from leave, absence, or replacement labor per inspection staff per year.',
      ja: "休暇・欠勤・代替要員などの隠れコストです。",
    },
    employeeAvgSalary: {
      th: 'เงินเดือนเฉลี่ยผู้เข้าตรวจ / เดือน',
      en: 'Average monthly salary of employees or drivers being inspected. Used to calculate the cost of time lost during inspection.',
      ja: "検査対象者の平均月給です。生産性損失の計算に使います。",
    },
    workHoursDay: {
      th: 'ชั่วโมงทำงาน / วัน',
      en: 'Standard working hours per day. Used to convert average monthly salary into cost per minute.',
      ja: "1日の標準労働時間です。月給を1分単価に変換するために使います。",
    },
    employeeCostFactorChoice: {
      th: 'Employee Cost Factor',
      en: 'Multiplier representing real employment cost beyond salary, including social security, bonus, benefits, uniform, leave, training, and recruiting/onboarding.',
      ja: "実際の雇用コストに基づくEmployee Cost Factorの選択肢です。",
    },
    employeeCostFactor: {
      th: 'Custom Employee Cost Factor',
      en: 'Use Custom to set your own Employee Cost Factor. For example, 1.20 means real employment cost is around 120% of salary.',
      ja: "Custom選択時に使用するEmployee Cost Factorです。",
    },
    alcBuy: {
      th: 'Alcohol ราคาซื้อ',
      en: 'Purchase price of the alcohol tester. Used to calculate annual equipment depreciation for the conventional method.',
      ja: "アルコール測定器の購入価格です。年間減価償却に使います。",
    },
    alcMaint: {
      th: 'Alcohol ซ่อมบำรุง/ปี',
      en: 'Annual maintenance cost for the alcohol tester, such as parts, inspection, or service fees.',
      ja: "アルコール測定器の年間保守費用です。",
    },
    alcCal: {
      th: 'Alcohol calibration/ปี',
      en: 'Annual calibration cost for the alcohol tester to maintain accuracy and credibility.',
      ja: "アルコール測定器の年間校正費用です。",
    },
    alcLife: {
      th: 'Alcohol อายุใช้งาน (ปี)',
      en: 'Useful life used to depreciate the alcohol tester purchase price.',
      ja: "アルコール測定器の耐用年数です。",
    },
    bpBuy: {
      th: 'BP ราคาซื้อ',
      en: 'Purchase price of the blood pressure monitor. Used to calculate annual depreciation.',
      ja: "血圧計の購入価格です。年間減価償却に使います。",
    },
    bpMaint: {
      th: 'BP ซ่อมบำรุง/ปี',
      en: 'Annual maintenance cost for the blood pressure monitor, such as service, parts, or cuff replacement.',
      ja: "血圧計の年間保守費用です。",
    },
    bpCal: {
      th: 'BP calibration/ปี',
      en: 'Annual calibration cost for the blood pressure monitor.',
      ja: "血圧計の年間校正費用です。",
    },
    bpLife: {
      th: 'BP อายุใช้งาน (ปี)',
      en: 'Useful life used to depreciate the blood pressure monitor purchase price.',
      ja: "血圧計の耐用年数です。",
    },
    tempBuy: {
      th: 'Temp ราคาซื้อ',
      en: 'Purchase price of the thermometer. Used to calculate annual depreciation.',
      ja: "体温計の購入価格です。年間減価償却に使います。",
    },
    tempMaint: {
      th: 'Temp ซ่อมบำรุง/ปี',
      en: 'Annual maintenance cost for the thermometer.',
      ja: "体温計の年間保守費用です。",
    },
    tempCal: {
      th: 'Temp calibration/ปี',
      en: 'Annual calibration cost for the thermometer.',
      ja: "体温計の年間校正費用です。",
    },
    tempLife: {
      th: 'Temp อายุใช้งาน (ปี)',
      en: 'Useful life used to depreciate the thermometer purchase price.',
      ja: "体温計の耐用年数です。",
    },
    tenkoMonthly: {
      th: 'ค่าบริการ Tenko / เดือน',
      en: 'Monthly service fee for Tenko Robot, used to calculate annual Tenko cost.',
      ja: "Tenko Robotの月額費用です。年間コストの計算に使います。",
    },
    tenkoSetup: {
      th: 'ค่าติดตั้ง / setup',
      en: 'First-year setup or installation cost. Enter 0 if not applicable.',
      ja: "初年度のセットアップ費用です。",
    },
    tenkoOtherYear: {
      th: 'ค่าอื่นๆ Tenko / ปี',
      en: 'Other annual Tenko-related costs, such as additional on-site staff or special services.',
      ja: "Tenkoに関するその他の年間費用です。",
    },
    years: {
      th: 'จำนวนปีที่ต้องการดู',
      en: 'Number of years to display in the cumulative cost chart, such as 3 or 5 years.',
      ja: "累積コストグラフに表示する年数です。",
    },
  }

  return overrides[key]?.[language] ?? generic
}
