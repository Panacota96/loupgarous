# Release Runbooks

## Web rollback

1. Identify the last known-good commit on `release/web`.
2. Re-run `deploy-web.yml` for that commit, or revert the bad change and merge the revert into `release/web`.
3. Confirm the Pages URL loads, HTTPS remains valid, and the Playwright smoke test passes.

## Mobile rollback

1. Halt promotion beyond the current Google Play track.
2. Rebuild and upload the last known-good AAB from `release/mobile`.
3. If production already received the bad release, use the Play Console rollback or staged rollout controls.
4. Back-merge the fix or revert into `main` after the mobile branch is healthy again.

## Emergency hotfixes

- Web emergency: branch from `release/web` as `hotfix/web/<topic>`.
- Mobile emergency: branch from `release/mobile` as `hotfix/mobile/<topic>`.
- Merge the hotfix into the affected release branch first, then back-merge into `main`.
