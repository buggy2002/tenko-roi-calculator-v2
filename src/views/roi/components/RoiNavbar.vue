<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  language: { type: String, required: true },
  isFullWidth: { type: Boolean, default: false },
  printLabel: { type: String, required: true },
  fullWidthLabel: { type: String, required: true },
  products: { type: Array, default: () => [] },
  selectedProductId: { type: Number, default: null },
  selectedProductName: { type: String, default: 'Select machine' },
  isProductsLoading: { type: Boolean, default: false },
})

const emit = defineEmits([
  'print',
  'toggleFullWidth',
  'updateLanguage',
  'selectProduct',
  'openSettings',
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
    <div class=" nav-flex">
      <div class="brand-mark">
        {{ t('roi.brand') }}
      </div>
      <span class="brand-divider"> | </span>

      <VMenu location="bottom start">
        <template #activator="{ props }">
          <button
            class="session-list-trigger-nav"
            type="button"
            v-bind="props"
          >
            <div class="selector-nav">
              <span>{{ selectedProductName }}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              ><!-- Icon from Tabler Icons by Paweł Kuna - https://github.com/tabler/tabler-icons/blob/master/LICENSE --><path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m8 9l4-4l4 4m0 6l-4 4l-4-4"
              /></svg>
            </div>
          </button>
        </template>

        <VList min-width="100">
          <VListItem
            v-if="isProductsLoading"
            disabled
          >
            <VListItemTitle>Loading machines...</VListItemTitle>
          </VListItem>

          <template v-else>
            <VListItem
              v-for="product in products"
              :key="product.id"
              class="selector-option"
              :active="selectedProductId === product.id"
              @click="emit('selectProduct', product)"
            >
              <VListItemTitle>{{ product.name }}</VListItemTitle>
            </VListItem>
          </template>
        </VList>
      </VMenu>
    </div>

    <div class="nav-actions">
      <!--
        <button
        class="btn-icon"
        type="button"
        :aria-label="fullWidthLabel"
        @click="emit('toggleFullWidth')"
        >
        <VIcon :icon="isFullWidth ? 'tabler-minimize' : 'tabler-maximize'" />
        </button> 
      -->

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
        aria-label="Settings"
        @click="emit('openSettings')"
      >
        <VIcon icon="tabler-settings" />
      </button>

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

<style lang="css">
.nav-flex {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.session-list-trigger-nav {
  font: inherit;
}

.session-list-trigger-nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  min-width: 180px;
  gap: 8px;
  border-radius: 12px;
  padding: 10px 14px;
  transition: transform .18s ease, border-color .18s ease, background-color .18s ease, color .18s ease;
}

.btn-solid:hover {
  background: #dc5d1a;
  border-color: #dc5d1a;
}

.btn-outline,
.session-list-trigger-nav {
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, .98);
  color: var(--ink);
}

.icon-color{
  color: #000;
}

.btn-outline:hover,
.session-list-trigger-nav:hover {
  border-color: rgba(242, 106, 33, 0.377);
  color: var(--orange);
}

.selector-nav{
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}

.selector-option.v-list-item--active {
  background: rgba(242, 106, 33, 0.12);
  color: #f26a21;
}

.selector-option.v-list-item--active > .v-list-item__overlay {
  opacity: 0 !important;
}

@media (max-width: 720px) {
  .brand-mark,
  .brand-divider {
    display: none;
  }

  .session-list-trigger-nav {
    min-width: 0;
    flex: 1;
  }

  .nav-flex {
    flex: 1;
    min-width: 0;
  }
}
</style>
