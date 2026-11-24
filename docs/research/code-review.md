# Code review — 14 November 2026

An independent read-only reviewer examined source schema/rendering, editorial validators, the evidence snapshot and weekly link-check maintenance against the implementation plan. The review did not assess external factual completeness or publication readiness.

Five findings were reproduced and fixed:

1. The March 2025 METR source displayed as verified despite a pending ledger entry. It now displays pending; a regression requires verified source records to have reviewed passages in the audit.
2. Source YAML, curated passages and the audit were omitted from drift detection. All three are now fingerprinted alongside content and model files (31 inputs total).
3. Date coercion accepted YAML null as an epoch access date. The schema now accepts a nonempty string or an actual Date before coercing, rejecting null/empty/numeric values.
4. The citation regex counted MDX comments and code as visible citations. Validation now walks parsed MDX JSX elements; comments, inline code and fenced examples do not satisfy citation requirements.
5. Snapshot capture date was fixed to the research date. Capture date now uses the actual run date; the substantive research review date is retained separately.

The reviewer rechecked all fixes, reported no remaining actionable findings within that scope, and independently ran 24 targeted regressions and three link-check tests. The reviewer also reproduced the 540-entry inventory in memory and checked all fingerprints. No files were changed by the reviewer.

UI/browser behavior, full build, live workflow/network execution, model mechanics and external scientific/legal/retraction verification were declined as outside that review. Browser/build checks and numerical comparison are documented separately in `validation.md` and `model-audit.md`; the external research limitations remain in README and source-audit.json.
