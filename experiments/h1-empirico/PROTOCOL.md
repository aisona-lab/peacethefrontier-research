# Protocolo Pre-Registrado — Medición Empírica de H1 (Semanas 4–6 → PTF-WP 6 v0.1)

- **Estado actual:** Protocolo pre-registrado (`0` observaciones cargadas; **no se inventa ningún dato**).
- **Destino del dataset:** `public/datos/empirico/h1-observado.csv` + `public/datos/empirico/manifest.json`
- **Panel público de procedencia:** `/research/datos-h1/` (`/en/research/h1-data/`)
- **Objetivo:** Medir empíricamente dos parámetros que hoy son supuestos en `PTF-WP 3 v0.2.0`:
  1. **Tasa real de fallo por paso (`step_failure_rate`)** en tareas ejecutadas por agentes autónomos.
  2. **Coste real de verificación humana (`verification_minutes` y `human_review_ratio`)** necesario para aceptar o descartar una entrega de agente.

## 1. Fuentes admitidas (con procedencia obligatoria fila por fila)

Cada fila del CSV debe declarar `observed=true` y pertenecer a una de dos fuentes auditables:

1. **`open-repo-pr`:** Pull Requests públicos en repositorios open-source con trazabilidad clara de autoría/asistencia de agente (bots/agentes declarados o commits `Co-authored-by`), enlazando obligatoriamente la URL pública exacta del PR (`source_ref`).
2. **`author-agent-log`:** Trazas reales anonimizadas de ejecuciones propias de agentes de Carlos Nicolás Soto (`aisona-lab`), adjuntando el hash `SHA-256` del log sanitizado (`source_ref`) para que cada fila sea auditable sin exponer secretos ni código privado de terceros.

## 2. Definición operativa de variables

| Columna | Definición exacta |
| --- | --- |
| `observed` | Constante booleana `true`. El validador (`npm run empirical:check`) rechaza cualquier fila sintética. |
| `record_id` | Identificador único estable (`OBS-YYYYMM-NNN`). |
| `collected_date` | Fecha ISO (`AAAA-MM-DD`) de registro. |
| `source_type` | `open-repo-pr` o `author-agent-log`. |
| `source_ref` | URL pública HTTPS (para PRs abiertos) o `sha256:<64hex>` (para logs propios anonimizados). |
| `sector` | Uno de los 5 sectores de H1 (`computational-science`, `education-tutoring`, `public-administration`, `health-workflow-admin`, `energy-grid-dispatch`). |
| `chain_steps` | Número de pasos observables de la tarea (subtareas, llamadas de herramienta o commits del agente). |
| `step_failures` | Número de pasos fallidos (checks de CI rojos, tests rotos, errores de compilación o pasos revertidos). |
| `verification_minutes` | Minutos reales empleados por un humano en revisar diffs, ejecutar comprobaciones y corregir antes de aceptar o rechazar. |
| `estimated_manual_minutes` | Tiempo estimado o observado para ejecutar la misma tarea sin agente (cuando exista referencia; vacío si no aplica). |
| `outcome` | `accepted-clean` (aceptado sin cambios humanos), `accepted-with-rework` (aceptado tras intervención humana) o `rejected`. |

## 3. Regla de publicación incondicional y contradicción de H1

- **Cero filtrado post-hoc:** Toda tarea iniciada bajo el protocolo se registra antes de conocer su resultado final (`accepted-clean`, `accepted-with-rework` o `rejected`).
- **Si contradice H1, se publica igual (y en portada):** Si la mediana empírica de `step_failure_rate` o de `verification_minutes` desplaza el año de cruce fuera de la ventana `2026–2036` en el explorable de H1, `PTF-WP 6 v0.1` reportará explícitamente esa refutación parcial o total.

## 4. Recolección y validación

```bash
# Extraer candidatos públicos de un repositorio abierto con GitHub CLI
node experiments/h1-empirico/collect-github-prs.mjs --repo <owner/repo> --limit 30

# Validar esquema, obligatoriedad de procedencia y ausencia de datos sintéticos
npm run empirical:check
```
