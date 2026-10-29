/**
 * Adapter-fabrik. EN plats där pilot↔drift avgörs (config.mode) för sömmarna
 * runt flödet. Byter man läge byts broker-url — flödeslogiken rörs aldrig.
 *
 * Just nu bär prototypen EN söm skarpt: RFID ja/nej-läsarna. Identitet och
 * resultat (station<N>/identity, /result) stubbas när regi-kontraktet landar
 * (samma mönster som forhandlingen/station-kit).
 */
import { ref } from 'vue'
import { config } from '@/config'
import type { RfidReaders } from './rfid/RfidReaders'
import { MqttRfidReaders } from './rfid/MqttRfidReaders'

/** En no-op-söm: inga läsare (allt via klick/tangent). */
class NullRfidReaders implements RfidReaders {
  readonly connected = ref(false)
  onBip(): () => void {
    return () => {}
  }
  close(): void {}
}

/** Broker-url: `?broker=` i URL > drift-config > pilot-config. */
function brokerUrl(): string {
  if (typeof window !== 'undefined') {
    const q = new URLSearchParams(window.location.search).get('broker')
    if (q) return q
  }
  // Drift: VITE_BROKER_URL (byggtid). Är den tom faller vi tillbaka på
  // pilot-brokern så sömmen aldrig får en tom url (→ klick/tangent-läge).
  if (config.mode === 'production') return config.production.brokerUrl || config.rfid.brokerUrl
  return config.rfid.brokerUrl
}

export function createRfid(): RfidReaders {
  if (!config.rfid.enabled) return new NullRfidReaders()
  return new MqttRfidReaders(brokerUrl(), config.stationN)
}

export type { RfidReaders, ReaderBip, ReaderSide } from './rfid/RfidReaders'
