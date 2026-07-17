<script setup>
import { computed, ref, watch } from 'vue'
import { uiGroups } from '@/utils/roi/ui-copy'
import { defaultInput } from '@/utils/roi/presets'
import { FORMULA_VERSION } from '@/utils/roi/constants'
import { mapInputToMachineRoiDefaults, mapMachineRoiDefaultsToInput } from '@/utils/roi/product-defaults'
import { updateRoiProductDefaults } from '@/services/roi-products'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  products: { type: Array, default: () => [] },
  initialProductId: { type: [Number, String], default: null },
  labels: { type: Object, required: true },
  tr: { type: Object, required: true },
  formatterLocale: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue', 'saved', 'notice'])

const selectedProductId = ref(null)
const draft = ref({ ...defaultInput })
const password = ref('')
const isSaving = ref(false)
const errorMessage = ref('')
const isPasswordDialogVisible = ref(false)

// ช่องเวลา Tenko เก็บภายในเป็นนาที แต่แสดง/รับค่าจากผู้ใช้เป็นวินาที
const SECONDS_INPUT_KEY = 'tenkoMinutesPerPerson'

const selectedProduct = computed(() =>
  props.products.find(product => product.id === selectedProductId.value) ?? null)

const productOptions = computed(() =>
  props.products.map(product => ({ title: product.name, value: product.id })))

const updatedAtText = computed(() => {
  const value = selectedProduct.value?.defaults_updated_at

  if (!value)
    return ''

  return new Intl.DateTimeFormat(props.formatterLocale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
})

function loadDraftFromProduct(product, source = 'machine_roi_defaults') {
  const mapped = mapMachineRoiDefaultsToInput(product?.[source])

  draft.value = mapped ? { ...mapped } : { ...defaultInput }
}

watch(() => props.modelValue, visible => {
  if (!visible) {
    isPasswordDialogVisible.value = false
    password.value = ''
    errorMessage.value = ''

    return
  }

  errorMessage.value = ''
  password.value = ''
  isPasswordDialogVisible.value = false

  const initial = props.products.find(product => product.id === props.initialProductId)
    ?? props.products[0]
    ?? null

  selectedProductId.value = initial?.id ?? null
  loadDraftFromProduct(initial)
})

watch(selectedProductId, (newId, oldId) => {
  if (newId === oldId || newId === null)
    return

  errorMessage.value = ''
  loadDraftFromProduct(selectedProduct.value)
})

function applyFactoryDefaults() {
  loadDraftFromProduct(selectedProduct.value, 'factory_defaults')
}

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
    return Number((draft.value[key] * 60).toFixed(2))

  return draft.value[key]
}

function onNumericInput(key, event) {
  const value = Number(event.target.value)

  draft.value[key] = key === SECONDS_INPUT_KEY ? value / 60 : value
}

function close() {
  isPasswordDialogVisible.value = false
  emit('update:modelValue', false)
}

function requestSave() {
  if (!selectedProduct.value || isSaving.value)
    return

  password.value = ''
  errorMessage.value = ''
  isPasswordDialogVisible.value = true
}

function closePasswordDialog() {
  if (isSaving.value)
    return

  isPasswordDialogVisible.value = false
  password.value = ''
  errorMessage.value = ''
}

async function save() {
  if (!selectedProduct.value || isSaving.value)
    return

  if (!password.value) {
    errorMessage.value = props.tr.settingsPasswordHint

    return
  }

  isSaving.value = true
  errorMessage.value = ''

  try {
    const updated = await updateRoiProductDefaults(
      selectedProduct.value.id,
      mapInputToMachineRoiDefaults(draft.value),
      { password: password.value, formulaVersion: FORMULA_VERSION },
    )

    emit('saved', updated)
    emit('notice', { text: props.tr.settingsSaved, color: 'success' })
    password.value = ''
    isPasswordDialogVisible.value = false
    close()
  }
  catch (error) {
    if (error?.response?.status === 403)
      errorMessage.value = props.tr.settingsWrongPassword
    else
      errorMessage.value = props.tr.settingsSaveFailed
  }
  finally {
    isSaving.value = false
  }
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="760"
    scrollable
    @update:model-value="value => emit('update:modelValue', value)"
  >
    <VCard class="roi-save-dialog roi-settings-dialog">
      <div class="roi-save-dialog__title roi-settings-dialog__header">
        <div class="roi-settings-dialog__header-copy">
          <div class="roi-save-dialog__eyebrow">
            SETTINGS
          </div>
          <h2>{{ tr.settingsTitle }}</h2>
          <p class="subtext">
            {{ tr.settingsDesc }}
          </p>
        </div>

        <button
          class="roi-save-dialog__close"
          type="button"
          :aria-label="tr.settingsCancel"
          @click="close"
        >
          <VIcon icon="tabler-x" />
        </button>
      </div>

      <VCardText class="roi-save-dialog__body">
        <div class="roi-settings-toolbar">
          <div class="field roi-settings-machine">
            <label>{{ tr.settingsSelectMachine }}</label>
            <VSelect
              v-model="selectedProductId"
              :items="productOptions"
              density="compact"
              hide-details
              variant="outlined"
            />
          </div>

          <!--
            <button
            class="btn-outline roi-settings-factory"
            type="button"
            @click="applyFactoryDefaults"
            >
            <VIcon
            icon="tabler-refresh"
            size="17"
            />
            {{ tr.settingsFactory }}
            </button> 
          -->
        </div>

        <div
          v-if="updatedAtText"
          class="util-caption roi-settings-updated"
        >
          {{ tr.settingsUpdatedAt }}: {{ updatedAtText }}
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
            >
              <div class="field-label-row">
                <label :for="`settings-${key}`">{{ labels[key] }}</label>
              </div>

              <input
                :id="`settings-${key}`"
                class="input-control"
                :min="fieldMin(key)"
                :max="key === 'years' ? 10 : undefined"
                :step="fieldStep(key)"
                :value="fieldDisplayValue(key)"
                type="number"
                @input="onNumericInput(key, $event)"
              >
            </div>
          </div>
        </div>
      </VCardText>

      <VCardActions class="roi-save-dialog__actions roi-settings-actions padding-top-save">
        <VBtn
          variant="elevated"
          color="default"
          @click="close"
        >
          {{ tr.settingsCancel }}
        </VBtn>
        <VBtn
          variant="elevated"
          color="primary"
          @click="requestSave"
        >
          {{ tr.settingsSave }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <VDialog
    v-model="isPasswordDialogVisible"
    max-width="420"
    persistent
  >
    <VCard class="roi-save-dialog roi-settings-key-dialog">
      <div class="roi-save-dialog__title">
        <div>
          <div class="roi-save-dialog__eyebrow">
            AUTHORIZATION
          </div>
          <h2>{{ tr.settingsPassword }}</h2>
          <p class="subtext">
            {{ tr.settingsPasswordHint }}
          </p>
        </div>
      </div>

      <VCardText class="roi-save-dialog__body">
        <input
          v-model="password"
          class="input-control"
          type="password"
          autocomplete="off"
          autofocus
          :placeholder="tr.settingsPassword"
          @keyup.enter="save"
        >
        <div
          v-if="errorMessage"
          class="roi-settings-error"
        >
          {{ errorMessage }}
        </div>
      </VCardText>

      <VCardActions class="roi-save-dialog__actions padding-top-save">
        <VBtn
          variant="elevated"
          color="default"
          :disabled="isSaving"
          @click="closePasswordDialog"
        >
          {{ tr.settingsCancel }}
        </VBtn>
        <VBtn
          variant="elevated"
          color="primary"
          :loading="isSaving"
          @click="save"
        >
          {{ tr.settingsSave }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style lang="css">
.roi-settings-toolbar {
  display: flex;
  align-items: end;
  gap: 12px;
  margin-bottom: 6px;
}

.roi-settings-dialog__header {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 0;
  gap: 20px;
  padding: 24px 26px 20px;
}

.roi-settings-dialog__header-copy {
  flex: 1;
  min-width: 0;
}

.roi-settings-dialog__header h2 {
  font-size: 23px;
  font-weight: 650;
  line-height: 1.35;
  letter-spacing: -.015em;
}

.roi-settings-dialog__header .subtext {
  max-width: 560px;
  margin: 5px 0 0;
  line-height: 1.5;
}

.roi-settings-dialog__header .roi-save-dialog__close {
  position: static;
  margin-top: 0;
}

.roi-settings-key-dialog .roi-save-dialog__title {
  flex: 0 0 auto;
  min-height: 0;
  padding-top: 22px;
  padding-bottom: 18px;
}

.roi-settings-machine {
  flex: 1;
  margin-bottom: 0;
}

.roi-settings-machine>label {
  display: block;
  margin-bottom: 5px;
}

.roi-settings-factory {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  border-radius: 10px;
  padding: 0 14px;
  white-space: nowrap;
}

.roi-settings-updated {
  margin-bottom: 8px;
}

.roi-settings-key-dialog .input-control {
  width: 100%;
}

.roi-settings-error {
  margin-top: 4px;
  color: var(--red);
  font-size: 12px;
}

.padding-top-save{
  padding-top: 12px;
}

@media (max-width: 600px) {
  .roi-settings-dialog__header {
    gap: 12px;
    padding: 18px 16px 16px;
  }

  .roi-settings-dialog__header h2 {
    font-size: 20px;
  }

  .roi-settings-dialog__header .roi-save-dialog__close {
    width: 34px;
    height: 34px;
  }
}
</style>
