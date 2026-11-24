# Validation — 14 November 2026

Research/source review date remains 13 November; this is the implementation validation date. All checks below completed successfully on the final implementation. The additional strict ISO access-date guard was covered by unit/type/build checks; browser behavior is unchanged by that guard.

| Check | Result |
|---|---|
| `npm run check` | 150 files; zero errors, warnings or hints |
| `npm test` | 290 Vitest tests in 29 files, plus three Node link-classifier tests; all passed |
| `npm run build` | 75 HTML pages and 75 social images generated; content/citation validation passed |
| `npm run test:csp` | All inline blocks hashed across 75 pages |
| `npm run test:e2e -- --workers=4` | 679 passed, nine existing conditional skips; Chromium, Firefox, WebKit and iPhone configuration |
| `npx lhci autorun --collect.settings.chromeFlags=--no-sandbox` | All configured assertions passed across ten URLs |
| Model comparisons | 432/432 zero deltas; four complete CSV hashes unchanged |
| `git diff --check` | No whitespace errors |

Lighthouse scores: performance 100, accessibility 100 and best practices 96 for all ten pages; SEO 100 for pages with the SEO budget. The draft article retains noindex and is excluded from the overall SEO-score requirement under the existing configuration. No budgets were lowered.

Browser coverage includes the four featured reviews, their translated routes and existing topic links, keyboard/mobile layouts, both themes, reduced motion, JavaScript disabled, draft labels, hreflang, noindex, sitemap exclusions and existing exports. A pre-existing drag test assumed 120 real frames always fit a short wall-clock period; shared CPU load violated that assumption in WebKit. It now uses Playwright's clock for the same 120-frame input sequence and retains the URL-write/last-value assertions. It passed in all four configurations and in the full suite.

## Environment and practical limits

The managed environment restarted during work. Browser binaries and required Debian libraries were restored to user-owned directories under `/workspace/scratch/`; no system or project security configuration was changed. Firefox uses writable XDG config/cache directories and `MOZ_DISABLE_CONTENT_SANDBOX=1` within the existing managed host sandbox. WebKit's local bundles use the extracted libraries. Host-cache dependency detection was skipped after actual browser launches succeeded, because the libraries are not registered in the system linker cache.

Typical local test environment:

```sh
PLAYWRIGHT_BROWSERS_PATH=/workspace/scratch/atlas-browsers
XDG_CONFIG_HOME=/workspace/scratch/atlas-config
XDG_CACHE_HOME=/workspace/scratch/atlas-cache
PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1
MOZ_DISABLE_CONTENT_SANDBOX=1
ASTRO_TELEMETRY_DISABLED=1
```

These are local environment settings, not repository test-configuration changes. Lighthouse used the downloaded Chromium executable via `CHROME_PATH`.

The Fontsource metadata endpoint was inaccessible in this environment. Astro completed with the configured fallback fonts, so local visual measurements cover that rendering; CI with working font downloads still needs to confirm the intended web-font rendering. External factual/legal/retraction verification remains partial as documented in README; passing technical checks does not clear research for publication. Live GitHub Actions execution was not tested locally.

Local preview: `http://localhost:4321/` while the preview process runs. Review screenshots were saved as `/workspace/scratch/featured-es.png` and `/workspace/scratch/menu-mobile.png`. Generated Lighthouse reports are under `.lighthouseci/` and excluded from Git.
