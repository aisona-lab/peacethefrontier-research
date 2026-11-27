# Peace The Frontier: tareas

> Orden de ejecución. Cada tarea indica los requisitos que cubre. Lógica pura con TDD (test primero).
> Una fase termina cuando su **criterio de salida** se cumple en CI.
> Roadmap posterior a la auditoría de 2026: `docs/roadmap-2026.md`.

## Fase 0: Decisiones y migración (bloqueante)
- [ ] T0.1 Responder preguntas abiertas de `requirements.md` §7. ✔ destino del juego: `play.` · pendientes: autoría, IA, tagline.
- [x] T0.2 Inventariar URLs y hosting actual del juego en `peacethefrontier.com`. _(R9)_
- [x] T0.3 Mover el juego a su destino nuevo y verificar que funciona allí. _(R9.1)_

**Salida:** el juego vive en su nuevo destino; lista de URLs antiguas para `_redirects`.

## Fase 1: Base del proyecto
- [x] T1.1 Proyecto Astro 7 + TS estricto + MDX; `git init` local. Repo: aisona-lab/peacethefrontier-atlas. _(NF9)_
- [x] T1.2 CI: `astro check`, Vitest, build, Playwright + axe (Chrome, Firefox, Safari, móvil; claro y oscuro), Lighthouse CI móvil. _(NF1–NF3)_
- [x] T1.3 `_headers` + CSP con hashes. Publicado en Cloudflare Workers: peacethefrontier.com, www y beta (2026-10-03). Falta solo: previews por PR. _(NF6)_
- [x] T1.4 `tokens.css` con `light-dark()`, Spectral + Archivo autoalojadas, temas placa/cianotipo. _(NF8)_
- [x] T1.5 Layout base: cabecera con menú de temas (popover), pie, SEO, JSON-LD, sitemap, 404. _(NF5)_
- [x] T1.6 (añadida) Portada con la regla de escala, índice de temas, páginas `/temas/`, `/temas/<id>/`, `/metodologia/`.

**Salida:** página desplegada en preview con CI en verde y Lighthouse ≥ 95.
Local 2026-10-02: Lighthouse móvil 100/100/100/100 en las 3 páginas medidas; 66 e2e en verde. Falta el deploy.

## Fase 1.5: Bilingüe, referentes y punto de vista (2026-10-02)
- [x] T15.1 Investigación de referentes (`referentes.md`): AI 2027, OWID, Epoch, Pudding, Ciechanowski, Gwern, Distill…
- [x] T15.2 ES/EN: `src/i18n/` (rutas + textos tipados), slugs propios, selector ES/EN, `hreflang`. _(R11)_
- [x] T15.3 Temas P16 Cómputo y chips y P17 Sentido y propósito, con traducción de los 17. _(§3)_
- [x] T15.4 Páginas de texto en MDX por idioma: metodología, sobre, apoyar. _(R12, R17)_
- [x] T15.5 Componentes `PuntoDeVista`, `Citar` (texto + BibTeX), `BotonApoyo`, hoja de impresión. _(R12–R14, R17)_
- [x] T15.6 Auditoría CSP de todas las páginas en CI (`npm run test:csp`): Astro inserta CSS de MDX sin hash.
- [ ] T15.7 El autor reescribe “Sobre el atlas” con su voz (hoy es borrador). _(R12.3)_
- [x] T15.8 Elegir plataforma de apoyo y poner el enlace en `src/lib/sitio.ts`. _(R17)_
- [ ] T15.9 Decidir licencia del contenido. _(R13.3)_

## Fase F: Futuros Paz × Frontera (plan: `futuros-plan.md`)
- [x] TF.1 Modelo, Monte Carlo, eventos y calibración contra fuentes oficiales. _(futuros.md §5)_
- [x] TF.2 Página de cada futuro con panel interactivo y relato en ES/EN. _(F3)_
- [x] TF.3 Página del modelo con ecuaciones, parámetros, calibración y límites. _(F4)_
- [x] TF.4 Matriz en la portada y enlace en la cabecera. _(F1)_
- [ ] TF.5 El autor revisa los ocho relatos antes de publicar.
- [ ] TF.6 Relato escrito en las décadas intermedias. _(futuros.md §11, después)_

## Fase G: Auditoría de datos y ampliación (2026-10-02, rama `feat/fase-g`; ledger `.superpowers/sdd/fase-g/`)
- [x] TG.1 Auditoría de datos y honestidad del modelo: techo de electricidad de la IA, riesgo 0 en 2026, poder en U que parte igual en los cuatro futuros, dato/calibrado/supuesto por parámetro, calibración sobre medianas, URL de fuentes al día, método de sustitución declarado.
- [x] TG.2 Sensibilidad una a una, CSV de cada futuro y "Cómo citar" en futuros. _(R13)_
- [x] TG.3 Cada tema muestra sus indicadores en los cuatro futuros (misma escala) o dice que no hay. _(R1.1)_
- [x] TG.4 Punto de hoy: frontera medida (Epoch AI) y paz estimada con cinco señales con fuente.
- [x] TG.5 Caminos: 11 decisiones 2026–2037 con etiqueta ética derivada de cuatro criterios y efectos visibles. _(R5, versión ligera de T5.1–T5.5)_
- [x] TG.6 Artículos (colección, notas numeradas, R2.4 en el build) y tres artículos ancla ES/EN, marcados como borrador asistido por IA. _(R2, R3, T3.2 parcial)_
- [x] TG.7 Línea del tiempo de 3200 a. C. a 2126 con pares perdido ↔ recuperado, filtro por tema en la URL y los futuros como ramas. _(R4 sin zoom; T4.x)_
- [x] TG.8 Imágenes para redes 1200 × 630 por página; repositorio privado `aisona-lab/peacethefrontier-atlas` con CI y publicación en Cloudflare desde main si existe `CLOUDFLARE_API_TOKEN`.
- [x] TG.9 Juego en `play.peacethefrontier.com` y atlas en `peacethefrontier.com` y `www` (2026-10-03). Las partidas guardadas del juego (localStorage del dominio antiguo) no se traspasan: decisión del autor. Pendiente en el repo del juego: SITE_URL, canonical y og:image.
- [ ] TG.10 El autor revisa los tres artículos ancla, las puntuaciones de paz de hoy y los efectos de los caminos.
- [ ] TG.11 Menores de la revisión final, sin arreglar: marcas solapadas en la vista general de la línea del tiempo (Herculano queda bajo el hormigón romano); las islas de caminos y línea del tiempo borran el `#fragmento` de la URL; `generar-og.mjs` (colisiones de slug, `decodeURIComponent` sin try, `fonts.ready` antes de que carguen, colores en hex); `engines` de Node ≥22.18 (importa `.ts`); claves BibTeX duplicadas entre artículos y temas con el mismo slug; textos de interfaz fuera de `ui.ts` (Calibracion, "a. C."/"BCE"); `Uint16Array` en Monte Carlo con más de 65 535 corridas; `permissions: contents: read` en el CI; enlace de cada tema a `/linea-del-tiempo/?tema=`.
- [x] TG.12 Auditoría de interfaz (2026-10-04): menú móvil con las secciones primero, cabecera con Línea del tiempo y Artículos, caminos con la explicación plegada y resumen final, etiquetas en la barra móvil de los futuros, temas con su tramo de la línea del tiempo y preguntas en la columna derecha; barra de progreso de lectura y transición entre páginas (respetan «reducir movimiento»).

## Fase 2: Modelo de contenido
- [ ] T2.1 Tests de las validaciones cruzadas (fuente oficial obligatoria, pares perdido↔recuperado, recorridos sin ciclos). _(R2.4, R4.5, R5)_
- [ ] T2.2 Esquemas Zod de las 6 colecciones + validaciones cruzadas hasta poner T2.1 en verde. _(R1–R6)_
- [x] T2.3 Cargar los 17 temas (`temas.yaml`) con banda, intro, preguntas y traducción (adelantada). _(R1, §3)_
- [ ] T2.4 Cargar ~30 fuentes semilla: IPCC AR6, OMS, NASA/ESA, EU AI Act, NIST AI RMF, International AI Safety Report, papers clave. _(R3)_

**Salida:** el build falla si se rompe cualquier regla editorial; 15 pilares y fuentes cargados.

## Fase 3: Artículos y pilares
- [ ] T3.1 Componentes: `EvidenciaBadge`, `Nota`, `ListaFuentes`, `MitoVsEvidencia`. _(R2.2, R2.3, R10.3)_
- [ ] T3.2 Páginas `pilares/[id]`, `articulos/[slug]`, `fuentes/`, `metodologia`. _(R1, R2, R3, R10)_
- [ ] T3.3 Tests + `relacionados.ts` (por pilares compartidos). _(R1.2, R8.2)_
- [ ] T3.4 Plantilla de PR con checklist de contenido sensible. _(R10.4)_
- [ ] T3.5 Escribir 1 artículo ancla por tema (17), en ES y EN, cada uno con ≥ 1 fuente oficial o revisada. _(R2, R11)_
- [ ] T3.6 Lectura: notas al margen, ficha de publicación, desplegables, correcciones, apoyo al final. _(R14, R17.1)_

**Salida:** 15 pilares navegables con su artículo ancla, fuentes enlazadas y nivel de evidencia visible.

## Fase 4: Timeline interactivo
- [ ] T4.1 Tests de `escala-tiempo.ts` (tramos, extremos, ida y vuelta) → implementar. _(R4.1)_
- [ ] T4.2 Cargar ~80 eventos: pasado (Sumeria → IA), presente 2026, ≥ 6 pares perdido↔recuperado. _(R4.2, R4.5)_
- [ ] T4.3 `TimelineList.astro` (lista cronológica, sin JS). _(R4.6)_
- [ ] T4.4 `<ptf-timeline>`: SVG, zoom/pan con d3-zoom, clusters, panel `<dialog>`, filtro por pilar. _(R4.3, R4.4)_
- [ ] T4.5 Estado en URL + navegación con teclado. _(R4.6, R4.7)_
- [ ] T4.6 E2E: filtrar por P10, abrir “Mecanismo de Anticitera”, copiar URL y reabrir en el mismo estado.

**Salida:** timeline usable con ratón, táctil, teclado y lector de pantalla; e2e en verde.

## Fase 5: Escenarios y selector de camino ético / no ético
- [ ] T5.1 Tests de `recorrido.ts`: camino válido, opción inválida corta, límites 0–100, atrás, final. _(R5)_
- [ ] T5.2 Implementar `recorrido.ts` hasta verde. _(R5.3, R5.5)_
- [ ] T5.3 Escribir 6 escenarios (3 horizontes × rama ética/no ética del recorrido global). _(R6)_
- [ ] T5.4 Recorrido global “Humanidad 2100” (~8 decisiones) + 1 recorrido por pilar prioritario (P1, P4, P6). _(R5.1, R5.2)_
- [ ] T5.5 `<ptf-recorrido>` + `Indicadores.astro` + vista comparar lado a lado; fallback `<details>`. _(R5.3–R5.6)_
- [ ] T5.6 Ramas de escenarios en la capa futuro del timeline. _(R6.2)_
- [ ] T5.7 Revisión de tono: consecuencias narradas, sin sermón ni premio al camino no ético. _(R5.7)_
- [ ] T5.8 E2E: recorrer camino completo, volver un paso, comparar, compartir URL.

**Salida:** se puede recorrer, comparar y compartir un camino de punta a punta.

## Fase 6: Visuales, búsqueda y pulido
- [ ] T6.1 Hero home: neuronas → constelaciones (Canvas, scroll-driven, reduced-motion estático). _(R7)_
- [ ] T6.2 Visual por pilar en P6, P8, P10 (datasets citados). _(R7.1, R7.3)_
- [ ] T6.3 Pagefind integrado en el build + UI de búsqueda. _(R8.1)_
- [ ] T6.4 Screenshots visuales 320/768/1024/1440 en ambos temas; revisión de overflow 320–1920. _(NF7, NF8)_
- [ ] T6.5 Auditoría a11y manual (teclado, lector de pantalla, contraste). _(NF3)_

**Salida:** presupuestos de rendimiento y a11y en verde en todas las páginas clave.

## Fase 7: Lanzamiento
- [x] T7.1 `_redirects` con las URLs antiguas del juego → destino nuevo (301). _(R9.2)_
- [ ] T7.2 Workflow semanal `lychee` de enlaces rotos (abre issue). _(R3.4)_
- [~] T7.3 Cambiar DNS del apex; verificar HTTPS, redirects, sitemap y Search Console. Hecho el 2026-10-03 salvo Search Console.
- [x] T7.4 Activar Cloudflare Web Analytics. Beacon en `Base.astro` + CSP; dashboard en Analytics & Logs → Web Analytics (referrers, páginas, país). _(NF4)_

**Salida:** `peacethefrontier.com` sirve el sitio de research; el juego sigue accesible; 0 enlaces rotos.

## Fase P: Portafolio de Investigación Original — Infraestructura de Agentes (2026-11-24)
- [x] TP.1 Definir `hipotesis.ts` (`H1`, `H2`, `H3`), `bitacora.ts` y extensión de esquema en `content.config.ts` + validaciones cruzadas en `articulos.ts`. _(R18, R19)_
- [x] TP.2 Implementar los 3 experimentos deterministas en `experiments/` (`h1-delegacion-autonoma`, `h2-coordinacion-multiagente`, `h3-ia-cientifica-vs-consumer`) con tests unitarios y datasets SHA-256 en `public/datos/experimentos/`. _(R19)_
- [x] TP.3 Escribir los 3 working papers originales bilingües (`PTF-WP 3`, `4`, `5`) y actualizar `sobre` y `metodologia` en ES/EN + snapshot del ledger. _(R18, R19, R10)_
- [x] TP.4 Componentes `MatrizHipotesis`, `FichaCodigoDatos`, `BitacoraInvestigacion`, endpoints `/rss.xml` y `/en/rss.xml` y CLI `research:new`. _(R18–R20)_
- [x] TP.5 Publicar el nuevo repositorio principal limpio `aisona-lab/peacethefrontier-research` con `CITATION.cff` y verificar tipos, Vitest, CSP y Playwright + axe. _(R19, NF1–NF8)_

## Fase Q: Credibilidad Científica, Explorable H1 y Gobernanza Empírica (2026-11-26)
- [x] TQ.1 Semana 1: rebajar H1–H3 y PTF-WP 3–5 a `escenario-ficcion` («Escenario») y `v0.2.0`, añadir `AvisoSimulacion.astro`, COI (`aisona-lab`) en `sobre.mdx` y congelar H2/H3. _(R21)_
- [x] TQ.2 Semanas 2–3: implementar `h1-explorable.ts`, `<ptf-h1-explorable>` con sliders, mapa de calor de frontera de inversión, URL compartible y notebook `h1_reproducir.ipynb` en Colab. _(R22)_
- [x] TQ.3 Semanas 4–6 (andamiaje): crear `experiments/h1-empirico/` (protocolo, esquema, validador y recolector GitHub PRs) y panel `/research/datos-h1/` con 0 datos inventados. _(R23.1)_
- [x] TQ.4 Semana 7 y continuo: compuerta en build `v1.0` (`revisoresExternos >= 2` + `calibradoConDatosReales`), `RevisionExterna.astro` y registro `/predicciones/` con Brier score. _(R23.2, R24)_
- [ ] TQ.5 Recolección empírica real (Semanas 4–6) y publicación de `PTF-WP 6 v0.1.0` + revisión externa real (Semana 7). _(Ejecución humana/observacional posterior)_

## Después de v1 (no planificado aún)
Newsletter, audio de los artículos, ediciones temáticas, colaboradores externos, más recorridos por tema.
