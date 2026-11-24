# Synthetic service continuity — implementation and integration

Task 3 of `docs/superpowers/plans/2026-11-14-research-studio.md`, following `docs/research-studio/design.md`. Artifact version **1.0.0**, manifest format version **1**, release date **2026-11-14**.

This is a small deterministic defensive experiment with abstract service capacity, demand, exogenous unavailability and recovery. It contains no real cybersecurity, network or incident observations, no offensive mechanisms and no trained model. Software tests are not empirical validation or evidence that the dataset is suitable for production training. The original Atlas futures model and research ledger are separate artifacts.

## Files

| File | Purpose |
|---|---|
| `src/lib/studio/resilience.ts` | Pure TypeScript scenario generator, simulator, policies and aggregation; no imports, Astro or browser dependencies |
| `src/lib/studio/resilience.test.ts` | Owned Vitest tests for conservation, determinism, recovery and generated artifact integrity |
| `scripts/generar-resiliencia.ts` | Typed artifact builder and guarded Node CLI |
| `scripts/generar-resiliencia.mjs` | Local esbuild-to-temporary-CJS wrapper following `scripts/research-ledger.mjs` |
| `public/datos/studio/manifest.json` | Stable public integration contract and actual aggregate results |
| `public/datos/studio/continuidad-servicio-v1.csv` | Actual hourly synthetic records: 2,880 rows plus header, 21 columns |
| `public/datos/studio/schema.json` | JSON Schema 2020-12 for a typed CSV row, including bilingual descriptions and units |
| `public/datos/studio/dataset-card.es.md` | Spanish provenance, assumptions, results, limits, reproduction and licence |
| `public/datos/studio/dataset-card.en.md` | Equivalent English dataset card |
| `public/datos/studio/LICENSE-CC-BY-4.0.txt` | Licence notice, attribution, exact artifact scope and binding legal-code link |
| `public/datos/studio/simulator.ts` | Exact downloadable copy of the new standalone simulator, with Apache-2.0 SPDX header |
| `public/datos/studio/LICENSE-Apache-2.0.txt` | Full Apache-2.0 licence copied from `/usr/share/common-licenses/Apache-2.0` |
| `docs/research-studio/simulation.md` | This methodology, integration contract and verification record |

The package scripts expose generation and readonly verification without modifying the original Atlas model. The `.ts` and `.mjs` generator share a basename: **test imports must name `generar-resiliencia.ts` explicitly** so resolution does not execute the CLI wrapper.

## Units, state and timing

Each scenario is 48 intervals of exactly one hour, numbered 0–47; these are not calendar timestamps. Capacity is a count of abstract **slots**. Each available slot can deliver **one service unit per slot-hour**. Demand, served work and unmet work are **service units over that hour**, not capacity stock. Repair budget is **slots/hour**; repairs are **slots**, and accumulated unavailable capacity is **slot-hours**. Slots have no mapping to real equipment, people, requests or traffic.

All slots initially work. Let C be installed slots, U the previous end-of-hour unavailable slots, X the requested new loss in slots, D the arriving service units, R the repair budget in slots/hour, and dt=1 hour. The update order is:

```text
new_loss = min(X, C - U)                 slots
unavailable_during = U + new_loss       slots
available_during = C - unavailable_during
served = min(D, available_during × 1 service_unit/(slot×hour) × dt)
unmet = D - served                     service units
recovered = min(unavailable_during, R × dt)   slots
unavailable_end = unavailable_during - recovered
```

Repairs happen at interval end and benefit the next hour. Repairs never exceed remaining loss or the hourly budget; interruption never removes more surviving capacity than exists. Unmet demand is discarded each hour, with no queue or later repayment. Repair and service have separate abstract resources; no competition, staffing, costs or energy model is assumed. Repeated interruption can merge into an unfinished recovery. `recovered_to_full` counts a transition from positive loss during service to zero loss at interval end; it is not a real incident identifier or MTTR.

Hand-calculated fixture: capacity 10, repair 2 slots/hour, demand 10 each hour and a six-slot loss at hour 0 yield served work `[4,6,8,10]`, end loss `[4,2,0,0]` and repairs `[2,2,2,0]`. With repair 6, service becomes `[4,10,10,10]`; same-hour repair does not erase the first deficit. With capacity 16 and the original repair budget, all four demands are served. Repeated requested losses of 20 against capacity 10 realize only `[10,2]` in the first two hours, because only two repaired slots can be interrupted again.

## Inputs and three policies

Seeds **1–20** each generate a shared demand and requested-interruption series before comparing policies. LCG32 uses `state=(Math.imul(1664525,state)+1013904223)>>>0`, normalized by 2^32, with exactly three draws every hour: demand jitter, interruption draw and loss magnitude. No system random state, wall clock or network input is used.

The daily baseline service-unit table is `[58,56,54,54,58,65,74,83,91,97,102,105,106,104,100,98,97,101,104,99,90,80,70,62]`, repeated for the second day, plus integer jitter −8…+8. Requested loss is an integer 20…45 slots at forced hours 8,24,36 and, for other hours >=4, with probability 0.08. These numbers are deliberate synthetic assumptions, with no empirical calibration. The magnitude draw occurs even without interruption to preserve reproducibility. Realized loss may differ between policies because it is capped by surviving capacity.

| Policy id | ES / EN label | Installed slots | Repair slots/hour |
|---|---|---:|---:|
| `steady` | Recuperación gradual / Steady recovery | 100 | 4 |
| `rapid-recovery` | Recuperación rápida / Rapid recovery | 100 | 12 |
| `extra-capacity` | Capacidad adicional / Extra capacity | 125 | 4 |

These are separate experiments, not allocations from a shared pool. Rapid recovery triples repair budget; extra capacity installs 25% more slots. The experiment does not establish a cost-equivalent ranking. Larger capacity can absorb more realized loss under saturation; raw final unavailable slots must be interpreted alongside installed capacity, served work and availability fractions.

## Recorded outputs

There are **2,880 data rows = 20 seeds × 48 hourly intervals × 3 policies**, ordered by policy, seed and hour. Each policy has 960 rows. The CSV key is `(policy,seed,hour)`, and every row explicitly contains `synthetic=true` and `dataset_version=1.0.0`. UTF-8, comma delimiters, decimal points, unquoted identifier slugs, lowercase booleans, LF endings and no missing values are used. JSON Schema applies after CSV booleans/numbers are parsed to their declared types; `unit` and `description_es` are descriptive schema annotations.

All policies receive total demand **79,981 service units**. These are actual outputs of the checked-in generator:

| Policy | Served units | Unmet units | Served/demand | Capacity availability | Shortage hours | Mean final unavailable slots |
|---|---:|---:|---:|---:|---:|---:|
| `steady` | 54,238 | 25,743 | 67.8136% | 64.8115% | 639 | 37.45 |
| `rapid-recovery` | 73,514 | 6,467 | 91.9143% | 90.5802% | 367 | 3.65 |
| `extra-capacity` | 65,793 | 14,188 | 82.2608% | 70.1575% | 418 | 43.65 |

Pooled `service_ratio` is total served / total demand; zero demand is defined as 1. It is not the unweighted average of hourly ratios. `capacity_availability_ratio` is 1 − unavailable slot-hours / installed slot-hours. The manifest includes definitions and units for every metric. The 48-hour cutoff can censor recovery; final unrecovered capacity remains in the results. No later recovery time, confidence interval or effectiveness outside this distribution is inferred.

CSV size: **239,203 bytes**. SHA-256: `a908171f5c06311190336341c5410b910b3ec020a67ff526ec1831fa3b3dce8f`.

## Stable UI contract

Read **`public/datos/studio/manifest.json`** at build time, or its public URL **`/datos/studio/manifest.json`**. Read existing data rather than importing the Node generator into a page or invoking generation during page rendering. `ContinuityManifest` and `ArtifactFile` interfaces are declared in the generator as documentation; the UI can validate this JSON with its own pure contract.

```ts
{
  manifest_version: 1,
  id: 'ptf-synthetic-service-continuity',
  version: '1.0.0',
  release_date: '2026-11-14',
  title: { es: string, en: string },
  description: { es: string, en: string },
  synthetic: true,
  status: 'synthetic-toy-experiment',
  license: { id: 'CC-BY-4.0', url: string, scope: string, attribution: string },
  code_license: { id: 'Apache-2.0', url: string, path: '/datos/studio/LICENSE-Apache-2.0.txt', scope: string },
  seeds: [1, 2, /* … */ 20],
  experiment: {
    row_count: 2880, hours_per_seed: 48, policy_count: 3, rows_per_policy: 960,
    step_hours: 1, initial_unavailable_slots: 0, service_units_per_slot_hour: 1,
    prng: { algorithm, multiplier, increment, modulus, draws_per_hour },
    input_schedule: string, timing: string[], unmet_demand: string
  },
  policies: [{
    id: string, label: { es: string, en: string },
    capacity_slots: number, recovery_slots_per_hour: number,
    metrics: {
      policy: string, rows: number, scenarios: number,
      total_demand_service_units: number, total_served_service_units: number,
      total_unmet_service_units: number,
      service_ratio: number, capacity_availability_ratio: number,
      shortage_hours: number, recovered_slots: number, fully_recovered_events: number,
      installed_capacity_slot_hours: number, unavailable_slot_hours: number,
      mean_final_unavailable_slots: number
    }
  }],
  files: [{
    role: 'dataset' | 'schema' | 'dataset-card' | 'source-code' | 'license',
    path: string, repository_path: string, sha256: string, bytes: number,
    media_type: string, license: 'CC-BY-4.0' | 'Apache-2.0', language?: 'es' | 'en'
  }],
  metric_definitions: { [metric: string]: { unit: string, description: string } },
  reproduction: { command, check_command, source_files, manifest_checksum },
  limitations: { es: string, en: string }
}
```

`files[].path` is already the absolute public path suitable for a local download link; no `url` property is needed. `repository_path` is the file to read/hash from the repository root. File roles are stable; do not rely on array indexes to choose a file. Dataset cards share a role and have explicit `language`. The manifest lists seven hashed files: dataset, schema, Spanish card, English card, CC BY notice, standalone source and full Apache licence. It intentionally excludes its own bytes from its hash list to avoid self-reference. Digests detect byte changes, not authenticity or empirical validity. All eight outputs, including the manifest, are compared by `--check`. Choose the local code link by `role === 'source-code'`. Both licence files have `role === 'license'`; use their per-file `license` id to distinguish them. The source and Apache licence carry `Apache-2.0`, while the five data/documentation files carry `CC-BY-4.0`.

For bilingual rendering use `policy.label[language]`, `manifest.title[language]` and `manifest.limitations[language]`. Ratios are fractions, so multiply by 100 when displaying percentages. A service ratio must not be presented as detection accuracy or real security reliability.

## Reproduction and scoped verification

From the repository root with its installed Node/dependencies:

```sh
./node_modules/.bin/vitest run src/lib/studio/resilience.test.ts
node scripts/generar-resiliencia.mjs
node scripts/generar-resiliencia.mjs --check
```

The wrapper bundles only its TypeScript entry into a temporary CJS file, runs it with Node, forwards CLI arguments and removes the temporary directory. No global TypeScript loader is required. Generation writes only the eight named files in `public/datos/studio/`; `--check` compares a fresh deterministic bundle to those files without rewriting them and exits nonzero on absence or difference. The standalone source is read from `src/lib/studio/resilience.ts` and copied exactly. The full Apache licence from `/usr/share/common-licenses/Apache-2.0` is embedded verbatim in this new generator so reproduction does not require that operating-system file. `release_date` is the fixed artifact-release date, not a claimed execution timestamp. Intentional future changes to parameters, schema or results require explicit artifact/version review.

Verification record: the 18 initial simulator tests failed against unimplemented behavior (RED), then passed after implementation (GREEN). The generated-artifact test subsequently failed before the builder existed, then passed after implementation and explicit `.ts` import resolution. The new standalone-source test and expanded file contract also failed before the code download existed, then passed. **20 simulator/artifact tests pass**, covering healthy service, zero demand, overload, delayed recovery, repeated oversized interruptions, excess repair budget, zero repair, determinism, shared inputs, all 2,880 rows' conservation/bounds, invalid inputs, hand-computed weighted totals, CSV/schema correspondence, file hashes and per-file licence separation. The downloadable source is compared byte-for-byte with the model module, transpiled and executed in an isolated VM with no project imports to verify the hand-calculated recovery fixture. The generator emits the actual eight files; its `--check` verifies exact reproduction of all eight. Full application validation is recorded separately in [validation.md](validation.md).

## Licence, provenance and interpretation

Only these newly generated synthetic CSV/schema/manifest/cards/CC-BY-notice artifacts are offered under **CC BY 4.0**, with explicit attribution and legal-code link. The new simulator code in `src/lib/studio/resilience.ts` and its identical downloadable copy `public/datos/studio/simulator.ts` are separately offered under **Apache-2.0**, with SPDX header, copyright notice and full licence in `public/datos/studio/LICENSE-Apache-2.0.txt`. The top-level manifest `license` describes the data; `code_license` describes only this new simulator source; each file declares its own licence. Other code, this implementation document, existing repository material, third-party sources, papers and the original futures model retain their applicable terms. This is not a repository relicensing.

Cards state AI assistance without inventing human approval. There are no observations of real people or infrastructure and no external data ingestion. Intended uses are education, reproducibility and exploratory continuity/recovery prototypes. No detector is fitted or evaluated. If someone explores machine learning, splits must group by seed across all policies to avoid leakage of shared scenarios; no validated training split, benchmark or production model is supplied.

The comparison varies repair budget and installed capacity separately. Both parameters are explicit; the results make no equal-cost or universal policy claim.
