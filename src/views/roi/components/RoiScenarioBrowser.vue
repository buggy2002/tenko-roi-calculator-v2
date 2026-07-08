<script setup lang="ts">
import { computed, ref } from 'vue'
import { roiPresets } from '@/utils/roi/presets'
import type { ScenarioListGroup, ScenarioSortMode, StoredScenario } from '@/utils/roi/scenario-types'
import type { PresetKey } from '@/utils/roi/types'

const props = defineProps<{
  currentLocalId: string | null
  formatSavedAt: (value: string) => string
  isRemoteLoading: boolean
  presetKey: PresetKey
  renameDraft: string
  renamingLocalId: string | null
  savedScenarioCount: number
  scenarioGroups: ScenarioListGroup[]
  scenarioText: Record<string, string>
  sortMode: ScenarioSortMode
  visibleTabs: StoredScenario[]
}>()

const emit = defineEmits<{
  (event: 'activate-preset-tab', value: PresetKey): void
  (event: 'close-scenario-tab', value: string): void
  (event: 'duplicate-scenario', value: StoredScenario): void
  (event: 'open-scenario', value: StoredScenario): void
  (event: 'rename-draft-change', value: string): void
  (event: 'set-sort-mode', value: ScenarioSortMode): void
  (event: 'start-rename-scenario', value: StoredScenario): void
  (event: 'cancel-rename-scenario'): void
  (event: 'submit-rename-scenario', value: StoredScenario): void
  (event: 'delete-scenario', value: StoredScenario): void
}>()

const listOpen = ref(false)
const search = ref('')

const filteredGroups = computed(() => {
  const needle = search.value.trim().toLowerCase()
  if (!needle)
    return props.scenarioGroups

  return props.scenarioGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item =>
        `${item.name} ${item.customerName} ${item.notes} ${props.formatSavedAt(item.savedAt)}`.toLowerCase().includes(needle),
      ),
    }))
    .filter(group => group.items.length > 0)
})

function activatePresetTab(value: string) {
  emit('activate-preset-tab', value as PresetKey)
}

function updateRenameDraft(event: Event) {
  emit('rename-draft-change', (event.target as HTMLInputElement).value)
}

function groupHeading(value: string) {
  if (value === 'remote')
    return props.scenarioText.savedInDatabase

  return props.scenarioText.localDrafts
}
</script>

<template>
  <section class="session-shell roi-shell">
    <div class="session-tabs">
      <button
        v-for="(preset, key) in roiPresets"
        :key="key"
        type="button"
        :class="['session-tab', 'session-preset-tab', currentLocalId === null && presetKey === key && 'active']"
        @click="activatePresetTab(key)"
      >
        <span class="session-tab-main">{{ preset.name }}</span>
      </button>

      <div
        v-for="scenario in visibleTabs"
        :key="scenario.localId"
        :class="['session-tab', currentLocalId === scenario.localId && 'active']"
      >
        <button
          class="session-tab-main"
          type="button"
          @click="emit('open-scenario', scenario)"
        >
          {{ scenario.name }}
        </button>
        <button
          class="session-tab-close"
          type="button"
          :aria-label="scenarioText.closeTab"
          @click="emit('close-scenario-tab', scenario.localId)"
        >
          <VIcon icon="tabler-x" size="16" />
        </button>
      </div>
    </div>

    <div class="session-list-wrap">
      <button
        class="session-list-trigger"
        type="button"
        @click="listOpen = true"
      >
        <span>list</span>
        <VIcon icon="tabler-layout-list" size="18" />
      </button>
    </div>

    <VDialog
      v-model="listOpen"
      max-width="860"
      scrollable
    >
      <VCard rounded="xl">
        <VCardTitle class="d-flex align-center justify-space-between gap-4">
          <span>{{ scenarioText.browseSaved }}</span>
          <button
            class="btn-icon"
            type="button"
            @click="listOpen = false"
          >
            <VIcon icon="tabler-x" />
          </button>
        </VCardTitle>

        <VCardText>
          <div class="scenario-list-search-row">
            <input
              v-model="search"
              class="search-control"
              :placeholder="scenarioText.searchSaved"
              type="text"
            >

            <div class="scenario-list-sort scenario-list-sort-inline rounded-3xl">
              <button
                class="scenario-sort-button"
                :class="{ active: sortMode === 'recent' }"
                type="button"
                @click="emit('set-sort-mode', 'recent')"
              >
                {{ scenarioText.recent }}
              </button>
              <button
                class="scenario-sort-button"
                :class="{ active: sortMode === 'name' }"
                type="button"
                @click="emit('set-sort-mode', 'name')"
              >
                {{ scenarioText.name }}
              </button>
            </div>
          </div>

          <div
            v-if="isRemoteLoading && savedScenarioCount === 0"
            class="px-3 py-6 text-center text-sm"
          >
            {{ scenarioText.loading }}
          </div>

          <div
            v-else-if="filteredGroups.length === 0"
            class="px-3 py-6 text-center text-sm"
          >
            {{ scenarioText.noSaved }}
          </div>

          <div
            v-else
            class="d-grid gap-4"
          >
            <div
              v-for="group in filteredGroups"
              :key="group.value"
            >
              <div class="text-overline mb-3">
                {{ groupHeading(group.value) }}
              </div>

              <div class="d-grid gap-3">
                <div
                  v-for="scenario in group.items"
                  :key="scenario.localId"
                  :class="['scenario-list-item', 'rounded-2xl', 'px-3', 'py-3', currentLocalId === scenario.localId && 'scenario-list-item-active']"
                >
                  <template v-if="renamingLocalId === scenario.localId">
                    <div class="scenario-rename-wrap">
                      <input
                        :value="renameDraft"
                        class="input-control"
                        type="text"
                        @input="updateRenameDraft"
                        @keydown.enter.prevent="emit('submit-rename-scenario', scenario)"
                        @keydown.esc.prevent="emit('cancel-rename-scenario')"
                      >

                      <div class="scenario-rename-actions">
                        <button
                          class="scenario-list-icon-button confirm"
                          type="button"
                          @click="emit('submit-rename-scenario', scenario)"
                        >
                          <VIcon icon="tabler-check" size="16" />
                        </button>
                        <button
                          class="scenario-list-icon-button"
                          type="button"
                          @click="emit('cancel-rename-scenario')"
                        >
                          <VIcon icon="tabler-x" size="16" />
                        </button>
                      </div>
                    </div>
                  </template>

                  <template v-else>
                    <div class="scenario-list-head">
                      <button
                        class="scenario-list-title text-left"
                        type="button"
                        @click="emit('open-scenario', scenario); listOpen = false"
                      >
                        {{ scenario.name }}
                      </button>

                      <div class="scenario-list-actions">
                        <button
                          class="scenario-list-icon-button"
                          type="button"
                          @click="emit('start-rename-scenario', scenario)"
                        >
                          <VIcon icon="tabler-pencil" size="16" />
                        </button>
                        <button
                          class="scenario-list-icon-button"
                          type="button"
                          @click="emit('duplicate-scenario', scenario)"
                        >
                          <VIcon icon="tabler-copy-plus" size="16" />
                        </button>
                        <button
                          class="scenario-list-icon-button danger"
                          type="button"
                          @click="emit('delete-scenario', scenario)"
                        >
                          <VIcon icon="tabler-trash" size="16" />
                        </button>
                      </div>
                    </div>

                    <div class="scenario-list-meta mt-2">
                      {{ scenario.customerName ? `${scenario.customerName} | ` : '' }}{{ formatSavedAt(scenario.savedAt) }}
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VDialog>
  </section>
</template>
