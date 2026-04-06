# Android testing with Capacitor

This project is wrapped with Capacitor so you can build and run it in Android Studio.

## Prerequisites
- Node 18+ and npm installed
- Android Studio with Android SDK + an emulator or a USB‑debuggable device

## One-time setup
1) Install deps and build web assets
```bash
npm install
npm run build
```

2) Sync Capacitor + Android project (copies `dist/` into the Android app)
```bash
npm run cap:sync
```

## Open and run in Android Studio
1) Open the generated Android project: `npm run cap:open:android`
2) Let Gradle sync. If prompted, install missing SDK components.
3) Pick an emulator or a plugged-in device in the Studio toolbar.
4) Press Run ▶️. Android Studio will build and install the app.

## Rebuild after web changes
Any time you change the web app:
```bash
npm run build
npm run cap:sync
```
Then re-run from Android Studio.

## Notes
- App id: `com.panacota96.loupgarous`
- Web assets folder: `dist/` (managed by Vite build)
