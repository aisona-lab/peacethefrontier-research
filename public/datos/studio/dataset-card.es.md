# Ficha del conjunto: continuidad de servicio sintética

Versión 1.0.0 · 2026-11-14 · **100% sintético** · Peace The Frontier Research Studio.

## Pregunta y procedencia

¿Cómo cambian el servicio no atendido y la recuperación al variar plazas instaladas o velocidad de reparación? Este artefacto original se genera con código determinista; no incorpora datos de personas, organizaciones, sistemas reales ni fuentes de terceros. Elaborado con asistencia de IA; no se declara aprobación editorial humana ni revisión científica independiente.

## Composición y unidades

2.880 filas = 20 semillas (1–20) × 48 intervalos de una hora × 3 políticas. Una fila es una hora de una política y semilla; la clave es (policy, seed, hour). hour=0…47 es tiempo relativo. synthetic=true aparece en todas las filas. CSV UTF-8, coma, punto decimal, booleanos true/false, salto LF, sin valores ausentes. schema.json describe cada columna, tipo y unidad.

Una plaza entrega una unidad abstracta de servicio por hora. La demanda y el servicio son cantidades durante el intervalo; las plazas son capacidad, no personas, máquinas, bytes ni peticiones reales. Cada escenario empieza con todas las plazas disponibles. La pérdida exógena se limita a las plazas aún disponibles; el servicio usa la capacidad restante; la reparación ocurre al final y beneficia la hora siguiente. La demanda no atendida se descarta, sin cola. No hay topología ni competencia entre reparación y servicio.

## Generación y supuestos

PRNG LCG32: s=(1664525×s+1013904223) mod 2^32; u=s/2^32, con multiplicación entera de 32 bits. Tres extracciones por hora: variación de demanda entera uniforme entre −8 y +8, probabilidad de interrupción y magnitud entera entre 20 y 45 plazas. La demanda usa una tabla diaria de 24 horas definida en resilience.ts. Hay interrupciones obligatorias en las horas 8, 24 y 36, y probabilidad 0,08 en las otras horas desde la 4. La magnitud se extrae incluso sin interrupción, para conservar el orden aleatorio. Cada semilla comparte demanda e interrupciones solicitadas entre políticas; las pérdidas efectivas pueden diferir por saturación. Las tres políticas se ejecutan por separado.

## Resultados efectivamente generados

| Política | Plazas | Reparación (plazas/h) | Servicio (unidades) | No atendido (unidades) | Servicio/demanda | Horas con déficit |
|---|---:|---:|---:|---:|---:|---:|
| steady | 100 | 4 | 54238 | 25743 | 67.81% | 639 |
| rapid-recovery | 100 | 12 | 73514 | 6467 | 91.91% | 367 |
| extra-capacity | 125 | 4 | 65793 | 14188 | 82.26% | 418 |

Cada política tiene 960 filas. La fracción de servicio es servicio total/demanda total; no el promedio de fracciones horarias. Demanda cero da fracción 1. Disponibilidad de capacidad y cumplimiento de demanda son métricas distintas. manifest.json incluye todos los resultados exactos y sus unidades. Las recuperaciones inconclusas al terminar 48 horas permanecen en mean_final_unavailable_slots; no se inventa tiempo de recuperación posterior.

## Uso previsto y límites

Enseñanza, comprobaciones de conservación y prototipos exploratorios de continuidad, detección abstracta y recuperación. No se entrena ni evalúa un detector aquí. Experimento de juguete totalmente sintético, sin calibración empírica ni validación externa. No son datos reales de ciberseguridad, tráfico de red ni incidentes. No representa atacantes ni procedimientos ofensivos. No es un modelo entrenado, un entorno de entrenamiento validado ni evidencia de eficacia en producción. Las políticas usan recursos distintos y no comparan costes equivalentes.

No usar para decisiones operativas, dimensionamiento real, clasificar ataques, validar seguridad ni estimar frecuencias de incidentes. Las semillas son escenarios de una única distribución elegida, no observaciones independientes del mundo; no hay intervalos de confianza ni ranking universal. Recuperación rápida triplica el presupuesto de reparación; capacidad adicional instala 25% más plazas. No se estiman costes, personal ni energía. Si se explora aprendizaje, separar por semilla manteniendo juntas todas sus políticas; dividir filas al azar filtra escenarios compartidos. No existe partición de entrenamiento validada.

## Reproducir e integridad

Desde la raíz: node scripts/generar-resiliencia.mjs. Verificar sin reescribir: node scripts/generar-resiliencia.mjs --check. Se requiere la versión de Node y dependencias del repositorio. El wrapper esbuild local no modifica scripts globales. manifest.json mantiene una versión de formato y de artefacto; contiene rutas públicas/locales, tamaño en bytes y SHA-256 de CSV, esquema, ambas fichas, código descargable y ambas licencias. [simulator.ts](simulator.ts) es una copia exacta del nuevo módulo autónomo resilience.ts, sin dependencias de Astro, navegador ni otros módulos del proyecto. El manifiesto no incluye su propio hash para evitar autorreferencia; no usa reloj ni entradas de red. Los tests documentados en docs/research-studio/simulation.md comprueban determinismo, conservación y casos de recuperación calculados a mano. Son comprobaciones del software, no validación empírica.

## Licencia y cita

Solo los nuevos datos sintéticos y su documentación (CSV, esquema, manifiesto, fichas y aviso CC BY) se ofrecen bajo [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Ver [aviso de datos](LICENSE-CC-BY-4.0.txt) y los términos legales enlazados. Cita: Peace The Frontier Research Studio (2026), Synthetic service continuity, v1.0.0. Al redistribuir los datos, conservar atribución y enlace a la licencia, indicar cambios y no sugerir respaldo.

El nuevo código del simulador se ofrece separadamente bajo **Apache-2.0**: solo src/lib/studio/resilience.ts y su copia descargable [simulator.ts](simulator.ts), con identificador SPDX y [licencia completa](LICENSE-Apache-2.0.txt). Esa licencia no se aplica a los datos sintéticos. Ninguna de estas licencias cambia los términos de otro código, del repositorio, de artículos, de modelos previos ni de fuentes externas.
