/**
 * Svepgest (bandlöst läge, v49): dra kortet åt höger = ÖPPEN ('ja'), åt vänster = STÄNGD ('nej').
 * Ett tryck på dörrzonerna fungerar likadant; gesten är bara det naturliga sättet på en pekskärm.
 */
import type { Vote } from './store'

/** Minsta sidledes rörelse (px) som räknas som svep, och största lodräta. */
const MIN_DX = 70
const MAX_DY = 120

export function useSwipeGesture(onSwipe: (vote: Vote) => void, enabled: () => boolean) {
  let start: { x: number; y: number; id: number } | null = null
  return {
    onPointerdown(e: PointerEvent): void {
      if (!enabled()) return
      start = { x: e.clientX, y: e.clientY, id: e.pointerId }
    },
    onPointerup(e: PointerEvent): void {
      const s = start
      start = null
      if (!s || s.id !== e.pointerId || !enabled()) return
      const dx = e.clientX - s.x
      const dy = Math.abs(e.clientY - s.y)
      if (Math.abs(dx) >= MIN_DX && dy <= MAX_DY) onSwipe(dx > 0 ? 'ja' : 'nej')
    },
    onPointercancel(): void {
      start = null
    },
  }
}
