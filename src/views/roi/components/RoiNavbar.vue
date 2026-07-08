<script setup lang="ts">
import type { Language } from '@/utils/roi/types'

defineProps<{
  language: Language
  isFullWidth: boolean
  printLabel: string
  fullWidthLabel: string
}>()

const emit = defineEmits<{
  (event: 'print'): void
  (event: 'toggle-full-width'): void
  (event: 'update:language', value: Language): void
}>()

const languageOptions: Array<{ value: Language, label: string }> = [
  { value: 'th', label: 'Thai' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: 'Japanese' },
]
</script>

<template>
  <header class="nav-shell">
    <div class="brand-mark">
      Tenko ROI Calculator
    </div>

    <div class="nav-actions">
      <button
        class="btn-icon"
        type="button"
        :aria-label="fullWidthLabel"
        @click="emit('toggle-full-width')"
      >
        <VIcon :icon="isFullWidth ? 'tabler-minimize' : 'tabler-maximize'" />
      </button>

      <VMenu location="bottom end">
        <template #activator="{ props }">
          <button
            class="btn-icon"
            type="button"
            v-bind="props"
            aria-label="Language"
          >
            <VIcon icon="tabler-world" />
          </button>
        </template>

        <VList min-width="180">
          <VListItem
            v-for="option in languageOptions"
            :key="option.value"
            @click="emit('update:language', option.value)"
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
