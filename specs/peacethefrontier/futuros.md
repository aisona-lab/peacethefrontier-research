# Futuros: la matriz Paz × Frontera

> Spec de diseño aprobado por secciones el 2026-10-02 (brainstorming). Amplía `requirements.md` R5, R6, R15 y
> R16 para la portada y los escenarios a 100 años. Sigue el formato del resto del spec: requisitos EARS, diseño
> y pruebas. El plan de implementación se escribirá aparte, tras revisar este documento.

## 1. Entendimiento

**Lo que pidió el autor**
- En la portada, botones que lleven a qué pasaría con el mundo de aquí a 100 años según lo que decidamos sobre la IA.
- Apoyado en datos, cifras y ecuaciones matemáticas.
- Cubriendo humanidad, robots, ciencia, tecnología y política.
- Coherente con el nombre *Peace The Frontier*.

**Decisiones tomadas en la conversación**

| Pregunta | Decisión |
|---|---|
| ¿Cuántos caminos? | Más de dos: **matriz 2×2 Paz × Frontera**, cuatro futuros. |
| ¿Qué papel tienen las matemáticas? | **Modelo transparente e interactivo**: el lector mueve paz y frontera y todo se recalcula, con bandas de incertidumbre. |
| ¿Cómo se recorre un futuro? | **Relato por décadas con panel fijo** que se actualiza con el scroll (patrón AI 2027, con control del lector). |
| ¿Qué futuro defiende el atlas? | **Ninguno, neutral.** La voz del autor queda en “Sobre el atlas”. |
| ¿Enfoque técnico? | **Modelo propio anclado a datos oficiales, relato escrito por cuadrante y eventos por umbral.** |

**Supuestos confirmados**: son *escenarios* (nivel `escenario-ficcion`), no predicciones; bilingüe ES/EN; la regla de
escala se mantiene, pero baja a abrir la sección de temas.

## 2. Los cuatro futuros

Dos ejes, cada uno de 0 a 1:
- **Paz** (`paz`): cuánto regulamos y cooperamos, entre países y dentro de ellos.
- **Frontera** (`frontera`): a qué velocidad avanza la capacidad de la IA.

| Futuro | Lema | Posición inicial | Slug ES | Slug EN |
|---|---|---|---|---|
| **Pausa** | Regulamos y frenamos | paz 0,85 · frontera 0,15 | `pausa` | `pause` |
| **Frontera en paz** | Regulamos y avanzamos | paz 0,85 · frontera 0,85 | `frontera-en-paz` | `peaceful-frontier` |
| **Carrera** | Sin reglas ni freno | paz 0,15 · frontera 0,85 | `carrera` | `race` |
| **Fractura** | Sin reglas; una crisis nos frena | paz 0,15 · frontera 0,15 | `fractura` | `fracture` |

**Cuadrante más cercano** a cualquier posición: paz ≥ 0,5 → alta; frontera ≥ 0,5 → rápida.

**Neutralidad**: cada futuro muestra lo que gana y lo que pierde. Ningún cuadrante se presenta como el correcto, y
ninguno lleva el color `--etico` o `--no-etico`.

## 3. Requisitos

### F1. Portada
- F1.1 La portada DEBERÁ mostrar la matriz Paz × Frontera con cuatro enlaces de igual peso visual, uno por futuro.
- F1.2 Los ejes DEBERÁN explicarse en lenguaje llano (“cuánto regulamos y cooperamos”, “a qué velocidad avanza la IA”).
- F1.3 En móvil la matriz DEBERÁ seguir siendo 2×2, con objetivos táctiles de al menos 44 px.
- F1.4 La regla de escala DEBERÁ pasar a encabezar la sección de temas.
- F1.5 La cabecera DEBERÁ incluir el enlace **Futuros** (`/futuros/`, `/en/futures/`).

### F2. Modelo
- F2.1 EL SISTEMA DEBERÁ simular cada año de 2026 a 2126 a partir de `paz` y `frontera`.
- F2.2 Cada parámetro DEBERÁ tener valor central, rango y fuente; si no hay fuente directa, DEBERÁ estar etiquetado como **supuesto**.
- F2.3 EL SISTEMA DEBERÁ mostrar la mediana y una banda del 80 % (percentiles 10–90) a partir de 200 simulaciones con semilla fija.
- F2.4 La misma posición y la misma semilla DEBERÁN producir siempre los mismos resultados.
- F2.5 200 simulaciones DEBERÁN completarse en menos de 50 ms en un portátil medio.

### F3. Página de cada futuro
- F3.1 La página DEBERÁ recorrer 2026 y cada década hasta 2126 con un relato por ámbitos: humanidad, robots y tecnología, ciencia, planeta y política.
- F3.2 MIENTRAS el lector se desplaza, un panel fijo DEBERÁ mostrar el año visible, la posición en la matriz, los controles y los gráficos con un cursor en ese año.
- F3.3 CUANDO el lector mueva un control, EL SISTEMA DEBERÁ recalcular el modelo, actualizar gráficos, cifras del texto y eventos, y guardar la posición en la URL (`?paz=0.70&frontera=0.30`).
- F3.4 SI la posición cae en otro cuadrante, EL SISTEMA DEBERÁ avisarlo y ofrecer un enlace al relato de ese cuadrante
  con la misma posición y el mismo año. (Ajuste del plan: cambiar el texto en vivo mientras se arrastra resultó brusco.)
- F3.5 Cada década DEBERÁ listar los eventos que el modelo dispara en ella.
- F3.6 Sin JavaScript, la página DEBERÁ mostrar el relato completo, cifras y gráficos SVG calculados al compilar con la posición inicial del futuro.
- F3.7 El mini 2×2 del panel DEBERÁ llevar a otro futuro manteniendo el año visible (`#2056`).
- F3.8 En pantallas de menos de 64 rem, el panel DEBERÁ ser una barra inferior con el año y tres cifras, desplegable.

### F4. Página `/futuros/`
- F4.1 DEBERÁ explicar la matriz, mostrar cada ecuación en MathML (generado al compilar con `temml`, sin JS en el
  cliente), la tabla de parámetros con fuentes y los **límites del modelo**.
- F4.2 DEBERÁ mostrar los objetivos de calibración (sección 5.6) y si el modelo los cumple.

### F5. Accesibilidad y rendimiento
- F5.1 Los controles DEBERÁN ser `<input type="range">` con `aria-valuetext` en palabras (“Paz 20 %: poca cooperación”).
- F5.2 Cada gráfico DEBERÁ tener “Ver datos” con una tabla equivalente.
- F5.3 MIENTRAS `prefers-reduced-motion: reduce` esté activo, los gráficos NO DEBERÁN animarse.
- F5.4 El JS de la isla de futuros DEBERÁ pesar menos de 50 KB comprimido, sin librerías de gráficos.

## 4. Portada y rutas

```
┌──────────────────────────────────────────────────────────────────┐
│ Un atlas de los futuros          ¿Cómo será el mundo en 2126?    │
│ humanos, de la neurona           Frontera: velocidad de la IA →  │
│ al universo.                     ┌──────────────┬──────────────┐ │
│                                P │ PAUSA        │ FRONTERA     │ │
│ entradilla…                    a │ Regulamos y  │ EN PAZ       │ │
│                                z │ frenamos     │ Regulamos y  │ │
│ ¿Qué es esto…?                   │              │ avanzamos    │ │
│ ¿Cómo distinguimos…?           ↑ ├──────────────┼──────────────┤ │
│                                  │ FRACTURA     │ CARRERA      │ │
│                                  │ Sin reglas;  │ Sin reglas   │ │
│                                  │ una crisis…  │ ni freno     │ │
│                                  └──────────────┴──────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│ Diecisiete temas…   [regla de escala]   [índice de temas]        │
└──────────────────────────────────────────────────────────────────┘
```

| Sección | ES | EN |
|---|---|---|
| Explicación y modelo | `/futuros/` | `/en/futures/` |
| Cada futuro | `/futuros/<slug>/` | `/en/futures/<slug>/` |

Se añade `futuros` a `SECCIONES` en `src/i18n/rutas.ts` y un helper `rutaFuturo(lang, slug)`.

## 5. El modelo

### 5.1 Notación
`t` = años desde 2026 (0…100), paso anual. `p` = paz, `f` = frontera. Un parámetro con rango se muestrea en cada
simulación de Monte Carlo; la corrida central usa su valor central.

### 5.2 Ecuaciones

**Capacidad de la IA** (`capacidad`): `L` = log₁₀ del cómputo efectivo relativo a 2026. Crecimiento logístico en
escala logarítmica, frenado por las crisis:

```
L(0) = 0
L(t+1) = L(t) + g(t) · (1 − L(t) / L_max)
g(t) = [g_min + (g_max − g_min) · f] · (1 − φ · crisis(t))
```

**Automatización** (`automatizacion`, % de tareas): función de Hill sobre la capacidad.

```
A(t) = A₀ + (A_max − A₀) · Lⁿ / (Lⁿ + L₅₀ⁿ)
```

**Empleo** (`empleo`, % de la población en edad de trabajar con empleo): la paz aumenta la parte del desplazamiento
que compensan nuevas tareas y políticas (κ).

```
κ(p) = κ_min + (κ_max − κ_min) · p
E(t) = E₀ · (1 − (A(t) − A₀) · (1 − κ(p)))
```

**Desigualdad** (`desigualdad`, Gini mundial × 100):

```
G(t) = clamp(G₀ + a · (A(t) − A₀) · (1 − p) − b · (A(t) − A₀) · p, 20, 90)
```

**Robots** (`robots`, miles de millones en funcionamiento): curva S cuyo techo crece con la automatización.

```
R(t+1) = R(t) + r · R(t) · (1 − R(t) / max(R(t), R_sat · A(t)))
r = r_min + (r_max − r_min) · f
```

**Ritmo de descubrimiento** (`ciencia`, ×ritmo de 2026): la cooperación (ciencia abierta) lo amplifica.

```
S(t) = 1 + σ · L(t) · (0,6 + 0,4 · p)
```

**Electricidad de la IA** (`energiaIA`, TWh/año):

```
EIA(t) = EIA₀ · 10^(ε · L(t)) · (1 − η)^t
```

**Energía limpia** (`energiaLimpia`, % de la energía primaria): curva S acelerada por la ciencia y la cooperación.

```
Q(t+1) = Q(t) + q(t) · Q(t) · (1 − Q(t))
q(t) = q₀ · (0,5 + p) · (1 + λ · log₁₀ S(t))
```

**Emisiones y temperatura** (`temperatura`, °C sobre la era preindustrial). Relación TCRE del IPCC, solo CO₂:

```
γ(f) = γ_min + (γ_max − γ_min) · f                              (una economía más rápida usa más energía)
TE(t) = TE₀ · (1 + γ(f))^t + 0,0036 · EIA(t)                   [EJ]
Em(t) = Em₀ · (TE(t) / TE₀) · ((1 − Q(t)) / (1 − Q₀)) + U₀ · (1 − υ)^t   [GtCO₂]
T(t) = T₀ + TCRE · (Σ_{τ<t} Em(τ)) / 1000
```

**Población** (`poblacion`, miles de millones): proyección media de la ONU, ajustada por salud.

```
P(t) = P_ONU(t) · (1 + z_ONU · 0,1 · t / 74) · (1 + μ · log₁₀ S(t))
```
`P_ONU` interpola la variante media de WPP 2024 hasta 2100; de 2101 a 2126 extiende la tasa de 2095–2100.
`z_ONU` desplaza la proyección hasta ±10 % en 2100, una aproximación de la anchura del intervalo de la ONU.

**Concentración del poder** (`poder`, índice ilustrativo 0–100):

```
Π(t) = clamp(Π₀ + c · L(t) · (1 − p)² − d · p, 0, 100)
```

**Riesgo catastrófico acumulado** (`riesgo`, probabilidad de una catástrofe que mate a ≥ 10 % de la humanidad):

```
h(t) = h_nat + h_IA · ((L(t+1) − L(t)) / g_max) · (1 − p)² + h_conf · (Π(t) / 100) · (1 − p)
riesgo(t) = 1 − exp(−Σ_{τ≤t} h(τ))
```

**Crisis**: la tensión crece con la falta de paz y la concentración del poder. Una crisis dura `D` años y no puede
repetirse antes de 15.

```
tensión(t) = (1 − p) · (0,5 + Π(t) / 100)
crisis(t) = 1 si tensión(t) > θ y no hubo otra crisis en los 15 años previos; dura D años
```
La última crisis global de referencia es la pandemia de 2020, así que la primera crisis posible es 2035.

### 5.3 Parámetros

| Parámetro | Central | Rango | Fuente |
|---|---|---|---|
| g_max | log₁₀ 4,5 | log₁₀ 4 – log₁₀ 5 | Epoch AI: cómputo de entrenamiento ×4–5/año |
| g_min | log₁₀ 1,35 | log₁₀ 1,25 – log₁₀ 1,45 | Epoch AI: mejora de precio-rendimiento del hardware |
| L_max | 12 | 9 – 15 | **supuesto** (techo físico y económico) |
| φ (freno por crisis) | 0,7 | 0,5 – 0,9 | **supuesto** |
| A₀ | 0,05 | 0,02 – 0,10 | **supuesto** acotado por Eloundou et al. 2023 (exposición de tareas) |
| A_max, n, L₅₀ | 0,98 · 2 · 6,5 | – · 1,5–3 · 4,5–9 | **supuesto**, calibrado contra Grace et al. 2024 |
| E₀ | 0,58 | 0,56 – 0,60 | OIT: relación empleo-población |
| κ_min, κ_max | 0,3 · 0,8 | 0,2–0,4 · 0,7–0,9 | **supuesto** (Acemoglu y Restrepo 2019: nuevas tareas) |
| G₀ | 60 | 57 – 63 | Milanovic 2024: Gini mundial 60,1 en 2018 |
| a, b | 30 · 25 | 20–40 · 15–35 | **supuesto** |
| R₀ | 0,0051 | 0,0047 – 0,0056 | IFR World Robotics (4,28 M en 2023), extrapolado a 2026 |
| r_min, r_max | 0,12 · 0,35 | 0,10–0,14 · 0,30–0,40 | IFR 2016–2023 (~13 %/año) · **supuesto** |
| R_sat | 10 | 2 – 20 | **supuesto** |
| σ | 1,0 | 0,5 – 1,5 | **supuesto** |
| EIA₀ | 550 TWh | 480 – 620 | AIE *Energy and AI* 2025 (415 TWh en 2024, interpolado a 2026) |
| ε, η | 0,2 · 0,02 | 0,15–0,3 · 0,01–0,04 | **supuesto**, calibrado contra la AIE 2030 |
| TE₀ | 620 EJ | 600 – 640 | Energy Institute, *Statistical Review* |
| γ_min, γ_max | 0,004 · 0,016 | 0,001–0,007 · 0,013–0,019 | **supuesto** acotado por escenarios de la AIE |
| Q₀ | 0,19 | 0,17 – 0,21 | Energy Institute (energía primaria no fósil) |
| q₀, λ | 0,05 · 0,3 | 0,03–0,08 · 0,1–0,5 | **supuesto** |
| Em₀ | 37,4 GtCO₂ | 36 – 39 | Global Carbon Budget (fósil) |
| U₀, υ | 4,2 GtCO₂ · 0,02 | 3,2–5,2 · 0,01–0,04 | Global Carbon Budget (uso del suelo) · **supuesto** |
| T₀ | 1,4 °C | 1,3 – 1,5 | Forster et al. 2024 (calentamiento inducido) + OMM |
| TCRE | 0,45 °C/1000 GtCO₂ | 0,27 – 0,63 | IPCC AR6 GT1 |
| P_ONU, z_ONU | variante media · 0 | z ∈ [−1, 1], ±10 % en 2100 | ONU, World Population Prospects 2024 (anchura aproximada del intervalo) |
| μ | 0,01 | 0 – 0,03 | **supuesto** |
| Π₀, c, d | 50 · 6 · 10 | 40–60 · 3–9 · 5–15 | **supuesto** (índice ilustrativo) |
| h_nat, h_IA, h_conf | 0,0008 · 0,01 · 0,004 | 0,0005–0,0011 · 0,006–0,014 · 0,002–0,006 | calibrados contra el Existential Risk Persuasion Tournament (Karger et al. 2023) |
| θ, D | 0,7 · 5 años | 0,6–0,8 · 3–8 | **supuesto** |

Los valores numéricos de las fuentes se verifican contra el documento original durante la implementación (una
tarea propia del plan) y se guardan en la colección `fuentes` con `url` y `fechaAcceso`.

### 5.4 Incertidumbre
- 200 simulaciones; en cada una, los parámetros con rango se muestrean de forma uniforme.
- Generador `mulberry32` con semilla `2026`.
- Resultado por indicador: percentiles 10, 50 y 90 por año.
- Los eventos se calculan sobre la serie mediana.

### 5.5 Eventos
Cada evento tiene un umbral y un texto en ES y EN, y se dispara una sola vez; `crisis` se registra en cada inicio:

| id | Condición | Texto (ES) |
|---|---|---|
| `ia-mitad-tareas` | A ≥ 0,5 | La IA ya puede hacer la mitad de las tareas humanas. |
| `robots-mil-millones` | R ≥ 1 | Mil millones de robots en funcionamiento. |
| `ia-mas-que-japon` | EIA ≥ 1000 TWh | Los centros de datos consumen más electricidad que Japón entero. |
| `ciencia-x10` | S ≥ 10 | La ciencia avanza diez veces más rápido que en 2026. |
| `limpia-50`, `limpia-90` | Q ≥ 0,5 / 0,9 | La mitad (nueve de cada diez) de la energía ya es limpia. |
| `cero-neto` | Em ≤ 1 GtCO₂ | Emisiones de CO₂ prácticamente en cero. |
| `supera-1_5`, `supera-2`, `supera-3` | T ≥ 1,5 / 2 / 3 | El planeta supera 1,5 °C (2 °C, 3 °C) de calentamiento. |
| `pico-poblacion` | P(t) < P(t−1) por primera vez | La población mundial alcanza su máximo. |
| `poder-concentrado` | Π ≥ 80 | El poder se concentra en muy pocas manos. |
| `riesgo-10` | riesgo ≥ 0,10 | El riesgo acumulado de catástrofe supera el 10 %. |
| `crisis` | inicio de crisis | Estalla una crisis global que frena la economía y la IA. |

### 5.6 Calibración (pruebas automáticas)
- **Retro-calibración**: con `r_min`, la ecuación de robots partiendo de 1,828 M (IFR, 2016) llega a ±15 % de
  los 4,28 M de 2023 (IFR); la de capacidad reproduce el ×4–5 anual de Epoch con `f = 1`.
- **Electricidad de la IA en 2030** (posición central 0,5/0,5): dentro de ±30 % del caso base de la AIE (~945 TWh).
- **Temperatura media 2081–2100** (IPCC AR6, tabla SPM.1):
  - Frontera en paz: dentro de SSP1-2.6 (1,3–2,4 °C).
  - Pausa: entre el mínimo de SSP1-2.6 y el máximo de SSP2-4.5 (1,3–3,5 °C).
  - Posición central (0,5/0,5): dentro de SSP2-4.5 (2,1–3,5 °C).
  - Carrera y Fractura: entre el mínimo de SSP2-4.5 y el máximo de SSP5-8.5 (2,1–5,7 °C), y por encima de
    Frontera en paz.
- **Automatización al 50 %** en la posición central: entre 2047 y 2116 (Grace et al. 2024: IA de nivel humano y
  automatización plena de ocupaciones).
- **Población 2100**: dentro del intervalo del 95 % de la ONU (9,0–11,4 mil millones, WPP 2024).
- **Riesgo a 2100**: centro entre 9 % y 20 % (superpronosticadores y expertos en el XPT); Pausa por debajo de 9 %;
  Carrera por encima de 20 %. Esta elección es editorial y se declara en `/futuros/`.

### 5.7 Límites del modelo (se publican en `/futuros/`)
- No predice: enlaza supuestos con consecuencias.
- La temperatura solo cuenta el CO₂ (el metano y otros gases se omiten) y no modela la captura de carbono, así
  que nunca baja: como mucho se estabiliza al llegar a cero emisiones.
- La población no reacciona a catástrofes; el riesgo se muestra como probabilidad, no se simula el evento.
- Los índices de poder y desigualdad son ilustrativos.
- La ONU proyecta hasta 2100; después extendemos su última tasa.
- Las relaciones entre variables son simples a propósito, para que se puedan leer y discutir.

## 6. Experiencia de un futuro

```
ESCRITORIO (≥ 64 rem)
┌─ relato ──────────────────────────────┬─ panel fijo ─────────────────────┐
│ CARRERA · Sin reglas ni freno         │ 2056                             │
│ Supuestos: … · ∿ Escenario            │ ┌──┬──┐ Paz      ▀▀░░░░ 20 %     │
│                                       │ │  │  │ Frontera ▀▀▀▀▀░ 90 %     │
│ 2056                     (año grande) │ ├──┼─●┤ [Volver a Carrera]       │
│ Humanidad …<cifra 41 %>…              │ └──┴──┘                          │
│ Robots y tecnología …                 │ Capacidad  ╱‾‾ │ ×10⁴            │
│ Ciencia …                             │ Robots     _╱‾ │ 2,1 mil M       │
│ Planeta …                             │ … 11 gráficos, banda 80 %, cursor │
│ Política …                            │                                  │
│ Eventos de la década                  │                                  │
└───────────────────────────────────────┴──────────────────────────────────┘
MÓVIL: barra inferior (año + capacidad, temperatura, riesgo) → se despliega.
```

- Paradas: 2026, 2036, 2046 … 2126 (11). Cada una tiene un `id` igual al año para enlazar.
- La parada visible se detecta con `IntersectionObserver`, sin escuchar el evento de scroll.
- Cada gráfico usa una **escala fija** por indicador (la misma en los cuatro futuros), para que la comparación sea honesta.
- **Color por ámbito**, no por serie: humanidad, tecnología, ciencia, planeta y política tienen un token
  `--ambito-*` (contraste ≥ 4,5:1 en ambos temas). Cifras del texto y líneas de sus gráficos comparten ese color.
- 12 series en 11 gráficos: automatización y empleo comparten el gráfico **Trabajo**.
- Las cifras del texto comparten color con su gráfico.
- Paleta de series: se deriva de los tokens (tinta, enlace, sodio, regla) siguiendo el skill de dataviz. Ningún
  futuro usa `--etico` o `--no-etico`.

## 7. Contenido y relato

- `src/content/futuros/<idioma>/<cuadrante>.mdx`. Frontmatter: `premisa`, `supuestos[]`, `ganancias[]`,
  `perdidas[]`. Nombre y lema viven en `src/i18n/ui.ts`; slug y posición inicial, en `CUADRANTES` (código).
- Los componentes MDX leen los resultados del modelo desde `Astro.locals.futuro` (verificado en un build estático).
- Componentes MDX:
  - `<Parada anio={2056}>`: una década.
  - `<Ambito id="humanidad|tecnologia|ciencia|planeta|politica">`: un ámbito dentro de la parada.
  - `<Cifra v="robots" anio={2056} formato="miles-de-millones" />`: número del modelo en el texto.
- Primera entrega: relato escrito en 2036, 2056, 2086 y 2126. En las demás décadas, un resumen automático
  con cifras y eventos.
- Redacción: Claude escribe los borradores ES y EN a partir del modelo y las fuentes; el autor los revisa antes
  de publicar. Se aplica R10 (contenido sensible).
- Nivel de evidencia de todas las páginas de futuros: `escenario-ficcion` (línea ondulada visible).

## 8. Arquitectura de código

```
src/lib/futuros/
  tipos.ts        Posicion, Indicador, Serie, Resultado, Evento, CuadranteId
  parametros.ts   PARAMETROS (central, rango, fuente | 'supuesto'), validados con Zod
  datos-onu.ts    variante media e intervalo WPP 2024 (2026–2100)
  modelo.ts       simular(pos, params) → series anuales
  montecarlo.ts   mulberry32, proyectar(pos, semilla, corridas) → Resultado (p10/p50/p90)
  eventos.ts      EVENTOS, detectarEventos(serieMediana)
  posicion.ts     leerPosicion(URLSearchParams, porDefecto), cuadranteCercano(pos)
  trazado.ts      rutaSvg(serie, ancho, alto) → atributo d (compartido servidor/cliente)
src/components/futuros/
  MatrizFuturos.astro   portada y mini matriz del panel
  PanelFuturo.astro     panel con gráficos SVG calculados al compilar
  panel-futuro.ts       isla <ptf-futuro>: controles, recálculo, URL, cifras, cursor
  Parada.astro · Ambito.astro · Cifra.astro
  Grafico.astro         small multiple SVG + “Ver datos”
src/components/vistas/PaginaFuturo.astro · PaginaFuturos.astro
src/pages/futuros/[slug].astro · src/pages/futuros/index.astro (y sus equivalentes en /en/futures/)
```

Interfaces principales:

```ts
interface Posicion { paz: number; frontera: number }            // 0–1
type Indicador = 'capacidad' | 'automatizacion' | 'empleo' | 'desigualdad' | 'robots' | 'ciencia'
  | 'energiaIA' | 'energiaLimpia' | 'temperatura' | 'poblacion' | 'poder' | 'riesgo';
interface Resultado {
  anios: number[];                                                // 2026…2126
  p10: Record<Indicador, number[]>; p50: …; p90: …;
  eventos: { id: string; anio: number }[];
}
function proyectar(pos: Posicion, semilla?: number, corridas?: number): Resultado;
```

`modelo.ts` y `montecarlo.ts` no importan nada del DOM ni de Astro: se ejecutan igual al compilar y en el navegador.

## 9. Errores
- Parámetros de URL inválidos o fuera de rango: se recortan a 0–1; si no son números, se usa el preset del futuro.
- Si el recálculo lanza un error en el navegador: se conserva lo calculado al compilar, aparece “No se pudo
  recalcular; mostramos el escenario base” en una región `role="status"` y se registra con `console.warn`.
- Si un parámetro de `parametros.ts` no pasa la validación, el build falla con el nombre del parámetro.

## 10. Pruebas

**Vitest (se escriben primero)**
- Invariantes: toda serie dentro de su rango físico; A, Q y riesgo en [0, 1]; ninguna serie es `NaN`.
- Monotonía con todo lo demás igual: más `frontera` da más capacidad en 2126; más `paz` da menos riesgo y menos
  concentración del poder.
- La temperatura cumple exactamente la ecuación TCRE con emisiones conocidas.
- Determinismo: misma posición y semilla dan el mismo `Resultado`.
- Percentiles correctos sobre una muestra conocida.
- Calibración: todos los objetivos de 5.6.
- Eventos: se disparan en el primer año que cruza el umbral, una sola vez.
- `leerPosicion` y `cuadranteCercano`: valores límite, texto inválido, ausencia de parámetros.
- Rendimiento: `proyectar` con 200 corridas en menos de 50 ms.

**Playwright + axe**
- Las cuatro puertas de la portada llevan a su futuro, en ES y EN.
- Mover un control con el teclado cambia la URL, una cifra del texto y el gráfico.
- Abrir `?paz=0.9&frontera=0.9` en `/futuros/carrera/` muestra el aviso de cuadrante más cercano.
- Sin JS (`javaScriptEnabled: false`) la página muestra cifras y relato.
- La barra inferior se despliega en móvil.
- axe sin violaciones en ambos temas e idiomas; `test:csp` y Lighthouse con los presupuestos actuales.

## 11. Alcance

**Primera entrega**
- Portada con la matriz; regla de escala en la sección de temas; enlace Futuros.
- `/futuros/` con ecuaciones, parámetros, calibración y límites.
- Cuatro futuros con relato escrito en 2036, 2056, 2086 y 2126 y resumen automático en las demás décadas, en ES y EN.

**Después**
- Relato escrito en todas las décadas.
- Vista de comparación lado a lado.
- Ramas de los futuros en la capa futura de la línea de tiempo (R6.2).
- Página de señales tempranas (R16).

## 12. Riesgos
- **Credibilidad**: un modelo propio a 100 años puede leerse como profecía. Mitigación: etiqueta de escenario,
  bandas visibles, límites publicados y supuestos marcados como tales.
- **Volumen de texto**: 4 futuros × 4 paradas × 2 idiomas en la primera entrega. Mitigación: resumen automático
  en el resto de las décadas.
- **Neutralidad**: el lector debe poder reconocer lo bueno y lo malo de cada futuro. Mitigación: `ganancias` y
  `perdidas` obligatorias en el frontmatter y revisión del autor.
