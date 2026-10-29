#!/usr/bin/env bash
# STARTA OM-KNAPPEN — stäng kioskfönstret och starta rent, utan att starta om
# datorn. Mål för ikonen "Starta om SYV-verktyget".
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROFILE_DIR="$HOME/.syvverktyget-kiosk"

notify() { command -v notify-send >/dev/null 2>&1 && notify-send "SYV-verktyget" "$1" || true; }

echo "Stänger ev. körande fönster ..."
# Om kiosken körs som systemd user-tjänst: starta om den. Annars döda processen.
if systemctl --user is-active --quiet syvverktyget-kiosk 2>/dev/null; then
  systemctl --user restart syvverktyget-kiosk
  notify "Startar om ..."
  echo "Startade om via systemd user-tjänsten."
  exit 0
fi

pkill -f "$PROFILE_DIR/profile" 2>/dev/null || true
sleep 2
notify "Startar om ..."
exec "$HERE/start.sh"
