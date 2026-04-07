# Security Policy

## Supported Versions

This project is maintained on the active release branches and the current integration branch:

- `main`
- `release/web`
- `release/mobile`

Older branches or abandoned feature branches should not be considered supported for security fixes.

## Reporting A Vulnerability

Do not open a public issue for a suspected security vulnerability.

Instead, report it privately to the maintainer:

- Buy Me a Coffee profile: https://buymeacoffee.com/santiagogow
- GitHub profile: https://github.com/Panacota96

When reporting, include:

- a short description of the issue
- affected area or file path
- reproduction steps or proof of concept
- expected impact
- any suggested mitigation if you already have one

## Response Expectations

Best effort triage will usually follow this order:

1. Confirm whether the report is reproducible.
2. Assess impact on the web build, Android wrapper, or release automation.
3. Prepare a fix on the appropriate protected branch or through a tracked internal task.
4. Publish the remediation through the normal release workflow.

## Non-Security Changes

Feature requests, documentation updates, UX improvements, CI adjustments, and normal bugs should be requested through GitHub Issues using the available issue templates in `.github/ISSUE_TEMPLATE/`.
