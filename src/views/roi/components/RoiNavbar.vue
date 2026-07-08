<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  language: { type: String, required: true },
  isFullWidth: { type: Boolean, default: false },
  printLabel: { type: String, required: true },
  fullWidthLabel: { type: String, required: true },
})

const emit = defineEmits([
  'print',
  'toggleFullWidth',
  'updateLanguage',
])

const { t } = useI18n({ useScope: 'global' })

const languageOptions = [
  { value: 'th', label: 'Thai' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: 'Japanese' },
]
</script>

<template>
  <header class="nav-shell">
    <div class="brand-mark">
      {{ t('roi.brand') }}
    </div>

    <div class="nav-actions">
      <button
        class="btn-icon"
        type="button"
        :aria-label="fullWidthLabel"
        @click="emit('toggleFullWidth')"
      >
        <VIcon :icon="isFullWidth ? 'tabler-minimize' : 'tabler-maximize'" />
      </button>

      <VMenu location="bottom end">
        <template #activator="{ props }">
          <button
            class="btn-icon"
            type="button"
            v-bind="props"
            :aria-label="t('roi.language')"
          >
            <VIcon icon="tabler-world" />
          </button>
        </template>

        <VList min-width="180">
          <VListItem
            v-for="option in languageOptions"
            :key="option.value"
            @click="emit('updateLanguage', option.value)"
          >
            <template #prepend>
              <VIcon
                :icon="language === option.value ? 'tabler-check' : 'tabler-language'"
                size="18"
              />
            </template>
            <VListItemTitle>{{ option.label }}</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>

      <button
        class="btn-icon"
        type="button"
        :aria-label="printLabel"
        @click="emit('print')"
      >
        <VIcon icon="tabler-printer" />
      </button>
    </div>
  </header>
</template>
