# SYV-verktyget: riktning för övergången och för verktygets look & feel

*Riktningsdokument, inte manus och inte kod. Skrivet 2026-11-16 för att Josef ska kunna
börja ta fram innehåll. Bygger på [`SLUTMOMENT-KONCEPT.md`](SLUTMOMENT-KONCEPT.md),
appen som den ser ut idag ([`README.md`](README.md), [`src/config.ts`](src/config.ts)),
[`xy-sortering/KONCEPT.md`](../xy-sortering/KONCEPT.md) §7.2 (VALdi lämnar över till SYV),
[`xy-ljud/LJUDIDENTITET.md`](../xy-ljud/LJUDIDENTITET.md) §5 (SYV = registerbyte),
[`xy-reveal-film/BRIEF.md`](../xy-reveal-film/BRIEF.md) (collage- och arkivlook) och
trailermanuset som skrivs parallellt ([`xy-trailer/TRAILER-MANUS-EXPLAINER.md`](../xy-trailer/TRAILER-MANUS-EXPLAINER.md)).
Tänkt med HyperFrames-skillens berättelseverktyg: **en enda sak att minnas, de två första
sekunderna, en tydlig mekanism för bryggan och ljud som berättar**.*

> **Beslut av Josef 2026-11-16. Detta gäller före resten av dokumentet där de krockar:**
> - **Övergången = grepp A, "Kortet lyfts ut".**
> - **Två val, ja eller nej.** Det finns bara två läsare. Estetiken är **stängd dörr (vänster) / öppen dörr (höger)**. "På glänt" och dörren räknad per profil (avvikelse 3 nedan) gäller inte.
> - **Papperskortet är ett format vi jobbar med.** Inflyttningskortet (`VALV:` stämplat, `BRA PÅ: ____`) är både den sista bilden i övergången och estetiken i appen: varje roll är ett papperskort med tejp och stämpel. Det kan också tryckas på riktigt, ett per person, med rollerna och rutor för stängd/öppen att kryssa i för hand. Om vi faktiskt trycker det är inte bestämt.
> - **Flödet i appen:** svep på alla roller i valvet (Driften: 8) → så valde ni → per roll: riktigt namn + verklighetsklipp (stående, TikTok-format, ca 60 s, t.ex. "Hur mycket tjänar en processoperatör?") → rösta om ja/nej → dörrarna före/efter.
> - **Svepbilderna är roliga situationer i Valvet** (fiktion, samma värld som stationerna, nya genererade bilder), inte dokumentära bilder från verkligheten. Verkligheten kommer i klippet. "Fönster i bunkern"-principen nedan gäller alltså klippet, inte svepkorten.
> - **Profiler med flera kort / blind dejt (avvikelse 2) läggs åt sidan** för nu. Ett kort per roll.
> - **Manligt/kvinnligt i bilderna hanteras inte nu.** Först ska upplägget sitta.
> - Klickbar skiss av flödet: <https://claude.ai/artifact/QEFhpgeP81h13ig19HvKD5> (privat tills den delas).
>
> **Var jag avviker från det som finns** (alla avvikelser är markerade **⚑** i texten):
> 1. ⚑ **Det verkliga ska höras med en riktig människoröst, inte med VALdi.** VALdi lämnar över, och efter det talar en riktig person. Ingen AI-röst efter bryggan.
> 2. ⚑ **Ett kort blir en profil.** Varje roll visas som en Hinge-liknande *profil* med 4–5 kort, i stället för ett enda kort med bild och blurb. Det riktiga yrkesnamnet hålls dolt tills profilen är svept, som en *blind dejt*.
> 3. ⚑ **Dörr-skalan byggs utan en tredje läsare.** Varje kort är fortfarande ja/nej, och dörren (stängd, på glänt, öppen) räknas fram per *profil*. Det besvarar öppen fråga 1 i SLUTMOMENT-KONCEPT.
> 4. ⚑ **Nej-ljudet ska inte låta som fel.** SFX-standarden säger "lågt grumligt = nej/fel". I SYV ska vänster låta som en dörr som glider igen, inte som ett misstag.

---

## (a) Uppdraget, kort tolkat

**Den enda grejen besökaren ska bära med sig ut:** *"Yrkena i Valvet finns på riktigt, och
jag fick känna efter vilka jag kan tänka mig, innan någon sa till mig vad de heter."*

Två saker ska tas fram:

1. **Övergången** är 30–45 sekunder där fiktionen *tas av* som en overall. VALdi har just sorterat dem.
   Nu ska de förstå tre saker: att det som kommer är på riktigt, vad verktyget är och att
   det inte är ett prov. Kedjan har redan planterat bryggan: reveal-filmen slutar med *"Håll
   dörrarna öppna! Då hittar du det du är bra på"*, och trailern (storyline A) bär ett tomt
   inflyttningskort med `BRA PÅ: ____`. Övergången ska *infria* de två, inte börja om.
2. **Verktyget** är en svepkortlek per valv där man sveper höger eller vänster genom att bippa bandet
   på ja- eller nej-läsaren. Josef vill bredda den från "Tinder med en bild" till "Hinge med
   bild, ljud, prompts och scenarier". Hinge-mönstret passar bättre än man först tror. En
   Hinge-profil är just *flera små bitar av en person* som man reagerar på var för sig. Det
   är exakt det vi vill göra med ett yrke: låta besökarna reagera på **bitarna** (ljudet,
   handgreppet, vad man är bra på) innan **etiketten** hinner sortera bort det. Det är
   reveal-filmens budskap omsatt i mekanik.

Det som **inte** ändras: integriteten (inget sparas om *dig*, inga ansikten), de fyra valven som
*arbetssätt*, självbärande botten med SYV-lyft som tak, enskilt svep med gemensam reveal, och
RFID-sömmen (ja/nej-läsare per skärm, 3 personer per skärm).

---

## (b) Övergången: fiktion → verklighet

### Vem talar?

| Röst | Fördel | Problem |
|---|---|---|
| **VALdi** hela vägen | Kontinuitet, känd röst, enkel att producera (ElevenLabs-inställningar finns) | En AI-röst som säger "nu är det på riktigt" undergräver själva poängen. Fiktionen tas aldrig av. |
| **SYV live** i rummet | Äkta, KONCEPT §7.2 säger redan att SYV leder ur karaktär | Kräver att SYV finns vid varje grupp, och kvaliteten varierar. Botten är inte självbärande. |
| ⚑ **VALdi lämnar över → en inspelad riktig röst** | Registerbytet *hörs*: syntet bärnstensljud blir mänskligt dagsljus. Fungerar utan SYV på plats, och en SYV på plats kan ta över efter. | Kräver en inspelning med en riktig person (helst en verklig SYV, eller ett par unga yrkesverksamma) |

**Rekommendation:** VALdi får 2–3 repliker att *lämna över*, och sedan talar en riktig människa.
Inga AI-röster efter bryggan. Den riktiga rösten är helst en verklig studie- och
yrkesvägledare (ur samarbetskommunen) som presenterar sig med förnamn och yrke. Då blir
rösten på filmen samma sorts person som den som kanske står i rummet, och SYV-personal
kan läsa in eller byta ut den själva (det passar lager 2).

### Tre grepp

Alla tre klarar sig själva på skärmen (botten). Om en SYV finns i rummet säger den en
mänsklig rad efteråt (taket, se nedan).

---

#### ★ A. "Kortet lyfts ut" (rekommenderas)

*Ett föremål bär bryggan. Det rimmar med både trailern och reveal-filmen och talar samma collagespråk.*

- **Grepp och form:** *ett föremål färdas mellan två världar* (en kedja där föremålet går från den ena världen till den andra). Inflyttningskortet från trailern
  (`BRA PÅ: ____`, `VALV: [stämplat]`) ligger på arkivpappret i bärnsten. En hand lyfter det
  **ut ur arkivet**: kameran följer kortet uppåt, CRT-skimret glesnar och bakgrunden blir ett vanligt
  bord i dagsljus, en skolbänk eller en köksbänk. Kortet är nu en papperslapp i full färg. `VALV:`
  är kvar, men raden `BRA PÅ: ____` är fortfarande tom, och *det är den verktyget hjälper dem att
  fylla i*. Fältet fylls dock inte på riktigt, för det ska vara öppet.
- **De två första sekunderna:** Valvets stämpel från sorteringen ligger kvar i bild 0, i valvets
  färg. VALdi talar redan över den.
- **Takter:** stämpeln i valvfärg → VALdi: *"Valvet var en övning"* → handen lyfter kortet,
  bunkerljudet tystnar → dagsljus, ny röst presenterar sig → *vad ni ska göra* (svep = bippa
  höger/vänster, 1 mening) → *varför* (dörrar, inget prov, ingen ser ditt svep) → första
  profilen tonar in i valvfärgen.
- **Look:** första halvan ser ut som reveal-filmen: arkivpapper, tejp, stämpel, bärnsten `#ff9500`
  på nästan svart. Andra halvan är **dokumentärt foto i dagsljus**: varma men naturliga färger, inget
  collage. Valvfärgen är den enda färg som följer med över gränsen.
- **Ljud:** ventilationen och nätbrummet från bunkern ligger under VALdi → när kortet lyfts **stängs fläkten av**
  (ett hörbart *klunk* och sedan ~0,8 s tystnad) → ett rum i dagsljus (avlägsna fåglar, ett fönster, en skolkorridor)
  → den riktiga rösten, torr och nära, utan musik under de första meningarna → en ljusare,
  öppnare dreamwave-bädd kommer in under instruktionen (LJUDIDENTITET §5: *"ta bort
  bunker-oron → signalerar fiktion → verklighet"*).
- **Längd:** 35–45 s (VALdi ~8 s, den riktiga rösten ~25–30 s).
- **Därför:** bryggan *syns* (ett föremål byter värld), *hörs* (fläkten dör) och *förklaras*
  (rösten byts), och allt händer samtidigt. Den som missar en kanal får det genom en annan.
- **Beroende:** greppet förutsätter att trailern landar på inflyttningskortet. Gör den inte det
  fungerar samma grepp med stämpeln från sorteringen som föremål.

#### B. "Strömmen går"

*Det kortaste och mest fysiska greppet. Fiktionen stängs av som en maskin.*

- **Grepp och form:** *före och efter*, med en hård övergång. VALdis CRT-bild kollapsar till en
  ljuspunkt (ett gammalt tv-avstängningsljud), skärmen blir svart i ~1 s och tänds sedan i full färg:
  en riktig person i en riktig miljö som tittar in i kameran och säger hej. Kan kombineras
  med rumsljuset om riggen tillåter det: valvlampan dimras och ett varmt vitt arbetsljus tänds.
- **De två första sekunderna:** VALdi säger sin sista replik, och bilden *slocknar mitt i ett ord*.
- **Takter:** VALdi lämnar över → avstängning → tystnad → ansikte i dagsljus → vad, varför, hur → första profilen.
- **Ljud:** CRT-avstängning och fläkten som tystnar, sedan helt tyst, sedan en mänsklig röst utan bädd.
- **Längd:** 25–35 s.
- **Risk:** hårt och tydligt, men det kan kännas som att *något gick sönder*. 14-åringar kan skratta
  på fel ställe. Det kräver också en riktig person framför kameran (en filmad SYV), vilket är
  tyngre att producera och byta ut än en röst.

#### C. "Ytan svarar"

*Inget filmat människoansikte. Istället en kör av riktiga röster.*

- **Grepp och form:** *rösterna blir svaret*. VALdi: *"I Valvet hade varje jobb ett nytt namn. Här
  uppe har de andra namn, och människor som gör dem varje dag."* Sedan kommer 4–6 korta röster från
  verkligheten, en mening var, över bilder av arbetsplatser (inga ansikten krävs): *"Jag är 22
  och kör kontrollrummet på nätterna." / "Jag trodde aldrig jag skulle jobba med barn."* Sist
  kommer SYV-rösten med instruktionen.
- **De två första sekunderna:** en ljudvåg i valvfärg. Den första riktiga rösten hörs *innan*
  någon bild byts.
- **Längd:** 40–50 s.
- **Därför är det intressant:** greppet förbereder ljudkorten i verktyget (rösterna kan återkomma som
  kort) och visar redan nu att yrken är *människor*, inte titlar.
- **Risk:** längst, och innehållet beror på att vi får tag i riktiga röster. Rösterna måste
  vara riktiga och ha samtycke. Att fejka dem med AI vore värre än att inte göra greppet alls.

---

**Rekommendation:** **A**, med C:s röster som *tillägg senare* när riktiga röster finns.
B hålls som reserv om vi vill ha något kort och fysiskt med rumsljus.

### Tonläge

- **VALdi** (sista gången): varm, lite högtidlig, *släpper taget*. Den låter inte som en dator som stänger av utan som någon
  som vinkar av dem vid en dörr. Röstinställningarna är desamma som i reveal-filmen.
- **Den riktiga rösten:** vardaglig, nära och kort. Den låter som en vuxen som pratar *med* en 14-åring,
  inte *till* en klass. Inget "spännande", inget "ni kommer få upptäcka". Vi
  talar i ögonhöjd, med korta meningar och gärna en liten självironi.
- **Gemensamt:** aldrig utvärderande. Orden *test, resultat, rätt, passar dig* finns inte.

### Exempelrader (inget manus, bara för tonen)

**VALdi lämnar över** (8–10 s):
> "Jag har visat er var ni hör hemma i Valvet."
> "Men Valvet är en övning. Jobben i det är inte påhittade."
> "Härifrån följer jag inte med. Härifrån går ni själva."

**Den riktiga rösten: vem**
> "Hej. Jag heter [namn]. Jag jobbar med att hjälpa folk i er ålder att välja vad de ska plugga."

**Vad**
> "Nu får ni träffa några yrken. Inte namnen på dem, utan bitar av dem: hur de låter, vad man
> är bra på där, en vanlig tisdag."
> "Bippa höger om du kan tänka dig det. Vänster om inte."

**Varför**
> "Det finns inga rätta svar. Ingen ser vad just du svepte."
> "Ni behöver inte vilja bli något. Det räcker att ni kan tänka er det."
> "Och i slutet får ni veta vad yrkena heter på riktigt."

**Kopplingen till det de just varit med om** (en mening, inte en föreläsning):
> "Ni såg nyss hur lätt man säger nej till något bara på grund av vad det heter. Här får ni
> chansen att säga ja först."

**SYV-taket** (den riktiga SYV:n i rummet säger efter filmen, valfritt):
> "Jag står här borta. Fråga om ni vill, eller kom till mig efteråt."

---

## (c) Verktygets look & feel

### Grundmekaniken: profiler och en blind dejt ⚑

I dag består en roll av en bild, en titel och en blurb, och reveal-sekvensen visar
verklighetsklippet. Förslaget är att låta varje roll bli en **profil** i Hinge-stil:

```
PROFIL "Fältmedikern" (Valvet-namnet syns, det riktiga yrket är dolt)
 ├─ kort 1  bild           → ja / nej
 ├─ kort 2  "Jag är bra på…" → ja / nej
 ├─ kort 3  ljud            → ja / nej
 ├─ kort 4  prompt/scenario → ja / nej
 └─ AVSLÖJA  "På riktigt: undersköterska · sjuksköterska · ambulanssjukvårdare"
             + dörren: 0–1 ja = stängd · 2 = på glänt · 3–4 = öppen
```

- **Valvet-namnet syns och det riktiga namnet är dolt.** Det fiktiva namnet behåller det skyddande
  avståndet från SLUTMOMENT §3.2 (*"Fältmedikern"* är ofarligt att gilla). Det riktiga yrkesnamnet
  (det som bär könskodningen) visas först *efter* att bitarna har svepts. Då gillar man ljudet
  av ett kök under lunchrusning innan ordet "kock" eller "restaurangbiträde" hinner stänga dörren.
  Reveal-filmens budskap (*"vanor sitter djupt, ni såg det själva"*) blir en upplevelse
  man gör själv i stället för ett påstående.
- ⚑ **Dörr-skalan kräver ingen ny hårdvara.** Varje kort är fortfarande binärt (det passar ja/nej-läsarna),
  och dörren för profilen räknas fram av hur många kort man sa ja till. FÖRE → EFTER i
  sammanställningen kan då visa *dörrar som rörde sig* i stället för ja/nej.
- **Det befintliga flödet består.** Svep, barriär, reveal (resultat, klipp, revote) och sammanställning
  finns kvar. Det nya är att *svep* går igenom profilens kort och att *reveal* inleds med
  "På riktigt heter det…" innan klippet. Revote-frågan blir *"Vill du flytta dörren?"*.
- **Tidsbudget:** Driften har 6 roller × 4 kort = 24 svep. Om tre personer ska bippa per kort tar det
  ~4–6 s per kort, alltså 2–2,5 minuter. Det är rimligt, men rymmer inte fler än 4 kort per profil. Fler roller per valv
  betyder färre kort per profil.
- **Alternativet om blind dejt känns för krångligt:** visa det riktiga namnet direkt, under
  Valvet-namnet. Då förlorar vi tyvärr den starkaste mekanismen mot stereotyper.

### Bildsättning: "ett fönster i bunkern"

Två register som aldrig blandas *inom* en bild, men som alltid finns samtidigt *på skärmen*:

| | **Ramen** (Valvet) | **Innehållet** (verkligheten) |
|---|---|---|
| Vad | UI-krom: profilnamn, valvbricka, progress, ja/nej-zoner, stämplar | Själva kortet: foto, video, citat, ljudvåg |
| Stil | Befintlig CRT: bärnsten på nästan svart, VT323/Plex Mono, scanlines, **valvfärgen som accent** | Dokumentärt: dagsljus eller verkligt arbetsljus, naturliga färger, lätt korn, inga filter |
| Känsla | "Det här är Valvets maskin" | "Det här är ett fönster upp mot verkligheten" |

Det är **samma idé som bryggan i övergången**, bara i liten skala. Fiktionen ramar in och verkligheten syns
genom ramen. En liten stämpel på varje innehållskort, till exempel `PÅ RIKTIGT` eller `FRÅN YTAN` (välj
ett, se de öppna frågorna), gör registret explicit.

**Vad innehållskorten visar (fotoregler):**

- **Mitt i en handling, inte en pose.** Händer som gör något, blicken på uppgiften, och aldrig ett leende in i
  kameran. Kompetens syns i koncentrationen, inte i hjälmen.
- **Ögonhöjd och nära.** En POV, en axel i bild, närbilder på verktyg och händer. Man ska kunna
  *kliva in* i bilden, och det är 14-åringens "möjliga jag" som provas.
- **Riktiga svenska arbetsplatser** med lite stök: ett kontrollrum kl 03, ett kök kl 11:58,
  ett vattenverk med våta golv. Inga stockfoton med glasväggar.
- **Platser och föremål utan personer** är ett eget slags kort, och ett av de viktigaste: de
  låter besökaren gilla jobbet *utan* att kroppen eller könet på den som gör det styr valet.

**Representation utan könsstereotyper** (reveal-filmen: *"Tjejigt eller snubbigt? Spelar ingen roll."*):

- **Blanda, vänd inte bara på det.** Om varje kranförare är en kvinna och varje förskollärare en man blir det
  en ny stereotyp, och 14-åringar genomskådar tokenism direkt. Målet är att kön *inte går
  att förutsäga* av yrket. Inom en profil ska personerna variera, och över hela kortleken ska fördelningen
  vara jämn. Det kan kontrolleras i manifestet (se pipelinen nedan).
- **Ålder:** minst ett kort per profil med en person som ser ut att vara 18–25 år (lärling, nyanställd).
  "Möjligt jag" kräver någon som är nära i ålder.
- **Variera också kroppar, hudtoner, hjälpmedel och arbetskläder**, och utan att göra en poäng av det.
- **Undvik ikonerna:** skyddshjälmen som symbol, den vita rocken, stetoskopet runt halsen,
  kockmössan. Visa i stället det som *händer* i jobbet.
- **Samma regel som i `xy-bildgen`:** vi ändrar aldrig en persons kön. Normbrottet ska ligga i
  urvalet och i scenen, inte i att en person manipuleras.

### Korttyper à la Hinge

En profil har 4 kort valda bland typerna nedan. Använd **max en av varje typ per profil**, och
alltid minst ett kort *utan person*. Exemplen kommer från Driftens utkastroller. Alla
faktapåståenden är **illustrativa** tills en yrkesperson har läst dem.

**1. Bildkort: arbetsplatsen**
*En bild, en plats och en tidsstämpel. Frågan är "Kan du tänka dig att vara här?"*
- `KONTROLLRUMMET · 03:12`: skärmväggen, en kaffekopp och en hand på ett reglage. (Processoperatören)
- `KÖKET · 11:58`: tjugo tallrikar i rad och två minuter kvar. (Härbärgesvärden)
- `VÄXTHUSET · 06:40`: imma på plasten och fukt i luften. (Markförvaltaren)

**2. "Jag är bra på …"**
*Yrket talar i jag-form. Det här är kortet som rimmar mot `BRA PÅ: ____` i trailern. Frågan är "Är det här du också?"*
- "Jag är bra på att höra när något låter fel innan larmet går." (Processoperatören)
- "Jag är bra på att lugna någon som är rädd, samtidigt som jag räknar i huvudet." (Fältmedikern)
- "Jag är bra på att hålla tolv saker i huvudet och ändå hinna säga hej." (Härbärgesvärden)

**3. Promptkort** (Hinge-mönstret: prompten i liten text, svaret stort)
- *Du gillar mig om du…* → "…tycker om när något som var trasigt funkar igen." (Fältteknikern)
- *Det ingen vet om mig:* → "Jag använder mer kemi än du tror." (Vattenmästaren)
- *Det jobbiga med mig:* → "Nätter. Ibland helger. Jag tänker inte ljuga." (Processoperatören)
  Ärliga nackdelar gör de andra korten trovärdiga, och en 14-åring litar mer på en profil som erkänner något.

**4. Miniscenario**
*Två eller tre meningar, och du är där. Frågan är **"Skulle du vilja vara den som tar det här?"** och aldrig
"Vad gör du?". Det finns inget rätt svar.*
- "Klockan är 02. En pump larmar. Du är ensam på skiftet, och alla andra sover." (Vattenmästaren)
- "En gäst är allergisk. Beställningen gick in för fyra minuter sedan." (Härbärgesvärden)
- "Bilen står still på en grusväg. Kunden väntar och du har en verktygslåda." (Fältteknikern)

**5. Ljudkort: "Så här låter det"** (se ljuddelen)
*6–8 s med en riktig miljö, en ljudvåg i valvfärg och tidsstämpeln. Ingen bild. Frågan är "Kan du höra det här varje dag?"*
- Maskinhall med ett jämnt brus, ett relä som klickar och en radio långt bort.
- Ett kök under rusning: bongskrivaren, stekbordet och någon som ropar "två till!".
- En ladugård på morgonen: fläktar, djur och en grind.

**6. Kort video** (5–10 s, ingen ljudberoende, loopbar)
- POV: händer som skruvar loss en lucka, ficklampan i munnen.
- En dropptakt i närbild och en hand som justerar.
- Tallrikar som läggs upp i rytm, tre händer om varandra.

**7. Rösten (citat från en riktig person)**
*En mening, inläst av någon som har jobbet, och texten visas samtidigt. **Bara riktiga och med samtycke.***
- "Jag trodde det var ett killjobb. Nu är jag skiftledare." *(exempel och form, inte ett citat)*
- "Det bästa är när någon kommer tillbaka och säger tack." *(exempel och form)*

**8. Vägkortet** *(sveps inte, utan visas i reveal efter "På riktigt heter det…")*
*Bron till verkligt SYV-samtal: vilket gymnasieprogram, hur lång väg, ett annat yrke i samma familj.*
- "Vägen hit: Vård- och omsorgsprogrammet → undersköterska. Vill du längre: sjuksköterska (högskola)."
- "Släkt med det här: ambulanssjukvårdare, tandsköterska."
- *Detta är faktainnehåll och ska gå via SYV eller AF:s yrkesinfo, inte skrivas av oss på känn.*

**Rekommenderad v1-mall per profil:** bild + "Jag är bra på…" + ljud + (prompt *eller*
scenario), och därefter vägkortet i reveal. Video och röst läggs till när det finns riktigt material.

**Typografi på innehållskorten:** prompten i liten mono (Valvets röst ställer frågan) och
svaret stort i en läsbar sans (till exempel IBM Plex Sans, samma familj som monot), i första person
och läsbart på 1,5 m. Svaret är *någons röst*, inte terminaltext.

### Generering på sikt: pipelinen

**Principen:** generera det som **inte är en påstådd verklig person**, och hämta det som ska
vara äkta från verkligheten.

| Innehåll | Källa | Varför |
|---|---|---|
| Platser, föremål, POV-händer, scenarioillustrationer | **Genererat** (gpt-image-2 + stilankare) | Skalbart till 4 valv × 6 roller × flera kort, och styrbart för representation |
| Personer i arbete på bildkort | Genererat **som start**, ersätts med riktiga foton där det går | Att möta en *verklig* person är det som rör bilden (*Redraw the Balance*, SLUTMOMENT §3.3) |
| Röster, citat, verklighetsklipp | **Bara riktigt** | En AI som säger "jag trodde det var ett killjobb" är en lögn mot en 14-åring |
| Ljudkort | Riktiga fältinspelningar i första hand (egna eller Freesound CC0), ElevenLabs som platshållare | Ljudet *är* påståendet om hur det är där |
| Valvsidan (Valvet-namn, porträtt i collage om det behövs) | Genererat i reveal-filmens stil | Det är fiktion och får se ut som fiktion |

**Flödet** (samma tänk som reveal-filmen: gpt-image-2 med referensbilder som stil, inte som motiv):

1. **Yrkesblad per roll** (en sanningskälla): Valvet-namn, riktiga yrken, valv, 3–5 *konkreta
   handlingar* (vad händerna gör), 2–3 platser och tider, verktyg, skyddsutrustning *som den faktiskt är*,
   och vägkortsfakta med källa.
2. **Promptmall = fyra block**, där bara block 2 och 3 skiftar per kort:
   - **Stilankare** (fast för hela verktyget): "dokumentärt foto, naturligt arbetsljus, ögonhöjd,
     35 mm, lätt korn, mitt i en handling, ingen pose, ingen text i bild…", plus **3–5
     godkända referensbilder** som skickas med varje gång.
   - **Scen** (ur yrkesbladet): plats, tid, handling och verktyg.
   - **Person** (dras ur en balanserad matris, inte fritt): ålder, könsuttryck, hudton, kroppstyp,
     eventuellt hjälpmedel. Matrisen garanterar jämn fördelning över kortleken. "Ingen person"
     är ett eget värde.
   - **Bildutsnitt:** närbild, POV, halvbild eller miljö.
3. **Generera 4–6 varianter per kort**, och gör en automatisk grovsortering (text i bild, händer, dubbla verktyg).
4. **Mänsklig granskning med en checklista:** *Ser den verklig ut? Är skyddsutrustning och arbetssätt rätt?
   (en yrkesperson tittar en gång per roll) Står den i en pose eller mitt i en handling? Går kön att
   förutsäga från yrket över hela profilen? Skulle en 14-åring skämmas eller skratta åt den?*
5. **Manifest per kortlek:** varje godkänd bild sparas med prompt, referenser, personvariabler,
   granskare och datum. Ur manifestet går det att räkna representationen över hela kortleken, och
   det är den siffran vi följer upp, inte känslan.
6. **Leverans** till den befintliga slottstrukturen (`public/cards/<valv>/…`). Appen tål redan 404 och
   byter in filen när den finns.

**Ärlighet:** ett genererat foto av "en riktig undersköterska" är en liten fiktion i den verkliga
delen. Antingen märks genererade personbilder diskret (till exempel `ILLUSTRATION`), eller så
håller vi personbilder till riktiga foton och genererar bara platser och föremål. Detta behöver Josef besluta (se de öppna frågorna).

**Längre fram, inte nu:** `xy-bildgen` (lokal face-swap) skulle kunna ge ett "se dig själv på
arbetsplatsen"-kort, alltså det verkligt *möjliga jaget*. Det kräver att integritetsramen (foto
raderas direkt, inga minderåriga i testning) prövas på riktigt och att ingen persons kön
ändras. Behandla det som ett eget spår efter v1.

### Ljudsättning och vibe

**Bädden: ljusare än Valvet, och Valvet hörs fortfarande.** Dreamwave åt det öppna hållet, ~80–90 BPM,
en varm pad och en mjuk puls. Valvets färg finns i klangen (samma bädd för alla valv, men med filter
och klang per valv, enligt LJUDIDENTITET-principen "en bädd, flera filter"). **Ingen bunkeroro:**
inga fläktar, ingen geiger, ingen PA. Bädden ligger lågt (−18 dB under rösten) och **duckar till nästan
tyst varje gång ett ljud- eller videokort spelar**, så att ljudet blir innehåll och inte ett lager i mixen.

**Svepljuden**, uppdelade i *individ* och *grupp*:

| Händelse | Ljud | Riktning |
|---|---|---|
| En person bippar (ja eller nej) | Kort, tyst, *samma* för båda sidorna | Ingen ska kunna höra vad grannen svepte. Det skyddar det enskilda svepet. |
| Kortet avgörs: höger | Uppåtgående kvint, varm och kort | Bygg vidare på `h3-swipe-hoger`. |
| Kortet avgörs: vänster ⚑ | Mjukt och neutralt, en dörr som glider igen (luft och filter) | **Inte** lågt och grumligt. Nej är ett tillåtet svar, inte ett fel. Granska `h2`/`h5` mot det. |
| Profilen avslöjas | Kortet vänds + en tydlig "nu får ni veta"-ton | Bygg vidare på `h6-kort-flip`. |
| Dörr på glänt eller öppen | Ett varmt ackord, kort (växer från glänt till öppen) | En liten "match"-känsla, men ingen fanfar. **Stängd får inget ljud alls**, inget straff. |
| Dörren flyttas i revote | Ett mjukt glid uppåt | Rörelsen är vinsten, enligt SLUTMOMENT §3.1. |

Regel från HyperFrames-ljudtänket: varje ljud har en orsak på skärmen, och man roterar 2–3 tagningar
av det som upprepas (24 svep med exakt samma ljud låter som en mall).

**Var ljud är innehåll och inte effekt:**

1. **Ljudkortet** (typ 5): en arbetsplats som ett eget kort. Det är det renaste sättet att låta
   någon gilla ett jobb utan att se *vem* som gör det.
2. **Profilens ljudledtråd:** varje profil har *ett* signaturljud (bongskrivaren, reläklicket,
   grinden) som ligger svagt under bildkortet och kommer tillbaka fullt i ljudkortet. När det riktiga
   namnet avslöjas hörs ledtråden en sista gång, och man *känner igen* jobbet innan man förstår
   det.
3. **Rösten** (typ 7): en riktig människa säger en mening. Den är det enda stället i hela X&Y där en
   verklig yrkesperson talar direkt till besökaren.
4. **Övergången:** fläkten som stängs av *är* bryggan (grepp A). Tystnaden efteråt är den första
   "verkliga" ljudbilden.

**Produktionsnivåer för ljudkort:** (1) egna fältinspelningar hos samarbetspartner med en
handinspelare, 30–60 s per plats, där vi klipper ut 6–8 s, (2) Freesound filtrerat på CC0,
(3) ElevenLabs sound-generation som platshållare. Mixa varje kort till samma upplevda nivå så
att ett tyst vattenverk inte förlorar mot ett skrikande kök.

---

## (d) Öppna frågor till Josef

1. **Övergången:** A ("Kortet lyfts ut"), B ("Strömmen går") eller C ("Ytan svarar")? A förutsätter att
   trailern landar på inflyttningskortet. Vet vi det?
2. **Vems är den riktiga rösten?** En verklig SYV ur samarbetskommunen (rekommenderas), någon på 2047,
   eller unga yrkesverksamma? Och okej att den riktiga delen *inte* är AI-röst?
3. **Blind dejt:** ska det riktiga yrkesnamnet döljas tills profilen är svept, eller synas direkt?
4. **Dörr-skalan via profilen:** okej att lösa *stängd/glänt/öppen* som summan av ja-svar i stället för
   med en tredje läsare?
5. **Antal kort och roller per valv:** 6 roller × 4 kort = ~2,5 min svep per grupp. Ryms det i
   schemat, eller ska det vara färre roller?
6. **Genererade personbilder:** märka dem `ILLUSTRATION`, eller generera bara platser och föremål och ta
   personer från riktiga foton?
7. **Stämpeln på innehållskorten:** `PÅ RIKTIGT` (tydligt) eller `FRÅN YTAN` (stannar i fiktionen)?
8. **Vem granskar faktan** (vägkort, "jag är bra på", nackdelar)? En SYV för vägkorten och en yrkesperson
   per roll är förslaget.
9. **Samarbetspartner för riktigt material:** vilka arbetsplatser kan vi spela in ljud och foto hos,
   och hur ser samtycket ut?

## Föreslagna nästa steg (i den här ordningen)

1. **Josef beslutar frågorna 1, 3 och 6.** De styr allt annat. 15 minuter.
2. **Fyll i ett yrkesblad och en profil för Fältmedikern** (Driften) med v1-mallen: bild,
   "Jag är bra på…", ljud, prompt/scenario och vägkort. Det blir mallen för de andra 23 korten i
   Driften. Exemplen ovan är en startpunkt, inte färdig text.
3. **Välj stilankaret:** 3–5 referensbilder för verklighetsregistret (dokumentärt dagsljus). Det
   motsvarar `ref/` i reveal-filmen. Utan ankare blir gpt-image-2 stockfoto.
4. **Pilotgenerera en profil**, 4 kort × 4–6 varianter, och kör granskningschecklistan på riktigt.
   Justera mall och matris.
5. **Spela in eller hämta två ljudkort** (ett kök, en maskinhall) och testa att ducka bädden mot dem.
6. **Skriv övergångsmanuset** utifrån det valda greppet och boka den riktiga rösten. Det kan
   byggas som en HyperFrames-film i samma projektmönster som reveal-filmen (VALdi-delen med
   samma röstinställningar, och den riktiga delen inspelad).
7. **Därefter appen** (ett eget steg, inte nu): `Role` får `cards[]` med typerna ovan, MediaSlot
   behöver kunna spela ljud, bädden ska ducka, dörren ska räknas per profil, och reveal ska inledas med "På
   riktigt heter det…". Allt är data i `config.ts` och portabelt till lager 2.
8. **Rollistorna för de andra tre valven**, med samma mall.
