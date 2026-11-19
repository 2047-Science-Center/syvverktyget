<script setup lang="ts">
/**
 * Svep: ett papperskort per roll (tejp, bild, Valvet-namn, en rad). Vänster
 * läsare = STÄNGD dörr, höger = ÖPPEN dörr. Tre personer per skärm; majoriteten
 * stämplar kortet. Det riktiga yrket syns aldrig här.
 */
import { computed } from 'vue'
import { useStore, type Vote } from '@/store'
import TopBar from './TopBar.vue'
import DoorZone from './DoorZone.vue'
import DoorIcon from './DoorIcon.vue'
import CardPhoto from './CardPhoto.vue'
import VotePips from './VotePips.vue'
import TurnBanner from './TurnBanner.vue'
import { useSwipeGesture } from '@/swipe'

const store = useStore()
const emit = defineEmits<{ cast: [Vote] }>()
const role = computed(() => store.swipeCard!)
const locked = computed(() => store.swipeStamp !== null)
const swipe = useSwipeGesture((v) => emit('cast', v), () => !locked.value)
</script>

<template>
  <div class="screen">
    <TopBar>ROLL {{ store.swipeIndex + 1 }} / {{ store.deck.length }}</TopBar>
    <div class="swipe">
      <DoorZone side="nej" :disabled="locked" @cast="emit('cast', $event)" />
      <div
        class="swipe__center"
        @pointerdown="swipe.onPointerdown"
        @pointerup="swipe.onPointerup"
        @pointercancel="swipe.onPointercancel"
        @dragstart.prevent
      >
        <div :key="role.id" class="paper card enter-up" style="--tilt: -0.6deg">
          <span class="tape tape--l" /><span class="tape tape--r" />
          <div class="card__head"><span>Valvet · {{ store.valv.name }}</span><span>roll</span></div>
          <CardPhoto :src="role.image" :title="role.title" />
          <h2 class="card__title">{{ role.title }}</h2>
          <p class="card__blurb">{{ role.blurb }}</p>
          <div v-if="store.swipeStamp" class="stamp card__stamp" :class="store.swipeStamp === 'ja' ? 'stamp--open' : 'stamp--closed'">
            <DoorIcon :open="store.swipeStamp === 'ja'" :size="0.9" color="currentColor" />
            {{ store.swipeStamp === 'ja' ? 'DÖRREN ÖPPEN' : 'DÖRREN STÄNGD' }}
          </div>
        </div>
      </div>
      <DoorZone side="ja" :disabled="locked" @cast="emit('cast', $event)" />
    </div>
    <TurnBanner :locked="locked" />
    <p class="crt-q">Kan du tänka dig det här?</p>
    <VotePips :count="store.swipePending.length" :size="store.voterCount" :label="store.bandlost ? 'har svept' : 'har bippat'" />
  </div>
</template>

<style scoped>
.swipe {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(9rem, 1fr) auto minmax(9rem, 1fr);
  gap: clamp(1rem, 2.5vw, 2.5rem);
  align-items: stretch;
}
.swipe__center {
  min-height: 0;
  touch-action: pan-y;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 0.8rem;
}
.card {
  /* Höjden styr: bilden 3:2 + titel + rad ska rymmas i mittenkolumnen. */
  width: min(44vw, calc((100vh - 19rem) * 1.3));
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  gap: 0.6em;
  padding: 1.1em 1.2em 1.1em;
  font-size: clamp(0.95rem, 2vh, 1.3rem);
  transform: rotate(-0.6deg);
}
.card__head {
  display: flex;
  justify-content: space-between;
  font-size: 0.7em;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.card__title {
  margin: 0.1em 0 0;
  font-weight: 700;
  /* Längsta namnen (Automationsmästaren, 19 tecken) ska rymmas på en rad. */
  font-size: min(2em, 7.4cqi);
  line-height: 1.05;
  white-space: nowrap;
}
.card__blurb {
  margin: 0;
  font-size: 1.05em;
  line-height: 1.35;
  color: #3d3526;
  min-height: 2.7em;
}
.card__stamp {
  /* På papperet (titel/rad), inte på fotot: där syns stämpelfärgen. */
  right: 0.8em;
  bottom: 1.6em;
  font-size: 1.7em;
  background: rgba(236, 226, 204, 0.7);
}
</style>
