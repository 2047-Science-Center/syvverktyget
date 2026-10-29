# SYV-verktyget — X&Y-finalen (station)

Svep-kortlek per valv + reveal mot näringslivet. Byggd i X&Y-riggens
station-mönster (bärnstens-CRT, pilot↔drift via `config.mode`), som
syskonen [`forhandlingen`](../forhandlingen) och [`minnestest`](../minnestest).

**Status: skarp prototyp för ETT valv (Driften).** Hela flödet spelas igenom
lokalt. RFID ja/nej-sömmen är skarp och mockbar via `mosquitto_pub`; media
(kort-bilder + näringslivsklipp) pekas ut mot `public/`-sökvägar och visar en
platshållare tills filerna droppas. Rollistan för Driften är ett UTKAST (6
roller) ur session 2026-10-12.

## Flödet (bara den här appen)

Incheckning på upplevelsen, incheckning på stationen och **sorteringen till
valv** sker UPPSTRÖMS — appen startar med en grupp som redan tillhör ett valv
och rätt kortlek laddad (se *Start-gränssnitt* nedan).

```
attract → swipe → barrier → reveal{ result → clip → revote } → summary
```

1. **swipe** — oberoende per skärm. De 3 vid skärmen bippar ja/nej (3 ja-läsare
   + 3 nej-läsare). **Majoriteten av de 3 avgör kortet live.** Varje individs
   röst sparas (per voterId: UID i drift, syntetiskt i klickläge). Ingen
   koppling till riktiga företag här.
2. **barrier** — "Så valde ni / Vill ni se hur ni valde?". Den snabbare
   3-gruppen väntar in den andra skärmen (andra NUC:en mot samma broker).
3. **reveal** — synkat, hela gruppen (6), kort för kort:
   - `result` — bild + svep-resultat aggregerat (t.ex. *4/6 kan tänka sig*)
   - `clip` — näringslivs-referensen spelas (verkligheten)
   - `revote` — alla röstar om: *"Vill du ändra din swipe?"*
4. **summary** — hela resan: per roll FÖRE → EFTER (▲/▼/→).

## Kör lokalt

```bash
npm install
npm run dev        # http://localhost:5174
npm run typecheck  # vue-tsc
npm run build      # vue-tsc + vite build
```

**Utan RFID-hårdvara:** klicka NEJ/JA-zonerna eller använd tangenterna
**◀/N = nej, ▶/J = ja**. Facilitator-raden överst visar fas, RFID-status
(LIVE/klick), mute och *starta om*.

## RFID ja/nej-sömmen (skarp + mockbar)

Sömmen följer tillägget i [`xy-rigg/SOM.md`](../xy-rigg/SOM.md): varje läsare
publicerar **rå UID** (VERSALER) på en sido-märkt topic —
`station<N>/rfidja` eller `station<N>/rfidnej`. Appen prenumererar via
MQTT-over-WebSocket (mqtt.js). En bip = en individ som röstar; majoriteten av de
tre vid skärmen avgör kortet; samma UID som bippar igen före upplösning räknas
som *ändrat sig*, inte en ny röst.

Topicen bär bara *sidan* — **vem** av de tre avgörs av UID → band → medlem (samma
uppslag som `station<N>/identity`). Sömmen är aldrig kritisk: finns ingen broker
körs flödet på klick/tangent (status-chipen visar `RFID klick`).

**Mocka i piloten** — starta en lokal broker med websockets-listener:

```bash
# mosquitto.conf
listener 1883
allow_anonymous true
listener 9001
protocol websockets
allow_anonymous true
```

```bash
mosquitto -c mosquitto.conf          # TCP 1883 + WS 9001
mosquitto_pub -t station0/rfidja  -m 04A2B3C4   # en person röstar JA
mosquitto_pub -t station0/rfidja  -m 04AABBCC   # nästa röstar JA
mosquitto_pub -t station0/rfidnej -m 04DDEEFF   # tredje röstar NEJ → kortet avgörs
```

Broker-url sätts i `config.rfid.brokerUrl` (pilot, default `ws://localhost:9001`)
respektive `config.production.brokerUrl` (drift), och kan overridas per kiosk med
`?broker=ws://host:9001`. Stäng av sömmen helt med `config.rfid.enabled = false`.

> **Öppen fråga (ej spikad):** när två skärmar delar samma `station<N>` måste
> skärm A/B kunna skiljas (eget stationsnummer per skärm eller eget broker-rum).
> Avgörs när regi-kontraktet landar — se noten i `xy-rigg/SOM.md`.

## Start-gränssnitt (regi-orkestratorn)

Finalen startas uppströms. Två vägar, båda utan ny SOM-topic:

**1. URL (primär — så här startar en kiosk):**

```
http://<kiosk>/?valv=driften&members=Alva,Noah,Wilma&autostart=1
```

| Param | Betydelse |
|---|---|
| `valv` | vilket valv gruppen sorterats till (`driften` m.fl.) → rätt kortlek |
| `members` | namn på de tre vid skärmen (komma-separerat) |
| `autostart=1` | hoppa attract och gå direkt in i swipe |
| `screen` | `A`/`B` (vilken skärm instansen är) |
| `broker` | override av RFID-broker-url |

**2. Kommando-kanal (samma maskin, för regi-plumbing bredvid):**

```js
new BroadcastChannel('syv-finale').postMessage({ cmd: 'start', valv: 'driften', members: ['Alva','Noah','Wilma'] })
new BroadcastChannel('syv-finale').postMessage({ cmd: 'reset' })
// finns även på window.__syv.start(valv, members) / window.__syv.reset()
```

En dedikerad `station<N>/start`-MQTT-topic är **avsiktligt inte spikad** — den
tas i `xy-rigg/SOM.md` när regi-kontraktet landar. Tills dess räcker url + kanal.

## Lägg till media (senare)

Släpp filer i `public/` — layouten är klar, slottarna tål 404 och byter till
filen så fort den finns (ingen kodändring):

- **Kort-bild:** `public/cards/<valv>/<roll-id>.png`
  (t.ex. `public/cards/driften/processoperatoren.png`).
- **Klipp (delad pool):** `public/clips/<clip-id>.mp4`
  (t.ex. `public/clips/clip_silent_process.mp4`). `clip.id` delas mellan roller.

Sökvägarna definieras i `src/config.ts` (`cardImg` / `clipSrc`).

## Ljud

Syntetiserad SFX (Web Audio) som standard, med valfritt sampel-lager i
`public/Sound/sfx/` — samma mönster och samma retro-SFX som station-kit
(forhandlingen/minnestest). Låses upp på första användargesten (attract).
Bespoke SYV-ljud kan genereras med `/sound-effects` senare; koden rörs inte,
bara filerna i `public/Sound/sfx/`.

## Struktur

| Del | Var |
|---|---|
| Tema (CRT) | `src/theme/crt.css` (delat X&Y-tema + rörelse-tokens) |
| Data (valv, kortlek, läge, broker, assets) | `src/config.ts` |
| Tillståndsmaskin + röstning (per individ) | `src/store.ts` |
| RFID ja/nej-söm (MQTT-over-WS, tålig) | `src/adapters/rfid/`, `src/adapters/index.ts` |
| Start-gränssnitt (url + kanal) | `src/startInterface.ts` |
| Ljud | `src/audio/AudioEngine.ts` |
| Vyer | `src/components/` (Attract, SwipeDeck, VotePanel, BarrierWait, RevealSequence, SummaryScreen, MediaSlot, FacilitatorBar) |

## Inte byggt än (avsiktligt)

- **Skarp två-NUC-synk** över broker. Nu: pilot/solo — ett fönster driver, den
  andra skärmens 3 röster simuleras deterministiskt. Barriären har en "andra
  skärmen klar"-knapp för klick-igenom.
- **Identitets-/resultat-söm** (`station<N>/identity`, `/result`) — stubbas när
  regi-kontraktet landar (samma mönster som station-kit).
- **Övriga valvs kortlekar** (bara Driften finns) + riktig media.
