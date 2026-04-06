# Android Studio setup with Capacitor

This project already includes a Capacitor Android wrapper. The web app remains the source of truth, and the `android/` folder is the Android Studio project root.

## Prerequisites
- Node 18+ and npm installed
- Android Studio with Android SDK + an emulator or a USB‑debuggable device
- JDK 21 available to Android Studio / Gradle

## One-time setup
1) Install dependencies
```bash
npm install
```

2) Build and sync the Android wrapper
```bash
npm run cap:sync
```

This command does two things:
- builds the web app into `dist/`
- copies the built files into `android/app/src/main/assets/public`

## Open and run in Android Studio
1) Open the existing Android Studio project in the `android/` folder.
2) Let Gradle sync. If prompted, install missing SDK components.
3) If the SDK path is missing, let Android Studio create `android/local.properties`, or create it yourself with:
```properties
sdk.dir=C:\\Users\\YOUR_USER\\AppData\\Local\\Android\\Sdk
```
4) Pick an emulator or a plugged-in device in the Studio toolbar.
5) Press Run. Android Studio will build and install the app.

## Rebuild after web changes
Any time you change the web app:
```bash
npm run cap:sync
```
Then re-run from Android Studio.

The Android app consumes built files from `dist/`. It does not run against `npm run dev`.

## Notes
- App id: `com.panacota96.loupgarous`
- Android Studio project root: `android/`
- Web assets folder: `dist/` (managed by Vite build)
- Local SDK configuration file: `android/local.properties`
- `android/local.properties` is local-only and should not be committed
- Helpful scripts:
  - `npm run build`
  - `npm run cap:sync`
  - `npm run cap:open:android`
