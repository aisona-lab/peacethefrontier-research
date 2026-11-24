# Autonomous Agents as the Infrastructure of the Next Decade

**Research Portfolio & Reproducible Simulation Suite · Carlos Nicolás Soto**  
Bilingual (ES/EN) independent research programme built with Astro 7, strict TypeScript, formal mathematical models, and `SHA-256`-verified synthetic datasets.

- **Web:** [peacethefrontier.com](https://peacethefrontier.com) (`/`, `/research/`, `/sim/`, `/open/`, `/atlas/` and `/en/...`)
- **Methodology:** Graded four-tier evidence system (`consensus`, `emerging`, `speculative`, `scenario`), separated authorial viewpoint, explicit falsifiability criteria, and strict sensitive-content safeguards (`R10`).

---

## Core Thesis & Three Falsifiable Hypotheses (2026–2036)

> Over the next decade, structural AI transformation will not come from better conversational interfaces, but from agentic loops embedded as operational, institutional, and scientific infrastructure—governed by verification economics (**H1**), multi-agent coordination (**H2**), and verifiable physical oracles (**H3**).

| ID | Hypothesis | Natural Subtopics | Reproducible Experiment | Working Paper |
|---|---|---|---|---|
| **H1** | *Autonomous agents will replace assistive tools within 5–10 years* | Science, Health (admin), Energy, Education, Government | [`experiments/h1-delegacion-autonoma`](./experiments/h1-delegacion-autonoma) (`3,300` rows) | `PTF-WP 3` ([ES](./src/content/articulos/es/de-copilotos-a-agentes-autonomos.mdx) · [EN](./src/content/articulos/en/from-copilots-to-autonomous-agents.mdx)) |
| **H2** | *Superintelligence is not a technical problem, but a coordination problem* | Multi-agent, Governance, Safety, Benchmarks | [`experiments/h2-coordinacion-multiagente`](./experiments/h2-coordinacion-multiagente) (`500` scenarios) | `PTF-WP 4` ([ES](./src/content/articulos/es/superinteligencia-como-coordinacion.mdx) · [EN](./src/content/articulos/en/superintelligence-as-coordination.mdx)) |
| **H3** | *Scientific AI will drive deeper structural change than consumer AI* | Materials discovery, Therapeutics triage (R10), Climate, Physics | [`experiments/h3-ia-cientifica-vs-consumer`](./experiments/h3-ia-cientifica-vs-consumer) (`1,500` rows) | `PTF-WP 5` ([ES](./src/content/articulos/es/ia-cientifica-frente-a-ia-consumo.mdx) · [EN](./src/content/articulos/en/scientific-ai-versus-consumer-ai.mdx)) |

Foundational reproducibility and measurement syntheses remain available as **`PTF-WP 1`** (2026 macro-model provenance audit) and **`PTF-WP 2`** (METR task-horizon vs. developer RCT synthesis).

---

## Quick Reproduction & Verification

Requires **Node.js ≥ 22.12** (tested on Node 22 & 24):

```bash
# Install dependencies
npm ci

# Deterministically regenerate & verify SHA-256 checksums for H1, H2, H3 and resilience artifacts
npm run experiments:check
npm run simulation:check

# Type-checking, unit tests (models + editorial parity + WCAG contrast), static build & strict CSP audit
npm run check
npm test
npm run build
npm run test:csp

# Browser E2E + WCAG 2.2 AA accessibility suite (Playwright + axe-core across ES/EN & light/dark)
npx playwright install --with-deps
npm run test:e2e

# Scaffold a new bilingual working paper + experiment skeleton
npm run research:new -- --slug nueva-prueba --en-slug new-test --hipotesis H1 --numero 6
```

---

## Repository Structure

```text
├── experiments/
│   ├── h1-delegacion-autonoma/       # Compound reliability & verification-cost model + tests
│   ├── h2-coordinacion-multiagente/  # 8-actor strategic game & Goodhart benchmark distortion + tests
│   └── h3-ia-cientifica-vs-consumer/ # Amdahl discovery funnels vs. attention-saturated consumer AI + tests
├── public/datos/
│   ├── experimentos/                 # Reproducible CSVs, JSON schemas & SHA-256 manifests (H1–H3)
│   └── studio/                       # Service-continuity defensive simulator artifacts
├── src/
│   ├── components/                   # Portfolio UI, reproducibility cards, Atlas & Futures islands
│   ├── content/                      # Bilingual MDX working papers, articles, pages, topics & sources
│   ├── lib/programa/                 # Typed hypotheses (H1–H3) & active research log (bitácora)
│   └── pages/                        # Static routes + bilingual RSS 2.0 feeds (/rss.xml, /en/rss.xml)
├── specs/peacethefrontier/           # Requirements, technical design & verification tasks
└── docs/research/                    # Versioned source-audit & claim provenance ledger
```

---

## Licences & Scope

- **Experiment & simulator code** (`experiments/*/model.ts` and `src/lib/studio/resilience.ts`): licensed under **Apache-2.0**.
- **Generated synthetic datasets, JSON schemas & manifests** (`public/datos/experimentos/` and `public/datos/studio/`): licensed under **CC BY 4.0** (attribution to *Carlos Nicolás Soto — Peace The Frontier Research Portfolio*).
- External cited sources and prior repository materials retain their respective terms.
