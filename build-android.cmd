@echo off
REM ============================================================
REM  Currency Converter - Android build script (Windows)
REM  Produces an installable APK with the daily-rate notification.
REM  Prerequisites: Node.js, JDK 17, and Android SDK
REM  (installing Android Studio gives you the SDK + JDK 17).
REM ============================================================
setlocal

echo [1/4] Installing web dependencies...
call npm install || goto :err

echo [2/4] Building the Angular web app...
call npx ng build --configuration production || goto :err

echo [3/4] Syncing web build into the Android project...
call npx cap sync android || goto :err

echo [4/4] Building the Android APK...
cd android
call gradlew.bat assembleDebug || goto :err
cd ..

echo.
echo ============================================================
echo  DONE. Installable debug APK:
echo    android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo  Install on a phone (USB debugging on) with:
echo    adb install -r android\app\build\outputs\apk\debug\app-debug.apk
echo  or copy the APK to the phone and tap it.
echo.
echo  For a signed RELEASE APK see ANDROID_BUILD_GUIDE.md
echo ============================================================
goto :eof

:err
echo.
echo BUILD FAILED. See the error above. Common fixes:
echo  - Install JDK 17 and set JAVA_HOME to it
echo  - Install Android SDK (Android Studio) and set ANDROID_HOME
exit /b 1
