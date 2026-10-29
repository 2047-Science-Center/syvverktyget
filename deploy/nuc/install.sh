#!/usr/bin/env bash
# Engångsinstallation av SYV-verktyget (X&Y-finalen) som permanent kiosk-station
# på en Linux-NUC — portsäkert, så den samexisterar med allt annat som redan kör.
#   1) bygger appen statiskt i drift-läge (npm ci + VITE_MODE=production ... build)
#   2) installerar en systemd-tjänst som servar dist/ på en OVANLIG, konfigurerbar
#      port (default 8791 — ALDRIG 80/8080/3000/5173), bunden till 127.0.0.1
#   3) (valfritt) installerar en systemd USER-tjänst som startar kiosk-fönstret
#
# Kör på NUC:en, från repo-roten (syvverktyget/):  deploy/nuc/install.sh
#
# PORTSÄKERHET FÖRST: kör  bash deploy/nuc/ports-check.sh  (eller  ss -ltnp )
# INNAN installation och välj portar som är lediga. Se INSTALL-NUC.md.
#
# Flaggor:
#   --port <n>      webbserverns port (default 8791)
#   --broker <url>  MQTT-over-WS-broker i drift, t.ex. ws://localhost:9341
#                   (bakas in i bygget; kan även overridas per kiosk i runtime)
#   --station <n>   stationsnummer → topics station<N>/rfidja|rfidnej (default 0)
#   --mode <m>      production (default) | pilot
#   --server-only   hoppa över kiosk-tjänsten (bara servern)
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"

PORT="${PORT:-8791}"
BROKER="${BROKER:-}"
STATION="${STATION:-0}"
MODE="${MODE:-production}"
INSTALL_KIOSK=1

while [ $# -gt 0 ]; do
  case "$1" in
    --port) PORT="$2"; shift ;;
    --broker) BROKER="$2"; shift ;;
    --station) STATION="$2"; shift ;;
    --mode) MODE="$2"; shift ;;
    --server-only) INSTALL_KIOSK=0 ;;
    *) echo "Okänd flagga: $1" >&2; exit 1 ;;
  esac
  shift
done

say() { printf '\n\033[1;33m== %s\033[0m\n' "$*"; }

# --- Förkontroller ---
command -v node >/dev/null 2>&1 || { echo "Node saknas. Installera Node 20+ först." >&2; exit 1; }
command -v npm  >/dev/null 2>&1 || { echo "npm saknas. Installera Node 20+ först." >&2; exit 1; }
NODE="$(command -v node)"
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 20 ] || echo "Varning: Node $NODE_MAJOR — 20+ rekommenderas."
USER_NAME="$(id -un)"

# --- Portsäkerhetskoll: vägra starta om vald port redan är upptagen ---
if command -v ss >/dev/null 2>&1; then
  if ss -ltnH "( sport = :$PORT )" 2>/dev/null | grep -q .; then
    echo "FEL: port $PORT är redan upptagen på den här NUC:en." >&2
    echo "     Välj en annan med --port <n>. Se lediga/upptagna:  bash $HERE/ports-check.sh" >&2
    exit 1
  fi
fi
case "$PORT" in
  80|8080|3000|5173) echo "FEL: $PORT är en vanlig port som ofta är upptagen. Välj en ovanlig port." >&2; exit 1 ;;
esac

say "Repo:    $REPO"
say "Node:    $NODE ($(node -v))"
say "Port:    $PORT   Mode: $MODE   Station: $STATION   Broker: ${BROKER:-'(ej satt — pilot-default/?broker=)'}"
say "Användare: $USER_NAME"

# --- 1) Bygg statiskt i drift-läge (adresser via env, inte i koden) ---
say "Installerar beroenden (npm ci)"
( cd "$REPO" && (npm ci || npm install) )
say "Bygger appen (VITE_MODE=$MODE)"
( cd "$REPO" && \
  VITE_MODE="$MODE" \
  VITE_BROKER_URL="$BROKER" \
  VITE_STATION_N="$STATION" \
  npm run build )
[ -f "$REPO/dist/index.html" ] || { echo "FEL: dist/index.html saknas efter bygget." >&2; exit 1; }

# --- 2) Server som systemd-tjänst (system, kräver sudo) ---
say "Installerar systemd-tjänst: syvverktyget-server (port $PORT, 127.0.0.1)"
tmp="$(mktemp)"
sed -e "s|@USER@|$USER_NAME|g" -e "s|@REPO@|$REPO|g" -e "s|@PORT@|$PORT|g" -e "s|@NODE@|$NODE|g" \
  "$HERE/syvverktyget-server.service" > "$tmp"
sudo install -m 0644 "$tmp" /etc/systemd/system/syvverktyget-server.service
rm -f "$tmp"
sudo systemctl daemon-reload
sudo systemctl enable --now syvverktyget-server.service
sleep 2
if curl -fsS "http://127.0.0.1:$PORT/healthz" >/dev/null 2>&1; then
  say "Servern svarar på http://127.0.0.1:$PORT ✓"
else
  echo "Varning: servern svarade inte än — kolla: sudo systemctl status syvverktyget-server" >&2
fi

# --- 3) Kiosk som systemd USER-tjänst ---
if [ "$INSTALL_KIOSK" -eq 1 ]; then
  say "Installerar kiosk-autostart (systemd user)"
  chmod +x "$HERE/kiosk.sh" "$HERE"/*.sh 2>/dev/null || true
  # Skapa kiosk.env från exemplet och fyll i vald port/broker (maskinspecifikt,
  # checkas aldrig in — se .gitignore).
  if [ ! -f "$HERE/kiosk.env" ]; then
    cp "$HERE/kiosk.env.example" "$HERE/kiosk.env"
    {
      echo ""
      echo "# --- satt av install.sh ---"
      echo "WEB_PORT=$PORT"
      [ -n "$BROKER" ] && echo "BROKER_URL=$BROKER"
    } >> "$HERE/kiosk.env"
  fi
  mkdir -p "$HOME/.config/systemd/user"
  sed -e "s|@REPO@|$REPO|g" \
    "$HERE/syvverktyget-kiosk.service" > "$HOME/.config/systemd/user/syvverktyget-kiosk.service"
  systemctl --user daemon-reload
  systemctl --user enable syvverktyget-kiosk.service || true
  sudo loginctl enable-linger "$USER_NAME" || true
  say "Kiosk installerad. Startar automatiskt när den grafiska sessionen loggar in."
  echo "Justera skärm/broker/ljud i: $HERE/kiosk.env"
  echo "Starta nu (om du redan är inloggad grafiskt):  systemctl --user start syvverktyget-kiosk"
fi

say "Klart."
cat <<EOF

Nästa steg / bra att veta:
  • Grafisk autologin krävs för att kiosken ska starta av sig själv (se INSTALL-NUC.md).
  • Enklaste facilitator-vägen (ingen terminal): install.sh --server-only, sedan
        bash deploy/nuc/install-launcher.sh   → skrivbordsikon "Starta SYV-verktyget".
  • Starta om kiosken utan omstart av datorn:  bash deploy/nuc/restart.sh
  • Loggar:  sudo journalctl -u syvverktyget-server -f
             systemctl --user status syvverktyget-kiosk
             ~/.syvverktyget-kiosk/kiosk.log   (start via ikon/start.sh)
EOF
