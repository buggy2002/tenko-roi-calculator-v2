<script setup>
import navItems from '@/navigation/vertical'
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import { VerticalNavLayout } from '@layouts'
</script>

<template>
  <VerticalNavLayout :nav-items="navItems">
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn
          id="vertical-nav-toggle-btn"
          class="ms-n3 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon
            size="26"
            icon="tabler-menu-2"
          />
        </IconBtn>

        <div class="text-h6 font-weight-bold ms-2">
          Tenko ROI Calculator
        </div>

        <VSpacer />
        <NavbarThemeSwitcher />
      </div>
    </template>

    <slot />

    <template #footer>
      <Footer />
    </template>
  </VerticalNavLayout>
</template>
