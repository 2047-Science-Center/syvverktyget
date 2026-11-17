# Beställning: SYV-verktyget v2

*Beställd 2026-11-16 av Josef via riktningssessionen. Josef är borta när bygget görs.
**Bygg utan att fråga tillbaka.** Gör rimliga val, skriv ner dem under "Antaganden" i README,
så feedbackar Josef efteråt.*

## Vad som ska byggas

En ny version av SYV-verktyget (X&Y:s sista moment) enligt den klickbara skissen.
Den gamla appens **vyer och flöde skrotas och byggs om**. De delar som är beprövade och
fungerar **behålls**: RFID-sömmen, env-konfig, startgränssnittet och NUC-kitet.

**Läs först, i den här ordningen:**
1. `design/skiss-v1/index.html` (öppna den i webbläsaren och klicka igenom). Det är **look and feel och flödet**. Publicerad version: <https://claude.ai/artifact/QEFhpgeP81h13ig19HvKD5>.
2. [`KORTLEK.md`](KORTLEK.md): **all data**, 4 valv × 8 roller med riktigt yrke, rad på kortet och klipp-id, plus klipp-poolen.
3. [`RIKTNING-OVERGANG-OCH-VERKTYG.md`](RIKTNING-OVERGANG-OCH-VERKTYG.md): blocket "Beslut av Josef 2026-11-16" överst gäller. Resten är bakgrund. Ljudprinciperna i §(c) gäller.
4. [`README.md`](README.md) och `src/`: hur v1 är byggd (RFID, start-URL, pilot↔drift).
5. `../CLAUDE.md`: guardrails för X&Y (inga Blocks, topics i `xy-rigg/SOM.md` först, inga IP:n i kod, inga hemligheter, ge Josef flash-kommandon i stället för att köra dem).

## Flödet

```
kort → svep ×8 → så valde ni → (per roll: verkligheten → rösta om) ×8 → dörrarna
```

1. **Kort (start):** inflyttningskortet på papper. Valvet är stämplat, raden BRA PÅ är tom. Det är också sista bilden i övergångsfilmen (filmen byggs inte här). Text: "Åtta yrken från Valvet. Kan du tänka dig dem? Bippa för att börja."
2. **Svep ×8:** ett papperskort per roll (tejp, bild, Valvet-namn, en rad). **Två val:** vänster läsare = **STÄNGD** dörr, höger läsare = **ÖPPEN** dörr. Tre personer per skärm. Majoriteten avgör kortet, som stämplas "DÖRREN ÖPPEN" eller "DÖRREN STÄNGD". Varje persons röst sparas per UID, som i v1. Prickar visar *att* någon har röstat, aldrig vad.
3. **Så valde ni:** alla åtta korten med gruppens sex dörrar (båda skärmarna). Barriären från v1 (vänta in andra skärmen) ligger här.
4. **Verkligheten, per roll:** papperskortet (Valvet-roll + gruppens dörrar) → "På riktigt:" + riktigt yrke → **stående klipp 9:16** i en telefonram mitt på skärmen (ca 60 s, äkta klipp, t.ex. "Hur mycket tjänar en processoperatör?"). Stämpeln "PÅ RIKTIGT". Bädden tystnar helt medan klippet spelar.
5. **Rösta om, per roll:** "Har du ändrat dig?" med samma två dörrar. Visar hur gruppen röstade nyss. Efter rösterna: "1 dörr öppnades" / "Alla står kvar. Det är också ett svar."
6. **Dörrarna:** gruppens dörrar före och efter per roll (▲/▼/→), plus vyn av det tryckta kortet att ta med (roller med rutor för stängd/öppen + BRA PÅ). Sluttext: "Dörrarna stängs inte av sig själva. Det är du som väljer när."

## Data och media

- **Kortlekar:** för in alla 32 roller ur `KORTLEK.md` i `src/config.ts` (eller en egen datafil som config importerar). Fält per roll: `id`, `title` (Valvet-namn), `realJob`, `blurb`, `image`, `clip` (klipp-id ur poolen). `?valv=<id>` väljer lek, som i v1.
- **Bilder:** `public/cards/<valv>/<id>.png`. **Riktningssessionen genererar och lägger dit dem parallellt med bygget. Rör inte `public/cards/` eller `bildgen/`.** Slottarna ska tåla 404 och visa en snygg platshållare (som v1:s MediaSlot) tills filen finns.
- **Klipp:** `public/clips/<klipp-id>.mp4`, stående 9:16. Inga klipp finns än. Platshållaren ska se ut som telefonramen i skissen, med klippets sökord/yrke som text, och räkna ner en kort demo-tid (som `clipSeconds` i v1) så att flödet går att klicka igenom.

## Behåll från v1 (bygg inte om)

- `src/adapters/` (RFID ja/nej över MQTT-over-WS, klickläge som fallback). Mappningen ja = öppen, nej = stängd.
- Env-konfig i `config.ts` (VITE_MODE, VITE_BROKER_URL, VITE_STATION_N, `?broker=`).
- `src/startInterface.ts` (URL-parametrar + BroadcastChannel).
- `deploy/nuc/` och `INSTALL-NUC.md`.
- Pilot-solo: skärm B:s tre röster simuleras deterministiskt.
- Tangenter: ◀/N = stängd, ▶/J = öppen. FacilitatorBar (fas, RFID-status, mute, starta om) kan stanna men ska vara diskret.

## Look

- **CRT-ramen** (bärnsten `#ff9500` på nästan svart, VT323/IBM Plex Mono, scanlines) från `src/theme/crt.css` är Valvets maskin.
- **Papperskorten** inne i ramen: krämvitt papper, tejp i valvfärgen, Courier Prime för maskinskrift, stämplar. Se skissen.
- **Valvfärgen** är accenten (bricka, tejp, öppen dörr): Teknologerna `#ff5a3c`, Diplomatkåren `#7ad14f`, Driften `#e8c020`, Forskningslaget `#4aa3ff`.
- **Dörrikonerna** från skissen (SVG). Öppen = ljus i valvfärgen bakom en uppsvängd dörr. Stängd = grå sluten dörr.
- Skärmen är en liggande kioskskärm (NUC). Texten ska vara läsbar på 1,5 m.
- Respektera `prefers-reduced-motion`.

## Ljud

Använd befintlig `AudioEngine` och `public/Sound/sfx/`. Principer:
- **Bippet** är likadant för öppen och stängd (ingen ska höra vad grannen valde).
- **Kortet avgörs:** öppen = kort varm ton uppåt. Stängd = mjuk "dörren glider igen", **aldrig ett fel-ljud**. Granska `h2`/`h5` mot det. Duger de inte, använd syntes-fallbacken med mjukare karaktär.
- **Bädden** tystnar (duckar) när klippet spelar.

## Klart när

- `npm run typecheck` och `npm run build` går igenom.
- Hela flödet går att klicka igenom för **alla fyra valv** (`?valv=driften`, `diplomatkaren`, `forskningslaget`, `teknologerna`), med klick/tangent och med `mosquitto_pub` om en lokal broker finns.
- Verifierat i webbläsaren med skärmdumpar på minst svep, verkligheten och dörrarna.
- README uppdaterad: flödet v2, data/media-konventioner och en sektion **"Antaganden (att feedbacka)"** med varje val du gjorde själv.
- **Ingen commit och ingen push.** Josef granskar först.

## Utanför scope

- Övergångsfilmen (HyperFrames), utskriften av det fysiska kortet och skarp två-NUC-synk.
- Nya MQTT-topics (i så fall i `xy-rigg/SOM.md` först, och bara om det verkligen behövs).
