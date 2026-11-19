<script setup lang="ts">
/**
 * Vems tur det är, så att det går snabbt och ingen behöver fråga.
 *
 *   bandlöst + namn  (syv/lag eller ?members=)  stort "ALMA · DIN TUR ATT VÄLJA" + raden med alla
 *                                               (✓ = har valt, aldrig vad). Turen går vidare av sig själv.
 *   bandlöst utan namn                          "TUR 2 AV 3".
 *   band                                        namnen på dem som bippat (UID → namn ur syv/lag).
 * Inget sparas per person; namnen finns bara på skärmen medan rundan pågår.
 */
import { computed } from 'vue'
import { useStore } from '@/store'

defineProps<{ locked: boolean }>()
const store = useStore()

const bippade = computed(() => store.votedNames.filter((n): n is string => !!n))
</script>

<template>
  <div v-if="store.bandlost" class="turn" :class="{ 'turn--locked': locked }" aria-live="polite">
    <p v-if="locked" class="turn__all mono">ALLA HAR VALT</p>
    <template v-else-if="store.turnName">
      <p :key="store.turn" class="turn__now">
        <span class="turn__name">{{ store.turnName }}</span>
        <span class="turn__cue mono">DIN TUR ATT VÄLJA</span>
      </p>
    </template>
    <p v-else class="turn__all mono">TUR {{ store.turn + 1 }} AV {{ store.voterCount }}</p>

    <ol v-if="store.namedMembers && !locked" class="turn__row mono" aria-label="Turordning">
      <li
        v-for="(namn, i) in store.members"
        :key="i"
        :class="{ 'is-done': i < store.turn, 'is-now': i === store.turn }"
      >
        <span v-if="i < store.turn" aria-hidden="true">✓ </span>{{ namn }}
      </li>
    </ol>
  </div>

  <p v-else-if="bippade.length" class="turn__band mono" aria-live="polite">
    <span v-for="namn in bippade" :key="namn">✓ {{ namn }}</span>
  </p>
</template>

<style scoped>
.turn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}
.turn__now {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 0.8rem;
  padding: 0.2em 1em;
  border: 2px solid var(--color-primary);
  border-radius: 999px;
  box-shadow: var(--glow-soft);
}
.turn__name {
  font-family: var(--font-retro);
  font-size: clamp(2rem, 5vh, 3.2rem);
  line-height: 1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-ink-strong, var(--color-primary));
}
.turn__cue {
  font-size: clamp(1rem, 2.2vh, 1.4rem);
  letter-spacing: 0.14em;
  color: var(--color-primary);
}
.turn__all {
  margin: 0;
  padding: 0.25em 0.9em;
  border: 2px solid var(--color-primary);
  border-radius: 999px;
  font-size: clamp(1.1rem, 2.6vh, 1.6rem);
  letter-spacing: 0.1em;
  color: var(--color-primary);
  box-shadow: var(--glow-soft);
}
.turn--locked .turn__all {
  border-color: var(--color-primary-dim);
  color: var(--color-ink-muted);
  box-shadow: none;
}
.turn__row {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem 1.2rem;
  font-size: clamp(0.95rem, 2vh, 1.2rem);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
}
.turn__row .is-done {
  color: var(--color-primary-dim);
}
.turn__row .is-now {
  color: var(--color-primary);
}
.turn__band {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem 1.2rem;
  font-size: clamp(1rem, 2.2vh, 1.3rem);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary);
}
@media (prefers-reduced-motion: no-preference) {
  .turn__now {
    animation: turn-in 220ms var(--ease-out, ease-out);
  }
}
@keyframes turn-in {
  from {
    transform: scale(0.96);
    opacity: 0.4;
  }
}
</style>
