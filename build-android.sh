#!/usr/bin/env bash
# ============================================================
#  Currency Converter - Android build script (macOS / Linux)
#  Prerequisites: Node.js, JDK 17, Android SDK (ANDROID_HOME set).
# ============================================================
set -e
echo "[1/4] Installing web dependencies..."
npm install
echo "[2/4] Building the Angular web app..."
npx ng build --configuration production
echo "[3/4] Syncing web build into the Android project..."
npx cap sync android
echo "[4/4] Building the Android APK..."
( cd android && ./gradlew assembleDebug )
echo
echo "DONE. Installable debug APK:"
echo "  android/app/build/outputs/apk/debug/app-debug.apk"
echo "Install with: adb install -r android/app/build/outputs/apk/debug/app-debug.apk"
