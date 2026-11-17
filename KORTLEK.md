# Kortleken: 4 valv × 8 roller + klipp-pool

*Sanningskällan för SYV-verktyget v2 (2026-11-16). Appen läser in detta i `src/config.ts`.
Bygger på rollistan från [AI-session 2026-10-12](../../AI-sessioner/2026/2026-10/2026-10-12-xy-syvverktyg-finalen-kortlek-valv-klipp.md)
(5 roller per valv, Driften 6) och [YRKEN-DRIFTEN.md](YRKEN-DRIFTEN.md). Roller markerade **(ny)** är
tillagda 2026-11-16 för att nå 8 per valv och ska bekräftas av Josef.*

**Konventioner:** bild = `public/cards/<valv>/<id>.png` (genereras med `bildgen/gen-kort.py`),
klipp = `public/clips/<klipp-id>.mp4` (stående 9:16, ca 60 s, äkta klipp från verkligheten).
Flera roller kan dela samma klipp-id när yrkena liknar varandra.

Valvfärger (låsta 2026-10-12): Teknologerna röd `#ff5a3c`, Diplomatkåren grön `#7ad14f`,
Driften gul `#e8c020`, Forskningslaget blå `#4aa3ff`.

---

## Driften (gul) · handfast, operativt, får igång

| id | Valvet-roll | Riktigt yrke | Rad på kortet | Klipp |
|---|---|---|---|---|
| processoperatoren | Processoperatören | Processoperatör | Kör och vaktar valvets processer dygnet runt. Griper in när något larmar. | `kontrollrum` |
| faltteknikern | Fältteknikern | Servicetekniker | Lagar det som gått sönder ute i valvets gångar. Reser, löser, får igång. | `service` |
| faltmedikern | Fältmedikern | Undersköterska · sjuksköterska | Tar hand om människor när det gäller. Snabba beslut, trygg hand. | `vard` |
| harbargesvarden | Härbärgesvärden | Kock | Får ett rum fullt av gäster att må bra. Tempo, timing, allt på plats. | `kok` |
| markforvaltaren | Markförvaltaren | Lantbrukare · växtodlare | Odlar valvets mat i de stora odlingstälten så att basen klarar sig själv. | `natur` |
| vattenmastaren | Vattenmästaren | VA-tekniker (vattenrening) | Håller valvets vatten rent och i kretslopp. Renar, återvinner, övervakar. | `kontrollrum` |
| virkeslaget | Virkeslaget | Skogsmaskinförare | Skördar valvets virke i den underjordiska skogshallen. Stora maskiner, små rörelser. | `natur` |
| incidentledaren | Incidentledaren **(ny)** | SOS-operatör · larmoperatör | Den lugnaste i rummet när något larmar. Leder, prioriterar, håller ihop. | `larm` |

## Diplomatkåren (grön) · möten, avtal, relationer

| id | Valvet-roll | Riktigt yrke | Rad på kortet | Klipp |
|---|---|---|---|---|
| sandebudet | Sändebudet | Förhandlare · affärsjurist | Sitter mitt emellan när två sidor vill olika saker, och hittar avtalet. | `juridik` |
| allianslanken | Allianslänken | Kundansvarig (KAM) | Håller ihop valvets viktigaste samarbeten. Ringer, lyssnar, löser. | `affar` |
| radgivaren | Rådgivaren | Managementkonsult · affärsutvecklare | Kommer in när något kört fast och ser vad ingen annan ser. | `affar` |
| kvartermastaren | Kvartermästaren | Inköpare · supply chain | Ser till att valvet har det som behövs, i tid, till rätt pris. | `affar` |
| talespersonen | Talespersonen | Kommunikatör · PR | Berättar för hela valvet vad som händer, så att alla förstår. | `kommunikation` |
| vagledaren | Vägledaren **(ny)** | Lärare · studie- och yrkesvägledare | Hjälper nya i valvet att hitta vad de är bra på. | `manniskor` |
| lyssnaren | Lyssnaren **(ny)** | Kurator · socionom | Den man går till när något är svårt. Lyssnar först, hjälper sen. | `manniskor` |
| lagbyggaren | Lagbyggaren **(ny)** | HR-specialist · rekryterare | Sätter ihop lagen i valvet så att rätt människor hamnar tillsammans. | `manniskor` |

## Forskningslaget (blå) · undersöka, testa, ta reda på

| id | Valvet-roll | Riktigt yrke | Rad på kortet | Klipp |
|---|---|---|---|---|
| experimentledaren | Experimentledaren | Forskare · laboratorieingenjör | Ställer frågan, bygger försöket och tål att det går fel tio gånger. | `labb` |
| kodvavaren | Kodvävaren | Mjukvaruutvecklare | Skriver programmen som håller valvet igång. Bygger, testar, lagar. | `kod` |
| datatydaren | Datatydaren | Dataanalytiker · AI-specialist | Hittar mönstret i siffrorna innan någon annan ser det. | `kod` |
| materialutforskaren | Materialutforskaren | Materialforskare (R&D) | Tar reda på vad saker egentligen är gjorda av, och gör dem bättre. | `labb` |
| faltforskaren | Fältforskaren | Miljövetare · agronom | Mäter luft, jord och vatten i valvet så att allt håller i längden. | `natur` |
| smittsparare | Smittspåraren **(ny)** | Biomedicinsk analytiker | Hittar vad som sprider sig, och stoppar det innan det hinner långt. | `labb` |
| sparsakraren | Spårsäkraren **(ny)** | Kriminaltekniker | Läser spåren som ingen annan lade märke till. | `labb` |
| testpiloten | Testpiloten **(ny)** | Testingenjör · kvalitetstekniker | Försöker få saker att gå sönder, så att de aldrig gör det på riktigt. | `ingenjor` |

## Teknologerna (röd) · konstruera, bygga, få att funka

| id | Valvet-roll | Riktigt yrke | Rad på kortet | Klipp |
|---|---|---|---|---|
| konstruktoren | Konstruktören | Maskiningenjör | Ritar maskinerna som valvet behöver, och bygger dem. | `ingenjor` |
| automationsmastaren | Automationsmästaren | Automations- · robotingenjör | Lär robotarna att göra det tunga, så att människorna kan göra resten. | `ingenjor` |
| kraftvavaren | Kraftvävaren | Elkrafttekniker · elektriker | Drar ström till hela valvet och ser till att den aldrig tar slut. | `service` |
| byggmastaren | Byggmästaren | Byggingenjör | Bygger ut valvet, sal för sal, så att det håller i hundra år. | `bygg` |
| energiomstallaren | Energiomställaren | Energi- · vindkraftsingenjör | Hittar nya sätt att göra energi nere i valvet. | `bygg` |
| formgivaren | Formgivaren **(ny)** | Industridesigner · UX-designer | Gör så att allt i valvet är lätt att använda, från spaken till skärmen. | `design` |
| protesbyggaren | Protesbyggaren **(ny)** | Ortopedingenjör | Bygger händer, ben och hjälpmedel som passar en enda människa. | `vard` |
| natvaktaren | Nätväktaren **(ny)** | IT-säkerhetstekniker | Vaktar valvets nätverk så att ingen tar sig in där de inte ska. | `kod` |

---

## Klipp-pool: 15 riktiga yrken att hitta klipp för

Det här är listan att leta klipp efter. Ett klipp per rad räcker. Sökordet är det yrke som
klippet helst ska visa. Övriga roller på samma rad delar klippet.

| klipp-id | Leta klipp om (primärt yrke) | Delas av | Sökord |
|---|---|---|---|
| `kontrollrum` | Processoperatör | Processoperatören, Vattenmästaren | "processoperatör lön", "en dag i kontrollrummet" |
| `service` | Servicetekniker / elektriker | Fältteknikern, Kraftvävaren | "servicetekniker vlogg", "elektriker lön" |
| `vard` | Undersköterska / sjuksköterska | Fältmedikern, Protesbyggaren | "undersköterska en dag på jobbet", "sjuksköterska lön" |
| `kok` | Kock | Härbärgesvärden | "kock lunchrusning", "kock lön" |
| `natur` | Lantbrukare / skogsmaskinförare | Markförvaltaren, Virkeslaget, Fältforskaren | "lantbrukare tiktok", "skördare tiktok" |
| `larm` | SOS-operatör | Incidentledaren | "SOS-operatör 112", "larmoperatör" |
| `juridik` | Affärsjurist / förhandlare | Sändebudet | "jurist en dag på jobbet", "affärsjurist lön" |
| `affar` | Inköpare / kundansvarig / konsult | Allianslänken, Rådgivaren, Kvartermästaren | "inköpare lön", "konsult en dag på jobbet" |
| `kommunikation` | Kommunikatör | Talespersonen | "kommunikatör en dag på jobbet" |
| `manniskor` | Lärare / kurator / HR | Vägledaren, Lyssnaren, Lagbyggaren | "lärare en dag", "kurator", "HR lön" |
| `labb` | Biomedicinsk analytiker / laboratorieingenjör | Experimentledaren, Materialutforskaren, Smittspåraren, Spårsäkraren | "biomedicinsk analytiker", "labb en dag på jobbet" |
| `kod` | Mjukvaruutvecklare | Kodvävaren, Datatydaren, Nätväktaren | "utvecklare en dag på jobbet", "programmerare lön" |
| `ingenjor` | Maskin-/automationsingenjör | Konstruktören, Automationsmästaren, Testpiloten | "ingenjör en dag på jobbet", "robotingenjör" |
| `bygg` | Byggingenjör / vindkraftstekniker | Byggmästaren, Energiomställaren | "vindkraftstekniker", "byggingenjör lön" |
| `design` | Industridesigner / UX-designer | Formgivaren | "UX-designer en dag", "industridesigner" |

*(`design` kan slås ihop med `ingenjor` om det behövs färre.)*

**Öppet:** de nya rollerna (12 st) och om lärare/SYV hör hemma i Diplomatkåren. Lön och
utbildningsväg fylls i av en SYV, inte på känn.
