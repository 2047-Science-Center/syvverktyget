<script setup lang="ts">
/**
 * Toppnivå för SYV-verktyget v2. Kiosk = en skärm, CRT-ramen är Valvets
 * maskin och papperskorten ligger inne i den. Store äger faserna; här mappas
 * fas → vy och sömmarna hålls på EN plats:
 *
 *   card → swipe ×8 → overview → reality{clip → revote} ×8 → doors
 *
 * Input (alla vägar blir samma `input(vote)`): RFID-bip (vänster läsare =
 * 'nej' = STÄNGD, höger = 'ja' = ÖPPEN), klick på zonerna, tangenterna
 * ◀/N och ▶/J. Enter/mellanslag = gå vidare där det går.
 */
import { computed, onBeforeUnmount, onMounted, provide, watch } from 'vue'
import { useStore, type Vote } from '@/store'
import { createRfid } from '@/adapters'
import { applyStartInterface } from '@/startInterface'
import { audio } from '@/audio/AudioEngine'
import CrtScreen from '@/components/CrtScreen.vue'
import FacilitatorBar from '@/components/FacilitatorBar.vue'
import StartCard from '@/components/StartCard.vue'
import SwipeScreen from '@/components/SwipeScreen.vue'
import OverviewScreen from '@/components/OverviewScreen.vue'
import RealityScreen from '@/components/RealityScreen.vue'
import DoorsScreen from '@/components/DoorsScreen.vue'

const store = useStore()

const rfid = createRfid()
provide('rfidConnected', rfid.connected)

/** Ljud på första gesten (klick/tangent). I kiosken (autoplay-flaggan) går det direkt. */
function unlockAudio(): void {
  audio.unlock()
  audio.startBed()
}

/** En röst från vilken källa som helst. Bippet låter likadant för båda sidorna. */
function input(vote: Vote, uid?: string): void {
  if (store.cast(vote, uid)) audio.play('bip')
}

function onKey(e: KeyboardEvent): void {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  unlockAudio()
  const k = e.key.toLowerCase()
  if (e.key === 'ArrowLeft' || k === 'n') input('nej')
  else if (e.key === 'ArrowRight' || k === 'j') input('ja')
  else if (e.key === 'Enter' || e.key === ' ') store.advance()
  else return
  e.preventDefault()
}

let stopStart: (() => void) | null = null
let unsub: (() => void) | null = null

onMounted(() => {
  stopStart = applyStartInterface(store)
  unsub = rfid.onBip((bip) => input(bip.side, bip.uid))
  window.addEventListener('keydown', onKey)
  window.addEventListener('pointerdown', unlockAudio)
  unlockAudio() // lyckas i kiosken (--autoplay-policy=no-user-gesture-required)
})

onBeforeUnmount(() => {
  unsub?.()
  stopStart?.()
  rfid.close()
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('pointerdown', unlockAudio)
})

// --- Ljud som har en orsak på skärmen (en plats) ---
watch(
  () => store.swipeStamp,
  (s) => {
    if (s) audio.play(s === 'ja' ? 'doorOpen' : 'doorClose')
  },
)
watch(
  () => store.swipeIndex,
  (n, prev) => {
    if (store.phase === 'swipe' && n > prev) audio.play('cardFlip')
  },
)
watch(
  () => store.revoteMoved,
  (d) => {
    if (d !== null && d > 0) audio.play('doorGlide')
  },
)
watch(
  () => store.phase,
  (p) => {
    if (p === 'overview') audio.play('barrierPing')
    else if (p === 'doors') audio.play('avslutStinger')
  },
)
watch(
  () => store.realityStep,
  (s) => {
    if (store.phase === 'reality' && s === 'revote') audio.play('revotePrompt')
  },
)
// Bädden tystnar helt medan klippet är på skärmen.
watch(
  () => store.phase === 'reality' && store.realityStep === 'clip',
  (clipOn) => audio.duckBed(clipOn),
)

const valvStyle = computed(() => ({ '--valv': store.valv.color }))
const realityKey = computed(() => `${store.realityIndex}:${store.realityStep}`)
</script>

<template>
  <div class="app valv-scope" :style="valvStyle">
    <div class="app__chrome">
      <FacilitatorBar />
    </div>
    <div class="app__single">
      <CrtScreen>
        <StartCard v-if="store.phase === 'card'" @start="store.begin()" />
        <SwipeScreen v-else-if="store.phase === 'swipe'" @cast="input" />
        <OverviewScreen v-else-if="store.phase === 'overview'" @click="store.otherScreenReady && store.startReality()" />
        <RealityScreen v-else-if="store.phase === 'reality'" :key="realityKey" @cast="input" />
        <DoorsScreen v-else-if="store.phase === 'doors'" />
      </CrtScreen>
    </div>
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0.6rem 0.6rem;
  gap: 0.3rem;
}
.app__chrome {
  padding: 0 0.3rem;
}
.app__single {
  flex: 1;
  min-height: 0;
}
</style>
