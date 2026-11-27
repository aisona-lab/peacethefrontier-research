# Experimento H1 — Economía de delegación y fiabilidad compuesta (2026–2036)

- **Hipótesis evaluada (`H1`):** *«Los agentes autónomos reemplazarán las herramientas de apoyo en 5–10 años»*
- **Estado epistemológico:** **Escenario (`v0.2.0`)** — simulación parametrizada (`synthetic=true`), pendiente de calibración empírica real ([`../h1-empirico/PROTOCOL.md`](../h1-empirico/PROTOCOL.md)) y revisión técnica externa (≥ 2 revisores) antes de promover a `v1.0.0`.
- **Working paper y explorable interactivo:** `PTF-WP 3` (`/research/working-papers/de-copilotos-a-agentes-autonomos/#explorable-h1`)
- **Reproducir en 1 clic (Google Colab):** [Abrir `h1_reproducir.ipynb` en Colab](https://colab.research.google.com/github/aisona-lab/peacethefrontier-research/blob/main/experiments/h1-delegacion-autonoma/h1_reproducir.ipynb)
- **Código fuente:** [`model.ts`](./model.ts) (Apache-2.0) · **Tests:** [`model.test.ts`](./model.test.ts) · **Notebook:** [`h1_reproducir.ipynb`](./h1_reproducir.ipynb)
- **Artefactos generados:** `/public/datos/experimentos/h1-delegacion-autonoma/` (CC BY 4.0)

## Formulación matemática

Para un flujo operativo compuesto por $K$ subtareas secuenciales, comparamos dos arquitecturas:

1. **Herramienta de apoyo (copiloto):** una persona supervisa e interviene paso a paso con aceleración $\alpha \in (0,1)$ y coste de revisión unitaria $c_{\text{rev}}$:
   $$C_{\text{copiloto}} = K \cdot \bigl((1 - \alpha)\,c_h + c_{\text{rev}}\bigr)$$

2. **Infraestructura de agente autónomo:** el agente ejecuta la cadena completa con fiabilidad por paso $p(t)$, fiabilidad compuesta $P_{\text{cadena}}(t) = p(t)^K$, tasa de detección de verificador $d_{\text{det}}(t)$, coste de auditoría final $c_{\text{audit}}$ y responsabilidad por fallo no detectado $L$:
   $$\mathbb{E}[C_{\text{agente}}(t)] = c_{\text{cómputo}}(t) + c_{\text{audit}} + \bigl(1 - p(t)^K\bigr)\Bigl(d_{\text{det}}(t)\,c_{\text{rec}} + \bigl(1 - d_{\text{det}}(t)\bigr)L\Bigr)$$

El agente autónomo reemplaza racionalmente al copiloto cuando $\mathbb{E}[C_{\text{agente}}(t)] < C_{\text{copiloto}}$ y el riesgo residual de cola $\bigl(1 - p(t)^K\bigr)\bigl(1 - d_{\text{det}}(t)\bigr) \le \epsilon_{\text{sector}}$.

## Sectores y dimensiones del dataset

- **5 sectores:** `computational-science`, `education-tutoring`, `public-administration`, `health-workflow-admin` (exclusivamente flujos administrativos no clínicos conforme a R10) y `energy-grid-dispatch`.
- **3 regímenes:** `conservative`, `baseline-coevolution`, `verifier-infrastructure`.
- **3.300 filas sintéticas:** 5 sectores × 3 regímenes × 20 semillas (LCG32) × 11 años (2026–2036).

## Reproducción local

```bash
npm test -- experiments/h1-delegacion-autonoma/model.test.ts src/lib/programa/h1-explorable.test.ts
npm run experiments:check
npm run empirical:check
```
