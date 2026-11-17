<script setup lang="ts">
/**
 * Dörrarna: gruppens dörrar före och efter verkligheten per roll (▲/▼/→),
 * plus det tryckta kortet att ta med (roller med rutor för stängd/öppen +
 * BRA PÅ). Inget sparas om personen; kortet kryssas med penna.
 */
import { useStore } from '@/store'
import TopBar from './TopBar.vue'
import DoorIcon from './DoorIcon.vue'

const store = useStore()
function mv(d: number): string {
  return d > 0 ? `▲${d}` : d < 0 ? `▼${-d}` : '→'
}
</script>

<template>
  <div class="screen">
    <TopBar label="DÖRRARNA" />
    <div class="sumwrap">
      <div class="sum">
        <p class="sum__lead">
          {{ store.openedTotal }} {{ store.openedTotal === 1 ? 'dörr öppnades' : 'dörrar öppnades' }} när ni såg verkligheten
        </p>
        <div class="row row--head mono"><span>ROLL</span><span>FÖRE</span><span>EFTER</span><span /></div>
        <div class="sum__list">
          <div
            v-for="(r, i) in store.journey"
            :key="r.role.id"
            class="row enter-up"
            :class="r.delta > 0 ? 'row--up' : r.delta < 0 ? 'row--down' : 'row--same'"
            :style="{ animationDelay: `${200 + i * 70}ms` }"
          >
            <span class="row__n">{{ r.role.title }}<em> · {{ r.role.realJob }}</em></span>
            <span class="row__c"><DoorIcon :open="r.before * 2 >= r.total" :size="0.8" /> {{ r.before }}/{{ r.total }}</span>
            <span class="row__c"><DoorIcon :open="r.after * 2 >= r.total" :size="0.8" /> {{ r.after }}/{{ r.total }}</span>
            <span class="row__mv">{{ mv(r.delta) }}</span>
          </div>
        </div>
      </div>
      <div class="paper takehome enter-up" style="--tilt: 1deg; animation-delay: 400ms">
        <span class="tape tape--r" />
        <div class="takehome__h"><span>Mina dörrar · {{ store.valv.name }}</span><span>ta med</span></div>
        <div class="takehome__legend">
          <span><DoorIcon :open="false" :size="0.8" color="#5a5f6b" /> stängd</span>
          <span><DoorIcon :open="true" :size="0.8" color="var(--stamp-open)" /> öppen</span>
        </div>
        <ul>
          <li v-for="r in store.deck" :key="r.id">
            <span>{{ r.title }}</span><span class="bx"><span /><span /></span>
          </li>
        </ul>
        <div class="field field--big">Bra på<span class="field__ln" /></div>
      </div>
    </div>
    <p class="crt-q">Dörrarna stängs inte av sig själva. Det är du som väljer när.</p>
  </div>
</template>

<style scoped>
.sumwrap {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: clamp(1.2rem, 3vw, 3rem);
  align-items: center;
}
.sum {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-height: 0;
}
.sum__lead {
  margin: 0 0 0.6rem;
  font-size: clamp(1.8rem, 4vh, 2.8rem);
  line-height: 1.05;
  color: var(--valv);
  text-shadow: 0 0 8px color-mix(in srgb, var(--valv) 40%, transparent);
}
.sum__list {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: auto;
}
.row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 5.5em 5.5em 3em;
  gap: 0.8em;
  align-items: center;
  padding: 0.3em 0.5em;
  border-bottom: 1px dashed #2a3324;
  font-family: var(--font-mono);
  font-size: clamp(0.9rem, 2vh, 1.25rem);
  color: var(--color-ink-strong);
  text-shadow: none;
}
.row--head {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  color: var(--color-ink-muted);
  border: 0;
}
.row__n {
  font-family: var(--font-type);
  font-size: 1.1em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.row__n em {
  font-style: normal;
  font-family: var(--font-mono);
  font-size: 0.75em;
  color: var(--color-ink-muted);
}
.row__c {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  color: var(--color-ink-muted);
  font-variant-numeric: tabular-nums;
}
.row__mv {
  font-family: var(--font-retro);
  font-size: 1.5em;
  text-align: right;
}
.row--up .row__mv {
  color: var(--valv);
}
.row--down .row__mv {
  color: #b9bfcc;
}
.row--same .row__mv {
  color: var(--color-primary-dim);
}
.takehome {
  padding: 1.4em 1.6em 1.3em;
  display: flex;
  flex-direction: column;
  gap: 0.55em;
  transform: rotate(1deg);
  font-size: clamp(0.9rem, 1.9vh, 1.2rem);
}
.takehome__h {
  display: flex;
  justify-content: space-between;
  font-size: 0.75em;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.takehome__legend {
  display: flex;
  gap: 1.2em;
  justify-content: flex-end;
  font-size: 0.75em;
  letter-spacing: 0.08em;
  color: var(--ink-soft);
  text-transform: uppercase;
}
.takehome__legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
}
.takehome ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3em;
}
.takehome li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6em;
  border-bottom: 1px dotted #b9ab8c;
  padding-bottom: 0.15em;
}
.bx {
  display: flex;
  gap: 2.6em;
  padding-right: 1.4em;
}
.bx span {
  width: 1.05em;
  height: 1.05em;
  border: 1.5px solid var(--ink);
  display: inline-block;
}
.takehome .field {
  margin-top: 0.5em;
}
</style>
