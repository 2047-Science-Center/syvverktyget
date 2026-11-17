# SYV-verktyget v2 — X&Y:s sista moment (station)

Svep på åtta Valvet-roller med RFID-banden (vänster läsare = **stängd dörr**,
höger = **öppen dörr**), se sedan verkligheten bakom varje roll i ett äkta,
stående klipp och rösta om. Budskapet: yrken är inte könskodade, och dörrarna
stängs inte av sig själva. Byggd i X&Y-riggens station-mönster (bärnstens-CRT,
pilot↔drift via `config.mode`), som syskonen [`forhandlingen`](../forhandlingen)
och [`minnestest`](../minnestest).

**Status (2026-11-16): v2 byggd efter [`BESTALLNING-V2.md`](BESTALLNING-V2.md)
och skissen `design/skiss-v1/`.** Alla fyra valv (4 × 8 roller) går att klicka
igenom lokalt. RFID-sömmen, env-konfigen, startgränssnittet och NUC-kitet är
oförändrade från v1. Klippen finns inte än (platshållare räknar ner). Josef
granskar; se [Antaganden](#antaganden-att-feedbacka) nedan.

## Flödet

Incheckning, sortering till valv och övergångsfilmen sker UPPSTRÖMS. Appen
startar med en grupp som redan tillhör ett valv (`?valv=`).

```
kort → svep ×8 → så valde ni → (per roll: verkligheten → rösta om) ×8 → dörrarna
```

1. **Kortet** — inflyttningskortet på papper, valvet stämplat, `BRA PÅ` tomt
   (samma bild som sista bilden i övergångsfilmen). *"Åtta yrken från Valvet.
   Kan du tänka dig dem? Bippa för att börja."* Vilken bip som helst startar.
2. **Svep ×8** — ett papperskort per roll (tejp i valvfärgen, bild,
   Valvet-namn, en rad). Det riktiga yrket syns inte. Tre personer per skärm
   bippar; **majoriteten stämplar kortet** `DÖRREN ÖPPEN` / `DÖRREN STÄNGD`.
   Varje persons röst sparas per UID. Prickarna visar *att* någon röstat,
   aldrig vad. Samma UID igen före stämpeln = ändrat sig.
3. **Så valde ni** — alla åtta korten med gruppens sex dörrar (båda
   skärmarna). Barriären ligger här: den snabbare skärmen väntar in den andra
   (solo-pilot: skärm B simuleras och blir klar efter `simOtherScreenMs`).
   När båda är klara går vilken bip som helst vidare.
4. **Verkligheten, per roll** — papperskortet (Valvet-roll + gruppens dörrar)
   → *"På riktigt:"* + riktigt yrke → stående 9:16-klipp i en telefonram mitt
   på skärmen med stämpeln `PÅ RIKTIGT`. Klippet startar själv efter
   `clipIntroMs`. Bädden tystnar helt medan klippet är på skärmen.
5. **Rösta om, per roll** — *"Har du ändrat dig?"* med samma två dörrar och
   hur gruppen röstade nyss. Efter rösterna: *"1 dörr öppnades"* / *"Alla står
   kvar. Det är också ett svar."*
6. **Dörrarna** — gruppens dörrar före och efter per roll (▲/▼/→) och det
   tryckta kortet att ta med (rollerna med rutor för stängd/öppen + `BRA PÅ`).
   *"Dörrarna stängs inte av sig själva. Det är du som väljer när."*

## Kör lokalt

```bash
npm install
npm run dev        # http://localhost:5174 (se .claude/launch.json)
npm run typecheck  # vue-tsc
npm run build      # vue-tsc + vite build
```

Byt lek med `?valv=driften|diplomatkaren|forskningslaget|teknologerna`.

**Utan RFID-hårdvara:** klicka på dörrzonerna eller använd tangenterna
**◀/N = stängd, ▶/J = öppen** (en tryckning = en person). **Enter/mellanslag**
går vidare där det finns något att gå vidare till (kortet, så valde ni, hoppa
över klippet). Facilitator-raden överst (diskret, tonas upp vid hover) visar
fas, valv, RFID-status (LIVE/klick), mute, *vidare* och *starta om*.

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
mosquitto_pub -t station0/rfidja  -m 04A2B3C4   # på kortet: vilken bip som helst startar
mosquitto_pub -t station0/rfidja  -m 04A2B3C4   # en person: ÖPPEN dörr
mosquitto_pub -t station0/rfidja  -m 04AABBCC   # nästa: ÖPPEN
mosquitto_pub -t station0/rfidnej -m 04DDEEFF   # tredje: STÄNGD → kortet stämplas DÖRREN ÖPPEN
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
| `autostart=1` | hoppa över kortet och gå direkt in i svepet |
| `screen` | `A`/`B` (vilken skärm instansen är) |
| `broker` | override av RFID-broker-url |
| `slow` | `slow=5` gör alla väntetider fem gånger längre (demo, granskning, skärmdumpar) |

**2. Kommando-kanal (samma maskin, för regi-plumbing bredvid):**

```js
new BroadcastChannel('syv-finale').postMessage({ cmd: 'start', valv: 'driften', members: ['Alva','Noah','Wilma'] })
new BroadcastChannel('syv-finale').postMessage({ cmd: 'reset' })
// finns även på window.__syv.start(valv, members) / window.__syv.reset()
```

En dedikerad `station<N>/start`-MQTT-topic är **avsiktligt inte spikad** — den
tas i `xy-rigg/SOM.md` när regi-kontraktet landar. Tills dess räcker url + kanal.

## Data och media

**Kortlekarna** ligger i [`src/kortlek.ts`](src/kortlek.ts) (införd ur
[`KORTLEK.md`](KORTLEK.md), som är sanningskällan) och re-exporteras från
`src/config.ts`. Per roll: `id`, `title` (Valvet-namn), `realJob`, `blurb`,
`image`, `clip` (klipp-id ur poolen) och `proposed` (rollen är markerad *(ny)*
i KORTLEK.md; visas aldrig för besökarna). Klipp-poolen (`CLIPS`) har per klipp
`topic`, `hook` (rubriken i telefonramen) och `search` (sökorden).

Släpp filer i `public/` — slottarna tål 404 och byter till filen så fort den
finns, utan kodändring:

| Media | Sökväg | Saknas filen |
|---|---|---|
| Kortbild (3:2) | `public/cards/<valv>/<roll-id>.png` | mörk platshållare med `BILD KOMMER` + rollnamnet |
| Klipp (stående 9:16, ca 60 s) | `public/clips/<klipp-id>.mp4` | telefonramen med rubrik, sökord och sökväg; räknar ner `clipSeconds` |
| Bädd (loop, valfri) | `public/Sound/bed/syv-badd.mp3` | tyst |

Klippet spelas med ljud (kiosken kör `--autoplay-policy=no-user-gesture-required`).
Nekar webbläsaren ljud spelas det tyst hellre än inte alls. Klippets slut
(`ended`) går vidare till omröstningen.

## Ljud

`src/audio/AudioEngine.ts`: filerna i `public/Sound/sfx/` med syntes-fallback,
plus fyra nya v2-händelser enligt ljudprinciperna i
`RIKTNING-OVERGANG-OCH-VERKTYG.md` §(c):

| Händelse | Ljud |
|---|---|
| En bip (öppen eller stängd) | `bip`: en kort, tyst, neutral ton, **likadan för båda sidorna** |
| Kortet stämplas ÖPPEN | `doorOpen`: `h3-swipe-hoger` (kort varm ton uppåt) |
| Kortet stämplas STÄNGD | `doorClose`: syntes, luft genom ett filter som glider ihop + ett mjukt klick. **Aldrig ett fel-ljud** |
| En dörr öppnades i omröstningen | `doorGlide`: mjukt glid uppåt. Står alla kvar eller stängs en dörr: inget ljud |
| Nästa kort / så valde ni / rösta om / dörrarna | `h6` / `h7` / `h10` / `h14` som i v1 |

Bädden (om filen finns) duckar till tyst under klippet och kommer tillbaka efter.

## Struktur

| Del | Var |
|---|---|
| Tema (CRT = maskinen) | `src/theme/crt.css` (delat X&Y-tema + rörelse-tokens) |
| Papper, tejp, stämplar | `src/theme/paper.css` |
| Kortlekar + klipp-pool | `src/kortlek.ts` |
| Läge, broker, tider (`timing`) | `src/config.ts` |
| Tillståndsmaskin + röstning (per individ) | `src/store.ts` |
| RFID ja/nej-söm (oförändrad) | `src/adapters/rfid/`, `src/adapters/index.ts` |
| Start-gränssnitt (oförändrat) | `src/startInterface.ts` |
| Ljud | `src/audio/AudioEngine.ts` |
| Vyer | `src/components/` — `StartCard`, `SwipeScreen`, `OverviewScreen`, `RealityScreen` (klipp + rösta om), `DoorsScreen` |
| Byggstenar | `DoorIcon`, `DoorStrip`, `DoorZone`, `VotePips`, `CardPhoto`, `PhoneClip`, `TopBar`, `CrtScreen`, `FacilitatorBar` |
| NUC-kit (oförändrat) | `deploy/nuc/`, [`INSTALL-NUC.md`](INSTALL-NUC.md) |

## Antaganden (att feedbacka)

Val jag gjorde själv under bygget 2026-11-16 (Josef var borta). Säg till om något ska ändras.

**Flöde och interaktion**
1. **Dörrzonerna står på sidorna av kortet** (vänster/höger kolumn), inte under det som i skissen. Skärmen är liggande och zonerna hamnar då på samma sida som läsarna.
2. **Vilken bip som helst** (vänster eller höger) betyder "vi är redo" på kortet och i *så valde ni* (när båda skärmarna är klara). Annars går flödet inte att driva med bara banden.
3. **Klippet startar av sig självt** efter 2,5 s (papperskortet och "På riktigt:" hinner synas). Klick på play eller Enter startar direkt. Bippar under klippet räknas inte (ingen ska råka hoppa över det).
4. **Zonerna blinkar inte vid en röst** (skissen blinkar). Bara prickarna rör sig, så att ingen ser vad grannen valde.
5. **Stämpeln ligger 1,4 s** innan nästa kort, och "1 dörr öppnades" ligger 2,6 s. Allt i `config.timing`.
6. **Majoritet:** 2 av 3 avgör stämpeln. I *dörrarna* visas ikonen som öppen vid 3 av 6 eller fler.
7. **"N dörrar öppnades"** räknar netto per roll (en som öppnar och en som stänger = 0), och summan i *dörrarna* räknar bara roller där fler öppnade än stängde.
8. **Skärm B i solo-pilot:** svepet slumpas deterministiskt per roll; i omröstningen öppnar ungefär var tredje stängd dörr på B sig. Exempeldata, märkt *(simulerad)* i barriären.
9. **Dörrarna-vyn ligger kvar** tills facilitatorn/regi startar om (`⟲ starta om`, `__syv.reset()` eller kanalens `reset`). Ingen automatisk återställning.
10. **`?autostart=1` hoppar över kortet** (i v1 hoppade den över attract).

**Innehåll**
11. **Rubrikerna i telefonramen** (`hook` i klipp-poolen) är mina formuleringar, t.ex. *"Vad händer när du ringer 112?"* och *"150 meter upp i ett vindkraftverk"*. De syns bara tills riktiga klipp finns (riktiga klipp har egna rubriker).
12. **Kontonamnet** i platshållaren är `@<klipp-id>.irl`, och raden under är första delen av det riktiga yrket ("Forskare i jobbet").
13. **Sidtexten under klippet:** *"Titta. Lyssna."* och *"Ett riktigt klipp från en riktig arbetsplats. Sen får ni rösta igen."* Under barriären: *"Vilken var lättast att stänga?"* (ur skissens SYV-anteckning).
14. **Det riktiga yrket syns i *rösta om* och *dörrarna*** (efter verkligheten), aldrig i svepet eller *så valde ni*.
15. **De 12 rollerna markerade (ny)** är med i lekarna som alla andra, med `proposed: true` i datan.

**Ljud**
16. **h5 (nej-bip) och h2 (svep vänster) används inte.** h5 är lågt och starkt (spektral tyngdpunkt ~0,8 kHz, medelnivå −12 dB), alltså "fel"-karaktären; h2 är ett riktningsljud. Stängd dörr är syntes (filtrerad luft som glider ihop). Bippet är syntes, eftersom h4/h5 låter olika per sida. Jag har inte kunnat lyssna; granska `doorClose` och `bip` på riktigt.
17. **Ingen syntes-bädd.** Bädden spelas bara om `public/Sound/bed/syv-badd.mp3` finns; duckningen är byggd men inte hörbart verifierad.
18. Svep-ljuden h2/h3 för klick (v1) är borttagna: klick, tangent och RFID låter likadant.

**Teknik och look**
19. **Typsnitten** (Courier Prime, IBM Plex Sans) laddas från Google Fonts som VT323 i v1. Offline på NUC:en faller de tillbaka på Courier New/systemfont.
20. **Stämpelfärgen för ÖPPEN** är valvfärgen mörkad mot bläck (`color-mix`), tejpen är valvfärgen halvgenomskinlig. Kräver Chromium 111+.
21. **Stämpeln ligger på papperet** (titel/rad), inte på fotot som i skissen. På ett mörkt foto försvann den.
22. **`?slow=N`** är ny: gör alla väntetider N gånger längre, för demo och skärmdumpar. `?screen=B` läses nu av `SCREEN_ID` (visas bara i facilitator-raden).
23. Kortbilden visas i 3:2 (bildgen-utkasten är 1536×1024).

## Verifierat 2026-11-16

- `npm run typecheck` och `npm run build` går igenom.
- Hela flödet klickat igenom i webbläsaren (tangent + klick) för **alla fyra valv**, med skärmdumpar på kortet, svep (med stämpel), så valde ni, verkligheten, rösta om och dörrarna. Inget spiller över vid 1920×1080 eller 1280×720.
- RFID över en lokal mosquitto (`?broker=ws://localhost:<port>`): bip startar, tre UID:n stämplar kortet, samma UID tre gånger räknas som en person som ändrar sig.
- Platshållaren för en saknad kortbild.
- **Inte verifierat:** ett riktigt klipp (inga finns), ljuden med öronen, bädd-duckningen hörbart, två riktiga NUC:ar.

## Inte byggt (avsiktligt)

- **Skarp två-NUC-synk** över broker. Nu: solo-pilot där skärm B simuleras.
- **Identitets-/resultat-söm** (`station<N>/identity`, `/result`) — när regi-kontraktet landar.
- Övergångsfilmen (HyperFrames) och utskriften av det fysiska kortet.
- Inga nya MQTT-topics.
