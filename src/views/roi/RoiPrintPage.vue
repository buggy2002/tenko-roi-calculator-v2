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
import { calculateRoi } from '@/utils/roi/calculate-roi'
import { defaultInput } from '@/utils/roi/presets'
import { readRoiPrintSnapshot } from '@/utils/roi/print-snapshot'

const props = defineProps({
  autoPrint: { type: Boolean, default: true },
  previewMode: { type: Boolean, default: false },
})

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
  'staffCost',
  'staffByUtil',
  'baseSalary',
  'otCost',
  'extras',
  'equipment',
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
  'autoOtHint',
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

const fmtPercent = value =>
  `${Number(value || 0).toLocaleString(formatterLocale.value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`

const hrs = (value, rounded = false) =>
  `${(rounded ? Math.round(value) : value).toLocaleString(formatterLocale.value, { maximumFractionDigits: rounded ? 0 : 1 })} ${tr.value.hours}`

const mins = value => `${value.toLocaleString(formatterLocale.value, { maximumFractionDigits: 1 })} ${tr.value.min}`

const chartData = computed(() => ({
  labels: chartLabels.value,
  datasets: [
    {
      label: tr.value.oldMethod,
      data: result.value.oldData,
      borderColor: '#f26a21',
      backgroundColor: 'rgba(242,106,33,.06)',
      pointBackgroundColor: '#f26a21',
      pointBorderColor: '#f26a21',
      borderWidth: 3,
      pointRadius: 4,
      fill: false,
      tension: 0.32,
    },
    {
      label: 'Tenko Robot',
      data: result.value.newData,
      borderColor: '#12824f',
      backgroundColor: 'rgba(18,130,79,.06)',
      pointBackgroundColor: '#12824f',
      pointBorderColor: '#12824f',
      borderWidth: 3,
      pointRadius: 4,
      fill: false,
      tension: 0.32,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  devicePixelRatio: 2,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    tooltip: { enabled: false },
    legend: {
      position: 'top',
      align: 'start',
      labels: {
        boxWidth: 10,
        boxHeight: 10,
        usePointStyle: true,
        pointStyle: 'circle',
        color: '#202228',
        font: {
          size: 10,
          weight: '700',
        },
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(0,0,0,.04)' },
      ticks: {
        color: '#555',
        font: { size: 10, weight: '700' },
      },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,.07)' },
      ticks: {
        color: '#555',
        font: { size: 10, weight: '700' },
        callback: value => `${currencySymbol}${Number(value).toLocaleString(formatterLocale.value)}`,
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
    title: tr.value.roiFromTotal,
    value: fmtPercent(result.value.roi),
    note: 'Total Saving',
    tone: 'orange',
    accent: false,
  },
])

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function waitForImages() {
  if (typeof document === 'undefined')
    return Promise.resolve()

  const images = Array.from(document.images).filter(img => !img.complete)

  return Promise.all(images.map(img => new Promise(resolve => {
    img.onload = resolve
    img.onerror = resolve
  })))
}

function triggerPrint() {
  window.print()
}

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
  await document.fonts?.ready
  await waitForImages()
  await wait(500)

  if (props.autoPrint)
    window.print()
})
</script>

<template>
  <main
    class="roi-print-route"
    :class="[previewMode && 'roi-print-route-preview']"
  >
    <div
      v-if="previewMode"
      class="roi-print-preview-toolbar"
    >
      <div class="roi-print-preview-copy">
        <strong>ROI Print Preview</strong>
        <span>/roi-report-preview</span>
      </div>

      <button
        type="button"
        class="roi-print-preview-button"
        @click="triggerPrint"
      >
        Print
      </button>
    </div>

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
