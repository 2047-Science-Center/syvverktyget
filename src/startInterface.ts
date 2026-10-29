/**
 * Start-gränssnitt för regi-orkestratorn.
 *
 * Finalen startas UPPSTRÖMS: regi vet vilket valv gruppen sorterats till och
 * vilka tre som står vid skärmen. Två vägar att trigga, båda utan ny SOM-topic:
 *
 *  1. URL (primär — så här startar en kiosk):
 *       ?valv=driften&members=Alva,Noah,Wilma&autostart=1
 *     Regi (eller incheckningen) öppnar/navigerar kiosken till rätt url.
 *     `?broker=ws://host:9001` pekar om RFID-sömmen; `?screen=A|B`.
 *
 *  2. Kommando-kanal (samma maskin, för regi-plumbing som kör bredvid):
 *       BroadcastChannel('syv-finale').postMessage({ cmd:'start', valv, members })
 *       … { cmd:'reset' }
 *     Finns även på window.__syv för enkel scripting.
 *
 * En dedikerad `station<N>/start`-MQTT-topic är AVSIKTLIGT inte spikad här —
 * den tas i SOM.md när regi-kontraktet landar (öppen fråga). Tills dess räcker
 * url + kanal för pilot och drift.
 */
import type { useStore } from './store'
import type { ValvId } from './config'

type Store = ReturnType<typeof useStore>

const VALV_IDS: ValvId[] = ['diplomatkaren', 'driften', 'forskningslaget', 'teknologerna']

function parseMembers(raw: string | null): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function applyValv(store: Store, raw: string | null): void {
  if (raw && (VALV_IDS as string[]).includes(raw)) store.setValv(raw as ValvId)
}

/** Läs URL-parametrar och koppla kommando-kanalen. Returnerar en cleanup. */
export function applyStartInterface(store: Store): () => void {
  if (typeof window === 'undefined') return () => {}

  const params = new URLSearchParams(window.location.search)
  applyValv(store, params.get('valv'))
  store.setMembers(parseMembers(params.get('members')))
  if (params.get('autostart') === '1') store.begin()

  // Kommando-kanal (samma maskin).
  let channel: BroadcastChannel | null = null
  try {
    channel = new BroadcastChannel('syv-finale')
    channel.onmessage = (ev: MessageEvent) => {
      const msg = ev.data as { cmd?: string; valv?: string; members?: string[] }
      if (!msg || typeof msg.cmd !== 'string') return
      if (msg.cmd === 'reset') {
        store.reset()
      } else if (msg.cmd === 'start') {
        if (msg.valv) applyValv(store, msg.valv)
        if (Array.isArray(msg.members)) store.setMembers(msg.members)
        store.begin()
      } else if (msg.cmd === 'setValv' && msg.valv) {
        applyValv(store, msg.valv)
      }
    }
  } catch {
    /* BroadcastChannel saknas (äldre miljö) — url-vägen räcker */
  }

  // Enkel scripting-ingång för regi/test.
  ;(window as unknown as { __syv?: unknown }).__syv = {
    start: (valv?: string, members?: string[]) => {
      if (valv) applyValv(store, valv)
      if (members) store.setMembers(members)
      store.begin()
    },
    reset: () => store.reset(),
    setValv: (valv: string) => applyValv(store, valv),
  }

  return () => {
    try {
      channel?.close()
    } catch {
      /* ignore */
    }
  }
}
