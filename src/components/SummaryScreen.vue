<script setup lang="ts">
/**
 * Slutsammanställning: hela resan. Per roll — hur gruppen röstade i swipen
 * (före) och efter att ha sett näringslivs-referensen (efter). Visar om de
 * kunde tänka sig att omvärdera.
 */
import { onMounted, onBeforeUnmount } from 'vue'
import { useStore } from '@/store'
import { audio } from '@/audio/AudioEngine'
const store = useStore()

function delta(before: number, after: number | null): number {
  return after === null ? 0 : after - before
}

// Per-roll-ljud (▲/▼/→) staggrat så det följer radernas in-animation. Avslut-
// stingern (h14) spelas på fas→summary (App.vue); raderna ljuder strax efter.
const BASE_DELAY = 280
const ROW_STEP = 60
const timers: ReturnType<typeof setTimeout>[] = []
onMounted(() => {
  store.journey.forEach((row, i) => {
    const d = delta(row.before, row.after)
    const sfx = d > 0 ? 'summaryUp' : d < 0 ? 'summaryDown' : 'summarySame'
    timers.push(setTimeout(() => audio.play(sfx), BASE_DELAY + i * ROW_STEP))
  })
})
onBeforeUnmount(() => {
  for (const t of timers) clearTimeout(t)
})
</script>

<template>
  <div class="sum">
    <header class="sum__head">
      <h2 class="sum__title ink-strong">Så valde ni</h2>
      <p class="sum__sub">
        {{ store.valv.name }} · hela gruppen på {{ store.FULL_GROUP }} — före och efter verkligheten
      </p>
    </header>

    <ul class="sum__list">
      <li v-for="row in store.journey" :key="row.role.id" class="sum__row">
        <div class="sum__role">
          <span class="sum__rtitle">{{ row.role.title }}</span>
          <span class="sum__rjob mono">{{ row.role.realJob }}</span>
        </div>
        <div class="sum__scores">
          <span class="sum__score">
            <span class="sum__lbl mono">FÖRE</span>
            <span class="ink-strong">{{ row.before }}/{{ row.total }}</span>
          </span>
          <span class="sum__arrow" :class="{
            up: delta(row.before, row.after) > 0,
            down: delta(row.before, row.after) < 0,
          }">
            {{ delta(row.before, row.after) > 0 ? '▲' : delta(row.before, row.after) < 0 ? '▼' : '→' }}
          </span>
          <span class="sum__score">
            <span class="sum__lbl mono">EFTER</span>
            <span class="ink-strong">{{ row.after === null ? '–' : `${row.after}/${row.total}` }}</span>
          </span>
        </div>
      </li>
    </ul>

    <div class="sum__foot">
      <p class="sum__thanks">Tack för att ni var med.</p>
      <button class="crt-button" @click="store.reset()">◂ BÖRJA OM</button>
    </div>
  </div>
</template>

<style scoped>
.sum {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}
.sum__head {
  text-align: center;
}
.sum__title {
  font-family: var(--font-retro);
  font-size: clamp(2rem, 6vw, 3rem);
  letter-spacing: 0.1em;
  margin: 0;
}
.sum__sub {
  color: var(--color-ink-muted);
  margin: 0.2rem 0 0;
}
.sum__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;
  min-height: 0;
  overflow: auto;
}
.sum__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 1rem;
  border: 1px solid var(--color-primary-dim);
  border-radius: 10px;
  background: var(--color-background-2);
  opacity: 0;
  animation: sum-row-in 300ms var(--ease-out) forwards;
}
.sum__row:nth-child(1) { animation-delay: 0ms; }
.sum__row:nth-child(2) { animation-delay: 60ms; }
.sum__row:nth-child(3) { animation-delay: 120ms; }
.sum__row:nth-child(4) { animation-delay: 180ms; }
.sum__row:nth-child(5) { animation-delay: 240ms; }
.sum__row:nth-child(6) { animation-delay: 300ms; }
.sum__row:nth-child(n + 7) { animation-delay: 360ms; }
@keyframes sum-row-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .sum__row {
    animation: none;
    opacity: 1;
  }
}
.sum__role {
  display: flex;
  flex-direction: column;
}
.sum__rtitle {
  font-family: var(--font-retro);
  font-size: 1.5rem;
  color: var(--color-primary);
  letter-spacing: 0.04em;
}
.sum__rjob {
  font-size: 0.85rem;
  color: var(--color-ink-muted);
}
.sum__scores {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.sum__score {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.3rem;
}
.sum__lbl {
  font-size: 0.65rem;
  color: var(--color-ink-muted);
  letter-spacing: 0.1em;
}
.sum__arrow {
  font-size: 1.4rem;
  color: var(--color-ink-muted);
}
.sum__arrow.up {
  color: var(--color-primary);
  text-shadow: var(--glow-soft);
}
.sum__arrow.down {
  color: var(--color-danger);
}
.sum__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sum__thanks {
  color: var(--color-ink-strong);
  margin: 0;
}
</style>
