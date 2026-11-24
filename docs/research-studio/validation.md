# Research Studio validation — 14 November 2026

Branch: `feat/research-studio`, based on research-refresh `29b775d`. This record covers implementation and local artifacts. It does not approve editorial publication or claim live service activation.

## Executed checks

| Check | Result |
|---|---|
| `npm run check` | Passed: zero errors, warnings or hints |
| `npm test` | Passed: 321 Vitest tests across 35 files and three Node link-check tests |
| `npm run simulation:check` | Passed: all eight artifacts reproduce exactly, 2,880 rows, three policies |
| `npm run build` | Passed: 87 HTML pages and 87 social images |
| `npm run test:csp` | Passed: all inline blocks hashed across 87 pages |
| Full Playwright / Axe suite | Passed: 767 tests, nine existing conditional skips, all four projects (5.7 minutes) |
| `npm run build:spaces` | Passed: all five final profiles; CSP across 440 HTML files, Spanish/English homes, canonicals, language alternatives and sitemaps checked |
| Lighthouse | Passed on 15 URLs with existing budgets; performance 99–100, accessibility 100, best practices 96 |
| Independent review | No Critical defects; Important deployment race and localized state defect addressed; see code-review.md |
| `git diff --check` | Passed |

The source-freeze browser pass exposed a genuine 320 px overflow in the new provenance paper (long Git/CSV strings and SHA-256 table cells). Article text now wraps those tokens; the citation grid is bounded. Opening the panel exposed an additional Axe keyboard-access finding for horizontally scrollable BibTeX; it now soft-wraps without changing copied text. The regression checks both translations at 320 px, an open citation panel, no document/BibTeX overflow and Axe. A direct rendered-page check reports viewport/document width 320/320 and table/citation width 288/288. The corrected 87-page build and CSP audit passed, followed by the focused four-project regression and the full 767-test browser suite.

Browser coverage includes Chromium, Firefox, WebKit and the mobile project; both languages, themes, reduced motion, new-space navigation, all 17 Atlas topics, draft metadata/language alternatives/sitemap exclusions, downloadable bytes/hashes and WCAG Axe checks. Existing model/export/browser regressions remain enabled. Automated accessibility checks complement the rendered screenshots and navigation tests; they do not constitute a complete assistive-technology audit.

## Built domain profiles

Each profile generated 87 original pages and 87 social images before canonical aliases were copied. The CSP column includes those copied HTML files. The sitemap and redirect counts come from the completed build report, independently checked against the actual files. Both home languages have the intended space heading, canonical and language alternatives. No working paper appears in a sitemap.

| Profile | HTML audited by CSP | Indexed URLs | Redirect rules |
|---|---:|---:|---:|
| Studio | 88 | 8 | 79 |
| Atlas | 87 | 54 | 19 |
| Research | 91 | 2 | 85 |
| Sim | 87 | 2 | 85 |
| Open | 87 | 2 | 85 |

These are generated-file checks. Live DNS, TLS, Cloudflare routing and HTTP redirects still require actual account activation and service validation.

## Lighthouse results

All 15 configured URL runs completed and passed the configured assertions. Maximum measured LCP was 1,575 ms, CLS 0.000943 and TBT 0 ms. Indexable pages scored SEO 100. The existing draft article and new draft working paper scored SEO 66 solely because of their intentional `noindex` (`is-crawlable`); their applicable individual SEO checks passed. No performance/accessibility threshold or Axe rule was lowered or disabled.

[validation-results.json](validation-results.json) contains per-route scores/metrics, profile inspections, artifact/test counts and independently rechecked macro CSV hashes. Raw local Lighthouse reports and command logs remain in the execution workspace; the compact versioned record avoids committing generated browser reports.

## Preserved model and evidence

There is no Studio diff to `docs/research/`, the complete `src/lib/futuros/` directory or `src/content/fuentes.yaml` (checked against 29b775d). Independent SHA-256 checks of the four newly built futures CSVs match the preserved ledger:

| Future | CSV SHA-256 |
|---|---|
| pausa | `fe90732d5187523f8a5a45917cd4e7d1c2d93e7ecc461ba732536e07aa0c013b` |
| frontera-en-paz | `96425d6f360f0ac397d028437416e34aace5cc72ac36e14e6417a72df8b8bca8` |
| carrera | `2ad7197e7a37bb90beb32a4969af73f6a91ee394edec8bcc9a4f1b671eba3a6a` |
| fractura | `d774b6d15de786296afb5e39f8ebf3579d2e44842b778f1261c4b85b99e753fa` |

The new simulator is separate. Its tests cover conservation/units, delayed and bounded recovery, zero demand/repair, overload, invalid inputs, deterministic/shared scenarios, aggregate calculations, schema/CSV agreement, file hashes and licence separation. The standalone source is byte-identical to its module and runs independently of project imports.

## Local environment and practical limits

Node 24.19; Playwright browsers and missing shared libraries were installed in workspace-owned directories. Browser host-requirement validation was skipped because the system linker cache does not list those user-owned libraries; actual Chromium, Firefox and WebKit processes ran. No host-wide sandbox change was made.

The managed network blocks Fontsource's API, so Astro used its configured fallback fonts. Local browser/rendering and Lighthouse results cover that rendering; production-font appearance and performance still require confirmation where the font provider is reachable. No production font settings or performance budgets were lowered to conceal the restriction.

At environment revision 2, `api.github.com` is absent from the enforced allowed-host policy. API requests fail with proxy CONNECT 403 and `gh` cannot validate its authentication. Git transport works, but the preceding research-refresh PR/merge has not occurred. No direct main push substitutes for the requested PR workflow. No live Cloudflare DNS/deployment, Hugging Face account/upload, newsletter service, paid subscription or model training was performed.

Both new bilingual papers remain versioned drafts, with human editorial review pending. The earlier source verification limits remain in the research ledger. Dataset tests establish deterministic software behavior, not production defensive effectiveness, detection accuracy or training suitability. Newsletter remains the final deferred phase at the user's request; confirmed HF/contact settings and actual service activation remain separate operational items.
