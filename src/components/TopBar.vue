<script setup lang="ts">
/** Valvbrickan till vänster, var i flödet till höger. */
import { useStore } from '@/store'
defineProps<{ label?: string }>()
const store = useStore()
</script>

<template>
  <div class="bar">
    <span class="bar__badge">{{ store.valv.name.toUpperCase() }}</span>
    <span class="bar__label"><slot>{{ label }}</slot></span>
  </div>
</template>

<style scoped>
.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-family: var(--font-retro);
  font-size: clamp(1.3rem, 3vh, 1.9rem);
  letter-spacing: 0.08em;
  color: var(--color-primary);
}
.bar__badge {
  border: 1.5px solid var(--valv);
  color: var(--valv);
  padding: 0 0.5em;
  border-radius: 4px;
  text-shadow: 0 0 6px color-mix(in srgb, var(--valv) 40%, transparent);
}
</style>
