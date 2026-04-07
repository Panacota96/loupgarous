# Branching and Release Model

## Branches

- `main`: shared integration branch for all product work.
- `release/web`: protected branch for GitHub Pages deployments.
- `release/mobile`: protected branch for Android QA and Google Play releases.
- `hotfix/web/*`: branch from `release/web`, merge back into `release/web`, then back-merge into `main`.
- `hotfix/mobile/*`: branch from `release/mobile`, merge back into `release/mobile`, then back-merge into `main`.

## Required checks

- `Lint`
- `Web Build`
- `Web E2E`
- `Android Unit Build`

## Protection policy

- No direct pushes to `main`, `release/web`, or `release/mobile`.
- At least one approving review for every pull request.
- Dismiss stale approvals when new commits are pushed.
- Require branches to be up to date before merging.
- Restrict bypass access to repository administrators only when strictly necessary.

## Ownership and routing

- Shared code remains in `src/` and always lands in `main` first.
- `release/web` accepts only merges from `main` or `hotfix/web/*`.
- `release/mobile` accepts only merges from `main` or `hotfix/mobile/*`.
- GitHub labels route work into `platform:web`, `platform:mobile`, `shared`, `ci`, and `release`.

## GitHub environments

- `web-production`: protect live Pages deployments with required reviewers.
- `android-internal`: protect automatic internal-track uploads.
- `android-production`: protect closed-track and production promotions.
