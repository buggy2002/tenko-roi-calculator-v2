<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
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
import RoiNavbar from './components/RoiNavbar.vue'
import RoiPrintReport from './components/RoiPrintReport.vue'
import RoiScenarioBrowser from './components/RoiScenarioBrowser.vue'
import { uiFactorChoices, uiGroups, uiLabels, uiText } from '@/utils/roi/ui-copy'
import { uiScenarioText } from '@/utils/roi/ui-scenario-copy'
import { getFieldTooltip } from '@/utils/roi/ui-help-copy'
import { useRoiStore } from '@/stores/roi'
import type { RoiInput } from '@/utils/roi/types'
import type { ScenarioSortMode } from '@/utils/roi/scenario-types'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, ChartTooltip, Legend)

const store = useRoiStore()
const isFullWidth = ref(false)
const snackbar = ref({ show: false, text: '', color: 'success' })

const tr = computed(() => uiText[store.language])
const labels = computed(() => uiLabels[store.language])
const scenarioText = computed(() => uiScenarioText[store.language])

const chartLabels = computed(() => [tr.value.start, ...Array.from({ length: store.result.years }, (_, index) => `${tr.value.year} ${index + 1}`)])

const formatterLocale = computed(() => store.formatterLocale)
const currencySymbol = '\u0E3F'
const fmt = (value: number) => `${currencySymbol}${Math.round(value).toLocaleString(formatterLocale.value)}`
const fmt1 = (value: number) =>
  `${currencySymbol}${Number(value || 0).toLocaleString(formatterLocale.value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`
const hrs = (value: number, rounded = false) =>
  `${(rounded ? Math.round(value) : value).toLocaleString(formatterLocale.value, { maximumFractionDigits: rounded ? 0 : 1 })} ${tr.value.hours}`
const mins = (value: number) => `${value.toLocaleString(formatterLocale.value, { maximumFractionDigits: 1 })} ${tr.value.min}`

const chartData = computed(() => ({
  labels: chartLabels.value,
  datasets: [
    {
      label: tr.value.oldMethod,
      data: store.result.oldData,
      borderColor: '#b83c32',
      backgroundColor: 'rgba(184,60,50,.07)',
      borderWidth: 3,
      pointRadius: 4,
      fill: true,
      tension: 0.32,
    },
    {
      label: 'Tenko Robot',
      data: store.result.newData,
      borderColor: '#15824e',
      backgroundColor: 'rgba(21,130,78,.07)',
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
      backgroundColor: 'rgba(184,60,50,.88)',
      borderColor: '#b83c32',
      borderWidth: 1,
      borderRadius: 10,
      borderSkipped: false,
    },
    {
      label: 'Tenko Robot',
      data: [store.result.newTimeYear],
      backgroundColor: 'rgba(21,130,78,.88)',
      borderColor: '#15824e',
      borderWidth: 1,
      borderRadius: 10,
      borderSkipped: false,
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
        callback: (value: number | string) => `${currencySymbol}${(Number(value) / 1000).toFixed(0)}K`,
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
        callback: (value: number | string) =>
          `${Number(value).toLocaleString(formatterLocale.value, { maximumFractionDigits: 0 })} ${tr.value.hours}`,
      },
    },
  },
}))

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

const printMetrics = computed(() => [
  {
    icon: 'S',
    title: tr.value.saving,
    value: fmt(store.result.annualSave),
    note: `${fmt(store.result.oldGrand)} -> ${fmt(store.result.newGrand)}`,
    tone: 'green',
    accent: false,
  },
  {
    icon: 'T',
    title: tr.value.timeSaving,
    value: hrs(store.result.timeSaveYear, true),
    note: `${hrs(store.result.oldTimeYear, true)} -> ${hrs(store.result.newTimeYear, true)}`,
    tone: 'orange',
    accent: true,
  },
  {
    icon: 'P',
    title: tr.value.prodSaving,
    value: fmt(store.result.prodSave),
    note: `${fmt(store.result.oldProd)} -> ${fmt(store.result.newProd)}`,
    tone: 'green',
    accent: false,
  },
  {
    icon: 'R',
    title: tr.value.worth,
    value: store.result.isWorth ? tr.value.worthGood : tr.value.worthBad,
    note: store.result.isWorth ? tr.value.worthGoodNote : tr.value.worthBadNote,
    tone: store.result.isWorth ? 'green' : 'red',
    accent: false,
  },
])

function showNotice(text: string, color = 'success') {
  snackbar.value = { show: true, text, color }
}

function formatSavedAt(savedAt: string) {
  return new Intl.DateTimeFormat(formatterLocale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(savedAt))
}

function fieldStep(key: keyof RoiInput) {
  if (key === 'otMultiplier' || key === 'staffCount' || key.includes('Minutes') || key === 'workHoursDay')
    return 0.1

  if (key === 'employeeCostFactor')
    return 0.01

  return 1
}

function fieldMin(key: keyof RoiInput) {
  if (key.includes('Life') || key === 'years' || key === 'workDaysYear' || key === 'workHoursDay')
    return 1

  return 0
}

function onNumericInput(key: keyof RoiInput, event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  store.updateInput(key, value)
}

function updateRenameDraft(value: string) {
  store.renameDraft = value
}

function updateSortMode(value: ScenarioSortMode) {
  store.sortMode = value
}

async function onSaveScenario() {
  const response = await store.saveScenario()
  if (response.status === 'synced')
    showNotice(scenarioText.value.saveSynced)
  else if (response.status === 'local')
    showNotice(scenarioText.value.saveLocally)
  else
    showNotice(scenarioText.value.saveSyncFailed, 'error')
}

async function onRenameScenario(scenario: any) {
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

async function onDeleteScenario(scenario: any) {
  const status = await store.deleteScenario(scenario)
  if (status === 'synced')
    showNotice(scenarioText.value.deleteSynced)
  else if (status === 'local')
    showNotice(scenarioText.value.deleteLocal)
  else
    showNotice(scenarioText.value.deleteSyncFailed, 'error')
}

function onDuplicateScenario(scenario: any) {
  store.duplicateScenario(scenario)
  showNotice(scenarioText.value.duplicateSuccess)
}

function onPrint() {
  window.print()
}

watch(() => store.language, value => {
  document.documentElement.lang = value
}, { immediate: true })

onMounted(async () => {
  store.hydrate()
  const status = await store.loadRemoteScenarios()
  if (status === 'error')
    showNotice('Database list refresh failed', 'error')
})
</script>

<template>
  <main :class="['roi-app', isFullWidth && 'roi-app-fullwidth']">
    <RoiNavbar
      :language="store.language"
      :is-full-width="isFullWidth"
      :print-label="tr.print"
      :full-width-label="tr.fullWidth"
      @print="onPrint"
      @toggle-full-width="isFullWidth = !isFullWidth"
      @update:language="store.setLanguage"
    />

    <section class="hero-shell roi-shell">
      <div class="eyebrow">
        {{ tr.eyebrow }}
      </div>
      <h1>
        {{ tr.titleA }} <span>Tenko Robot</span>
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
      :scenario-groups="store.scenarioGroups"
      :scenario-text="scenarioText"
      :sort-mode="store.sortMode"
      :visible-tabs="store.visibleTabs"
      @activate-preset-tab="store.activatePresetTab"
      @cancel-rename-scenario="store.cancelRenameScenario"
      @close-scenario-tab="store.closeScenarioTab"
      @delete-scenario="onDeleteScenario"
      @duplicate-scenario="onDuplicateScenario"
      @open-scenario="store.openScenario"
      @rename-draft-change="updateRenameDraft"
      @set-sort-mode="updateSortMode"
      @start-rename-scenario="store.startRenameScenario"
      @submit-rename-scenario="onRenameScenario"
    />

    <section class="calculator-grid roi-shell">
      <section class="input-panel">
        <div class="input-panel-head">
          <div class="session-name-block">
            <h2>{{ tr.inputTitle }}</h2>
            <p class="subtext">{{ tr.inputSub }}</p>
          </div>
          <button
            class="btn-solid"
            type="button"
            @click="onSaveScenario"
          >
            <VIcon icon="tabler-device-floppy" size="16" />
            <span>save</span>
          </button>
        </div>

        <div class="scenario-meta-block">
          <div class="section-head compact">
            <div>
              <h2>{{ scenarioText.metadataTitle }}</h2>
              <p>{{ scenarioText.metadataSub }}</p>
            </div>
          </div>

          <div class="grid2">
            <div class="field">
              <div class="field-label-row">
                <label for="scenarioName">{{ scenarioText.scenario }}</label>
              </div>
              <input id="scenarioName" v-model="store.scenarioName" class="input-control" type="text">
            </div>

            <div class="field">
              <div class="field-label-row">
                <label for="customerName">{{ scenarioText.customerName }}</label>
              </div>
              <input id="customerName" v-model="store.customerName" class="input-control" :placeholder="scenarioText.customerPlaceholder" type="text">
            </div>
          </div>

          <div class="field">
            <div class="field-label-row">
              <label for="scenarioNotes">{{ scenarioText.notes }}</label>
            </div>
            <textarea id="scenarioNotes" v-model="store.scenarioNotes" class="textarea-control" :placeholder="scenarioText.notesPlaceholder" />
          </div>
        </div>

        <div v-for="group in uiGroups" :key="group.title" class="input-group">
          <div class="group-head">
            <h3>{{ tr[group.title] }}</h3>
            <span class="tag">{{ tr[group.tag] }}</span>
          </div>

          <div class="grid2">
            <div v-for="key in group.keys" :key="key" class="field">
              <div class="field-label-row">
                <label :for="key">{{ labels[key] }}</label>
                <button class="info-btn" :title="getFieldTooltip(store.language, key, labels[key])" type="button">i</button>
              </div>

              <input
                :id="key"
                class="input-control"
                :disabled="key === 'employeeCostFactor' && store.factorChoice !== 'custom'"
                :min="fieldMin(key)"
                :max="key === 'years' ? 10 : undefined"
                :step="fieldStep(key)"
                :value="store.input[key]"
                type="number"
                @input="onNumericInput(key, $event)"
              >

              <div v-if="key === 'otHoursPerDay'" class="util-caption">
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
                <span :class="['util-status', store.result.statusColor]">{{ store.result.status }}</span>
              </div>

              <div class="util-bar">
                <div :class="['util-fill', store.result.statusColor]" :style="{ width: `${Math.min(100, store.result.utilPct)}%` }" />
              </div>
              <div class="util-caption">{{ tr.utilLegend }}</div>
            </div>

            <p class="hint">{{ tr.autoOtHint }}</p>
          </template>

          <template v-if="group.title === 'productivity'">
            <div class="field factor-block">
              <div class="field-label-row">
                <label>{{ tr.factorChoice }}</label>
                <button class="info-btn" :title="getFieldTooltip(store.language, 'employeeCostFactorChoice', tr.factorChoice)" type="button">i</button>
              </div>

              <div class="factor-options">
                <button
                  v-for="choice in uiFactorChoices"
                  :key="choice.value"
                  :class="['factor-option', store.factorChoice === choice.value && 'active']"
                  type="button"
                  @click="store.selectFactor(choice.value)"
                >
                  <span>
                    <b>{{ tr[choice.title] }}</b>
                    <small>{{ choice.value === 'custom' ? tr.factorCustom : tr[choice.desc] }}</small>
                  </span>
                  <span class="factor-val">{{ choice.value === 'custom' ? store.input.employeeCostFactor.toFixed(2) : choice.value }}</span>
                </button>
              </div>
            </div>

            <p class="hint">{{ tr.factorHint }}</p>
          </template>
        </div>

        <div class="btn-row">
          <button class="btn-outline" type="button" @click="store.resetToDefaultSession()">
            <VIcon icon="tabler-rotate-clockwise-2" size="16" />
            <span>{{ tr.reset }}</span>
          </button>
        </div>
      </section>

      <section class="result-stack">
        <div class="summary-grid">
          <div v-for="metric in metricCards" :key="metric.title" class="metric-card">
            <small>{{ metric.title }}</small>
            <strong :class="['metric-value', metric.tone]">{{ metric.value }}</strong>
            <div class="mini">{{ metric.mini }}</div>
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
              <div class="compare-row"><span>{{ tr.annualCost }}</span><strong>{{ fmt(store.result.oldTotal) }}</strong></div>
              <div class="compare-row"><span>{{ tr.annualTime }}</span><strong>{{ hrs(store.result.oldTimeYear) }}</strong></div>
              <div class="compare-row"><span>{{ tr.prodLoss }}</span><strong>{{ fmt(store.result.oldProd) }}</strong></div>
              <div class="compare-row total"><span>{{ tr.totalCost }}</span><strong>{{ fmt(store.result.oldGrand) }}</strong></div>
            </div>

            <div class="compare-box new">
              <header>Tenko Robot</header>
              <div class="compare-row"><span>{{ tr.annualCost }}</span><strong>{{ fmt(store.result.newTotal) }}</strong></div>
              <div class="compare-row"><span>{{ tr.annualTime }}</span><strong>{{ hrs(store.result.newTimeYear) }}</strong></div>
              <div class="compare-row"><span>{{ tr.prodLoss }}</span><strong>{{ fmt(store.result.newProd) }}</strong></div>
              <div class="compare-row total"><span>{{ tr.totalCost }}</span><strong>{{ fmt(store.result.newGrand) }}</strong></div>
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
              <div class="compare-row"><span>{{ tr.staffByUtil }}</span><strong>{{ fmt(store.result.oldLabor) }}</strong></div>
              <div class="compare-row"><span>{{ tr.baseSalary }}</span><strong>{{ fmt(store.result.baseSalaryCost) }}</strong></div>
              <div class="compare-row"><span>{{ tr.otCost }}</span><strong>{{ fmt(store.result.otCost) }}</strong></div>
              <div class="compare-row"><span>{{ tr.extras }}</span><strong>{{ fmt(store.result.staffExtras) }}</strong></div>
              <div class="compare-row"><span>{{ tr.dep }}</span><strong>{{ fmt(store.result.oldDep) }}</strong></div>
              <div class="compare-row"><span>{{ tr.maint }}</span><strong>{{ fmt(store.result.oldMaint) }}</strong></div>
              <div class="compare-row"><span>{{ tr.cal }}</span><strong>{{ fmt(store.result.oldCal) }}</strong></div>
              <div class="compare-row total"><span>{{ tr.annualCost }}</span><strong>{{ fmt(store.result.oldTotal) }}</strong></div>
            </div>

            <div class="compare-box new">
              <header>Tenko Robot</header>
              <div class="compare-row"><span>{{ tr.tenkoMonthly }}</span><strong>{{ fmt(store.result.newMonthly) }}</strong></div>
              <div class="compare-row"><span>{{ tr.setup }}</span><strong>{{ fmt(store.result.newSetup) }}</strong></div>
              <div class="compare-row"><span>{{ tr.other }}</span><strong>{{ fmt(store.result.newOther) }}</strong></div>
              <div class="compare-row total"><span>{{ tr.annualCost }}</span><strong>{{ fmt(store.result.newTotal) }}</strong></div>
            </div>
          </div>
        </div>

        <div class="result-panel">
          <div class="section-head">
            <div>
              <h2>{{ tr.productivity }}</h2>
              <p>{{ tr.productivityPanelDesc }}</p>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card"><small>{{ tr.cycle }}</small><strong>{{ mins(store.result.cycle) }}</strong></div>
            <div class="kpi-card"><small>{{ tr.costPerMin }}</small><strong>{{ `${fmt1(store.result.costPerMin)}/${tr.min}` }}</strong></div>
            <div class="kpi-card"><small>{{ tr.timeSaveDay }}</small><strong>{{ hrs(store.result.timeSaveDay) }}</strong></div>
            <div class="kpi-card"><small>{{ tr.roiFromTotal }}</small><strong>{{ `${store.result.roi.toFixed(1)}%` }}</strong></div>
          </div>
        </div>

        <div class="result-panel chart-panel">
          <div class="section-head">
            <div>
              <h2>{{ tr.chartTitle }}</h2>
              <p>{{ tr.chartDesc }}</p>
            </div>
          </div>
          <div class="chartbox"><Line :data="chartData" :options="chartOptions" /></div>
        </div>

        <div class="result-panel chart-panel time-chart-panel">
          <div class="section-head">
            <div>
              <h2>{{ tr.timeChartTitle }}</h2>
              <p>{{ tr.timeChartDesc }}</p>
            </div>
          </div>
          <div class="chartbox"><Bar :data="timeCostChartData" :options="timeCostChartOptions" /></div>
        </div>
      </section>
    </section>

    <RoiPrintReport
      :chart-data="chartData"
      :chart-options="chartOptions"
      :customer-name="store.customerName"
      :fmt="fmt"
      :fmt1="fmt1"
      :formatter-locale="formatterLocale"
      :hrs="hrs"
      :input="store.input"
      :labels="labels"
      :mins="mins"
      :print-metrics="printMetrics"
      :result="store.result"
      :scenario-name="store.scenarioName"
      :scenario-notes="store.scenarioNotes"
      :scenario-text="scenarioText"
      :tr="tr"
    />

    <VSnackbar v-model="snackbar.show" :color="snackbar.color" location="bottom right">
      {{ snackbar.text }}
    </VSnackbar>
  </main>
</template>
