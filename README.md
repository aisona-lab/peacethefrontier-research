# Autonomous Agents as the Infrastructure of the Next Decade

**Research Portfolio & Reproducible Simulation Suite · Carlos Nicolás Soto**  
Bilingual (ES/EN) research programme built with Astro 7, strict TypeScript, formal mathematical models, interactive browser explorables, and `SHA-256`-verified artifacts.

- **Web:** [peacethefrontier.com](https://peacethefrontier.com) (`/`, `/research/`, `/research/datos-h1/`, `/predicciones/`, `/sim/`, `/open/`, `/atlas/` and `/en/...`)
- **Epistemic Status & Scope Freeze (`v0.2.0`):** Current numerical outputs for **H1, H2, and H3** come from parameterized simulations (`synthetic=true`), **not observed production data**. All three are graded **Scenario (`v0.2.0`)**. **H2, H3, new papers, new simulators, and Atlas topics are frozen** until **H1** is empirically calibrated with real measurements and audited by ≥ 2 external technical reviewers (enforced by a build-time `v1.0.0` gate in `src/lib/articulos.ts`).
- **Conflict of Interest Disclosure:** Carlos Nicolás Soto builds products with autonomous agents at **aisona-lab** (disclosed on `/sobre/#conflicto` and `/en/about/#conflicto`).

---

## Core Thesis & Three Falsifiable Hypotheses (2026–2036)

> Over the next decade, structural AI transformation will not come from better conversational interfaces, but from agentic loops embedded as operational, institutional, and scientific infrastructure—governed by verification economics (**H1**), multi-agent coordination (**H2**), and verifiable physical oracles (**H3**).

| ID | Status (`v0.2.0`) | Hypothesis | Interactive / Empirical Artifacts | Working Paper |
|---|---|---|---|---|
| **H1** | **Active focus** (Scenario · calibrating) | *Autonomous agents will replace assistive tools within 5–10 years* | [Explorable & Heatmap](https://peacethefrontier.com/research/working-papers/de-copilotos-a-agentes-autonomos/#explorable-h1) · [Open in Google Colab](https://colab.research.google.com/github/aisona-lab/peacethefrontier-research/blob/main/experiments/h1-delegacion-autonoma/h1_reproducir.ipynb) · [`experiments/h1-empirico`](./experiments/h1-empirico/PROTOCOL.md) | `PTF-WP 3 v0.2.0` ([ES](./src/content/articulos/es/de-copilotos-a-agentes-autonomos.mdx) · [EN](./src/content/articulos/en/from-copilots-to-autonomous-agents.mdx)) |
| **H2** | **Frozen** (Scenario) | *Superintelligence is not a technical problem, but a coordination problem* | [`experiments/h2-coordinacion-multiagente`](./experiments/h2-coordinacion-multiagente) (`500` synthetic scenarios) | `PTF-WP 4 v0.2.0` ([ES](./src/content/articulos/es/superinteligencia-como-coordinacion.mdx) · [EN](./src/content/articulos/en/superintelligence-as-coordination.mdx)) |
| **H3** | **Frozen** (Scenario) | *Scientific AI will drive deeper structural change than consumer AI* | [`experiments/h3-ia-cientifica-vs-consumer`](./experiments/h3-ia-cientifica-vs-consumer) (`1,500` synthetic rows) | `PTF-WP 5 v0.2.0` ([ES](./src/content/articulos/es/ia-cientifica-frente-a-ia-consumo.mdx) · [EN](./src/content/articulos/en/scientific-ai-versus-consumer-ai.mdx)) |

Foundational reproducibility and measurement syntheses remain available as **`PTF-WP 1`** (2026 macro-model provenance audit) and **`PTF-WP 2`** (METR task-horizon vs. developer RCT synthesis).

---

## Quick Reproduction & Verification

Requires **Node.js ≥ 22.12** (tested on Node 22 & 24):

```bash
# Install dependencies
npm ci

# Deterministically regenerate & verify SHA-256 checksums for synthetic & empirical artifacts
npm run experiments:check
npm run empirical:check
npm run simulation:check

# Type-checking, unit tests (models, H1 explorable, Brier score, v1.0 gate, WCAG contrast), static build & CSP audit
npm run check
npm test
npm run build
npm run test:csp

# Browser E2E + WCAG 2.2 AA accessibility suite (Playwright + axe-core across ES/EN & light/dark)
npx playwright install --with-deps
npm run test:e2e
```

Or reproduce **H1** in 1 click without installing anything locally:  
👉 **[Open `h1_reproducir.ipynb` in Google Colab](https://colab.research.google.com/github/aisona-lab/peacethefrontier-research/blob/main/experiments/h1-delegacion-autonoma/h1_reproducir.ipynb)**

---

## Repository Structure

```text
├── experiments/
│   ├── h1-delegacion-autonoma/       # H1 compound-reliability model, tests & 1-click Colab notebook
│   ├── h1-empirico/                  # Pre-registered H1 empirical protocol, JSON schema, validator & GitHub PR collector
│   ├── h2-coordinacion-multiagente/  # H2 8-actor strategic game & Goodhart benchmark distortion (frozen)
│   └── h3-ia-cientifica-vs-consumer/ # H3 Amdahl discovery funnels vs. consumer AI (frozen)
├── public/datos/
│   ├── experimentos/                 # Reproducible synthetic CSVs, JSON schemas & SHA-256 manifests (H1–H3)
│   ├── empirico/                     # Observed-only H1 dataset (initialized at 0 rows; synthetic=false) & manifest
│   └── studio/                       # Service-continuity defensive simulator artifacts
├── src/
│   ├── components/                   # Explorable <ptf-h1-explorable>, empirical panel, predictions, review gate, Atlas
│   ├── content/                      # Bilingual MDX working papers (v0.2.0), articles, pages (with COI), topics & sources
│   ├── lib/programa/                 # Hypotheses, bitácora, H1 explorable math, empirical loader & predictions Brier engine
│   └── pages/                        # Static routes including /research/datos-h1/, /predicciones/ & bilingual RSS feeds
├── specs/peacethefrontier/           # Requirements (R1–R24), technical design & verification tasks
└── docs/research/                    # Versioned source-audit & claim provenance ledger
```

---

## Licences & Scope

- **Experiment, explorable & collector code** (`experiments/**` and `src/lib/studio/resilience.ts`): licensed under **Apache-2.0**.
- **Generated synthetic datasets, future observational datasets, JSON schemas & manifests** (`public/datos/**`): licensed under **CC BY 4.0** (attribution to *Carlos Nicolás Soto — Peace The Frontier Research Portfolio*).
- External cited sources and prior repository materials retain their respective terms.
