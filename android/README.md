# Android Studio project

Open this `android/` folder directly in Android Studio.

Typical local workflow from the repository root:

```bash
npm install
npm run cap:sync
```

Then return to Android Studio and run the app on an emulator or device.

Notes:
- The Android app loads built assets from `dist/`.
- `local.properties` is local-only and should not be committed.
- If Android Studio prompts for the Android SDK path, let it create `local.properties`.
