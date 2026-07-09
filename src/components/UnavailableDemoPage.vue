<script setup>
defineProps({
  title: { type: String, required: true },
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VAlert
        type="warning"
        variant="tonal"
        title="Demo Unavailable"
        :text="`${title} examples are not included in this workspace.`"
      />
    </VCol>
  </VRow>
</template>
