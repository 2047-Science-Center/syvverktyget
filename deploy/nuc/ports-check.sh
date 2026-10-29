#!/usr/bin/env bash
# FÖR-INSTALL PORTKOLL — kör på NUC:en INNAN install.sh så du ser vad som redan
# lyssnar och kan välja lediga, ovanliga portar (NUC:en kör mycket annat).
#
#   bash deploy/nuc/ports-check.sh              # visar alla lyssnande portar + kollar defaults
#   bash deploy/nuc/ports-check.sh 8791 9341    # kollar specifikt dessa portar
#
# Ingen ändring görs — bara läsning.
set -u

echo "== Alla lyssnande TCP-portar på den här NUC:en (ss -ltnp) =="
if command -v ss >/dev/null 2>&1; then
  ss -ltnp 2>/dev/null || ss -ltn
else
  echo "(ss saknas — faller tillbaka på netstat)"
  netstat -ltnp 2>/dev/null || netstat -ltn
fi

echo
echo "== Portkoll för SYV-verktyget =="
# Default-kandidater: webbserver 8791, mosquitto WS 9341 (båda ovanliga).
# Vanliga portar som SYV INTE ska använda (brukar vara upptagna):
COMMON="80 8080 3000 5173"
CANDIDATES=("$@")
[ "${#CANDIDATES[@]}" -gt 0 ] || CANDIDATES=(8791 9341)

port_busy() {
  if command -v ss >/dev/null 2>&1; then
    ss -ltnH "( sport = :$1 )" 2>/dev/null | grep -q .
  else
    netstat -ltn 2>/dev/null | grep -qE "[:.]$1[[:space:]]"
  fi
}

echo "Vanliga portar (undvik dessa — ofta upptagna):"
for p in $COMMON; do
  if port_busy "$p"; then echo "  $p  UPPTAGEN (som väntat — använd inte)"; else echo "  $p  ledig (men använd ändå en ovanlig port)"; fi
done

echo
echo "SYV-kandidater (ska vara LEDIGA):"
ok=1
for p in "${CANDIDATES[@]}"; do
  if port_busy "$p"; then echo "  $p  UPPTAGEN → välj en annan (install.sh --port <n> / BROKER_URL)"; ok=0; else echo "  $p  ledig ✓"; fi
done

echo
if [ "$ok" -eq 1 ]; then
  echo "Alla kandidat-portar lediga. Kör t.ex.:"
  echo "  deploy/nuc/install.sh --port ${CANDIDATES[0]} --broker ws://localhost:${CANDIDATES[1]:-9341}"
else
  echo "Minst en kandidat-port är upptagen — välj andra ovanliga, lediga portar ur listan ovan."
fi
