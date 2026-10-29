/**
 * Central config för SYV-verktyget (X&Y-finalen).
 *
 * Pilot vs drift skiljs av EN sak: `MODE`. Allt annat (valv, kortlek,
 * grupp-/skärmstorlek, texter, broker-adresser) är data här. Pilot→drift = byt
 * MODE och fyll stubbarna i adaptrarna — rör aldrig flödeslogiken.
 *
 * STATUS: skarp prototyp för ETT valv (Driften). Media (kort-bilder +
 * näringslivsklipp) pekas ut mot `public/`-sökvägar nedan; tills filerna
 * droppas visar MediaSlot en [BILD]/[VIDEO]-platshållare (tål 404). Rollistan
 * för Driften är ett UTKAST (se session 2026-10-12) och ska stämmas mot X&Y:s
 * riktiga valv-/rollspec.
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

  /** Sekunder ett näringslivsklipp spelar (platshållare räknar ner). */
  clipSeconds: 6,

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

/**
 * Bygger en url till en fil i public/ som funkar oavsett bas-sökväg
 * (`/` i dev/NUC, `/syvverktyget/` på ev. Pages). Filnamn med mellanslag
 * encode:as. Samma mönster som forhandlingen.
 */
export function asset(path: string): string {
  return encodeURI(import.meta.env.BASE_URL + path.replace(/^\/+/, ''))
}

export type ValvId = 'diplomatkaren' | 'driften' | 'forskningslaget' | 'teknologerna'

export interface Valv {
  id: ValvId
  /** Visningsnamn. */
  name: string
  /** Kort beskrivning av arbetssättet. */
  tagline: string
  /** Valvets färg (overall/accent i kort-bilderna). CSS-färg. */
  color: string
}

// Valvfärger = lag-overallens färg (låst 2026-10-12): Diplomatkåren GRÖN,
// Driften GUL, Forskningslaget BLÅ, Teknologerna RÖD.
export const VALV: Record<ValvId, Valv> = {
  diplomatkaren: { id: 'diplomatkaren', name: 'Diplomatkåren', tagline: 'Möten, avtal, relationer', color: '#7ad14f' },
  driften: { id: 'driften', name: 'Driften', tagline: 'Handfast, operativt, får igång', color: '#e8c020' },
  forskningslaget: { id: 'forskningslaget', name: 'Forskningslaget', tagline: 'Undersöka, testa, ta reda på', color: '#4aa3ff' },
  teknologerna: { id: 'teknologerna', name: 'Teknologerna', tagline: 'Konstruera, bygga, få att funka', color: '#ff5a3c' },
}

export interface Role {
  id: string
  /** Påhittat valv-yrke (kortets titel). */
  title: string
  /** Riktigt jobb bakom rollen. */
  realJob: string
  /** Kort blurb på kortet. */
  blurb: string
  /** Förproducerad kort-bild. Pekar mot public/cards/<valv>/<id>.png; tills
   *  filen finns visar MediaSlot en platshållare (tål 404). null = alltid ph. */
  image: string | null
  /** Näringslivsklipp som speglar verkligheten. `id` delas i klipp-poolen
   *  (flera roller kan peka på samma film); `src` mot public/clips/<id>.mp4. */
  clip: { id: string; brief: string; src: string | null }
}

/** Kort-bild-url för en roll (konvention: public/cards/<valv>/<id>.png). */
function cardImg(valv: ValvId, id: string): string {
  return asset(`cards/${valv}/${id}.png`)
}
/** Klipp-url ur den delade poolen (konvention: public/clips/<clipId>.mp4). */
function clipSrc(clipId: string): string {
  return asset(`clips/${clipId}.mp4`)
}

/**
 * Kortleken per valv. Just nu bara DRIFTEN (låst 2026-10-12, 6 roller — yrkena
 * som driftas INNE i valvet). Övriga valv fylls på när rollistan spikats. Varje
 * person som sorterats till ett valv får exakt detta valvs lek.
 *
 * image/clip.src pekar mot de filnamn som ska droppas i public/ — layouten är
 * klar, så när filerna finns dyker de upp utan kodändring.
 */
export const DECKS: Record<ValvId, Role[]> = {
  driften: [
    {
      id: 'processoperatoren',
      title: 'Processoperatören',
      realJob: 'Processoperatör, stål-/verkstadsindustri',
      blurb: 'Kör och vaktar en industriprocess dygnet runt — läser av, finjusterar, griper in när något larmar.',
      image: cardImg('driften', 'processoperatoren'),
      clip: { id: 'clip_silent_process', brief: 'Vox pop / silent process — en skiftgång i ett kontrollrum', src: clipSrc('clip_silent_process') },
    },
    {
      id: 'faltteknikern',
      title: 'Fältteknikern',
      realJob: 'Underhålls- och servicetekniker',
      blurb: 'Lagar det som gått sönder ute i fält — reser, löser, får igång. Ingen dag är den andra lik.',
      image: cardImg('driften', 'faltteknikern'),
      clip: { id: 'clip_faltbesok', brief: 'Talking head — "en dag på vägen" med en servicetekniker', src: clipSrc('clip_faltbesok') },
    },
    {
      id: 'faltmedikern',
      title: 'Fältmedikern',
      realJob: 'Sjuksköterska / undersköterska',
      blurb: 'Tar hand om människor när det gäller — snabba beslut, trygg hand, aldrig ensam i laget.',
      image: cardImg('driften', 'faltmedikern'),
      clip: { id: 'clip_vard', brief: 'Vox pop — vårdpersonal om "det ingen ser"', src: clipSrc('clip_vard') },
    },
    {
      id: 'harbargesvarden',
      title: 'Härbärgesvärden',
      realJob: 'Kock / hotell- och restaurangpersonal',
      blurb: 'Får ett rum fullt av gäster att må bra — tempo, timing och allt på plats samtidigt.',
      image: cardImg('driften', 'harbargesvarden'),
      clip: { id: 'clip_kok', brief: 'Silent process — ett kök under lunchrush', src: clipSrc('clip_kok') },
    },
    {
      id: 'markforvaltaren',
      title: 'Markförvaltaren',
      realJob: 'Lantbrukare / djurskötare',
      blurb: 'Odlar valvets mat i stora odlingstält — sköter grödor och system så basen är självförsörjande.',
      image: cardImg('driften', 'markforvaltaren'),
      clip: { id: 'clip_lantbruk', brief: 'Talking head — morgon bland odlingarna', src: clipSrc('clip_lantbruk') },
    },
    {
      id: 'vattenmastaren',
      title: 'Vattenmästaren',
      realJob: 'VA-/processtekniker (vattenrening)',
      blurb: 'Håller valvets vatten rent och i kretslopp — renar, återvinner, övervakar att inget går till spillo.',
      image: cardImg('driften', 'vattenmastaren'),
      clip: { id: 'clip_vatten', brief: 'Silent process — vattenrening/återvinning', src: clipSrc('clip_vatten') },
    },
  ],
  diplomatkaren: [],
  forskningslaget: [],
  teknologerna: [],
}

/**
 * PILOT: vilket valv den här gruppen sorterats till (sätts uppströms i drift
 * via identitetssömmen, eller via `?valv=` i URL:en). Byt här för att testa en
 * annan lek.
 */
export const PILOT_VALV: ValvId = 'driften'

/** PILOT: namn på de 3 vid den här skärmen (kommer från RFID-incheckning i drift). */
export const PILOT_MEMBERS = ['Spelare 1', 'Spelare 2', 'Spelare 3']

/** Vilken skärm den här instansen är ('A' driver flödet i solo-pilot). */
export const SCREEN_ID: 'A' | 'B' = 'A'
