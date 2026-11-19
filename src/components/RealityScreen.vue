<script setup lang="ts">
/**
 * Verkligheten, per roll (gemensamt för båda skärmarna):
 *   clip   papperskortet (Valvet-roll + gruppens dörrar) → "På riktigt:" +
 *          riktigt yrke → stående klipp i telefonramen. Startar av sig självt
 *          efter config.timing.clipIntroMs (eller klick/Enter). Bädden tystnar.
 *   revote "Har du ändrat dig?" med samma två dörrar, och hur gruppen röstade nyss.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { config, CLIPS } from '@/config'
import { useStore, type Vote } from '@/store'
import TopBar from './TopBar.vue'
import DoorZone from './DoorZone.vue'
import DoorStrip from './DoorStrip.vue'
import CardPhoto from './CardPhoto.vue'
import PhoneClip from './PhoneClip.vue'
import VotePips from './VotePips.vue'
import TurnBanner from './TurnBanner.vue'
import { useSwipeGesture } from '@/swipe'

const store = useStore()
const emit = defineEmits<{ cast: [Vote] }>()

const role = computed(() => store.realityCard!)
const clip = computed(() => CLIPS[role.value.clip])
const before = computed(() => store.swipeOpen(role.value.id))

// --- Klipp-steget: kort paus med papperet + "På riktigt", sedan spelar klippet. ---
const playing = ref(false)
const countdown = ref(Math.ceil(config.timing.clipIntroMs / 1000))
let introTimer: ReturnType<typeof setInterval> | null = null
function startClip(): void {
  if (introTimer) clearInterval(introTimer)
  introTimer = null
  playing.value = true
}
onMounted(() => {
  if (store.realityStep !== 'clip') return
  const t0 = performance.now()
  introTimer = setInterval(() => {
    const left = config.timing.clipIntroMs - (performance.now() - t0)
    countdown.value = Math.max(0, Math.ceil(left / 1000))
    if (left <= 0) startClip()
  }, 200)
})
onBeforeUnmount(() => {
  if (introTimer) clearInterval(introTimer)
})
defineExpose({ startClip })

const movedText = computed(() => {
  const d = store.revoteMoved
  if (d === null) return ''
  if (d > 0) return `${d} ${d === 1 ? 'dörr öppnades' : 'dörrar öppnades'}`
  if (d < 0) return `${-d} ${d === -1 ? 'dörr stängdes' : 'dörrar stängdes'}`
  return 'Alla står kvar. Det är också ett svar.'
})
const locked = computed(() => store.revoteMoved !== null)
const swipe = useSwipeGesture((v) => emit('cast', v), () => !locked.value)
</script>

<template>
  <div class="screen">
    <TopBar>
      {{ store.realityStep === 'clip' ? 'VERKLIGHETEN' : 'RÖSTA OM' }} · {{ store.realityIndex + 1 }} / {{ store.deck.length }}
    </TopBar>

    <!-- KLIPP -->
    <div v-if="store.realityStep === 'clip'" class="clip">
      <div class="clip__side">
        <div class="paper side-card enter-up" style="--tilt: -1deg">
          <span class="tape tape--l" />
          <span class="k">I Valvet</span>
          <CardPhoto :src="role.image" :title="role.title" />
          <span class="v">{{ role.title }}</span>
          <DoorStrip :votes="store.swipeDoors(role.id)" :size="1.05" on-paper />
          <span class="k k--plain">{{ before }} av {{ store.FULL_GROUP }} öppnade dörren</span>
        </div>
        <div class="clip__arrow">▼</div>
        <div class="real enter-up" style="animation-delay: 600ms">
          <span class="k">På riktigt:</span>
          <div class="v">{{ role.realJob }}</div>
        </div>
      </div>
      <div class="clip__phone">
        <PhoneClip :clip="clip" :real-job="role.realJob" :playing="playing" @start="startClip" @ended="store.clipEnded()" />
      </div>
      <div class="clip__aside">
        <p v-if="!playing" class="aside__big">Klippet startar om {{ countdown }}&nbsp;s</p>
        <p v-else class="aside__big">Titta. Lyssna.</p>
        <p class="aside__small">Ett riktigt klipp från en riktig arbetsplats. Sen får ni rösta igen.</p>
      </div>
    </div>

    <!-- RÖSTA OM -->
    <template v-else>
      <div class="revote">
        <DoorZone side="nej" :disabled="locked" @cast="emit('cast', $event)" />
        <div
          class="revote__center"
          @pointerdown="swipe.onPointerdown"
          @pointerup="swipe.onPointerup"
          @pointercancel="swipe.onPointercancel"
          @dragstart.prevent
        >
          <div class="paper mini-card enter-up" style="--tilt: -0.8deg">
            <span class="tape tape--r" />
            <div class="mini-card__thumb"><CardPhoto :src="role.image" :title="role.title" compact /></div>
            <div class="mini-card__txt">
              <b>{{ role.title }}</b>
              <span>på riktigt: {{ role.realJob }}</span>
            </div>
          </div>
          <div class="before">
            <span class="mono">Nyss: {{ before }} av {{ store.FULL_GROUP }} öppna dörrar</span>
            <DoorStrip :votes="store.swipeDoors(role.id)" :size="1.3" />
          </div>
          <p class="crt-q revote__q">Har du ändrat dig?</p>
          <div class="moved" aria-live="polite">
            <template v-if="locked">
              <DoorStrip :votes="store.revoteDoors(role.id)" :size="1.3" />
              <span>{{ movedText }}</span>
            </template>
          </div>
        </div>
        <DoorZone side="ja" :disabled="locked" @cast="emit('cast', $event)" />
      </div>
      <TurnBanner :locked="locked" />
      <VotePips
        :count="store.revotePending.length"
        :size="store.voterCount"
        :label="store.bandlost ? 'har svept igen' : 'har bippat igen'"
      />
    </template>
  </div>
</template>

<style scoped>
/* ---------- Klipp ---------- */
.clip {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: clamp(1rem, 3vw, 3rem);
  align-items: stretch;
}
.clip__side {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 0.6rem;
  min-height: 0;
}
.side-card,
.real {
  width: min(100%, 22rem);
}
.side-card {
  padding: 1rem 1.1rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  transform: rotate(-1deg);
  font-size: clamp(0.9rem, 1.9vh, 1.2rem);
}
.k {
  font-size: 0.7em;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.k--plain {
  text-transform: none;
  letter-spacing: 0;
  font-size: 0.85em;
}
.v {
  font-size: 1.45em;
  font-weight: 700;
  line-height: 1.1;
}
.clip__arrow {
  width: min(100%, 22rem);
  text-align: center;
  font-size: 2rem;
  line-height: 1;
}
.real {
  background: #fbfaf6;
  color: #111;
  border-radius: 8px;
  padding: 0.9rem 1.1rem;
  font-family: var(--font-sans);
  font-size: clamp(1rem, 2.2vh, 1.4rem);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.55);
  text-shadow: none;
}
.real .k {
  color: #666;
  font-family: var(--font-mono);
}
.real .v {
  font-family: var(--font-sans);
  font-size: 1.5em;
}
.clip__phone {
  min-height: 0;
  height: 100%;
  display: flex;
  justify-content: center;
}
.clip__aside {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.6rem;
  max-width: 20rem;
}
.aside__big {
  margin: 0;
  font-size: clamp(1.6rem, 3.6vh, 2.4rem);
  color: var(--color-primary);
  letter-spacing: 0.04em;
}
.aside__small {
  margin: 0;
  font-family: var(--font-sans);
  font-size: clamp(0.95rem, 2vh, 1.2rem);
  color: var(--color-ink-muted);
  text-shadow: none;
  line-height: 1.4;
}

/* ---------- Rösta om ---------- */
.revote {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(9rem, 1fr) minmax(0, 2.4fr) minmax(9rem, 1fr);
  gap: clamp(1rem, 2.5vw, 2.5rem);
}
.revote__center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(0.8rem, 2.4vh, 1.6rem);
  min-height: 0;
}
.mini-card {
  display: flex;
  gap: 1.1em;
  align-items: center;
  padding: 0.9em 1.2em;
  transform: rotate(-0.8deg);
  width: min(100%, 36rem);
  font-size: clamp(0.95rem, 2.1vh, 1.3rem);
}
.mini-card__thumb {
  width: 9em;
  flex: none;
}
.mini-card__txt {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
}
.mini-card__txt b {
  font-size: 1.5em;
  line-height: 1.05;
}
.mini-card__txt span {
  color: var(--ink-soft);
}
.before {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--color-ink-muted);
  text-shadow: none;
  font-size: 1rem;
}
.revote__q {
  font-size: clamp(2rem, 5vh, 3.4rem);
}
.moved {
  min-height: 2.6em;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: clamp(1.6rem, 3.6vh, 2.4rem);
  color: var(--valv);
  letter-spacing: 0.04em;
  text-shadow: 0 0 8px color-mix(in srgb, var(--valv) 40%, transparent);
}
</style>
