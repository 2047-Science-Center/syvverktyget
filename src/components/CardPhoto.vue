<script setup lang="ts">
/**
 * Kortbilden (vitt fotokant-papper). Tål 404: tills filen finns i
 * public/cards/<valv>/<id>.png visas en platshållare i Valvets stil.
 * Filen dyker upp utan kodändring.
 */
import { ref, watch } from 'vue'

const props = defineProps<{ src: string; title: string; compact?: boolean }>()
const failed = ref(false)
watch(
  () => props.src,
  () => (failed.value = false),
)
</script>

<template>
  <div class="photo" :class="{ 'photo--compact': compact }">
    <img v-if="!failed" :src="src" :alt="title" @error="failed = true" />
    <div v-else class="photo__ph">
      <span class="photo__tag">BILD KOMMER</span>
      <b v-if="!compact">{{ title.toUpperCase() }}</b>
    </div>
  </div>
</template>

<style scoped>
.photo {
  position: relative;
  background: #1b2016;
  border: 0.4em solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  aspect-ratio: 3 / 2;
}
.photo--compact {
  border-width: 0.25em;
}
.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.photo__ph {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.3em;
  padding: 0.8em;
  background:
    repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.025) 0 12px, transparent 12px 24px),
    linear-gradient(160deg, #2c321f 0%, #171b12 70%);
  color: #e7dfc6;
}
.photo--compact .photo__ph {
  justify-content: center;
  align-items: center;
  padding: 0.2em;
}
.photo__tag {
  position: absolute;
  top: 0.7em;
  left: 0.7em;
  font-family: var(--font-mono);
  font-size: 0.7em;
  letter-spacing: 0.1em;
  color: var(--valv);
  border: 1px dashed var(--valv);
  padding: 0 0.4em;
}
.photo--compact .photo__tag {
  position: static;
  font-size: 0.55em;
}
.photo__ph b {
  font-family: var(--font-retro);
  font-weight: 400;
  color: var(--valv);
  font-size: 1.6em;
  letter-spacing: 0.06em;
}
</style>
