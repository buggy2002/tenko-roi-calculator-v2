<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip as ChartTooltip,
} from 'chart.js'
import { useI18n } from 'vue-i18n'
import RoiPrintReport from './components/RoiPrintReport.vue'
import { calculateRoi } from '@/utils/roi/calculate-roi.js'
import { defaultInput } from '@/utils/roi/presets.js'
import { readRoiPrintSnapshot } from '@/utils/roi/print-snapshot'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, ChartTooltip, Legend)

const { t, locale } = useI18n({ useScope: 'global' })

const input = ref({ ...defaultInput })
const language = ref('th')
const scenarioName = ref('Default')
const customerName = ref('')
const scenarioNotes = ref('')

const buildTextMap = (prefix, keys) => {
  const result = {}

  keys.forEach(key => {
    result[key] = t(`${prefix}.${key}`)
  })

  return result
}

const roiTextKeys = [
  'saving',
  'timeSaving',
  'prodSaving',
  'worth',
  'worthGood',
  'worthBad',
  'worthGoodNote',
  'worthBadNote',
  'oldMethod',
  'annualCost',
  'annualTime',
  'prodLoss',
  'totalCost',
  'execTitle',
  'execDesc',
  'costBreakTitle',
  'costBreakDesc',
  'staffByUtil',
  'baseSalary',
  'otCost',
  'extras',
  'dep',
  'maint',
  'cal',
  'tenkoMonthly',
  'setup',
  'other',
  'cycle',
  'costPerMin',
  'timeSaveDay',
  'roiFromTotal',
  'chartTitle',
  'chartDesc',
  'start',
  'year',
  'hours',
  'min',
  'disclaimer',
  'assumptions',
  'formula',
  'utilTitle',
  'printHeroTitle',
  'printHeroSubtitle',
  'printBrandSmall',
  'printDetailTitle',
  'printDetailSubtitle',
  'printConclusionTitle',
  'printConclusionLine',
  'printBenefitSafeTitle',
  'printBenefitSafeDesc',
  'printBenefitProdTitle',
  'printBenefitProdDesc',
  'printBenefitInvestTitle',
  'printBenefitInvestDesc',
  'titleA',
  'desc',
]

const roiLabelKeys = [
  'peoplePerDay',
  'daysPerMonth',
  'minutesPerPerson',
  'waitMinutes',
  'tenkoMinutesPerPerson',
  'workDaysYear',
  'staffCount',
  'salaryPerMonth',
  'otHoursPerDay',
  'otMultiplier',
  'socialSecurityYear',
  'bonusYear',
  'absenceYear',
  'employeeAvgSalary',
  'workHoursDay',
  'employeeCostFactor',
  'alcBuy',
  'alcMaint',
  'alcCal',
  'alcLife',
  'bpBuy',
  'bpMaint',
  'bpCal',
  'bpLife',
  'tempBuy',
  'tempMaint',
  'tempCal',
  'tempLife',
  'tenkoMonthly',
  'tenkoSetup',
  'tenkoOtherYear',
  'years',
]

const tr = computed(() => {
  locale.value

  return buildTextMap('roi', roiTextKeys)
})

const labels = computed(() => {
  locale.value

  return buildTextMap('roiLabels', roiLabelKeys)
})

const result = computed(() => calculateRoi(input.value))
const chartLabels = computed(() => [tr.value.start, ...Array.from({ length: result.value.years }, (_, index) => `${tr.value.year} ${index + 1}`)])

const formatterLocale = computed(() => {
  if (language.value === 'th')
    return 'th-TH'
  if (language.value === 'ja')
    return 'ja-JP'

  return 'en-US'
})

const currencySymbol = '\u0E3F'
const fmt = value => `${currencySymbol}${Math.round(value).toLocaleString(formatterLocale.value)}`

const fmt1 = value =>
  `${currencySymbol}${Number(value || 0).toLocaleString(formatterLocale.value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`

const hrs = (value, rounded = false) =>
  `${(rounded ? Math.round(value) : value).toLocaleString(formatterLocale.value, { maximumFractionDigits: rounded ? 0 : 1 })} ${tr.value.hours}`

const mins = value => `${value.toLocaleString(formatterLocale.value, { maximumFractionDigits: 1 })} ${tr.value.min}`

const chartData = computed(() => ({
  labels: chartLabels.value,
  datasets: [
    {
      label: tr.value.oldMethod,
      data: result.value.oldData,
      borderColor: '#b83c32',
      backgroundColor: 'rgba(184,60,50,.07)',
      borderWidth: 3,
      pointRadius: 4,
      fill: true,
      tension: 0.32,
    },
    {
      label: 'Tenko Robot',
      data: result.value.newData,
      borderColor: '#15824e',
      backgroundColor: 'rgba(21,130,78,.07)',
      borderWidth: 3,
      pointRadius: 4,
      fill: true,
      tension: 0.32,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        boxWidth: 12,
        boxHeight: 12,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
  },
  scales: {
    x: { grid: { color: 'rgba(0,0,0,.04)' } },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,.05)' },
      ticks: {
        callback: value => `${currencySymbol}${(Number(value) / 1000).toFixed(0)}K`,
      },
    },
  },
}))

const printMetrics = computed(() => [
  {
    icon: 'S',
    title: tr.value.saving,
    value: fmt(result.value.annualSave),
    note: `${fmt(result.value.oldGrand)} -> ${fmt(result.value.newGrand)}`,
    tone: 'green',
    accent: false,
  },
  {
    icon: 'T',
    title: tr.value.timeSaving,
    value: hrs(result.value.timeSaveYear, true),
    note: `${hrs(result.value.oldTimeYear, true)} -> ${hrs(result.value.newTimeYear, true)}`,
    tone: 'orange',
    accent: true,
  },
  {
    icon: 'P',
    title: tr.value.prodSaving,
    value: fmt(result.value.prodSave),
    note: `${fmt(result.value.oldProd)} -> ${fmt(result.value.newProd)}`,
    tone: 'green',
    accent: false,
  },
  {
    icon: 'R',
    title: tr.value.worth,
    value: result.value.isWorth ? tr.value.worthGood : tr.value.worthBad,
    note: result.value.isWorth ? tr.value.worthGoodNote : tr.value.worthBadNote,
    tone: result.value.isWorth ? 'green' : 'red',
    accent: false,
  },
])

watch(language, value => {
  locale.value = value
  document.documentElement.lang = value
}, { immediate: true })

onMounted(async () => {
  const snapshot = readRoiPrintSnapshot()

  if (snapshot?.input)
    input.value = { ...defaultInput, ...snapshot.input }

  language.value = snapshot?.language ?? 'th'
  scenarioName.value = snapshot?.scenarioName ?? 'Default'
  customerName.value = snapshot?.customerName ?? ''
  scenarioNotes.value = snapshot?.scenarioNotes ?? ''

  await nextTick()
  window.print()
})
</script>

<template>
  <main class="roi-print-route">
    <RoiPrintReport
      :chart-data="chartData"
      :chart-options="chartOptions"
      :customer-name="customerName"
      :fmt="fmt"
      :fmt1="fmt1"
      :formatter-locale="formatterLocale"
      :hrs="hrs"
      :input="input"
      :labels="labels"
      :mins="mins"
      :print-metrics="printMetrics"
      :result="result"
      :scenario-name="scenarioName"
      :scenario-notes="scenarioNotes"
      :tr="tr"
    />
  </main>
</template>
