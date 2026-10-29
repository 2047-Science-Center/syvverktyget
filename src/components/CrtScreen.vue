<script setup lang="ts">
/**
 * Grundskärmen — glödande bärnstensram + CRT-chrome (skanlinjer, vinjett,
 * flimmer). Ser likadan ut i alla X&Y-stationer. Innehåll via slot.
 */
withDefaults(defineProps<{ flicker?: boolean }>(), { flicker: true })
</script>

<template>
  <div class="crt-screen crt-frame crt-scanlines" :class="{ 'crt-flicker': flicker }">
    <div class="crt-screen__inner">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.crt-screen {
  width: 100%;
  height: 100%;
  min-height: 0;
}
.crt-screen__inner {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: clamp(1rem, 3vh, 2rem);
  overflow: auto;
}
</style>
