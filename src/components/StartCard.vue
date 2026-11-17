<script setup lang="ts">
/**
 * Start: inflyttningskortet på papper. Valvet är stämplat, raden BRA PÅ är
 * tom. Samma bild som sista bilden i övergångsfilmen (byggs inte här).
 * Vilken bip som helst (eller klick/Enter) startar svepet.
 */
import { useStore } from '@/store'
import { SCREEN_ID } from '@/config'
import TopBar from './TopBar.vue'

const store = useStore()
const emit = defineEmits<{ start: [] }>()
</script>

<template>
  <div class="screen start" @click="emit('start')">
    <TopBar :label="`SKÄRM ${SCREEN_ID}`" />
    <div class="start__stage">
      <div class="paper inflytt enter-up" style="--tilt: -1.2deg">
        <span class="tape tape--l" /><span class="tape tape--r" />
        <div class="inflytt__h"><span>Valvet · Inflyttningskort</span><span>Nr 0418</span></div>
        <h2 class="inflytt__title">INFLYTTNINGSKORT</h2>
        <div class="field">Namn<span class="field__ln" /></div>
        <div class="field">
          Valv<span class="inflytt__valv">{{ store.valv.name.toUpperCase() }}</span><span class="field__ln" style="border: 0" />
        </div>
        <div class="field field--big">Bra på<span class="field__ln" /></div>
      </div>
    </div>
    <p class="crt-q">Åtta yrken från Valvet. Kan du tänka dig dem?</p>
    <p class="start__go">Bippa för att börja<span class="crt-caret">_</span></p>
  </div>
</template>

<style scoped>
.start {
  cursor: pointer;
}
.start__stage {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.inflytt {
  width: min(92%, 40rem);
  padding: 2.2rem 2.4rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
  font-size: clamp(1rem, 2.3vh, 1.4rem);
  transform: rotate(-1.2deg);
}
.inflytt__h {
  display: flex;
  justify-content: space-between;
  font-size: 0.7em;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.inflytt__title {
  margin: 0;
  font-size: 1.7em;
  letter-spacing: 0.04em;
}
.inflytt__valv {
  font-weight: 700;
  color: var(--stamp-open);
  border: 0.15em solid currentColor;
  padding: 0.05em 0.6em;
  transform: rotate(-6deg);
  letter-spacing: 0.12em;
  mix-blend-mode: multiply;
}
.start__go {
  margin: 0;
  text-align: center;
  font-size: clamp(1.4rem, 3.4vh, 2.2rem);
  letter-spacing: 0.08em;
  color: var(--color-primary);
}
</style>
