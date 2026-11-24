# Roadmap 2026

Estado de la auditoría: 23 de octubre de 2026. Este documento ordena el trabajo nuevo; el historial detallado
permanece en `specs/peacethefrontier/tasks.md`.

## Arquitectura actual

- Astro 7 estático y TypeScript estricto; rutas por archivos, sin backend ni framework cliente.
- Contenido versionado en MDX/YAML: 17 temas, páginas, fuentes, cuatro futuros y artículos ES/EN.
- Vistas compartidas con rutas y textos de interfaz tipados en `src/i18n/`.
- Tokens claro/oscuro en `src/styles/tokens.css`; interacción puntual con Web Components.
- SEO base con canonical, hreflang, OpenGraph, Twitter, sitemap, robots y JSON-LD parcial.
- Vitest, Playwright, axe, CSP y Lighthouse en CI.

## Hallazgos

### P0

No hay un fallo P0 confirmado. La auditoría inicial no pudo ejecutar el proyecto porque faltaban las dependencias
locales; el primer incremento instaló el árbol bloqueado por `package-lock.json` y cerró la validación completa.

### P1

- El modelo llama `dato` a valores de 2026 que el spec describe como interpolados o extrapolados.
- Los artículos necesitan estados editoriales y fecha opcional de corte de los datos.
- La política de fuentes promete DOI y copias archivadas que el esquema aún no guarda.
- La página dice que no hay rastreadores, pero carga analítica de Cloudflare sin cookies.
- Falta la comprobación semanal de enlaces exigida por R3.4.

### P2

- El JSON-LD y los metadatos sociales de artículos necesitan mayor precisión semántica.
- Faltan el bloque reutilizable «Qué sabemos», relacionados y enlaces a parámetros e indicadores.
- Hay deuda menor ya inventariada en `tasks.md`: fragmentos de URL, solapamientos de timeline, BibTeX, tokens y OG.
- `package.json` no define formatter ni lint; no se inventan comandos en las fases de validación.

### P3

Estado del mundo, búsqueda estática, artículos nuevos, historial completo y navegación por fuentes. No se añaden
gráficos ni abstracciones antes de resolver la procedencia de los datos.

## Fases

1. **Frescura editorial.** Estados, revisión, fecha de los datos, autor y evidencia en una ficha compartida.
2. **Semántica del modelo.** Separar observado, estimación actual, supuesto, derivado, proyección y escenario sin
   cambiar ecuaciones ni valores; publicar fecha de referencia, unidad, procedencia y calibración.
3. **Fuentes y confianza.** DOI/archivo opcionales, fichas reutilizables, enlaces rotos y texto de privacidad exacto.
4. **Lectura y conexiones.** «Qué sabemos», relacionados, parámetros, indicadores y SEO semántico.
5. **Ampliación editorial.** Verificar datos recientes antes de actualizar artículos; después evaluar Estado del mundo.

## Criterio de salida por fase

- Un cambio pequeño y bilingüe, sin alterar URLs ni cifras del modelo silenciosamente.
- `npm run check`, `npm test`, `npm run build`, `npm run test:csp` y `npm run test:e2e` correctos.
- `npx lhci autorun` correcto cuando el cambio afecte HTML, estilos o JavaScript servido.
- Diff revisado, sin archivos accidentales; cualquier cambio numérico documenta antes, después y justificación.

## Decisiones del primer incremento

- Estados: `publicado`, `nota-investigacion`, `borrador`, `actualizacion-pendiente`.
- Solo `borrador` usa `noindex` y queda fuera del sitemap.
- `datosHasta` admite `AAAA-MM` o `AAAA-MM-DD` y se omite cuando no está verificado.
- Los seis artículos actuales siguen siendo borradores. Versión y changelog se posponen hasta tener un cambio real.

## Resultado del primer incremento

Completado el 23 de octubre de 2026: tipos correctos, 236 pruebas unitarias, build de 67 páginas, auditoría CSP de
67 páginas, 627 pruebas E2E correctas (9 omisiones declaradas por plataforma) y presupuestos Lighthouse correctos
en las 10 rutas configuradas. Las pruebas E2E aíslan el beacon externo de Cloudflare para no depender de su CORS.
