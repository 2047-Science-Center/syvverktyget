#!/usr/bin/env bash
# Startar SYV-verktyget i kiosk på NUC:ens skärm. EN app, ETT fönster per NUC
# (stationens två skärmar = två NUC:ar mot samma broker — se README).
#
# Svep-/val-flödet är inbyggt i samma app; ingen separat valapp startas.
#
# Appen servas lokalt av systemd-tjänsten syvverktyget-server (statisk dist/) på
# en ovanlig, konfigurerbar port (WEB_PORT). RFID ja/nej-sömmen går till en
# MQTT-over-WS-broker vars adress sätts i runtime med ?broker= (BROKER_URL) —
# ingen ombyggnad behövs för att byta broker.
#
# Konfig via miljövariabler eller deploy/nuc/kiosk.env (skapas av install.sh).
# Körs i en grafisk session. Direktkörning är främst för felsökning — använd
# start.sh / restart.sh från skrivbordsikonen i drift.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Ladda lokal konfig om den finns (städa CR/nbsp som kan följa med inklistring).
if [ -f "$HERE/kiosk.env" ]; then
  # shellcheck disable=SC1090
  set -a; . <(tr -d '\r' < "$HERE/kiosk.env" | sed 's/\xc2\xa0/ /g'); set +a
fi

# --- Konfig (miljövariabler med rimliga defaults) ---
WEB_PORT="${WEB_PORT:-8791}"                       # samma port som servern (install.sh)
URL_BASE="${URL_BASE:-http://127.0.0.1:$WEB_PORT}"
PROFILE_DIR="${PROFILE_DIR:-$HOME/.syvverktyget-kiosk}"

# Start-parametrar (regi-orkestratorn skickar normalt dessa via URL; här är de
# defaults när NUC:en startar sig själv). Alla valfria.
BROKER_URL="${BROKER_URL:-}"      # ?broker= — MQTT-over-WS-broker (runtime-override)
SCREEN="${SCREEN:-}"              # ?screen=A|B
VALV="${VALV:-}"                  # ?valv=driften m.fl.
MEMBERS="${MEMBERS:-}"            # ?members=Alva,Noah,Wilma
AUTOSTART="${AUTOSTART:-}"        # 1 = hoppa attract

# Fönsterplacering. Default = primär skärm (0,0). Sätt WINDOW_POS=X,0 om NUC:en
# har flera skärmar och appen ska på en specifik.
WINDOW_POS="${WINDOW_POS:-0,0}"
# Valfritt: ljud till en specifik utgång (namn ur: pactl list short sinks).
SINK="${SINK:-}"

# --- Bygg start-URL (hash-routad app; params i query före hash) ---
q=""
add() { [ -n "$2" ] && q="${q:+$q&}$1=$2"; }
add broker "$BROKER_URL"
add screen "$SCREEN"
add valv "$VALV"
add members "$MEMBERS"
add autostart "$AUTOSTART"
URL="$URL_BASE/${q:+?$q}"

# --- Hitta Chromium/Chrome (föredra icke-snap .deb; se stationsbygge-mönstret) ---
BROWSER="${BROWSER_BIN:-}"
if [ -z "$BROWSER" ]; then
  for b in google-chrome-stable google-chrome chromium-browser chromium; do
    if command -v "$b" >/dev/null 2>&1; then BROWSER="$b"; break; fi
  done
fi
[ -n "$BROWSER" ] || { echo "kiosk.sh: hittade ingen chromium/chrome i PATH — installera chromium." >&2; exit 1; }

# --- Vänta tills servern svarar (hälsokoll) ---
echo "kiosk.sh: väntar på $URL_BASE/healthz ..."
for _ in $(seq 1 60); do
  curl -fsS "$URL_BASE/healthz" >/dev/null 2>&1 && break
  sleep 1
done

# --- Chromium-flaggor (mirror av forhandlingens kiosk) ---
# OZONE=x11 (XWayland) → --window-position funkar även på Wayland. INTE --kiosk:
# appens ✕ Avsluta (window.close) ska kunna stänga fönstret; --app +
# --start-fullscreen ger ändå ett rent chromlöst helskärmsfönster.
OZONE="${OZONE:-x11}"
flags=(
  "--ozone-platform=$OZONE"
  --start-fullscreen
  --no-first-run
  --no-default-browser-check
  --noerrdialogs
  --disable-infobars
  --disable-session-crashed-bubble
  --disable-features=TranslateUI
  --overscroll-history-navigation=0
  --autoplay-policy=no-user-gesture-required
  --check-for-update-interval=31536000
  --user-data-dir="$PROFILE_DIR/profile"
  --window-position="$WINDOW_POS"
)

echo "kiosk.sh: startar SYV-verktyget  [$BROWSER]  $URL"
pre=(env)
[ -n "$SINK" ] && pre=(env "PULSE_SINK=$SINK" "PULSE_PROP=application.name=SYV")
"${pre[@]}" "$BROWSER" "${flags[@]}" --app="$URL" &
PID=$!

# Robust ljud-routing (om SINK satt): håll strömmen på rätt utgång så länge
# fönstret lever — fallback ifall PULSE_SINK ignoreras (snap-Chromium/PipeWire).
if [ -n "$SINK" ] && command -v pactl >/dev/null 2>&1 && command -v python3 >/dev/null 2>&1; then
  (
    set +e
    while pgrep -f "$PROFILE_DIR/profile" >/dev/null 2>&1; do
      ids=$(pactl -f json list sink-inputs 2>/dev/null | python3 -c '
import sys, json
try: data = json.load(sys.stdin)
except Exception: sys.exit(0)
for si in data:
    if si.get("properties", {}).get("application.name") == "SYV":
        print(si.get("index", ""))
' 2>/dev/null)
      for id in $ids; do pactl move-sink-input "$id" "$SINK" >/dev/null 2>&1; done
      sleep 3
    done
  ) &
fi

wait "$PID" 2>/dev/null || true
echo "kiosk.sh: fönstret stängt — klart."
