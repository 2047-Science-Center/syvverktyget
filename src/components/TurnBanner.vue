<script setup lang="ts">
/**
 * Bandlöst läge (v49): vems tur det är att svepa. "TUR 2 AV 3 · NOAH" (namnet bara om regi/overlayen
 * skickat ?members=). Syns inte i band-läget, där läsarna identifierar personen.
 */
import { useStore } from '@/store'

defineProps<{ locked: boolean }>()
const store = useStore()
</script>

<template>
  <p v-if="store.bandlost" class="turn mono" :class="{ 'turn--locked': locked }" aria-live="polite">
    <template v-if="locked">ALLA HAR SVEPT</template>
    <template v-else>
      TUR {{ store.turn + 1 }} AV {{ store.voterCount }}<span v-if="store.turnName" class="turn__name"> · {{ store.turnName }}</span>
    </template>
  </p>
</template>

<style scoped>
.turn {
  margin: 0;
  align-self: center;
  padding: 0.25em 0.9em;
  border: 2px solid var(--color-primary);
  border-radius: 999px;
  font-size: clamp(1.1rem, 2.6vh, 1.6rem);
  letter-spacing: 0.1em;
  color: var(--color-primary);
  box-shadow: var(--glow-soft);
  text-align: center;
}
.turn__name {
  text-transform: uppercase;
  color: var(--color-ink-strong, var(--color-primary));
}
.turn--locked {
  border-color: var(--color-primary-dim);
  color: var(--color-ink-muted);
  box-shadow: none;
}
</style>
