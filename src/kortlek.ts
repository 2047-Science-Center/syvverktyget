/**
 * Kortleken: 4 valv × 8 roller + klipp-poolen.
 *
 * Införd ur KORTLEK.md (2026-11-16), som är sanningskällan. Ändras KORTLEK.md
 * ska den här filen följa efter. Ren data, ingen logik utöver sökvägarna.
 *
 *   bild  = public/cards/<valv>/<id>.png   (genereras i bildgen/, tål 404)
 *   klipp = public/clips/<klipp-id>.mp4     (stående 9:16, ca 60 s, tål 404)
 *
 * `proposed: true` = rollen är markerad (ny) i KORTLEK.md och väntar på Josefs
 * bekräftelse. Flaggan visas aldrig för besökarna.
 */

export type ValvId = 'diplomatkaren' | 'driften' | 'forskningslaget' | 'teknologerna'

export interface Valv {
  id: ValvId
  /** Visningsnamn. */
  name: string
  /** Kort beskrivning av arbetssättet. */
  tagline: string
  /** Valvets färg (overall, tejp, öppen dörr). Låst 2026-10-12. */
  color: string
}

export const VALV: Record<ValvId, Valv> = {
  diplomatkaren: { id: 'diplomatkaren', name: 'Diplomatkåren', tagline: 'Möten, avtal, relationer', color: '#7ad14f' },
  driften: { id: 'driften', name: 'Driften', tagline: 'Handfast, operativt, får igång', color: '#e8c020' },
  forskningslaget: { id: 'forskningslaget', name: 'Forskningslaget', tagline: 'Undersöka, testa, ta reda på', color: '#4aa3ff' },
  teknologerna: { id: 'teknologerna', name: 'Teknologerna', tagline: 'Konstruera, bygga, få att funka', color: '#ff5a3c' },
}

export const VALV_IDS = Object.keys(VALV) as ValvId[]

export type ClipId =
  | 'kontrollrum'
  | 'service'
  | 'vard'
  | 'kok'
  | 'natur'
  | 'larm'
  | 'juridik'
  | 'affar'
  | 'kommunikation'
  | 'manniskor'
  | 'labb'
  | 'kod'
  | 'ingenjor'
  | 'bygg'
  | 'design'

export interface Clip {
  id: ClipId
  /** Det yrke klippet helst ska visa (primärt yrke i poolen). */
  topic: string
  /** Rubriken i telefonramen, som en text-overlay i ett TikTok-klipp. */
  hook: string
  /** Sökord att leta klipp med (ur KORTLEK.md). */
  search: string[]
}

/** Klipp-poolen. Flera roller delar samma klipp när yrkena liknar varandra. */
export const CLIPS: Record<ClipId, Clip> = {
  kontrollrum: { id: 'kontrollrum', topic: 'Processoperatör', hook: 'Hur mycket tjänar en processoperatör?', search: ['processoperatör lön', 'en dag i kontrollrummet'] },
  service: { id: 'service', topic: 'Servicetekniker · elektriker', hook: 'En dag som servicetekniker', search: ['servicetekniker vlogg', 'elektriker lön'] },
  vard: { id: 'vard', topic: 'Undersköterska · sjuksköterska', hook: 'Det ingen ser på ett skift i vården', search: ['undersköterska en dag på jobbet', 'sjuksköterska lön'] },
  kok: { id: 'kok', topic: 'Kock', hook: 'Lunchrusning: 200 portioner på 40 minuter', search: ['kock lunchrusning', 'kock lön'] },
  natur: { id: 'natur', topic: 'Lantbrukare · skogsmaskinförare', hook: 'Så ser min arbetsdag ut i skogen', search: ['lantbrukare tiktok', 'skördare tiktok'] },
  larm: { id: 'larm', topic: 'SOS-operatör', hook: 'Vad händer när du ringer 112?', search: ['SOS-operatör 112', 'larmoperatör'] },
  juridik: { id: 'juridik', topic: 'Affärsjurist · förhandlare', hook: 'En dag som affärsjurist', search: ['jurist en dag på jobbet', 'affärsjurist lön'] },
  affar: { id: 'affar', topic: 'Inköpare · kundansvarig · konsult', hook: 'Vad gör en inköpare egentligen?', search: ['inköpare lön', 'konsult en dag på jobbet'] },
  kommunikation: { id: 'kommunikation', topic: 'Kommunikatör', hook: 'En dag som kommunikatör', search: ['kommunikatör en dag på jobbet'] },
  manniskor: { id: 'manniskor', topic: 'Lärare · kurator · HR', hook: 'Jobbet där människor är hela grejen', search: ['lärare en dag', 'kurator', 'HR lön'] },
  labb: { id: 'labb', topic: 'Biomedicinsk analytiker · laboratorieingenjör', hook: 'En dag i labbet', search: ['biomedicinsk analytiker', 'labb en dag på jobbet'] },
  kod: { id: 'kod', topic: 'Mjukvaruutvecklare', hook: 'Hur mycket tjänar en programmerare?', search: ['utvecklare en dag på jobbet', 'programmerare lön'] },
  ingenjor: { id: 'ingenjor', topic: 'Maskin- · automationsingenjör', hook: 'En dag som robotingenjör', search: ['ingenjör en dag på jobbet', 'robotingenjör'] },
  bygg: { id: 'bygg', topic: 'Byggingenjör · vindkraftstekniker', hook: '150 meter upp i ett vindkraftverk', search: ['vindkraftstekniker', 'byggingenjör lön'] },
  design: { id: 'design', topic: 'Industridesigner · UX-designer', hook: 'En dag som UX-designer', search: ['UX-designer en dag', 'industridesigner'] },
}

export interface Role {
  id: string
  /** Valvet-namnet (kortets titel). */
  title: string
  /** Det riktiga yrket. Visas först i verkligheten, aldrig i svepet. */
  realJob: string
  /** Raden på kortet. */
  blurb: string
  /** Kortbild, public/cards/<valv>/<id>.png. Tål 404 (platshållare). */
  image: string
  /** Klipp-id ur poolen. Filen är public/clips/<clip>.mp4. */
  clip: ClipId
  /** (ny) i KORTLEK.md: väntar på bekräftelse. Visas inte för besökarna. */
  proposed?: boolean
}

/** Bygger en url till en fil i public/ som funkar oavsett bas-sökväg. */
export function asset(path: string): string {
  return encodeURI(import.meta.env.BASE_URL + path.replace(/^\/+/, ''))
}

export function clipSrc(clip: ClipId): string {
  return asset(`clips/${clip}.mp4`)
}

type RoleRow = [id: string, title: string, realJob: string, blurb: string, clip: ClipId, proposed?: boolean]

function deck(valv: ValvId, rows: RoleRow[]): Role[] {
  return rows.map(([id, title, realJob, blurb, clip, proposed]) => ({
    id,
    title,
    realJob,
    blurb,
    image: asset(`cards/${valv}/${id}.png`),
    clip,
    ...(proposed ? { proposed: true } : {}),
  }))
}

export const DECKS: Record<ValvId, Role[]> = {
  driften: deck('driften', [
    ['processoperatoren', 'Processoperatören', 'Processoperatör', 'Kör och vaktar valvets processer dygnet runt. Griper in när något larmar.', 'kontrollrum'],
    ['faltteknikern', 'Fältteknikern', 'Servicetekniker', 'Lagar det som gått sönder ute i valvets gångar. Reser, löser, får igång.', 'service'],
    ['faltmedikern', 'Fältmedikern', 'Undersköterska · sjuksköterska', 'Tar hand om människor när det gäller. Snabba beslut, trygg hand.', 'vard'],
    ['harbargesvarden', 'Härbärgesvärden', 'Kock', 'Får ett rum fullt av gäster att må bra. Tempo, timing, allt på plats.', 'kok'],
    ['markforvaltaren', 'Markförvaltaren', 'Lantbrukare · växtodlare', 'Odlar valvets mat i de stora odlingstälten så att basen klarar sig själv.', 'natur'],
    ['vattenmastaren', 'Vattenmästaren', 'VA-tekniker (vattenrening)', 'Håller valvets vatten rent och i kretslopp. Renar, återvinner, övervakar.', 'kontrollrum'],
    ['virkeslaget', 'Virkeslaget', 'Skogsmaskinförare', 'Skördar valvets virke i den underjordiska skogshallen. Stora maskiner, små rörelser.', 'natur'],
    ['incidentledaren', 'Incidentledaren', 'SOS-operatör · larmoperatör', 'Den lugnaste i rummet när något larmar. Leder, prioriterar, håller ihop.', 'larm', true],
  ]),
  diplomatkaren: deck('diplomatkaren', [
    ['sandebudet', 'Sändebudet', 'Förhandlare · affärsjurist', 'Sitter mitt emellan när två sidor vill olika saker, och hittar avtalet.', 'juridik'],
    ['allianslanken', 'Allianslänken', 'Kundansvarig (KAM)', 'Håller ihop valvets viktigaste samarbeten. Ringer, lyssnar, löser.', 'affar'],
    ['radgivaren', 'Rådgivaren', 'Managementkonsult · affärsutvecklare', 'Kommer in när något kört fast och ser vad ingen annan ser.', 'affar'],
    ['kvartermastaren', 'Kvartermästaren', 'Inköpare · supply chain', 'Ser till att valvet har det som behövs, i tid, till rätt pris.', 'affar'],
    ['talespersonen', 'Talespersonen', 'Kommunikatör · PR', 'Berättar för hela valvet vad som händer, så att alla förstår.', 'kommunikation'],
    ['vagledaren', 'Vägledaren', 'Lärare · studie- och yrkesvägledare', 'Hjälper nya i valvet att hitta vad de är bra på.', 'manniskor', true],
    ['lyssnaren', 'Lyssnaren', 'Kurator · socionom', 'Den man går till när något är svårt. Lyssnar först, hjälper sen.', 'manniskor', true],
    ['lagbyggaren', 'Lagbyggaren', 'HR-specialist · rekryterare', 'Sätter ihop lagen i valvet så att rätt människor hamnar tillsammans.', 'manniskor', true],
  ]),
  forskningslaget: deck('forskningslaget', [
    ['experimentledaren', 'Experimentledaren', 'Forskare · laboratorieingenjör', 'Ställer frågan, bygger försöket och tål att det går fel tio gånger.', 'labb'],
    ['kodvavaren', 'Kodvävaren', 'Mjukvaruutvecklare', 'Skriver programmen som håller valvet igång. Bygger, testar, lagar.', 'kod'],
    ['datatydaren', 'Datatydaren', 'Dataanalytiker · AI-specialist', 'Hittar mönstret i siffrorna innan någon annan ser det.', 'kod'],
    ['materialutforskaren', 'Materialutforskaren', 'Materialforskare (R&D)', 'Tar reda på vad saker egentligen är gjorda av, och gör dem bättre.', 'labb'],
    ['faltforskaren', 'Fältforskaren', 'Miljövetare · agronom', 'Mäter luft, jord och vatten i valvet så att allt håller i längden.', 'natur'],
    ['smittsparare', 'Smittspåraren', 'Biomedicinsk analytiker', 'Hittar vad som sprider sig, och stoppar det innan det hinner långt.', 'labb', true],
    ['sparsakraren', 'Spårsäkraren', 'Kriminaltekniker', 'Läser spåren som ingen annan lade märke till.', 'labb', true],
    ['testpiloten', 'Testpiloten', 'Testingenjör · kvalitetstekniker', 'Försöker få saker att gå sönder, så att de aldrig gör det på riktigt.', 'ingenjor', true],
  ]),
  teknologerna: deck('teknologerna', [
    ['konstruktoren', 'Konstruktören', 'Maskiningenjör', 'Ritar maskinerna som valvet behöver, och bygger dem.', 'ingenjor'],
    ['automationsmastaren', 'Automationsmästaren', 'Automations- · robotingenjör', 'Lär robotarna att göra det tunga, så att människorna kan göra resten.', 'ingenjor'],
    ['kraftvavaren', 'Kraftvävaren', 'Elkrafttekniker · elektriker', 'Drar ström till hela valvet och ser till att den aldrig tar slut.', 'service'],
    ['byggmastaren', 'Byggmästaren', 'Byggingenjör', 'Bygger ut valvet, sal för sal, så att det håller i hundra år.', 'bygg'],
    ['energiomstallaren', 'Energiomställaren', 'Energi- · vindkraftsingenjör', 'Hittar nya sätt att göra energi nere i valvet.', 'bygg'],
    ['formgivaren', 'Formgivaren', 'Industridesigner · UX-designer', 'Gör så att allt i valvet är lätt att använda, från spaken till skärmen.', 'design', true],
    ['protesbyggaren', 'Protesbyggaren', 'Ortopedingenjör', 'Bygger händer, ben och hjälpmedel som passar en enda människa.', 'vard', true],
    ['natvaktaren', 'Nätväktaren', 'IT-säkerhetstekniker', 'Vaktar valvets nätverk så att ingen tar sig in där de inte ska.', 'kod', true],
  ]),
}
