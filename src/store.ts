/**
 * Store (Pinia) för SYV-verktyget. Äger faserna och all röstdata.
 *
 * Fasflöde (BARA den här appen — incheckning + sortering till valv sker
 * uppströms och är klart när appen startar):
 *
 *   attract → swipe → barrier → reveal{result → clip → revote} → summary
 *
 * Två skärmar vid stationen. I swipe-läget är skärmarna OBEROENDE: de 3 vid en
 * skärm bippar ja/nej (RFID ja/nej-läsare, eller klick/tangent i pilot) och
 * MAJORITETEN av de 3 avgör kortet live. VARJE individs röst sparas (per
 * voterId: UID i drift, syntetiskt i klickläge). Vid barriären väntar den
 * snabbare 3-gruppen in den andra. I reveal är allt synkat och siffrorna
 * aggregeras över hela gruppen (6).
 *
 * PILOT/solo: ett fönster driver flödet; den andra skärmens 3 röster simuleras
 * (platshållare). Skarp två-NUC-synk byggs senare (config.pilotSync).
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import {
  config,
  DECKS,
  VALV,
  FULL_GROUP,
  PILOT_VALV,
  PILOT_MEMBERS,
  type Role,
  type ValvId,
} from './config'

export type Phase = 'attract' | 'swipe' | 'barrier' | 'reveal' | 'summary'
export type RevealStep = 'result' | 'clip' | 'revote'
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

/** Deterministiska platshållar-röster för den andra skärmen (stabil per kort). */
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

function majority(ballots: Ballot[]): Vote {
  const ja = ballots.filter((b) => b.vote === 'ja').length
  return ja * 2 >= ballots.length ? 'ja' : 'nej'
}

export const useStore = defineStore('syvverktyget', () => {
  const phase = ref<Phase>('attract')
  const valvId = ref<ValvId>(PILOT_VALV)
  const members = ref<string[]>([...PILOT_MEMBERS])

  const deck = computed<Role[]>(() => DECKS[valvId.value])
  const valv = computed(() => VALV[valvId.value])

  // --- Swipe ---
  const cardIndex = ref(0)
  const currentCard = computed<Role | undefined>(() => deck.value[cardIndex.value])
  /** Denna skärms ballots på nuvarande kort (0..groupSize distinkta röstare). */
  const pendingA = ref<Ballot[]>([])
  /** För VotePanel: bara rösterna (panelen räknar längd). */
  const pending = computed<Vote[]>(() => pendingA.value.map((b) => b.vote))
  /** Alla swipe-röster, per kort-id. */
  const swipeVotes = ref<Record<string, CardBallots>>({})
  /** Live-utfall per kort (majoritet av de 3 vid denna skärm). */
  const swipeOutcome = ref<Record<string, Vote>>({})
  let resolving = false

  // --- Barriär ---
  const otherScreenReady = ref(false)

  // --- Reveal ---
  const revealIndex = ref(0)
  const revealStep = ref<RevealStep>('result')
  const revealCard = computed<Role | undefined>(() => deck.value[revealIndex.value])
  const revotePendingA = ref<Ballot[]>([])
  const revotePending = computed<Vote[]>(() => revotePendingA.value.map((b) => b.vote))
  /** Omröstning efter klippet, per kort-id. */
  const revoteVotes = ref<Record<string, CardBallots>>({})
  let revoteResolving = false

  const otherScreenLabel = computed(() => (config.screens > 1 ? 'Skärm B' : ''))

  /** Syntetiskt voterId för klick/tangent (anonym person nr N på kortet). */
  function localVoterId(cardId: string, list: Ballot[]): string {
    return `local:${cardId}:${list.length + 1}`
  }

  /** Lägg/uppdatera en ballot i en lista. Returnerar ny lista (immutabelt). */
  function applyBallot(list: Ballot[], voterId: string | undefined, vote: Vote, cardId: string): Ballot[] | null {
    const id = voterId ? `uid:${voterId}` : localVoterId(cardId, list)
    const existing = list.find((b) => b.voterId === id)
    if (existing) {
      // Samma band bippade igen före upplösning → ändrat sig.
      return list.map((b) => (b.voterId === id ? { ...b, vote } : b))
    }
    if (list.length >= config.groupSize) return null
    return [...list, { voterId: id, vote }]
  }

  // ---------- Övergångar ----------
  function begin(): void {
    phase.value = 'swipe'
    cardIndex.value = 0
    pendingA.value = []
  }

  /** En person vid denna skärm bippar sin röst på nuvarande kort. */
  function castSwipe(vote: Vote, voterId?: string): void {
    if (phase.value !== 'swipe' || resolving) return
    const card = currentCard.value
    if (!card) return
    const next = applyBallot(pendingA.value, voterId, vote, card.id)
    if (!next) return
    pendingA.value = next
    if (next.length >= config.groupSize) resolveCard()
  }

  function resolveCard(): void {
    const card = currentCard.value
    if (!card) return
    resolving = true
    const A = [...pendingA.value]
    const B = simBallots(`swipe:${card.id}`)
    swipeVotes.value[card.id] = { A, B }
    swipeOutcome.value[card.id] = majority(A)
    setTimeout(() => {
      pendingA.value = []
      resolving = false
      if (cardIndex.value < deck.value.length - 1) {
        cardIndex.value += 1
      } else {
        phase.value = 'barrier'
      }
    }, 800)
  }

  /** Simulerar/speglar att den andra skärmens 3-grupp blivit klar. */
  function markOtherReady(): void {
    otherScreenReady.value = true
  }

  function startReveal(): void {
    phase.value = 'reveal'
    revealIndex.value = 0
    revealStep.value = 'result'
    revotePendingA.value = []
  }

  /** Från resultat-vyn vidare till klippet. */
  function revealPlayClip(): void {
    if (revealStep.value === 'result') revealStep.value = 'clip'
  }

  /** Klippet har spelat klart → omröstning. */
  function revealClipEnded(): void {
    if (revealStep.value === 'clip') {
      revealStep.value = 'revote'
      revotePendingA.value = []
    }
  }

  /** En person röstar om efter klippet. */
  function castRevote(vote: Vote, voterId?: string): void {
    if (revealStep.value !== 'revote' || revoteResolving) return
    const card = revealCard.value
    if (!card) return
    const next = applyBallot(revotePendingA.value, voterId, vote, card.id)
    if (!next) return
    revotePendingA.value = next
    if (next.length >= config.groupSize) resolveRevote()
  }

  function resolveRevote(): void {
    const card = revealCard.value
    if (!card) return
    revoteResolving = true
    revoteVotes.value[card.id] = {
      A: [...revotePendingA.value],
      B: simBallots(`revote:${card.id}`),
    }
    setTimeout(() => {
      revotePendingA.value = []
      revoteResolving = false
      if (revealIndex.value < deck.value.length - 1) {
        revealIndex.value += 1
        revealStep.value = 'result'
      } else {
        phase.value = 'summary'
      }
    }, 800)
  }

  // ---------- Aggregat (hela gruppen, 6) ----------
  function jaCount(map: Record<string, CardBallots>, cardId: string): number {
    const v = map[cardId]
    if (!v) return 0
    return [...v.A, ...v.B].filter((b) => b.vote === 'ja').length
  }

  function swipeJa(cardId: string): number {
    return jaCount(swipeVotes.value, cardId)
  }
  function revoteJa(cardId: string): number {
    return jaCount(revoteVotes.value, cardId)
  }
  /** Sammanställning: en rad per roll, före → efter. */
  const journey = computed(() =>
    deck.value.map((role) => ({
      role,
      before: swipeJa(role.id),
      after: revoteVotes.value[role.id] ? revoteJa(role.id) : null,
      total: FULL_GROUP,
    })),
  )

  /** Sätt valv (från start-gränssnittet / ?valv=). Rensar pågående lek. */
  function setValv(id: ValvId): void {
    if (!(id in VALV)) return
    valvId.value = id
  }
  /** Sätt namn på de 3 vid skärmen (från start-gränssnittet / ?members=). */
  function setMembers(names: string[]): void {
    if (names.length) members.value = names
  }

  function reset(): void {
    phase.value = 'attract'
    cardIndex.value = 0
    pendingA.value = []
    swipeVotes.value = {}
    swipeOutcome.value = {}
    otherScreenReady.value = false
    revealIndex.value = 0
    revealStep.value = 'result'
    revotePendingA.value = []
    revoteVotes.value = {}
    resolving = false
    revoteResolving = false
  }

  return {
    phase,
    valvId,
    valv,
    members,
    deck,
    // swipe
    cardIndex,
    currentCard,
    pending,
    pendingA,
    swipeOutcome,
    begin,
    castSwipe,
    // barrier
    otherScreenReady,
    otherScreenLabel,
    markOtherReady,
    startReveal,
    // reveal
    revealIndex,
    revealStep,
    revealCard,
    revotePending,
    revealPlayClip,
    revealClipEnded,
    castRevote,
    // aggregat
    swipeJa,
    revoteJa,
    journey,
    // start-gränssnitt
    setValv,
    setMembers,
    // övrigt
    reset,
    FULL_GROUP,
  }
})
