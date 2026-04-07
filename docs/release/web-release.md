# Web Release Workflow

## Hosting target

- GitHub Pages is the deployment target.
- A repository variable named `PAGES_CUSTOM_DOMAIN` controls the production hostname.
- If `PAGES_CUSTOM_DOMAIN` is set, the workflow emits a `CNAME` file and deploys with root-relative paths.
- If `PAGES_CUSTOM_DOMAIN` is empty, the workflow falls back to the repository Pages path for preview validation.

## DNS and HTTPS

1. Create the final DNS record at your registrar:
   - apex domain: `A`/`AAAA` records for GitHub Pages
   - subdomain: `CNAME` to `<owner>.github.io`
2. Set the repository variable `PAGES_CUSTOM_DOMAIN` to the final hostname.
3. Configure the same hostname in the GitHub Pages settings UI.
4. Wait for GitHub Pages to issue the TLS certificate and enforce HTTPS.

## Deployment flow

1. Merge a pull request into `release/web`.
2. `deploy-web.yml` computes release metadata and builds the Vite app.
3. The workflow deploys the artifact to Pages through `actions/deploy-pages`.
4. The live deployment is validated by the Playwright smoke flow against the deployed URL.

## Rollback

- Re-run `deploy-web.yml` on the last known-good commit, or revert the bad commit on `release/web`.
- If DNS or TLS is the problem, keep `release/web` frozen until the custom domain is healthy again.
- Use the runbook in [`runbooks.md`](./runbooks.md) for emergency steps.

## Production endpoint verification (2026-04-07)

- Target URL: `https://panacota96.github.io/loupgarous/` (Pages fallback; `PAGES_CUSTOM_DOMAIN` is currently unset).
- DNS/HTTPS: External check returned HTTP 200 over TLS with no mixed-content warnings.
- Mixed content guard: `npm run build` followed by `rg "http://" dist` shows only SVG namespace strings—no runtime assets load over HTTP.
- Public reachability: Page responds without authentication via the Pages fallback URL.
- Re-run: After setting `PAGES_CUSTOM_DOMAIN`, re-verify with `curl -I https://<domain>` and re-run `rg "http://" dist` after a fresh `npm run build`.
