<script setup lang="ts">
/**
 * Röstpanel: NEJ (vänster) / JA (höger) — speglar de två RFID-sidorna vid
 * skärmen (3 nej-läsare + 3 ja-läsare). I pilot finns ingen hårdvara: en
 * klick/tangent = en person bippar. Pilarna ◀/▶ och N/J funkar också.
 *
 * Anonymt: panelen visar bara HUR MÅNGA som röstat (prickar), inte vad.
 */
import { onMounted, onBeforeUnmount } from 'vue'
import type { Vote } from '@/store'
import { audio } from '@/audio/AudioEngine'

const props = defineProps<{
  pending: Vote[]
  size: number
  question: string
  disabled?: boolean
}>()
const emit = defineEmits<{ cast: [Vote] }>()

function cast(v: Vote): void {
  if (props.disabled) return
  if (props.pending.length >= props.size) return
  // Klick/tangent = svep-riktning (RFID-bip har egna ljud, se App.vue).
  audio.play(v === 'ja' ? 'swipeRight' : 'swipeLeft')
  emit('cast', v)
}

function onKey(e: KeyboardEvent): void {
  if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'n') cast('nej')
  if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'j') cast('ja')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="vote">
    <p class="vote__q ink-strong">{{ question }}</p>
    <div class="vote__zones">
      <button class="vote__zone vote__zone--nej" :disabled="disabled || pending.length >= size" @click="cast('nej')">
        <span class="vote__arrow">◀</span>
        <span class="vote__word">NEJ</span>
        <span class="vote__sub mono">vänster läsare</span>
      </button>
      <button class="vote__zone vote__zone--ja" :disabled="disabled || pending.length >= size" @click="cast('ja')">
        <span class="vote__word">JA</span>
        <span class="vote__arrow">▶</span>
        <span class="vote__sub mono">höger läsare</span>
      </button>
    </div>
    <div class="vote__dots" :aria-label="`${pending.length} av ${size} har röstat`">
      <span v-for="i in size" :key="i" class="vote__dot" :class="{ 'vote__dot--on': i <= pending.length }" />
      <span class="vote__count mono">{{ pending.length }} / {{ size }} röstat</span>
    </div>
  </div>
</template>

<style scoped>
.vote {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
.vote__q {
  margin: 0;
  font-size: 1.3rem;
  text-align: center;
}
.vote__zones {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
  width: 100%;
}
.vote__zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 1.2rem 1rem;
  border-radius: 12px;
  background: var(--color-background-2);
  cursor: pointer;
  font-family: var(--font-retro);
  transition:
    background 120ms var(--ease-out),
    transform 140ms var(--ease-out),
    box-shadow 140ms var(--ease-out);
}
@media (hover: hover) and (pointer: fine) {
  .vote__zone:hover:not(:disabled) {
    transform: translateY(-2px);
  }
}
.vote__zone:active:not(:disabled) {
  transform: scale(0.97);
}
.vote__zone:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.vote__zone--nej {
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
}
.vote__zone--ja {
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  box-shadow: var(--glow-soft);
}
.vote__word {
  font-size: 2.4rem;
  letter-spacing: 0.06em;
}
.vote__arrow {
  font-size: 1.6rem;
}
.vote__sub {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: var(--color-ink-muted);
}
.vote__dots {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.vote__dot {
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  border: 1px solid var(--color-primary-dim);
  transition:
    background 180ms var(--ease-out),
    box-shadow 180ms var(--ease-out),
    transform 180ms var(--ease-out);
}
.vote__dot--on {
  background: var(--color-primary);
  box-shadow: var(--glow-soft);
  transform: scale(1.08);
}
.vote__count {
  margin-left: 0.6rem;
  color: var(--color-ink-muted);
  font-size: 0.9rem;
}
</style>
