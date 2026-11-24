# Research Studio implementation design — 14 November 2026

Source: user-supplied `Peace_The_Frontier_Research_Studio_Plan.docx`, dated 13 November. The user's request is to create/merge the earlier research-refresh PR, then implement the document. The document supplies product requirements; its publication recommendations, speculative costs and claims about future outputs are not evidence that those actions or outputs already exist.

The earlier branch is fully reviewed, tested and pushed at `29b775d`. Its PR creation/merge remains blocked: the managed proxy denies api.github.com (not allowed), and gh reports invalid authentication. No direct push to main will substitute for a PR. New implementation is isolated on `feat/research-studio`, based on that reviewed tree; it can advance independently while access is repaired. No merge or deployment is claimed.

## Product and implementation choices

Keep Astro, static output, the current design tokens, ES/EN parity, CSP and existing Atlas routes. Introduce a clear Research Studio homepage and separate local previews at `/atlas/`, `/research/`, `/sim/`, `/open/` and their `/en/` equivalents. The Atlas landing reuses its current components, 17 topics, four scale bands, four featured reviews and futures experience. Studio navigation connects the five areas without removing existing section links.

Prepare five static deployment profiles in the same repository, with primary-domain Studio and atlas/research/sim/open subdomains. Each profile chooses its home, canonical/hreflang origin, sitemap and redirects; shared assets remain local. Legacy Atlas paths on the primary domain redirect to equivalent Atlas paths only when the subdomain profiles are deliberately deployed. Default preview/build remains path based, so undeployed domains do not make the local product unusable. DNS/account activation is a separate external operation requiring working service access.

Add `working-paper` publication metadata to the existing article collection. Two bilingual draft papers use the standard Question → Method → Findings → Limitations → Sources structure, AI-assistance declaration, version and correction history. Research routes own these papers; original article URLs and draft safeguards remain. No systematic-review claim or human approval is invented.

Add a small original, defensive service-continuity simulator: abstract capacity, demand, exogenous availability interruptions and recovery policies. Publish reproducible CSV, schema, manifest/checksums and data cards locally. Clearly label every row synthetic, state units/seed/assumptions, and distinguish this toy experiment from the existing macro futures model or a validated cybersecurity environment. It supports resilience/detection/recovery prototyping; no attack procedures or production-training claims.

Open lists actual local artifacts with per-artifact licence and limitations. New synthetic data uses CC BY 4.0 as recommended by the brief; third-party sources and existing material retain their own terms. Do not relicense the entire repository. Hugging Face publication/account creation remains pending a confirmed destination and credentials; no fictitious organisation/model is displayed. Contact uses the actual project GitHub channel until an email is confirmed. Director: Carlos Nicolás Soto, already named on the site. Newsletter is explicitly deferred to the last stage by the user's clarification.

The 90-day roadmap and financing material distinguish proposals from completed work. Document cost ranges as unverified planning assumptions and correct totals; do not claim vendor quotations, sponsors, grants, revenue or paid memberships exist.

## Deliverables and gates

1. Typed surface/routes/canonical configuration, publication metadata and regressions.
2. Studio/Atlas/Research/Sim/Open pages, methodology/about/contact updates, two bilingual papers, transparent empty states.
3. Defensive simulation, actual outputs and Open data cards.
4. Multi-domain build/deployment profiles, redirects/sitemaps, maintenance/runbooks and corrected budget/roadmap.
5. Full types/unit/build/CSP/browser/accessibility/Lighthouse validation and independent code review; draft delivery. Newsletter last, when provider/contact is defined.

Current research verification limits from the earlier ledger persist. New writing cites that evidence with its original dates; technical checks do not supply editorial sign-off. Preserve the original versioned research ledger and model equations/inputs. New Studio evidence/experiment records are separate artifacts.
