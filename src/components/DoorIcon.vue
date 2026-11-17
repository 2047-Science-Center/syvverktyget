<script setup lang="ts">
/**
 * Dörrikonen (ur skissen). ÖPPEN = ljus i valvfärgen bakom en uppsvängd dörr.
 * STÄNGD = grå sluten dörr. Storlek i em (följer textstorleken där den står).
 */
withDefaults(defineProps<{ open: boolean; size?: number; color?: string }>(), { size: 1 })
</script>

<template>
  <svg
    class="door"
    :style="{ width: `${size}em`, height: `${size * 1.35}em` }"
    viewBox="0 0 40 54"
    aria-hidden="true"
  >
    <template v-if="open">
      <rect x="4" y="3" width="32" height="49" rx="1" fill="#1a1608" :stroke="color ?? 'var(--valv)'" stroke-width="2.5" />
      <rect x="7" y="6" width="26" height="44" :fill="color ?? 'var(--valv)'" opacity=".55" />
      <polygon points="4,3 15,8 15,47 4,52" fill="#2e2a1c" :stroke="color ?? 'var(--valv)'" stroke-width="2" />
      <circle cx="12.5" cy="28" r="1.4" :fill="color ?? 'var(--valv)'" />
    </template>
    <template v-else>
      <rect x="4" y="3" width="32" height="49" rx="1" fill="#1b1e24" :stroke="color ?? 'var(--closed)'" stroke-width="2.5" />
      <rect x="9" y="8" width="22" height="16" fill="none" :stroke="color ?? 'var(--closed)'" stroke-width="1.2" opacity=".6" />
      <rect x="9" y="28" width="22" height="18" fill="none" :stroke="color ?? 'var(--closed)'" stroke-width="1.2" opacity=".6" />
      <circle cx="30" cy="28" r="1.8" :fill="color ?? 'var(--closed)'" />
    </template>
  </svg>
</template>

<style scoped>
.door {
  display: inline-block;
  flex: none;
  vertical-align: middle;
}
</style>
