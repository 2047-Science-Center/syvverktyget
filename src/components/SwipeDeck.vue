<script setup lang="ts">
/**
 * Swipe-momentet. Hela kortleken, ett kort i taget. De 3 vid skärmen bippar
 * ja/nej (VotePanel) och majoriteten avgör kortet live. Ingen koppling till
 * riktiga företag här — bara rollen + bilden.
 */
import { computed } from 'vue'
import { useStore } from '@/store'
import { config } from '@/config'
import MediaSlot from './MediaSlot.vue'
import VotePanel from './VotePanel.vue'

const store = useStore()
const card = computed(() => store.currentCard)
const resolved = computed(() => (card.value ? store.swipeOutcome[card.value.id] : undefined))
</script>

<template>
  <div v-if="card" class="swipe">
    <header class="swipe__head">
      <span class="swipe__valv amber-badge" :style="{ borderColor: store.valv.color, color: store.valv.color }">
        {{ store.valv.name.toUpperCase() }}
      </span>
      <span class="swipe__progress mono">ROLL {{ store.cardIndex + 1 }} / {{ store.deck.length }}</span>
    </header>

    <div
      :key="card.id"
      class="swipe__card"
      :class="{ 'swipe__card--ja': resolved === 'ja', 'swipe__card--nej': resolved === 'nej' }"
    >
      <div class="swipe__media">
        <MediaSlot kind="image" :src="card.image" :label="`${card.title} — förproducerat kort`" :accent="store.valv.color" />
        <div v-if="resolved" class="swipe__stamp" :class="resolved === 'ja' ? 'is-ja' : 'is-nej'">
          {{ resolved === 'ja' ? 'JA ▶' : '◀ NEJ' }}
        </div>
      </div>
      <div class="swipe__text">
        <h2 class="swipe__title">{{ card.title }}</h2>
        <p class="swipe__blurb">{{ card.blurb }}</p>
      </div>
    </div>

    <VotePanel
      :pending="store.pending"
      :size="config.groupSize"
      question="Kan du tänka dig det här?"
      :disabled="!!resolved"
      @cast="store.castSwipe"
    />
  </div>
</template>

<style scoped>
.swipe {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}
.swipe__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.swipe__valv {
  font-family: var(--font-retro);
  letter-spacing: 0.12em;
}
.swipe__progress {
  color: var(--color-ink-muted);
  letter-spacing: 0.08em;
}
.swipe__card {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 0.8rem;
  border-radius: 12px;
  transition: box-shadow 0.25s var(--ease-out);
  animation: card-in 260ms var(--ease-out) both;
}
@keyframes card-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.swipe__card--ja {
  box-shadow: 0 0 24px rgba(255, 149, 0, 0.4);
}
.swipe__card--nej {
  box-shadow: 0 0 24px rgba(255, 90, 60, 0.35);
}
.swipe__media {
  position: relative;
  min-height: 0;
}
.swipe__stamp {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-8deg);
  font-family: var(--font-retro);
  font-size: 3.5rem;
  padding: 0.2em 0.6em;
  border: 3px solid;
  border-radius: 10px;
  letter-spacing: 0.08em;
  animation: stamp-in 220ms var(--ease-out) both;
}
@keyframes stamp-in {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(-8deg) scale(1.4);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(-8deg) scale(1);
  }
}
.swipe__stamp.is-ja {
  color: var(--color-primary);
  border-color: var(--color-primary);
  text-shadow: var(--glow-strong);
}
.swipe__stamp.is-nej {
  color: var(--color-danger);
  border-color: var(--color-danger);
}
.swipe__text {
  text-align: center;
}
.swipe__title {
  font-family: var(--font-retro);
  font-size: clamp(1.8rem, 5vw, 2.8rem);
  letter-spacing: 0.06em;
  color: var(--color-primary);
  margin: 0 0 0.3rem;
  text-shadow: var(--glow-soft);
}
.swipe__blurb {
  color: var(--color-ink-strong);
  font-size: 1.05rem;
  margin: 0 auto;
  max-width: 50ch;
}
</style>
