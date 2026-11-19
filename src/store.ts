/**
 * Store (Pinia) för SYV-verktyget v2. Äger faserna och all röstdata.
 *
 *   card → swipe ×8 → overview (så valde ni + barriär)
 *        → reality{ clip → revote } ×8 → doors
 *
 * Röster: 'ja' = ÖPPEN dörr (höger läsare), 'nej' = STÄNGD dörr (vänster
 * läsare). Samma värden som RFID-sömmen (`rfidja`/`rfidnej`), så adaptrarna
 * rörs inte.
 *
 * Två skärmar vid stationen. I svepet är skärmarna OBEROENDE: de 3 vid en skärm
 * bippar och MAJORITETEN av de 3 stämplar kortet. VARJE individs röst sparas
 * (per voterId: UID i drift, syntetiskt i klickläge). I "så valde ni" väntar
 * den snabbare skärmen in den andra (barriären). Verkligheten är gemensam och
 * räknas över hela gruppen (6).
 *
 * PILOT/solo: ett fönster driver flödet; den andra skärmens 3 röster simuleras
 * deterministiskt. Skarp två-NUC-synk byggs senare (config.pilotSync).
 *
 * BANDLÖST (config.bandlost, v49): ingen läsare — personerna vid skärmen sveper i TUR OCH ORDNING.
 * `turn` = vems tur (0-baserad), `voterCount` = antal vid skärmen (namnen ur ?members=, annars
 * groupSize). Rösten sparas som person:<n>, samma person på alla kort (som ett UID).
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { config, DECKS, VALV, FULL_GROUP, PILOT_VALV, PILOT_MEMBERS, type Role, type ValvId } from './config'
import { turVoterId } from './bandlost'

export type Phase = 'card' | 'swipe' | 'overview' | 'reality' | 'doors'
export type RealityStep = 'clip' | 'revote'
/** 'ja' = öppen dörr, 'nej' = stängd dörr. */
export type Vote = 'ja' | 'nej'

/** En individs röst på ett kort. voterId = UID (drift) eller syntetiskt (klick). */
export interface Ballot {
  voterId: string
  vote: Vote
}

/** Röster per kort: denna skärm (A) + den andra skärmen (B, simulerad i solo). */
interface CardBallots {
  A: Ballot[]
  B: Ballot[]
}

/** Deterministiska röster för den andra skärmen (stabil per kort). */
function simBallots(seed: string): Ballot[] {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff
  const out: Ballot[] = []
  for (let i = 0; i < config.groupSize; i++) {
    h = (h * 1103515245 + 12345) & 0xffff
    out.push({ voterId: `sim:${seed}:${i}`, vote: (h >> 4) % 2 === 0 ? 'ja' : 'nej' })
  }
  return out
}

/** Omröstningen på skärm B: utgår från svepet, och var tredje röst (ungefär) öppnar sig. */
function simRevote(seed: string, before: Ballot[]): Ballot[] {
  const extra = simBallots(seed)
  return before.map((b, i) => ({
    voterId: b.voterId,
    vote: b.vote === 'nej' && extra[i].vote === 'ja' && i % 2 === 0 ? 'ja' : b.vote,
  }))
}

function majority(ballots: Ballot[]): Vote {
  const ja = ballots.filter((b) => b.vote === 'ja').length
  return ja * 2 >= ballots.length ? 'ja' : 'nej'
}

export const useStore = defineStore('syvverktyget', () => {
  const phase = ref<Phase>('card')
  const valvId = ref<ValvId>(PILOT_VALV)
  const members = ref<string[]>([...PILOT_MEMBERS])
  /** true när regi/overlayen skickat riktiga namn (?members= / start-kanalen). */
  const namedMembers = ref(false)
  const bandlost = config.bandlost
  /** Antal röster som avgör ett kort vid den här skärmen. */
  const voterCount = computed(() =>
    bandlost && namedMembers.value ? Math.max(1, members.value.length) : config.groupSize,
  )

  const deck = computed<Role[]>(() => DECKS[valvId.value])
  const valv = computed(() => VALV[valvId.value])

  /** Alla väntande timers, så att reset aldrig får en spöktimer. */
  const timers = new Set<ReturnType<typeof setTimeout>>()
  function later(ms: number, fn: () => void): void {
    const t = setTimeout(() => {
      timers.delete(t)
      fn()
    }, ms)
    timers.add(t)
  }

  // --- Svep ---
  const swipeIndex = ref(0)
  const swipeCard = computed<Role | undefined>(() => deck.value[swipeIndex.value])
  const swipePending = ref<Ballot[]>([])
  const swipeVotes = ref<Record<string, CardBallots>>({})
  /** Stämpeln som ligger på kortet just nu (null = inte avgjort än). */
  const swipeStamp = ref<Vote | null>(null)

  // --- Så valde ni / barriär ---
  const otherScreenReady = ref(false)

  // --- Verkligheten ---
  const realityIndex = ref(0)
  const realityStep = ref<RealityStep>('clip')
  const realityCard = computed<Role | undefined>(() => deck.value[realityIndex.value])
  const revotePending = ref<Ballot[]>([])
  const revoteVotes = ref<Record<string, CardBallots>>({})
  /** Hur många dörrar som rörde sig på nuvarande roll (null = inte klart än). */
  const revoteMoved = ref<number | null>(null)

  /** Syntetiskt voterId för klick/tangent (anonym person nr N på kortet). */
  function localVoterId(cardId: string, list: Ballot[]): string {
    return `local:${cardId}:${list.length + 1}`
  }

  /** Vems tur det är (bandlöst läge): nästa röst på kortet som är öppet nu. */
  const turn = computed(() => {
    if (phase.value === 'swipe') return swipePending.value.length
    if (phase.value === 'reality' && realityStep.value === 'revote') return revotePending.value.length
    return 0
  })
  /** Namnet på den som har turen, om namnen är kända (annars null → "TUR 2 AV 3"). */
  const turnName = computed(() => (namedMembers.value ? (members.value[turn.value] ?? null) : null))

  /** Lägg/uppdatera en ballot. Samma UID igen före upplösning = ändrat sig. */
  function applyBallot(list: Ballot[], voterId: string | undefined, vote: Vote, cardId: string): Ballot[] | null {
    const id = voterId ? `uid:${voterId}` : bandlost ? turVoterId(list.length) : localVoterId(cardId, list)
    if (list.some((b) => b.voterId === id)) return list.map((b) => (b.voterId === id ? { ...b, vote } : b))
    if (list.length >= voterCount.value) return null
    return [...list, { voterId: id, vote }]
  }

  // ---------- Övergångar ----------
  function begin(): void {
    clearTimers()
    phase.value = 'swipe'
    swipeIndex.value = 0
    swipePending.value = []
    swipeStamp.value = null
  }

  function castSwipe(vote: Vote, voterId?: string): boolean {
    const card = swipeCard.value
    if (phase.value !== 'swipe' || swipeStamp.value || !card) return false
    const next = applyBallot(swipePending.value, voterId, vote, card.id)
    if (!next) return false
    swipePending.value = next
    if (next.length >= voterCount.value) resolveSwipe(card)
    return true
  }

  function resolveSwipe(card: Role): void {
    const A = [...swipePending.value]
    swipeVotes.value[card.id] = { A, B: simBallots(`swipe:${card.id}`) }
    swipeStamp.value = majority(A)
    later(config.timing.stampHoldMs, () => {
      swipePending.value = []
      swipeStamp.value = null
      if (swipeIndex.value < deck.value.length - 1) swipeIndex.value += 1
      else enterOverview()
    })
  }

  function enterOverview(): void {
    phase.value = 'overview'
    otherScreenReady.value = false
    if (config.pilotSync === 'solo') later(config.timing.simOtherScreenMs, () => (otherScreenReady.value = true))
  }

  function startReality(): void {
    clearTimers()
    otherScreenReady.value = true
    phase.value = 'reality'
    realityIndex.value = 0
    realityStep.value = 'clip'
    revotePending.value = []
    revoteMoved.value = null
  }

  /** Klippet har spelat klart (eller hoppats över) → rösta om. */
  function clipEnded(): void {
    if (phase.value !== 'reality' || realityStep.value !== 'clip') return
    realityStep.value = 'revote'
    revotePending.value = []
    revoteMoved.value = null
  }

  function castRevote(vote: Vote, voterId?: string): boolean {
    const card = realityCard.value
    if (phase.value !== 'reality' || realityStep.value !== 'revote' || revoteMoved.value !== null || !card) return false
    const next = applyBallot(revotePending.value, voterId, vote, card.id)
    if (!next) return false
    revotePending.value = next
    if (next.length >= voterCount.value) resolveRevote(card)
    return true
  }

  function resolveRevote(card: Role): void {
    const before = swipeVotes.value[card.id]
    revoteVotes.value[card.id] = {
      A: [...revotePending.value],
      B: simRevote(`revote:${card.id}`, before?.B ?? simBallots(`swipe:${card.id}`)),
    }
    revoteMoved.value = revoteOpen(card.id) - swipeOpen(card.id)
    later(config.timing.revoteHoldMs, () => {
      revotePending.value = []
      revoteMoved.value = null
      if (realityIndex.value < deck.value.length - 1) {
        realityIndex.value += 1
        realityStep.value = 'clip'
      } else {
        phase.value = 'doors'
      }
    })
  }

  /**
   * En röst från en läsare (RFID-bip, klick eller tangent). Returnerar true om
   * den räknades. På kortet och i "så valde ni" betyder vilken bip som helst
   * "vi är redo", så att flödet går att driva med bara banden.
   */
  function cast(vote: Vote, voterId?: string): boolean {
    switch (phase.value) {
      case 'card':
        begin()
        return true
      case 'swipe':
        return castSwipe(vote, voterId)
      case 'overview':
        if (!otherScreenReady.value) return false
        startReality()
        return true
      case 'reality':
        return realityStep.value === 'revote' ? castRevote(vote, voterId) : false
      default:
        return false
    }
  }

  /** Enter/mellanslag/facilitatorn: gå vidare där det finns något att gå vidare till. */
  function advance(): void {
    if (phase.value === 'card') begin()
    else if (phase.value === 'overview') startReality()
    else if (phase.value === 'reality' && realityStep.value === 'clip') clipEnded()
  }

  // ---------- Aggregat (hela gruppen, 6) ----------
  function ballots(map: Record<string, CardBallots>, cardId: string): Ballot[] {
    const v = map[cardId]
    return v ? [...v.A, ...v.B] : []
  }
  /** Gruppens sex dörrar i svepet (skärm A först). */
  function swipeDoors(cardId: string): Vote[] {
    return ballots(swipeVotes.value, cardId).map((b) => b.vote)
  }
  function revoteDoors(cardId: string): Vote[] {
    return ballots(revoteVotes.value, cardId).map((b) => b.vote)
  }
  function swipeOpen(cardId: string): number {
    return swipeDoors(cardId).filter((v) => v === 'ja').length
  }
  function revoteOpen(cardId: string): number {
    return revoteDoors(cardId).filter((v) => v === 'ja').length
  }
  /** Skärm A:s stämpel per kort (majoriteten av de tre). */
  function swipeOutcome(cardId: string): Vote | null {
    const v = swipeVotes.value[cardId]
    return v ? majority(v.A) : null
  }

  /** Dörrarna: en rad per roll, före → efter. */
  const journey = computed(() =>
    deck.value.map((role) => {
      const before = swipeOpen(role.id)
      const after = revoteVotes.value[role.id] ? revoteOpen(role.id) : before
      return { role, before, after, delta: after - before, total: FULL_GROUP }
    }),
  )
  const openedTotal = computed(() => journey.value.reduce((s, r) => s + Math.max(0, r.delta), 0))

  // ---------- Start-gränssnitt ----------
  function setValv(id: ValvId): void {
    if (!(id in VALV)) return
    valvId.value = id
  }
  function setMembers(names: string[]): void {
    if (!names.length) return
    members.value = names
    namedMembers.value = true
  }

  function clearTimers(): void {
    for (const t of timers) clearTimeout(t)
    timers.clear()
  }

  function reset(): void {
    clearTimers()
    phase.value = 'card'
    swipeIndex.value = 0
    swipePending.value = []
    swipeVotes.value = {}
    swipeStamp.value = null
    otherScreenReady.value = false
    realityIndex.value = 0
    realityStep.value = 'clip'
    revotePending.value = []
    revoteVotes.value = {}
    revoteMoved.value = null
  }

  return {
    phase,
    valvId,
    valv,
    members,
    deck,
    // bandlöst: turordning
    bandlost,
    voterCount,
    turn,
    turnName,
    // svep
    swipeIndex,
    swipeCard,
    swipePending,
    swipeStamp,
    begin,
    // så valde ni
    otherScreenReady,
    startReality,
    // verkligheten
    realityIndex,
    realityStep,
    realityCard,
    revotePending,
    revoteMoved,
    clipEnded,
    // input
    cast,
    advance,
    // aggregat
    swipeDoors,
    revoteDoors,
    swipeOpen,
    revoteOpen,
    swipeOutcome,
    journey,
    openedTotal,
    // start-gränssnitt
    setValv,
    setMembers,
    reset,
    FULL_GROUP,
  }
})
