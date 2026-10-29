<script setup lang="ts">
/**
 * Diskret facilitator-/pilot-rad. I drift ersätts av riggens regi; här räcker
 * starta-om, läges-/RFID-status och mute så man ser var i flödet man är under
 * test. RFID-status visar om ja/nej-läsarna är live (broker ansluten).
 */
import { inject, ref, type Ref } from 'vue'
import { config, SCREEN_ID } from '@/config'
import { useStore } from '@/store'
import { audio } from '@/audio/AudioEngine'
const store = useStore()

const rfidConnected = inject<Ref<boolean>>('rfidConnected', ref(false))
const muted = ref(audio.muted)
function toggleMute(): void {
  muted.value = audio.toggleMuted()
}

const phaseLabel: Record<string, string> = {
  attract: 'ATTRACT',
  swipe: 'SWIPE',
  barrier: 'BARRIÄR',
  reveal: 'REVEAL',
  summary: 'SAMMANSTÄLLNING',
}
</script>

<template>
  <div class="fac mono">
    <span class="fac__tag">PILOT · {{ config.pilotSync }} · SKÄRM {{ SCREEN_ID }}</span>
    <span class="fac__phase">{{ phaseLabel[store.phase] }}</span>
    <span class="fac__rfid" :class="{ 'is-live': rfidConnected }">
      <span class="fac__led" />RFID {{ rfidConnected ? 'LIVE' : 'klick' }}
    </span>
    <button class="fac__btn" :aria-pressed="muted" :title="muted ? 'Ljud av' : 'Ljud på'" @click="toggleMute">
      {{ muted ? '🔇' : '🔊' }}
    </button>
    <button class="fac__btn" @click="store.reset()">⟲ starta om</button>
  </div>
</template>

<style scoped>
.fac {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.75rem;
  color: var(--color-ink-muted);
  letter-spacing: 0.06em;
  opacity: 0.6;
  transition: opacity 160ms var(--ease-out, ease-out);
}
.fac:hover {
  opacity: 1;
}
.fac__phase {
  color: var(--color-primary);
}
.fac__rfid {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.fac__led {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-primary-dim);
  transition: background 200ms var(--ease-out, ease-out), box-shadow 200ms var(--ease-out, ease-out);
}
.fac__rfid.is-live {
  color: var(--color-primary);
}
.fac__rfid.is-live .fac__led {
  background: var(--color-primary);
  box-shadow: var(--glow-soft);
}
.fac__btn {
  background: transparent;
  border: 1px solid var(--color-primary-dim);
  color: var(--color-ink-muted);
  border-radius: 6px;
  padding: 0.1rem 0.6rem;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.75rem;
  transition: transform 120ms var(--ease-out, ease-out), color 120ms, border-color 120ms;
}
.fac__btn:first-of-type {
  margin-left: auto;
}
.fac__btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.fac__btn:active {
  transform: scale(0.96);
}
</style>
