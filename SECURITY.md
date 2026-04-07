# Security Policy

## Supported Versions

Security fixes are tracked against the currently maintained branches:

- `main`
- `release/web`
- `release/mobile`

Older release snapshots, stale forks, and abandoned feature branches should not be considered supported.

## Reporting A Vulnerability

Do not open a public issue for a suspected security vulnerability.

Instead, contact the maintainer privately through GitHub and request a confidential reporting channel:

- GitHub profile: https://github.com/Panacota96

When possible, include:

- a short summary of the issue
- affected area, branch, or file path
- reproduction steps or proof of concept
- impact and exploitation assumptions
- any mitigation ideas you already validated

## Response Expectations

Best-effort triage will usually follow this order:

1. Confirm whether the report is reproducible.
2. Assess impact on the web build, Android wrapper, or release automation.
3. Prepare a remediation plan and patch on the appropriate release path.
4. Publish the fix through the normal protected-branch workflow.

## Non-Security Changes

Feature requests, documentation updates, UX improvements, CI adjustments, and standard bug reports should go through GitHub Issues using the templates in `.github/ISSUE_TEMPLATE/`.
