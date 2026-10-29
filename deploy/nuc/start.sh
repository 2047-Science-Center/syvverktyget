#!/usr/bin/env bash
# STARTKNAPPEN — starta SYV-verktyget i kiosk från skrivbordet (ingen terminal).
# Mål för ikonen "Starta SYV-verktyget". Säker att dubbelklicka:
#   - kör redan      → gör inget
#   - hänger/halvt   → städar och startar rent
# Servern (systemd-tjänsten syvverktyget-server) måste svara, annars tydligt fel.
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Ladda port ur kiosk.env om satt.
WEB_PORT="8791"
if [ -f "$HERE/kiosk.env" ]; then
  v="$(tr -d '\r' < "$HERE/kiosk.env" | sed -n 's/^WEB_PORT=//p' | tail -1)"
  [ -n "$v" ] && WEB_PORT="$v"
fi
URL_BASE="http://127.0.0.1:$WEB_PORT"
PROFILE_DIR="$HOME/.syvverktyget-kiosk"
LOG_FILE="$PROFILE_DIR/kiosk.log"
mkdir -p "$PROFILE_DIR"

notify() { command -v notify-send >/dev/null 2>&1 && notify-send "SYV-verktyget" "$1" || true; }

if pgrep -f "$PROFILE_DIR/profile" >/dev/null 2>&1; then
  notify "Är redan igång. Hänger något? Använd 'Starta om SYV-verktyget'."
  echo "SYV-verktyget kör redan."
  exit 0
fi

echo "Väntar på servern ($URL_BASE/healthz) ..."
ok=0
for _ in $(seq 1 40); do
  if curl -fsS "$URL_BASE/healthz" >/dev/null 2>&1; then ok=1; break; fi
  sleep 1
done
if [ "$ok" -ne 1 ]; then
  notify "FEL: servern svarar inte på $URL_BASE. Se INSTALL-NUC.md."
  echo "FEL: $URL_BASE/healthz svarar inte. Kolla:  sudo systemctl status syvverktyget-server" >&2
  echo "$(date '+%F %T') start.sh: servern svarade inte på $URL_BASE/healthz" >>"$LOG_FILE" 2>/dev/null || true
  [ -t 1 ] && read -rp "Tryck Enter för att stänga..."
  exit 1
fi

notify "Startar SYV-verktyget ..."
echo "Startar ... (logg: $LOG_FILE)"
nohup "$HERE/kiosk.sh" >>"$LOG_FILE" 2>&1 &
echo "Igång."
