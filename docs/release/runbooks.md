# Release Runbooks

Operational runbooks for reversing bad releases and shipping emergency fixes. `main` remains the shared integration branch, while `release/web` and `release/mobile` are the branches that ship production artifacts.

## Web rollback

1. Freeze the web track: stop merging into `release/web`, cancel any in-flight `deploy-web.yml` run, and note the incident owner in the release channel.
2. Identify the last known-good commit on `release/web`. Use the previous successful `deploy-web.yml` run or the commit hash attached to the last healthy Pages deployment.
3. Restore the good release on `release/web`.
   - Fast path: re-run `deploy-web.yml` for the known-good commit if the artifact is already correct.
   - Normal path: revert the bad commit on a short-lived branch, open a PR into `release/web`, and merge once reviewed.
4. Validate recovery: confirm the Pages URL loads, HTTPS remains valid, and `npm run test:e2e -- --grep "base 6-player game flow stays visible and interactive"` passes against the live site.
5. Unfreeze `release/web` only after the deployed site is stable and the follow-up fix plan is recorded.

## Mobile rollback

Use when the staged rollout shows crashes, ANRs, or a regression specific to the Android wrapper.

### Stop the active rollout

1. In Google Play Console, halt or pause promotion beyond the current track so no additional users receive the bad build.
2. Leave the halted rollout in place while the replacement build is prepared from `release/mobile`.

### Ship a rollback build

1. Identify the last known-good state on `release/mobile` and the last healthy Play release in the console.
2. Recreate that state on a short-lived branch from `release/mobile` by reverting the bad change or cherry-picking the minimal fix. Do not edit `android/app/build.gradle` to change versions; `android-release.yml` injects `ANDROID_VERSION_CODE` and `ANDROID_VERSION_NAME` at build time.
3. Merge the rollback PR into `release/mobile` so `android-release.yml` builds a fresh AAB for the internal track, then validate the artifact before promoting it to `closed` or `production`.
4. If production already received the bad release, promote the replacement build through Play Console with a small staged rollout first, monitor crashes and ANRs, then continue to 100%.
5. Back-merge the revert or fix into `main` after `release/mobile` is healthy again.

## Emergency hotfixes

Branch from the release branch that owns the live incident so unreleased work on `main` stays out of the fix.

### Web-only emergency

1. Branch from `release/web` as `hotfix/web/<topic>`.
2. Implement the minimal fix and run `npm run lint`, `npm run build`, and `npm run test:e2e` if the incident window allows it.
3. Merge the hotfix into `release/web` first so `deploy-web.yml` ships the fix.
4. Back-merge the same hotfix into `main` after the release branch is stable.

### Mobile-only emergency

1. Branch from `release/mobile` as `hotfix/mobile/<topic>`.
2. Implement the minimal fix, run `npm run lint` and `npm run cap:sync`, and verify the Android wrapper still builds.
3. Merge the hotfix into `release/mobile` first so `android-release.yml` produces the replacement AAB.
4. Back-merge the same hotfix into `main` after the Play rollout is stable.

### Cross-track emergency

1. Start from the branch that is already broken in production, then cherry-pick the same minimal fix onto the other release branch if both tracks are affected.
2. Ship each track from its own release branch: `release/web` through `deploy-web.yml`, `release/mobile` through `android-release.yml` plus the Play promotion flow.
3. Once both tracks are healthy, back-merge the final hotfix commits into `main` so future shared releases keep the fix.
