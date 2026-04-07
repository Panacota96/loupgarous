# Android QA Checklist

## CI emulator flow

- `android-qa.yml` builds `assembleDebug`, `bundleRelease`, and `testDebugUnitTest`.
- The emulator smoke step installs the debug APK, launches `com.panacota96.loupgarous/.MainActivity`, captures focus state, UI dump, screenshot, and logcat.
- Smoke artifacts are uploaded for every run.

## Manual pre-release checklist

- Confirm `npm run cap:sync` completed after the last shared web change.
- Confirm the debug APK launches on an emulator and on at least one physical Android device.
- Complete one full game flow: setup, first night, first day vote, second night transition.
- Check that no crash, ANR, or blank-screen event appears in `logcat`.
- Verify app name, icon, splash screen, and package name are correct in the installed build.
- Verify internal testers can install the Play internal-track build.

## Local prerequisites

- Android Studio
- Android SDK platform tools with `adb` on `PATH`
- JDK 21
- Node.js 22 and npm
