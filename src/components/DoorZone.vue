<script setup lang="ts">
/**
 * En läsarzon: vänster = STÄNGD dörr, höger = ÖPPEN dörr. Står på samma sida
 * av skärmen som läsaren. Klick (pilot) = en person bippar. Zonen blinkar inte
 * vid röst: ingen ska kunna se vad grannen valde (prickarna visar bara att).
 */
import DoorIcon from './DoorIcon.vue'
import type { Vote } from '@/store'

const props = defineProps<{ side: Vote; disabled?: boolean }>()
const emit = defineEmits<{ cast: [Vote] }>()
const open = props.side === 'ja'
</script>

<template>
  <button
    type="button"
    class="zone"
    :class="open ? 'zone--open' : 'zone--closed'"
    :disabled="disabled"
    :aria-label="open ? 'Öppen dörr (höger läsare)' : 'Stängd dörr (vänster läsare)'"
    @click="emit('cast', side)"
  >
    <DoorIcon :open="open" :size="3.2" />
    <strong class="zone__word">{{ open ? 'ÖPPEN' : 'STÄNGD' }}</strong>
    <span class="zone__hint mono">{{ open ? 'HÖGER LÄSARE ▶' : '◀ VÄNSTER LÄSARE' }}</span>
  </button>
</template>

<style scoped>
.zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  height: 100%;
  width: 100%;
  background: var(--color-background-2);
  border: 1px solid #2a3324;
  border-radius: 12px;
  cursor: pointer;
  color: var(--color-ink-strong);
  font: inherit;
  padding: 1rem 0.6rem;
  transition:
    border-color 140ms var(--ease-out),
    transform 140ms var(--ease-out);
}
@media (hover: hover) and (pointer: fine) {
  .zone:hover:not(:disabled) {
    border-color: var(--color-primary-dim);
  }
}
.zone:active:not(:disabled) {
  transform: scale(0.97);
}
.zone:disabled {
  cursor: default;
  opacity: 0.45;
}
.zone__word {
  font-family: var(--font-retro);
  font-weight: 400;
  font-size: clamp(1.8rem, 4.4vh, 3rem);
  letter-spacing: 0.08em;
  line-height: 1;
}
.zone--closed .zone__word {
  color: #c3c8d2;
  text-shadow: none;
}
.zone--open .zone__word {
  color: var(--valv);
  text-shadow: 0 0 8px color-mix(in srgb, var(--valv) 45%, transparent);
}
.zone__hint {
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  color: var(--color-ink-muted);
  text-shadow: none;
}
</style>
