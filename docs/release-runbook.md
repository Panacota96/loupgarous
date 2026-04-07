# Release, Incident & Rollback Runbook

This document consolidates operational guidance for releasing, responding to incidents, and rolling back the **Loup-Garous GM Assistant** across both delivery tracks: the hosted web app (PWA) and the Android app distributed via Google Play.

---

## Table of Contents

1. [Web – Rollback Steps](#1-web--rollback-steps)
2. [Android – Rollback & Promotion-Stop Steps](#2-android--rollback--promotion-stop-steps)
3. [Emergency Hotfix Branching](#3-emergency-hotfix-branching)
   - [3a. Web hotfix track](#3a-web-hotfix-track)
   - [3b. Android hotfix track](#3b-android-hotfix-track)

---

## 1. Web – Rollback Steps

The web app is a static Vite build served as a PWA. Rolling back means re-deploying a previously known-good build artifact (or git commit) to the hosting target.

### 1.1 Identify the last good release

```bash
# List recent tags (releases are tagged vX.Y.Z)
git log --oneline --tags --simplify-by-decoration | head -20
```

Confirm the target tag in the GitHub Releases page before proceeding.

### 1.2 Re-deploy from a known-good tag

```bash
# 1. Check out the tag locally
git fetch --tags
git checkout tags/<last-good-tag> -b rollback/<last-good-tag>

# 2. Re-install dependencies pinned to that commit
npm ci

# 3. Rebuild the production artifact
npm run build          # output lands in dist/

# 4. Deploy dist/ to your hosting target (examples below)
```

**Static host (e.g. GitHub Pages / Netlify / Vercel via CLI):**
- GitHub Pages: push the rebuilt `dist/` to the `gh-pages` branch, or trigger the Pages deployment workflow for the rollback commit.
- Netlify: run `netlify deploy --prod --dir dist` with the rollback build, or use the Netlify UI → *Deploys* → select the previous successful deploy → *Publish deploy*.
- Vercel: run `vercel --prod` from the rollback checkout, or use the Vercel dashboard → *Deployments* → select the previous deploy → *Promote to Production*.

### 1.3 Verify the rollback

1. Hard-refresh the PWA in the browser (`Ctrl+Shift+R` / `Cmd+Shift+R`) to bypass the service-worker cache.
2. Check the version indicator or the build hash in the page source / console to confirm the old version is live.
3. Run the smoke-test suite against the live URL:
   ```bash
   BASE_URL=https://<your-domain> npm run test:e2e
   ```
4. Confirm no critical console errors are present.

### 1.4 Communicate status

- Post in the team channel that the rollback is live and share the deployed URL.
- Open a follow-up issue referencing the incident for the post-mortem.

---

## 2. Android – Rollback & Promotion-Stop Steps

The Android app is distributed through Google Play. "Rollback" on Android means either halting a staged rollout before it completes or promoting a previously released APK/AAB to the active track.

### 2.1 Stop an in-progress staged rollout (promotion-stop)

Use this when a bad release is partially rolled out and you want to freeze it before more users receive it.

1. Open the **Google Play Console** → select *Loup-Garous GM Assistant* (`com.panacota96.loupgarous`).
2. Navigate to **Release** → **Production** (or the relevant track: Internal / Alpha / Beta).
3. Locate the active release and click **Manage rollout** → **Halt rollout**.
4. Confirm the halt. Google Play will stop delivering the new version to additional users. Existing installs of the bad version are not automatically downgraded.

### 2.2 Roll back to a previous release on Google Play

Google Play does not offer a one-click "revert" button for production releases. Use one of the following approaches:

#### Option A – Promote a previous release (recommended)

1. In Play Console, go to **Release** → **Production** → **Create new release**.
2. In the *App bundles and APKs* section, click **Add from library**.
3. Select the AAB/APK from the last known-good release (identified by version code).
4. Set the release name and release notes (e.g. "Rollback to vX.Y.Z").
5. Roll out at 10–20 % first, verify, then promote to 100 %.

#### Option B – Build and submit a rollback binary locally

```bash
# 1. Check out the known-good tag
git fetch --tags
git checkout tags/<last-good-tag> -b rollback/android-<last-good-tag>

# 2. Rebuild web assets
npm ci
npm run cap:sync        # builds dist/ and copies into android/

# 3. Open Android Studio, increment versionCode by 1 (Play requires a higher code),
#    then generate a signed release AAB:
#    Build → Generate Signed Bundle / APK → Android App Bundle

# 4. Upload the AAB to Play Console → Internal testing → promote to Production
```

> **Important:** Google Play requires each uploaded binary to have a strictly increasing `versionCode` even for rollbacks. Bump `versionCode` in `android/app/build.gradle` before signing.

### 2.3 Verify the Android rollback

1. Install the rolled-back version on a test device via the Internal Testing track before promoting to Production.
2. Run through the critical game flows: player setup → night phase → day phase → win detection.
3. Confirm the app version shown in *Settings → About* matches the rolled-back release.
4. Monitor the Play Console **Android Vitals** dashboard for crash-rate and ANR improvements.

---

## 3. Emergency Hotfix Branching

Use this procedure when a critical bug is discovered in a released version and must be patched without merging in-progress `main` branch work.

### 3a. Web hotfix track

```
main ──────────●──────────────────────────────► (next feature)
                \
                 ● v1.2.0 (release tag)
                          \
                           ● hotfix/web-1.2.1   ← branch from the release tag
                            |
                            ● fix committed
                            |
                            ● PR → main (merge back)
                            |
                            ● tagged v1.2.1 → deployed
```

**Step-by-step:**

```bash
# 1. Branch from the production tag
git fetch --tags
git checkout -b hotfix/web-<target-version> tags/<production-tag>

# 2. Apply the minimal fix and commit
git add .
git commit -m "fix: <short description> (#<issue>)"

# 3. Tag the hotfix release
git tag -a v<target-version> -m "Hotfix release v<target-version>"

# 4. Build and deploy (same steps as Section 1.2)
npm ci && npm run build
# deploy dist/ to hosting

# 5. Open a PR from hotfix/web-<target-version> → main to merge the fix back
git push origin hotfix/web-<target-version>
# create PR via GitHub
```

### 3b. Android hotfix track

```
main ──────────●──────────────────────────────► (next feature)
                \
                 ● v1.2.0 (release tag)
                          \
                           ● hotfix/android-1.2.1   ← branch from the release tag
                            |
                            ● fix committed
                            |
                            ● PR → main (merge back)
                            |
                            ● tagged v1.2.1 → signed AAB → Play Console
```

**Step-by-step:**

```bash
# 1. Branch from the production tag
git fetch --tags
git checkout -b hotfix/android-<target-version> tags/<production-tag>

# 2. Apply the minimal fix and commit
git add .
git commit -m "fix: <short description> (#<issue>)"

# 3. Bump versionCode (and versionName) in android/app/build.gradle
#    e.g. versionCode 5 → 6, versionName "1.2.1"

# 4. Rebuild web assets and sync with Android
npm ci
npm run cap:sync

# 5. In Android Studio, generate a signed release AAB:
#    Build → Generate Signed Bundle / APK → Android App Bundle

# 6. Upload the AAB to Play Console → Internal Testing, verify, then promote

# 7. Tag the hotfix release
git tag -a v<target-version>-android -m "Android hotfix release v<target-version>"

# 8. Open a PR from hotfix/android-<target-version> → main to merge the fix back
git push origin hotfix/android-<target-version>
# create PR via GitHub
```

### 3c. General rules

| Rule | Detail |
|---|---|
| **Minimal scope** | Commit only the bug fix. Do not pull unrelated changes from `main` into the hotfix branch. |
| **Always merge back** | Every hotfix branch **must** be merged (or cherry-picked) into `main` after release so the fix is not lost in the next regular release. |
| **Separate tags per track** | Tag web releases as `vX.Y.Z` and Android-only hotfixes as `vX.Y.Z-android` to avoid confusion. |
| **Increment versionCode** | Android hotfixes always require a higher `versionCode` than the release being replaced. |
| **Test before promoting** | Always validate a hotfix on the Internal or Alpha track before 100 % production rollout. |

---

## Quick-Reference Checklist

### Incident declared – what to do first

- [ ] Identify the scope: web only, Android only, or both?
- [ ] Stop the Android staged rollout if in progress (Section 2.1).
- [ ] Decide: rollback vs. hotfix?
  - Rollback: revert to previous known-good artifact (Sections 1 & 2).
  - Hotfix: branch, fix, and redeploy (Section 3).
- [ ] Communicate status to the team.
- [ ] Open an incident tracking issue.
- [ ] After resolution: run post-mortem and close the incident issue.
