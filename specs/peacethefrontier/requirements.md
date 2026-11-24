# Peace The Frontier: requisitos

> Spec-driven: `requirements.md` (qué) → `design.md` (cómo) → `tasks.md` (orden de ejecución).
> Los criterios de aceptación usan formato EARS (CUANDO / SI / MIENTRAS … EL SISTEMA DEBERÁ …).
> Estado: **v0.3**, 2026-10-02 (fase 1 + bilingüe implementados). Referentes: `referentes.md`.

## 1. Visión

`peacethefrontier.com` pasa de ser un juego a ser un **sitio de investigación** sobre la trayectoria de la
humanidad en la era de la IA: hacia dónde nos llevan las decisiones que estamos tomando, qué tecnologías se
van a desbloquear (incluidas las que todavía no imaginamos) y cómo cambian la salud, el poder, la privacidad,
la energía, el planeta y el espacio.

El eje que conecta todo es **el conocimiento**: cómo las primeras civilizaciones ya entendían el cielo, el cuerpo
y la materia, cómo parte de ese conocimiento se perdió y se recuperó, y cómo la IA podría acelerar (o
romper) ese ciclo. El recorrido va **desde la neurociencia hasta la astronomía**.

### Lo que el sitio NO es
- No es un sitio de predicciones. Presenta **escenarios** con supuestos explícitos.
- No es pseudo-historia. Toda afirmación sobre conocimiento antiguo lleva nivel de evidencia y fuente.
- No es un manual técnico de riesgos. Armas, biología y vigilancia se tratan a nivel de **historia, política
  y gobernanza**, nunca como instrucciones (ver R10).

## 2. Audiencia

| Perfil | Necesita |
|---|---|
| Lector curioso (principal) | Narrativa clara, visuales, poder explorar sin leer papers |
| Estudiante / docente | Fuentes citables, timeline usable en clase |
| Investigador / periodista | Fuentes primarias, supuestos explícitos, enlaces permanentes a escenarios |

## 3. Pilares de contenido

Los 10 primeros vienen del brief; los marcados con ➕ se añaden porque los otros dependen de ellos.

| # | Pilar | Preguntas clave |
|---|---|---|
| P1 | **IA y la trayectoria humana** | ¿Qué es la AGI? Alineación, quién controla los modelos, IA como científico |
| P2 | **Caminos de la sociedad** | Decisiones correctas e incorrectas → escenarios a 2035 / 2050 / 2100 |
| P3 | **Tecnologías desbloqueables** | “Unknown unknowns”: materiales, computación, física que la IA podría abrir |
| P4 | **Salud y enfermedad** | Curas, longevidad, medicina personalizada; y el riesgo de crear nuevas enfermedades (solo gobernanza) |
| P5 | **Poder, defensa y caída de gobiernos** | Armas autónomas, ciberguerra, nuevas doctrinas de defensa, colapso o cambio de regímenes |
| P6 | **Privacidad y control humano** | Vigilancia, puntuación social, neurodatos, autonomía cognitiva |
| P7 | **Ciencia y espacio** | Cómo la IA cambia el método científico; exploración, minería espacial, búsqueda de vida |
| P8 | **Energía y recursos** | Fusión, solar, almacenamiento, materiales críticos, agua; desbloquear el potencial del planeta |
| P9 | **Sanar el planeta** | Clima, restauración de ecosistemas, océanos, captura de carbono, biodiversidad |
| P10 | **Conocimiento antiguo, perdido y recuperado** | Sumeria, Egipto, Babilonia, Grecia, Maya, Edad de Oro islámica, India, China; Alejandría, Anticitera |
| P11 ➕ | **Mente y neurociencia** | Conciencia, interfaces cerebro-máquina, mejora cognitiva, IA como espejo de la mente |
| P12 ➕ | **Trabajo y economía** | Automatización, renta básica, concentración de riqueza, nuevas profesiones |
| P13 ➕ | **Información y verdad** | Desinformación, deepfakes, epistemología colectiva, educación |
| P14 ➕ | **Gobernanza de la IA** | Regulación (EU AI Act, NIST AI RMF), tratados, coordinación internacional |
| P15 ➕ | **Riesgo existencial y resiliencia** | Riesgos catastróficos, cómo se recupera una civilización (vuelve a enlazar con P10) |
| P16 ➕ | **Cómputo y chips** | Tendencias medibles del hardware, cadena de semiconductores, geopolítica (patrón Epoch AI) |
| P17 ➕ | **Sentido y propósito** | Qué nos hace humanos cuando las máquinas pueden hacerlo casi todo; ningún referente lo cubre |

## 4. Requisitos funcionales

### R1. Pilares (hub de temas)
- R1.1 EL SISTEMA DEBERÁ tener una página por pilar con: introducción, preguntas clave, artículos, escenarios
  relacionados y el tramo del timeline filtrado por ese pilar.
- R1.2 CUANDO un artículo, escenario o evento pertenezca a varios pilares EL SISTEMA DEBERÁ mostrarlo en todos
  ellos sin duplicar el contenido.

### R2. Artículos de investigación
- R2.1 Cada artículo DEBERÁ declarar: pilares, **nivel de evidencia**, fecha de publicación, fecha de última
  revisión, autor y lista de fuentes.
- R2.2 Niveles de evidencia (fijos): `consenso` · `emergente` · `especulativo` · `escenario-ficción`.
  EL SISTEMA DEBERÁ mostrar el nivel con color y texto (no solo color).
- R2.3 CUANDO una afirmación cite una fuente EL SISTEMA DEBERÁ renderizar una nota numerada que enlace a la
  ficha de la fuente.
- R2.4 SI un artículo no tiene al menos una fuente de tipo `oficial` o `revisado-por-pares` ENTONCES el build
  DEBERÁ fallar, salvo que su nivel sea `escenario-ficción`.

### R3. Fuentes y artículos oficiales
- R3.1 Las fuentes DEBERÁN ser una colección propia y reutilizable (una fuente, muchos artículos).
- R3.2 Tipos: `oficial` (gobiernos, ONU, OMS, IPCC, NASA, ESA…), `revisado-por-pares` (DOI), `preprint`,
  `prensa`, `libro`, `dataset`.
- R3.3 Cada fuente DEBERÁ guardar `url`, `fechaAcceso` y, cuando exista, `doi` y un enlace de archivo
  (web.archive.org).
- R3.4 EL SISTEMA DEBERÁ revisar en CI semanalmente los enlaces rotos y abrir un aviso, no romper el deploy.

### R4. Timeline interactivo
- R4.1 EL SISTEMA DEBERÁ mostrar una línea de tiempo continua de ~-3500 a.C. hasta 2100+, con escala no lineal
  (las épocas antiguas comprimidas, el presente expandido).
- R4.2 Tres capas visuales: **pasado** (hechos), **presente** (2026) y **futuros** (ramas de escenarios).
- R4.3 CUANDO el usuario filtre por pilar EL SISTEMA DEBERÁ mostrar solo los eventos de ese pilar sin recargar.
- R4.4 CUANDO el usuario seleccione un evento EL SISTEMA DEBERÁ abrir un panel con resumen, nivel de evidencia,
  fuentes y enlace al artículo.
- R4.5 Marcar eventos de tipo **conocimiento perdido** y **recuperado** y unirlos visualmente (p. ej.
  heliocentrismo de Aristarco → Copérnico; hormigón romano → redescubrimiento moderno; Biblioteca de Alejandría).
- R4.6 EL SISTEMA DEBERÁ ser navegable con teclado (flechas entre eventos, Enter abre, Esc cierra) y tener una
  vista alternativa en lista para lectores de pantalla y móvil.
- R4.7 El zoom, el filtro y el evento abierto DEBERÁN quedar en la URL (enlace compartible).

### R5. Selector de camino: ético vs no ético
- R5.1 EL SISTEMA DEBERÁ ofrecer recorridos interactivos de decisión por pilar (y uno global “Humanidad 2100”).
- R5.2 Cada decisión DEBERÁ tener 2–4 opciones con etiqueta `ético`, `no-ético` o `ambiguo`, y una
  justificación breve de **por qué** se etiqueta así (marco ético usado).
- R5.3 CUANDO el usuario elija una opción EL SISTEMA DEBERÁ mostrar las consecuencias y actualizar los
  indicadores: **Libertad**, **Salud planetaria**, **Equidad**, **Conocimiento**, **Riesgo existencial**.
- R5.4 CUANDO el recorrido termine EL SISTEMA DEBERÁ mostrar el escenario final, su año aproximado, los
  supuestos y las fuentes que lo sostienen.
- R5.5 El camino recorrido DEBERÁ quedar en la URL para compartirlo y poder volver atrás opción por opción.
- R5.6 EL SISTEMA DEBERÁ permitir comparar lado a lado el camino ético y el no ético desde el mismo punto.
- R5.7 SI el usuario elige el camino no ético ENTONCES el sitio DEBERÁ narrar consecuencias, nunca premiarlo
  ni moralizar con tono de sermón.

### R6. Escenarios
- R6.1 Cada escenario DEBERÁ declarar horizonte (2035/2050/2100+), supuestos, señales tempranas (“cómo sabríamos
  que vamos hacia aquí”) y fuentes.
- R6.2 Los escenarios DEBERÁN aparecer como ramas en la capa de futuros del timeline (R4.2).
- R6.3 Los cuatro futuros de la matriz Paz × Frontera se especifican en futuros.md.

### R7. Animaciones y gráficos
- R7.1 Las secciones clave (home, cada pilar) DEBERÁN tener una visualización animada propia (p. ej. red de
  neuronas → constelaciones; curva de energía; mapa de vigilancia).
- R7.2 MIENTRAS `prefers-reduced-motion: reduce` esté activo EL SISTEMA DEBERÁ mostrar el estado final estático.
- R7.3 Los datos de los gráficos DEBERÁN venir de un dataset con fuente citada, no inventados.

### R8. Búsqueda y navegación
- R8.1 Búsqueda de texto completo en artículos, eventos, escenarios y fuentes, sin servidor.
- R8.2 Cada contenido DEBERÁ tener “relacionados” calculados por pilares compartidos.

### R9. Migración del juego
- R9.1 El juego actual NO DEBERÁ perderse: se mueve a `play.peacethefrontier.com` (decidido 2026-10-02).
- R9.2 CUANDO alguien entre a una URL antigua del juego EL SISTEMA DEBERÁ redirigir con 301 al nuevo destino.

### R10. Política de contenido sensible (no negociable)
- R10.1 Biología (P4) y armas (P5): solo historia, impacto social, política y gobernanza. Prohibido publicar
  protocolos, rutas de síntesis, métodos de mejora de patógenos, diseño de armas o evasión de controles.
- R10.2 Vigilancia (P6): explicar capacidades y riesgos a nivel conceptual, sin guías operativas.
- R10.3 Conocimiento antiguo (P10): separar con una caja “Mito vs evidencia” las teorías populares sin respaldo
  (p. ej. “antiguos astronautas”) del registro arqueológico.
- R10.4 Toda pieza en P4/P5/P6 DEBERÁ pasar por un checklist de revisión editorial antes de publicar.

### R11. Idioma (adelantado a v1)
- R11.1 Español sin prefijo (`/temas/ia/`) e inglés bajo `/en/` con slugs propios (`/en/topics/ai/`).
- R11.2 CUANDO el lector pulse ES/EN EL SISTEMA DEBERÁ llevarlo a la misma página en el otro idioma.
- R11.3 Cada página DEBERÁ declarar `lang`, `hreflang` (es, en, x-default) y `og:locale`.
- R11.4 Todo texto de interfaz vive en `src/i18n/ui.ts`; el tipo obliga a que el inglés tenga las mismas claves.

### R12. Punto de vista del autor
- R12.1 La opinión del autor DEBERÁ ir en un bloque `PuntoDeVista` (punto de sodio, el mismo que marca “tú” en la regla).
- R12.2 Un bloque de opinión NUNCA cambia el nivel de evidencia del texto que lo contiene.
- R12.3 La página “Sobre el atlas” DEBERÁ explicar por qué existe el atlas, en la voz del autor.

### R13. Citar y reutilizar (patrón OWID / Distill)
- R13.1 Cada tema, artículo y escenario DEBERÁ ofrecer “Cómo citar” en texto y BibTeX, con botón de copiar.
- R13.2 Los datos de cada gráfico DEBERÁN poder descargarse (CSV) con su fuente. _(fase 6)_
- R13.3 Licencia del contenido: pendiente de decisión (recomendado CC BY 4.0).

### R14. Lectura de investigación (patrones Gwern / AI 2027 / Distill)
- R14.1 Notas al margen en escritorio; notas al pie en móvil. _(fase 3)_
- R14.2 Ficha de publicación: autor, fecha, revisión, nivel de evidencia, tiempo de lectura. _(fase 3)_
- R14.3 Sección “Correcciones” al final cuando un texto cambia de forma relevante. _(fase 3)_
- R14.4 Desplegables para explicaciones técnicas. _(fase 3)_
- R14.5 Hoja de impresión limpia (sirve como PDF). _(hecho)_

### R15. Panel de escenario ligado al scroll (patrón AI 2027, mejorado)
- R15.1 MIENTRAS el lector avance por un escenario EL SISTEMA DEBERÁ mostrar un panel fijo con año e indicadores
  (R5.3) que cambian con la sección visible. _(fase 5)_

### R16. Señales tempranas
- R16.1 Cada escenario DEBERÁ listar señales medibles; una página de señales DEBERÁ mostrar su estado y fecha de
  última revisión. _(fase 5+)_

### R17. Apoyo económico
- R17.1 Enlace “Apoya la investigación” en el pie y al final de artículos y escenarios; nunca en la portada ni
  como ventana emergente.
- R17.2 Página `/apoyar/` con en qué se usa el dinero y la garantía de que no influye en las conclusiones.
- R17.3 El enlace es un `<a>` simple a la plataforma elegida: sin widgets de terceros (CSP y privacidad).

### R18. Programa de investigación e hipótesis falsables
- R18.1 La superficie principal (`/`, `/research/` y sus equivalentes `/en/`) DEBERÁ presentar el portafolio de
  investigación de **Carlos Nicolás Soto** bajo la tesis rectora *“Agentes autónomos como infraestructura de la
  próxima década”*, conectada con `/atlas/`, `/sim/` y `/open/`.
- R18.2 EL SISTEMA DEBERÁ estructurar el programa en al menos tres hipótesis explícitas (`H1`, `H2`, `H3`),
  declarando para cada una: enunciado, mecanismo teórico, subtemas naturales enlazados a `/temas/<id>/`, nivel
  de evidencia actual y **criterio explícito de refutación**.

### R19. Investigación original con código y datos vinculados
- R19.1 EL SISTEMA DEBERÁ incluir al menos tres piezas de investigación original (`PTF-WP 3`, `4`, `5`) con
  modelo formal o análisis propio, código reproducible en `experiments/` y datasets verificados con SHA-256.
- R19.2 CUANDO una publicación declare `experimento` y `repositorioCodigo` EL SISTEMA DEBERÁ mostrar una ficha
  de reproducibilidad con enlace directo al código en GitHub, descarga de CSV/esquema/manifiesto y comando CLI.
- R19.3 SI los metadatos `hipotesis`, `experimento` o `repositorioCodigo` difieren entre español e inglés o
  apuntan a un manifiesto inexistente ENTONCES el build DEBERÁ fallar.

### R20. Consistencia y bitácora activa de publicación
- R20.1 EL SISTEMA DEBERÁ mostrar una bitácora cronológica de entregas versionadas y una agenda pública de
  próximas investigaciones sin inventar fechas históricas.
- R20.2 EL SISTEMA DEBERÁ ofrecer feeds RSS 2.0 válidos en español (`/rss.xml`) e inglés (`/en/rss.xml`).

## 5. Requisitos no funcionales

| ID | Requisito | Meta |
|---|---|---|
| NF1 | Rendimiento | LCP < 2.5 s, INP < 200 ms, CLS < 0.1 en móvil 4G |
| NF2 | Peso | JS ≤ 150 KB gzip en home; páginas de artículo ≤ 50 KB JS |
| NF3 | Accesibilidad | WCAG 2.2 AA; axe sin violaciones serias |
| NF4 | Privacidad | Sin cookies de terceros ni trackers; analítica sin cookies. Coherente con P6 |
| NF5 | SEO | Metadatos OG, `Article`/`ScholarlyArticle` JSON-LD, sitemap, URLs estables |
| NF6 | Seguridad | CSP estricta, HSTS, sin `innerHTML` con contenido no confiable |
| NF7 | Responsive | Sin scroll horizontal de 320 a 1920 px |
| NF8 | Temas | Claro y oscuro, ambos diseñados |
| NF9 | Mantenimiento | Contenido en archivos (MDX/YAML) versionados en git; sin base de datos ni backend |

## 6. Fuera de alcance (v1)
Cuentas de usuario, comentarios, newsletter, CMS visual, foro, publicidad.
Se reevalúan después del lanzamiento con datos de uso.

## 7. Preguntas abiertas
1. ~~¿Subdominio o `/juego`?~~ **Subdominio `play.`**. Pendiente: ¿dónde está alojado hoy el juego?
2. ¿Autoría: solo tú, o habrá colaboradores (cambia el flujo editorial de R10.4)?
3. ¿Se quiere usar IA para redactar borradores? Si sí, añadir etiqueta de transparencia “asistido por IA”.
5. Punto de vista del autor (R12.3): el texto actual de “Sobre el atlas” es un **borrador** escrito a partir del brief.
6. Plataforma de apoyo (R17) y licencia del contenido (R13.3).
4. ¿Nombre/tagline del sitio de research? Propuesta: *Peace The Frontier: Atlas de los futuros humanos*.
