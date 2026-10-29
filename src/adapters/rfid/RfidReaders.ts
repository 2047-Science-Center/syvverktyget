/**
 * RFID ja/nej-läsare — sömmen för svep-stationen (SOM: `station<N>/rfidja` +
 * `station<N>/rfidnej`, rå UID). En bip = en individ som röstar ja eller nej.
 *
 * Adaptern är transportoberoende: flödet (store) bryr sig bara om `onBip`.
 * Pilot och drift delar implementation (MqttRfidReaders), bara broker-url
 * skiljer. Finns ingen broker igång körs flödet ändå på klick/tangent —
 * sömmen är aldrig kritisk.
 */
import type { Ref } from 'vue'

export type ReaderSide = 'ja' | 'nej'

export interface ReaderBip {
  /** Vilken läsar-sida bippades (bärs av topicen `rfidja`/`rfidnej`). */
  side: ReaderSide
  /** Rå UID (VERSALER) — identifierar individen (UID → band → medlem). */
  uid: string
  ts: number
}

export interface RfidReaders {
  /** Prenumerera på bip. Returnerar avprenumerera-funktion. */
  onBip(cb: (bip: ReaderBip) => void): () => void
  /** Reaktiv anslutningsstatus (för status-chip i facilitator-raden). */
  readonly connected: Ref<boolean>
  close(): void
}
