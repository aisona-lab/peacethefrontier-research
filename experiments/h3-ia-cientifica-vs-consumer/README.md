# Experimento H3 — La ventaja del oráculo verificable: IA científica frente a IA de consumo

- **Hipótesis evaluada (`H3`):** *«La IA científica cambiará más que la IA consumer»*
- **Working paper asociado:** `PTF-WP 5` (`/research/working-papers/ia-cientifica-frente-a-ia-consumo/`)
- **Código fuente:** [`model.ts`](./model.ts) (Apache-2.0) · **Tests:** [`model.test.ts`](./model.test.ts)
- **Artefactos generados:** `/public/datos/experimentos/h3-ia-cientifica-vs-consumer/` (CC BY 4.0)

## Formulación estructural

El experimento compara dos regímenes económicos y epistémicos a lo largo de 10 años (2026–2035):

1. **IA científica acoplada a oráculos verificables** (`materials-discovery`, `therapeutics-preclinical-triage`, `climate-earth-systems`, `fundamental-physics`), donde la aceleración efectiva del embudo obedece la **Ley de Amdahl del descubrimiento**:
   $$E(t) = \frac{1}{\frac{1 - \beta_{\text{fís}}}{S(t)} + \frac{\beta_{\text{fís}}}{V(t)}}$$
   siendo $S(t)$ la aceleración *in-silico*, $V(t)$ el escalado de validación experimental y $\beta_{\text{fís}}$ la fracción inicial del ciclo ocupada por validación física o clínica. Los hallazgos validados acumulan capital de conocimiento no rival.

2. **IA de consumo sujeta a presupuesto fijo de atención** (`consumer-assistant`, `digital-media`), gobernada por saturación cóncava de atención humana y erosión competitiva de rentas.

> **Alcance R10:** `therapeutics-preclinical-triage` modela únicamente tasas abstractas de transición de etapas y tiempos de validación estadística; no representa moléculas, patógenos ni rutas de síntesis.

## Dimensiones y reproducción

- **1.500 filas sintéticas:** 6 dominios × 10 años × 25 semillas (LCG32).

```bash
npm test -- experiments/h3-ia-cientifica-vs-consumer/model.test.ts
npm run experiments:check
```
