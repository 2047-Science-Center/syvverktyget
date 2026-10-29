#!/usr/bin/env bash
# UPPDATERA SYV-VERKTYGET — hämta senaste koden, bygg om och ladda om stationen.
# Mål för ikonen "Uppdatera SYV-verktyget" (körs i en terminal så man ser vad
# som händer och kan skriva sudo-lösenord). Kan köras för hand:
#     bash deploy/nuc/update.sh
#     bash deploy/nuc/update.sh --force   # bygg om även om inget nytt hämtades
#
# Säkert: bygget görs i dist.next och byts in först när det lyckats — misslyckas
# bygget kör appen vidare på den gamla versionen. Bygg-parametrarna (mode/broker/
# station/port) läses ur build.env som install.sh skrev; saknas den används
# samma defaults som guiden (pilot / ws://localhost:9001 / station 0 / 8791).
set -u

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"

FORCE=0
for a in "$@"; do
  case "$a" in
    --force) FORCE=1 ;;
    *) echo "Okänd flagga: $a" >&2; exit 1 ;;
  esac
done

notify() { command -v notify-send >/dev/null 2>&1 && notify-send "SYV-verktyget" "$1" || true; }
pause()  { [ -t 1 ] && read -rp "Tryck Enter för att stänga..."; return 0; }
fail()   { echo; echo "STOPP: $1"; notify "Uppdateringen misslyckades: $1"; pause; exit 1; }

# Bygg-parametrar (install.sh skrev build.env; annars guidens defaults).
MODE=pilot; BROKER=ws://localhost:9001; STATION=0; PORT=8791
if [ -f "$HERE/build.env" ]; then
  # shellcheck disable=SC1090
  . <(tr -d '\r' < "$HERE/build.env")
fi
URL_BASE="http://127.0.0.1:$PORT"
PROFILE_DIR="$HOME/.syvverktyget-kiosk"

cd "$REPO" || fail "Hittar inte repot ($REPO)"
command -v git >/dev/null 2>&1 || fail "git saknas"
command -v npm >/dev/null 2>&1 || fail "npm saknas (installera Node 20+)"

echo "== Hämtar senaste (git pull) =="
BEFORE="$(git rev-parse HEAD 2>/dev/null || echo none)"
if ! git pull --ff-only; then
  echo "git pull misslyckades (inget nät, eller lokala ändringar). Appen körs vidare."
  fail "git pull misslyckades"
fi
AFTER="$(git rev-parse HEAD 2>/dev/null || echo none)"

if [ "$BEFORE" = "$AFTER" ] && [ "$FORCE" = 0 ] && [ -f "$REPO/dist/index.html" ]; then
  echo; echo "Redan senaste versionen ($(git log -1 --format='%h %s' | cut -c1-70))."
  echo "Tvinga ombygge med:  bash deploy/nuc/update.sh --force"
  notify "Redan senaste versionen."
  pause; exit 0
fi

if [ "$FORCE" = 1 ] || [ ! -d "$REPO/node_modules" ] || [ "$BEFORE" != "$AFTER" ]; then
  echo; echo "== Beroenden (npm ci) =="
  npm ci || npm install || fail "npm install misslyckades"
fi

echo; echo "== Bygger ny version (VITE_MODE=$MODE, broker=$BROKER, station=$STATION) =="
rm -rf "$REPO/dist.next" "$REPO/dist.old"
if ! VITE_MODE="$MODE" VITE_BROKER_URL="$BROKER" VITE_STATION_N="$STATION" \
     npm run build -- --outDir dist.next; then
  rm -rf "$REPO/dist.next"
  fail "bygget misslyckades (gamla versionen körs vidare)"
fi
[ -f "$REPO/dist.next/index.html" ] || { rm -rf "$REPO/dist.next"; fail "bygget gav ingen index.html"; }

# Byt in (servern läser dist/ per anrop → ingen driftstopp).
[ -d "$REPO/dist" ] && mv "$REPO/dist" "$REPO/dist.old"
mv "$REPO/dist.next" "$REPO/dist"
rm -rf "$REPO/dist.old"
echo "Ny build på plats."

# Servern servar statiskt och behöver inte startas om för en ny dist/, men gör
# det om serve.mjs själv ändrats (eller --force), så ändringar där tas.
if [ "$FORCE" = 1 ] || git diff --name-only "$BEFORE" "$AFTER" 2>/dev/null | grep -q '^deploy/nuc/serve\.mjs$'; then
  if systemctl cat syvverktyget-server.service >/dev/null 2>&1; then
    echo; echo "== Startar om server-tjänsten (sudo om det frågas) =="
    sudo systemctl restart syvverktyget-server.service || echo "Varning: kunde inte starta om servern." >&2
  fi
fi

echo; echo "== Laddar om stationen =="
for _ in $(seq 1 30); do curl -fsS "$URL_BASE/healthz" >/dev/null 2>&1 && break; sleep 1; done
# Stäng ev. körande fönster och starta rent.
if systemctl --user is-active --quiet syvverktyget-kiosk 2>/dev/null; then
  systemctl --user restart syvverktyget-kiosk
else
  pkill -f "$PROFILE_DIR/profile" 2>/dev/null || true
  sleep 1
  nohup "$HERE/kiosk.sh" >>"$PROFILE_DIR/kiosk.log" 2>&1 &
fi

VER="$(git log -1 --format='%h %s' | cut -c1-70)"
echo; echo "Klart! Uppdaterad: $VER"
notify "Uppdaterad: $VER"
pause
