<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import growthGraphImage from '@images/roi/stats.png'
import moneyIcon from '@images/roi/money.png'
import robotImage from '@images/roi/tenko-robot-main.png'
import targetIcon from '@images/roi/target.png'
import timeIcon from '@images/roi/time.png'
import { Line } from 'vue-chartjs'
import statsIcon from '@images/roi/growth-graph-white.png'

const props = defineProps({
  chartData: { type: Object, required: true },
  chartOptions: { type: Object, required: true },
  customerName: { type: String, default: '' },
  fmt: { type: Function, required: true },
  fmt1: { type: Function, required: true },
  formatterLocale: { type: String, required: true },
  hrs: { type: Function, required: true },
  input: { type: Object, required: true },
  labels: { type: Object, required: true },
  mins: { type: Function, required: true },
  printMetrics: { type: Array, required: true },
  result: { type: Object, required: true },
  scenarioName: { type: String, required: true },
  scenarioNotes: { type: String, default: '' },
  tr: { type: Object, required: true },
})

const { t, locale } = useI18n({ useScope: 'global' })

const scenarioText = computed(() => {
  locale.value

  return {
    scenario: t('roiScenario.scenario'),
    customerName: t('roiScenario.customerName'),
    notes: t('roiScenario.notes'),
  }
})

const worthSummary = computed(() => ({
  title: props.result.isWorth ? props.tr.worthGood : props.tr.worthBad,
  note: props.result.isWorth ? props.tr.worthGoodNote : props.tr.worthBadNote,
  tone: props.result.isWorth ? 'good' : 'bad',
}))

const assumptionItems = computed(() => [
  { label: props.labels.peoplePerDay, value: formatNumber(props.input.peoplePerDay) },
  { label: props.labels.daysPerMonth, value: formatNumber(props.input.daysPerMonth) },
  { label: props.labels.minutesPerPerson, value: props.mins(props.input.minutesPerPerson) },
  { label: props.labels.tenkoMinutesPerPerson, value: props.mins(props.input.tenkoMinutesPerPerson) },
  { label: props.labels.staffCount, value: formatNumber(props.input.staffCount, 1) },
  { label: props.labels.otHoursPerDay, value: props.hrs(props.input.otHoursPerDay, false) },
])

const comparisonRows = computed(() => [
  { icon: 'C', label: props.tr.annualCost, oldValue: props.fmt(props.result.oldTotal), newValue: props.fmt(props.result.newTotal) },
  { icon: 'T', label: props.tr.annualTime, oldValue: props.hrs(props.result.oldTimeYear), newValue: props.hrs(props.result.newTimeYear) },
  { icon: 'P', label: props.tr.prodLoss, oldValue: props.fmt(props.result.oldProd), newValue: props.fmt(props.result.newProd) },
  { icon: 'R', label: props.tr.totalCost, oldValue: props.fmt(props.result.oldGrand), newValue: props.fmt(props.result.newGrand), total: true },
])

const cumulativeSaving = computed(() => {
  const oldLast = props.result.oldData.at(-1) ?? 0
  const newLast = props.result.newData.at(-1) ?? 0

  return oldLast - newLast
})

const detailSections = computed(() => [
  {
    title: props.tr.assumptions,
    accent: 'A',
    rows: [
      { label: props.labels.peoplePerDay, value: formatNumber(props.input.peoplePerDay) },
      { label: props.labels.daysPerMonth, value: formatNumber(props.input.daysPerMonth) },
      { label: props.labels.minutesPerPerson, value: props.mins(props.input.minutesPerPerson) },
      { label: props.labels.waitMinutes, value: props.mins(props.input.waitMinutes) },
      { label: props.labels.tenkoMinutesPerPerson, value: props.mins(props.input.tenkoMinutesPerPerson) },
      { label: props.labels.workDaysYear, value: formatNumber(props.input.workDaysYear) },
    ],
  },
  {
    title: props.tr.staffCost,
    accent: 'S',
    rows: [
      { label: props.tr.staffByUtil, value: props.fmt(props.result.oldLabor) },
      { label: props.tr.baseSalary, value: props.fmt(props.result.baseSalaryCost) },
      { label: props.tr.otCost, value: props.fmt(props.result.otCost) },
      { label: props.tr.extras, value: props.fmt(props.result.staffExtras) },
      { label: props.tr.costPerMin, value: `${props.fmt1(props.result.costPerMin)}/${props.tr.min}` },
      { label: props.tr.utilTitle, value: `${props.result.utilPct.toFixed(1)}%` },
    ],
  },
  {
    title: props.tr.equipment,
    accent: 'E',
    rows: [
      { label: props.tr.dep, value: props.fmt(props.result.oldDep) },
      { label: props.tr.maint, value: props.fmt(props.result.oldMaint) },
      { label: props.tr.cal, value: props.fmt(props.result.oldCal) },
      { label: props.tr.annualCost, value: props.fmt(props.result.oldTotal), total: true },
    ],
  },
  {
    title: 'Tenko Robot',
    accent: 'T',
    rows: [
      { label: props.tr.tenkoMonthly, value: props.fmt(props.result.newMonthly) },
      { label: props.tr.setup, value: props.fmt(props.result.newSetup) },
      { label: props.tr.other, value: props.fmt(props.result.newOther) },
      { label: props.tr.annualCost, value: props.fmt(props.result.newTotal), total: true },
    ],
  },
])

const benefitItems = computed(() => [
  { icon: 'S', title: props.tr.printBenefitSafeTitle, desc: props.tr.printBenefitSafeDesc },
  { icon: 'P', title: props.tr.printBenefitProdTitle, desc: props.tr.printBenefitProdDesc },
  { icon: 'I', title: props.tr.printBenefitInvestTitle, desc: props.tr.printBenefitInvestDesc },
])

const kpiIconMap = {
  S: moneyIcon,
  T: timeIcon,
  P: statsIcon,
  R: targetIcon,
}

function clampText(value, limit) {
  if (value.length <= limit)
    return value

  return `${value.slice(0, limit - 1).trimEnd()}...`
}

function formatNumber(value, maximumFractionDigits = 0) {
  return Number(value || 0).toLocaleString(props.formatterLocale, { maximumFractionDigits })
}
</script>

<template>
  <section
    class="print-report"
    aria-hidden="true"
  >
    <div class="print-page print-executive">
      <div class="roi-print-bg-lines" />

      <!-- # Header -->
      <div class="roi-print-header">
        <div class="roi-print-brand">
          <span class="roi-print-brand-dot" />
          <div class="roi-print-scenario-name">
            {{ customerName || scenarioName }}
          </div>
        </div>
        <div class="roi-print-logo-mark executive">
          TENKO ROBOT
        </div>
      </div>
      <!-- # Header -->

      <div class="roi-print-body-grid">
        <section class="roi-print-left-column">
          <div class="roi-print-hero-card">
            <!--
              <div class="roi-print-title">
              {{ tr.titleA }}
              <span>Tenko Robot</span>
              </div>

              <div class="roi-print-subtitle">
              {{ tr.desc }}
              </div> 
            -->

            <div>
              <!-- <div class="roi-print-robot-glow" /> -->
              <img
                class="roi-print-robot-main"
                :src="robotImage"
                alt="Tenko Robot"
              >
            </div>
          </div>

          <div class="roi-print-scenario-card">
            <div class="roi-print-scenario-head">
              <div class="roi-print-scenario-icon">
                <span>▣</span>
              </div>

              <div class="roi-print-scenario-copy">
                <div class="roi-print-card-badge">
                  SCENARIO
                </div>
                <div class="roi-print-scenario-name">
                  {{ customerName || scenarioName }}
                </div>
              </div>
            </div>

            <div
              v-if="customerName"
              class="roi-print-scenario-note"
            >
              {{ scenarioText.scenario }}: {{ scenarioName }}
            </div>
            <div
              v-if="scenarioNotes"
              class="roi-print-scenario-note"
            >
              {{ clampText(scenarioNotes, 90) }}
            </div>
          </div>

          <div class="roi-print-assumption-card">
            <div class="roi-print-section-head">
              {{ tr.assumptions }}
            </div>

            <div class="roi-print-assumption-list">
              <div
                v-for="item in assumptionItems"
                :key="item.label"
                class="roi-print-assumption-row"
              >
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>

            <div class="roi-print-assumption-foot">
              {{ tr.autoOtHint }}
            </div>
          </div>
        </section>

        <section class="roi-print-right-column roi-print-right-column-content">
          <div
            class="roi-print-summary-banner"
            :class="[`is-${worthSummary.tone}`]"
          >
            <div class="roi-print-summary-tag">
              {{ tr.execTitle }}
            </div> 
            <div class="roi-print-summary-main">
              <div class="roi-print-summary-mark">
                &#10003;
              </div>
              <div>
                <div class="roi-print-summary-title">
                  {{ worthSummary.title }}
                </div>
                <div class="roi-print-summary-note">
                  {{ worthSummary.note }}
                </div>
              </div>
            </div>
            <div class="roi-print-summary-graphic">
              <img
                class="roi-print-summary-graphic-image"
                :src="growthGraphImage"
                alt=""
              >
              <!--
                <div class="roi-print-summary-bars">
                <span />
                <span />
                <span />
                <span />
                </div>
                <div class="roi-print-summary-arrow">
                ↗
                </div> 
              -->
            </div>
          </div>

          <div class="roi-print-kpi-grid executive">
            <div
              v-for="item in printMetrics"
              :key="item.title"
              class="roi-print-kpi-card"
              :class="[`tone-${item.tone}`]"
            >
              <div class="roi-print-kpi-icon">
                <img
                  class="roi-print-kpi-icon-image"
                  :src="kpiIconMap[item.icon]"
                  alt=""
                >
              </div>
              <div>
                <small>{{ item.title }}</small>
                <strong>{{ item.value }}</strong>
                <div class="roi-print-kpi-mini">
                  {{ item.note }}
                </div>
              </div>
            </div>
          </div>

          <div class="roi-print-compare-table-card">
            <div class="roi-print-compare-header">
              <span>{{ tr.costBreakTitle }}</span>
            </div>

            <div class="roi-print-compare-table">
              <div class="roi-print-compare-toprow">
                <div />
                <div class="old">
                  {{ tr.oldMethod }}
                </div>
                <div class="new">
                  Tenko Robot
                </div>
              </div>

              <div
                v-for="row in comparisonRows"
                :key="row.label"
                class="roi-print-compare-line"
                :class="[row.total && 'total']"
              >
                <div class="roi-print-compare-label">
                  <span class="roi-print-compare-icon">{{ row.icon }}</span>
                  <span>{{ row.label }}</span>
                </div>
                <div class="roi-print-compare-value old">
                  {{ row.oldValue }}
                </div>
                <div class="roi-print-compare-value new">
                  {{ row.newValue }}
                </div>
              </div>
            </div>
          </div>

          <div class="roi-print-chart-card">
            <div class="roi-print-chart-head">
              <div>
                <div class="roi-print-chart-title">
                  {{ tr.chartTitle }} <span>({{ input.years }}-{{ tr.year }} Projection)</span>
                </div>
                <div class="roi-print-chart-desc">
                  {{ tr.chartDesc }}
                </div>
              </div>
            </div>

            <div class="roi-print-chart-area">
              <div class="roi-print-chartbox executive">
                <Line
                  :data="chartData"
                  :options="chartOptions"
                />
              </div>
              <div class="roi-print-saving-pill">
                <small>{{ `${tr.saving} ${input.years} ${tr.year}` }}</small>
                <strong>{{ fmt(cumulativeSaving) }}</strong>
                <span>Total Saving</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="roi-print-footer-strip">
        <div class="roi-print-footer-summary">
          <div class="roi-print-footer-icon">
            ↗
          </div>
          <div class="roi-print-footer-copy">
            <strong>{{ tr.printConclusionLine }}</strong>
          </div>
        </div>

        <div class="roi-print-footer-note">
          {{ tr.disclaimer }}
        </div>
      </div>
    </div>

    <div class="print-page print-details">
      <div class="roi-print-bg-lines" />

      <div class="roi-print-topline detail">
        <div>{{ tr.printBrandSmall }}</div>
        <div class="roi-print-logo-mark">
          TENKO<span>ROBOT</span>
        </div>
      </div>

      <div class="roi-print-title detail-title">
        {{ tr.printDetailTitle }}
      </div>
      <div class="roi-print-subtitle detail-subtitle">
        {{ tr.printDetailSubtitle }}
      </div>

      <div class="roi-print-kpi-grid detail">
        <div class="roi-print-kpi">
          <small>{{ tr.cycle }}</small>
          <strong>{{ mins(result.cycle) }}</strong>
        </div>
        <div class="roi-print-kpi">
          <small>{{ tr.costPerMin }}</small>
          <strong>{{ `${fmt1(result.costPerMin)}/${tr.min}` }}</strong>
        </div>
        <div class="roi-print-kpi">
          <small>{{ tr.utilTitle }}</small>
          <strong>{{ `${result.utilPct.toFixed(1)}%` }}</strong>
        </div>
        <div class="roi-print-kpi">
          <small>{{ tr.roiFromTotal }}</small>
          <strong>{{ `${result.roi.toFixed(1)}%` }}</strong>
        </div>
      </div>

      <div class="roi-print-detail-grid">
        <div
          v-for="section in detailSections"
          :key="section.title"
          class="roi-print-box"
        >
          <h3>
            <span class="box-icon">{{ section.accent }}</span>
            <span>{{ section.title }}</span>
          </h3>

          <div
            v-for="row in section.rows"
            :key="`${section.title}-${row.label}`"
            class="roi-print-row"
            :class="[row.total && 'total']"
          >
            <span>{{ row.label }}</span>
            <span>{{ row.value }}</span>
          </div>
        </div>
      </div>

      <div class="roi-print-note">
        <span>{{ tr.disclaimer }}</span>
        <span v-if="customerName">{{ scenarioText.customerName }}: {{ customerName }}</span>
        <span v-if="scenarioNotes">{{ scenarioText.notes }}: {{ scenarioNotes }}</span>
        <span>
          Productivity Loss = employees x inspection days x inspection time x {{ fmt1(result.costPerMin) }}/{{ tr.min }}
        </span>
      </div>

      <div class="roi-print-benefit-wrap">
        <div class="roi-print-benefit-strip">
          <div
            v-for="item in benefitItems"
            :key="item.title"
            class="roi-print-benefit-item"
          >
            <div class="roi-print-benefit-icon">
              {{ item.icon }}
            </div>
            <b>{{ item.title }}</b>
            <span>{{ item.desc }}</span>
          </div>

          <div class="roi-print-conclusion">
            <div class="trophy">
              ROI
            </div>
            <p class="roi-print-conclusion-text">
              <b>{{ tr.printConclusionTitle }}</b>
              <span>{{ tr.printConclusionLine }}</span>
              <span class="roi-print-conclusion-sub">{{ worthSummary.note }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
