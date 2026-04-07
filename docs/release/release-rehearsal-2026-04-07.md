# Combined Release Rehearsal (2026-04-07)

Purpose: prove both release tracks can be exercised end to end before launch.

## Web track (`release/web`)

- Branch/commit: `release/web` @ `274752d`.
- Smoke: Playwright flow (`npm run test:e2e -- --grep "base 6-player game flow stays visible and interactive"`) run locally on the release branch build; both specs passed on 2026-04-07.
- Supporting artifacts: CI run [#24096091338](https://github.com/Panacota96/loupgarous/actions/runs/24096091338) (rehearsal branch) exercised the same smoke, publishing a Pages-ready bundle ([`web-dist`](https://github.com/Panacota96/loupgarous/actions/artifacts/6311982660)) and the Playwright report ([`playwright-report`](https://github.com/Panacota96/loupgarous/actions/artifacts/6311990652)).
- Outcome: release/web snapshot builds cleanly and the live smoke flow passes against the production build.

## Mobile track (`release/mobile`)

- Branch/commit: `release/mobile` @ `274752d`.
- Smoke: Android QA workflow run [#24096091366](https://github.com/Panacota96/loupgarous/actions/runs/24096091366) built debug and release variants, then installed and launched the debug APK on an emulator.
- Artifacts: release bundle and APK outputs ([`android-build-artifacts`](https://github.com/Panacota96/loupgarous/actions/artifacts/6312019906)) plus emulator capture set ([`android-emulator-smoke`](https://github.com/Panacota96/loupgarous/actions/artifacts/6312052669)).
- Outcome: internal build is installable and verified to launch via the automated emulator smoke.

## Next steps to ship

- Re-run `deploy-web.yml` on `release/web` when ready to publish, using the same smoke test to validate the live Pages deployment.
- Promote the validated Android bundle from internal to the desired Play track through `android-release.yml` once store credentials are available.
