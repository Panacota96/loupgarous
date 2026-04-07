# Release incident & rollback runbooks

Operational runbooks for reversing bad releases and shipping emergency fixes. The web app (Vite) is the source of truth; the Android wrapper ships the same built bundle via Google Play.

## Web rollback (production)
1) **Freeze deploys**: pause the production pipeline/auto-deploy job so nothing new ships while you roll back.
2) **Pick the last good build**: identify the previous production tag/commit (for example `git tag --list "web-*" | tail -5` or the commit hash from the last deploy).
3) **Redeploy the good build**
   - Fast path: re-run the deploy on the known-good tag/commit so the host serves the prior artifact.
   - If the bad change is isolated, `git revert <sha>` on `main` and trigger the normal deploy; keep the revert commit until a forward-fix is ready.
4) **Validate**: hard-refresh the site, start a quick 6-player game flow, and confirm no blank screen or navigation errors. Watch logs/monitoring for a few minutes.
5) **Unfreeze** once the incident is stable and a forward-fix plan exists. Track the follow-up to remove any temporary revert.

## Android rollback & promotion stop
Use when the staged rollout shows crashes/regressions.

### Stop the active rollout
1) Google Play Console → **Release** → the active track (Production/Closed). 
2) Open the active rollout → **Manage rollout** → click **Pause** or **Halt**. This prevents new users from receiving the bad build; existing installs keep working.
3) Leave the rollout at 0% until a replacement build is ready.

### Ship a rollback build
1) Find the last good `versionCode`/`versionName` in Play Console Release history.
2) Check out the matching git tag/commit for that build. Rebuild the same code with a **new** `versionCode` (Play requires monotonic codes): update `versionCode`/`versionName` in `android/app/build.gradle`, then run `npm run build` and `npm run cap:sync` so the Android project pulls the correct web assets.
3) Build a signed bundle in Android Studio from that commit and upload it as a new release to the same track. Set rollout to a small percentage (e.g., 5–10%) and monitor crashes/ANRs; scale up to 100% after stability is confirmed.
4) Close the halted rollout once the rollback build is fully rolled out. Document the rollback in release notes for transparency.

## Emergency hotfix branching (web + Android tracks)
Branch from production to keep unreleased work out of the fix.

1) **Create hotfix branch** from the current production tag/commit: `git checkout -b hotfix/<slug> <prod-tag-or-commit>`.
2) **Develop & verify**: implement the minimal fix, then run `npm run lint && npm run build` (and `npm run test:e2e` if time permits) to avoid regressions.
3) **Web track release**: merge the hotfix branch into `main`, tag the release (e.g., `web-vX.Y.Z-hotfix`), and deploy that tag/commit to production.
4) **Android track release**: cherry-pick the same hotfix onto the Android release branch (or the same hotfix branch if shared), bump `versionCode`/`versionName` in `android/app/build.gradle`, rebuild (`npm run build && npm run cap:sync`), and publish a Play Console hotfix release with an expedited review request if needed.
5) **Back-merge**: once both tracks ship, merge the hotfix branch back into `main` (and any long-lived release branch) so future releases include the fix. Document the incident outcome and the rollback/hotfix steps taken.
