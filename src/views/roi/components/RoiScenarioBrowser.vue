<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { roiPresets } from '@/utils/roi/presets'

const props = defineProps({
  currentLocalId: { type: String, default: null },
  formatSavedAt: { type: Function, required: true },
  isRemoteLoading: { type: Boolean, default: false },
  presetKey: { type: String, required: true },
  renameDraft: { type: String, default: '' },
  renamingLocalId: { type: String, default: null },
  savedScenarioCount: { type: Number, default: 0 },
  scenarioGroups: { type: Array, default: () => [] },
  sortMode: { type: String, required: true },
  visiblePresetKeys: { type: Array, default: () => [] },
  visibleTabs: { type: Array, default: () => [] },
})

const emit = defineEmits([
  'activatePresetTab',
  'closePresetTab',
  'createDefaultScenario',
  'closeScenarioTab',
  'duplicateScenario',
  'openScenario',
  'renameDraftChange',
  'setSortMode',
  'startRenameScenario',
  'cancelRenameScenario',
  'submitRenameScenario',
  'deleteScenario',
])

const listOpen = ref(false)
const search = ref('')
const { t, locale } = useI18n({ useScope: 'global' })

const buildTextMap = (prefix, keys) => {
  const result = {}

  keys.forEach(key => {
    result[key] = t(`${prefix}.${key}`)
  })
  
  return result
}

const scenarioKeys = [
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

const scenarioText = computed(() => {
  locale.value
  
  return buildTextMap('roiScenario', scenarioKeys)
})

const defaultTabLabel = computed(() => 'Default')

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

function activatePresetTab(value) {
  if (value === 'default') {
    emit('createDefaultScenario')

    return
  }
  emit('activatePresetTab', value)
}

function updateRenameDraft(event) {
  emit('renameDraftChange', event.target?.value ?? '')
}

function groupHeading(value) {
  if (value === 'remote')
    return scenarioText.value.savedInDatabase

  return scenarioText.value.localDrafts
}
</script>

<template>
  <section class="session-shell roi-shell">
    <div class="session-tabs">
      <div
        v-for="key in visiblePresetKeys"
        :key="key"
        class="session-tab session-preset-tab"
        :class="[
          currentLocalId === null && presetKey === key && 'active',
          key === 'default' && 'session-default-tab',
        ]"
      >
        <button
          class="session-tab-main"
          type="button"
          @click="activatePresetTab(key)"
        >
          <VIcon
            v-if="key === 'default'"
            icon="tabler-copy-plus"
            size="16"
          />
          {{ key === 'default' ? defaultTabLabel : roiPresets[key].name }}
        </button>
        <button
          v-if="key !== 'default'"
          class="session-tab-close"
          type="button"
          :aria-label="scenarioText.closeTab"
          @click.stop="emit('closePresetTab', key)"
        >
          <VIcon
            icon="tabler-x"
            size="16"
          />
        </button>
      </div>

      <div
        v-for="scenario in visibleTabs"
        :key="scenario.localId"
        class="session-tab"
        :class="[currentLocalId === scenario.localId && 'active']"
      >
        <button
          class="session-tab-main"
          type="button"
          @click="emit('openScenario', scenario)"
        >
          {{ scenario.name }}
        </button>
        <button
          class="session-tab-close"
          type="button"
          :aria-label="scenarioText.closeTab"
          @click="emit('closeScenarioTab', scenario.localId)"
        >
          <VIcon
            icon="tabler-x"
            size="16"
          />
        </button>
      </div>
    </div>

    <div class="session-list-wrap">
      <button
        class="session-list-trigger"
        type="button"
        @click="listOpen = true"
      >
        <span>{{ scenarioText.list }}</span>
        <VIcon
          icon="tabler-layout-list"
          size="18"
        />
      </button>
    </div>

    <VDialog
      v-model="listOpen"
      max-width="860"
      scrollable
    >
      <VCard class="roi-scenario-dialog">
        <VCardTitle class="roi-scenario-dialog__title">
          <div class="roi-scenario-dialog__header-copy">
            <div class="roi-scenario-dialog__eyebrow">
              Scenario Library
            </div>
            <h2>{{ scenarioText.browseSaved }}</h2>
          </div>
          <button
            class="roi-scenario-dialog__close"
            type="button"
            :aria-label="scenarioText.close"
            @click="listOpen = false"
          >
            <VIcon icon="tabler-x" />
          </button>
        </VCardTitle>

        <VCardText class="roi-scenario-dialog__body">
          <div class="scenario-list-search-row">
            <input
              v-model="search"
              class="search-control"
              :placeholder="scenarioText.searchSaved"
              type="text"
            >

            <div class="scenario-list-sort scenario-list-sort-inline">
              <button
                class="scenario-sort-button"
                :class="{ active: sortMode === 'recent' }"
                type="button"
                @click="emit('setSortMode', 'recent')"
              >
                {{ scenarioText.recent }}
              </button>
              <button
                class="scenario-sort-button"
                :class="{ active: sortMode === 'name' }"
                type="button"
                @click="emit('setSortMode', 'name')"
              >
                {{ scenarioText.name }}
              </button>
            </div>
          </div>

          <div
            v-if="isRemoteLoading && savedScenarioCount === 0"
            class="scenario-list-empty"
          >
            {{ scenarioText.loading }}
          </div>

          <div
            v-else-if="filteredGroups.length === 0"
            class="scenario-list-empty"
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
              class="scenario-list-group"
            >
              <div class="scenario-list-group-title">
                {{ groupHeading(group.value) }}
              </div>

              <div class="d-grid gap-3">
                <div
                  v-for="scenario in group.items"
                  :key="scenario.localId"
                  class="scenario-list-item"
                  :class="[currentLocalId === scenario.localId && 'scenario-list-item-active']"
                  role="button"
                  tabindex="0"
                  @click="emit('openScenario', scenario); listOpen = false"
                  @keydown.enter.prevent="emit('openScenario', scenario); listOpen = false"
                  @keydown.space.prevent="emit('openScenario', scenario); listOpen = false"
                >
                  <template v-if="renamingLocalId === scenario.localId">
                    <div
                      class="scenario-rename-wrap"
                      @click.stop
                      @keydown.stop
                    >
                      <input
                        :value="renameDraft"
                        class="input-control"
                        type="text"
                        @input="updateRenameDraft"
                        @keydown.enter.prevent="emit('submitRenameScenario', scenario)"
                        @keydown.esc.prevent="emit('cancelRenameScenario')"
                      >

                      <div class="scenario-rename-actions">
                        <button
                          class="scenario-list-icon-button confirm"
                          type="button"
                          @click="emit('submitRenameScenario', scenario)"
                        >
                          <VIcon
                            icon="tabler-check"
                            size="16"
                          />
                        </button>
                        <button
                          class="scenario-list-icon-button"
                          type="button"
                          @click="emit('cancelRenameScenario')"
                        >
                          <VIcon
                            icon="tabler-x"
                            size="16"
                          />
                        </button>
                      </div>
                    </div>
                  </template>

                  <template v-else>
                    <div class="scenario-list-head">
                      <button
                        class="scenario-list-title text-left"
                        type="button"
                        @click.stop="emit('openScenario', scenario); listOpen = false"
                      >
                        {{ scenario.name }}
                      </button>

                      <div class="scenario-list-actions">
                        <button
                          class="scenario-list-icon-button"
                          type="button"
                          @click.stop="emit('startRenameScenario', scenario)"
                        >
                          <VIcon
                            icon="tabler-pencil"
                            size="16"
                          />
                        </button>
                        <button
                          class="scenario-list-icon-button"
                          type="button"
                          @click.stop="emit('duplicateScenario', scenario)"
                        >
                          <VIcon
                            icon="tabler-copy-plus"
                            size="16"
                          />
                        </button>
                        <button
                          class="scenario-list-icon-button danger"
                          type="button"
                          @click.stop="emit('deleteScenario', scenario)"
                        >
                          <VIcon
                            icon="tabler-trash"
                            size="16"
                          />
                        </button>
                      </div>
                    </div>

                    <div class="scenario-list-meta mt-2">
                      {{ scenario.customerName ? `${scenario.customerName} | ` : '' }}
                      <!--
                        {{ formatSavedAt(scenario.savedAt)
                        }} 
                      -->
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
