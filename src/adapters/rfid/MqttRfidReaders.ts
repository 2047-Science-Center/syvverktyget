/**
 * Skarp RFID-söm: prenumererar på `station<N>/rfidja` och `station<N>/rfidnej`
 * över MQTT-over-WebSocket (mqtt.js). Samma klient i pilot och drift — bara
 * broker-url skiljer.
 *
 * Tålig: `mqtt` laddas dynamiskt och all anslutning är insvept i try/catch, så
 * en saknad broker (eller saknat paket) aldrig stör flödet. Status exponeras
 * reaktivt så UI kan visa om läsarna är live.
 *
 * Mocka i piloten (broker med `listener 9001` + `protocol websockets`):
 *   mosquitto_pub -t station0/rfidja  -m 04A2B3C4
 *   mosquitto_pub -t station0/rfidnej -m 04A2B3C4
 */
import { ref } from 'vue'
import type { RfidReaders, ReaderBip, ReaderSide } from './RfidReaders'

type MqttClientLike = {
  on(event: string, cb: (...args: unknown[]) => void): void
  subscribe(topic: string | string[]): void
  end(force?: boolean): void
}

export class MqttRfidReaders implements RfidReaders {
  readonly connected = ref(false)
  private handlers = new Set<(bip: ReaderBip) => void>()
  private client: MqttClientLike | null = null
  private closed = false
  private jaTopic: string
  private nejTopic: string

  constructor(brokerUrl: string, stationN: number) {
    this.jaTopic = `station${stationN}/rfidja`
    this.nejTopic = `station${stationN}/rfidnej`
    void this.connect(brokerUrl)
  }

  private async connect(brokerUrl: string): Promise<void> {
    if (!brokerUrl) return
    let connect: (url: string, opts?: unknown) => MqttClientLike
    try {
      // Dynamisk import → en saknad dep kraschar inte bygget/flödet.
      // `connect` kan ligga som named- eller default-export beroende på build.
      const mod = (await import('mqtt')) as unknown as {
        connect?: typeof connect
        default?: { connect?: typeof connect }
      }
      const fn = mod.connect ?? mod.default?.connect
      if (!fn) return
      connect = fn
    } catch {
      return // kör vidare på klick/tangent
    }
    if (this.closed) return
    try {
      const client = connect(brokerUrl, {
        reconnectPeriod: 2000,
        connectTimeout: 4000,
      })
      this.client = client

      client.on('connect', () => {
        this.connected.value = true
        client.subscribe([this.jaTopic, this.nejTopic])
      })
      client.on('reconnect', () => (this.connected.value = false))
      client.on('close', () => (this.connected.value = false))
      client.on('error', () => (this.connected.value = false))
      client.on('message', (...args: unknown[]) => {
        const topic = String(args[0])
        const payload = args[1] as { toString(): string }
        const uid = payload.toString().trim().toUpperCase()
        if (!uid) return
        const side: ReaderSide | null =
          topic === this.jaTopic ? 'ja' : topic === this.nejTopic ? 'nej' : null
        if (!side) return
        const bip: ReaderBip = { side, uid, ts: Date.now() }
        for (const h of this.handlers) h(bip)
      })
    } catch {
      this.connected.value = false
    }
  }

  onBip(cb: (bip: ReaderBip) => void): () => void {
    this.handlers.add(cb)
    return () => this.handlers.delete(cb)
  }

  close(): void {
    this.closed = true
    this.handlers.clear()
    try {
      this.client?.end(true)
    } catch {
      /* ignore */
    }
    this.client = null
    this.connected.value = false
  }
}
