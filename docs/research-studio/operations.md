# Operation and activation

Default `npm run build` is the complete path-based preview: main Studio, `/atlas/`, `/research/`, `/sim/`, `/open/`, and EN equivalents. Old topic, article, timeline, paths, futures and CSV routes remain served. No undeployed subdomain is required for that mode.

`npm run build:spaces` creates five isolated static outputs. Optional arguments select profiles, e.g. `npm run build:spaces -- research`. `PTF_SURFACE` chooses the home and `PTF_MULTISITE=1` activates host-aware links/canonicals in each build. Every profile contains its local assets and dataset exports. The postprocessor copies canonical namespace pages to their public paths, emits cross-space/legacy 301 redirects, and writes canonical-only sitemaps and host-specific robots files. Draft working papers remain noindex and absent from sitemaps.

| Profile | Cloudflare config | Public home |
|---|---|---|
| Studio | deploy/wrangler-studio.jsonc | https://peacethefrontier.com/ |
| Atlas | deploy/wrangler-atlas.jsonc | https://atlas.peacethefrontier.com/ |
| Research | deploy/wrangler-research.jsonc | https://research.peacethefrontier.com/ |
| Sim | deploy/wrangler-sim.jsonc | https://sim.peacethefrontier.com/ |
| Open | deploy/wrangler-open.jsonc | https://open.peacethefrontier.com/ |

These are prepared configurations, **not evidence that DNS/account activation has occurred**. The primary profile retains the existing worker and main/www/beta domains. New spaces use separate worker names. The existing game remains separate at play.peacethefrontier.com.

## Activation sequence

After reviewing and merging the Studio implementation, verify the Cloudflare account/token can attach the intended custom domains; reconcile any existing DNS/worker associations in that account. Set repository variable `PTF_MULTISITE=1`. Then manually run “Activate Research Studio domains”, on main with the explicit activation input enabled. It runs verification, builds all profiles, deploys Atlas/Research/Sim/Open, and deploys the primary Studio last. No workflow creates newsletter accounts or Hugging Face organisations.

The normal main deployment honours the same repository variable, rebuilding and deploying all five profiles while it is enabled. Without that variable it retains the progressive, path-based deployment. Do not activate domains without this persistent setting and then expect later main pushes to preserve a five-domain deployment automatically.

Credentials are entered only through service/repository settings, never committed. `CLOUDFLARE_API_TOKEN` is the existing deployment secret; custom-domain operations may need additional account permissions. Current session has neither live Cloudflare activation evidence nor working GitHub API access. No DNS or deployment change was executed as part of preparing this branch.

Optional public build settings: `PTF_CONTACT_EMAIL` (validated email) and `PTF_HF_URL` (a confirmed HTTPS huggingface.co profile/organisation URL). Without them, contact uses the real project GitHub channel and the UI states Hugging Face publication is pending. No identity or model upload is fabricated. Newsletter remains the last phase per the user's clarification.

These optional values are read from the build process environment (`process.env`). Export them before a local build. For automated builds, explicitly map confirmed repository variables into the workflow's build-step environment; merely creating a GitHub variable or copying `.env.example` does not inject it into that process. Do not enter credentials in these public settings.

## Reproduction and editorial operations

`npm run simulation:generate` regenerates the versioned toy dataset; `npm run simulation:check` verifies it without writing. Its cards describe methods, units, assumptions and licence scopes. The simulator's Apache licence applies only to the new standalone module/copy; data/documentation use CC BY 4.0. Existing code/content/source rights are unchanged.

The two PTF-WP drafts use the existing citation/editorial pipeline with distinct working-paper routes and version metadata. Their approval, independent factual review and later publication remain human tasks. Earlier unresolved source checks remain in docs/research; a technically passing profile is not editorial approval.

## Deployment serialization and stale revisions

Both manual activation and main CI use the same workflow-level main concurrency group, `CI-refs/heads/main`. The existing CI/main group is intentionally preserved: an older path-based CI run already in flight must finish before activation starts, and neither workflow may interleave its five-worker sequence with the other. Do not rename the CI workflow/group without draining old runs and updating both definitions.

Immediately before each Wrangler publication, `scripts/verificar-revision.mjs` compares the immutable `GITHUB_SHA` being deployed with the live `refs/heads/main` reported by the configured Git remote. It fails closed on a mismatch, missing SHA or failed lookup. This uses normal read-only Git access, not the blocked GitHub API. If main advances during preparation or between space deployments, later publications stop and the primary Studio is not overwritten by that stale run. A later current-main run can deploy the full set. This serializes configured workflows; it does not govern manual deployments performed outside them.
