<script setup lang="ts">
/**
 * Telefonramen med det stående klippet (9:16) ur poolen:
 * public/clips/<klipp-id>.mp4. Klippets eget ljud är innehållet.
 *
 * Saknas filen (404) visas en platshållare som ser ut som ett TikTok-klipp
 * (rubrik, konto, progress) och räknar ner config.clipSeconds, så att flödet
 * går att klicka igenom. Föräldern bestämmer NÄR klippet startar (`playing`).
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { config, clipSrc, type Clip } from '@/config'

const props = defineProps<{ clip: Clip; realJob: string; playing: boolean }>()
const emit = defineEmits<{ ended: []; start: [] }>()

const video = ref<HTMLVideoElement | null>(null)
const failed = ref(false)
const progress = ref(0) // 0..1
const remaining = ref(config.clipSeconds)
const src = computed(() => clipSrc(props.clip.id))

let timer: ReturnType<typeof setInterval> | null = null
let done = false

function finish(): void {
  if (done) return
  done = true
  stopTimer()
  progress.value = 1
  emit('ended')
}

function stopTimer(): void {
  if (timer) clearInterval(timer)
  timer = null
}

/** Platshållaren "spelar": räknar ner clipSeconds. */
function runPlaceholder(): void {
  if (timer || done) return
  const total = config.clipSeconds * 1000
  const t0 = performance.now()
  timer = setInterval(() => {
    const t = performance.now() - t0
    progress.value = Math.min(1, t / total)
    remaining.value = Math.max(0, Math.ceil((total - t) / 1000))
    if (t >= total) finish()
  }, 100)
}

async function playVideo(): Promise<void> {
  const v = video.value
  if (!v) return
  try {
    v.muted = false
    await v.play()
  } catch (e) {
    // Autoplay med ljud nekat (vanlig webbläsare utan kiosk-flaggan): spela tyst hellre än inte alls.
    if ((e as DOMException)?.name === 'NotAllowedError') {
      v.muted = true
      void v.play().catch(() => (failed.value = true))
    }
  }
}

function onTime(): void {
  const v = video.value
  if (!v || !v.duration) return
  progress.value = v.currentTime / v.duration
  remaining.value = Math.max(0, Math.ceil(v.duration - v.currentTime))
}

watch(
  () => [props.playing, failed.value] as const,
  ([playing, isFailed]) => {
    if (!playing) return
    if (isFailed) runPlaceholder()
    else void playVideo()
  },
  { immediate: true },
)

// Ny roll med samma komponent → börja om.
watch(
  () => props.clip.id,
  () => {
    stopTimer()
    done = false
    failed.value = false
    progress.value = 0
    remaining.value = config.clipSeconds
  },
)

onBeforeUnmount(() => {
  stopTimer()
  video.value?.pause()
})

const account = computed(() => `@${props.clip.id}.irl`)
const clock = computed(() => `0:${String(remaining.value).padStart(2, '0')}`)
</script>

<template>
  <div class="phone" :class="{ 'phone--playing': playing }">
    <video
      v-if="!failed"
      ref="video"
      class="phone__video"
      :src="src"
      preload="auto"
      playsinline
      @error="failed = true"
      @ended="finish"
      @timeupdate="onTime"
    />
    <div v-if="failed" class="phone__vid">
      <div class="phone__ph mono">[ klipp saknas · clips/{{ clip.id }}.mp4 ]<br />sök: {{ clip.search.join(' · ') }}</div>
      <div class="phone__hook">{{ clip.hook }}</div>
      <div class="phone__rail"><i /><i /><i /></div>
      <div class="phone__meta">
        <b>{{ account }}</b>{{ realJob.split(' · ')[0] }} i jobbet
      </div>
    </div>
    <button v-if="!playing" type="button" class="phone__play" aria-label="Spela klippet" @click="emit('start')">
      <svg width="26" height="30" viewBox="0 0 26 30"><polygon points="0,0 26,15 0,30" fill="#fff" /></svg>
    </button>
    <span class="phone__stamp">PÅ RIKTIGT</span>
    <span v-if="playing" class="phone__clock mono">{{ clock }}</span>
    <div class="phone__prog"><span :style="{ transform: `scaleX(${progress})` }" /></div>
  </div>
</template>

<style scoped>
.phone {
  position: relative;
  height: 100%;
  aspect-ratio: 9 / 16;
  background: #000;
  border-radius: 1.6rem;
  border: 3px solid #2b2b2b;
  overflow: hidden;
  box-shadow: 0 14px 44px rgba(0, 0, 0, 0.7);
  text-shadow: none;
  font-family: var(--font-sans);
}
.phone__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}
.phone__vid {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.75) 100%),
    radial-gradient(80% 50% at 50% 35%, #3f4a52 0%, #1d2328 70%);
}
.phone__play {
  position: absolute;
  left: 50%;
  top: 50%;
  translate: -50% -50%;
  width: 4.4rem;
  height: 4.4rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  border: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
}
.phone__play svg {
  margin-left: 4px;
}
.phone__hook {
  position: absolute;
  top: 20%;
  left: 7%;
  right: 7%;
  text-align: center;
  font-weight: 700;
  font-size: clamp(1.1rem, 2.6vh, 1.6rem);
  line-height: 1.2;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
  background: rgba(0, 0, 0, 0.35);
  padding: 0.4em 0.5em;
  border-radius: 6px;
}
.phone__meta {
  position: absolute;
  left: 0.8rem;
  right: 3.2rem;
  bottom: 1.2rem;
  color: #fff;
  font-size: 0.85rem;
  line-height: 1.35;
}
.phone__meta b {
  display: block;
  font-size: 0.95rem;
}
.phone__rail {
  position: absolute;
  right: 0.6rem;
  bottom: 4rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.phone__rail i {
  display: block;
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
}
.phone__ph {
  position: absolute;
  bottom: 5.2rem;
  left: 0.7rem;
  right: 3rem;
  font-size: 0.68rem;
  line-height: 1.4;
  color: #cfd6da;
  opacity: 0.8;
  text-align: center;
}
.phone__stamp {
  position: absolute;
  top: 0.8rem;
  left: 0.8rem;
  font-family: var(--font-type);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.1em;
  color: var(--valv);
  border: 2px solid var(--valv);
  padding: 0 0.5em;
  transform: rotate(-4deg);
  background: rgba(0, 0, 0, 0.45);
  z-index: 3;
}
.phone__clock {
  position: absolute;
  top: 0.9rem;
  right: 0.9rem;
  font-size: 0.8rem;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  padding: 0 0.4em;
  border-radius: 4px;
  z-index: 3;
}
.phone__prog {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  z-index: 3;
}
.phone__prog span {
  display: block;
  height: 100%;
  background: #fff;
  transform-origin: left;
  transform: scaleX(0);
}
</style>
