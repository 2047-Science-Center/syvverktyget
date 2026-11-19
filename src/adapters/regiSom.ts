/**
 * Regi-sömmen (xy-rigg/SOM.md "Regi-orkestrering" + "Appar i riggen"):
 *
 *   syv/start  regi → SYV   {session_id}               → börja (om vi står på startkortet)
 *   syv/done   SYV → regi   {session_id, valv, screen} → när dörrarna visats (bara skärm A per valv)
 *
 * Regi väntar in `done` från alla valv innan den går vidare (config syv.valv_antal).
 * Aktiv i drift (VITE_MODE=production) eller när kiosken/overlayen anger `?broker=`.
 * Samma tålighet som RFID-sömmen: mqtt laddas dynamiskt, saknad broker stör aldrig flödet.
 */
import { watch } from 'vue'
import { config, SCREEN_ID } from '@/config'
import type { useStore } from '@/store'

type Store = ReturnType<typeof useStore>

type MqttLike = {
  on(event: string, cb: (...args: unknown[]) => void): void
  subscribe(topic: string): void
  publish(topic: string, payload: string): void
  end(force?: boolean): void
}

/** Kopplar syv/start → begin och dörrarna → syv/done. Returnerar en cleanup. */
export function connectRegi(store: Store, brokerUrl: string): () => void {
  if (typeof window === 'undefined') return () => {}
  const params = new URLSearchParams(window.location.search)
  if (!brokerUrl || !(config.mode === 'production' || params.has('broker'))) return () => {}

  let session: string | number | null = params.get('session')
  let client: MqttLike | null = null
  let closed = false
  let doneSent = false

  const stopWatch = watch(
    () => store.phase,
    (p) => {
      if (p === 'card') doneSent = false
      if (p !== 'doors' || doneSent || SCREEN_ID !== 'A') return
      doneSent = true
      const sid = typeof session === 'string' && /^\d+$/.test(session) ? Number(session) : session
      client?.publish('syv/done', JSON.stringify({ session_id: sid, valv: store.valvId, screen: SCREEN_ID }))
    },
  )

  import('mqtt')
    .then(({ default: mqtt }) => {
      if (closed) return
      client = mqtt.connect(brokerUrl, {
        reconnectPeriod: 3000,
        connectTimeout: 4000,
        clientId: `syv-${store.valvId}-${SCREEN_ID}-${Math.random().toString(16).slice(2, 8)}`,
      }) as unknown as MqttLike
      client.on('connect', () => client?.subscribe('syv/start'))
      client.on('message', (topic: unknown, payload: unknown) => {
        if (topic !== 'syv/start') return
        try {
          const d = JSON.parse(String(payload) || '{}') as { session_id?: string | number | null }
          if (d.session_id != null) session = d.session_id
        } catch {
          /* tom/trasig payload → starta ändå */
        }
        if (store.phase === 'card') store.begin()
      })
    })
    .catch(() => {
      /* mqtt saknas → bara url/kanal-vägarna */
    })

  return () => {
    closed = true
    stopWatch()
    try {
      client?.end(true)
    } catch {
      /* ignore */
    }
  }
}
