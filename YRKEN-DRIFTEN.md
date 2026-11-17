# Driften: Valvets roller → riktiga yrken (för klippjakten)

*Underlag för att leta verklighetsklipp, ett per roll (stående format, helst 30–60 s, gärna
"hur mycket tjänar en …" eller "en dag som …"). Sammanställt 2026-11-16 ur tidigare arbete.
Bilderna till svepkorten: `bildgen/utkast/driften/`.*

## Var rollerna kommer ifrån

| Källa | Vad den säger |
|---|---|
| [AI-session 2026-10-12](../../AI-sessioner/2026/2026-10/2026-10-12-xy-syvverktyg-finalen-kortlek-valv-klipp.md) | Driften har 6 roller med riktiga yrken: Processoperatören, Fältteknikern, Fältmedikern, Härbärgesvärden, Markförvaltaren, **Virkeslaget** |
| [`src/config.ts`](src/config.ts) (appen) | Samma men **Virkeslaget är utbytt mot Vattenmästaren**. Varje roll har ett `realJob`. |
| [Trailermanuset](../xy-trailer/TRAILER-MANUS-EXPLAINER.md) | Driften-etiketten i filmen: `drifttekniker · incidentledare` ("först på plats – och lugnast i rummet") |

Tidigare arbete ger alltså 7 roller med tydligt riktigt yrke. **Den åttonde (Incidentledaren) är
mitt förslag** och har ingen referens i tidigare arbete utom trailerns etikett. Den ska bekräftas.
Driftteknikern (från skissen) togs bort eftersom den överlappar Fältteknikern.

## De åtta

| # | Valvet-roll | Riktigt yrke (sök på detta) | Andra namn att söka på | Källa | Sökord för klipp |
|---|---|---|---|---|---|
| 1 | **Processoperatören** | Processoperatör | operatör stål/pappersbruk, kontrollrumsoperatör, skiftoperatör | 10-12 + config | "processoperatör lön", "en dag som processoperatör", "kontrollrum skift" |
| 2 | **Fältteknikern** | Servicetekniker | underhållstekniker, fältservicetekniker, mekaniker | 10-12 + config | "servicetekniker vlogg", "en dag som servicetekniker", "underhållstekniker lön" |
| 3 | **Fältmedikern** | Undersköterska | sjuksköterska, ambulanssjukvårdare | 10-12 + config | "undersköterska en dag på jobbet", "sjuksköterska lön", "ambulanssjukvårdare" |
| 4 | **Härbärgesvärden** | Kock | restaurangbiträde, hotellpersonal | 10-12 + config | "kock lunchrusning", "kock lön", "en dag i köket" |
| 5 | **Markförvaltaren** | Lantbrukare | djurskötare, växtodlare, växthusodlare | 10-12 + config | "lantbrukare tiktok", "djurskötare en dag", "växthusodling" |
| 6 | **Vattenmästaren** | VA-tekniker / processtekniker vattenrening | drifttekniker reningsverk, VA-operatör | config (ny sedan 10-12) | "reningsverk drifttekniker", "vattenverk en dag på jobbet", "VA-tekniker" |
| 7 | **Virkeslaget** | Skogsmaskinförare | skördarförare, skotarförare | 10-12 (saknas i config) | "skogsmaskinförare lön", "skördare tiktok", "en dag i skogsmaskinen" |
| 8 | **Incidentledaren** *(förslag)* | SOS-operatör / larmoperatör | räddningsledare, driftledare, larmcentral | trailerns etikett | "SOS-operatör 112", "larmoperatör lön", "en dag på larmcentralen" |

**Tips:** Arbetsförmedlingens *Yrken och framtid* använder ofta de namn som står i kolumnen
"Riktigt yrke". Där finns lön och utbildningsväg, vilket är bra för klipp av typen "hur mycket
tjänar …" och senare för vägkort.

## Saker som behöver rättas eller beslutas

1. **Vilka 8?** Med Virkeslaget tillbaka finns 7 med tydlig grund. Är Incidentledaren rätt
   åttonde roll, eller ska den vara något annat (till exempel lärare eller SYV, som saknar valv sedan
   Ateljén ströks)?
2. **Klipp-id i appen är fel ihopkopplade.** I `config.ts` delar Markförvaltaren klipp
   (`clip1`) med Processoperatören, och Vattenmästaren delar `clip2` med Fältteknikern.
   Om varje roll ska ha ett eget klipp (som i skissen) behöver varje roll ett eget klipp-id.
3. **Det finns redan ett Driften-klipp:** `xy-simulator/media/video/clip-drift-1.mp4`
   (används i reveal-appen). Kolla om det kan användas för någon av rollerna.
4. **Gymnasieprogram och utbildningsvägar är inte ifyllda med flit.** Låt en SYV fylla i dem
   så att det blir rätt.
