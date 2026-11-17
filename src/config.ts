/**
 * Central config för SYV-verktyget (X&Y-finalen).
 *
 * Pilot vs drift skiljs av EN sak: `MODE`. Allt annat (valv, kortlek,
 * grupp-/skärmstorlek, texter, broker-adresser) är data här. Pilot→drift = byt
 * MODE och fyll stubbarna i adaptrarna — rör aldrig flödeslogiken.
 *
 * v2 (2026-11-16): kortleken (4 valv × 8 roller + klipp-pool) ligger i
 * `kortlek.ts` och re-exporteras härifrån. Media pekas ut mot `public/`
 * (cards/<valv>/<id>.png, clips/<klipp-id>.mp4); slottarna tål 404 och visar
 * en platshållare tills filen finns.
 */

export type Mode = 'pilot' | 'production'

/**
 * DRIFT-KONFIG VIA ENV (byggtid, Vite `import.meta.env.VITE_*`) — aldrig
 * hårdkodad i koden, aldrig hemligheter. install.sh på NUC:en bygger med:
 *   VITE_MODE=production VITE_BROKER_URL=ws://localhost:9341 VITE_STATION_N=0 npm run build
 * Broker kan dessutom overridas per kiosk i runtime med `?broker=ws://host:port`
 * (ingen ombyggnad), vilket vinner över bygg-värdet nedan. Se INSTALL-NUC.md.
 */
const env = import.meta.env

/** `?slow=N` gör alla väntetider i flödet N gånger längre (demo/granskning/skärmdumpar). */
const SLOW = (() => {
  if (typeof window === 'undefined') return 1
  const n = Number(new URLSearchParams(window.location.search).get('slow'))
  return Number.isFinite(n) && n > 0 ? n : 1
})()

/** 'production' om byggt med VITE_MODE=production, annars 'pilot' (default). */
const ENV_MODE: Mode = env.VITE_MODE === 'production' ? 'production' : 'pilot'

/** Stationens nummer i riggen. Topic-namespace blir `station<N>/…`. Sätts via
 *  VITE_STATION_N i drift. ANTA ALDRIG ett faktiskt legacy-nummer — bekräfta
 *  mot riggen innan skarp koppling. */
export const STATION_N = Number.isFinite(Number(env.VITE_STATION_N))
  ? Number(env.VITE_STATION_N)
  : 0

export const config = {
  /** 'pilot' = SOLO + mock-identitet/resultat, RFID mockas via mosquitto_pub.
   *  'production' = skarp broker/identitet/resultat (stubbat). Sätts med VITE_MODE. */
  mode: ENV_MODE,

  stationN: STATION_N,

  /** Personer per skärm (en 3-grupp bippar vid en skärm). */
  groupSize: 3,

  /** Antal skärmar vid stationen. 2 skärmar = 2 NUC:ar mot samma broker =
   *  hela gruppen (groupSize × screens) i reveal-momentet. */
  screens: 2,

  /**
   * PILOT-klickläge. 'solo' = ett fönster driver flödet och den andra
   * skärmens 3 röster simuleras (platshållare) så barriär + 6-aggregat funkar
   * utan en andra flik. 'sync' = två flikar/NUC:ar delar tillstånd (byggs
   * skarpt senare).
   */
  pilotSync: 'solo' as 'solo' | 'sync',

  /** Sekunder ett saknat klipp "spelar" (platshållaren räknar ner). Riktiga
   *  klipp spelar sin egen längd. */
  clipSeconds: 6,

  /** Tider i flödet (ms). Allt som väntar på något ligger här. */
  timing: {
    /** Stämpeln ligger kvar på kortet innan nästa roll. */
    stampHoldMs: 1400 * SLOW,
    /** "1 dörr öppnades" ligger kvar innan nästa roll i verkligheten. */
    revoteHoldMs: 2600 * SLOW,
    /** Papperskort + "På riktigt:" visas innan klippet startar av sig självt. */
    clipIntroMs: 2500 * SLOW,
    /** PILOT/solo: så länge "skärm B" låtsas svepa klart efter skärm A. */
    simOtherScreenMs: 2500 * SLOW,
  },

  /**
   * RFID ja/nej-sömmen (SOM: `station<N>/rfidja` + `/rfidnej`, rå UID).
   * Appen prenumererar via MQTT-over-WebSocket. Finns ingen broker igång körs
   * allt ändå på klick/tangent — sömmen är aldrig kritisk för flödet.
   *
   * Mocka i piloten (broker med websockets-listener igång):
   *   mosquitto_pub -t station0/rfidja  -m 04A2B3C4
   *   mosquitto_pub -t station0/rfidnej -m 04A2B3C4
   */
  rfid: {
    /** true = försök ansluta till broker och lyssna på ja/nej-läsarna.
     *  Stäng av helt med VITE_RFID_ENABLED=0 (allt kör då på klick/tangent). */
    enabled: env.VITE_RFID_ENABLED !== '0',
    /** MQTT-over-WS-url i PILOT. Default lokal mosquitto (listener 9001,
     *  protocol websockets). Kan overridas med VITE_PILOT_BROKER_URL (byggtid)
     *  eller `?broker=ws://…` i URL:en (runtime). */
    brokerUrl: (env.VITE_PILOT_BROKER_URL as string | undefined) || 'ws://localhost:9001',
  },

  /** MQTT/WS-adresser i DRIFT — fylls via miljövariabler (VITE_BROKER_URL),
   *  aldrig hårdkodat här, aldrig hemligheter i git. */
  production: {
    /** Broker för RFID/identitet/resultat i drift (MQTT-over-WS). */
    brokerUrl: (env.VITE_BROKER_URL as string | undefined) || '',
  },
}

/** Hela gruppen vid stationen (båda skärmarna). */
export const FULL_GROUP = config.groupSize * config.screens

export { VALV, VALV_IDS, DECKS, CLIPS, asset, clipSrc } from './kortlek'
export type { ValvId, Valv, Role, Clip, ClipId } from './kortlek'

/**
 * PILOT: vilket valv den här gruppen sorterats till (sätts uppströms i drift
 * via `?valv=` eller kommando-kanalen).
 */
export const PILOT_VALV = 'driften' as const

/** PILOT: namn på de 3 vid den här skärmen (kommer från RFID-incheckning i drift). */
export const PILOT_MEMBERS = ['Spelare 1', 'Spelare 2', 'Spelare 3']

/** Vilken skärm den här instansen är ('A' driver flödet i solo-pilot). `?screen=B` byter. */
export const SCREEN_ID: 'A' | 'B' =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('screen') === 'B' ? 'B' : 'A'
