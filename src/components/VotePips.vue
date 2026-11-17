<script setup lang="ts">
/** Prickar: visar ATT någon har röstat, aldrig vad. */
defineProps<{ count: number; size: number; label: string }>()
</script>

<template>
  <div class="pips" :aria-label="`${count} av ${size} ${label}`">
    <span v-for="i in size" :key="i" class="pip" :class="{ 'pip--on': i <= count }" />
    <span class="pips__txt mono">{{ count }} / {{ size }} {{ label }}</span>
  </div>
</template>

<style scoped>
.pips {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.7rem;
}
.pip {
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  border: 2px solid var(--color-primary-dim);
  transition:
    background 180ms var(--ease-out),
    transform 180ms var(--ease-out);
}
.pip--on {
  background: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: var(--glow-soft);
  transform: scale(1.1);
}
.pips__txt {
  margin-left: 0.4rem;
  font-size: 0.95rem;
  color: var(--color-ink-muted);
  text-shadow: none;
}
</style>
