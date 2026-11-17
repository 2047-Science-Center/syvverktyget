<script setup lang="ts">
/**
 * Så valde ni: alla åtta korten med gruppens sex dörrar (båda skärmarna).
 * Barriären ligger här: den snabbare skärmen väntar in den andra. När båda är
 * klara går vilken bip som helst (eller Enter) vidare till verkligheten.
 */
import { config } from '@/config'
import { useStore } from '@/store'
import TopBar from './TopBar.vue'
import CardPhoto from './CardPhoto.vue'
import DoorStrip from './DoorStrip.vue'

const store = useStore()
</script>

<template>
  <div class="screen">
    <TopBar label="SÅ VALDE NI" />
    <div class="grid8">
      <div
        v-for="(role, i) in store.deck"
        :key="role.id"
        class="paper mini enter-up"
        :style="{ '--tilt': i % 2 ? '0.8deg' : '-1deg', animationDelay: `${i * 50}ms` }"
      >
        <CardPhoto :src="role.image" :title="role.title" compact />
        <b class="mini__title">{{ role.title }}</b>
        <DoorStrip :votes="store.swipeDoors(role.id)" :size="0.95" on-paper />
        <span class="mini__count">{{ store.swipeOpen(role.id) }} av {{ store.FULL_GROUP }} öppnade</span>
      </div>
    </div>
    <div class="barrier mono" aria-live="polite">
      <span class="barrier__s barrier__s--done"><i />Er skärm klar</span>
      <span class="barrier__s" :class="{ 'barrier__s--done': store.otherScreenReady }">
        <i />Andra skärmen {{ store.otherScreenReady ? 'klar' : 'sveper fortfarande …' }}
        <em v-if="config.pilotSync === 'solo'">(simulerad)</em>
      </span>
    </div>
    <p class="crt-q">
      <template v-if="store.otherScreenReady">Vill ni se hur det ser ut på riktigt? <span class="go">Bippa.</span></template>
      <template v-else>Vilken var lättast att stänga?</template>
    </p>
  </div>
</template>

<style scoped>
.grid8 {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: clamp(0.8rem, 2vh, 1.4rem) clamp(0.8rem, 1.6vw, 1.6rem);
  padding-top: 0.6rem;
}
.mini {
  min-height: 0;
  padding: 0.7em 0.8em 0.6em;
  display: flex;
  flex-direction: column;
  gap: 0.35em;
  align-items: center;
  text-align: center;
  font-size: clamp(0.85rem, 1.9vh, 1.15rem);
  transform: rotate(var(--tilt));
}
.mini :deep(.photo) {
  width: auto;
  height: auto;
  flex: 1 1 0;
  min-height: 0;
  max-width: 100%;
}
.mini__title {
  font-size: 1.1em;
  line-height: 1.1;
}
.mini__count {
  font-family: var(--font-mono);
  font-size: 0.8em;
  color: var(--ink-soft);
}
.barrier {
  display: flex;
  justify-content: center;
  gap: 2.4rem;
  font-size: 0.9rem;
  color: var(--color-ink-muted);
  text-shadow: none;
}
.barrier__s {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.barrier__s i {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  border: 1.5px solid var(--color-primary-dim);
}
.barrier__s--done {
  color: var(--color-primary);
}
.barrier__s--done i {
  background: var(--color-primary);
  border-color: var(--color-primary);
}
.barrier em {
  font-style: normal;
  opacity: 0.6;
}
.go {
  color: var(--valv);
}
</style>
