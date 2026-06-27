# Currency Converter → Android app with a daily 10am rate notification

This turns the existing Angular app into a real, installable Android app that
shows your converter **and** posts a notification every day at a time you choose
(default **10:00**) with live exchange rates for the currency pairs you pick.

The rates in the notification are **fetched live in the background at the scheduled
time** by native Android code — the app does not need to be open.

---

## 1. What was added

**Native Android (background notification):**
- `RateNotifierPlugin.java` – bridge the app's settings screen calls into.
- `AlarmScheduler.java` – schedules a daily alarm at your chosen time.
- `RateAlarmReceiver.java` – fires at that time, fetches live rates, posts the
  notification, then reschedules for the next day.
- `BootReceiver.java` – re-arms the alarm after a phone reboot or app update.
- `RateFetcher.java` / `NotificationHelper.java` – fetch rates and build the notification.
- `AndroidManifest.xml` – permissions (INTERNET, POST_NOTIFICATIONS,
  RECEIVE_BOOT_COMPLETED, WAKE_LOCK) and the two receivers.
- `MainActivity.java` – registers the plugin.

**Web app (Angular):**
- `notification.service.ts` – typed wrapper around the native plugin.
- A new **"🔔 Daily Rate Notification"** panel in the converter: on/off toggle,
  time picker, an add/remove list of currency pairs, **Save**, and **Test now**.

**Config:** `capacitor.config.ts` now runs the **bundled** app (offline), instead
of loading the old website.

---

## 2. Prerequisites (one-time)

- **Node.js** (18 or newer).
- **JDK 17** – required by the Android Gradle Plugin. (`java -version` should say 17.)
- **Android SDK** – easiest is to install **Android Studio**, which bundles the
  SDK and a JDK 17. Then set the environment variable `ANDROID_HOME` to the SDK
  path (e.g. `C:\Users\you\AppData\Local\Android\Sdk`).

> This APK could not be compiled in the assistant's sandbox because Google's
> Android SDK and Maven servers are firewalled there. Building on your machine,
> which can reach them, works normally.

---

## 3. Build the APK

From the project folder, just run:

**Windows:** `build-android.cmd`
**macOS / Linux:** `./build-android.sh`

That runs all four steps: `npm install` → `ng build` → `cap sync android` →
`gradlew assembleDebug`.

Result (installable):
`android/app/build/outputs/apk/debug/app-debug.apk`

Or run the steps manually:
```
npm install
npx ng build --configuration production
npx cap sync android
cd android
gradlew.bat assembleDebug      # Windows  (use ./gradlew on mac/linux)
```

### Install on your phone
- Enable **Developer options → USB debugging**, connect by USB, then:
  `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`
- Or copy the `.apk` to the phone and tap it (allow "install from this source").

---

## 4. Using the daily notification

1. Open the app, scroll down, tap **🔔 Daily Rate Notification**.
2. Turn the toggle **on**.
3. Set the **time** (default 10:00).
4. Add the pairs you want, e.g. `USD → INR`, `GBP → INR`. Type a code in each box
   and tap **+ Add**. Remove a pair with the ✕.
5. Tap **Save**. When asked, **allow** the notification permission.
6. Tap **Test now** to see a sample notification immediately.

You'll then get one notification each day at your chosen time, e.g.:
```
💱 Daily Exchange Rates
1 USD = 83.50 INR
1 GBP = 105.20 INR
```

---

## 5. Notes & caveats

- **Timing is approximate.** It uses a battery-friendly "allow-while-idle" alarm,
  so in deep sleep it can fire a few minutes late. This avoids the restricted
  "exact alarm" permissions that Google Play discourages.
- **Aggressive battery savers** (Xiaomi/MIUI, Oppo, Samsung, etc.) can delay or
  block background alarms. If notifications don't arrive, set the app to
  "Unrestricted / Don't optimise" in the phone's battery settings.
- **No internet at the scheduled time** → that day's notification is skipped
  (it does not show stale numbers). The next day's attempt is unaffected.
- Rates come from the free `open.er-api.com` API (same source the app already used).

---

## 6. Optional: signed RELEASE APK

The debug APK above is fine for personal use. For a release build you must add a
signing config. A keystore (`android.keystore`) already exists in the project.
Add this to `android/app/build.gradle` inside `android { ... }`:

```gradle
signingConfigs {
    release {
        storeFile file('../../android.keystore')
        storePassword System.getenv('KS_PASS')
        keyAlias 'android'
        keyPassword System.getenv('KS_PASS')
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
    }
}
```
Then: `cd android && gradlew.bat assembleRelease`
(APK: `android/app/build/outputs/apk/release/app-release.apk`).
