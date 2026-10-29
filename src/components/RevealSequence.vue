<script setup lang="ts">
/**
 * "Se hur ni valde" — synkat, hela gruppen (6), kort för kort. Slinga per roll:
 *   a) result  — bild + svep-resultat (X/6 kan tänka sig)
 *   b) clip    — näringslivs-referensen spelas (verkligheten)
 *   c) revote  — alla röstar om: "Vill du ändra din swipe?"
 */
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { config } from '@/config'
import { useStore } from '@/store'
import MediaSlot from './MediaSlot.vue'
import VotePanel from './VotePanel.vue'

const store = useStore()
const card = computed(() => store.revealCard)
const before = computed(() => (card.value ? store.swipeJa(card.value.id) : 0))

const clipLeft = ref(config.clipSeconds)
let timer: ReturnType<typeof setInterval> | null = null

function clearTimer(): void {
  if (timer) clearInterval(timer)
  timer = null
}

watch(
  () => store.revealStep,
  (step) => {
    clearTimer()
    if (step === 'clip') {
      clipLeft.value = config.clipSeconds
      timer = setInterval(() => {
        clipLeft.value -= 1
        if (clipLeft.value <= 0) {
          clearTimer()
          store.revealClipEnded()
        }
      }, 1000)
    }
  },
)
onBeforeUnmount(clearTimer)
</script>

<template>
  <div v-if="card" class="reveal">
    <header class="reveal__head">
      <span class="reveal__valv amber-badge" :style="{ borderColor: store.valv.color, color: store.valv.color }">
        {{ store.valv.name.toUpperCase() }}
      </span>
      <span class="reveal__progress mono">{{ store.revealIndex + 1 }} / {{ store.deck.length }}</span>
    </header>

    <!-- a) Resultat -->
    <template v-if="store.revealStep === 'result'">
      <div class="reveal__media">
        <MediaSlot kind="image" :src="card.image" :label="`${card.title} — förproducerat kort`" :accent="store.valv.color" />
      </div>
      <div class="reveal__text">
        <h2 class="reveal__title">{{ card.title }}</h2>
        <p class="reveal__count">
          <span class="ink-strong">{{ before }}/{{ store.FULL_GROUP }}</span> kan tänka sig det här
        </p>
        <p class="reveal__real mono">{{ card.realJob }}</p>
      </div>
      <button class="crt-button crt-button--strong" @click="store.revealPlayClip()">
        ▶ SE HUR DET ÄR PÅ RIKTIGT
      </button>
    </template>

    <!-- b) Klipp -->
    <template v-else-if="store.revealStep === 'clip'">
      <div class="reveal__media reveal__media--clip">
        <MediaSlot kind="video" :src="card.clip.src" :label="card.clip.brief" />
        <div class="reveal__timer mono">{{ clipLeft }}s</div>
      </div>
      <p class="reveal__cliphint">Referens från näringslivet · {{ card.realJob }}</p>
      <button class="crt-button" @click="store.revealClipEnded()">HOPPA ÖVER ▸</button>
    </template>

    <!-- c) Omröstning igen -->
    <template v-else>
      <div class="reveal__media reveal__media--small">
        <MediaSlot kind="image" :src="card.image" :label="card.title" :accent="store.valv.color" />
      </div>
      <VotePanel
        :pending="store.revotePending"
        :size="config.groupSize"
        question="Vill du ändra din swipe?"
        @cast="store.castRevote"
      />
    </template>
  </div>
</template>

<style scoped>
.reveal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}
.reveal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.reveal__valv {
  font-family: var(--font-retro);
  letter-spacing: 0.12em;
}
.reveal__progress {
  color: var(--color-ink-muted);
}
.reveal__media {
  flex: 1;
  min-height: 0;
}
.reveal__media--clip {
  position: relative;
}
.reveal__media--small {
  flex: 0 0 34%;
}
.reveal__timer {
  position: absolute;
  top: 0.6rem;
  right: 0.8rem;
  color: var(--color-primary);
  background: rgba(5, 16, 11, 0.7);
  border: 1px solid var(--color-primary-dim);
  border-radius: 6px;
  padding: 0.1rem 0.5rem;
}
.reveal__text {
  text-align: center;
}
.reveal__title {
  font-family: var(--font-retro);
  font-size: clamp(1.8rem, 5vw, 2.6rem);
  letter-spacing: 0.06em;
  color: var(--color-primary);
  margin: 0 0 0.3rem;
  text-shadow: var(--glow-soft);
}
.reveal__count {
  font-size: 1.3rem;
  margin: 0.2rem 0;
}
.reveal__real {
  color: var(--color-ink-muted);
  letter-spacing: 0.06em;
  margin: 0.2rem 0 0;
}
.reveal__cliphint {
  text-align: center;
  color: var(--color-ink-muted);
  margin: 0;
}
.reveal .crt-button {
  align-self: center;
}
</style>
