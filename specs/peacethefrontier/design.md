# Peace The Frontier: diseño técnico

> Implementa `requirements.md`. Cada decisión referencia los requisitos que cubre.

## 1. Decisiones de stack

| Necesidad | Elección | Por qué | Req. |
|---|---|---|---|
| Framework | **Astro 7** (salida estática) + TypeScript | Sitio de contenido: HTML estático, JS solo donde hay interacción (islas) | NF1, NF2, NF9 |
| Contenido | **MDX + YAML** en Content Collections con esquemas **Zod** | El build valida fuentes, niveles de evidencia y referencias; sin base de datos | R2, R3, NF9 |
| Interactividad | **Web Components en TS sin framework** | Timeline y selector de camino son 2 islas; no justifican React | NF2 |
| Zoom/pan timeline | `d3-zoom` + `d3-selection` (~12 KB) | Pinch, inercia y teclado en móvil son difíciles de hacer bien a mano | R4 |
| Animaciones | CSS (scroll-driven animations + `@starting-style`) y Canvas 2D para el hero | Sin GSAP; propiedades compositor-only | R7, NF1 |
| Menú | Popover API nativa (`popover`, `popovertarget`) | Esc, clic fuera y foco sin JS | NF3 |
| Fuentes | API `fonts` de Astro (Fontsource, autoalojadas, fallbacks con métricas) | Sin CLS por cambio de fuente | NF1 |
| CSP | `security.csp` de Astro: `<meta>` con hashes por página | Scripts y estilos inline sin `'unsafe-inline'` | NF6 |
| Búsqueda | **Pagefind** | Índice estático generado en el build, sin servidor | R8.1 |
| Hosting | **Cloudflare Pages** (`_headers`, `_redirects`) | Gratis, CDN, previews por PR, redirects 301 del juego | R9, NF6 |
| Analítica | Cloudflare Web Analytics (sin cookies) | Coherente con el pilar de privacidad | NF4 |
| Tests | Vitest (lógica pura) · Playwright + axe (e2e/a11y) · Lighthouse CI | | NF1, NF3 |
| Enlaces rotos | `lychee` en GitHub Actions semanal | | R3.4 |

Descartado en v1: CMS, backend, cuentas, i18n activo (solo la estructura de rutas queda preparada, R11.2).

## 2. Estructura del repositorio

```text
peacethefrontier/
├── src/
│   ├── content/
│   │   ├── temas.yaml               (15 temas = pilares, ordenados por escala)
│   │   ├── articulos/      *.mdx
│   │   ├── escenarios/     *.mdx
│   │   ├── eventos/        *.yaml   (timeline; un archivo por era)
│   │   ├── recorridos/     *.yaml   (árboles de decisión ético/no ético)
│   │   └── fuentes/        *.yaml
│   ├── content.config.ts            (esquemas Zod + validaciones cruzadas)
│   ├── lib/
│   │   ├── recorrido.ts             (motor de decisiones, puro)
│   │   ├── escala-tiempo.ts         (escala no lineal año ↔ posición, pura)
│   │   └── relacionados.ts          (contenido relacionado por pilares)
│   ├── components/
│   │   ├── timeline/                (<ptf-timeline>, TimelineList.astro)
│   │   ├── recorrido/               (<ptf-recorrido>, Indicadores.astro)
│   │   ├── articulo/                (EvidenciaBadge, Nota, ListaFuentes, MitoVsEvidencia)
│   │   ├── visuales/                (hero neuronas→estrellas, gráficos por pilar)
│   │   └── ui/
│   ├── layouts/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── temas/index.astro
│   │   ├── temas/[id].astro
│   │   ├── articulos/[slug].astro
│   │   ├── escenarios/[slug].astro
│   │   ├── caminos/[id].astro       (selector ético/no ético)
│   │   ├── timeline.astro
│   │   ├── fuentes/index.astro
│   │   └── metodologia.astro        (niveles de evidencia, política R10)
│   └── styles/ (tokens.css, tipografia.css, global.css)
├── public/ (_headers, _redirects, fonts/)
├── tests/ (e2e/*.spec.ts)
└── .github/workflows/ (ci.yml, enlaces.yml)
```

**Idiomas (R11):** español sin prefijo, inglés bajo `/en/` con slugs propios. Sin el i18n de Astro: un
módulo `src/i18n/rutas.ts` (rutas por sección) y `src/i18n/ui.ts` (textos tipados). Las vistas viven en
`src/components/vistas/` y cada idioma tiene páginas de 3 líneas que las montan. Los temas guardan el inglés en
`en: { slug, titulo, … }`; las páginas largas son MDX en `src/content/paginas/<idioma>/`.

Rutas en español sin prefijo de idioma; inglés en `/en/...`. En la interfaz y las URLs los
pilares se llaman **temas** (palabra más clara para el lector); el código P1–P15 se mantiene en los datos.

## 3. Modelo de datos

```ts
// content.config.ts (resumen)
const evidencia = z.enum(['consenso', 'emergente', 'especulativo', 'escenario-ficcion']);
const pilarId   = reference('pilares');

temas:      { codigo: 'P1'…'P15', titulo, banda: 'mente'|'sociedad'|'planeta'|'cosmos', orden, pregunta,
              intro, preguntas: string[] }   // archivo único src/content/temas.yaml

fuentes:    { titulo, tipo: z.enum(['oficial','revisado-por-pares','preprint','prensa','libro','dataset']),
              organizacion?, autores?, anio, url: z.string().url(), doi?, archivo?: z.string().url(),
              fechaAcceso: z.coerce.date() }

articulos:  { titulo, resumen, pilares: pilarId[] (min 1), evidencia, autor,
              publicado: date, revisado: date, fuentes: reference('fuentes')[],
              sensible: boolean   // true → exige checklist R10.4 en el PR
              asistidoPorIA?: boolean }

escenarios: { titulo, horizonte: z.enum(['2035','2050','2100+']), pilares, evidencia: 'escenario-ficcion',
              supuestos: string[], senales: string[], fuentes, indicadores: Indicadores }

eventos:    { anio: number /* negativo = a.C. */, fechaTexto, titulo, resumen, pilares,
              capa: z.enum(['pasado','presente','futuro']),
              tipo: z.enum(['hito','perdido','recuperado','escenario']),
              par?: reference('eventos')       // perdido ↔ recuperado (R4.5)
              escenario?: reference('escenarios'), articulo?: reference('articulos'),
              evidencia, fuentes }

recorridos: { titulo, pilares, inicio: string,
              nodos: Record<string,
                | { tipo: 'decision', anio, pregunta, contexto,
                    opciones: { id, texto, etica: 'etico'|'no-etico'|'ambiguo', porque,
                                consecuencia, efectos: Partial<Indicadores>, siguiente: string }[] }  // 2–4
                | { tipo: 'final', escenario: reference('escenarios') }> }

type Indicadores = { libertad, saludPlanetaria, equidad, conocimiento, riesgoExistencial } // 0–100
```

**Validaciones cruzadas en el build** (fallan el build, R2.4):
- Artículo con `evidencia !== 'escenario-ficcion'` sin ninguna fuente `oficial` | `revisado-por-pares`.
- Evento `perdido`/`recuperado` sin `par`, o con `par` que no apunta de vuelta.
- Recorrido: todo `siguiente` existe, no hay ciclos y todo camino termina en un nodo `final`.

## 4. Motor de recorridos (`lib/recorrido.ts`), R5

Función pura, sin DOM, la parte con más tests:

```ts
export function recorrer(r: Recorrido, camino: string[], base: Indicadores): Estado
// Estado = { nodo, pasos: {nodoId, opcion}[], indicadores, terminado, invalidoDesde?: number }
```

- Aplica opciones en orden; acumula `efectos` y los limita a 0–100.
- Si una opción no existe en el nodo actual, corta ahí y devuelve `invalidoDesde` (URL manipulada → estado
  válido más largo, nunca error).
- URL: `/caminos/ia-2100?c=a.b.a`. Atrás = quitar el último id (R5.5). Comparar (R5.6) = dos estados que
  comparten prefijo; UI en dos columnas.
- El componente `<ptf-recorrido>` recibe el árbol como JSON serializado en el build y solo pinta el `Estado`.
  Sin JS: la página muestra el árbol completo como lista anidada `<details>` (mejora progresiva).

## 5. Timeline (`lib/escala-tiempo.ts` + `<ptf-timeline>`), R4

Escala lineal por tramos: cada era recibe un ancho fijo en pantalla aunque dure miles de años.

| Tramo | Años | Ancho |
|---|---|---|
| Antigüedad | -3500 → -500 | 15 % |
| Clásica → medieval | -500 → 1500 | 15 % |
| Revolución científica / industrial | 1500 → 1900 | 12 % |
| Siglo XX | 1900 → 2000 | 13 % |
| Era digital / IA | 2000 → 2026 | 15 % |
| Futuros | 2026 → 2100+ | 30 % |

- `posicion(anio) → 0..1` y `anio(posicion)` inversa; test de ida y vuelta.
- Render SVG; los eventos se agrupan en clusters cuando se solapan al nivel de zoom actual.
- Capa futuro: ramas que salen de “2026 hoy” hacia cada escenario, coloreadas por ética dominante del camino.
- Pares perdido ↔ recuperado: arco punteado entre ambos eventos.
- Estado en URL: `?p=P10&z=2.5&x=0.31&e=anticitera` (R4.7).
- Accesibilidad: cada evento es un `<button>` en orden de tiempo con `roving tabindex`; panel de detalle como
  `<dialog>`. `TimelineList.astro` renderiza la misma data como `<ol>` cronológica (vista por defecto en < 768 px y
  sin JS) (R4.6).

## 6. Dirección visual

> Revisada en la fase 1: la primera propuesta (papel crema + Fraunces + bermellón + mono para etiquetas)
> era el patrón genérico de “sitio editorial hecho por IA”. Se sustituyó por una dirección que sale del tema.

**Placa de vidrio / cianotipo.** Las placas fotográficas de vidrio con las que las astrónomas de Harvard
catalogaron el cielo y el azul de Prusia del cianotipo (planos, sun-prints de Anna Atkins).
- **Tema claro, “placa”**: vidrio frío `#eef2f3`, tinta azul de Prusia `#0c2340`.
- **Tema oscuro, “cianotipo”**: campo azul `#123a6b` (no negro), tinta clara `#eef3f7`, grano de papel sutil.
- **Acento único, “sodio”** `#e8a317` / `#f4b940` (la línea D del espectro solar): marca “tú” en la regla y
  la selección de texto. En el tema claro solo como relleno con tinta encima (7,3:1).
- Colores definidos una vez con `light-dark()`; `data-tema` fuerza claro u oscuro. Todos los pares texto/fondo
  pasan AA (ver `tokens.css`).

**Tipografía (2 familias, autoalojadas)**: *Spectral* (titulares en peso 200, lectura en 400) + *Archivo*
(interfaz, etiquetas y cifras tabulares, 400/600). Nada de mayúsculas sostenidas para etiquetas.

**Elemento memorable: la regla de escala.** Una regla logarítmica de 10⁻¹⁰ m (átomo) a 10²⁷ m (universo
observable) con hitos (neurona, tú, Tierra, Sol, Vía Láctea…) y cuatro bandas que agrupan los temas:
*Mente y materia*, *Sociedad*, *Planeta*, *Cosmos*. Hace literal el “de la neurociencia a la astronomía” y
ordena los 15 temas; cada tema tiene “hacia lo pequeño / hacia lo grande”. Animación única al cargar
(~1 s: las marcas crecen, luego bandas); estado final estático con `prefers-reduced-motion`.

**Niveles de evidencia por estilo de línea**, como en los mapas: continua = consenso, discontinua =
emergente, punteada = especulativo, ondulada = escenario. No dependen del color (R2.2).

**Color semántico reservado**: `--etico` (verdín) y `--no-etico` (bermellón) solo para el selector de caminos.

**Visuales por sección (R7.1)**, fases posteriores:
- Home: red neuronal en Canvas que se reordena en constelaciones al hacer scroll (neurociencia → astronomía).
- P8 Energía: curva histórica de consumo y fuentes (dataset citado).
- P6 Privacidad: mapa de capas de datos personales que se “encienden”.
- P10: astrolabio cuyo anillo rota con la época.
- Todo con `prefers-reduced-motion` → estado final estático (R7.2).

## 7. Seguridad y cabeceras (NF6)

- **CSP en `<meta>`**, generada por Astro (`security.csp`) con hashes SHA-256 de cada script y `<style>`:
  `script-src 'self' 'sha256-…'`, `style-src 'self' 'sha256-…'`, `style-src-attr 'unsafe-inline'` (solo
  atributos `style`, usados para posicionar la regla). El script de tema inline registra su hash con
  `Astro.csp.insertScriptHash`.
- **`public/_headers`** (Cloudflare Pages) con lo que un `<meta>` no puede expresar: `frame-ancestors 'none'`,
  HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, caché inmutable en `/_astro/*`.
- Fase 7: añadir `https://static.cloudflareinsights.com` a `script-src` al activar la analítica.
Sitio estático sin formularios ni entrada de usuario → no aplica CSRF ni rate limiting en v1.
MDX es contenido de confianza (solo desde git); el JSON que llega a las islas se inserta con `textContent`.

## 8. Flujo editorial (R10)

1. Rama + PR por pieza de contenido.
2. CI: `astro check` → Vitest → build (valida esquemas y referencias) → Playwright + axe → Lighthouse CI → preview.
3. Si `sensible: true`, la plantilla de PR exige marcar el checklist:
   - [ ] Sin pasos, protocolos, cantidades ni rutas técnicas replicables.
   - [ ] Enfoque en historia, impacto, política o gobernanza.
   - [ ] Fuentes oficiales o revisadas por pares.
   - [ ] Revisado por una segunda persona (o releído 24 h después si es autor único).
4. Merge → deploy a producción.

## 9. Migración del dominio (R9)

1. Inventariar URLs actuales del juego (sitemap o logs).
2. Desplegar el juego en `play.peacethefrontier.com` (decisión T0).
3. Desplegar el sitio nuevo en un preview de Cloudflare Pages; QA completo.
4. `_redirects`: rutas del juego → `https://play.peacethefrontier.com/:splat 301`.
5. Cambiar DNS del apex al proyecto de Pages; verificar HTTPS, redirects y Search Console.

## 10. Estrategia de pruebas

| Capa | Herramienta | Qué cubre |
|---|---|---|
| Unidad | Vitest | `recorrido.ts`, `escala-tiempo.ts`, `relacionados.ts`, validaciones cruzadas, ≥ 80 % en `lib/` |
| Contenido | build de Astro | Esquemas Zod + validaciones cruzadas (sección 3) |
| E2E | Playwright | Recorrer un camino y compartir URL; filtrar timeline y abrir evento; búsqueda |
| A11y | `@axe-core/playwright` + pruebas de teclado | Home, pilar, artículo, timeline, camino |
| Visual | Screenshots Playwright 320/768/1024/1440, claro y oscuro | Home, timeline, camino |
| Rendimiento | Lighthouse CI (perfil móvil) con presupuestos NF1/NF2 | Home, tema, metodología; más adelante artículo y timeline |

## 11. Portafolio de investigación original y experimentos reproducibles (R18–R20)

- **Programa científico (`src/lib/programa/`)**: `hipotesis.ts` define la tesis central y las tres hipótesis
  falsables (`H1`, `H2`, `H3`) con enlaces tipados a temas del Atlas (`P1–P17`), working papers y experimentos;
  `bitacora.ts` registra el historial de entregas y la cola editorial activa.
- **Experimentos reproducibles (`experiments/<id>/` + `public/datos/experimentos/<id>/`)**: módulos TypeScript
  puros deterministas (LCG32 con semillas explícitas) probados en Vitest. `scripts/ejecutar-experimentos.ts`
  genera y verifica (`--check`) `dataset.csv`, `schema.json` y `manifest.json` con sumas SHA-256.
- **Vinculación en `articulos` (`content.config.ts`)**: campos opcionales `hipotesis`, `experimento`,
  `repositorioCodigo` y `comandoReproduccion`, validados entre pares ES/EN y renderizados mediante
  `FichaCodigoDatos.astro`.
- **Sindicación y autoría continua**: endpoints estáticos `/rss.xml` y `/en/rss.xml`, `CITATION.cff` en raíz y
  generador CLI `scripts/nueva-investigacion.mjs` (`npm run research:new`).
