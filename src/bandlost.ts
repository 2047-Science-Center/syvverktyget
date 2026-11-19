/**
 * Bandlöst läge (v49) — samma strömbrytare som stationernas station-kit/band.
 * Kontrakt: xy-rigg/SOM.md "Tillägg: bandlöst läge (v49)". Design: xy-arkitektur/XY-BANDLOST-OCH-ANKOMST.md §2.4.
 *
 *   bandlöst (default inför v49)  ingen läsare: personerna vid skärmen sveper i TUR OCH ORDNING
 *                                 ("TUR 1 AV 3 · ALMA"), en röst per person och kort. voterId = person:<n>,
 *                                 samma person på alla kort.
 *   band                          läsarna station<N>/rfidja + rfidnej (rå UID per bipp), som förut.
 *                                 Klick/tangent finns kvar som reserv.
 *
 * Påslag (första som finns vinner): ?bandlost=1|0 → VITE_BANDLOST=1|0 vid bygget → på.
 */

/** '1' | 'true' | 'ja' | 'on' → true, '0' | 'false' | 'nej' | 'off' → false, annat → null. */
export function flagga(v: string | null | undefined): boolean | null {
  if (v == null) return null
  const s = String(v).trim().toLowerCase()
  if (s === '1' || s === 'true' || s === 'ja' || s === 'on') return true
  if (s === '0' || s === 'false' || s === 'nej' || s === 'off') return false
  return null
}

function urlParam(name: string): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get(name)
}

export function bandlostFran(fallback: boolean, env?: string | null): boolean {
  return flagga(urlParam('bandlost')) ?? flagga(env) ?? fallback
}

export const BANDLOST: boolean = bandlostFran(true, import.meta.env.VITE_BANDLOST as string | undefined)

/**
 * Stationens nummer för läsar-topics (station<N>/rfidja|rfidnej). `?station=N` i overlayens URL går
 * före bygget: SYV körs på broker-NUC:en och visas på alla fyra valvens skärmar med samma bygge.
 */
export function stationFranUrl(fallback: number): number {
  const q = urlParam('station')
  const n = q == null || q === '' ? NaN : Number(q)
  return Number.isInteger(n) && n >= 0 ? n : fallback
}

/** voterId för turen (0-baserad) i bandlöst läge: samma person på alla kort. */
export function turVoterId(tur: number): string {
  return `person:${tur + 1}`
}
