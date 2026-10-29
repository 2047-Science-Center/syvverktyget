/**
 * Ljudmotor — riktiga SYV-SFX (xy-ljud) med SYNTES-fallback via Web Audio.
 *
 * Standard: filerna i public/Sound/sfx/ (h1…h14) spelas. Saknas/fallerar en fil
 * faller motorn tillbaka på samma händelses syntes — ljud är aldrig kritiskt och
 * flödet (klick/tangent/RFID) påverkas aldrig.
 *
 * Kiosk-autoplay: AudioContext skapas låst och låses upp på första
 * användargesten (attract-/"tryck för att börja"-skärmen). Global mute + volym.
 *
 * Händelse → fil-mappning (från ljud-sessionens beat 11):
 *   attract        h1  attract/entré
 *   swipeLeft      h2  svep vänster (nej-riktning, klick/tangent)
 *   swipeRight     h3  svep höger (ja-riktning, klick/tangent)
 *   jaBip          h4  JA-röst (RFID ja-bip)
 *   nejBip         h5  NEJ-röst (RFID nej-bip)
 *   cardFlip       h6  nästa kort / kort-flip
 *   barrierPing    h7  barriär "väntar på andra skärmen"
 *   resultTally    h8  result-aggregatet i reveal
 *   clipTransition h9  övergång in i branschklippet
 *   revotePrompt   h10 "vill du ändra dig?"-prompten
 *   summaryUp      h11 summary ▲ per roll
 *   summaryDown    h12 summary ▼ per roll
 *   summarySame    h13 summary → per roll
 *   avslutStinger  h14 slutet/avslut
 */

export type Sfx =
  | 'attract'
  | 'swipeLeft'
  | 'swipeRight'
  | 'jaBip'
  | 'nejBip'
  | 'cardFlip'
  | 'barrierPing'
  | 'resultTally'
  | 'clipTransition'
  | 'revotePrompt'
  | 'summaryUp'
  | 'summaryDown'
  | 'summarySame'
  | 'avslutStinger'

export const SAMPLES_ENABLED = true
export const SAMPLE_FILES: Record<Sfx, string> = {
  attract: 'h1-attract-entre.mp3',
  swipeLeft: 'h2-swipe-vanster.mp3',
  swipeRight: 'h3-swipe-hoger.mp3',
  jaBip: 'h4-ja-bip.mp3',
  nejBip: 'h5-nej-bip.mp3',
  cardFlip: 'h6-kort-flip.mp3',
  barrierPing: 'h7-barrier-ping.mp3',
  resultTally: 'h8-result-tally.mp3',
  clipTransition: 'h9-klipp-overgang.mp3',
  revotePrompt: 'h10-revote-prompt.mp3',
  summaryUp: 'h11-summary-upp.mp3',
  summaryDown: 'h12-summary-ner.mp3',
  summarySame: 'h13-summary-oforandrad.mp3',
  avslutStinger: 'h14-avslut-stinger.mp3',
}

class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private _muted = false
  private _volume = 0.6
  private unlocked = false
  private buffers = new Map<Sfx, AudioBuffer>()

  get muted(): boolean {
    return this._muted
  }

  get volume(): number {
    return this._volume
  }

  setMuted(muted: boolean): void {
    this._muted = muted
    if (this.master) this.master.gain.value = muted ? 0 : this._volume
  }

  toggleMuted(): boolean {
    this.setMuted(!this._muted)
    return this._muted
  }

  setVolume(v: number): void {
    this._volume = Math.max(0, Math.min(1, v))
    if (this.master && !this._muted) this.master.gain.value = this._volume
  }

  /** Lås upp ljudkontexten — anropas på första användargesten. */
  unlock(): void {
    if (this.unlocked) return
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctor()
      this.master = this.ctx.createGain()
      this.master.gain.value = this._muted ? 0 : this._volume
      this.master.connect(this.ctx.destination)
      this.unlocked = true
    } catch {
      this.unlocked = false
    }
    void this.ctx?.resume()
    if (this.unlocked && SAMPLES_ENABLED) void this.loadSamples()
  }

  /** Förladda sampel; allt som saknas/fallerar ignoreras (syntes tar över). */
  private async loadSamples(): Promise<void> {
    const ctx = this.ctx
    if (!ctx) return
    const base = import.meta.env.BASE_URL
    await Promise.all(
      (Object.entries(SAMPLE_FILES) as [Sfx, string][]).map(async ([sfx, file]) => {
        try {
          const res = await fetch(`${base}Sound/sfx/${file}`)
          if (!res.ok) return
          const buf = await ctx.decodeAudioData(await res.arrayBuffer())
          this.buffers.set(sfx, buf)
        } catch {
          /* saknas/ogiltig fil -> syntes */
        }
      }),
    )
  }

  private playBuffer(sfx: Sfx): boolean {
    const buf = this.buffers.get(sfx)
    if (!buf || !this.ctx || !this.master) return false
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    src.connect(this.master)
    src.start()
    return true
  }

  private tone(freq: number, start: number, dur: number, type: OscillatorType, peak: number): void {
    if (!this.ctx || !this.master) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, start)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
    osc.connect(gain)
    gain.connect(this.master)
    osc.start(start)
    osc.stop(start + dur + 0.02)
  }

  private sweep(from: number, to: number, start: number, dur: number, type: OscillatorType, peak: number): void {
    if (!this.ctx || !this.master) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(from, start)
    osc.frequency.linearRampToValueAtTime(to, start + dur)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
    osc.connect(gain)
    gain.connect(this.master)
    osc.start(start)
    osc.stop(start + dur + 0.02)
  }

  /** Syntes-fallback per händelse (bara om filen saknas). */
  private synth(sfx: Sfx): void {
    if (!this.ctx || !this.master) return
    const now = this.ctx.currentTime
    switch (sfx) {
      case 'attract':
        this.sweep(80, 520, now, 0.5, 'sawtooth', 0.1)
        this.tone(660, now + 0.55, 0.08, 'square', 0.12)
        break
      case 'swipeRight':
      case 'jaBip':
        this.tone(660, now, 0.09, 'triangle', 0.18)
        this.tone(990, now + 0.08, 0.12, 'triangle', 0.18)
        break
      case 'swipeLeft':
      case 'nejBip':
        this.tone(180, now, 0.18, 'sawtooth', 0.16)
        this.tone(140, now + 0.05, 0.2, 'sawtooth', 0.14)
        break
      case 'cardFlip':
        this.sweep(500, 900, now, 0.09, 'square', 0.06)
        this.tone(1320, now + 0.08, 0.05, 'square', 0.08)
        break
      case 'barrierPing':
        this.tone(880, now, 0.05, 'square', 0.12)
        this.tone(1320, now + 0.04, 0.06, 'square', 0.1)
        break
      case 'resultTally':
        this.tone(880, now, 0.04, 'square', 0.1)
        this.tone(1100, now + 0.08, 0.04, 'square', 0.1)
        break
      case 'clipTransition':
        this.sweep(220, 1400, now, 0.35, 'sawtooth', 0.06)
        break
      case 'revotePrompt':
        this.tone(660, now, 0.1, 'triangle', 0.14)
        this.tone(880, now + 0.11, 0.1, 'triangle', 0.14)
        break
      case 'summaryUp':
        this.tone(784, now, 0.1, 'triangle', 0.16)
        this.tone(1047, now + 0.09, 0.14, 'triangle', 0.18)
        break
      case 'summaryDown':
        this.tone(440, now, 0.12, 'triangle', 0.14)
        this.tone(294, now + 0.11, 0.18, 'triangle', 0.14)
        break
      case 'summarySame':
        this.tone(587, now, 0.12, 'triangle', 0.12)
        break
      case 'avslutStinger':
        this.tone(523, now, 0.12, 'triangle', 0.2)
        this.tone(659, now + 0.11, 0.12, 'triangle', 0.2)
        this.tone(784, now + 0.22, 0.12, 'triangle', 0.2)
        this.tone(1047, now + 0.33, 0.22, 'triangle', 0.22)
        break
    }
  }

  play(sfx: Sfx): void {
    if (this._muted || !this.ctx || !this.master) return
    if (this.playBuffer(sfx)) return
    this.synth(sfx)
  }
}

/** Singleton — en ljudmotor per kiosk. */
export const audio = new AudioEngine()
