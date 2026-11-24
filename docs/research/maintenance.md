# Research maintenance

Owner: project editorial maintainer. This schedule is a documented responsibility, not a claim that a human review has already occurred. Automation does not infer truth, change model inputs, rewrite articles, open public conclusions or publish drafts.

## Weekly availability report

`.github/workflows/source-links.yml` runs every Monday at 07:23 UTC and supports manual dispatch. It has read-only repository permissions, is independent of deployment, checks source/DOI/existing archive URLs with bounded GET requests and one retry for temporary failures, and uploads JSON/Markdown reports for 90 days. The job summary is the published report; it does not send messages or create issues.

404/410: broken; 401/403/451 and recognised challenge pages: restricted; timeouts, network failures, 429 and 5xx: temporary; empty 2xx or other statuses: manual review. A redirect is recorded, not silently substituted in the source inventory. A 2xx response does not establish accuracy. Infrastructure failures can fail this reporting job but cannot block the independent deployment workflow.

Run locally: `npm run research:links`. Node 24 users behind an environment proxy may need `NODE_USE_ENV_PROXY=1`; never embed proxy credentials in the repository. Output is ignored under `reports/`.

## Monthly editorial check

First working week of each month, starting December 2026:

1. Revisit METR evaluation coverage and maintenance notices; compare independent evaluations, reliability and real deployment evidence.
2. Revisit IEA editions, chip efficiency definitions and electricity supply/emissions assumptions.
3. Review occupational exposure, causal productivity/adoption studies and evidence on actual employment/wages; separate vendor reports and preprints.
4. Check official legislation, operative dates, amendments, court/enforcement decisions and treaty registers. A policy overview is not a substitute for the legal text.
5. Record queries, dates, competing findings and exclusions in the search log. Attach exact passages/tables and observation periods to changed claims. Update both languages together and document corrections.
6. Change `revisado` only after substantive claim verification; set `investigadoHasta` only after completing the search scope it purports to describe. Publication and observation dates remain separate.

## Quarterly full inventory review

First working week of February, May, August and November, starting February 2027: inspect every source's bibliographic details, edition, stable link, correction/retraction notices and newer relevant publications. Follow DOI/publisher version histories where available. Record inaccessible and inconclusive results explicitly. Keep foundational/historical editions and their IDs; add a new source record when a materially new edition is used. Add archive links only when an existing relevant archive has been verified.

## Review gate

Resolve the outstanding items in README before describing the entire inventory as verified. Check claim-level support and bilingual numerical/qualification parity, run the required repository checks, review previews on keyboard/mobile and both themes, and use draft pull requests. Changes to equations, publication and removal of draft/noindex exclusions need separate authorization. Refreshing the generated claim index is not approval or evidence verification.
