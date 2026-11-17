#!/usr/bin/env bash
# Instala la app en un simulador de iPhone, la abre, comprueba que no se cierra y hace capturas.
set -u
APP=$(find app/build/Build/Products -maxdepth 2 -name '*.app' -path '*iphonesimulator*' | head -1)
echo "App: $APP"
UDID=$(xcrun simctl list devices available -j | python3 -c '
import json,sys,re
d=json.load(sys.stdin)["devices"]
c=[]
for rt,devs in d.items():
  if "iOS" not in rt: continue
  v=tuple(int(x) for x in re.findall(r"\d+",rt.split("iOS")[-1]))
  for x in devs:
    if "iPhone" in x["name"]: c.append((("Pro Max" in x["name"]), v, x["name"], x["udid"]))
c.sort()
print(c[-1][3]); print(c[-1][2], c[-1][1], file=sys.stderr)')
echo "Simulador: $UDID"
xcrun simctl boot "$UDID" || true
xcrun simctl bootstatus "$UDID" -b
xcrun simctl status_bar "$UDID" override --time 9:41 --dataNetwork wifi --wifiMode active --wifiBars 3 --cellularMode active --cellularBars 4 --batteryState charged --batteryLevel 100 || true
xcrun simctl install "$UDID" "$APP" || exit 1
xcrun simctl launch "$UDID" es.plenoabierto.app
sleep 30
mkdir -p capturas-ios
xcrun simctl io "$UDID" screenshot capturas-ios/0-inicio.png
ESTADO=0
if xcrun simctl spawn "$UDID" launchctl list | grep -q "UIKitApplication:es.plenoabierto.app"; then
  echo "LA APP SIGUE ABIERTA"
else
  echo "LA APP SE HA CERRADO"; ESTADO=1
fi
echo "===== REGISTRO ====="
xcrun simctl spawn "$UDID" log show --last 3m --style compact --predicate 'process == "PlenoAbierto" AND (messageType == error OR messageType == fault)' 2>/dev/null | tail -60 || true
find ~/Library/Logs/DiagnosticReports -name '*PlenoAbierto*' -exec cat {} \; 2>/dev/null | head -120 || true
if [ $ESTADO -eq 0 ]; then
  i=1
  for r in leyes ley/real-decreto-ley-14-2026-de-9-de-junio-de-medidas-de-promoci vota brujula diputados mas fuentes; do
    xcrun simctl openurl "$UDID" "plenoabierto://$r"; sleep 5
    xcrun simctl io "$UDID" screenshot "capturas-ios/$i-$(echo "$r" | cut -d/ -f1).png"; i=$((i+1))
  done
fi
exit $ESTADO
