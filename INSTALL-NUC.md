# SYV-verktyget på en NUC — installation (portsäker, samexisterar med allt annat)

X&Y-finalen körs som en **statisk** kiosk-app på en Linux-NUC. **EN app** — svep-
och val-flödet är inbyggt i samma app, det finns ingen separat valapp. Appen
byggs till `dist/` och servas lokalt på en **ovanlig, konfigurerbar port**;
RFID ja/nej-sömmen går till en MQTT-over-WS-broker vars adress sätts i env/runtime.

> **Portsäkerhet är hela poängen här.** NUC:en kör redan mycket annat. Vi använder
> **aldrig** de vanliga portarna (80, 8080, 3000, 5173 — de antas upptagna) och
> binder servern till `127.0.0.1` så inget exponeras på nätet.

Stationens **två skärmar = två NUC:ar** mot samma broker (se README). Varje NUC
kör **ett** fönster. `?screen=A|B` skiljer dem åt.

---

## 0. FÖR-INSTALL: kolla vilka portar som är upptagna (gör detta FÖRST)

Innan något installeras — se vad som redan lyssnar på NUC:en, så du väljer lediga
portar:

```bash
ss -ltnp
```

Eller kör den medföljande kollen (läser bara, ändrar inget — kollar även SYV:s
kandidat-portar och de vanliga portar du ska undvika):

```bash
bash deploy/nuc/ports-check.sh
# eller specifika portar du vill prova:
bash deploy/nuc/ports-check.sh 8791 9341
```

### Valda portar och varför de är kollisionssäkra

| Vad | Default | Varför |
|---|---|---|
| **Webbserver** (statisk `dist/`) | **8791** | Hög, ovanlig port utan känd tjänst. **Inte** 80/8080/3000/5173. Bunden till `127.0.0.1` → kan inte krocka med något som lyssnar på andra gränssnitt, och syns inte på nätet. |
| **MQTT-over-WS-broker** (om ny sätts upp) | **9341** | Ovanlig. Mosquittos *vanliga* WS-port är **9001** — den undviker vi i default eftersom en befintlig broker ofta redan tagit den. |
| MQTT TCP (för ESP32-läsare/mock) | 1883 | MQTT-standard. Återanvänd NUC:ens befintliga broker om den finns; annars valfri ledig port. |

Alla tre är **konfigurerbara** — om `ports-check.sh` visar att någon är tagen,
välj en annan ledig, ovanlig port (`--port`, `--broker`, mosquitto-konfig nedan).
`install.sh` **vägrar** dessutom att starta om vald webbport redan är upptagen.

---

## 1. Förbered NUC:en (en gång)

Linux med en grafisk session. Installera det som saknas:

```bash
sudo apt update
sudo apt install -y git curl chromium   # eller chromium-browser / Google Chrome .deb
# Node 20+ (om det inte redan finns):
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Rekommenderat för en kiosk som ska resa sig själv: **grafisk autologin**.
Touch-paneler fungerar direkt i webbläsaren — ingen X11/Wayland-special krävs för
**en** skärm per NUC (till skillnad från Förhandlingens två-skärms-NUC).

---

## 2. MQTT-over-WS-broker — återanvänd eller sätt upp en ny

RFID ja/nej-sömmen (`station<N>/rfidja` + `/rfidnej`, rå UID) når appen via
**MQTT-over-WebSocket**. Sömmen är aldrig kritisk — utan broker kör allt på
klick/tangent.

**A) Finns redan en mosquitto på NUC:en → återanvänd den.**
Ta reda på dess WS-listener-port:

```bash
ss -ltnp | grep -i mosquitto        # vilka portar mosquitto lyssnar på
grep -rE 'listener|protocol' /etc/mosquitto/conf.d/ /etc/mosquitto/mosquitto.conf 2>/dev/null
```

Peka appen mot den porten med `--broker ws://localhost:<port>` i steg 3 (eller
`BROKER_URL` i `kiosk.env`). Behöver den en WS-listener som saknas, lägg till en
på en **ledig, ovanlig** port (se B) — rör inte befintliga listeners.

**B) Ingen broker (eller ingen WS-listener) → sätt upp en på en ovanlig, fri port.**
Välj en port som `ports-check.sh` visar är ledig (ex. **9341**, inte 9001 om den
är tagen). Lägg i `/etc/mosquitto/conf.d/syv.conf`:

```conf
# TCP för ESP32-läsare/mock (återanvänd befintlig 1883 om den redan finns)
listener 1883
allow_anonymous true

# MQTT-over-WebSocket för SYV-verktyget — OVANLIG, LEDIG port
listener 9341
protocol websockets
allow_anonymous true
```

```bash
sudo systemctl restart mosquitto
ss -ltnp | grep -E ':(1883|9341)'   # verifiera att båda lyssnar
```

> Inga hemligheter i konfig/loggar. `allow_anonymous` är OK på ett isolerat
> NUC-nät; på delat nät, sätt upp autentisering separat (inte i git).

**Mocka utan hårdvara** (verifiera sömmen):

```bash
mosquitto_pub -h localhost -t station0/rfidja  -m 04A2B3C4
mosquitto_pub -h localhost -t station0/rfidnej -m 04DDEEFF
```

---

## 3. Bygg och installera (portsäkert)

Från repo-roten (`syvverktyget/`), med portar du valt ur steg 0/2:

```bash
deploy/nuc/install.sh --port 8791 --broker ws://localhost:9341 --station 0
```

`install.sh`:
1. Bygger appen statiskt i **drift-läge** — adresserna via **env, inte i koden**:
   `VITE_MODE=production VITE_BROKER_URL=<--broker> VITE_STATION_N=<--station> npm run build`.
2. Installerar systemd-tjänsten **`syvverktyget-server`** som servar `dist/` på
   `127.0.0.1:<--port>` (self-healing, `Restart=always`, startar vid boot).
3. Installerar kiosk-autostart (systemd user-tjänst) som öppnar fönstret.

Flaggor: `--port <n>` (webbport, default 8791), `--broker <ws-url>`,
`--station <n>`, `--mode production|pilot`, `--server-only` (hoppa kiosken).

> `install.sh` avbryter om `--port` redan är upptagen eller är en vanlig port
> (80/8080/3000/5173).

### Enklaste facilitator-vägen (ingen terminal i drift)

```bash
deploy/nuc/install.sh --server-only --port 8791 --broker ws://localhost:9341
bash deploy/nuc/install-launcher.sh
```

Då finns **Starta SYV-verktyget** och **Starta om SYV-verktyget** som
skrivbordsikoner. Avsluta med appens ✕-knapp eller "Starta om".

---

## 4. Env-wiring (MODE + alla adresser via env, inte i koden)

Allt drift-specifikt sätts vid **byggtid** via Vite-env (`src/config.ts` läser
`import.meta.env.VITE_*`) — ingenting hårdkodat, inga hemligheter:

| Env | Styr | Default |
|---|---|---|
| `VITE_MODE` | `pilot` / `production` | `pilot` |
| `VITE_BROKER_URL` | drift-broker (MQTT-over-WS) | tom → faller tillbaka på pilot-broker |
| `VITE_STATION_N` | topic-namespace `station<N>/…` | `0` |
| `VITE_PILOT_BROKER_URL` | pilot/dev-broker | `ws://localhost:9001` |
| `VITE_RFID_ENABLED` | `0` stänger av sömmen (bara klick/tangent) | på |

`install.sh` sätter dessa åt dig. Brokern kan dessutom bytas **i runtime** per
kiosk med `?broker=ws://host:port` (vinner över bygg-värdet) — så du kan peka om
sömmen **utan att bygga om**. Kiosken skickar den ur `BROKER_URL` i `kiosk.env`.

---

## 5. Kiosk-inställningar

Redigera `deploy/nuc/kiosk.env` (skapas av `install.sh`, checkas aldrig in):

- `WEB_PORT` — samma port som servern.
- `BROKER_URL` — `?broker=` i runtime (byt broker utan ombyggnad).
- `SCREEN=A|B`, `VALV=driften`, `MEMBERS=...`, `AUTOSTART=1` — start-parametrar
  (normalt skickar regi-orkestratorn dessa via URL; detta är NUC:ens defaults).
- `WINDOW_POS=0,0`, `BROWSER_BIN`, `OZONE`, `SINK` — skärm/webbläsare/ljud.

```bash
systemctl --user restart syvverktyget-kiosk   # efter ändring
```

---

## 6. Verifiera

```bash
curl -s 127.0.0.1:8791/healthz           # → ok
sudo systemctl status syvverktyget-server
systemctl --user status syvverktyget-kiosk
ss -ltnp | grep 8791                     # bara 127.0.0.1:8791, inget på nätet
```

Mocka en röst (steg 2) och se att kortet reagerar. Utan broker: klicka
NEJ/JA-zonerna eller ◀/N = nej, ▶/J = ja.

---

## 7. Uppdatera / starta om

```bash
cd syvverktyget
git pull
deploy/nuc/install.sh --port 8791 --broker ws://localhost:9341   # bygger om + startar om servern
bash deploy/nuc/restart.sh                                       # bara ladda om fönstret
```

## 8. Loggar & felsökning

```bash
sudo journalctl -u syvverktyget-server -f     # serverloggar
systemctl --user status syvverktyget-kiosk    # kioskstatus
cat ~/.syvverktyget-kiosk/kiosk.log           # start via ikon
```

- **Svart/vit skärm:** servern svarar inte (`/healthz`) eller Chromium saknas.
- **Port upptagen vid install:** kör `ports-check.sh`, välj en annan `--port`.
- **RFID reagerar inte:** fel `BROKER_URL`/`--broker`, eller mosquittos
  WS-listener saknas (`ss -ltnp | grep <port>`). Sömmen är inte kritisk — flödet
  kör ändå på klick/tangent.
- **Byt broker utan ombyggnad:** sätt `BROKER_URL` i `kiosk.env` och starta om
  kiosken (`?broker=` i runtime).

## 9. Skarp rigg-drift (senare)

Bekräfta `STATION_N` mot riggen, fyll identitets-/resultat-stubbarna när
regi-kontraktet landar, och kör med `--mode production`. Server/kiosk påverkas
inte — bara adaptrarna byter läge. **Inga hemligheter i git/filer/loggar.**
