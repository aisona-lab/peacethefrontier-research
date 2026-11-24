# Editorial research refresh — 13 November 2026

This is a **targeted editorial review**, not a systematic review, a popularity ranking, or a claim that all research available through today has been verified. New reviews remain bilingual drafts. Nothing in this branch authorizes publication or changes to model equations.

## Evidence trail

- `source-audit.json`: outcome for all **56 original sources and 7 additions**, including availability, edition issues, publication metadata, passages read and unresolved verification.
- `passages.json`: short excerpts from **43 sources actually read**, with locators, observation periods and applicability limits. An excerpt is not an endorsement of an entire source.
- `claim-index.json`: **540 claim/context units** covering all seven article pairs, 17 introductions, historical timeline, decision contexts/effects, scenario narratives, current-position rubric, parameters and calibration targets. File hashes detect drift. Candidate supporting passages are linked by ID; automatic indexing does not establish that a passage supports every sentence.
- `model-comparison.json` and `.csv`: before/after parameters, complete CSV hashes and 432 numerical comparisons at 2035, 2050 and 2100 across four futures.
- `search-log.md`: actual searches, cutoff and exclusions.
- `corrections.md`: material changes and unresolved discrepancies.
- `maintenance.md`: weekly, monthly and quarterly responsibilities.

Run `npm run research:snapshot` to capture changes to the claim inventory **after** editorial work. It never modifies `passages.json`, `source-audit.json`, articles or model inputs, and it never upgrades a verification result. Recheck claims whose text changes; do not treat regenerated hashes as review approval.

## Verification boundaries

The source-link run checked 67 URLs (including DOI resolvers): 53 reachable, 6 restricted, 8 temporary failures; no confirmed 404/410. The original retrieval run and the later Node link checker are separate observations, so statuses can differ. A successful status may still be an empty page or a login/challenge. Reports are generated under `reports/` and uploaded by the separate workflow.

Outstanding substantive work includes the detailed XPT probability table, operative EU amendment text and country-level treaty status, original papers whose publishers were inaccessible, the exact historical Energy Institute workbook, and source-wide corrections/retractions screening. The inventory records these as unresolved, **not passed**. Some passages support dates or abstracts only. New reviews describe their limits and remain drafts for editorial review; they do not bear a completed global literature-search cutoff.

The seven bilingual article pairs have matching source inventories, publication/review dates and editorial states. Four new pairs each contain approximately 1,500–2,500 words per language. Independent editorial assessment of interpretation and translation is still required before publication.
