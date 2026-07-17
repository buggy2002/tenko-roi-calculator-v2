<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip as ChartTooltip,
} from 'chart.js'
import { Bar, Line } from 'vue-chartjs'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import RoiNavbar from './components/RoiNavbar.vue'
import RoiScenarioBrowser from './components/RoiScenarioBrowser.vue'
import RoiSettingsDialog from './components/RoiSettingsDialog.vue'
import { uiFactorChoices, uiGroups } from '../../utils/roi/ui-copy'
import { getFieldTooltip } from '../../utils/roi/ui-help-copy'
import { listRoiProducts } from '@/services/roi-products'
import { useRoiStore } from '@/stores/roi.js'
import { writeRoiPrintSnapshot } from '@/utils/roi/print-snapshot'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, ChartTooltip, Legend)

const store = useRoiStore()
const router = useRouter()
const { t, locale } = useI18n({ useScope: 'global' })
const isFullWidth = ref(true)
const isSaveDialogVisible = ref(false)
const isSettingsDialogVisible = ref(false)
const snackbar = ref({ show: false, text: '', color: 'success' })
const products = ref([])
const isProductsLoading = ref(false)
const selectedProduct = ref(null)

const buildTextMap = (prefix, keys) => {
  const result = {}

  keys.forEach(key => {
    result[key] = t(`${prefix}.${key}`)
  })
  
  return result
}

const roiTextKeys = [
  'print',
  'fullWidth',
  'fullWidthOn',
  'fullWidthOff',
  'eyebrow',
  'titleA',
  'desc',
  'inputTitle',
  'inputSub',
  'operation',
  'staffCost',
  'productivity',
  'equipment',
  'tenko',
  'workload',
  'cost',
  'hiddenCost',
  'equipmentTag',
  'allIn',
  'autoOtHint',
  'autoOn',
  'autoOff',
  'factorChoice',
  'factorGeneral',
  'factorGeneralDesc',
  'factorJapanese',
  'factorJapaneseDesc',
  'factorMultinational',
  'factorMultinationalDesc',
  'factorCustom',
  'factorHint',
  'reset',
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
  'recordingStaff',
  'automated',
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
  'settingsTitle',
  'settingsDesc',
  'settingsSelectMachine',
  'settingsFactory',
  'settingsSave',
  'settingsCancel',
  'settingsPassword',
  'settingsPasswordHint',
  'settingsWrongPassword',
  'settingsSaved',
  'settingsSaveFailed',
  'settingsUpdatedAt',
  'chartTitle',
  'chartDesc',
  'timeChartTitle',
  'timeChartDesc',
  'timeChartAnnual',
  'timeChartSaved',
  'start',
  'year',
  'hours',
  'min',
  'disclaimer',
  'assumptions',
  'formula',
  'utilTitle',
  'utilLegend',
  'productivityPanelTitle',
  'productivityPanelDesc',
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

const roiScenarioKeys = [
  'scenario',
  'exportPdf',
  'openPrint',
  'closeTab',
  'browseSaved',
  'searchSaved',
  'recent',
  'name',
  'loading',
  'noSaved',
  'savedInDatabase',
  'localDrafts',
  'database',
  'local',
  'metadataTitle',
  'metadataSub',
  'customerName',
  'notes',
  'customerPlaceholder',
  'notesPlaceholder',
  'saveScenario',
  'save',
  'list',
  'cancel',
  'close',
  'saveLocally',
  'saveSynced',
  'saveSyncFailed',
  'duplicateSuccess',
  'renameEmpty',
  'renameLocal',
  'renameSynced',
  'renameSyncFailed',
  'deleteLocal',
  'deleteSynced',
  'deleteSyncFailed',
  'resetEditor',
]

const tr = computed(() => {
  locale.value
  
  return buildTextMap('roi', roiTextKeys)
})

const labels = computed(() => {
  locale.value
  
  return buildTextMap('roiLabels', roiLabelKeys)
})

const scenarioText = computed(() => {
  locale.value
  
  return buildTextMap('roiScenario', roiScenarioKeys)
})

const chartLabels = computed(() => [tr.value.start, ...Array.from({ length: store.result.years }, (_, index) => `${tr.value.year} ${index + 1}`)])

const formatterLocale = computed(() => store.formatterLocale)
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
      data: store.result.oldData,
      borderColor: '#3f444c',
      backgroundColor: 'rgba(63,68,76,.08)',
      borderWidth: 3,
      pointRadius: 4,
      fill: true,
      tension: 0.32,
    },
    {
      label: 'Tenko Robot',
      data: store.result.newData,
      borderColor: '#f26a21',
      backgroundColor: 'rgba(242,106,33,.07)',
      borderWidth: 3,
      pointRadius: 4,
      fill: true,
      tension: 0.32,
    },
  ],
}))

const timeCostChartData = computed(() => ({
  labels: [tr.value.timeChartAnnual],
  datasets: [
    {
      label: tr.value.oldMethod,
      data: [store.result.oldTimeYear],
      backgroundColor: 'rgba(63,68,76,.85)',
      borderColor: '#3f444c',
      borderWidth: 1,
      borderRadius: 10,
      borderSkipped: false,
    },
    {
      label: 'Tenko Robot',
      data: [store.result.newTimeYear],
      backgroundColor: 'rgba(242,106,33,.88)',
      borderColor: '#f26a21',
      borderWidth: 1,
      borderRadius: 10,
      borderSkipped: false,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'nearest', intersect: true },
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

const timeCostChartOptions = computed(() => ({
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
    x: { grid: { display: false } },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,.05)' },
      ticks: {
        callback: value =>
          `${Number(value).toLocaleString(formatterLocale.value, { maximumFractionDigits: 0 })} ${tr.value.hours}`,
      },
    },
  },
}))

const heroProductName = computed(() => store.productName || selectedProduct.value?.name || 'Tenko Robot')

const metricCards = computed(() => [
  {
    title: tr.value.saving,
    value: fmt(store.result.annualSave),
    mini: `${fmt(store.result.oldGrand)} -> ${fmt(store.result.newGrand)}`,
    tone: 'green',
  },
  {
    title: tr.value.timeSaving,
    value: hrs(store.result.timeSaveYear, true),
    mini: `${hrs(store.result.oldTimeYear, true)} -> ${hrs(store.result.newTimeYear, true)}`,
    tone: 'orange',
  },
  {
    title: tr.value.prodSaving,
    value: fmt(store.result.prodSave),
    mini: `${fmt(store.result.oldProd)} -> ${fmt(store.result.newProd)}`,
    tone: 'green',
  },
  {
    title: tr.value.worth,
    value: store.result.isWorth ? tr.value.worthGood : tr.value.worthBad,
    mini: store.result.isWorth ? tr.value.worthGoodNote : tr.value.worthBadNote,
    tone: store.result.isWorth ? 'green' : 'red',
  },
])

function showNotice(text, color = 'success') {
  snackbar.value = { show: true, text, color }
}

async function loadProducts() {
  isProductsLoading.value = true
  try {
    const response = await listRoiProducts()

    products.value = Array.isArray(response?.products) ? response.products : []
    if (!selectedProduct.value && products.value.length > 0)
      selectedProduct.value = products.value[0]
  }
  catch {
    products.value = []
    showNotice('Machine list load failed', 'error')
  }
  finally {
    isProductsLoading.value = false
  }
}

async function selectProduct(product) {
  selectedProduct.value = product
  store.applyProductDefaults(product)

  const status = await store.loadRemoteScenarios({
    productId: product.id,
    limit: MAX_SESSION_TABS,
  })

  if (status === 'error')
    showNotice('Database list refresh failed', 'error')

  store.openTabsForProduct(product.id, MAX_SESSION_TABS)
}

// Tab ของ session แสดงเฉพาะของ product ที่เลือกใน navbar สูงสุด 5 tab
const MAX_SESSION_TABS = 5

const visibleSessionTabs = computed(() => {
  const activeId = selectedProduct.value?.id

  if (activeId == null)
    return store.visibleTabs.slice(0, MAX_SESSION_TABS)

  return store.visibleTabs
    .filter(tab => String(tab.productId) === String(activeId))
    .slice(0, MAX_SESSION_TABS)
})

const visibleScenarioGroups = computed(() => {
  const activeId = selectedProduct.value?.id
  if (activeId == null)
    return []

  const recentIds = new Set(store.savedScenarios
    .filter(scenario => String(scenario.productId) === String(activeId))
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    .slice(0, MAX_SESSION_TABS)
    .map(scenario => scenario.localId))

  return store.scenarioGroups
    .map(group => ({
      ...group,
      items: group.items.filter(scenario => recentIds.has(scenario.localId)),
    }))
    .filter(group => group.items.length > 0)
})

// เลือกเครื่องแล้วดึง scenario ล่าสุดของเครื่องนั้น (รวมจาก database) ขึ้นเป็น tab อัตโนมัติ
watch(selectedProduct, product => {
  if (product)
    store.openTabsForProduct(product.id, MAX_SESSION_TABS)
})

function onOpenScenario(scenario) {
  // scenario เก่าที่ยังไม่ผูกเครื่อง — ผูกเข้ากับเครื่องที่เลือกอยู่ เพื่อให้ tab ไม่หายเพราะ filter
  if (scenario.productId == null && selectedProduct.value) {
    const adopted = {
      ...scenario,
      productId: selectedProduct.value.id,
      productName: selectedProduct.value.name,
    }

    store.syncSavedScenario(adopted)
    store.openScenario(adopted)

    return
  }

  // เปิด scenario ของเครื่องอื่นให้สลับ product ที่ navbar ตามไปด้วย ไม่งั้น tab จะโดน filter ซ่อน
  if (scenario.productId != null && String(scenario.productId) !== String(selectedProduct.value?.id)) {
    const owner = products.value.find(product => String(product.id) === String(scenario.productId))

    if (owner)
      selectedProduct.value = owner
  }

  store.openScenario(scenario)
}

function onProductDefaultsSaved(updatedProduct) {
  const index = products.value.findIndex(product => product.id === updatedProduct.id)

  if (index !== -1)
    products.value.splice(index, 1, updatedProduct)

  if (selectedProduct.value?.id === updatedProduct.id)
    selectedProduct.value = updatedProduct
}

function resetEditor() {
  store.resetToDefaultSession()
  store.applyProductDefaults(selectedProduct.value)
}

function formatSavedAt(savedAt) {
  return new Intl.DateTimeFormat(formatterLocale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(savedAt))
}

// ช่องเวลา Tenko เก็บภายในเป็นนาที แต่แสดง/รับค่าจากผู้ใช้เป็นวินาที
const SECONDS_INPUT_KEY = 'tenkoMinutesPerPerson'

function fieldStep(key) {
  if (key === SECONDS_INPUT_KEY)
    return 1

  if (key === 'otMultiplier' || key === 'staffCount' || key.includes('Minutes') || key === 'workHoursDay')
    return 0.1

  if (key === 'employeeCostFactor')
    return 0.01

  return 1
}

function fieldMin(key) {
  if (key.includes('Life') || key === 'years' || key === 'workDaysYear' || key === 'workHoursDay')
    return 1

  return 0
}

function fieldDisplayValue(key) {
  if (key === SECONDS_INPUT_KEY)
    return Number((store.input[key] * 60).toFixed(2))

  return store.input[key]
}

function onNumericInput(key, event) {
  const value = Number(event.target.value)

  store.updateInput(key, key === SECONDS_INPUT_KEY ? value / 60 : value)
}

function updateRenameDraft(value) {
  store.renameDraft = value
}

function updateSortMode(value) {
  store.sortMode = value
}

async function onSaveScenario() {
  // กัน scenario ไม่ผูกเครื่อง — ถ้า editor ยังไม่มี product ให้ใช้เครื่องที่เลือกบน navbar
  if (store.productId == null && selectedProduct.value) {
    store.productId = selectedProduct.value.id
    store.productName = selectedProduct.value.name
  }

  const response = await store.saveScenario()
  if (response.status === 'synced')
    showNotice(scenarioText.value.saveSynced)
  else if (response.status === 'local')
    showNotice(scenarioText.value.saveLocally)
  else
    showNotice(scenarioText.value.saveSyncFailed, 'error')

  return response
}

async function onConfirmSaveScenario() {
  const response = await onSaveScenario()

  if (response.status === 'synced' || response.status === 'local')
    isSaveDialogVisible.value = false
}

async function onRenameScenario(scenario) {
  const status = await store.submitRenameScenario(scenario)
  if (status === 'synced')
    showNotice(scenarioText.value.renameSynced)
  else if (status === 'local')
    showNotice(scenarioText.value.renameLocal)
  else if (status === 'empty')
    showNotice(scenarioText.value.renameEmpty, 'error')
  else
    showNotice(scenarioText.value.renameSyncFailed, 'error')
}

async function onDeleteScenario(scenario) {
  const status = await store.deleteScenario(scenario)
  if (status === 'synced')
    showNotice(scenarioText.value.deleteSynced)
  else if (status === 'local')
    showNotice(scenarioText.value.deleteLocal)
  else
    showNotice(scenarioText.value.deleteSyncFailed, 'error')
}

function onDuplicateScenario(scenario) {
  store.duplicateScenario(scenario)
  showNotice(scenarioText.value.duplicateSuccess)
}

let printFrame = null

onBeforeUnmount(() => {
  printFrame?.remove()
  printFrame = null
})

function onPrint() {
  writeRoiPrintSnapshot({
    input: store.input,
    language: store.language,
    scenarioName: store.scenarioName,
    customerName: store.customerName,
    scenarioNotes: store.scenarioNotes,
    productName: heroProductName.value,
  })

  printFrame?.remove()

  const { href } = router.resolve('/roi-report-print')
  const iframe = document.createElement('iframe')

  // ต้องมีขนาดจริงเพื่อให้ layout/chart ข้างในคำนวณถูก แค่ย้ายออกนอกจอแทนการ display:none
  iframe.style.position = 'absolute'
  iframe.style.left = '-10000px'
  iframe.style.top = '0'
  iframe.style.width = '1120px'
  iframe.style.height = '1584px'
  iframe.style.border = '0'
  iframe.setAttribute('aria-hidden', 'true')
  iframe.src = href

  iframe.addEventListener('load', () => {
    iframe.contentWindow?.addEventListener('afterprint', () => {
      iframe.remove()
      if (printFrame === iframe)
        printFrame = null
    })
  })

  printFrame = iframe
  document.body.appendChild(iframe)
}

watch(() => store.language, value => {
  locale.value = value
  document.documentElement.lang = value
}, { immediate: true })

// เปิด scenario ของเครื่องไหน ให้ selector บน navbar เด้งตาม (sync ref อย่างเดียว ไม่ทับ input)
watch(() => store.productId, id => {
  if (id === null || id === selectedProduct.value?.id)
    return

  const match = products.value.find(product => product.id === id)
  if (match)
    selectedProduct.value = match
})

onMounted(async () => {
  store.hydrate()
  await loadProducts()

  // scenario ที่ restore มาก่อน products โหลดเสร็จ — sync selector ให้ตรงเครื่องของ scenario
  const restoredProduct = products.value.find(product => product.id === store.productId)
  if (restoredProduct)
    selectedProduct.value = restoredProduct

  const status = selectedProduct.value
    ? await store.loadRemoteScenarios({ productId: selectedProduct.value.id, limit: MAX_SESSION_TABS })
    : await store.loadRemoteScenarios()
  if (status === 'error')
    showNotice('Database list refresh failed', 'error')

  // scenario จาก database มาถึงหลังเลือกเครื่องแล้ว — เติม tab ให้เครื่องที่เลือกอยู่
  if (selectedProduct.value)
    store.openTabsForProduct(selectedProduct.value.id, MAX_SESSION_TABS)
})
</script>

<template>
  <main
    class="roi-app"
    :class="[isFullWidth && 'roi-app-fullwidth']"
  >
    <RoiNavbar
      :language="store.language"
      :is-full-width="isFullWidth"
      :print-label="tr.print"
      :full-width-label="tr.fullWidth"
      :products="products"
      :selected-product-id="selectedProduct?.id ?? null"
      :selected-product-name="selectedProduct?.name ?? 'Select machine'"
      :is-products-loading="isProductsLoading"
      @print="onPrint"
      @select-product="selectProduct"
      @toggle-full-width="isFullWidth = !isFullWidth"
      @update-language="store.setLanguage"
      @open-settings="isSettingsDialogVisible = true"
    />

    <RoiSettingsDialog
      v-model="isSettingsDialogVisible"
      :products="products"
      :initial-product-id="selectedProduct?.id ?? null"
      :labels="labels"
      :tr="tr"
      :formatter-locale="formatterLocale"
      @saved="onProductDefaultsSaved"
      @notice="notice => showNotice(notice.text, notice.color)"
    />

    <section class="hero-shell roi-shell">
      <div class="eyebrow">
        {{ tr.eyebrow }}
      </div>
      <h1>
        {{ tr.titleA }} <span>{{ heroProductName }}</span>
      </h1>
      <p>{{ tr.desc }}</p>
    </section>

    <RoiScenarioBrowser
      :current-local-id="store.currentLocalId"
      :format-saved-at="formatSavedAt"
      :is-remote-loading="store.isRemoteLoading"
      :preset-key="store.presetKey"
      :rename-draft="store.renameDraft"
      :renaming-local-id="store.renamingLocalId"
      :saved-scenario-count="store.savedScenarios.length"
      :scenario-groups="visibleScenarioGroups"
      :sort-mode="store.sortMode"
      :visible-preset-keys="store.visiblePresetKeys"
      :visible-tabs="visibleSessionTabs"
      @activate-preset-tab="store.activatePresetTab"
      @close-preset-tab="store.closePresetTab"
      @create-default-scenario="store.createDefaultDraft(selectedProduct)"
      @cancel-rename-scenario="store.cancelRenameScenario"
      @close-scenario-tab="store.closeScenarioTab"
      @delete-scenario="onDeleteScenario"
      @duplicate-scenario="onDuplicateScenario"
      @open-scenario="onOpenScenario"
      @rename-draft-change="updateRenameDraft"
      @set-sort-mode="updateSortMode"
      @start-rename-scenario="store.startRenameScenario"
      @submit-rename-scenario="onRenameScenario"
    />

    <section class="calculator-grid roi-shell">
      <section class="input-panel">
        <div class="input-panel-head">
          <div class="session-name-block">
            <h2 class="product-title">
              <!--
                <VIcon
                icon="tabler-robot"
                size="20"
                /> 
              -->
              <span>{{ heroProductName }}</span>
            </h2>
            <div class="input-title">
              {{ tr.inputTitle }}
            </div>
            <p class="subtext">
              {{ tr.inputSub }}
            </p>
          </div>
          <button
            class="btn-outline"
            type="button"
            @click="isSaveDialogVisible = true"
          >
            <VIcon
              icon="tabler-device-floppy"
              size="16"
            />
            <span>{{ scenarioText.save }}</span>
          </button>
        </div>

        <div
          v-for="group in uiGroups"
          :key="group.title"
          class="input-group"
        >
          <div class="group-head">
            <h3>{{ tr[group.title] }}</h3>
            <span class="tag">{{ tr[group.tag] }}</span>
          </div>

          <div class="grid2">
            <div
              v-for="key in group.keys"
              :key="key"
              class="field"
              :class="[key === SECONDS_INPUT_KEY && 'field-tenko-time']"
            >
              <div class="field-label-row">
                <label :for="key">{{ labels[key] }}</label>
                <VTooltip
                  location="top"
                  content-class="roi-help-tooltip"
                >
                  <template #activator="{ props }">
                    <button
                      class="info-btn"
                      type="button"
                      v-bind="props"
                    >
                      i
                    </button>
                  </template>

                  <div class="roi-help-tooltip__inner">
                    {{ getFieldTooltip(store.language, key) }}
                  </div>
                </VTooltip>
              </div>

              <input
                :id="key"
                class="input-control"
                :disabled="key === 'employeeCostFactor' && store.factorChoice !== 'custom'"
                :min="fieldMin(key)"
                :max="key === 'years' ? 10 : undefined"
                :step="fieldStep(key)"
                :value="fieldDisplayValue(key)"
                type="number"
                @input="onNumericInput(key, $event)"
              >

              <div
                v-if="key === 'otHoursPerDay'"
                class="util-caption"
              >
                {{ store.autoOTEnabled && !store.otEdited ? tr.autoOn : tr.autoOff }}
              </div>
            </div>
          </div>

          <template v-if="group.title === 'operation'">
            <div class="util-card util-card-full">
              <div class="util-top">
                <div>
                  <small>{{ tr.utilTitle }}</small>
                  <strong>{{ `${store.result.utilPct.toFixed(1)}%` }}</strong>
                </div>
                <span
                  class="util-status"
                  :class="[store.result.statusColor]"
                >{{ store.result.status }}</span>
              </div>

              <div class="util-bar">
                <div
                  class="util-fill"
                  :class="[store.result.statusColor]"
                  :style="{ width: `${Math.min(100, store.result.utilPct)}%` }"
                />
              </div>
              <div class="util-caption">
                {{ tr.utilLegend }}
              </div>
            </div>

            <p class="hint">
              {{ tr.autoOtHint }}
            </p>
          </template>

          <template v-if="group.title === 'productivity'">
            <div class="field factor-block">
              <div class="field-label-row">
                <label>{{ tr.factorChoice }}</label>
                <VTooltip
                  location="top"
                  content-class="roi-help-tooltip"
                >
                  <template #activator="{ props }">
                    <button
                      class="info-btn"
                      type="button"
                      v-bind="props"
                    >
                      i
                    </button>
                  </template>

                  <div class="roi-help-tooltip__inner">
                    {{ getFieldTooltip(store.language, 'employeeCostFactorChoice') }}
                  </div>
                </VTooltip>
              </div>

              <div class="factor-options">
                <button
                  v-for="choice in uiFactorChoices"
                  :key="choice.value"
                  class="factor-option"
                  :class="[store.factorChoice === choice.value && 'active']"
                  type="button"
                  @click="store.selectFactor(choice.value)"
                >
                  <span class="factor-radio" />
                  <span class="factor-option-copy">
                    <b>{{ tr[choice.title] }}</b>
                    <small>{{ choice.value === 'custom' ? tr.factorCustom : tr[choice.desc] }}</small>
                  </span>
                  <input
                    v-if="choice.value === 'custom'"
                    :value="store.input.employeeCostFactor"
                    class="factor-val factor-input"
                    type="number"
                    min="0"
                    step="0.01"
                    @click.stop
                    @input="onNumericInput('employeeCostFactor', $event)"
                  >
                  <span
                    v-else
                    class="factor-val"
                  >{{ choice.value }}</span>
                </button>
              </div>
            </div>

            <p class="hint">
              {{ tr.factorHint }}
            </p>
          </template>
        </div>

        <div class="btn-row">
          <button
            class="btn-solid"
            type="button"
            @click="resetEditor"
          >
            <VIcon
              icon="tabler-rotate-clockwise-2"
              size="16"
            />
            <span>{{ tr.reset }}</span>
          </button>
        </div>
      </section>

      <section class="result-stack">
        <div class="summary-grid">
          <div
            v-for="metric in metricCards"
            :key="metric.title"
            class="metric-card"
          >
            <small>{{ metric.title }}</small>
            <strong
              class="metric-value"
              :class="[metric.tone]"
            >{{ metric.value }}</strong>
            <div class="mini">
              {{ metric.mini }}
            </div>
          </div>
        </div>

        <div class="result-panel">
          <div class="section-head">
            <div>
              <h2>{{ tr.execTitle }}</h2>
              <p>{{ tr.execDesc }}</p>
            </div>
          </div>

          <div class="compare-grid">
            <div class="compare-box old">
              <header>{{ tr.oldMethod }}</header>
              <div class="compare-row">
                <span>{{ tr.annualCost }}</span><strong>{{ fmt(store.result.oldTotal) }}</strong>
              </div>
              <div class="compare-row">
                <span>{{ tr.annualTime }}</span><strong>{{ hrs(store.result.oldTimeYear)
                }}</strong>
              </div>
              <div class="compare-row">
                <span>{{ tr.prodLoss }}</span><strong>{{ fmt(store.result.oldProd) }}</strong>
              </div>
              <div class="compare-row total">
                <span>{{ tr.totalCost }}</span><strong>{{ fmt(store.result.oldGrand)
                }}</strong>
              </div>
            </div>

            <div class="compare-box new">
              <header>Tenko Robot</header>
              <div class="compare-row">
                <span>{{ tr.annualCost }}</span><strong>{{ fmt(store.result.newTotal) }}</strong>
              </div>
              <div class="compare-row">
                <span>{{ tr.annualTime }}</span><strong>{{ hrs(store.result.newTimeYear)
                }}</strong>
              </div>
              <div class="compare-row">
                <span>{{ tr.prodLoss }}</span><strong>{{ fmt(store.result.newProd) }}</strong>
              </div>
              <div class="compare-row total">
                <span>{{ tr.totalCost }}</span><strong>{{ fmt(store.result.newGrand)
                }}</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="result-panel">
          <div class="section-head">
            <div>
              <h2>{{ tr.costBreakTitle }}</h2>
              <p>{{ tr.costBreakDesc }}</p>
            </div>
          </div>

          <div class="compare-grid">
            <div class="compare-box old">
              <header>{{ tr.oldMethod }}</header>
              <div class="compare-row">
                <span>{{ tr.staffByUtil }}</span><strong>{{ fmt(store.result.oldLabor)
                }}</strong>
              </div>
              <div class="compare-row">
                <span>{{ tr.baseSalary }}</span><strong>{{ fmt(store.result.baseSalaryCost)
                }}</strong>
              </div>
              <div class="compare-row">
                <span>{{ tr.otCost }}</span><strong>{{ fmt(store.result.otCost) }}</strong>
              </div>
              <div class="compare-row">
                <span>{{ tr.extras }}</span><strong>{{ fmt(store.result.staffExtras) }}</strong>
              </div>
              <div class="compare-row">
                <span>{{ tr.dep }}</span><strong>{{ fmt(store.result.oldDep) }}</strong>
              </div>
              <div class="compare-row">
                <span>{{ tr.maint }}</span><strong>{{ fmt(store.result.oldMaint) }}</strong>
              </div>
              <div class="compare-row">
                <span>{{ tr.cal }}</span><strong>{{ fmt(store.result.oldCal) }}</strong>
              </div>
              <div class="compare-row total">
                <span>{{ tr.annualCost }}</span><strong>{{ fmt(store.result.oldTotal)
                }}</strong>
              </div>
            </div>

            <div class="compare-box new">
              <header>Tenko Robot</header>
              <div class="compare-row">
                <span>{{ tr.tenkoMonthly }}</span><strong>{{ fmt(store.result.newMonthly)
                }}</strong>
              </div>
              <div class="compare-row">
                <span>{{ tr.setup }}</span><strong>{{ fmt(store.result.newSetup) }}</strong>
              </div>
              <div class="compare-row">
                <span>{{ tr.other }}</span><strong>{{ fmt(store.result.newOther) }}</strong>
              </div>
              <div class="compare-row">
                <span>{{ tr.recordingStaff }}</span><strong>{{ `${fmt(0)} / ${tr.automated}` }}</strong>
              </div>
              <div class="compare-row total">
                <span>{{ tr.annualCost }}</span><strong>{{ fmt(store.result.newTotal)
                }}</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="result-panel">
          <div class="section-head">
            <div>
              <h2>{{ tr.productivityPanelTitle }}</h2>
              <p>{{ tr.productivityPanelDesc }}</p>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <small>{{ tr.cycle }}</small><strong>{{ mins(store.result.cycle) }}</strong>
            </div>
            <div class="kpi-card">
              <small>{{ tr.costPerMin }}</small><strong>{{
                `${fmt1(store.result.costPerMin)}/${tr.min}`
              }}</strong>
            </div>
            <div class="kpi-card">
              <small>{{ tr.timeSaveDay }}</small><strong>{{ hrs(store.result.timeSaveDay)
              }}</strong>
            </div>
            <div class="kpi-card">
              <small>{{ tr.roiFromTotal }}</small><strong>{{ `${store.result.roi.toFixed(1)}%`
              }}</strong>
            </div>
          </div>
        </div>

        <div class="result-panel chart-panel">
          <div class="section-head">
            <div>
              <h2>{{ tr.chartTitle }}</h2>
              <p>{{ tr.chartDesc }}</p>
            </div>
          </div>
          <div class="chartbox">
            <Line
              :data="chartData"
              :options="chartOptions"
            />
          </div>
        </div>

        <div class="result-panel chart-panel time-chart-panel">
          <div class="section-head">
            <div>
              <h2>{{ tr.timeChartTitle }}</h2>
              <p>{{ tr.timeChartDesc }}</p>
            </div>
          </div>
          <div class="chartbox">
            <Bar
              :data="timeCostChartData"
              :options="timeCostChartOptions"
            />
          </div>
        </div>
      </section>
    </section>

    <VDialog
      v-model="isSaveDialogVisible"
      max-width="760"
    >
      <VCard class="roi-save-dialog">
        <VCardTitle class="roi-save-dialog__title">
          <div class="roi-save-dialog__header-copy">
            <div class="roi-save-dialog__eyebrow">
              {{ scenarioText.metadataTitle }}
            </div>
            <h2>{{ scenarioText.metadataSub }}</h2>
          </div>

          <button
            class="roi-save-dialog__close"
            type="button"
            :aria-label="scenarioText.close"
            @click="isSaveDialogVisible = false"
          >
            <VIcon icon="tabler-x" />
          </button>
        </VCardTitle>

        <VCardText class="roi-save-dialog__body">
          <div class="roi-save-dialog__fields">
            <div class="field">
              <div class="field-label-row">
                <label for="scenarioName">{{ scenarioText.scenario }}</label>
              </div>
              <input
                id="scenarioName"
                v-model="store.scenarioName"
                class="input-control"
                type="text"
              >
            </div>

            <div class="field">
              <div class="field-label-row">
                <label for="customerName">{{ scenarioText.customerName }}</label>
              </div>
              <input
                id="customerName"
                v-model="store.customerName"
                class="input-control"
                :placeholder="scenarioText.customerPlaceholder"
                type="text"
              >
            </div>
          </div>

          <div class="field roi-save-dialog__notes">
            <div class="field-label-row">
              <label for="scenarioNotes">{{ scenarioText.notes }}</label>
            </div>
            <textarea
              id="scenarioNotes"
              v-model="store.scenarioNotes"
              class="textarea-control"
              :placeholder="scenarioText.notesPlaceholder"
            />
          </div>
        </VCardText>

        <VCardActions>
          <VBtn
            class="roi-save-dialog__button"
            variant="elevated"
            color="default"
            @click="isSaveDialogVisible = false"
          >
            {{ scenarioText.cancel }}
          </VBtn>
          <VBtn
            class="roi-save-dialog__button roi-save-dialog__button-primary"
            variant="elevated"
            color="primary"
            @click="onConfirmSaveScenario"
          >
            {{ scenarioText.save }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <VSnackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="bottom right"
    >
      {{ snackbar.text }}
    </VSnackbar>
  </main>
</template>
