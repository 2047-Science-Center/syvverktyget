<script setup lang="ts">
/**
 * Platshållare för media (kort-bild eller näringslivsklipp). Renderar en
 * tydlig [BILD]/[VIDEO]-ruta tills filen finns. `src` pekar redan mot rätt
 * public/-sökväg (se config); saknas filen (404) faller slotten tillbaka på
 * platshållaren — droppa in filen så dyker den upp utan kodändring.
 */
import { ref, watch } from 'vue'

const props = defineProps<{
  kind: 'image' | 'video'
  src: string | null
  label: string
  accent?: string
}>()

/** Filen gick inte att ladda (ännu inte droppad) → visa platshållare. */
const failed = ref(false)
watch(
  () => props.src,
  () => (failed.value = false),
)
const show = (k: 'image' | 'video') => !!props.src && props.kind === k && !failed.value
</script>

<template>
  <div class="slot amber-frame" :style="accent ? { borderColor: accent } : undefined">
    <img v-if="show('image')" :src="src!" class="slot__media" :alt="label" @error="failed = true" />
    <video
      v-else-if="show('video')"
      :src="src!"
      class="slot__media"
      autoplay
      muted
      playsinline
      @error="failed = true"
    />
    <div v-else class="slot__ph">
      <div class="slot__tag mono">[{{ kind === 'image' ? 'BILD' : 'VIDEO' }}]</div>
      <div class="slot__label">{{ label }}</div>
      <div class="slot__hint mono">media läggs till senare</div>
    </div>
  </div>
</template>

<style scoped>
.slot {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.slot__media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.slot__ph {
  text-align: center;
  padding: 1rem;
  color: var(--color-ink-muted);
  background: repeating-linear-gradient(135deg, #0c1f14 0 14px, #0a1a11 14px 28px);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.slot__tag {
  color: var(--color-primary);
  font-size: 1.1rem;
  letter-spacing: 0.1em;
}
.slot__label {
  color: var(--color-ink-strong);
  font-size: 1rem;
  max-width: 34ch;
}
.slot__hint {
  font-size: 0.8rem;
  opacity: 0.7;
}
</style>
