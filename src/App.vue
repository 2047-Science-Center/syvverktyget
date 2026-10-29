<script setup lang="ts">
/**
 * Toppnivå för SYV-verktyget. Kiosk = en skärm, fast bärnstens-CRT-tema.
 * Store äger faserna; denna komponent mappar fas → vy och håller sömmarna:
 *
 *   attract → swipe → barrier → reveal → summary
 *
 * Här kopplas RFID ja/nej-läsarna (en bip → en röst i rätt fas), start-
 * gränssnittet (url + kommando-kanal) och de fas-/steg-drivna ljuden.
 */
import { onMounted, onBeforeUnmount, provide, watch } from 'vue'
import { useStore } from '@/store'
import { createRfid } from '@/adapters'
import { applyStartInterface } from '@/startInterface'
import { audio } from '@/audio/AudioEngine'
import CrtScreen from '@/components/CrtScreen.vue'
import FacilitatorBar from '@/components/FacilitatorBar.vue'
import AttractScreen from '@/components/AttractScreen.vue'
import SwipeDeck from '@/components/SwipeDeck.vue'
import BarrierWait from '@/components/BarrierWait.vue'
import RevealSequence from '@/components/RevealSequence.vue'
import SummaryScreen from '@/components/SummaryScreen.vue'

const store = useStore()

// RFID ja/nej-sömmen. Status delas ner till facilitator-raden.
const rfid = createRfid()
provide('rfidConnected', rfid.connected)

/** En bip från en ja/nej-läsare → en röst i den fas som är aktiv.
 *  RFID-bip har egna ljud (h4/h5); klick/tangent har svep-ljud (se VotePanel). */
function onBip(bip: { side: 'ja' | 'nej'; uid: string }): void {
  if (store.phase === 'swipe') {
    store.castSwipe(bip.side, bip.uid)
    audio.play(bip.side === 'ja' ? 'jaBip' : 'nejBip')
  } else if (store.phase === 'reveal' && store.revealStep === 'revote') {
    store.castRevote(bip.side, bip.uid)
    audio.play(bip.side === 'ja' ? 'jaBip' : 'nejBip')
  }
}

let stopStart: (() => void) | null = null
let unsub: (() => void) | null = null

onMounted(() => {
  stopStart = applyStartInterface(store)
  unsub = rfid.onBip(onBip)
})

onBeforeUnmount(() => {
  unsub?.()
  stopStart?.()
  rfid.close()
})

// --- Fas-/steg-drivna ljud (en plats) ---
watch(
  () => store.phase,
  (p) => {
    if (p === 'barrier') audio.play('barrierPing')
    else if (p === 'reveal') audio.play('resultTally') // första kortets result
    else if (p === 'summary') audio.play('avslutStinger')
  },
)
watch(
  () => store.revealStep,
  (s) => {
    if (s === 'clip') audio.play('clipTransition')
    else if (s === 'revote') audio.play('revotePrompt')
  },
)
// Nästa reveal-korts result-aggregat (kort 2..n; kort 1 täcks av fas-watchern).
watch(
  () => store.revealIndex,
  () => {
    if (store.phase === 'reveal') audio.play('resultTally')
  },
)
// Kort-flip när nästa svep-kort kommer upp.
watch(
  () => store.cardIndex,
  (n, prev) => {
    if (store.phase === 'swipe' && n > prev) audio.play('cardFlip')
  },
)
</script>

<template>
  <div class="app">
    <div class="app__chrome" v-if="store.phase !== 'attract'">
      <FacilitatorBar />
    </div>
    <div class="app__single">
      <CrtScreen>
        <AttractScreen v-if="store.phase === 'attract'" />
        <SwipeDeck v-else-if="store.phase === 'swipe'" />
        <BarrierWait v-else-if="store.phase === 'barrier'" />
        <RevealSequence v-else-if="store.phase === 'reveal'" />
        <SummaryScreen v-else-if="store.phase === 'summary'" />
      </CrtScreen>
    </div>
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0.6rem;
  gap: 0.4rem;
}
.app__chrome {
  padding: 0 0.3rem;
}
.app__single {
  flex: 1;
  min-height: 0;
}
</style>
