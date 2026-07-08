<script setup lang="ts">
import robotImage from '@/assets/images/roi/tenko-robot-main.png'
import { Line } from 'vue-chartjs'

defineProps<{
  chartData: Record<string, unknown>
  chartOptions: Record<string, unknown>
  customerName: string
  fmt: (value: number) => string
  fmt1: (value: number) => string
  formatterLocale: string
  hrs: (value: number, rounded?: boolean) => string
  input: Record<string, number>
  labels: Record<string, string>
  mins: (value: number) => string
  printMetrics: Array<{ icon: string, title: string, value: string, note: string, accent: boolean, tone: string }>
  result: Record<string, any>
  scenarioName: string
  scenarioNotes: string
  scenarioText: Record<string, string>
  tr: Record<string, string>
}>()

function clampText(value: string, limit: number) {
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
      <div class="pr-bg-lines" />
      <div class="pr-topline">
        <div>{{ tr.printBrandSmall }}</div>
        <div class="pr-logo-mark">
          TENKO<span>ROBOT</span>
        </div>
      </div>

      <div class="pr-hero-title">
        <div class="pr-title">
          {{ tr.printHeroTitle }}
        </div>
        <div class="pr-subtitle">
          {{ tr.printHeroSubtitle }}
        </div>

        <div class="pr-brief-meta">
          <div
            v-if="customerName"
            class="pr-meta-row"
          >
            <span class="pr-meta-label">{{ scenarioText.customerName }}</span>
            <span class="pr-meta-value">{{ customerName }}</span>
          </div>

          <div class="pr-meta-row">
            <span class="pr-meta-label">{{ scenarioText.scenario }}</span>
            <span class="pr-meta-value">{{ scenarioName }}</span>
          </div>

          <div
            v-if="scenarioNotes"
            class="pr-meta-row"
          >
            <span class="pr-meta-label">{{ scenarioText.notes }}</span>
            <span class="pr-meta-value">{{ clampText(scenarioNotes, 120) }}</span>
          </div>
        </div>
      </div>

      <img
        class="pr-robot-main"
        :src="robotImage"
        alt="Tenko Robot"
      >

      <div class="pr-impact-panel">
        <div
          v-for="(item, index) in printMetrics"
          :key="item.title"
          :class="['pr-impact-item', index === printMetrics.length - 1 && 'last']"
        >
          <div :class="['pr-icon', item.accent && 'pr-icon-orange']">
            {{ item.icon }}
          </div>
          <div>
            <div class="pr-impact-title">
              {{ item.title }}
            </div>
            <div :class="['pr-impact-value', item.tone]">
              {{ item.value }}
            </div>
            <div class="pr-impact-mini">
              {{ item.note }}
            </div>
          </div>
        </div>
      </div>

      <div class="pr-lower-grid">
        <div class="pr-compare-panel">
          <div class="pr-compare-head">
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

        <div class="print-chart pr-chart-panel">
          <div class="pr-chart-head">
            <div class="pr-chart-title">
              {{ tr.chartTitle }}
            </div>
            <div class="pr-chart-desc">
              {{ tr.chartDesc }}
            </div>
          </div>
          <div class="pr-chartbox">
            <Line :data="chartData" :options="chartOptions" />
          </div>
        </div>
      </div>
    </div>

    <div class="print-page print-details">
      <div class="pr-bg-lines" />
      <div class="pr-topline detail">
        <div>TENKO ROI CALCULATOR</div>
        <div class="pr-logo-mark">
          TENKO<span>ROBOT</span>
        </div>
      </div>

      <div class="pr-title detail-title">
        {{ tr.printDetailTitle }}
      </div>
      <div class="pr-subtitle detail-subtitle">
        {{ tr.printDetailSubtitle }}
      </div>

      <div class="pr-kpi-grid">
        <div class="pr-kpi">
          <small>{{ tr.cycle }}</small>
          <strong>{{ mins(result.cycle) }}</strong>
        </div>
        <div class="pr-kpi">
          <small>{{ tr.costPerMin }}</small>
          <strong>{{ `${fmt1(result.costPerMin)}/${tr.min}` }}</strong>
        </div>
        <div class="pr-kpi">
          <small>{{ tr.utilTitle }}</small>
          <strong>{{ `${result.utilPct.toFixed(1)}%` }}</strong>
        </div>
        <div class="pr-kpi">
          <small>{{ tr.roiFromTotal }}</small>
          <strong>{{ `${result.roi.toFixed(1)}%` }}</strong>
        </div>
      </div>

      <div class="pr-note">
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
