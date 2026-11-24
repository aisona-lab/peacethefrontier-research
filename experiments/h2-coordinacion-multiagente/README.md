# Experimento H2 — Coordinación multi-agente, carrera estratégica y distorsión de benchmarks

- **Hipótesis evaluada (`H2`):** *«La superinteligencia no es un problema técnico sino de coordinación»*
- **Working paper asociado:** `PTF-WP 4` (`/research/working-papers/superinteligencia-como-coordinacion/`)
- **Código fuente:** [`model.ts`](./model.ts) (Apache-2.0) · **Tests:** [`model.test.ts`](./model.test.ts)
- **Artefactos generados:** `/public/datos/experimentos/h2-coordinacion-multiagente/` (CC BY 4.0)

## Diseño del juego repetido

Ocho actores estratégicos ($N = 8$) interactúan durante $T = 40$ rondas bajo cinco niveles de capacidad técnica $C \in \{1, 2, 5, 10, 25\}$. En cada ronda, cada actor reparte su presupuesto unitario $(a_i + s_i + g_i = 1)$ entre explotación de despliegue ($a_i$), margen genuino de seguridad/coordinación ($s_i$) y optimización del proxy de evaluación ($g_i$).

Se comparan cuatro regímenes institucionales:

1. `uncoordinated-race`: equilibrio competitivo donde cada actor internaliza solo una fracción del riesgo sistémico compartido.
2. `static-benchmark-gate`: umbral regulatorio basado en benchmarks fijos cuya fidelidad $\theta(C)$ decae conforme la capacidad supera las pruebas estáticas, incentivando la brecha de Goodhart ($\hat{B}_i - s_i$).
3. `verifiable-audit-commitment`: auditoría adversaria compartida y freno condicional ante incidentes.
4. `adaptive-interoperability`: protocolo de verificación mutua escalable e internalización completa de externalidades.

## Dimensiones y reproducción

- **500 filas sintéticas:** 4 regímenes × 5 niveles de capacidad × 25 semillas (160.000 decisiones agente-ronda agregadas).

```bash
npm test -- experiments/h2-coordinacion-multiagente/model.test.ts
npm run experiments:check
```
