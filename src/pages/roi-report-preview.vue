<script setup>
import RoiPrintPage from '@/views/roi/RoiPrintPage.vue'

definePage({
  meta: {
    public: true,
    layout: 'blank',
  },
})
</script>

<template>
  <RoiPrintPage
    :auto-print="false"
    preview-mode
  />
</template>
