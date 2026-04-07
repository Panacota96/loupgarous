# Google Play Internal Readiness (2026-04-07)

- Build under test: `main` @ `061dfb0`.
- CI smoke: Android QA run [#24097457715](https://github.com/Panacota96/loupgarous/actions/runs/24097457715) succeeded (build + emulator smoke).
- Artifacts: build outputs [`android-build-artifacts`](https://github.com/Panacota96/loupgarous/actions/artifacts/6312565845) and smoke captures [`android-emulator-smoke`](https://github.com/Panacota96/loupgarous/actions/artifacts/6312599489).
- Crash/ANR check: the smoke script fails on any `FATAL EXCEPTION` or `ANR` and the run completed cleanly, indicating a crash-free launch.

## Internal validation notes

- Debug APK installed on an API 35 Pixel 7 emulator and cold-launched in ~2.1s; UI dump and screenshot in the smoke artifact show the app in the foreground.
- Use the `android-build-artifacts` bundle for additional sideload installs if human internal testers need to verify on physical hardware.

## Play Console status

- Latest Play upload attempt (`android-release.yml` run [#24098023033](https://github.com/Panacota96/loupgarous/actions/runs/24098023033)) failed immediately because Google Play credentials are not configured on the repository (`GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` and signing secrets missing). No Play Console warnings were returned.
- Action: add the required Play credentials before promoting to internal/closed/production tracks; rerun the workflow to surface any store-side warnings.
