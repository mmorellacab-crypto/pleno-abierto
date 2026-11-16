#!/usr/bin/env bash
# Instala el APK en el emulador, abre la app y comprueba que no se cierra.
set -u
APK=$(find salida -name '*.apk' | head -1)
echo "APK: $APK"
adb install -r "$APK" || exit 1
adb logcat -c
adb shell monkey -p es.plenoabierto.app -c android.intent.category.LAUNCHER 1
sleep 30
adb logcat -d > logcat.txt || true
echo "===== ERRORES ====="
grep -E "FATAL EXCEPTION|AndroidRuntime|ReactNativeJS|SoLoader|Exception|Error" logcat.txt | grep -v chatty | head -200 || true
echo "===== ESTADO ====="
if adb shell pidof es.plenoabierto.app; then
  echo "LA APP SIGUE ABIERTA"
else
  echo "LA APP SE HA CERRADO"
  exit 1
fi
