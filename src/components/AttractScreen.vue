<script setup lang="ts">
/**
 * Attract/boot-skärm. Första användargesten låser upp ljudkontexten
 * (kiosk-autoplay) och spelar boot-sekvensen, sen in i flödet — samma mönster
 * som station-kit (forhandlingen/minnestest).
 */
import { ref } from 'vue'
import { useStore } from '@/store'
import { audio } from '@/audio/AudioEngine'
const store = useStore()
const booting = ref(false)

function begin(): void {
  if (booting.value) return
  booting.value = true
  audio.unlock()
  audio.play('attract')
  setTimeout(() => store.begin(), 700)
}
</script>

<template>
  <div class="attract" @click="begin">
    <div class="attract__logo">
      <h1 class="attract__title ink-strong">X&amp;Y</h1>
      <p class="attract__sub">SYV-VERKTYGET</p>
    </div>
    <p class="attract__valv" :style="{ color: store.valv.color }">
      VALV · {{ store.valv.name.toUpperCase() }}
    </p>
    <p v-if="!booting" class="attract__cta crt-caret">TRYCK FÖR ATT BÖRJA</p>
    <p v-else class="attract__cta">STARTAR …</p>
  </div>
</template>

<style scoped>
.attract {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.6rem;
  height: 100%;
  text-align: center;
  cursor: pointer;
}
.attract__title {
  font-size: clamp(3rem, 12vw, 8rem);
  margin: 0;
  letter-spacing: 0.1em;
}
.attract__sub {
  color: var(--color-primary);
  font-size: 1.4rem;
  margin: 0.2rem 0 0;
  letter-spacing: 0.4em;
}
.attract__valv {
  font-family: var(--font-retro);
  font-size: 1.4rem;
  letter-spacing: 0.2em;
  margin: 0;
}
.attract__cta {
  font-size: 1.5rem;
  color: var(--color-ink-strong);
  letter-spacing: 0.1em;
}
</style>
