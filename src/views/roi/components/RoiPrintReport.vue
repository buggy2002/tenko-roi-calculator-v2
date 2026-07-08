<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import robotImage from '@images/roi/tenko-robot-main.png'
import { Line } from 'vue-chartjs'

defineProps({
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

function clampText(value, limit) {
  if (value.length <= limit)
    return value

  return `${value.slice(0, limit - 1).trimEnd()}...`
}
</script>

<template>
  <section
    class="print-report"
    aria-hidden="true"
  >
    <div class="print-page print-executive">
      <div class="roi-print-bg-lines" />
      <div class="roi-print-topline">
        <div>{{ tr.printBrandSmall }}</div>
        <div class="roi-print-logo-mark">
          TENKO<span>ROBOT</span>
        </div>
      </div>

      <div class="roi-print-hero-title">
        <div class="roi-print-title">
          {{ tr.printHeroTitle }}
        </div>
        <div class="roi-print-subtitle">
          {{ tr.printHeroSubtitle }}
        </div>

        <div class="roi-print-brief-meta">
          <div
            v-if="customerName"
            class="roi-print-meta-row"
          >
            <span class="roi-print-meta-label">{{ scenarioText.customerName }}</span>
            <span class="roi-print-meta-value">{{ customerName }}</span>
          </div>

          <div class="roi-print-meta-row">
            <span class="roi-print-meta-label">{{ scenarioText.scenario }}</span>
            <span class="roi-print-meta-value">{{ scenarioName }}</span>
          </div>

          <div
            v-if="scenarioNotes"
            class="roi-print-meta-row"
          >
            <span class="roi-print-meta-label">{{ scenarioText.notes }}</span>
            <span class="roi-print-meta-value">{{ clampText(scenarioNotes, 120) }}</span>
          </div>
        </div>
      </div>

      <img
        class="roi-print-robot-main"
        :src="robotImage"
        alt="Tenko Robot"
      >

      <div class="roi-print-impact-panel">
        <div
          v-for="(item, index) in printMetrics"
          :key="item.title"
          class="roi-print-impact-item"
          :class="[index === printMetrics.length - 1 && 'last']"
        >
          <div
            class="roi-print-icon"
            :class="[item.accent && 'roi-print-icon-orange']"
          >
            {{ item.icon }}
          </div>
          <div>
            <div class="roi-print-impact-title">
              {{ item.title }}
            </div>
            <div
              class="roi-print-impact-value"
              :class="[item.tone]"
            >
              {{ item.value }}
            </div>
            <div class="roi-print-impact-mini">
              {{ item.note }}
            </div>
          </div>
        </div>
      </div>

      <div class="roi-print-lower-grid">
        <div class="roi-print-compare-panel">
          <div class="roi-print-compare-head">
            {{ tr.execDesc }}
          </div>

          <div class="compare-grid print-compare">
            <div class="compare-box old">
              <header>{{ tr.oldMethod }}</header>
              <div class="compare-row">
                <span>{{ tr.annualCost }}</span>
                <strong>{{ fmt(result.oldTotal) }}</strong>
              </div>
              <div class="compare-row">
                <span>{{ tr.annualTime }}</span>
                <strong>{{ hrs(result.oldTimeYear) }}</strong>
              </div>
              <div class="compare-row">
                <span>{{ tr.prodLoss }}</span>
                <strong>{{ fmt(result.oldProd) }}</strong>
              </div>
              <div class="compare-row total">
                <span>{{ tr.totalCost }}</span>
                <strong>{{ fmt(result.oldGrand) }}</strong>
              </div>
            </div>

            <div class="compare-box new">
              <header>Tenko Robot</header>
              <div class="compare-row">
                <span>{{ tr.annualCost }}</span>
                <strong>{{ fmt(result.newTotal) }}</strong>
              </div>
              <div class="compare-row">
                <span>{{ tr.annualTime }}</span>
                <strong>{{ hrs(result.newTimeYear) }}</strong>
              </div>
              <div class="compare-row">
                <span>{{ tr.prodLoss }}</span>
                <strong>{{ fmt(result.newProd) }}</strong>
              </div>
              <div class="compare-row total">
                <span>{{ tr.totalCost }}</span>
                <strong>{{ fmt(result.newGrand) }}</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="print-chart roi-print-chart-panel">
          <div class="roi-print-chart-head">
            <div class="roi-print-chart-title">
              {{ tr.chartTitle }}
            </div>
            <div class="roi-print-chart-desc">
              {{ tr.chartDesc }}
            </div>
          </div>
          <div class="roi-print-chartbox">
            <Line
              :data="chartData"
              :options="chartOptions"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="print-page print-details">
      <div class="roi-print-bg-lines" />
      <div class="roi-print-topline detail">
        <div>TENKO ROI CALCULATOR</div>
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

      <div class="roi-print-kpi-grid">
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

      <div class="roi-print-note">
        <span>{{ tr.disclaimer }}</span>
        <span v-if="customerName">{{ scenarioText.customerName }}: {{ customerName }}</span>
        <span v-if="scenarioNotes">{{ scenarioText.notes }}: {{ scenarioNotes }}</span>
        <span>
          Productivity Loss = employees x inspection days x inspection time x {{ fmt1(result.costPerMin) }}/{{ tr.min }}
        </span>
      </div>
    </div>
  </section>
</template>
