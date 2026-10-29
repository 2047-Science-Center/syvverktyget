<script setup lang="ts">
/**
 * Barriär: den här 3-gruppen är klar med swipe och väntar in den andra skärmen
 * (andra NUC:en mot samma broker). I pilot/solo simuleras den andra skärmen
 * med en knapp. När båda är klara → reveal, synkat.
 */
import { config } from '@/config'
import { useStore } from '@/store'
const store = useStore()
</script>

<template>
  <div class="barrier">
    <h2 class="barrier__title ink-strong">Så valde ni</h2>
    <p class="barrier__lead">Er skärm är klar. Vill ni se hur ni valde?</p>

    <div class="barrier__screens">
      <div class="barrier__screen barrier__screen--done">
        <span class="barrier__dot" />
        <span>Er skärm — klar</span>
      </div>
      <div class="barrier__screen" :class="{ 'barrier__screen--done': store.otherScreenReady }">
        <span class="barrier__dot" />
        <span>{{ store.otherScreenLabel }} — {{ store.otherScreenReady ? 'klar' : 'väntar …' }}</span>
      </div>
    </div>

    <button
      v-if="!store.otherScreenReady"
      class="crt-button"
      @click="store.markOtherReady()"
    >
      ▶ Andra skärmen klar <span class="mono barrier__pilot">(pilot: simulera)</span>
    </button>
    <button
      v-else
      class="crt-button crt-button--strong"
      @click="store.startReveal()"
    >
      SE HUR NI VALDE ▸
    </button>

    <p class="barrier__note mono">
      {{ config.screens }} skärmar · hela gruppen på {{ store.FULL_GROUP }} i reveal
    </p>
  </div>
</template>

<style scoped>
.barrier {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.3rem;
  height: 100%;
  text-align: center;
}
.barrier__title {
  font-family: var(--font-retro);
  font-size: clamp(2rem, 6vw, 3.2rem);
  letter-spacing: 0.1em;
  margin: 0;
}
.barrier__lead {
  color: var(--color-ink-strong);
  font-size: 1.2rem;
  margin: 0;
}
.barrier__screens {
  display: flex;
  gap: 1.5rem;
}
.barrier__screen {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1rem;
  border: 1px solid var(--color-primary-dim);
  border-radius: 8px;
  color: var(--color-ink-muted);
}
.barrier__screen--done {
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.barrier__dot {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  background: var(--color-primary-dim);
}
.barrier__screen--done .barrier__dot {
  background: var(--color-primary);
  box-shadow: var(--glow-soft);
}
.barrier__pilot {
  font-size: 0.8rem;
  opacity: 0.7;
}
.barrier__note {
  color: var(--color-ink-muted);
  font-size: 0.85rem;
  letter-spacing: 0.06em;
}
</style>
