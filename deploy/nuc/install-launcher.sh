#!/usr/bin/env bash
# Lägger två dubbelklicks-ikoner på skrivbordet OCH i appmenyn, så stationen kan
# startas/startas om utan terminal:
#     Starta SYV-verktyget      -> start.sh
#     Starta om SYV-verktyget   -> restart.sh
# Kör på NUC:en som vanlig användare (inte sudo):
#     bash deploy/nuc/install-launcher.sh
# Funkar på Ubuntu/GNOME och Linux Mint/Cinnamon (Nemo). Säker att köra om.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
chmod +x "$HERE"/*.sh

apps="$HOME/.local/share/applications"
mkdir -p "$apps"
desktop_dir="$(xdg-user-dir DESKTOP 2>/dev/null || echo "$HOME/Desktop")"

problems=0

# install_one <mall.desktop> <skript.sh> <installerat-namn.desktop>
install_one() {
  local template="$1" script="$2" name="$3" tmp esc
  tmp="$(mktemp)"
  esc="$(printf '%s' "$HERE/$script" | sed -e 's/[&|\\]/\\&/g')"
  sed "s|@EXEC@|bash \"$esc\"|g" "$HERE/$template" > "$tmp"
  install -m 0755 "$tmp" "$apps/$name"
  if [ -d "$desktop_dir" ]; then
    install -m 0755 "$tmp" "$desktop_dir/$name"
    if command -v gio >/dev/null 2>&1; then
      gio set "$desktop_dir/$name" metadata::trusted true 2>/dev/null || {
        echo "  ! kunde inte markera $name som betrodd (gio). Högerklicka ikonen →" >&2
        echo "    'Tillåt start' / 'Allow launching'." >&2
        problems=$((problems + 1))
      }
    fi
    echo "  ok  $desktop_dir/$name"
  else
    echo "  ok  (inget skrivbord hittat) bara i appmenyn: $apps/$name"
  fi
  rm -f "$tmp"
}

echo "Installerar ikoner ..."
install_one syvverktyget.desktop          start.sh    syvverktyget.desktop
install_one syvverktyget-restart.desktop  restart.sh  syvverktyget-restart.desktop
install_one syvverktyget-update.desktop   update.sh   syvverktyget-update.desktop

update-desktop-database "$apps" 2>/dev/null || true

echo
echo "Klart. På skrivbordet finns nu:  Starta SYV-verktyget  |  Starta om SYV-verktyget  |  Uppdatera SYV-verktyget"
echo "Avsluta appen med dess ✕-knapp, eller 'Starta om SYV-verktyget'."
if [ "$problems" -gt 0 ]; then
  echo
  echo "OBS: $problems anmärkning(ar) — högerklicka ikonen och tillåt start om den visar 'untrusted'." >&2
fi
