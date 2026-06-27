@echo off
setlocal enableextensions

REM One-click build for the TWA Android package (Bubblewrap)
REM - Builds Angular production bundle
REM - Runs Bubblewrap build (will prompt for keystore passwords)
REM - Renames outputs to CurrencyConverter.apk / CurrencyConverter.aab

cd /d "%~dp0"
echo.
echo === Building Angular (production) ===
call npx.cmd ng build --configuration=production
if errorlevel 1 (
  echo.
  echo Build failed during Angular build.
  exit /b 1
)

echo.
echo === Verifying assetlinks.json included in dist ===
if not exist "dist\currency-converter\.well-known\assetlinks.json" (
  echo.
  echo ERROR: dist\currency-converter\.well-known\assetlinks.json not found.
  echo Make sure angular.json includes src/.well-known in assets.
  exit /b 1
)

echo.
echo === Building Android (Bubblewrap) ===
call npx.cmd --yes @bubblewrap/cli build
if errorlevel 1 (
  echo.
  echo Build failed during Bubblewrap.
  exit /b 1
)

echo.
echo === Renaming outputs ===
if exist "CurrencyConverter.apk" del /f /q "CurrencyConverter.apk"
if exist "CurrencyConverter.aab" del /f /q "CurrencyConverter.aab"

if exist "app-release-signed.apk" ren "app-release-signed.apk" "CurrencyConverter.apk"
if exist "app-release-bundle.aab" ren "app-release-bundle.aab" "CurrencyConverter.aab"

echo.
echo Done.
if exist "CurrencyConverter.apk" echo APK: %CD%\CurrencyConverter.apk
if exist "CurrencyConverter.aab" echo AAB: %CD%\CurrencyConverter.aab
echo.
pause
