<script setup lang="ts">
/**
 * Gruppens dörrar på rad (6 = båda skärmarna). På papper används stämpel-
 * färgerna, på CRT-botten valvfärgen/grått. Ordningen är skärm A, skärm B,
 * och inget pekar ut vem som valde vad.
 */
import DoorIcon from './DoorIcon.vue'
import type { Vote } from '@/store'

withDefaults(defineProps<{ votes: Vote[]; size?: number; onPaper?: boolean }>(), { size: 1, onPaper: false })
</script>

<template>
  <span class="strip" :aria-label="`${votes.filter((v) => v === 'ja').length} av ${votes.length} öppna dörrar`">
    <DoorIcon
      v-for="(v, i) in votes"
      :key="i"
      :open="v === 'ja'"
      :size="size"
      :color="onPaper ? (v === 'ja' ? 'var(--stamp-open)' : '#5a5f6b') : undefined"
    />
  </span>
</template>

<style scoped>
.strip {
  display: inline-flex;
  gap: 0.18em;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
