# Futuros Paz × Frontera: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portada con la matriz Paz × Frontera y cuatro futuros a 100 años (2026–2126), calculados por un modelo abierto e interactivo, en español e inglés.

**Architecture:** La lógica vive en `src/lib/futuros/` como TypeScript puro (sin DOM ni Astro) y corre igual al compilar y en el navegador. Las páginas se generan estáticas con el escenario base; una isla `<ptf-futuro>` (custom element, sin framework) recalcula al mover los controles. El relato está en MDX y sus componentes leen el resultado del modelo desde `Astro.locals.futuro`.

**Tech Stack:** Astro 7 (estático), TypeScript estricto, MDX, Zod (`astro/zod`), `temml` (LaTeX → MathML al compilar), Vitest, Playwright + axe, Lighthouse CI.

**Spec:** `specs/peacethefrontier/futuros.md` (léelo antes de empezar; este plan argumenta desde él).

## Global Constraints

- Rama de trabajo: `feat/futuros` (créala desde `main` antes de la tarea 1).
- Mensajes de commit: `<tipo>: <descripción>` (feat, fix, test, docs, chore, refactor). **Sin** líneas `Co-Authored-By` (atribución desactivada por el autor).
- Textos de interfaz solo en `src/i18n/ui.ts`; el inglés debe tener las mismas claves que el español.
- Colores solo desde tokens de `src/styles/tokens.css`; nada de hex sueltos en componentes.
- CSP: no añadir `<script>` ni `<style>` en línea sin hash. `npm run test:csp` debe pasar tras cada build.
- Años del modelo: 2026–2126 (`ANIOS = 101`). Corridas de Monte Carlo: 200, semilla 2026.
- Rendimiento: `proyectar` con 200 corridas < 50 ms (150 ms en CI). JS de la isla < 50 KB comprimido.
- Accesibilidad: WCAG 2.2 AA; axe sin violaciones en ambos temas e idiomas. Contraste de `--ambito-*` ≥ 4,5:1.
- Los cuatro futuros tienen igual peso visual; ninguno usa `--etico` ni `--no-etico`.
- Todo número que aparezca en el relato sale del modelo vía `<Cifra>`; nunca se escribe a mano.
- Contenido sensible (R10 del spec general): armas, biología y vigilancia solo desde historia, política y gobernanza.
- Comandos: `npm test` (Vitest), `npm run check` (tipos), `npm run build`, `npm run test:csp`, `npm run test:e2e`, `npx lhci autorun`.

## Review Focus

1. **URL con un solo parámetro** (`?paz=0.3`): el otro eje debe tomar el valor del futuro, no 0 ni `NaN`. Prueba en la tarea 4.
2. **Hash que no es una década** (`#abc`, `#2050`): la página no debe lanzar errores y el panel debe mostrar un año válido. Prueba en la tarea 10.
3. **Arrastre rápido del control** (decenas de eventos `input` seguidos): un recálculo por fotograma, estado final coherente, sin errores. Prueba en la tarea 10.
4. **“Volver a <futuro>”**: restaura la posición inicial y quita `?paz=…` de la URL. Prueba en la tarea 10.
5. **Página en inglés**: cifras con formato inglés (punto decimal) y `aria-valuetext` en inglés. Prueba en la tarea 11.

---

## Mapa de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/lib/futuros/tipos.ts` | Tipos y constantes compartidas (años, indicadores, ámbitos, resultado) |
| `src/lib/futuros/parametros.ts` | Parámetros con valor central, rango y fuente; validación Zod |
| `src/lib/futuros/datos-onu.ts` | Variante media de la ONU (WPP 2024) e interpolación |
| `src/lib/futuros/modelo.ts` | `simular`: un siglo año a año |
| `src/lib/futuros/eventos.ts` | Umbrales que disparan eventos del relato |
| `src/lib/futuros/montecarlo.ts` | Azar con semilla, percentiles y `proyectar` |
| `src/lib/futuros/posicion.ts` | Cuatro futuros, slugs, URL y cuadrante más cercano |
| `src/lib/futuros/calibracion.ts` | Objetivos de calibración contra fuentes (pruebas y página) |
| `src/lib/futuros/formato.ts` | Cómo se escribe cada indicador (ES/EN) |
| `src/lib/futuros/trazado.ts` | Escalas fijas, gráficos y trazados SVG |
| `src/lib/futuros/contexto.ts` | Acceso tipado a `Astro.locals.futuro` |
| `src/lib/futuros/ecuaciones.ts` | Ecuaciones en LaTeX con su explicación |
| `src/content/fuentes.yaml` | Fichas de las fuentes del modelo |
| `src/content/futuros/<idioma>/<futuro>.mdx` | Relato de cada futuro |
| `src/content/paginas/<idioma>/futuros.mdx` | Página del modelo (`/futuros/`) |
| `src/components/futuros/*.astro` | Matriz, gráfico, panel, parada, ámbito, cifra, ecuaciones, tablas |
| `src/components/futuros/panel-futuro.ts` | Isla `<ptf-futuro>` |
| `src/components/vistas/PaginaFuturo.astro` | Vista de un futuro |
| `src/pages/futuros/…`, `src/pages/en/futures/…` | Rutas ES y EN |
| `tests/e2e/futuros.spec.ts` | Pruebas de navegador de los futuros |

---

### Task 1: Tipos, parámetros y población de la ONU

**Files:**
- Create: `src/lib/futuros/tipos.ts`
- Create: `src/lib/futuros/parametros.ts`
- Create: `src/lib/futuros/datos-onu.ts`
- Test: `src/lib/futuros/parametros.test.ts`

**Interfaces:**
- Consumes: `Idioma` de `src/i18n/rutas.ts`.
- Produces: `ANIO_INICIAL`, `ANIOS`, `Posicion`, `INDICADORES`, `Indicador`, `VARIABLES`, `Variable`, `Series`, `seriesVacias()`, `AMBITOS`, `Ambito`, `AMBITO_DE`, `Evento`, `Resultado` (tipos.ts); `Parametro`, `PARAMETROS`, `NombreParametro`, `Valores`, `valoresCentrales()`, `validarParametros(parametros?)` (parametros.ts); `POBLACION_ONU`, `poblacionOnu(anio: number): number` (datos-onu.ts).

- [ ] **Step 1: Crea la rama**

```bash
git switch -c feat/futuros
```

- [ ] **Step 2: Escribe la prueba (falla)**

`src/lib/futuros/parametros.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { PARAMETROS, validarParametros, valoresCentrales, type Parametro } from './parametros';
import { poblacionOnu } from './datos-onu';

describe('parámetros', () => {
	test('todos los parámetros reales son válidos', () => {
		expect(() => validarParametros()).not.toThrow();
	});

	test('un valor central fuera de su rango rompe con el nombre del parámetro', () => {
		const roto: Record<string, Parametro> = {
			tcre: { ...PARAMETROS.tcre, central: 0.9 },
		};
		expect(() => validarParametros(roto)).toThrow('Parámetro tcre: el valor central queda fuera del rango');
	});

	test('cada parámetro tiene fuente o está marcado como supuesto', () => {
		for (const p of Object.values(PARAMETROS)) expect(p.fuente).toMatch(/^[a-z0-9-]+$/);
	});

	test('valoresCentrales devuelve el central de cada parámetro', () => {
		const v = valoresCentrales();
		expect(v.tcre).toBe(0.45);
		expect(Object.keys(v)).toHaveLength(Object.keys(PARAMETROS).length);
	});
});

describe('población de la ONU', () => {
	test('interpola la variante media entre puntos', () => {
		expect(poblacionOnu(2025)).toBeCloseTo(8.23, 5);
		expect(poblacionOnu(2027.5)).toBeCloseTo(8.4, 5);
	});

	test('el máximo cae a mediados de los 2080 y 2100 queda en 10,2 mil millones (resumen WPP 2024)', () => {
		const anios = Array.from({ length: 76 }, (_, i) => 2025 + i);
		const pico = anios.reduce((a, b) => (poblacionOnu(b) > poblacionOnu(a) ? b : a));
		expect(pico).toBeGreaterThanOrEqual(2080);
		expect(pico).toBeLessThanOrEqual(2089);
		expect(poblacionOnu(2100)).toBeCloseTo(10.2, 1);
	});

	test('después de 2100 prolonga la tasa 2095–2100', () => {
		const tasa = (10.18 / 10.24) ** (1 / 5);
		expect(poblacionOnu(2110)).toBeCloseTo(10.18 * tasa ** 10, 6);
	});
});
```

- [ ] **Step 3: Ejecútala para verla fallar**

Run: `npx vitest run src/lib/futuros/parametros.test.ts`
Expected: FAIL con `Failed to resolve import "./parametros"`.

- [ ] **Step 4: Escribe `tipos.ts`**

```ts
// Tipos compartidos del modelo de futuros (spec futuros.md §8). Sin dependencias: sirve al build y al navegador.

export const ANIO_INICIAL = 2026;
/** 2026…2126, ambos incluidos. */
export const ANIOS = 101;

export interface Posicion {
	/** 0 = sin reglas ni cooperación; 1 = máxima. */
	paz: number;
	/** 0 = la IA casi no avanza; 1 = máxima velocidad. */
	frontera: number;
}

export const INDICADORES = [
	'capacidad',
	'automatizacion',
	'empleo',
	'desigualdad',
	'robots',
	'ciencia',
	'energiaIA',
	'energiaLimpia',
	'temperatura',
	'poblacion',
	'poder',
	'riesgo',
] as const;
export type Indicador = (typeof INDICADORES)[number];

/** Indicadores visibles más dos variables internas: crisis (0/1) y emisiones (GtCO₂/año). */
export const VARIABLES = [...INDICADORES, 'crisis', 'emisiones'] as const;
export type Variable = (typeof VARIABLES)[number];
export type Series = Record<Variable, number[]>;

export const seriesVacias = (): Series =>
	Object.fromEntries(VARIABLES.map((v) => [v, [] as number[]])) as Series;

export const AMBITOS = ['humanidad', 'tecnologia', 'ciencia', 'planeta', 'politica'] as const;
export type Ambito = (typeof AMBITOS)[number];

export const AMBITO_DE: Record<Indicador, Ambito> = {
	capacidad: 'tecnologia',
	energiaIA: 'tecnologia',
	robots: 'tecnologia',
	automatizacion: 'humanidad',
	empleo: 'humanidad',
	desigualdad: 'humanidad',
	poblacion: 'humanidad',
	ciencia: 'ciencia',
	temperatura: 'planeta',
	energiaLimpia: 'planeta',
	poder: 'politica',
	riesgo: 'politica',
};

export interface Evento {
	id: string;
	anio: number;
}

export interface Resultado {
	anios: number[];
	p10: Series;
	p50: Series;
	p90: Series;
	/** Detectados sobre la mediana (p50). */
	eventos: Evento[];
}
```

- [ ] **Step 5: Escribe `parametros.ts`**

```ts
// Parámetros del modelo (spec futuros.md §5.3): valor central, rango para Monte Carlo y fuente.
// `fuente` es un id de src/content/fuentes.yaml o 'supuesto' (se muestra como tal en /futuros/).
import { z } from 'astro/zod';
import type { Idioma } from '../../i18n/rutas';

export interface Parametro {
	/** Como aparece en las ecuaciones (LaTeX). */
	simbolo: string;
	descripcion: Record<Idioma, string>;
	central: number;
	min: number;
	max: number;
	fuente: string;
	entero?: boolean;
}

const log = Math.log10;

export const PARAMETROS = {
	gMax: { simbolo: 'g_{max}', descripcion: { es: 'Crecimiento anual máximo de la capacidad (órdenes de magnitud)', en: 'Maximum yearly capability growth (orders of magnitude)' }, central: log(4.5), min: log(4), max: log(5), fuente: 'epoch-computo' },
	gMin: { simbolo: 'g_{min}', descripcion: { es: 'Crecimiento anual mínimo: solo mejora el hardware', en: 'Minimum yearly growth: hardware improvement only' }, central: log(1.35), min: log(1.25), max: log(1.45), fuente: 'epoch-hardware' },
	lMax: { simbolo: 'L_{max}', descripcion: { es: 'Techo de la capacidad (órdenes de magnitud sobre 2026)', en: 'Capability ceiling (orders of magnitude above 2026)' }, central: 12, min: 9, max: 15, fuente: 'supuesto' },
	phi: { simbolo: '\\varphi', descripcion: { es: 'Freno que causa una crisis', en: 'Slowdown caused by a crisis' }, central: 0.7, min: 0.5, max: 0.9, fuente: 'supuesto' },
	a0: { simbolo: 'A_0', descripcion: { es: 'Tareas automatizables en 2026', en: 'Automatable tasks in 2026' }, central: 0.05, min: 0.02, max: 0.1, fuente: 'eloundou-2023' },
	aMax: { simbolo: 'A_{max}', descripcion: { es: 'Máximo de tareas automatizables', en: 'Maximum automatable tasks' }, central: 0.98, min: 0.98, max: 0.98, fuente: 'supuesto' },
	n: { simbolo: 'n', descripcion: { es: 'Pendiente de la curva de automatización', en: 'Steepness of the automation curve' }, central: 2, min: 1.5, max: 3, fuente: 'supuesto' },
	l50: { simbolo: 'L_{50}', descripcion: { es: 'Capacidad a la que se automatiza la mitad de las tareas', en: 'Capability at which half of all tasks are automated' }, central: 6.5, min: 4.5, max: 9, fuente: 'grace-2024' },
	e0: { simbolo: 'E_0', descripcion: { es: 'Población en edad de trabajar con empleo, 2026', en: 'Working-age population in employment, 2026' }, central: 0.58, min: 0.56, max: 0.6, fuente: 'oit-empleo' },
	kMin: { simbolo: '\\kappa_{min}', descripcion: { es: 'Desplazamiento compensado sin paz', en: 'Displacement offset without peace' }, central: 0.3, min: 0.2, max: 0.4, fuente: 'acemoglu-restrepo-2019' },
	kMax: { simbolo: '\\kappa_{max}', descripcion: { es: 'Desplazamiento compensado con paz plena', en: 'Displacement offset with full peace' }, central: 0.8, min: 0.7, max: 0.9, fuente: 'acemoglu-restrepo-2019' },
	gini0: { simbolo: 'G_0', descripcion: { es: 'Desigualdad mundial en 2026 (Gini × 100)', en: 'Global inequality in 2026 (Gini × 100)' }, central: 62, min: 58, max: 67, fuente: 'milanovic-2024' },
	aG: { simbolo: 'a', descripcion: { es: 'Desigualdad que añade la automatización sin reglas', en: 'Inequality added by unregulated automation' }, central: 30, min: 20, max: 40, fuente: 'supuesto' },
	bG: { simbolo: 'b', descripcion: { es: 'Desigualdad que corrige la redistribución', en: 'Inequality corrected by redistribution' }, central: 25, min: 15, max: 35, fuente: 'supuesto' },
	r0: { simbolo: 'R_0', descripcion: { es: 'Robots en funcionamiento en 2026 (miles de millones)', en: 'Robots in operation in 2026 (billions)' }, central: 0.0051, min: 0.0047, max: 0.0056, fuente: 'ifr-2024' },
	rMin: { simbolo: 'r_{min}', descripcion: { es: 'Crecimiento anual de robots al ritmo histórico', en: 'Yearly robot growth at the historical pace' }, central: 0.12, min: 0.1, max: 0.14, fuente: 'ifr-2024' },
	rMax: { simbolo: 'r_{max}', descripcion: { es: 'Crecimiento anual máximo de robots', en: 'Maximum yearly robot growth' }, central: 0.35, min: 0.3, max: 0.4, fuente: 'supuesto' },
	rSat: { simbolo: 'R_{sat}', descripcion: { es: 'Robots por unidad de automatización (miles de millones)', en: 'Robots per unit of automation (billions)' }, central: 10, min: 2, max: 20, fuente: 'supuesto' },
	sigma: { simbolo: '\\sigma', descripcion: { es: 'Aceleración de la ciencia por orden de magnitud de IA', en: 'Science speed-up per order of magnitude of AI' }, central: 1, min: 0.5, max: 1.5, fuente: 'supuesto' },
	eia0: { simbolo: 'E_{IA,0}', descripcion: { es: 'Electricidad de los centros de datos en 2026 (TWh)', en: 'Data-center electricity in 2026 (TWh)' }, central: 550, min: 480, max: 620, fuente: 'aie-energia-ia' },
	eps: { simbolo: '\\varepsilon', descripcion: { es: 'Electricidad adicional por orden de magnitud de IA', en: 'Extra electricity per order of magnitude of AI' }, central: 0.2, min: 0.15, max: 0.3, fuente: 'aie-energia-ia' },
	eta: { simbolo: '\\eta', descripcion: { es: 'Mejora anual de eficiencia de los centros de datos', en: 'Yearly data-center efficiency gain' }, central: 0.02, min: 0.01, max: 0.04, fuente: 'supuesto' },
	te0: { simbolo: 'TE_0', descripcion: { es: 'Energía primaria mundial en 2026 (EJ)', en: 'World primary energy in 2026 (EJ)' }, central: 620, min: 600, max: 640, fuente: 'ei-statistical-review' },
	gammaMin: { simbolo: '\\gamma_{min}', descripcion: { es: 'Crecimiento anual de la demanda de energía con IA lenta', en: 'Yearly energy-demand growth with slow AI' }, central: 0.004, min: 0.001, max: 0.007, fuente: 'supuesto' },
	gammaMax: { simbolo: '\\gamma_{max}', descripcion: { es: 'Crecimiento anual de la demanda de energía con IA rápida', en: 'Yearly energy-demand growth with fast AI' }, central: 0.016, min: 0.013, max: 0.019, fuente: 'supuesto' },
	q0: { simbolo: 'Q_0', descripcion: { es: 'Proporción de energía primaria limpia en 2026', en: 'Clean share of primary energy in 2026' }, central: 0.19, min: 0.17, max: 0.21, fuente: 'ei-statistical-review' },
	qRate: { simbolo: 'q_0', descripcion: { es: 'Velocidad base de la transición energética', en: 'Baseline speed of the energy transition' }, central: 0.05, min: 0.03, max: 0.08, fuente: 'supuesto' },
	lambda: { simbolo: '\\lambda', descripcion: { es: 'Impulso de la ciencia a la transición', en: 'Boost from science to the transition' }, central: 0.3, min: 0.1, max: 0.5, fuente: 'supuesto' },
	em0: { simbolo: 'Em_0', descripcion: { es: 'Emisiones fósiles de CO₂ en 2026 (Gt)', en: 'Fossil CO₂ emissions in 2026 (Gt)' }, central: 37.4, min: 36, max: 39, fuente: 'gcb-2024' },
	u0: { simbolo: 'U_0', descripcion: { es: 'Emisiones por uso del suelo en 2026 (Gt)', en: 'Land-use emissions in 2026 (Gt)' }, central: 4.2, min: 3.2, max: 5.2, fuente: 'gcb-2024' },
	upsilon: { simbolo: '\\upsilon', descripcion: { es: 'Descenso anual de las emisiones del suelo', en: 'Yearly decline of land-use emissions' }, central: 0.02, min: 0.01, max: 0.04, fuente: 'supuesto' },
	t0: { simbolo: 'T_0', descripcion: { es: 'Calentamiento en 2026 (°C sobre la era preindustrial)', en: 'Warming in 2026 (°C above pre-industrial)' }, central: 1.4, min: 1.3, max: 1.5, fuente: 'forster-2024' },
	tcre: { simbolo: '\\mathrm{TCRE}', descripcion: { es: 'Calentamiento por cada 1000 Gt de CO₂ (°C)', en: 'Warming per 1000 Gt of CO₂ (°C)' }, central: 0.45, min: 0.27, max: 0.63, fuente: 'ipcc-ar6-wg1' },
	zOnu: { simbolo: 'z_{ONU}', descripcion: { es: 'Desviación dentro del intervalo de la ONU (±10 % en 2100)', en: 'Deviation within the UN interval (±10% by 2100)' }, central: 0, min: -1, max: 1, fuente: 'onu-wpp-2024' },
	mu: { simbolo: '\\mu', descripcion: { es: 'Efecto de la ciencia en la población (salud)', en: 'Effect of science on population (health)' }, central: 0.01, min: 0, max: 0.03, fuente: 'supuesto' },
	pi0: { simbolo: '\\Pi_0', descripcion: { es: 'Concentración del poder en 2026 (índice 0–100)', en: 'Power concentration in 2026 (index 0–100)' }, central: 50, min: 40, max: 60, fuente: 'supuesto' },
	cPi: { simbolo: 'c', descripcion: { es: 'Concentración por orden de magnitud de IA sin paz', en: 'Concentration per order of magnitude of AI without peace' }, central: 6, min: 3, max: 9, fuente: 'supuesto' },
	dPi: { simbolo: 'd', descripcion: { es: 'Desconcentración que aporta la paz', en: 'Deconcentration brought by peace' }, central: 10, min: 5, max: 15, fuente: 'supuesto' },
	hNat: { simbolo: 'h_{nat}', descripcion: { es: 'Riesgo anual de base (pandemias, guerra nuclear, naturales)', en: 'Baseline yearly risk (pandemics, nuclear war, natural)' }, central: 0.0008, min: 0.0005, max: 0.0011, fuente: 'xpt-2023' },
	hIa: { simbolo: 'h_{IA}', descripcion: { es: 'Riesgo anual por avance rápido de la IA sin paz', en: 'Yearly risk from fast AI progress without peace' }, central: 0.01, min: 0.006, max: 0.014, fuente: 'xpt-2023' },
	hConf: { simbolo: 'h_{conf}', descripcion: { es: 'Riesgo anual por concentración del poder', en: 'Yearly risk from power concentration' }, central: 0.004, min: 0.002, max: 0.006, fuente: 'xpt-2023' },
	theta: { simbolo: '\\theta', descripcion: { es: 'Umbral de tensión que desata una crisis', en: 'Tension threshold that triggers a crisis' }, central: 0.7, min: 0.6, max: 0.8, fuente: 'supuesto' },
	dCrisis: { simbolo: 'D', descripcion: { es: 'Duración de una crisis (años)', en: 'Duration of a crisis (years)' }, central: 5, min: 3, max: 8, fuente: 'supuesto', entero: true },
} satisfies Record<string, Parametro>;

export type NombreParametro = keyof typeof PARAMETROS;
export type Valores = Record<NombreParametro, number>;

export const valoresCentrales = (): Valores =>
	Object.fromEntries(Object.entries(PARAMETROS).map(([nombre, p]) => [nombre, p.central])) as Valores;

const esquema = z
	.object({
		simbolo: z.string().min(1),
		central: z.number(),
		min: z.number(),
		max: z.number(),
		fuente: z.string().min(1),
	})
	.refine((p) => p.min <= p.central && p.central <= p.max, {
		message: 'el valor central queda fuera del rango',
	});

/** Lanza un error con el nombre del parámetro inválido: rompe el build antes de publicar. */
export function validarParametros(parametros: Record<string, Parametro> = PARAMETROS): void {
	for (const [nombre, p] of Object.entries(parametros)) {
		const r = esquema.safeParse(p);
		if (!r.success) throw new Error(`Parámetro ${nombre}: ${r.error.issues[0]?.message}`);
	}
}
```

- [ ] **Step 6: Escribe `datos-onu.ts`**

```ts
// ONU, World Population Prospects 2024, variante media, mundo (miles de millones, a 1 de julio).
// Verificado contra https://population.un.org/wpp/ en la tarea de fuentes del plan.
export const POBLACION_ONU: readonly (readonly [anio: number, poblacion: number])[] = [
	[2025, 8.23],
	[2030, 8.57],
	[2035, 8.88],
	[2040, 9.16],
	[2045, 9.42],
	[2050, 9.66],
	[2055, 9.86],
	[2060, 10.03],
	[2065, 10.15],
	[2070, 10.24],
	[2075, 10.29],
	[2080, 10.31],
	[2085, 10.31],
	[2090, 10.28],
	[2095, 10.24],
	[2100, 10.18],
];

/** Interpola la variante media; después de 2100 prolonga la tasa 2095–2100 (la ONU no proyecta más allá). */
export function poblacionOnu(anio: number): number {
	const [primero] = POBLACION_ONU;
	const ultimo = POBLACION_ONU[POBLACION_ONU.length - 1];
	const penultimo = POBLACION_ONU[POBLACION_ONU.length - 2];
	if (anio <= primero[0]) return primero[1];
	if (anio >= ultimo[0]) {
		const tasa = (ultimo[1] / penultimo[1]) ** (1 / (ultimo[0] - penultimo[0]));
		return ultimo[1] * tasa ** (anio - ultimo[0]);
	}
	const i = POBLACION_ONU.findIndex(([a]) => a > anio);
	const [a0, v0] = POBLACION_ONU[i - 1];
	const [a1, v1] = POBLACION_ONU[i];
	return v0 + ((v1 - v0) * (anio - a0)) / (a1 - a0);
}
```

- [ ] **Step 7: Ejecuta la prueba**

Run: `npx vitest run src/lib/futuros/parametros.test.ts`
Expected: PASS (7 pruebas).

- [ ] **Step 8: Commit**

```bash
git add src/lib/futuros/tipos.ts src/lib/futuros/parametros.ts src/lib/futuros/datos-onu.ts src/lib/futuros/parametros.test.ts
git commit -m "feat: tipos, parámetros y población de la ONU del modelo de futuros"
```

---

### Task 2: El modelo

**Files:**
- Create: `src/lib/futuros/modelo.ts`
- Test: `src/lib/futuros/modelo.test.ts`

**Interfaces:**
- Consumes: `poblacionOnu` (tarea 1), `Valores`, `valoresCentrales` (tarea 1), `ANIO_INICIAL`, `ANIOS`, `seriesVacias`, `Posicion`, `Series` (tarea 1).
- Produces: `simular(pos: Posicion, k: Valores): Series`. Series anuales de 2026 a 2126. Unidades: `capacidad` = log₁₀ del cómputo relativo a 2026; `automatizacion`, `empleo`, `energiaLimpia`, `riesgo` = fracción 0–1; `desigualdad`, `poder` = 0–100; `robots`, `poblacion` = miles de millones; `ciencia` = multiplicador; `energiaIA` = TWh; `temperatura` = °C; `crisis` = 0/1; `emisiones` = GtCO₂.

- [ ] **Step 1: Escribe la prueba (falla)**

`src/lib/futuros/modelo.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { simular } from './modelo';
import { valoresCentrales, type Valores } from './parametros';
import { ANIOS, INDICADORES, VARIABLES } from './tipos';

const k = valoresCentrales();
const PASOS = [0, 0.25, 0.5, 0.75, 1];

describe('modelo', () => {
	test('devuelve 101 años (2026–2126) para cada variable', () => {
		const s = simular({ paz: 0.5, frontera: 0.5 }, k);
		for (const v of VARIABLES) expect(s[v]).toHaveLength(ANIOS);
	});

	test('arranca en los valores de 2026', () => {
		const s = simular({ paz: 0.5, frontera: 0.5 }, k);
		expect(s.capacidad[0]).toBe(0);
		expect(s.automatizacion[0]).toBeCloseTo(k.a0, 10);
		expect(s.robots[0]).toBe(k.r0);
		expect(s.temperatura[0]).toBe(k.t0);
		expect(s.riesgo[0]).toBeGreaterThan(0);
	});

	test('invariantes: nada infinito, fracciones en [0, 1], índices en su rango', () => {
		for (const paz of PASOS)
			for (const frontera of PASOS) {
				const s = simular({ paz, frontera }, k);
				for (const ind of INDICADORES) for (const v of s[ind]) expect(Number.isFinite(v)).toBe(true);
				for (const ind of ['automatizacion', 'empleo', 'energiaLimpia', 'riesgo'] as const)
					for (const v of s[ind]) {
						expect(v).toBeGreaterThanOrEqual(0);
						expect(v).toBeLessThanOrEqual(1);
					}
				for (const v of s.poder) expect(v).toBeGreaterThanOrEqual(0);
				for (const v of s.poder) expect(v).toBeLessThanOrEqual(100);
				for (const v of s.desigualdad) expect(v).toBeGreaterThanOrEqual(20);
				for (const v of s.desigualdad) expect(v).toBeLessThanOrEqual(90);
			}
	});

	test('la temperatura cumple exactamente la relación TCRE con emisiones constantes', () => {
		const fijo: Valores = { ...k, qRate: 0, gammaMin: 0, gammaMax: 0, eia0: 0, u0: 0, em0: 40 };
		const s = simular({ paz: 0.5, frontera: 0.5 }, fijo);
		expect(s.emisiones[3]).toBeCloseTo(40, 10);
		expect(s.temperatura[10]).toBeCloseTo(k.t0 + (k.tcre * 40 * 10) / 1000, 10);
	});

	test('más frontera da más capacidad en 2126, con la paz fija', () => {
		for (const paz of PASOS) {
			const capacidades = PASOS.map((frontera) => simular({ paz, frontera }, k).capacidad[100]);
			expect(capacidades).toEqual([...capacidades].sort((a, b) => a - b));
		}
	});

	test('más paz da menos riesgo y menos concentración del poder en 2126, con la frontera fija', () => {
		for (const frontera of PASOS) {
			const corridas = PASOS.map((paz) => simular({ paz, frontera }, k));
			const riesgos = corridas.map((s) => s.riesgo[100]);
			const poderes = corridas.map((s) => s.poder[100]);
			expect(riesgos).toEqual([...riesgos].sort((a, b) => b - a));
			expect(poderes).toEqual([...poderes].sort((a, b) => b - a));
		}
	});

	test('con poca paz estallan crisis cada 15 años desde 2035; con mucha paz, ninguna', () => {
		const inicios = (paz: number) => {
			const c = simular({ paz, frontera: 0.5 }, k).crisis;
			return c.flatMap((v, t) => (v === 1 && (t === 0 || c[t - 1] === 0) ? [2026 + t] : []));
		};
		expect(inicios(0.15).slice(0, 3)).toEqual([2035, 2050, 2065]);
		expect(inicios(0.85)).toEqual([]);
	});

	test('una crisis dura D años y frena la capacidad', () => {
		const s = simular({ paz: 0.15, frontera: 0.85 }, k);
		expect(s.crisis.slice(9, 15)).toEqual([1, 1, 1, 1, 1, 0]);
		const crecimientoEnCrisis = s.capacidad[11] - s.capacidad[10];
		const crecimientoSinCrisis = s.capacidad[16] - s.capacidad[15];
		expect(crecimientoEnCrisis).toBeLessThan(crecimientoSinCrisis);
	});
});
```

- [ ] **Step 2: Ejecútala para verla fallar**

Run: `npx vitest run src/lib/futuros/modelo.test.ts`
Expected: FAIL con `Failed to resolve import "./modelo"`.

- [ ] **Step 3: Escribe `modelo.ts`** (ecuaciones del spec §5.2, en ese orden)

```ts
// Modelo de futuros (spec futuros.md §5.2): simula 2026–2126 año a año. Puro: sin DOM ni Astro.
import { poblacionOnu } from './datos-onu';
import type { Valores } from './parametros';
import { ANIO_INICIAL, ANIOS, seriesVacias, type Posicion, type Series } from './tipos';

/** La pandemia de 2020 cuenta como última crisis global: la primera nueva crisis posible es 2035. */
const ULTIMA_CRISIS = 2020 - ANIO_INICIAL;
const SEPARACION_CRISIS = 15;
const TWH_A_EJ = 0.0036;
const ANIOS_HASTA_2100 = 2100 - ANIO_INICIAL;

const limitar = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x));

export function simular({ paz: p, frontera: f }: Posicion, k: Valores): Series {
	const s = seriesVacias();
	const kappa = k.kMin + (k.kMax - k.kMin) * p;
	const gamma = k.gammaMin + (k.gammaMax - k.gammaMin) * f;
	const r = k.rMin + (k.rMax - k.rMin) * f;
	const duracionCrisis = Math.round(k.dCrisis);
	let L = 0;
	let R = k.r0;
	let Q = k.q0;
	let emisionesAcumuladas = 0;
	let riesgoAcumulado = 0;
	let crisisRestante = 0;
	let ultimaCrisis = ULTIMA_CRISIS;

	for (let t = 0; t < ANIOS; t++) {
		const A = k.a0 + ((k.aMax - k.a0) * L ** k.n) / (L ** k.n + k.l50 ** k.n);
		const S = 1 + k.sigma * L * (0.6 + 0.4 * p);
		const eIA = k.eia0 * 10 ** (k.eps * L) * (1 - k.eta) ** t;
		const energia = k.te0 * (1 + gamma) ** t + TWH_A_EJ * eIA;
		const emisiones = k.em0 * (energia / k.te0) * ((1 - Q) / (1 - k.q0)) + k.u0 * (1 - k.upsilon) ** t;
		const poder = limitar(k.pi0 + k.cPi * L * (1 - p) ** 2 - k.dPi * p, 0, 100);

		let crisis = 0;
		if (crisisRestante > 0) {
			crisis = 1;
			crisisRestante--;
		} else if ((1 - p) * (0.5 + poder / 100) > k.theta && t - ultimaCrisis >= SEPARACION_CRISIS) {
			crisis = 1;
			crisisRestante = duracionCrisis - 1;
			ultimaCrisis = t;
		}

		const g = (k.gMin + (k.gMax - k.gMin) * f) * (1 - k.phi * crisis);
		const dL = g * (1 - L / k.lMax);
		riesgoAcumulado += k.hNat + k.hIa * (dL / k.gMax) * (1 - p) ** 2 + k.hConf * (poder / 100) * (1 - p);

		s.capacidad.push(L);
		s.automatizacion.push(A);
		s.empleo.push(k.e0 * (1 - (A - k.a0) * (1 - kappa)));
		s.desigualdad.push(limitar(k.gini0 + k.aG * (A - k.a0) * (1 - p) - k.bG * (A - k.a0) * p, 20, 90));
		s.robots.push(R);
		s.ciencia.push(S);
		s.energiaIA.push(eIA);
		s.energiaLimpia.push(Q);
		s.temperatura.push(k.t0 + (k.tcre * emisionesAcumuladas) / 1000);
		s.poblacion.push(
			poblacionOnu(ANIO_INICIAL + t) * (1 + (k.zOnu * 0.1 * t) / ANIOS_HASTA_2100) * (1 + k.mu * Math.log10(S)),
		);
		s.poder.push(poder);
		s.riesgo.push(1 - Math.exp(-riesgoAcumulado));
		s.crisis.push(crisis);
		s.emisiones.push(emisiones);

		L += dL;
		R += r * R * (1 - R / Math.max(R, k.rSat * A));
		Q += k.qRate * (0.5 + p) * (1 + k.lambda * Math.log10(S)) * Q * (1 - Q);
		emisionesAcumuladas += emisiones;
	}
	return s;
}
```

- [ ] **Step 4: Ejecuta la prueba**

Run: `npx vitest run src/lib/futuros/modelo.test.ts`
Expected: PASS (8 pruebas).

- [ ] **Step 5: Commit**

```bash
git add src/lib/futuros/modelo.ts src/lib/futuros/modelo.test.ts
git commit -m "feat: modelo de futuros 2026–2126"
```

---

### Task 3: Monte Carlo y eventos

**Files:**
- Create: `src/lib/futuros/eventos.ts`
- Create: `src/lib/futuros/montecarlo.ts`
- Test: `src/lib/futuros/eventos.test.ts`
- Test: `src/lib/futuros/montecarlo.test.ts`

**Interfaces:**
- Consumes: `simular` (tarea 2); `PARAMETROS`, `Valores` (tarea 1); `ANIO_INICIAL`, `ANIOS`, `VARIABLES`, `seriesVacias`, `Series`, `Evento`, `Posicion`, `Resultado` (tarea 1); `Idioma`.
- Produces: `EVENTOS`, `detectarEventos(s: Series): Evento[]`, `textoEvento(id: string, lang: Idioma): string` (eventos.ts); `SEMILLA = 2026`, `CORRIDAS = 200`, `mulberry32(semilla): () => number`, `percentil(ordenados, q): number`, `muestrear(azar): Valores`, `proyectar(pos, semilla?, corridas?): Resultado` (montecarlo.ts).

- [ ] **Step 1: Escribe las pruebas (fallan)**

`src/lib/futuros/eventos.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { detectarEventos, textoEvento } from './eventos';
import { ANIOS, seriesVacias, VARIABLES, type Series } from './tipos';

/** Series planas en 0 salvo lo que se sobrescriba. */
function series(cambios: Partial<Record<keyof Series, (t: number) => number>>): Series {
	const s = seriesVacias();
	for (const v of VARIABLES)
		for (let t = 0; t < ANIOS; t++) s[v].push(cambios[v]?.(t) ?? (v === 'emisiones' ? 40 : 0));
	return s;
}

describe('eventos', () => {
	test('se dispara una vez, en el primer año que cruza el umbral', () => {
		const ev = detectarEventos(series({ automatizacion: (t) => t / 50 }));
		expect(ev.filter((e) => e.id === 'ia-mitad-tareas')).toEqual([{ id: 'ia-mitad-tareas', anio: 2051 }]);
	});

	test('las crisis se registran en cada inicio', () => {
		const ev = detectarEventos(series({ crisis: (t) => (t >= 9 && t < 14) || (t >= 24 && t < 29) ? 1 : 0 }));
		expect(ev.filter((e) => e.id === 'crisis').map((e) => e.anio)).toEqual([2035, 2050]);
	});

	test('el pico de población se detecta cuando empieza a bajar', () => {
		const ev = detectarEventos(series({ poblacion: (t) => 10 - Math.abs(t - 60) / 100 }));
		expect(ev.find((e) => e.id === 'pico-poblacion')?.anio).toBe(2087);
	});

	test('sale en orden cronológico', () => {
		const ev = detectarEventos(series({ temperatura: (t) => 1.4 + t / 20, robots: (t) => t / 30 }));
		const anios = ev.map((e) => e.anio);
		expect(anios).toEqual([...anios].sort((a, b) => a - b));
	});

	test('textoEvento traduce y devuelve el id si no lo conoce', () => {
		expect(textoEvento('crisis', 'en')).toMatch(/global crisis/);
		expect(textoEvento('desconocido', 'es')).toBe('desconocido');
	});
});
```

`src/lib/futuros/montecarlo.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { mulberry32, muestrear, percentil, proyectar } from './montecarlo';
import { PARAMETROS } from './parametros';
import { INDICADORES } from './tipos';

describe('azar con semilla', () => {
	test('la misma semilla repite la secuencia y otra semilla la cambia', () => {
		const a = mulberry32(2026);
		const b = mulberry32(2026);
		const c = mulberry32(7);
		const sa = [a(), a(), a()];
		expect([b(), b(), b()]).toEqual(sa);
		expect([c(), c(), c()]).not.toEqual(sa);
		for (const v of sa) expect(v).toBeGreaterThanOrEqual(0);
		for (const v of sa) expect(v).toBeLessThan(1);
	});

	test('muestrear respeta cada rango y redondea los enteros', () => {
		const azar = mulberry32(1);
		for (let i = 0; i < 50; i++) {
			const v = muestrear(azar);
			for (const [nombre, p] of Object.entries(PARAMETROS)) {
				const valor = v[nombre as keyof typeof v];
				expect(valor).toBeGreaterThanOrEqual(p.min);
				expect(valor).toBeLessThanOrEqual(p.max);
			}
			expect(Number.isInteger(v.dCrisis)).toBe(true);
		}
	});
});

describe('percentil', () => {
	test('interpola entre posiciones', () => {
		expect(percentil([0, 10, 20, 30, 40], 0.5)).toBe(20);
		expect(percentil([0, 10, 20, 30, 40], 0.1)).toBe(4);
		expect(percentil([5], 0.9)).toBe(5);
	});
});

describe('proyectar', () => {
	const pos = { paz: 0.3, frontera: 0.7 };

	test('es determinista con la misma semilla', () => {
		expect(proyectar(pos)).toEqual(proyectar(pos));
	});

	test('la banda contiene a la mediana en cada año e indicador', () => {
		const r = proyectar(pos);
		expect(r.anios[0]).toBe(2026);
		expect(r.anios.at(-1)).toBe(2126);
		for (const ind of INDICADORES)
			r.p50[ind].forEach((m, t) => {
				expect(r.p10[ind][t]).toBeLessThanOrEqual(m);
				expect(m).toBeLessThanOrEqual(r.p90[ind][t]);
			});
	});

	test('200 corridas tardan menos de 50 ms (150 ms en CI)', () => {
		proyectar(pos);
		const inicio = performance.now();
		proyectar({ paz: 0.6, frontera: 0.4 });
		expect(performance.now() - inicio).toBeLessThan(process.env.CI ? 150 : 50);
	});
});
```

- [ ] **Step 2: Ejecútalas para verlas fallar**

Run: `npx vitest run src/lib/futuros/eventos.test.ts src/lib/futuros/montecarlo.test.ts`
Expected: FAIL con `Failed to resolve import "./eventos"` y `"./montecarlo"`.

- [ ] **Step 3: Escribe `eventos.ts`**

```ts
// Eventos del relato (spec futuros.md §5.5): el modelo los dispara al cruzar un umbral.
import type { Idioma } from '../../i18n/rutas';
import { ANIO_INICIAL, type Evento, type Series } from './tipos';

interface DefinicionEvento {
	id: string;
	cumple: (s: Series, t: number) => boolean;
	texto: Record<Idioma, string>;
}

export const EVENTOS: readonly DefinicionEvento[] = [
	{ id: 'supera-1-5', cumple: (s, t) => s.temperatura[t] >= 1.5, texto: { es: 'El planeta supera 1,5 °C de calentamiento.', en: 'The planet passes 1.5 °C of warming.' } },
	{ id: 'ia-mitad-tareas', cumple: (s, t) => s.automatizacion[t] >= 0.5, texto: { es: 'La IA ya puede hacer la mitad de las tareas humanas.', en: 'AI can now do half of all human tasks.' } },
	{ id: 'robots-mil-millones', cumple: (s, t) => s.robots[t] >= 1, texto: { es: 'Mil millones de robots en funcionamiento.', en: 'One billion robots in operation.' } },
	{ id: 'ia-mas-que-japon', cumple: (s, t) => s.energiaIA[t] >= 1000, texto: { es: 'Los centros de datos consumen más electricidad que todo Japón hoy.', en: 'Data centers use more electricity than all of Japan does today.' } },
	{ id: 'ciencia-x10', cumple: (s, t) => s.ciencia[t] >= 10, texto: { es: 'La ciencia avanza diez veces más rápido que en 2026.', en: 'Science moves ten times faster than in 2026.' } },
	{ id: 'limpia-50', cumple: (s, t) => s.energiaLimpia[t] >= 0.5, texto: { es: 'La mitad de la energía ya es limpia.', en: 'Half of all energy is now clean.' } },
	{ id: 'limpia-90', cumple: (s, t) => s.energiaLimpia[t] >= 0.9, texto: { es: 'Nueve de cada diez unidades de energía son limpias.', en: 'Nine in ten units of energy are clean.' } },
	{ id: 'cero-neto', cumple: (s, t) => s.emisiones[t] <= 1, texto: { es: 'Las emisiones de CO₂ llegan prácticamente a cero.', en: 'CO₂ emissions reach practically zero.' } },
	{ id: 'supera-2', cumple: (s, t) => s.temperatura[t] >= 2, texto: { es: 'El planeta supera 2 °C de calentamiento.', en: 'The planet passes 2 °C of warming.' } },
	{ id: 'supera-3', cumple: (s, t) => s.temperatura[t] >= 3, texto: { es: 'El planeta supera 3 °C de calentamiento.', en: 'The planet passes 3 °C of warming.' } },
	{ id: 'pico-poblacion', cumple: (s, t) => t > 0 && s.poblacion[t] < s.poblacion[t - 1], texto: { es: 'La población mundial alcanza su máximo y empieza a bajar.', en: 'World population peaks and begins to fall.' } },
	{ id: 'poder-concentrado', cumple: (s, t) => s.poder[t] >= 80, texto: { es: 'El poder se concentra en muy pocas manos.', en: 'Power is concentrated in very few hands.' } },
	{ id: 'riesgo-10', cumple: (s, t) => s.riesgo[t] >= 0.1, texto: { es: 'El riesgo acumulado de catástrofe supera el 10 %.', en: 'The cumulative risk of catastrophe passes 10%.' } },
];

const CRISIS: DefinicionEvento = {
	id: 'crisis',
	cumple: (s, t) => s.crisis[t] >= 0.5 && (t === 0 || s.crisis[t - 1] < 0.5),
	texto: { es: 'Estalla una crisis global que frena la economía y la IA.', en: 'A global crisis breaks out and slows the economy and AI.' },
};

/** Cada evento se dispara una vez, en el primer año que cumple; las crisis, en cada inicio. Orden cronológico. */
export function detectarEventos(s: Series): Evento[] {
	const anios = s.temperatura.map((_, t) => t);
	const unicos = EVENTOS.flatMap((e) => {
		const t = anios.find((i) => e.cumple(s, i));
		return t === undefined ? [] : [{ id: e.id, anio: ANIO_INICIAL + t }];
	});
	const crisis = anios.filter((t) => CRISIS.cumple(s, t)).map((t) => ({ id: CRISIS.id, anio: ANIO_INICIAL + t }));
	return [...unicos, ...crisis].sort((a, b) => a.anio - b.anio);
}

export const textoEvento = (id: string, lang: Idioma): string =>
	[...EVENTOS, CRISIS].find((e) => e.id === id)?.texto[lang] ?? id;
```

- [ ] **Step 4: Escribe `montecarlo.ts`**

```ts
// Monte Carlo con semilla (spec futuros.md §5.4): mismos resultados en el build y en el navegador.
import { detectarEventos } from './eventos';
import { simular } from './modelo';
import { PARAMETROS, type Valores } from './parametros';
import { ANIO_INICIAL, ANIOS, VARIABLES, seriesVacias, type Posicion, type Resultado } from './tipos';

export const SEMILLA = 2026;
export const CORRIDAS = 200;

/** Generador pseudoaleatorio mulberry32: devuelve números en [0, 1). */
export function mulberry32(semilla: number): () => number {
	let a = semilla >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Percentil q (0–1) de una lista ordenada de menor a mayor, con interpolación lineal. */
export function percentil(ordenados: readonly number[], q: number): number {
	const i = (ordenados.length - 1) * q;
	const bajo = Math.floor(i);
	const alto = Math.ceil(i);
	return ordenados[bajo] + (ordenados[alto] - ordenados[bajo]) * (i - bajo);
}

/** Un juego de parámetros al azar dentro de sus rangos (uniforme). */
export const muestrear = (azar: () => number): Valores =>
	Object.fromEntries(
		Object.entries(PARAMETROS).map(([nombre, p]) => {
			const v = p.min + azar() * (p.max - p.min);
			return [nombre, 'entero' in p && p.entero ? Math.round(v) : v];
		}),
	) as Valores;

export function proyectar(pos: Posicion, semilla = SEMILLA, corridas = CORRIDAS): Resultado {
	const azar = mulberry32(semilla);
	const simulaciones = Array.from({ length: corridas }, () => simular(pos, muestrear(azar)));
	const p10 = seriesVacias();
	const p50 = seriesVacias();
	const p90 = seriesVacias();
	for (const v of VARIABLES) {
		for (let t = 0; t < ANIOS; t++) {
			const ordenados = simulaciones.map((s) => s[v][t]).sort((a, b) => a - b);
			p10[v].push(percentil(ordenados, 0.1));
			p50[v].push(percentil(ordenados, 0.5));
			p90[v].push(percentil(ordenados, 0.9));
		}
	}
	return {
		anios: Array.from({ length: ANIOS }, (_, t) => ANIO_INICIAL + t),
		p10,
		p50,
		p90,
		eventos: detectarEventos(p50),
	};
}
```

- [ ] **Step 5: Ejecuta las pruebas**

Run: `npx vitest run src/lib/futuros/eventos.test.ts src/lib/futuros/montecarlo.test.ts`
Expected: PASS (5 + 6 pruebas).

- [ ] **Step 6: Commit**

```bash
git add src/lib/futuros/eventos.ts src/lib/futuros/montecarlo.ts src/lib/futuros/eventos.test.ts src/lib/futuros/montecarlo.test.ts
git commit -m "feat: Monte Carlo con semilla y eventos del relato"
```

---

### Task 4: Posición, cuadrantes y rutas

**Files:**
- Modify: `src/i18n/rutas.ts` (añadir sección `futuros` y `rutaFuturo`)
- Create: `src/lib/futuros/posicion.ts`
- Test: `src/lib/futuros/posicion.test.ts`

**Interfaces:**
- Consumes: `Posicion` (tarea 1), `Idioma`.
- Produces: `ruta(lang, 'futuros')` → `/futuros/` o `/en/futures/`; `rutaFuturo(lang, slug)`; `CUADRANTES`, `CuadranteId`, `CUADRANTE_IDS`, `presetDe(id)`, `urlFuturo(lang, id)`, `cuadranteCercano(pos)`, `leerPosicion(params, porDefecto)`, `escribirPosicion(pos)`, `mismaPosicion(a, b)`.

- [ ] **Step 1: Escribe la prueba (falla)**

`src/lib/futuros/posicion.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { cuadranteCercano, escribirPosicion, leerPosicion, mismaPosicion, presetDe, urlFuturo } from './posicion';

const preset = presetDe('carrera');
const leer = (consulta: string) => leerPosicion(new URLSearchParams(consulta), preset);

describe('posición en la URL', () => {
	test('lee valores válidos', () => {
		expect(leer('paz=0.7&frontera=0.3')).toEqual({ paz: 0.7, frontera: 0.3 });
	});

	test('recorta fuera de rango y usa el preset si no es un número', () => {
		expect(leer('paz=5&frontera=-2')).toEqual({ paz: 1, frontera: 0 });
		expect(leer('paz=abc&frontera=Infinity')).toEqual(preset);
		expect(leer('paz=&frontera=%20')).toEqual(preset);
		expect(leer('')).toEqual(preset);
	});

	test('escribe con dos decimales y se puede releer', () => {
		const texto = escribirPosicion({ paz: 0.7, frontera: 0.333 });
		expect(texto).toBe('paz=0.70&frontera=0.33');
		expect(leer(texto)).toEqual({ paz: 0.7, frontera: 0.33 });
	});

	test('mismaPosicion compara con tolerancia', () => {
		expect(mismaPosicion(preset, { paz: 0.15, frontera: 0.85 })).toBe(true);
		expect(mismaPosicion(preset, { paz: 0.2, frontera: 0.85 })).toBe(false);
	});
});

describe('cuadrantes', () => {
	test('el cuadrante más cercano usa 0,5 como frontera, incluida', () => {
		expect(cuadranteCercano({ paz: 0.5, frontera: 0.5 })).toBe('frontera-en-paz');
		expect(cuadranteCercano({ paz: 0.9, frontera: 0.1 })).toBe('pausa');
		expect(cuadranteCercano({ paz: 0.49, frontera: 0.99 })).toBe('carrera');
		expect(cuadranteCercano({ paz: 0, frontera: 0 })).toBe('fractura');
	});

	test('cada preset cae en su propio cuadrante', () => {
		for (const id of ['pausa', 'frontera-en-paz', 'carrera', 'fractura'] as const)
			expect(cuadranteCercano(presetDe(id))).toBe(id);
	});

	test('las URL usan el slug de cada idioma', () => {
		expect(urlFuturo('es', 'frontera-en-paz')).toBe('/futuros/frontera-en-paz/');
		expect(urlFuturo('en', 'frontera-en-paz')).toBe('/en/futures/peaceful-frontier/');
	});
});
```

Añade al final del `describe('posición en la URL')` la prueba del punto 1 de Review Focus:

```ts
	test('con un solo parámetro, el otro eje toma el valor del futuro', () => {
		expect(leer('paz=0.3')).toEqual({ paz: 0.3, frontera: preset.frontera });
		expect(leer('frontera=0.2')).toEqual({ paz: preset.paz, frontera: 0.2 });
	});
```

- [ ] **Step 2: Ejecútala para verla fallar**

Run: `npx vitest run src/lib/futuros/posicion.test.ts`
Expected: FAIL con `Failed to resolve import "./posicion"`.

- [ ] **Step 3: Añade la sección a `src/i18n/rutas.ts`**

En `SECCIONES`, después de `apoyar`:

```ts
	futuros: { es: '/futuros/', en: '/en/futures/' },
```

Y antes de `otroIdioma`:

```ts
export const rutaFuturo = (lang: Idioma, slug: string) => `${SECCIONES.futuros[lang]}${slug}/`;
```

- [ ] **Step 4: Escribe `posicion.ts`**

```ts
// Los cuatro futuros de la matriz Paz × Frontera y la posición del lector en la URL (spec futuros.md §2).
import { rutaFuturo, type Idioma } from '../../i18n/rutas';
import type { Posicion } from './tipos';

export const CUADRANTES = {
	pausa: { paz: 0.85, frontera: 0.15, slug: { es: 'pausa', en: 'pause' } },
	'frontera-en-paz': { paz: 0.85, frontera: 0.85, slug: { es: 'frontera-en-paz', en: 'peaceful-frontier' } },
	carrera: { paz: 0.15, frontera: 0.85, slug: { es: 'carrera', en: 'race' } },
	fractura: { paz: 0.15, frontera: 0.15, slug: { es: 'fractura', en: 'fracture' } },
} as const;

export type CuadranteId = keyof typeof CUADRANTES;
export const CUADRANTE_IDS = Object.keys(CUADRANTES) as CuadranteId[];

export const presetDe = (id: CuadranteId): Posicion => ({
	paz: CUADRANTES[id].paz,
	frontera: CUADRANTES[id].frontera,
});

export const urlFuturo = (lang: Idioma, id: CuadranteId) => rutaFuturo(lang, CUADRANTES[id].slug[lang]);

/** Paz ≥ 0,5 es alta; frontera ≥ 0,5 es rápida. */
export function cuadranteCercano({ paz, frontera }: Posicion): CuadranteId {
	if (paz >= 0.5) return frontera >= 0.5 ? 'frontera-en-paz' : 'pausa';
	return frontera >= 0.5 ? 'carrera' : 'fractura';
}

/** Lee ?paz=&frontera= sin confiar en la URL: recorta a 0–1 y usa el valor por defecto si no es un número. */
export function leerPosicion(params: URLSearchParams, porDefecto: Posicion): Posicion {
	const leer = (clave: keyof Posicion): number => {
		const crudo = params.get(clave)?.trim();
		if (!crudo) return porDefecto[clave];
		const n = Number(crudo);
		return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : porDefecto[clave];
	};
	return { paz: leer('paz'), frontera: leer('frontera') };
}

export const escribirPosicion = ({ paz, frontera }: Posicion): string =>
	`paz=${paz.toFixed(2)}&frontera=${frontera.toFixed(2)}`;

export const mismaPosicion = (a: Posicion, b: Posicion): boolean =>
	Math.abs(a.paz - b.paz) < 1e-9 && Math.abs(a.frontera - b.frontera) < 1e-9;
```

- [ ] **Step 5: Ejecuta las pruebas**

Run: `npx vitest run src/lib/futuros/posicion.test.ts src/i18n/rutas.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/rutas.ts src/lib/futuros/posicion.ts src/lib/futuros/posicion.test.ts
git commit -m "feat: cuatro futuros, posición en la URL y rutas"
```

---

### Task 5: Calibración contra fuentes oficiales

**Files:**
- Create: `src/lib/futuros/calibracion.ts`
- Test: `src/lib/futuros/calibracion.test.ts`

**Interfaces:**
- Consumes: `simular` (tarea 2), `valoresCentrales` (tarea 1), `presetDe` (tarea 4), `ANIO_INICIAL`, `Posicion`, `Idioma`.
- Produces: `Objetivo { id, descripcion, fuente, unidad, min, max, valor() }`, `OBJETIVOS`, `evaluar(objetivo): { valor: number; cumple: boolean }`. La página `/futuros/` (tarea 12) muestra estos mismos objetivos.

- [ ] **Step 1: Escribe la prueba (falla)**

`src/lib/futuros/calibracion.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { OBJETIVOS, evaluar } from './calibracion';

describe('calibración contra fuentes oficiales (spec §5.6)', () => {
	for (const objetivo of OBJETIVOS)
		test(objetivo.descripcion.es, () => {
			const { valor, cumple } = evaluar(objetivo);
			expect(cumple, `${objetivo.id} = ${valor}, esperado entre ${objetivo.min} y ${objetivo.max}`).toBe(true);
		});
});
```

- [ ] **Step 2: Ejecútala para verla fallar**

Run: `npx vitest run src/lib/futuros/calibracion.test.ts`
Expected: FAIL con `Failed to resolve import "./calibracion"`.

- [ ] **Step 3: Escribe `calibracion.ts`**

```ts
// Objetivos de calibración (spec futuros.md §5.6). Los usan las pruebas y la página /futuros/,
// que publica si el modelo los cumple.
import type { Idioma } from '../../i18n/rutas';
import { simular } from './modelo';
import { valoresCentrales } from './parametros';
import { presetDe } from './posicion';
import { ANIO_INICIAL, type Posicion } from './tipos';

export interface Objetivo {
	id: string;
	descripcion: Record<Idioma, string>;
	fuente: string;
	unidad: 'celsius' | 'fraccion' | 'twh' | 'anio' | 'millones' | 'factor';
	min: number;
	max: number;
	valor: () => number;
}

const CENTRO: Posicion = { paz: 0.5, frontera: 0.5 };
const i = (anio: number) => anio - ANIO_INICIAL;
const central = (pos: Posicion) => simular(pos, valoresCentrales());
const media = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const temperatura2081a2100 = (pos: Posicion) => media(central(pos).temperatura.slice(i(2081), i(2100) + 1));
const riesgo2100 = (pos: Posicion) => central(pos).riesgo[i(2100)];

/** Robots desde 1,828 M (IFR, fin de 2016) siete años al ritmo histórico r_min, en millones. */
function robotsRetro(): number {
	const k = valoresCentrales();
	let R = 0.001828;
	for (let t = 0; t < 7; t++) R += k.rMin * R * (1 - R / Math.max(R, k.rSat * k.a0));
	return R * 1000;
}

export const OBJETIVOS: readonly Objetivo[] = [
	{ id: 'temp-frontera-en-paz', descripcion: { es: 'Temperatura 2081–2100 de Frontera en paz, dentro de SSP1-2.6', en: 'Peaceful frontier temperature 2081–2100, within SSP1-2.6' }, fuente: 'ipcc-ar6-wg1', unidad: 'celsius', min: 1.3, max: 2.4, valor: () => temperatura2081a2100(presetDe('frontera-en-paz')) },
	{ id: 'temp-pausa', descripcion: { es: 'Temperatura 2081–2100 de Pausa, entre SSP1-2.6 y SSP2-4.5', en: 'Pause temperature 2081–2100, between SSP1-2.6 and SSP2-4.5' }, fuente: 'ipcc-ar6-wg1', unidad: 'celsius', min: 1.3, max: 3.5, valor: () => temperatura2081a2100(presetDe('pausa')) },
	{ id: 'temp-centro', descripcion: { es: 'Temperatura 2081–2100 en el centro de la matriz, dentro de SSP2-4.5', en: 'Matrix-center temperature 2081–2100, within SSP2-4.5' }, fuente: 'ipcc-ar6-wg1', unidad: 'celsius', min: 2.1, max: 3.5, valor: () => temperatura2081a2100(CENTRO) },
	{ id: 'temp-carrera', descripcion: { es: 'Temperatura 2081–2100 de Carrera, entre SSP2-4.5 y SSP5-8.5', en: 'Race temperature 2081–2100, between SSP2-4.5 and SSP5-8.5' }, fuente: 'ipcc-ar6-wg1', unidad: 'celsius', min: 2.1, max: 5.7, valor: () => temperatura2081a2100(presetDe('carrera')) },
	{ id: 'temp-fractura', descripcion: { es: 'Temperatura 2081–2100 de Fractura, entre SSP2-4.5 y SSP5-8.5', en: 'Fracture temperature 2081–2100, between SSP2-4.5 and SSP5-8.5' }, fuente: 'ipcc-ar6-wg1', unidad: 'celsius', min: 2.1, max: 5.7, valor: () => temperatura2081a2100(presetDe('fractura')) },
	{ id: 'temp-orden', descripcion: { es: 'Carrera y Fractura terminan más calientes que Frontera en paz (diferencia en °C)', en: 'Race and Fracture end warmer than Peaceful frontier (difference in °C)' }, fuente: 'ipcc-ar6-wg1', unidad: 'celsius', min: 0, max: Number.POSITIVE_INFINITY, valor: () => Math.min(temperatura2081a2100(presetDe('carrera')), temperatura2081a2100(presetDe('fractura'))) - temperatura2081a2100(presetDe('frontera-en-paz')) },
	{ id: 'riesgo-centro', descripcion: { es: 'Riesgo de catástrofe a 2100 en el centro, entre superpronosticadores (9 %) y expertos (20 %)', en: 'Catastrophe risk by 2100 at the center, between superforecasters (9%) and experts (20%)' }, fuente: 'xpt-2023', unidad: 'fraccion', min: 0.09, max: 0.2, valor: () => riesgo2100(CENTRO) },
	{ id: 'riesgo-pausa', descripcion: { es: 'Riesgo de catástrofe a 2100 en Pausa, por debajo del 9 %', en: 'Catastrophe risk by 2100 in Pause, below 9%' }, fuente: 'xpt-2023', unidad: 'fraccion', min: 0, max: 0.09, valor: () => riesgo2100(presetDe('pausa')) },
	{ id: 'riesgo-carrera', descripcion: { es: 'Riesgo de catástrofe a 2100 en Carrera, por encima del 20 %', en: 'Catastrophe risk by 2100 in Race, above 20%' }, fuente: 'xpt-2023', unidad: 'fraccion', min: 0.2, max: 1, valor: () => riesgo2100(presetDe('carrera')) },
	{ id: 'energia-ia-2030', descripcion: { es: 'Electricidad de los centros de datos en 2030 en el centro, ±30 % del caso base de la AIE (945 TWh)', en: 'Data-center electricity in 2030 at the center, ±30% of the IEA base case (945 TWh)' }, fuente: 'aie-energia-ia', unidad: 'twh', min: 945 * 0.7, max: 945 * 1.3, valor: () => central(CENTRO).energiaIA[i(2030)] },
	{ id: 'automatizacion-mitad', descripcion: { es: 'Año en que se automatiza la mitad de las tareas (centro), entre 2047 y 2116', en: 'Year half of all tasks are automated (center), between 2047 and 2116' }, fuente: 'grace-2024', unidad: 'anio', min: 2047, max: 2116, valor: () => ANIO_INICIAL + central(CENTRO).automatizacion.findIndex((a) => a >= 0.5) },
	{ id: 'poblacion-2100', descripcion: { es: 'Población en 2100 (centro) dentro del intervalo de la ONU', en: 'Population in 2100 (center) within the UN interval' }, fuente: 'onu-wpp-2024', unidad: 'factor', min: 8.9, max: 12.4, valor: () => central(CENTRO).poblacion[i(2100)] },
	{ id: 'robots-retro', descripcion: { es: 'Robots 2016→2023 al ritmo histórico, ±15 % de los 4,28 M de la IFR', en: 'Robots 2016→2023 at the historical pace, ±15% of IFR’s 4.28 M' }, fuente: 'ifr-2024', unidad: 'millones', min: 4.28 * 0.85, max: 4.28 * 1.15, valor: robotsRetro },
	{ id: 'computo-anual', descripcion: { es: 'Crecimiento del cómputo en el primer año a máxima frontera, entre ×4 y ×5', en: 'Compute growth in the first year at full frontier, between ×4 and ×5' }, fuente: 'epoch-computo', unidad: 'factor', min: 4, max: 5, valor: () => 10 ** central({ paz: 0.5, frontera: 1 }).capacidad[1] },
];

export function evaluar(objetivo: Objetivo): { valor: number; cumple: boolean } {
	const valor = objetivo.valor();
	return { valor, cumple: valor >= objetivo.min && valor <= objetivo.max };
}
```

- [ ] **Step 4: Ejecuta la prueba**

Run: `npx vitest run src/lib/futuros/calibracion.test.ts`
Expected: PASS (14 objetivos). Valores de referencia con los parámetros centrales: Frontera en paz 2,04 °C; Pausa 1,97 °C; centro 2,19 °C; Carrera 2,61 °C; Fractura 2,36 °C; riesgo a 2100 centro 17 %, Pausa 7,9 %, Carrera 32,8 %; electricidad de la IA 2030 ≈ 1008 TWh; mitad de tareas 2049.

Si alguno falla, **no** cambies el rango del objetivo: revisa que `modelo.ts` sea idéntico al de la tarea 2.

- [ ] **Step 5: Commit**

```bash
git add src/lib/futuros/calibracion.ts src/lib/futuros/calibracion.test.ts
git commit -m "test: calibración del modelo contra IPCC, AIE, ONU, IFR, Epoch, Grace y XPT"
```

---

### Task 6: Formato de cifras y trazado de gráficos

**Files:**
- Create: `src/lib/futuros/formato.ts`
- Create: `src/lib/futuros/trazado.ts`
- Test: `src/lib/futuros/formato.test.ts`
- Test: `src/lib/futuros/trazado.test.ts`

**Interfaces:**
- Consumes: `Indicador`, `Resultado`, `Ambito`, `INDICADORES` (tarea 1), `Idioma`.
- Produces: `formatear(indicador, valor, lang): string`, `porcentaje(lang, fraccion, decimales?)`, `INDICES_DECADAS`, `celdaConBanda(indicador, r, t, lang)` (formato.ts); `ANCHO_GRAFICO = 200`, `ALTO_GRAFICO = 44`, `Escala`, `ESCALAS`, `IdGrafico`, `DefinicionGrafico`, `GRAFICOS`, `xAnio(t, n, ancho?)`, `yValor(valor, escala, alto?)`, `rutaLinea(valores, escala, ancho?, alto?)`, `rutaBanda(bajos, altos, escala, ancho?, alto?)` (trazado.ts).

- [ ] **Step 1: Escribe las pruebas (fallan)**

`src/lib/futuros/formato.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { celdaConBanda, formatear, INDICES_DECADAS, porcentaje } from './formato';
import type { Resultado, Series } from './tipos';

// Intl usa espacios de no separación; los normalizamos para comparar.
const f = (...args: Parameters<typeof formatear>) => formatear(...args).replace(/[  ]/g, ' ');

describe('formato de indicadores', () => {
	test('porcentajes', () => {
		expect(f('automatizacion', 0.412, 'es')).toBe('41 %');
		expect(f('automatizacion', 0.412, 'en')).toBe('41%');
		expect(f('riesgo', 0.079, 'es')).toBe('7,9 %');
		expect(f('riesgo', 0.328, 'en')).toBe('33%');
	});

	test('miles de millones y millones', () => {
		expect(f('robots', 2.13, 'es')).toBe('2,1 mil millones');
		expect(f('robots', 2.13, 'en')).toBe('2.1 billion');
		expect(f('robots', 0.51, 'es')).toBe('510 millones');
		expect(f('robots', 0.0051, 'en')).toBe('5.1 million');
		expect(f('poblacion', 10.18, 'es')).toBe('10,2 mil millones');
	});

	test('temperatura, energía, índices y ciencia', () => {
		expect(f('temperatura', 2.04, 'es')).toBe('2,0 °C');
		expect(f('energiaIA', 1008.4, 'en')).toBe('1,008 TWh');
		expect(f('poder', 84.3, 'es')).toBe('84/100');
		expect(f('ciencia', 9.71, 'es')).toBe('×9,7');
	});

	test('capacidad en notación compacta', () => {
		expect(f('capacidad', 0, 'en')).toBe('×1');
		expect(f('capacidad', 4, 'en')).toBe('×10K');
		expect(f('capacidad', 9, 'en')).toBe('×1B');
	});
});

describe('tablas', () => {
	test('celda con mediana y banda', () => {
		const serie = (v: number) => ({ temperatura: [v] }) as unknown as Series;
		const r: Resultado = { anios: [2026], p10: serie(1.3), p50: serie(1.42), p90: serie(1.55), eventos: [] };
		expect(celdaConBanda('temperatura', r, 0, 'es').replace(/[  ]/g, ' ')).toBe('1,4 °C (1,3 °C–1,6 °C)');
	});

	test('décadas de 2026 a 2126', () => {
		expect(INDICES_DECADAS).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
	});

	test('porcentaje de los controles', () => {
		expect(porcentaje('es', 0.85).replace(/[  ]/g, ' ')).toBe('85 %');
		expect(porcentaje('en', 0.85)).toBe('85%');
	});
});
```

`src/lib/futuros/trazado.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { ESCALAS, GRAFICOS, rutaBanda, rutaLinea, xAnio, yValor } from './trazado';
import { INDICADORES } from './tipos';

const escala = { min: 0, max: 1 };

describe('trazado SVG', () => {
	test('línea: x reparte los años, y invierte el valor', () => {
		expect(rutaLinea([0, 0.5, 1], escala, 100, 50)).toBe('M0,50L50,25L100,0');
	});

	test('banda: arriba de ida, abajo de vuelta, cerrada', () => {
		expect(rutaBanda([0, 0], [1, 1], escala, 10, 10)).toBe('M0,0L10,0L10,10L0,10Z');
	});

	test('los valores fuera de escala se pegan al borde', () => {
		expect(yValor(2, escala, 10)).toBe(0);
		expect(yValor(-1, escala, 10)).toBe(10);
	});

	test('escala logarítmica', () => {
		expect(yValor(1000, { min: 100, max: 100_000, log: true }, 30)).toBe(20);
	});

	test('x del último año es el ancho completo', () => {
		expect(xAnio(100, 101, 200)).toBe(200);
	});

	test('cada indicador tiene escala y aparece en exactamente un gráfico', () => {
		const enGraficos = GRAFICOS.flatMap((g) => g.series);
		for (const ind of INDICADORES) {
			expect(ESCALAS[ind]).toBeDefined();
			expect(enGraficos.filter((s) => s === ind)).toHaveLength(1);
		}
	});
});
```

- [ ] **Step 2: Ejecútalas para verlas fallar**

Run: `npx vitest run src/lib/futuros/formato.test.ts src/lib/futuros/trazado.test.ts`
Expected: FAIL con `Failed to resolve import`.

- [ ] **Step 3: Escribe `formato.ts`**

```ts
// Cómo se escribe cada indicador en el texto, el panel y las tablas.
import type { Idioma } from '../../i18n/rutas';
import type { Indicador, Resultado } from './tipos';

const LOCALE: Record<Idioma, string> = { es: 'es-ES', en: 'en-US' };

const numero = (lang: Idioma, valor: number, decimales = 0) =>
	new Intl.NumberFormat(LOCALE[lang], {
		minimumFractionDigits: decimales,
		maximumFractionDigits: decimales,
	}).format(valor);

export const porcentaje = (lang: Idioma, fraccion: number, decimales = 0) =>
	new Intl.NumberFormat(LOCALE[lang], {
		style: 'percent',
		minimumFractionDigits: decimales,
		maximumFractionDigits: decimales,
	}).format(fraccion);

/** Valor en miles de millones → "2,1 mil millones" / "510 millones" (y en inglés, billion / million). */
function milesDeMillones(lang: Idioma, valor: number): string {
	if (valor >= 1) return `${numero(lang, valor, 1)} ${lang === 'es' ? 'mil millones' : 'billion'}`;
	const millones = valor * 1000;
	return `${numero(lang, millones, millones < 10 ? 1 : 0)} ${lang === 'es' ? 'millones' : 'million'}`;
}

export function formatear(indicador: Indicador, valor: number, lang: Idioma): string {
	switch (indicador) {
		case 'capacidad':
			return `×${new Intl.NumberFormat(LOCALE[lang], { notation: 'compact', maximumFractionDigits: 1 }).format(10 ** valor)}`;
		case 'automatizacion':
		case 'empleo':
		case 'energiaLimpia':
			return porcentaje(lang, valor);
		case 'riesgo':
			return porcentaje(lang, valor, valor < 0.1 ? 1 : 0);
		case 'desigualdad':
		case 'poder':
			return `${numero(lang, valor)}/100`;
		case 'robots':
		case 'poblacion':
			return milesDeMillones(lang, valor);
		case 'ciencia':
			return `×${numero(lang, valor, 1)}`;
		case 'energiaIA':
			return `${numero(lang, valor)} TWh`;
		case 'temperatura':
			return `${numero(lang, valor, 1)} °C`;
	}
}

/** Índices de 2026, 2036 … 2126 (filas de las tablas "Ver datos"). */
export const INDICES_DECADAS: readonly number[] = Array.from({ length: 11 }, (_, i) => i * 10);

/** "1,4 °C (1,3–1,6)": mediana y banda del 80 %. */
export const celdaConBanda = (indicador: Indicador, r: Resultado, t: number, lang: Idioma): string =>
	`${formatear(indicador, r.p50[indicador][t], lang)} (${formatear(indicador, r.p10[indicador][t], lang)}–${formatear(indicador, r.p90[indicador][t], lang)})`;
```

- [ ] **Step 4: Escribe `trazado.ts`**

```ts
// Gráficos SVG de los futuros: escalas fijas por indicador y trazados compartidos entre build y navegador.
import type { Ambito, Indicador } from './tipos';

export const ANCHO_GRAFICO = 200;
export const ALTO_GRAFICO = 44;

export interface Escala {
	min: number;
	max: number;
	log?: boolean;
}

/** Fijas: la misma escala en los cuatro futuros para que la comparación sea honesta. */
export const ESCALAS: Record<Indicador, Escala> = {
	capacidad: { min: 0, max: 15 },
	automatizacion: { min: 0, max: 1 },
	empleo: { min: 0, max: 1 },
	desigualdad: { min: 20, max: 90 },
	robots: { min: 0, max: 20 },
	ciencia: { min: 0, max: 25 },
	energiaIA: { min: 100, max: 100_000, log: true },
	energiaLimpia: { min: 0, max: 1 },
	temperatura: { min: 1, max: 8 },
	poblacion: { min: 6, max: 13 },
	poder: { min: 0, max: 100 },
	riesgo: { min: 0, max: 1 },
};

export type IdGrafico =
	| 'capacidad'
	| 'robots'
	| 'energiaIA'
	| 'trabajo'
	| 'desigualdad'
	| 'poblacion'
	| 'ciencia'
	| 'temperatura'
	| 'energiaLimpia'
	| 'poder'
	| 'riesgo';

export interface DefinicionGrafico {
	id: IdGrafico;
	ambito: Ambito;
	series: readonly Indicador[];
}

/** 12 series en 11 gráficos: automatización y empleo comparten "trabajo". */
export const GRAFICOS: readonly DefinicionGrafico[] = [
	{ id: 'capacidad', ambito: 'tecnologia', series: ['capacidad'] },
	{ id: 'robots', ambito: 'tecnologia', series: ['robots'] },
	{ id: 'energiaIA', ambito: 'tecnologia', series: ['energiaIA'] },
	{ id: 'trabajo', ambito: 'humanidad', series: ['automatizacion', 'empleo'] },
	{ id: 'desigualdad', ambito: 'humanidad', series: ['desigualdad'] },
	{ id: 'poblacion', ambito: 'humanidad', series: ['poblacion'] },
	{ id: 'ciencia', ambito: 'ciencia', series: ['ciencia'] },
	{ id: 'temperatura', ambito: 'planeta', series: ['temperatura'] },
	{ id: 'energiaLimpia', ambito: 'planeta', series: ['energiaLimpia'] },
	{ id: 'poder', ambito: 'politica', series: ['poder'] },
	{ id: 'riesgo', ambito: 'politica', series: ['riesgo'] },
];

const redondear = (n: number) => Math.round(n * 10) / 10;

export const xAnio = (t: number, n: number, ancho = ANCHO_GRAFICO) => redondear((t / (n - 1)) * ancho);

/** y en píxeles (0 arriba); los valores fuera de la escala se pegan al borde. */
export function yValor(valor: number, escala: Escala, alto = ALTO_GRAFICO): number {
	const transformar = (v: number) => (escala.log ? Math.log10(Math.max(v, escala.min)) : v);
	const fraccion = (transformar(valor) - transformar(escala.min)) / (transformar(escala.max) - transformar(escala.min));
	return redondear(alto * (1 - Math.min(1, Math.max(0, fraccion))));
}

const puntos = (valores: readonly number[], escala: Escala, ancho: number, alto: number) =>
	valores.map((v, t) => `${xAnio(t, valores.length, ancho)},${yValor(v, escala, alto)}`);

export function rutaLinea(valores: readonly number[], escala: Escala, ancho = ANCHO_GRAFICO, alto = ALTO_GRAFICO): string {
	return puntos(valores, escala, ancho, alto)
		.map((p, i) => `${i === 0 ? 'M' : 'L'}${p}`)
		.join('');
}

/** Polígono de la banda: borde superior de izquierda a derecha, inferior de vuelta. */
export function rutaBanda(
	bajos: readonly number[],
	altos: readonly number[],
	escala: Escala,
	ancho = ANCHO_GRAFICO,
	alto = ALTO_GRAFICO,
): string {
	const arriba = puntos(altos, escala, ancho, alto).map((p, i) => `${i === 0 ? 'M' : 'L'}${p}`);
	const abajo = puntos(bajos, escala, ancho, alto).reverse().map((p) => `L${p}`);
	return `${arriba.join('')}${abajo.join('')}Z`;
}
```

- [ ] **Step 5: Ejecuta las pruebas y los tipos**

Run: `npm test && npm run check`
Expected: todo PASS; `0 errors`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/futuros/formato.ts src/lib/futuros/trazado.ts src/lib/futuros/formato.test.ts src/lib/futuros/trazado.test.ts
git commit -m "feat: formato de indicadores y trazado SVG con escalas fijas"
```

---

### Task 7: Fuentes del modelo, verificadas

**Files:**
- Create: `src/content/fuentes.yaml`
- Modify: `src/content.config.ts` (colección `fuentes`)
- Modify (si una cifra no coincide): `src/lib/futuros/parametros.ts`, `src/lib/futuros/datos-onu.ts`

**Interfaces:**
- Produces: colección `fuentes` con ids `epoch-computo`, `epoch-hardware`, `eloundou-2023`, `grace-2024`, `oit-empleo`, `acemoglu-restrepo-2019`, `milanovic-2024`, `ifr-2024`, `aie-energia-ia`, `ei-statistical-review`, `gcb-2024`, `forster-2024`, `ipcc-ar6-wg1`, `onu-wpp-2024`, `xpt-2023`. Cada entrada: `titulo`, `organizacion`, `anio`, `tipo`, `url`, `fechaAcceso`.

- [ ] **Step 1: Añade la colección a `src/content.config.ts`**

Después de la colección `paginas`:

```ts
// Fichas de fuentes (R3). El modelo de futuros referencia sus ids en parametros.ts y calibracion.ts.
const fuentes = defineCollection({
	loader: file('src/content/fuentes.yaml'),
	schema: z.object({
		titulo: z.string(),
		organizacion: z.string(),
		anio: z.number().int(),
		tipo: z.enum(['oficial', 'revisado-por-pares', 'preprint', 'prensa', 'libro', 'dataset']),
		url: z.url(),
		fechaAcceso: z.coerce.date(),
	}),
});
```

Y cambia la exportación a `export const collections = { temas, paginas, fuentes };`.

- [ ] **Step 2: Crea `src/content/fuentes.yaml`** (pon en `fechaAcceso` la fecha real en que verifiques cada una en el paso 3)

```yaml
# Fuentes del modelo de futuros. Cada cifra usada se verificó contra el documento original.
- id: epoch-computo
  titulo: Training compute of frontier AI models grows by 4–5x per year
  organizacion: Epoch AI
  anio: 2024
  tipo: preprint
  url: https://epoch.ai/blog/training-compute-of-frontier-ai-models-grows-by-4-5x-per-year
  fechaAcceso: 2026-10-02
- id: epoch-hardware
  titulo: Trends in Machine Learning Hardware
  organizacion: Epoch AI
  anio: 2023
  tipo: preprint
  url: https://epoch.ai/blog/trends-in-machine-learning-hardware
  fechaAcceso: 2026-10-02
- id: eloundou-2023
  titulo: "GPTs are GPTs: An Early Look at the Labor Market Impact Potential of Large Language Models"
  organizacion: Eloundou, Manning, Mishkin y Rock
  anio: 2023
  tipo: preprint
  url: https://arxiv.org/abs/2303.10130
  fechaAcceso: 2026-10-02
- id: grace-2024
  titulo: Thousands of AI Authors on the Future of AI
  organizacion: Grace et al.
  anio: 2024
  tipo: preprint
  url: https://arxiv.org/abs/2401.02843
  fechaAcceso: 2026-10-02
- id: oit-empleo
  titulo: World Employment and Social Outlook
  organizacion: Organización Internacional del Trabajo
  anio: 2025
  tipo: oficial
  url: https://www.ilo.org/research-and-publications/world-employment-and-social-outlook
  fechaAcceso: 2026-10-02
- id: acemoglu-restrepo-2019
  titulo: "Automation and New Tasks: How Technology Displaces and Reinstates Labor"
  organizacion: Acemoglu y Restrepo, Journal of Economic Perspectives
  anio: 2019
  tipo: revisado-por-pares
  url: https://doi.org/10.1257/jep.33.2.3
  fechaAcceso: 2026-10-02
- id: milanovic-2024
  titulo: "The three eras of global inequality, 1820–2020 with the focus on the past thirty years"
  organizacion: Milanovic, World Development
  anio: 2024
  tipo: revisado-por-pares
  url: https://doi.org/10.1016/j.worlddev.2023.106516
  fechaAcceso: 2026-10-02
- id: ifr-2024
  titulo: "World Robotics 2024: Record of 4 Million Robots in Factories Worldwide"
  organizacion: International Federation of Robotics
  anio: 2024
  tipo: dataset
  url: https://ifr.org/ifr-press-releases/news/record-of-4-million-robots-working-in-factories-worldwide
  fechaAcceso: 2026-10-02
- id: aie-energia-ia
  titulo: Energy and AI
  organizacion: Agencia Internacional de la Energía
  anio: 2025
  tipo: oficial
  url: https://www.iea.org/reports/energy-and-ai
  fechaAcceso: 2026-10-02
- id: ei-statistical-review
  titulo: Statistical Review of World Energy
  organizacion: Energy Institute
  anio: 2025
  tipo: dataset
  url: https://www.energyinst.org/statistical-review
  fechaAcceso: 2026-10-02
- id: gcb-2024
  titulo: Global Carbon Budget 2024
  organizacion: Global Carbon Project
  anio: 2024
  tipo: revisado-por-pares
  url: https://globalcarbonbudget.org/
  fechaAcceso: 2026-10-02
- id: forster-2024
  titulo: "Indicators of Global Climate Change 2023"
  organizacion: Forster et al., Earth System Science Data
  anio: 2024
  tipo: revisado-por-pares
  url: https://doi.org/10.5194/essd-16-2625-2024
  fechaAcceso: 2026-10-02
- id: ipcc-ar6-wg1
  titulo: "Climate Change 2021: The Physical Science Basis (AR6 WGI)"
  organizacion: IPCC
  anio: 2021
  tipo: oficial
  url: https://www.ipcc.ch/report/ar6/wg1/
  fechaAcceso: 2026-10-02
- id: onu-wpp-2024
  titulo: World Population Prospects 2024
  organizacion: Naciones Unidas
  anio: 2024
  tipo: oficial
  url: https://population.un.org/wpp/
  fechaAcceso: 2026-10-02
- id: xpt-2023
  titulo: "Forecasting Existential Risk: Evidence from a Long-Run Forecasting Tournament"
  organizacion: Karger et al., Forecasting Research Institute
  anio: 2023
  tipo: preprint
  url: https://forecastingresearch.org/xpt
  fechaAcceso: 2026-10-02
```

- [ ] **Step 3: Verifica cada fuente contra el original**

Para cada entrada: comprueba que la URL responde (`curl -sIL -o /dev/null -w "%{http_code}" <url>` → 200 o 403 de un muro de pago con DOI válido) y lee la cifra que usa el modelo. Tabla de comprobación:

| Fuente | Cifra que debe confirmar | Parámetro |
|---|---|---|
| epoch-computo | cómputo de entrenamiento ×4–5 al año | `gMax` 4–5 |
| epoch-hardware | mejora anual de rendimiento por dólar | `gMin` 1,25–1,45 |
| ifr-2024 | 4,28 M robots industriales operativos en 2023; ~1,83 M en 2016 | `r0`, `rMin`, objetivo `robots-retro` |
| aie-energia-ia | 415 TWh en 2024; ~945 TWh en 2030 (caso base) | `eia0`, objetivo `energia-ia-2030` |
| ei-statistical-review | energía primaria ~620 EJ; no fósil ~19 % | `te0`, `q0` |
| gcb-2024 | fósil ~37,4 GtCO₂; uso del suelo ~4,2 GtCO₂ | `em0`, `u0` |
| forster-2024 | calentamiento inducido ~1,3 °C (2023) | `t0` 1,3–1,5 |
| ipcc-ar6-wg1 | TCRE 0,27–0,63 (mejor 0,45) °C/1000 GtCO₂; rangos SSP de la tabla SPM.1 | `tcre`, objetivos `temp-*` |
| onu-wpp-2024 | variante media 2025–2100 cada 5 años; intervalo 95 % en 2100 | `POBLACION_ONU`, objetivo `poblacion-2100` |
| oit-empleo | relación empleo-población ~58 % | `e0` |
| milanovic-2024 | Gini mundial reciente (~60) | `gini0` 58–67 |
| grace-2024 | 50 % de probabilidad de IA de nivel humano en 2047; automatización plena 2116 | objetivo `automatizacion-mitad` |
| xpt-2023 | catástrofe (≥10 % de muertes) a 2100: superpronosticadores ~9 %, expertos ~20 % | objetivos `riesgo-*` |
| eloundou-2023, acemoglu-restrepo-2019 | contexto cualitativo de `a0` y `κ` | `a0`, `kMin`, `kMax` |

Si una URL ha cambiado, actualízala. Si una cifra difiere, corrige el valor en `parametros.ts` o `datos-onu.ts` (o la URL) y vuelve a ejecutar `npx vitest run src/lib/futuros`. Si una corrección rompe la calibración, detente y avisa al autor con el dato y la fuente: no ajustes los objetivos para que pasen.

- [ ] **Step 4: Comprueba que el build valida las fichas**

Run: `npm run build`
Expected: `Complete!` sin errores de esquema.

- [ ] **Step 5: Commit**

```bash
git add src/content/fuentes.yaml src/content.config.ts src/lib/futuros
git commit -m "feat: fichas verificadas de las fuentes del modelo de futuros"
```

---

### Task 8: Textos de interfaz y colores de los ámbitos

**Files:**
- Modify: `src/i18n/ui.ts`
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/global.css`
- Test: `src/styles/contraste.test.ts`

**Interfaces:**
- Produces: `textos(lang).nav.futuros`; `textos(lang).futuros.{titulo, descripcion, escenario, cuadrantes[id].{nombre, lema}, matriz.{titulo, etiqueta, ejePaz, ejeFrontera, paz, frontera}, ambitos[Ambito], indicadores[Indicador], graficos[IdGrafico], panel.{etiqueta, controles, valorPaz(v), valorFrontera(v), restablecer(nombre), abrir, verDatos, anio, errorRecalculo, aviso(nombre), leerRelato(nombre)}, parada.{resumen, eventos, sinEventos}, ganancias, perdidas, supuestos, todos, modelo.{simbolo, descripcion, central, rango, fuente, supuesto, valor, cumple, noCumple}}`; tokens `--ambito-humanidad|tecnologia|ciencia|planeta|politica`; regla global `[hidden] { display: none !important }`.

- [ ] **Step 1: Escribe la prueba de contraste (falla)**

`src/styles/contraste.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

const css = readFileSync('src/styles/tokens.css', 'utf8');

/** [claro, oscuro] de un token definido con light-dark(#claro, #oscuro). */
function par(nombre: string): [string, string] {
	const m = css.match(new RegExp(`--${nombre}:\\s*light-dark\\((#[0-9a-f]{6}),\\s*(#[0-9a-f]{6})\\)`, 'i'));
	if (!m) throw new Error(`Falta el token --${nombre} en tokens.css`);
	return [m[1], m[2]];
}

const luminancia = (hex: string) => {
	const [r, g, b] = [1, 3, 5].map((i) => {
		const c = parseInt(hex.slice(i, i + 2), 16) / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contraste = (a: string, b: string) => {
	const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m);
	return (x + 0.05) / (y + 0.05);
};

test.each(['humanidad', 'tecnologia', 'ciencia', 'planeta', 'politica'])(
	'--ambito-%s tiene contraste AA sobre fondo y superficie en ambos temas',
	(ambito) => {
		const [claro, oscuro] = par(`ambito-${ambito}`);
		for (const fondo of ['fondo', 'superficie']) {
			const [fondoClaro, fondoOscuro] = par(fondo);
			expect(contraste(claro, fondoClaro)).toBeGreaterThanOrEqual(4.5);
			expect(contraste(oscuro, fondoOscuro)).toBeGreaterThanOrEqual(4.5);
		}
	},
);
```

- [ ] **Step 2: Ejecútala para verla fallar**

Run: `npx vitest run src/styles/contraste.test.ts`
Expected: FAIL con `Falta el token --ambito-humanidad en tokens.css`.

- [ ] **Step 3: Añade los tokens a `src/styles/tokens.css`** (después de `--no-etico`)

```css
	/* Ámbitos de los futuros: cifras del relato y líneas de sus gráficos (contraste ≥ 4,5:1, ver contraste.test.ts). */
	--ambito-humanidad: light-dark(#7a4a00, #f4b940);
	--ambito-tecnologia: light-dark(#3b3fa6, #c3c5ff);
	--ambito-ciencia: light-dark(#7a2d8c, #eab0f5);
	--ambito-planeta: light-dark(#2b6630, #a3dba5);
	--ambito-politica: light-dark(#0e5e70, #8fdcec);
```

- [ ] **Step 4: Añade la regla de `hidden` a `src/styles/global.css`** (después de `button { … }`)

```css
/* `hidden` gana siempre, aunque un componente declare display (p. ej. .control usa inline-flex). */
[hidden] {
	display: none !important;
}
```

Esto también corrige un fallo existente: el botón de tema (`.control.boton-tema`, con `hidden` hasta que carga el JS) se veía sin JavaScript.

- [ ] **Step 5: Añade los textos a `src/i18n/ui.ts`**

En `es.nav`, después de `sobre`: `futuros: 'Futuros',`. En `en.nav`: `futuros: 'Futures',`.

En `es`, después del bloque `apoyo`:

```ts
	futuros: {
		titulo: 'Futuros',
		descripcion:
			'Cuatro futuros a 100 años según cuánto regulemos y cooperemos y a qué velocidad avance la IA. Un modelo abierto, con sus ecuaciones, fuentes y límites.',
		escenario: 'Escenario, no predicción',
		cuadrantes: {
			pausa: { nombre: 'Pausa', lema: 'Regulamos y frenamos' },
			'frontera-en-paz': { nombre: 'Frontera en paz', lema: 'Regulamos y avanzamos' },
			carrera: { nombre: 'Carrera', lema: 'Sin reglas ni freno' },
			fractura: { nombre: 'Fractura', lema: 'Sin reglas; una crisis nos frena' },
		},
		matriz: {
			titulo: '¿Cómo será el mundo en 2126?',
			etiqueta: 'Los cuatro futuros',
			ejePaz: 'Paz: cuánto regulamos y cooperamos',
			ejeFrontera: 'Frontera: a qué velocidad avanza la IA',
			paz: 'Paz',
			frontera: 'Frontera',
		},
		ambitos: {
			humanidad: 'Humanidad',
			tecnologia: 'Robots y tecnología',
			ciencia: 'Ciencia',
			planeta: 'Planeta',
			politica: 'Política',
		},
		indicadores: {
			capacidad: 'Capacidad de la IA',
			automatizacion: 'Tareas automatizables',
			empleo: 'Población con empleo',
			desigualdad: 'Desigualdad',
			robots: 'Robots en funcionamiento',
			ciencia: 'Ritmo de la ciencia',
			energiaIA: 'Electricidad de la IA',
			energiaLimpia: 'Energía limpia',
			temperatura: 'Calentamiento',
			poblacion: 'Población',
			poder: 'Concentración del poder',
			riesgo: 'Riesgo de catástrofe',
		},
		graficos: {
			capacidad: 'Capacidad de la IA',
			robots: 'Robots',
			energiaIA: 'Electricidad de la IA',
			trabajo: 'Trabajo',
			desigualdad: 'Desigualdad',
			poblacion: 'Población',
			ciencia: 'Ritmo de la ciencia',
			temperatura: 'Calentamiento',
			energiaLimpia: 'Energía limpia',
			poder: 'Concentración del poder',
			riesgo: 'Riesgo acumulado de catástrofe',
		},
		panel: {
			etiqueta: 'Panel del futuro',
			controles: 'Posición en la matriz',
			valorPaz: (v: number) =>
				`Paz ${Math.round(v * 100)} %: ${v < 1 / 3 ? 'poca' : v < 2 / 3 ? 'algo de' : 'mucha'} cooperación`,
			valorFrontera: (v: number) =>
				`Frontera ${Math.round(v * 100)} %: IA ${v < 1 / 3 ? 'lenta' : v < 2 / 3 ? 'a ritmo medio' : 'muy rápida'}`,
			restablecer: (nombre: string) => `Volver a ${nombre}`,
			abrir: 'Ver panel',
			verDatos: 'Ver datos',
			anio: 'Año',
			errorRecalculo: 'No se pudo recalcular; mostramos el escenario base.',
			aviso: (nombre: string) =>
				`Con esta posición estás en ${nombre}. Las cifras siguen tu posición; el relato es el de esta página.`,
			leerRelato: (nombre: string) => `Leer el relato de ${nombre}`,
		},
		parada: {
			resumen: 'Resumen del modelo para esta década',
			eventos: 'Lo que pasa en esta década',
			sinEventos: 'El modelo no registra hitos en esta década.',
		},
		ganancias: 'Lo que se gana',
		perdidas: 'Lo que se pierde',
		supuestos: 'Supuestos de este futuro',
		todos: 'Todos los futuros',
		modelo: {
			simbolo: 'Símbolo',
			descripcion: 'Qué es',
			central: 'Valor central',
			rango: 'Rango',
			fuente: 'Fuente',
			supuesto: 'Supuesto',
			valor: 'Valor del modelo',
			cumple: 'Cumple',
			noCumple: 'No cumple',
		},
	},
```

En `en`, después de `apoyo`:

```ts
	futuros: {
		titulo: 'Futures',
		descripcion:
			'Four futures 100 years out, depending on how much we regulate and cooperate and how fast AI advances. An open model, with its equations, sources and limits.',
		escenario: 'A scenario, not a prediction',
		cuadrantes: {
			pausa: { nombre: 'Pause', lema: 'We regulate and slow down' },
			'frontera-en-paz': { nombre: 'Peaceful frontier', lema: 'We regulate and move forward' },
			carrera: { nombre: 'Race', lema: 'No rules, no brakes' },
			fractura: { nombre: 'Fracture', lema: 'No rules; a crisis slows us down' },
		},
		matriz: {
			titulo: 'What will the world look like in 2126?',
			etiqueta: 'The four futures',
			ejePaz: 'Peace: how much we regulate and cooperate',
			ejeFrontera: 'Frontier: how fast AI advances',
			paz: 'Peace',
			frontera: 'Frontier',
		},
		ambitos: {
			humanidad: 'Humanity',
			tecnologia: 'Robots and technology',
			ciencia: 'Science',
			planeta: 'Planet',
			politica: 'Politics',
		},
		indicadores: {
			capacidad: 'AI capability',
			automatizacion: 'Automatable tasks',
			empleo: 'People in employment',
			desigualdad: 'Inequality',
			robots: 'Robots in operation',
			ciencia: 'Pace of science',
			energiaIA: 'AI electricity',
			energiaLimpia: 'Clean energy',
			temperatura: 'Warming',
			poblacion: 'Population',
			poder: 'Power concentration',
			riesgo: 'Risk of catastrophe',
		},
		graficos: {
			capacidad: 'AI capability',
			robots: 'Robots',
			energiaIA: 'AI electricity',
			trabajo: 'Work',
			desigualdad: 'Inequality',
			poblacion: 'Population',
			ciencia: 'Pace of science',
			temperatura: 'Warming',
			energiaLimpia: 'Clean energy',
			poder: 'Power concentration',
			riesgo: 'Cumulative risk of catastrophe',
		},
		panel: {
			etiqueta: 'Future panel',
			controles: 'Position on the matrix',
			valorPaz: (v: number) =>
				`Peace ${Math.round(v * 100)}%: ${v < 1 / 3 ? 'little' : v < 2 / 3 ? 'some' : 'a lot of'} cooperation`,
			valorFrontera: (v: number) =>
				`Frontier ${Math.round(v * 100)}%: ${v < 1 / 3 ? 'slow' : v < 2 / 3 ? 'medium-paced' : 'very fast'} AI`,
			restablecer: (nombre: string) => `Back to ${nombre}`,
			abrir: 'Show panel',
			verDatos: 'See data',
			anio: 'Year',
			errorRecalculo: 'Could not recalculate; showing the base scenario.',
			aviso: (nombre: string) =>
				`At this position you are in ${nombre}. The numbers follow your position; the story is this page’s.`,
			leerRelato: (nombre: string) => `Read the ${nombre} story`,
		},
		parada: {
			resumen: 'Model summary for this decade',
			eventos: 'What happens this decade',
			sinEventos: 'The model records no milestones this decade.',
		},
		ganancias: 'What is gained',
		perdidas: 'What is lost',
		supuestos: 'Assumptions of this future',
		todos: 'All futures',
		modelo: {
			simbolo: 'Symbol',
			descripcion: 'What it is',
			central: 'Central value',
			rango: 'Range',
			fuente: 'Source',
			supuesto: 'Assumption',
			valor: 'Model value',
			cumple: 'Met',
			noCumple: 'Not met',
		},
	},
```

- [ ] **Step 6: Ejecuta pruebas y tipos**

Run: `npm test && npm run check`
Expected: PASS (5 pruebas de contraste) y `0 errors`. Si `check` marca que falta una clave en `en`, es que el bloque no quedó idéntico en estructura.

- [ ] **Step 7: Commit**

```bash
git add src/i18n/ui.ts src/styles/tokens.css src/styles/global.css src/styles/contraste.test.ts
git commit -m "feat: textos y colores de ámbito para los futuros"
```

---

### Task 9: Página de un futuro, estática, con el relato de Carrera

**Files:**
- Create: `src/env.d.ts`
- Create: `src/lib/futuros/contexto.ts`
- Modify: `src/content.config.ts` (colección `futuros`)
- Create: `src/components/futuros/MatrizFuturos.astro`
- Create: `src/components/futuros/Grafico.astro`
- Create: `src/components/futuros/PanelFuturo.astro`
- Create: `src/components/futuros/Parada.astro`
- Create: `src/components/futuros/Ambito.astro`
- Create: `src/components/futuros/Cifra.astro`
- Create: `src/components/vistas/PaginaFuturo.astro`
- Create: `src/pages/futuros/[slug].astro`
- Create: `src/pages/en/futures/[slug].astro`
- Create: `src/content/futuros/es/carrera.mdx`
- Test: `src/lib/futuros/relatos.test.ts`
- Test: `tests/e2e/futuros.spec.ts`
- Modify: `tests/e2e/sitio.spec.ts` (añadir `/futuros/carrera/` a `PAGINAS`)

**Interfaces:**
- Consumes: `proyectar` (tarea 3), `presetDe`, `urlFuturo`, `CUADRANTE_IDS`, `CuadranteId` (tarea 4), `formatear`, `porcentaje`, `celdaConBanda`, `INDICES_DECADAS` (tarea 6), `GRAFICOS`, `ESCALAS`, `rutaLinea`, `rutaBanda`, `ANCHO_GRAFICO`, `ALTO_GRAFICO` (tarea 6), `textoEvento` (tarea 3), textos de la tarea 8.
- Produces: `DatosFuturo`, `datosFuturo(locals)` (contexto.ts); componentes MDX `<Parada anio>`, `<Ambito id>`, `<Cifra v anio>`; atributos que la isla (tarea 10) actualiza: `data-cifra`/`data-anio`, `data-valor`, `data-linea`, `data-banda`, `data-cursor`, `data-tabla` (dentro de `[data-grafico]`), `data-eventos`/`data-desde`/`data-hasta`, `data-sin-eventos`, `data-anio-texto`, `data-punto`, `data-puerta`, `data-controles`, `data-salida`, `data-restablecer`, `data-estado`, `data-barra`, `data-panel`/`data-abierto`, `data-aviso`; contenedor `<ptf-futuro data-cuadrante data-lang data-paz data-frontera>`.

- [ ] **Step 1: Escribe la prueba de estructura de los relatos (falla)**

`src/lib/futuros/relatos.test.ts`:

```ts
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { CUADRANTE_IDS } from './posicion';
import { AMBITOS, INDICADORES } from './tipos';

const DIR = 'src/content/futuros';
const DECADAS = Array.from({ length: 11 }, (_, i) => 2026 + i * 10);
const CON_RELATO = [2036, 2056, 2086, 2126];

const archivos = (['es', 'en'] as const).flatMap((lang) =>
	CUADRANTE_IDS.map((id) => join(DIR, lang, `${id}.mdx`)).filter((ruta) => existsSync(ruta)),
);

test('existe al menos un relato', () => {
	expect(archivos.length).toBeGreaterThan(0);
});

for (const archivo of archivos) {
	describe(archivo, () => {
		const texto = readFileSync(archivo, 'utf8');
		const paradas = texto
			.split('<Parada anio={')
			.slice(1)
			.map((cuerpo) => ({ anio: Number(cuerpo.slice(0, 4)), cuerpo }));

		test('tiene las 11 décadas en orden', () => {
			expect(paradas.map((p) => p.anio)).toEqual(DECADAS);
		});

		test('relato en 2036, 2056, 2086 y 2126 con los cinco ámbitos; el resto, autocerradas', () => {
			for (const { anio, cuerpo } of paradas) {
				const autocerrada = /^\d{4}\} \/>/.test(cuerpo);
				expect(autocerrada, `parada ${anio}`).toBe(!CON_RELATO.includes(anio));
				if (autocerrada) continue;
				const ambitos = [...cuerpo.matchAll(/<Ambito id="([a-z]+)">([\s\S]*?)<\/Ambito>/g)];
				expect(ambitos.map((a) => a[1]), `ámbitos de ${anio}`).toEqual([...AMBITOS]);
				for (const [, ambito, contenido] of ambitos) expect(contenido, `${anio} ${ambito}`).toMatch(/<Cifra /);
			}
		});

		test('cada cifra usa un indicador válido y el año de su parada', () => {
			for (const { anio, cuerpo } of paradas)
				for (const [, v, anioCifra] of cuerpo.matchAll(/<Cifra v="([a-zA-Z]+)" anio=\{(\d{4})\} \/>/g)) {
					expect(INDICADORES).toContain(v);
					expect(Number(anioCifra)).toBe(anio);
				}
		});

		test('ningún número del relato se escribe a mano (todos van en <Cifra>)', () => {
			const sinCifras = texto
				.replace(/^---[\s\S]*?---/, '')
				.replace(/<Cifra[^>]*\/>/g, '')
				.replace(/<Parada anio=\{\d{4}\}/g, '');
			expect(sinCifras).not.toMatch(/\d+\s?(%|°C|TWh|millones|million|billion)/);
		});
	});
}
```

- [ ] **Step 2: Ejecútala para verla fallar**

Run: `npx vitest run src/lib/futuros/relatos.test.ts`
Expected: FAIL en `existe al menos un relato`.

- [ ] **Step 3: Tipa `Astro.locals` y crea el contexto**

`src/env.d.ts`:

```ts
declare namespace App {
	interface Locals {
		/** Lo fija PaginaFuturo antes de renderizar el relato; lo leen Parada, Ambito y Cifra. */
		futuro?: import('./lib/futuros/contexto').DatosFuturo;
	}
}
```

`src/lib/futuros/contexto.ts`:

```ts
import type { Idioma } from '../../i18n/rutas';
import type { Resultado } from './tipos';

export interface DatosFuturo {
	resultado: Resultado;
	lang: Idioma;
}

/** Los componentes del relato leen el modelo que calculó la página (verificado: Astro.locals llega al MDX). */
export function datosFuturo(locals: { futuro?: DatosFuturo }): DatosFuturo {
	if (!locals.futuro) {
		throw new Error('Componente de futuro fuera de una página de futuro: falta Astro.locals.futuro');
	}
	return locals.futuro;
}
```

- [ ] **Step 4: Añade la colección `futuros` a `src/content.config.ts`**

```ts
// Relato de cada futuro: src/content/futuros/<idioma>/<cuadrante>.mdx (spec futuros.md §7).
const futuros = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: 'src/content/futuros' }),
	schema: z.object({
		premisa: z.string(),
		supuestos: z.array(z.string()).min(2),
		ganancias: z.array(z.string()).min(2),
		perdidas: z.array(z.string()).min(2),
	}),
});
```

Exportación: `export const collections = { temas, paginas, fuentes, futuros };`.

- [ ] **Step 5: Crea `src/components/futuros/MatrizFuturos.astro`**

```astro
---
// Matriz Paz × Frontera: cuatro puertas de igual peso. "portada" en la home y en /futuros/; "mini" en el panel.
import type { Idioma } from '../../i18n/rutas';
import { textos } from '../../i18n/ui';
import { urlFuturo, type CuadranteId } from '../../lib/futuros/posicion';
import type { Posicion } from '../../lib/futuros/tipos';

interface Props {
	lang: Idioma;
	variante: 'portada' | 'mini';
	actual?: CuadranteId;
	posicion?: Posicion;
}

/** Arriba paz alta, abajo paz baja; a la izquierda frontera lenta, a la derecha rápida. */
const ORDEN: readonly CuadranteId[] = ['pausa', 'frontera-en-paz', 'fractura', 'carrera'];

const { lang, variante, actual, posicion } = Astro.props;
const t = textos(lang).futuros;
const Titulo = variante === 'portada' ? 'h2' : 'p';
const portada = variante === 'portada';
---

<div class:list={['matriz', `matriz-${variante}`]}>
	<Titulo class="matriz-titulo">{portada ? t.matriz.titulo : t.matriz.etiqueta}</Titulo>
	<p class="matriz-eje matriz-eje-x ui" aria-hidden={portada ? undefined : 'true'}>
		{portada ? t.matriz.ejeFrontera : t.matriz.frontera} →
	</p>
	<p class="matriz-eje matriz-eje-y ui" aria-hidden={portada ? undefined : 'true'}>
		{portada ? t.matriz.ejePaz : t.matriz.paz} →
	</p>
	<div class="matriz-area">
		<ul class="matriz-rejilla" aria-label={t.matriz.etiqueta}>
			{
				ORDEN.map((id) => (
					<li class:list={['puerta', `puerta-${id}`]}>
						<a href={urlFuturo(lang, id)} data-puerta={id} aria-current={actual === id ? 'page' : undefined}>
							<span class="puerta-nombre">{t.cuadrantes[id].nombre}</span>
							{portada && <span class="puerta-lema">{t.cuadrantes[id].lema}</span>}
						</a>
					</li>
				))
			}
		</ul>
		{
			posicion && (
				<span
					class="matriz-punto"
					data-punto
					style={`--x:${posicion.frontera};--y:${1 - posicion.paz}`}
					aria-hidden="true"
				/>
			)
		}
	</div>
</div>

<style>
	.matriz {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		grid-template-areas: 'titulo titulo' '. eje-x' 'eje-y area';
		gap: 0.6rem 0.75rem;
	}

	.matriz-titulo {
		grid-area: titulo;
		margin: 0 0 0.4rem;
		font-size: var(--t-h3);
		font-weight: 400;
		line-height: 1.2;
	}

	.matriz-eje {
		margin: 0;
		color: var(--tinta-suave);
		font-size: var(--t-mini);
	}

	.matriz-eje-x {
		grid-area: eje-x;
	}

	/* Se lee de abajo arriba: la paz crece hacia arriba. */
	.matriz-eje-y {
		grid-area: eje-y;
		writing-mode: vertical-rl;
		rotate: 180deg;
	}

	.matriz-area {
		grid-area: area;
		position: relative;
	}

	.matriz-rejilla {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5px;
		border: 1.5px solid var(--tinta);
		background: var(--tinta);
	}

	.puerta {
		display: flex;
		background: var(--fondo);
	}

	.puerta a {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		min-height: clamp(6.5rem, 4rem + 6vw, 9.5rem);
		padding: clamp(0.75rem, 0.5rem + 1vw, 1.25rem);
		color: var(--tinta);
		text-decoration: none;
		transition: background-color var(--dur-rapida);
	}

	/* Cada puerta se alinea a su esquina exterior, como los cuadrantes de un mapa. */
	.puerta-frontera-en-paz a,
	.puerta-carrera a {
		align-items: flex-end;
		text-align: end;
	}

	.puerta-fractura a,
	.puerta-carrera a {
		justify-content: flex-end;
	}

	.puerta a:hover,
	.puerta a[aria-current='page'] {
		background: var(--superficie);
	}

	.puerta a:hover .puerta-nombre {
		text-decoration: underline 1px;
		text-underline-offset: 0.2em;
	}

	.puerta a:focus-visible {
		outline-offset: -4px;
	}

	.puerta-nombre {
		font-size: clamp(1.25rem, 1rem + 1vw, 1.6rem);
		line-height: 1.15;
	}

	.puerta a[aria-current='page'] .puerta-nombre {
		font-weight: 600;
	}

	.puerta-lema {
		color: var(--tinta-suave);
		font-family: var(--fuente-sans);
		font-size: var(--t-ui);
		line-height: 1.35;
	}

	.matriz-mini {
		gap: 0.35rem 0.5rem;
	}

	.matriz-mini .matriz-titulo {
		margin: 0;
		color: var(--tinta-suave);
		font-family: var(--fuente-sans);
		font-size: var(--t-mini);
	}

	.matriz-mini .puerta a {
		min-height: 2.75rem;
		padding: 0.4rem 0.55rem;
	}

	.matriz-mini .puerta-nombre {
		font-family: var(--fuente-sans);
		font-size: 0.75rem;
	}

	.matriz-punto {
		position: absolute;
		left: calc(var(--x) * 100%);
		top: calc(var(--y) * 100%);
		width: 0.9rem;
		height: 0.9rem;
		translate: -50% -50%;
		border-radius: 50%;
		background: var(--sodio);
		box-shadow:
			0 0 0 1.5px var(--sobre-sodio),
			0 0 0 3.5px var(--fondo);
		pointer-events: none;
	}
</style>
```

- [ ] **Step 6: Crea `src/components/futuros/Grafico.astro`**

```astro
---
// Un gráfico del panel: banda del 80 %, mediana, cursor del año y tabla equivalente ("Ver datos").
// Los estilos de filas usan :global porque la isla recrea las filas (sin el atributo de alcance de Astro).
import type { Idioma } from '../../i18n/rutas';
import { textos } from '../../i18n/ui';
import { celdaConBanda, formatear, INDICES_DECADAS } from '../../lib/futuros/formato';
import {
	ALTO_GRAFICO,
	ANCHO_GRAFICO,
	ESCALAS,
	rutaBanda,
	rutaLinea,
	type DefinicionGrafico,
} from '../../lib/futuros/trazado';
import type { Resultado } from '../../lib/futuros/tipos';

interface Props {
	lang: Idioma;
	grafico: DefinicionGrafico;
	resultado: Resultado;
}

const { lang, grafico, resultado } = Astro.props;
const t = textos(lang).futuros;
const titulo = t.graficos[grafico.id];
const variasSeries = grafico.series.length > 1;
---

<li class="grafico" data-grafico={grafico.id} style={`--color: var(--ambito-${grafico.ambito})`}>
	<figure>
		<figcaption>
			<span class="grafico-titulo">{titulo}</span>
			<span class="grafico-valores">
				{
					grafico.series.map((s) => (
						<span class="grafico-valor">
							{variasSeries && <span class="grafico-serie">{t.indicadores[s]}</span>}
							<span data-valor={s}>{formatear(s, resultado.p50[s][0], lang)}</span>
						</span>
					))
				}
			</span>
		</figcaption>
		<svg viewBox={`0 0 ${ANCHO_GRAFICO} ${ALTO_GRAFICO}`} preserveAspectRatio="none" aria-hidden="true">
			{
				grafico.series.map((s, i) => (
					<g class:list={['serie', { 'serie-secundaria': i > 0 }]}>
						<path class="banda" data-banda={s} d={rutaBanda(resultado.p10[s], resultado.p90[s], ESCALAS[s])} />
						<path class="linea" data-linea={s} d={rutaLinea(resultado.p50[s], ESCALAS[s])} />
					</g>
				))
			}
			<line class="cursor" data-cursor x1="0" x2="0" y1="0" y2={ALTO_GRAFICO}></line>
		</svg>
		<details class="grafico-datos">
			<summary class="ui">{t.panel.verDatos}</summary>
			<div class="tabla-desplazable">
				<table class="ui">
					<caption class="solo-lectores">{titulo}</caption>
					<thead>
						<tr>
							<th scope="col">{t.panel.anio}</th>
							{grafico.series.map((s) => <th scope="col">{t.indicadores[s]}</th>)}
						</tr>
					</thead>
					<tbody data-tabla>
						{
							INDICES_DECADAS.map((i) => (
								<tr>
									<th scope="row">{resultado.anios[i]}</th>
									{grafico.series.map((s) => (
										<td>{celdaConBanda(s, resultado, i, lang)}</td>
									))}
								</tr>
							))
						}
					</tbody>
				</table>
			</div>
		</details>
	</figure>
</li>

<style>
	figure {
		margin: 0;
	}

	figcaption {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.25rem 0.75rem;
		font-family: var(--fuente-sans);
		font-size: var(--t-mini);
	}

	.grafico-titulo,
	.grafico-serie {
		color: var(--tinta-suave);
	}

	.grafico-valores {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.75rem;
		color: var(--color);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.grafico-serie {
		margin-right: 0.3rem;
		font-weight: 400;
	}

	svg {
		display: block;
		width: 100%;
		height: 2.75rem;
		margin-top: 0.3rem;
		overflow: visible;
	}

	.banda {
		fill: var(--color);
		opacity: 0.16;
	}

	.linea {
		fill: none;
		stroke: var(--color);
		stroke-width: 1.75;
		vector-effect: non-scaling-stroke;
	}

	.serie-secundaria .linea {
		opacity: 0.55;
	}

	.serie-secundaria .banda {
		opacity: 0.08;
	}

	.cursor {
		stroke: var(--tinta);
		stroke-width: 1;
		vector-effect: non-scaling-stroke;
	}

	summary {
		padding-block: 0.3rem;
		color: var(--tinta-suave);
		font-size: var(--t-mini);
		cursor: pointer;
	}

	.tabla-desplazable {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--t-mini);
		font-variant-numeric: tabular-nums;
	}

	table :global(th),
	table :global(td) {
		padding: 0.2rem 0.35rem;
		border-bottom: 1px solid var(--linea);
		text-align: start;
		white-space: nowrap;
	}
</style>
```

- [ ] **Step 7: Crea `src/components/futuros/PanelFuturo.astro`** (sin isla todavía; la tarea 10 añade el `<script>`)

```astro
---
// Panel fijo de un futuro: año visible, mini matriz, controles y gráficos, calculados al compilar.
// La isla <ptf-futuro> (panel-futuro.ts, tarea 10) los actualiza en el navegador.
import Grafico from './Grafico.astro';
import MatrizFuturos from './MatrizFuturos.astro';
import type { Idioma } from '../../i18n/rutas';
import { textos } from '../../i18n/ui';
import { formatear, porcentaje } from '../../lib/futuros/formato';
import type { CuadranteId } from '../../lib/futuros/posicion';
import { GRAFICOS } from '../../lib/futuros/trazado';
import { ANIO_INICIAL, type Posicion, type Resultado } from '../../lib/futuros/tipos';

interface Props {
	lang: Idioma;
	id: CuadranteId;
	resultado: Resultado;
	posicion: Posicion;
}

const { lang, id, resultado, posicion } = Astro.props;
const t = textos(lang).futuros;
const BARRA = ['capacidad', 'temperatura', 'riesgo'] as const;
const EJES = ['paz', 'frontera'] as const;
---

<div class="panel" data-panel data-abierto="false">
	<button
		class="panel-barra ui"
		type="button"
		aria-expanded="false"
		aria-controls="panel-contenido"
		data-barra
		hidden
	>
		<span class="panel-barra-anio" data-anio-texto>{ANIO_INICIAL}</span>
		{
			BARRA.map((s) => (
				<span class="panel-barra-cifra">
					<span class="solo-lectores">{t.indicadores[s]}: </span>
					<span data-valor={s}>{formatear(s, resultado.p50[s][0], lang)}</span>
				</span>
			))
		}
		<span class="panel-barra-accion">{t.panel.abrir}</span>
	</button>

	<div class="panel-contenido" id="panel-contenido">
		<p class="panel-anio" data-anio-texto>{ANIO_INICIAL}</p>
		<MatrizFuturos lang={lang} variante="mini" actual={id} posicion={posicion} />
		<fieldset class="controles ui" data-controles>
			<legend class="solo-lectores">{t.panel.controles}</legend>
			{
				EJES.map((eje) => (
					<label class="control-eje">
						<span class="control-nombre">{t.matriz[eje]}</span>
						<input
							type="range"
							name={eje}
							min="0"
							max="1"
							step="0.05"
							value={posicion[eje]}
							aria-valuetext={eje === 'paz' ? t.panel.valorPaz(posicion.paz) : t.panel.valorFrontera(posicion.frontera)}
						/>
						<output data-salida={eje}>{porcentaje(lang, posicion[eje])}</output>
					</label>
				))
			}
			<button class="restablecer" type="button" data-restablecer>
				{t.panel.restablecer(t.cuadrantes[id].nombre)}
			</button>
		</fieldset>
		<p class="panel-estado ui" role="status" data-estado></p>
		<ul class="graficos">
			{GRAFICOS.map((g) => <Grafico lang={lang} grafico={g} resultado={resultado} />)}
		</ul>
	</div>
</div>

<style>
	.panel-anio {
		margin: 0 0 1rem;
		font-size: clamp(2.25rem, 1.5rem + 2vw, 3rem);
		font-weight: 200;
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}

	.controles {
		display: grid;
		gap: 0.6rem;
		margin: 1.25rem 0 0;
		padding: 0;
		border: 0;
	}

	/* Sin JS no hay recálculo: el espacio se reserva (sin salto de diseño) pero no se ve. */
	:global(ptf-futuro:not([data-interactivo])) .controles {
		visibility: hidden;
	}

	.control-eje {
		display: grid;
		grid-template-columns: 5.5rem 1fr 3.5rem;
		align-items: center;
		gap: 0.6rem;
	}

	input[type='range'] {
		width: 100%;
		min-height: 1.75rem;
		accent-color: var(--tinta);
	}

	output {
		text-align: end;
		font-variant-numeric: tabular-nums;
	}

	.restablecer {
		justify-self: start;
		min-height: 2.25rem;
		padding: 0.3rem 0.9rem;
		border: 1px solid var(--linea);
		border-radius: 999px;
		background: none;
		cursor: pointer;
	}

	.restablecer:hover {
		background: var(--superficie);
	}

	.panel-estado:empty {
		display: none;
	}

	.graficos {
		display: grid;
		gap: 1.1rem;
		margin-top: 1.5rem;
	}

	.panel-barra {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem 1rem;
		width: 100%;
		min-height: 3.25rem;
		padding: 0.6rem var(--margen);
		border: 0;
		background: var(--fondo);
		color: var(--tinta);
		font-variant-numeric: tabular-nums;
		cursor: pointer;
	}

	.panel-barra-anio {
		font-weight: 600;
	}

	.panel-barra-accion {
		margin-left: auto;
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	@media (min-width: 64rem) {
		.panel-barra {
			display: none;
		}
	}
</style>
```

- [ ] **Step 8: Crea `Parada.astro`, `Ambito.astro` y `Cifra.astro` en `src/components/futuros/`**

`Parada.astro`:

```astro
---
// Una década del relato. Con texto (slot) muestra el relato; vacía (<Parada anio={2046} />), un resumen del modelo.
// :global en los eventos porque la isla los recrea.
import Cifra from './Cifra.astro';
import { textos } from '../../i18n/ui';
import { datosFuturo } from '../../lib/futuros/contexto';
import { textoEvento } from '../../lib/futuros/eventos';

interface Props {
	anio: number;
}

const { anio } = Astro.props;
const { resultado, lang } = datosFuturo(Astro.locals);
const t = textos(lang).futuros;
const hasta = anio === 2126 ? 2126 : anio + 9;
const eventos = resultado.eventos.filter((e) => e.anio >= anio && e.anio <= hasta);
const RESUMEN = ['capacidad', 'robots', 'empleo', 'temperatura', 'riesgo'] as const;
---

<section class="parada" id={String(anio)} data-anio={anio} aria-labelledby={`anio-${anio}`}>
	<h2 class="parada-anio" id={`anio-${anio}`}>{anio}</h2>
	{
		Astro.slots.has('default') ? (
			<div class="parada-relato">
				<slot />
			</div>
		) : (
			<div class="parada-resumen">
				<p class="ui">{t.parada.resumen}</p>
				<dl>
					{RESUMEN.map((s) => (
						<div>
							<dt>{t.indicadores[s]}</dt>
							<dd>
								<Cifra v={s} anio={anio} />
							</dd>
						</div>
					))}
				</dl>
			</div>
		)
	}
	<div class="parada-eventos">
		<h3 class="ui">{t.parada.eventos}</h3>
		<ul data-eventos data-desde={anio} data-hasta={hasta}>
			{
				eventos.map((e) => (
					<li>
						<span class="evento-anio">{e.anio}</span>
						{` ${textoEvento(e.id, lang)}`}
					</li>
				))
			}
		</ul>
		<p class="ui parada-sin-eventos" data-sin-eventos hidden={eventos.length > 0}>{t.parada.sinEventos}</p>
	</div>
</section>

<style>
	.parada {
		padding-block: clamp(2.5rem, 2rem + 3vw, 4.5rem);
		border-top: 1px solid var(--linea);
	}

	.parada-anio {
		margin-bottom: 1.5rem;
		font-size: clamp(3rem, 2rem + 4vw, 5.5rem);
		font-weight: 200;
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}

	.parada-relato {
		display: grid;
		gap: 1.75rem;
	}

	.parada-resumen dl {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
		gap: 1rem 1.5rem;
		margin: 1rem 0 0;
	}

	.parada-resumen dt {
		color: var(--tinta-suave);
		font-family: var(--fuente-sans);
		font-size: var(--t-mini);
	}

	.parada-resumen dd {
		margin: 0.2rem 0 0;
		font-size: 1.375rem;
	}

	.parada-eventos {
		margin-top: 2rem;
		padding: 1rem 1.25rem;
		background: var(--superficie);
	}

	.parada-eventos h3 {
		margin-bottom: 0.6rem;
		color: var(--tinta-suave);
		font-size: var(--t-mini);
		font-weight: 600;
	}

	.parada-eventos ul :global(li) {
		padding-block: 0.3rem;
		font-size: 1.0625rem;
	}

	.parada-eventos ul :global(.evento-anio) {
		margin-right: 0.4rem;
		font-family: var(--fuente-sans);
		font-size: var(--t-mini);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.parada-sin-eventos {
		color: var(--tinta-suave);
	}
</style>
```

`Ambito.astro`:

```astro
---
// Un ámbito dentro de una década: humanidad, tecnología, ciencia, planeta o política.
import { textos } from '../../i18n/ui';
import { datosFuturo } from '../../lib/futuros/contexto';
import type { Ambito } from '../../lib/futuros/tipos';

interface Props {
	id: Ambito;
}

const { id } = Astro.props;
const { lang } = datosFuturo(Astro.locals);
---

<div class="ambito" style={`--color: var(--ambito-${id})`}>
	<h3 class="ambito-nombre ui">{textos(lang).futuros.ambitos[id]}</h3>
	<div class="ambito-texto"><slot /></div>
</div>

<style>
	.ambito {
		padding-left: 1rem;
		border-left: 2px solid var(--color);
	}

	.ambito-nombre {
		margin-bottom: 0.35rem;
		color: var(--color);
		font-size: var(--t-mini);
		font-weight: 600;
	}

	.ambito-texto :global(p + p) {
		margin-top: 0.8em;
	}
</style>
```

`Cifra.astro`:

```astro
---
// Número del modelo dentro del relato. Nunca se escribe a mano: la isla lo actualiza si el lector mueve los controles.
import { datosFuturo } from '../../lib/futuros/contexto';
import { formatear } from '../../lib/futuros/formato';
import { AMBITO_DE, ANIO_INICIAL, INDICADORES, type Indicador } from '../../lib/futuros/tipos';

interface Props {
	v: Indicador;
	anio: number;
}

const { v, anio } = Astro.props;
const { resultado, lang } = datosFuturo(Astro.locals);
const t = anio - ANIO_INICIAL;
if (!INDICADORES.includes(v)) throw new Error(`<Cifra v="${v}">: indicador desconocido`);
if (!(t >= 0 && t < resultado.anios.length)) throw new Error(`<Cifra anio={${anio}}>: debe estar entre 2026 y 2126`);
---

<span class="cifra" data-cifra={v} data-anio={anio} style={`--color: var(--ambito-${AMBITO_DE[v]})`}
	>{formatear(v, resultado.p50[v][t], lang)}</span
>

<style>
	.cifra {
		color: var(--color);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
</style>
```

- [ ] **Step 9: Crea la vista `src/components/vistas/PaginaFuturo.astro`**

```astro
---
// Un futuro: cabecera (premisa, ganancias, pérdidas, supuestos), relato por décadas y panel fijo.
import { getEntry, render } from 'astro:content';
import Base from '../../layouts/Base.astro';
import LineaEvidencia from '../LineaEvidencia.astro';
import PanelFuturo from '../futuros/PanelFuturo.astro';
import { otroIdioma, ruta, type Idioma } from '../../i18n/rutas';
import { textos } from '../../i18n/ui';
import { proyectar } from '../../lib/futuros/montecarlo';
import { presetDe, urlFuturo, type CuadranteId } from '../../lib/futuros/posicion';

interface Props {
	lang: Idioma;
	id: CuadranteId;
}

const { lang, id } = Astro.props;
const entrada = await getEntry('futuros', `${lang}/${id}`);
if (!entrada) throw new Error(`Falta src/content/futuros/${lang}/${id}.mdx`);
const posicion = presetDe(id);
const resultado = proyectar(posicion);
// Antes de render(): Parada, Ambito y Cifra lo leen al renderizar el MDX.
Astro.locals.futuro = { resultado, lang };
const { Content } = await render(entrada);
const t = textos(lang).futuros;
const cuadrante = t.cuadrantes[id];
---

<Base
	lang={lang}
	titulo={cuadrante.nombre}
	descripcion={entrada.data.premisa}
	alternativa={urlFuturo(otroIdioma(lang), id)}
>
	<ptf-futuro
		class="contenedor futuro"
		data-cuadrante={id}
		data-lang={lang}
		data-paz={posicion.paz}
		data-frontera={posicion.frontera}
	>
		<header class="futuro-cabecera">
			<nav class="ruta ui" aria-label={textos(lang).tema.ruta}>
				<a href={ruta(lang, 'futuros')}>{t.todos}</a>
			</nav>
			<h1>{cuadrante.nombre}</h1>
			<p class="futuro-lema">{cuadrante.lema}</p>
			<p class="entradilla">{entrada.data.premisa}</p>
			<p class="futuro-nivel ui"><LineaEvidencia nivel="escenario-ficcion" /> {t.escenario}</p>
			<div class="futuro-balance">
				<section aria-labelledby="titulo-ganancias">
					<h2 id="titulo-ganancias">{t.ganancias}</h2>
					<ul>{entrada.data.ganancias.map((g) => <li>{g}</li>)}</ul>
				</section>
				<section aria-labelledby="titulo-perdidas">
					<h2 id="titulo-perdidas">{t.perdidas}</h2>
					<ul>{entrada.data.perdidas.map((p) => <li>{p}</li>)}</ul>
				</section>
			</div>
			<details class="futuro-supuestos">
				<summary class="ui">{t.supuestos}</summary>
				<ul>{entrada.data.supuestos.map((s) => <li>{s}</li>)}</ul>
			</details>
		</header>

		<div class="futuro-cuerpo">
			<div class="futuro-relato">
				<p class="aviso-cuadrante ui" data-aviso role="status" hidden></p>
				<Content />
			</div>
			<aside class="futuro-panel" aria-label={t.panel.etiqueta}>
				<PanelFuturo lang={lang} id={id} resultado={resultado} posicion={posicion} />
			</aside>
		</div>
	</ptf-futuro>
</Base>

<style>
	ptf-futuro {
		display: block;
	}

	.futuro-cabecera {
		max-width: 46rem;
		padding-top: clamp(2rem, 1rem + 3vw, 4rem);
	}

	.ruta {
		color: var(--tinta-suave);
	}

	.futuro-cabecera h1 {
		margin-top: 1.5rem;
		font-size: var(--t-titulo);
	}

	.futuro-lema {
		margin-top: 0.5rem;
		color: var(--tinta-suave);
		font-size: var(--t-h3);
	}

	.futuro-cabecera .entradilla {
		margin-top: 1.5rem;
	}

	.futuro-nivel {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 1.25rem;
		color: var(--tinta-suave);
	}

	.futuro-balance {
		display: grid;
		gap: 1.5rem 3rem;
		margin-top: 2.5rem;
	}

	@media (min-width: 48rem) {
		.futuro-balance {
			grid-template-columns: 1fr 1fr;
		}
	}

	.futuro-balance h2 {
		margin-bottom: 0.75rem;
		font-family: var(--fuente-sans);
		font-size: var(--t-ui);
		font-weight: 600;
	}

	.futuro-balance ul,
	.futuro-supuestos ul {
		display: grid;
		gap: 0.5rem;
		padding-left: 1.1rem;
		list-style: disc;
	}

	.futuro-supuestos {
		margin-top: 2rem;
		padding-block: 0.75rem;
		border-block: 1px solid var(--linea);
	}

	.futuro-supuestos summary {
		cursor: pointer;
	}

	.futuro-supuestos ul {
		margin-top: 0.75rem;
	}

	.futuro-cuerpo {
		display: grid;
		gap: 3rem;
		margin-top: clamp(2.5rem, 2rem + 3vw, 4.5rem);
	}

	.aviso-cuadrante {
		margin-bottom: 1.5rem;
		padding: 1rem 1.25rem;
		border-left: 2px solid var(--sodio);
		background: var(--superficie);
	}

	@media (min-width: 64rem) {
		.futuro-cuerpo {
			grid-template-columns: minmax(0, 38rem) minmax(19rem, 1fr);
			gap: clamp(2.5rem, 4vw, 5rem);
			align-items: start;
		}

		.futuro-panel {
			position: sticky;
			top: calc(var(--alto-cabecera) + 1rem);
			max-height: calc(100dvh - var(--alto-cabecera) - 2rem);
			overflow-y: auto;
			overscroll-behavior: contain;
		}
	}

	/* Móvil con JS: el panel es una barra fija abajo que se despliega. */
	@media (max-width: 63.99rem) {
		ptf-futuro[data-interactivo] .futuro-panel {
			position: fixed;
			inset: auto 0 0;
			z-index: 9;
			max-height: 75dvh;
			overflow-y: auto;
			border-top: 1.5px solid var(--tinta);
			background: var(--fondo);
		}

		ptf-futuro[data-interactivo] :global(.panel[data-abierto='false'] .panel-contenido) {
			display: none;
		}

		ptf-futuro[data-interactivo] :global(.panel-contenido) {
			padding: 0 var(--margen) 1.5rem;
		}

		ptf-futuro[data-interactivo] .futuro-relato {
			padding-bottom: 4rem;
		}
	}
</style>
```

- [ ] **Step 10: Crea las rutas** (se generan solo para los relatos que existen)

`src/pages/futuros/[slug].astro`:

```astro
---
import { getCollection } from 'astro:content';
import PaginaFuturo from '../../components/vistas/PaginaFuturo.astro';
import { CUADRANTES, type CuadranteId } from '../../lib/futuros/posicion';

export async function getStaticPaths() {
	const relatos = await getCollection('futuros', (e) => e.id.startsWith('es/'));
	return relatos.map((e) => {
		const id = e.id.slice('es/'.length) as CuadranteId;
		return { params: { slug: CUADRANTES[id].slug.es }, props: { id } };
	});
}

const { id } = Astro.props;
---

<PaginaFuturo lang="es" id={id} />
```

`src/pages/en/futures/[slug].astro`:

```astro
---
import { getCollection } from 'astro:content';
import PaginaFuturo from '../../../components/vistas/PaginaFuturo.astro';
import { CUADRANTES, type CuadranteId } from '../../../lib/futuros/posicion';

export async function getStaticPaths() {
	const relatos = await getCollection('futuros', (e) => e.id.startsWith('en/'));
	return relatos.map((e) => {
		const id = e.id.slice('en/'.length) as CuadranteId;
		return { params: { slug: CUADRANTES[id].slug.en }, props: { id } };
	});
}

const { id } = Astro.props;
---

<PaginaFuturo lang="en" id={id} />
```

- [ ] **Step 11: Escribe `src/content/futuros/es/carrera.mdx`** (relato de referencia: los demás siguen su forma)

```mdx
---
premisa: Ningún acuerdo frena la IA. Empresas y países compiten por llegar primero, sin reglas comunes ni pausas. El progreso es rápido y el poder se concentra en quien gana.
supuestos:
  - No hay tratados internacionales sobre IA avanzada ni límites al cómputo.
  - La inversión en IA crece mientras dé ventaja económica o militar.
  - La redistribución y las nuevas protecciones laborales llegan tarde o no llegan.
  - Las tensiones entre bloques desatan crisis globales cada cierto tiempo.
ganancias:
  - Avances científicos y médicos muy rápidos en las primeras décadas.
  - Abundancia material, porque robots y automatización abaratan casi todo lo que se fabrica.
  - Una ventaja económica enorme para quien lidera la carrera.
perdidas:
  - El empleo y el ingreso se concentran y la desigualdad sube con fuerza.
  - El poder queda en muy pocas manos, públicas o privadas.
  - El riesgo de catástrofe es el más alto de los cuatro futuros.
  - Las crisis recurrentes frenan la transición energética.
---

import Ambito from '../../../components/futuros/Ambito.astro';
import Cifra from '../../../components/futuros/Cifra.astro';
import Parada from '../../../components/futuros/Parada.astro';

<Parada anio={2026} />

<Parada anio={2036}>
<Ambito id="humanidad">
Diez años de carrera bastan para cambiar el trabajo. La IA ya puede hacer <Cifra v="automatizacion" anio={2036} /> de las tareas humanas y la proporción de la población en edad de trabajar con empleo baja a <Cifra v="empleo" anio={2036} />. Aparecen oficios nuevos, pero en otros lugares y para otra gente.
</Ambito>
<Ambito id="tecnologia">
Hay <Cifra v="robots" anio={2036} /> de robots en funcionamiento, sobre todo en fábricas y almacenes. Los centros de datos consumen <Cifra v="energiaIA" anio={2036} /> al año, más electricidad que muchos países enteros.
</Ambito>
<Ambito id="ciencia">
El ritmo de descubrimiento ya es <Cifra v="ciencia" anio={2036} /> el de 2026. Llegan fármacos diseñados por IA en tiempo récord, sobre todo donde hay dinero para pagarlos.
</Ambito>
<Ambito id="planeta">
La energía limpia apenas sube al <Cifra v="energiaLimpia" anio={2036} />: la prioridad es el cómputo, no el clima. El calentamiento ronda <Cifra v="temperatura" anio={2036} />.
</Ambito>
<Ambito id="politica">
Sin reglas comunes, el índice de concentración del poder sube a <Cifra v="poder" anio={2036} />. Las tensiones entre bloques ya desataron una crisis global. El riesgo acumulado de catástrofe es de <Cifra v="riesgo" anio={2036} />.
</Ambito>
</Parada>

<Parada anio={2046} />

<Parada anio={2056}>
<Ambito id="humanidad">
Más de la mitad de las tareas ya son automatizables: <Cifra v="automatizacion" anio={2056} />. Solo <Cifra v="empleo" anio={2056} /> de la población en edad de trabajar tiene empleo; el resto vive de rentas, ayudas privadas o trabajos que no aparecen en las estadísticas. La desigualdad llega a <Cifra v="desigualdad" anio={2056} />.
</Ambito>
<Ambito id="tecnologia">
Hay <Cifra v="robots" anio={2056} /> de robots en fábricas, almacenes, campos y casas. Los centros de datos consumen <Cifra v="energiaIA" anio={2056} /> al año.
</Ambito>
<Ambito id="ciencia">
La ciencia avanza <Cifra v="ciencia" anio={2056} /> respecto a 2026. Muchas enfermedades raras tienen tratamiento, pero el acceso depende de dónde vivas y de quién controle las patentes.
</Ambito>
<Ambito id="planeta">
La energía limpia llega al <Cifra v="energiaLimpia" anio={2056} />, porque la demanda crece más rápido que la transición. El calentamiento alcanza <Cifra v="temperatura" anio={2056} />.
</Ambito>
<Ambito id="politica">
El índice de concentración del poder llega a <Cifra v="poder" anio={2056} />: un puñado de empresas y Estados controla los modelos más capaces. El riesgo acumulado de catástrofe es de <Cifra v="riesgo" anio={2056} />.
</Ambito>
</Parada>

<Parada anio={2066} />

<Parada anio={2076} />

<Parada anio={2086}>
<Ambito id="humanidad">
La automatización alcanza <Cifra v="automatizacion" anio={2086} /> de las tareas y el empleo se estabiliza en <Cifra v="empleo" anio={2086} />. Para mucha gente, la pregunta ya no es en qué trabajar sino de qué vivir y para qué. La desigualdad es de <Cifra v="desigualdad" anio={2086} />.
</Ambito>
<Ambito id="tecnologia">
Hay <Cifra v="robots" anio={2086} /> de robots. Las máquinas hacen la mayor parte del trabajo físico, y su coste ha caído tanto que casi cualquier cosa fabricada es barata.
</Ambito>
<Ambito id="ciencia">
El ritmo de la ciencia es <Cifra v="ciencia" anio={2086} /> el de 2026. La investigación la dirigen sistemas de IA que proponen y prueban hipótesis día y noche; los humanos revisan una parte cada vez menor.
</Ambito>
<Ambito id="planeta">
La energía limpia llega al <Cifra v="energiaLimpia" anio={2086} />, empujada por su propio precio más que por acuerdos. El calentamiento ya es de <Cifra v="temperatura" anio={2086} />, con veranos que cambian dónde se puede vivir y cultivar.
</Ambito>
<Ambito id="politica">
La concentración del poder llega a <Cifra v="poder" anio={2086} />: las decisiones que importan se toman en pocas salas. El riesgo acumulado de catástrofe es de <Cifra v="riesgo" anio={2086} />.
</Ambito>
</Parada>

<Parada anio={2096} />

<Parada anio={2106} />

<Parada anio={2116} />

<Parada anio={2126}>
<Ambito id="humanidad">
Un siglo después, <Cifra v="automatizacion" anio={2126} /> de las tareas son automatizables y <Cifra v="empleo" anio={2126} /> de la población en edad de trabajar tiene empleo. La abundancia material convive con una gran distancia entre quienes poseen las máquinas y quienes no: la desigualdad es de <Cifra v="desigualdad" anio={2126} />.
</Ambito>
<Ambito id="tecnologia">
Hay <Cifra v="robots" anio={2126} /> de robots. La capacidad de la IA se acerca a su techo físico; lo que cambia ya no es cuánto pueden hacer las máquinas sino quién las dirige.
</Ambito>
<Ambito id="ciencia">
La ciencia avanza <Cifra v="ciencia" anio={2126} /> respecto a 2026, pero gran parte de lo que se descubre ya no lo entiende por completo ningún ser humano.
</Ambito>
<Ambito id="planeta">
La energía limpia llega al <Cifra v="energiaLimpia" anio={2126} /> y el calentamiento se estabiliza cerca de <Cifra v="temperatura" anio={2126} />. Una transición más temprana habría evitado buena parte del daño.
</Ambito>
<Ambito id="politica">
La concentración del poder es de <Cifra v="poder" anio={2126} />. El riesgo acumulado de catástrofe, <Cifra v="riesgo" anio={2126} />, es el más alto de los cuatro futuros.
</Ambito>
</Parada>
```

- [ ] **Step 12: Ejecuta la prueba de estructura y el build**

Run: `npx vitest run src/lib/futuros/relatos.test.ts && npm run build && npm run test:csp`
Expected: PASS (5 pruebas); el build genera `/futuros/carrera/index.html`; CSP sin bloques sin hash.

- [ ] **Step 13: Escribe la prueba de navegador sin JavaScript** (`tests/e2e/futuros.spec.ts`)

```ts
import { expect, test } from '@playwright/test';

test.describe('un futuro sin JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	test('muestra relato, cifras y gráficos; no muestra controles', async ({ page }) => {
		await page.goto('/futuros/carrera/');
		await expect(page.locator('h1')).toHaveText('Carrera');
		await expect(page.locator('[data-cifra="automatizacion"][data-anio="2036"]')).toHaveText(/\d/);
		await expect(page.locator('[data-linea="temperatura"]')).toHaveAttribute('d', /^M0,/);
		await expect(page.locator('[id="2046"] .parada-resumen')).toBeVisible();
		await expect(page.locator('[data-controles]')).toBeHidden();
	});
});
```

Y en `tests/e2e/sitio.spec.ts`, añade `'/futuros/carrera/',` a `PAGINAS`.

- [ ] **Step 14: Ejecuta las pruebas de navegador**

Run: `npm run test:e2e`
Expected: PASS en los cuatro proyectos (incluye axe y consola sin errores en `/futuros/carrera/` en ambos temas, y sin desborde a 320 px).

- [ ] **Step 15: Revisa visualmente**

Run: `npx astro preview --background` y abre `http://localhost:4321/futuros/carrera/` a 1440 px y 375 px, en claro y oscuro. Comprueba: el panel queda fijo a la derecha en escritorio; los cinco colores de ámbito se distinguen; las cifras tienen el color de su ámbito; la mini matriz muestra el punto en el cuadrante de Carrera (abajo a la derecha). `npx astro preview stop` al terminar.

- [ ] **Step 16: Commit**

```bash
git add src/env.d.ts src/lib/futuros/contexto.ts src/content.config.ts src/components/futuros src/components/vistas/PaginaFuturo.astro src/pages/futuros src/pages/en/futures src/content/futuros src/lib/futuros/relatos.test.ts tests/e2e
git commit -m "feat: página estática de un futuro con el relato de Carrera"
```

---

### Task 10: Isla interactiva `<ptf-futuro>`

**Files:**
- Create: `src/components/futuros/panel-futuro.ts`
- Modify: `src/components/futuros/PanelFuturo.astro` (añadir el `<script>`)
- Test: `tests/e2e/futuros.spec.ts`

**Interfaces:**
- Consumes: todo lo producido en las tareas 3, 4, 6, 8 y los atributos `data-*` de la tarea 9.
- Produces: custom element `ptf-futuro` que marca `data-interactivo` al conectarse.

- [ ] **Step 1: Escribe las pruebas de navegador (fallan)** — añade a `tests/e2e/futuros.spec.ts`:

```ts
test.describe('un futuro interactivo', () => {
	test('mover Paz con el teclado actualiza URL, cifras, gráfico y descripción', async ({ page, isMobile }) => {
		test.skip(isMobile, 'en móvil los controles están en la barra plegada; se prueba aparte');
		await page.goto('/futuros/carrera/');
		const cifra = page.locator('[data-cifra="desigualdad"][data-anio="2056"]');
		const linea = page.locator('[data-linea="riesgo"]');
		const antesCifra = await cifra.textContent();
		const antesLinea = await linea.getAttribute('d');
		const paz = page.getByRole('slider', { name: 'Paz' });
		await paz.focus();
		for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight');
		await expect(page).toHaveURL(/\?paz=0\.65&frontera=0\.85/);
		await expect(cifra).not.toHaveText(antesCifra ?? '');
		await expect(linea).not.toHaveAttribute('d', antesLinea ?? '');
		await expect(paz).toHaveAttribute('aria-valuetext', /^Paz 65 %/);
	});

	test('una posición de otro cuadrante muestra el aviso con enlace a ese relato', async ({ page }) => {
		await page.goto('/futuros/carrera/?paz=0.9&frontera=0.9');
		const aviso = page.locator('[data-aviso]');
		await expect(aviso).toBeVisible();
		await expect(aviso).toContainText('Frontera en paz');
		await expect(aviso.getByRole('link')).toHaveAttribute(
			'href',
			/^\/futuros\/frontera-en-paz\/\?paz=0\.90&frontera=0\.90#20\d6$/,
		);
	});

	test('parámetros inválidos caen al futuro y se recortan, sin errores', async ({ page }) => {
		const errores: string[] = [];
		page.on('pageerror', (e) => errores.push(e.message));
		await page.goto('/futuros/carrera/?paz=abc&frontera=5');
		await expect(page.getByRole('slider', { name: 'Paz' })).toHaveValue('0.15');
		await expect(page.getByRole('slider', { name: 'Frontera' })).toHaveValue('1');
		expect(errores).toEqual([]);
	});

	test('un hash que no es una década no rompe la página (Review Focus 2)', async ({ page }) => {
		const errores: string[] = [];
		page.on('pageerror', (e) => errores.push(e.message));
		await page.goto('/futuros/carrera/#abc');
		await expect(page.locator('.panel-anio')).toHaveText(/^20\d\d$/);
		await page.goto('/futuros/carrera/#2050');
		await expect(page.locator('.panel-anio')).toHaveText(/^20\d\d$/);
		expect(errores).toEqual([]);
	});

	test('un arrastre rápido termina en el último valor, sin errores (Review Focus 3)', async ({ page }) => {
		const errores: string[] = [];
		page.on('pageerror', (e) => errores.push(e.message));
		await page.goto('/futuros/carrera/');
		await page.evaluate(() => {
			const control = document.querySelector<HTMLInputElement>('input[name="frontera"]')!;
			for (let i = 0; i <= 20; i++) {
				control.value = String(i / 20);
				control.dispatchEvent(new Event('input', { bubbles: true }));
			}
		});
		await expect(page).toHaveURL(/frontera=1\.00/);
		await expect(page.locator('[data-salida="frontera"]')).toHaveText(/100/);
		expect(errores).toEqual([]);
	});

	test('“Volver a Carrera” restaura la posición y limpia la URL (Review Focus 4)', async ({ page, isMobile }) => {
		test.skip(isMobile, 'en móvil el botón está en la barra plegada');
		await page.goto('/futuros/carrera/?paz=0.5&frontera=0.5');
		await page.getByRole('button', { name: 'Volver a Carrera' }).click();
		await expect(page).toHaveURL(/\/futuros\/carrera\/(#\d+)?$/);
		await expect(page.getByRole('slider', { name: 'Paz' })).toHaveValue('0.15');
		await expect(page.locator('[data-aviso]')).toBeHidden();
	});

	test('el año del panel sigue a la década visible y la mini matriz conserva el año', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/futuros/carrera/');
		await page.locator('[id="2086"]').evaluate((el) => el.scrollIntoView({ block: 'center' }));
		await expect(page.locator('.panel-anio')).toHaveText('2086');
		await expect(page.locator('[data-puerta="pausa"]')).toHaveAttribute('href', '/futuros/pausa/#2086');
	});

	test('en móvil el panel es una barra que se despliega', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 800 });
		await page.goto('/futuros/carrera/');
		const barra = page.locator('[data-barra]');
		await expect(barra).toBeVisible();
		await expect(page.getByRole('slider', { name: 'Paz' })).toBeHidden();
		await barra.click();
		await expect(barra).toHaveAttribute('aria-expanded', 'true');
		await expect(page.getByRole('slider', { name: 'Paz' })).toBeVisible();
	});
});
```

- [ ] **Step 2: Ejecútalas para verlas fallar**

Run: `npx playwright test tests/e2e/futuros.spec.ts --project=chromium`
Expected: FAIL (la URL no cambia, no hay aviso, la barra no aparece).

- [ ] **Step 3: Escribe `src/components/futuros/panel-futuro.ts`**

```ts
// Isla de un futuro: controles paz/frontera, recálculo del modelo, URL compartible y año visible.
// La página llega calculada al compilar; esto solo actualiza atributos y textos.
import type { Idioma } from '../../i18n/rutas';
import { textos } from '../../i18n/ui';
import { textoEvento } from '../../lib/futuros/eventos';
import { celdaConBanda, formatear, INDICES_DECADAS, porcentaje } from '../../lib/futuros/formato';
import { proyectar } from '../../lib/futuros/montecarlo';
import {
	cuadranteCercano,
	escribirPosicion,
	leerPosicion,
	mismaPosicion,
	urlFuturo,
	type CuadranteId,
} from '../../lib/futuros/posicion';
import { ESCALAS, GRAFICOS, rutaBanda, rutaLinea, xAnio } from '../../lib/futuros/trazado';
import { ANIO_INICIAL, ANIOS, INDICADORES, type Indicador, type Posicion, type Resultado } from '../../lib/futuros/tipos';

const EJES = ['paz', 'frontera'] as const;

function fila(anio: number, celdas: string[]): HTMLTableRowElement {
	const tr = document.createElement('tr');
	const th = document.createElement('th');
	th.scope = 'row';
	th.textContent = String(anio);
	const tds = celdas.map((texto) => {
		const td = document.createElement('td');
		td.textContent = texto;
		return td;
	});
	tr.append(th, ...tds);
	return tr;
}

function itemEvento(anio: number, texto: string): HTMLLIElement {
	const li = document.createElement('li');
	const marca = document.createElement('span');
	marca.className = 'evento-anio';
	marca.textContent = String(anio);
	li.append(marca, ` ${texto}`);
	return li;
}

/** Año del hash (#2056) si cae dentro del siglo; si no, 2026. */
function anioDelHash(hash: string): number {
	const anio = Number(hash.slice(1));
	return Number.isInteger(anio) && anio >= ANIO_INICIAL && anio < ANIO_INICIAL + ANIOS ? anio : ANIO_INICIAL;
}

class PtfFuturo extends HTMLElement {
	private lang: Idioma = 'es';
	private cuadrante: CuadranteId = 'pausa';
	private preset: Posicion = { paz: 0.5, frontera: 0.5 };
	private posicion: Posicion = { paz: 0.5, frontera: 0.5 };
	private resultado: Resultado | null = null;
	private anio = ANIO_INICIAL;
	private fotograma = 0;

	connectedCallback() {
		this.lang = this.dataset.lang === 'en' ? 'en' : 'es';
		this.cuadrante = this.dataset.cuadrante as CuadranteId;
		this.preset = { paz: Number(this.dataset.paz), frontera: Number(this.dataset.frontera) };
		this.posicion = leerPosicion(new URLSearchParams(location.search), this.preset);
		this.anio = anioDelHash(location.hash);
		this.dataset.interactivo = '';
		this.prepararControles();
		this.prepararBarra();
		this.observarParadas();
		this.recalcular();
	}

	private get t() {
		return textos(this.lang).futuros;
	}

	private prepararControles() {
		for (const eje of EJES) {
			this.querySelector<HTMLInputElement>(`input[name="${eje}"]`)?.addEventListener('input', (e) => {
				this.posicion = { ...this.posicion, [eje]: Number((e.target as HTMLInputElement).value) };
				this.programarRecalculo();
			});
		}
		this.querySelector('[data-restablecer]')?.addEventListener('click', () => {
			this.posicion = this.preset;
			this.programarRecalculo();
		});
	}

	private prepararBarra() {
		const barra = this.querySelector<HTMLButtonElement>('[data-barra]');
		const panel = this.querySelector<HTMLElement>('[data-panel]');
		if (!barra || !panel) return;
		barra.hidden = false;
		barra.addEventListener('click', () => {
			const abierto = panel.dataset.abierto !== 'true';
			panel.dataset.abierto = String(abierto);
			barra.setAttribute('aria-expanded', String(abierto));
		});
	}

	private observarParadas() {
		const observador = new IntersectionObserver(
			(entradas) => {
				const visible = entradas.find((e) => e.isIntersecting);
				if (!visible) return;
				this.anio = Number((visible.target as HTMLElement).dataset.anio);
				this.pintarAnio();
			},
			{ rootMargin: '-40% 0px -55% 0px' },
		);
		for (const parada of this.querySelectorAll('.parada')) observador.observe(parada);
	}

	/** Un recálculo por fotograma aunque el control dispare decenas de eventos. */
	private programarRecalculo() {
		cancelAnimationFrame(this.fotograma);
		this.fotograma = requestAnimationFrame(() => this.recalcular());
	}

	private recalcular() {
		try {
			this.resultado = proyectar(this.posicion);
		} catch (error) {
			console.warn('No se pudo recalcular el futuro', error);
			this.estado(this.t.panel.errorRecalculo);
			return;
		}
		this.estado('');
		this.pintarControles();
		this.pintarGraficos();
		this.pintarCifras();
		this.pintarEventos();
		this.pintarAnio();
		this.actualizarUrl();
	}

	private estado(texto: string) {
		const el = this.querySelector('[data-estado]');
		if (el) el.textContent = texto;
	}

	private pintarControles() {
		for (const eje of EJES) {
			const valor = this.posicion[eje];
			const entrada = this.querySelector<HTMLInputElement>(`input[name="${eje}"]`);
			if (entrada) {
				entrada.value = String(valor);
				entrada.setAttribute(
					'aria-valuetext',
					eje === 'paz' ? this.t.panel.valorPaz(valor) : this.t.panel.valorFrontera(valor),
				);
			}
			const salida = this.querySelector(`[data-salida="${eje}"]`);
			if (salida) salida.textContent = porcentaje(this.lang, valor);
		}
		const punto = this.querySelector<HTMLElement>('[data-punto]');
		punto?.style.setProperty('--x', String(this.posicion.frontera));
		punto?.style.setProperty('--y', String(1 - this.posicion.paz));
	}

	private pintarGraficos() {
		const r = this.resultado;
		if (!r) return;
		for (const ind of INDICADORES) {
			this.querySelector(`[data-banda="${ind}"]`)?.setAttribute('d', rutaBanda(r.p10[ind], r.p90[ind], ESCALAS[ind]));
			this.querySelector(`[data-linea="${ind}"]`)?.setAttribute('d', rutaLinea(r.p50[ind], ESCALAS[ind]));
		}
		for (const g of GRAFICOS) {
			this.querySelector(`[data-grafico="${g.id}"] [data-tabla]`)?.replaceChildren(
				...INDICES_DECADAS.map((t) => fila(r.anios[t], g.series.map((s) => celdaConBanda(s, r, t, this.lang)))),
			);
		}
	}

	private pintarCifras() {
		const r = this.resultado;
		if (!r) return;
		for (const el of this.querySelectorAll<HTMLElement>('[data-cifra]')) {
			const ind = el.dataset.cifra as Indicador;
			el.textContent = formatear(ind, r.p50[ind][Number(el.dataset.anio) - ANIO_INICIAL], this.lang);
		}
	}

	private pintarEventos() {
		const r = this.resultado;
		if (!r) return;
		for (const lista of this.querySelectorAll<HTMLElement>('[data-eventos]')) {
			const desde = Number(lista.dataset.desde);
			const hasta = Number(lista.dataset.hasta);
			const eventos = r.eventos.filter((e) => e.anio >= desde && e.anio <= hasta);
			lista.replaceChildren(...eventos.map((e) => itemEvento(e.anio, textoEvento(e.id, this.lang))));
			const vacio = lista.parentElement?.querySelector<HTMLElement>('[data-sin-eventos]');
			if (vacio) vacio.hidden = eventos.length > 0;
		}
	}

	/** Todo lo que depende del año visible: textos del año, cifras del panel, cursores, enlaces y aviso. */
	private pintarAnio() {
		const r = this.resultado;
		if (!r) return;
		const t = this.anio - ANIO_INICIAL;
		for (const el of this.querySelectorAll('[data-anio-texto]')) el.textContent = String(this.anio);
		for (const el of this.querySelectorAll<HTMLElement>('[data-valor]')) {
			const ind = el.dataset.valor as Indicador;
			el.textContent = formatear(ind, r.p50[ind][t], this.lang);
		}
		const x = String(xAnio(t, r.anios.length));
		for (const cursor of this.querySelectorAll('[data-cursor]')) {
			cursor.setAttribute('x1', x);
			cursor.setAttribute('x2', x);
		}
		for (const puerta of this.querySelectorAll<HTMLAnchorElement>('[data-puerta]')) {
			puerta.href = `${urlFuturo(this.lang, puerta.dataset.puerta as CuadranteId)}#${this.anio}`;
		}
		this.pintarAviso();
	}

	private pintarAviso() {
		const aviso = this.querySelector<HTMLElement>('[data-aviso]');
		if (!aviso) return;
		const cercano = cuadranteCercano(this.posicion);
		if (cercano === this.cuadrante) {
			aviso.hidden = true;
			aviso.replaceChildren();
			return;
		}
		const nombre = this.t.cuadrantes[cercano].nombre;
		const enlace = document.createElement('a');
		enlace.href = `${urlFuturo(this.lang, cercano)}?${escribirPosicion(this.posicion)}#${this.anio}`;
		enlace.textContent = this.t.panel.leerRelato(nombre);
		aviso.replaceChildren(`${this.t.panel.aviso(nombre)} `, enlace);
		aviso.hidden = false;
	}

	private actualizarUrl() {
		const consulta = mismaPosicion(this.posicion, this.preset) ? '' : `?${escribirPosicion(this.posicion)}`;
		history.replaceState(history.state, '', `${location.pathname}${consulta}${location.hash}`);
	}
}

customElements.define('ptf-futuro', PtfFuturo);
```

- [ ] **Step 4: Conecta la isla** — al final de `PanelFuturo.astro`, antes de `<style>`:

```astro
<script>
	import './panel-futuro';
</script>
```

- [ ] **Step 5: Ejecuta las pruebas de navegador y el presupuesto de JS**

Run: `npm run build && npm run test:csp && npm run test:e2e`
Expected: PASS en los cuatro proyectos.

Run: `ls -l dist/_astro/*.js && gzip -c dist/_astro/$(ls -S dist/_astro | grep '\.js$' | head -1) | wc -c`
Expected: el JS más grande comprimido < 51200 bytes.

- [ ] **Step 6: Commit**

```bash
git add src/components/futuros/panel-futuro.ts src/components/futuros/PanelFuturo.astro tests/e2e/futuros.spec.ts
git commit -m "feat: isla interactiva de los futuros (controles, URL, año visible)"
```

---

### Task 11: Los otros siete relatos

**Files:**
- Create: `src/content/futuros/es/pausa.mdx`, `es/frontera-en-paz.mdx`, `es/fractura.mdx`
- Create: `src/content/futuros/en/pausa.mdx`, `en/frontera-en-paz.mdx`, `en/carrera.mdx`, `en/fractura.mdx`
- Modify: `src/lib/futuros/relatos.test.ts` (exigir los ocho)
- Modify: `tests/e2e/futuros.spec.ts`, `tests/e2e/sitio.spec.ts`

**Interfaces:**
- Consumes: componentes `Parada`, `Ambito`, `Cifra` (tarea 9).
- Produces: las ocho páginas `/futuros/<slug>/` y `/en/futures/<slug>/`.

**Reglas de redacción** (iguales para los siete; el modelo de forma es `es/carrera.mdx`):
- Misma estructura que Carrera: `<Parada>` de 2026 a 2126; relato en 2036, 2056, 2086 y 2126; cinco `<Ambito>` en orden humanidad, tecnologia, ciencia, planeta, politica; al menos un `<Cifra>` por ámbito, con el año de su parada.
- 2 a 3 frases por ámbito, presente, lenguaje llano, sin sermón. Ninguna cifra a mano.
- Neutralidad: cada futuro muestra lo que gana y lo que pierde. No uses palabras como “correcto”, “error”, “deberíamos”.
- Antes de escribir, construye y mira la página del futuro (`npm run build` + `npx astro preview --background`). Las afirmaciones cualitativas (“sube”, “baja”, “el más alto”) deben coincidir con lo que muestran los gráficos.
- El inglés es una traducción fiel del español; los nombres y lemas vienen de `ui.ts`.

**Frontmatter** (cópialo tal cual):

`es/pausa.mdx`:

```yaml
---
premisa: Los países firman un tratado que limita el desarrollo de la IA más avanzada. Se puede investigar y usar la IA actual, pero entrenar sistemas mucho más capaces requiere permisos y verificación internacional.
supuestos:
  - Un tratado internacional limita el cómputo de entrenamiento de los modelos de frontera.
  - Un organismo verifica el cumplimiento, como ocurre con la energía nuclear.
  - Los beneficios de la IA existente se reparten con políticas activas.
  - La cooperación evita las grandes crisis entre bloques.
ganancias:
  - Tiempo para adaptar la educación, el empleo y las leyes.
  - El riesgo de catástrofe es el más bajo de los cuatro futuros.
  - El poder no se concentra y la desigualdad baja.
perdidas:
  - Curas, materiales y descubrimientos llegan décadas más tarde.
  - Mantener el tratado exige vigilar el cómputo, con costes para la libertad.
  - Hay presión constante de quien quiere salirse para ganar ventaja.
---
```

`es/frontera-en-paz.mdx`:

```yaml
---
premisa: Los países acuerdan reglas comunes y avanzan juntos. La IA se desarrolla rápido, pero con auditorías, límites de seguridad y mecanismos para repartir lo que produce.
supuestos:
  - Un organismo internacional audita los modelos más capaces antes de desplegarlos.
  - Las ganancias de la automatización se reparten con impuestos, dividendos o servicios públicos.
  - La ciencia se comparte entre países en lugar de competir en secreto.
  - La cooperación evita las crisis entre bloques.
ganancias:
  - La ciencia y la medicina avanzan más rápido que en ningún otro futuro.
  - La transición energética es la más rápida de los cuatro.
  - La desigualdad baja aunque el empleo caiga.
perdidas:
  - Coordinar a todos es lento y caro, y las instituciones globales ganan mucho poder.
  - Menos gente trabaja, y la pregunta por el sentido y el propósito se vuelve central.
  - El riesgo no desaparece: depende de que las reglas se sigan cumpliendo.
---
```

`es/fractura.mdx`:

```yaml
---
premisa: Sin reglas comunes, el mundo se divide en bloques rivales. Las crisis recurrentes rompen las cadenas de suministro y frenan la economía y la IA, que avanza a trompicones.
supuestos:
  - No hay acuerdos internacionales y la desconfianza entre bloques crece.
  - Estallan crisis globales (guerras comerciales, conflictos, colapsos de suministro) cada quince años, aproximadamente.
  - Los chips y la energía escasean y se usan como armas de presión.
  - La redistribución es débil.
ganancias:
  - El trabajo humano se desplaza más despacio que en Carrera.
  - Las comunidades locales y las economías regionales ganan peso y resiliencia.
  - La IA más avanzada tarda más en llegar, lo que da algo de margen.
perdidas:
  - Las crisis destruyen riqueza y frenan la transición energética.
  - La desigualdad y la concentración del poder suben década a década.
  - El riesgo de catástrofe es alto por los conflictos, no solo por la IA.
---
```

`en/pausa.mdx`:

```yaml
---
premisa: Countries sign a treaty that limits the development of the most advanced AI. Today's AI can still be researched and used, but training far more capable systems requires permits and international verification.
supuestos:
  - An international treaty caps the training compute of frontier models.
  - A body verifies compliance, as happens with nuclear energy.
  - The benefits of existing AI are shared through active policy.
  - Cooperation prevents major crises between blocs.
ganancias:
  - Time to adapt education, jobs and laws.
  - The risk of catastrophe is the lowest of the four futures.
  - Power does not concentrate and inequality falls.
perdidas:
  - Cures, materials and discoveries arrive decades later.
  - Upholding the treaty requires monitoring compute, at a cost to freedom.
  - There is constant pressure from those who want to break away to gain an edge.
---
```

`en/frontera-en-paz.mdx`:

```yaml
---
premisa: Countries agree on shared rules and move forward together. AI develops fast, but with audits, safety limits and mechanisms to share what it produces.
supuestos:
  - An international body audits the most capable models before deployment.
  - The gains from automation are shared through taxes, dividends or public services.
  - Countries share science instead of competing in secret.
  - Cooperation prevents crises between blocs.
ganancias:
  - Science and medicine advance faster than in any other future.
  - The energy transition is the fastest of the four.
  - Inequality falls even as employment declines.
perdidas:
  - Coordinating everyone is slow and costly, and global institutions gain a lot of power.
  - Fewer people work, and the question of meaning and purpose becomes central.
  - The risk does not disappear: it depends on the rules continuing to be followed.
---
```

`en/carrera.mdx`:

```yaml
---
premisa: No agreement slows AI down. Companies and countries race to get there first, with no shared rules and no pauses. Progress is fast and power concentrates with whoever wins.
supuestos:
  - There are no international treaties on advanced AI and no limits on compute.
  - Investment in AI grows as long as it brings economic or military advantage.
  - Redistribution and new labor protections arrive late or not at all.
  - Tensions between blocs trigger global crises from time to time.
ganancias:
  - Very fast scientific and medical progress in the first decades.
  - Material abundance, because robots and automation make almost everything manufactured cheap.
  - A huge economic advantage for whoever leads the race.
perdidas:
  - Jobs and income concentrate and inequality rises sharply.
  - Power ends up in very few hands, public or private.
  - The risk of catastrophe is the highest of the four futures.
  - Recurring crises slow down the energy transition.
---
```

`en/fractura.mdx`:

```yaml
---
premisa: Without shared rules, the world splits into rival blocs. Recurring crises break supply chains and slow the economy and AI, which advances in fits and starts.
supuestos:
  - There are no international agreements and distrust between blocs grows.
  - Global crises (trade wars, conflicts, supply collapses) break out roughly every fifteen years.
  - Chips and energy are scarce and used as leverage.
  - Redistribution is weak.
ganancias:
  - Human work is displaced more slowly than in Race.
  - Local communities and regional economies gain weight and resilience.
  - The most advanced AI takes longer to arrive, which buys some margin.
perdidas:
  - Crises destroy wealth and slow the energy transition.
  - Inequality and the concentration of power rise decade after decade.
  - The risk of catastrophe is high because of conflict, not just AI.
---
```

**Pautas del relato por parada** (con los parámetros centrales; usa `<Cifra>` para cada número):

| Futuro · año | Humanidad | Tecnología | Ciencia | Planeta | Política |
|---|---|---|---|---|---|
| Pausa 2036 | Automatización baja (`automatizacion`); el empleo casi no cambia (`empleo`); hay tiempo para reformar la educación | Tratado vigente; IA útil pero acotada; pocos robots, sobre todo en fábricas (`robots`) | Avances médicos que llegan más despacio (`ciencia`) | Transición gradual (`energiaLimpia`, `temperatura`) | Organismo de verificación del cómputo; presión de quien quiere salirse (`poder`, `riesgo`) |
| Pausa 2056 | Automatización creciente y la desigualdad baja (`automatizacion`, `desigualdad`) | Los robots despegan tarde (`robots`) | Curas que en otros futuros llegaron antes, aquí llegan una o dos décadas después (`ciencia`) | La energía limpia ya es mayoría (`energiaLimpia`) | Riesgo bajo (`riesgo`); debate sobre cuándo levantar límites |
| Pausa 2086 | Más de la mitad de las tareas automatizables (`automatizacion`, `empleo`) | Miles de millones de robots (`robots`) | Ciencia acelerada (`ciencia`) | Casi toda la energía es limpia; el calentamiento se estabiliza (`energiaLimpia`, `temperatura`) | El poder sigue repartido (`poder`, `riesgo`) |
| Pausa 2126 | Balance del siglo: menos empleo que hoy pero menos desigualdad (`empleo`, `desigualdad`) | Llegan las mismas tecnologías, pero tarde (`robots`) | La ciencia ya va diez veces más rápido (`ciencia`) | Calentamiento contenido (`temperatura`) | Riesgo acumulado de los más bajos (`riesgo`); el coste fueron las generaciones que esperaron |
| Frontera en paz 2036 | Mucha automatización temprana, pero con reparto (`automatizacion`, `empleo`, `desigualdad`) | Despegue rápido con auditorías (`robots`, `energiaIA`) | La ciencia más rápida de los cuatro futuros (`ciencia`) | Transición acelerada por la ciencia (`energiaLimpia`) | Organismo internacional; poder repartido (`poder`, `riesgo`) |
| Frontera en paz 2056 | Dos de cada tres tareas automatizables; la pregunta por el propósito crece (`automatizacion`, `empleo`) | Miles de millones de robots (`robots`) | Casi diez veces el ritmo de 2026 (`ciencia`) | La mayoría de la energía es limpia (`energiaLimpia`, `temperatura`) | Instituciones globales con mucho poder: ¿quién las controla? (`poder`, `riesgo`) |
| Frontera en paz 2086 | Trabajo opcional para buena parte de la gente (`empleo`, `desigualdad`) | La IA se acerca a su techo (`robots`) | Ciencia más de diez veces más rápida (`ciencia`) | Casi toda la energía es limpia (`energiaLimpia`, `temperatura`) | Coordinación costosa pero estable (`poder`, `riesgo`) |
| Frontera en paz 2126 | Abundancia con reparto; el sentido es la gran pregunta (`empleo`, `desigualdad`) | Máquinas en casi todo (`robots`) | La ciencia más rápida del siglo: la mayoría de las enfermedades de hoy tienen tratamiento (`ciencia`) | Calentamiento contenido (`temperatura`) | El riesgo existe y depende de mantener las reglas (`riesgo`, `poder`) |
| Fractura 2036 | Crisis en curso; el trabajo cambia despacio (`automatizacion`, `empleo`) | Chips escasos, cadenas rotas (`robots`, `energiaIA`) | La ciencia se fragmenta por bloques (`ciencia`) | La transición se estanca (`energiaLimpia`, `temperatura`) | Bloques rivales; poder y riesgo suben (`poder`, `riesgo`) |
| Fractura 2056 | La desigualdad sube (`desigualdad`, `empleo`) | Recuperación tras la crisis de 2050 (`robots`) | Avances regionales que los bloques no comparten (`ciencia`) | Las crisis frenan la transición: menos de la mitad de la energía es limpia (`energiaLimpia`, `temperatura`) | Riesgo acumulado alto por los conflictos (`riesgo`, `poder`) |
| Fractura 2086 | La mitad de las tareas automatizables, tarde y desigual (`automatizacion`, `desigualdad`) | Miles de millones de robots en los bloques que ganan (`robots`) | La ciencia avanza dividida en bloques (`ciencia`) | La energía limpia llega tarde y el calentamiento supera al de los futuros con paz (`energiaLimpia`, `temperatura`) | Poder muy concentrado (`poder`, `riesgo`) |
| Fractura 2126 | Menos empleo y más desigualdad que hoy (`empleo`, `desigualdad`) | La IA por fin madura, en pocas manos (`robots`) | La ciencia va más despacio que en los futuros con paz (`ciencia`) | Calentamiento mayor que en los futuros con paz (`temperatura`) | Nueva crisis en curso; riesgo acumulado de los más altos (`riesgo`, `poder`) |
| Carrera (EN) | Traducción fiel de `es/carrera.mdx` | | | | |

- [ ] **Step 1: Haz que la prueba exija los ocho relatos** — en `src/lib/futuros/relatos.test.ts`, reemplaza el test `existe al menos un relato` por:

```ts
test('existen los ocho relatos (4 futuros × 2 idiomas)', () => {
	expect(archivos).toHaveLength(8);
});
```

- [ ] **Step 2: Ejecútala para verla fallar**

Run: `npx vitest run src/lib/futuros/relatos.test.ts`
Expected: FAIL `expected [ … ] to have a length of 8 but got 1`.

- [ ] **Step 3: Escribe los siete MDX** con el frontmatter de arriba, las mismas importaciones que `es/carrera.mdx` y las pautas de la tabla.

- [ ] **Step 4: Ejecuta la prueba de estructura**

Run: `npx vitest run src/lib/futuros/relatos.test.ts`
Expected: PASS (1 + 8 × 4 pruebas).

- [ ] **Step 5: Añade las pruebas de navegador del inglés** (Review Focus 5) a `tests/e2e/futuros.spec.ts`:

```ts
test('en inglés las cifras y la descripción del control están en inglés', async ({ page, isMobile }) => {
	test.skip(isMobile, 'en móvil los controles están en la barra plegada');
	await page.goto('/en/futures/race/');
	await expect(page.locator('h1')).toHaveText('Race');
	await expect(page.locator('[data-cifra="temperatura"][data-anio="2056"]')).toHaveText(/^\d\.\d °C$/);
	const paz = page.getByRole('slider', { name: 'Peace' });
	await paz.focus();
	await page.keyboard.press('ArrowRight');
	await expect(paz).toHaveAttribute('aria-valuetext', /^Peace 20%: little cooperation$/);
});

test('el selector de idioma lleva al mismo futuro en el otro idioma', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/futuros/frontera-en-paz/');
	await page.getByRole('navigation', { name: 'Idioma' }).getByRole('link', { name: /EN/ }).click();
	await expect(page).toHaveURL(/\/en\/futures\/peaceful-frontier\/$/);
});
```

Y en `tests/e2e/sitio.spec.ts`, añade `'/en/futures/race/',` a `PAGINAS`.

- [ ] **Step 6: Build, CSP y pruebas de navegador**

Run: `npm run build && npm run test:csp && npm run test:e2e`
Expected: PASS. El build genera 8 páginas de futuros.

- [ ] **Step 7: Commit**

```bash
git add src/content/futuros src/lib/futuros/relatos.test.ts tests/e2e
git commit -m "feat: relatos de los cuatro futuros en español e inglés"
```

---

### Task 12: Página del modelo `/futuros/`

**Files:**
- Modify: `package.json` (dependencia `temml`)
- Create: `src/lib/futuros/ecuaciones.ts`
- Test: `src/lib/futuros/ecuaciones.test.ts`
- Create: `src/components/futuros/Ecuaciones.astro`
- Create: `src/components/futuros/TablaParametros.astro`
- Create: `src/components/futuros/Calibracion.astro`
- Create: `src/content/paginas/es/futuros.mdx`, `src/content/paginas/en/futuros.mdx`
- Create: `src/pages/futuros/index.astro`, `src/pages/en/futures/index.astro`
- Create (si `npm run check` lo pide): `src/types/temml.d.ts`
- Modify: `tests/e2e/sitio.spec.ts` (añadir `/futuros/` y `/en/futures/`)

**Interfaces:**
- Consumes: `PARAMETROS`, `validarParametros` (tarea 1), `OBJETIVOS`, `evaluar` (tarea 5), colección `fuentes` (tarea 7), `MatrizFuturos` (tarea 9), `PaginaTexto` (existente, acepta `seccion: Seccion`, y `futuros` ya es una sección desde la tarea 4).
- Produces: `Ecuacion { id, titulo, latex, descripcion }`, `ECUACIONES`.

- [ ] **Step 1: Instala temml**

Run: `npm i temml`
Expected: `temml` en `dependencies` (MIT; solo se usa al compilar, no llega al navegador).

- [ ] **Step 2: Escribe la prueba (falla)**

`src/lib/futuros/ecuaciones.test.ts`:

```ts
import temml from 'temml';
import { expect, test } from 'vitest';
import { ECUACIONES } from './ecuaciones';
import { PARAMETROS } from './parametros';

test('hay una ecuación por cada pieza del modelo (spec §5.2)', () => {
	expect(ECUACIONES.map((e) => e.id)).toEqual([
		'capacidad',
		'automatizacion',
		'empleo',
		'desigualdad',
		'robots',
		'ciencia',
		'energiaIA',
		'energiaLimpia',
		'temperatura',
		'poblacion',
		'poder',
		'riesgo',
		'crisis',
	]);
});

test.each(ECUACIONES.map((e) => [e.id, e.latex]))('%s se convierte en MathML sin errores', (_, latex) => {
	const mathml = temml.renderToString(latex, { displayMode: true });
	expect(mathml).toMatch(/^<math/);
	expect(mathml).not.toMatch(/merror|tml-error/);
});

test.each(Object.entries(PARAMETROS).map(([n, p]) => [n, p.simbolo]))('el símbolo de %s se convierte sin errores', (_, simbolo) => {
	expect(temml.renderToString(simbolo)).not.toMatch(/merror|tml-error/);
});
```

- [ ] **Step 3: Ejecútala para verla fallar**

Run: `npx vitest run src/lib/futuros/ecuaciones.test.ts`
Expected: FAIL con `Failed to resolve import "./ecuaciones"`.

- [ ] **Step 4: Escribe `src/lib/futuros/ecuaciones.ts`** (coeficientes como fracciones para que valgan en ambos idiomas)

```ts
// Ecuaciones del modelo (spec futuros.md §5.2) en LaTeX. Se convierten a MathML al compilar con temml.
import type { Idioma } from '../../i18n/rutas';

export interface Ecuacion {
	id: string;
	titulo: Record<Idioma, string>;
	latex: string;
	descripcion: Record<Idioma, string>;
}

export const ECUACIONES: readonly Ecuacion[] = [
	{
		id: 'capacidad',
		titulo: { es: 'Capacidad de la IA', en: 'AI capability' },
		latex: String.raw`L(t+1) = L(t) + g(t)\left(1 - \frac{L(t)}{L_{max}}\right),\quad g(t) = \left[g_{min} + (g_{max} - g_{min})\,f\right]\left(1 - \varphi\,\mathrm{crisis}(t)\right)`,
		descripcion: {
			es: 'L es el logaritmo del cómputo respecto a 2026. Crece según la frontera f, se frena cerca de su techo y durante las crisis.',
			en: 'L is the logarithm of compute relative to 2026. It grows with the frontier f, slows near its ceiling and during crises.',
		},
	},
	{
		id: 'automatizacion',
		titulo: { es: 'Tareas automatizables', en: 'Automatable tasks' },
		latex: String.raw`A(t) = A_0 + (A_{max} - A_0)\,\frac{L(t)^n}{L(t)^n + L_{50}^{\,n}}`,
		descripcion: {
			es: 'Una curva en S: pocas tareas al principio, la mitad cuando la capacidad llega a L₅₀.',
			en: 'An S-curve: few tasks at first, half of them once capability reaches L₅₀.',
		},
	},
	{
		id: 'empleo',
		titulo: { es: 'Empleo', en: 'Employment' },
		latex: String.raw`E(t) = E_0\left(1 - \left(A(t) - A_0\right)(1 - \kappa)\right),\quad \kappa = \kappa_{min} + (\kappa_{max} - \kappa_{min})\,p`,
		descripcion: {
			es: 'La paz p aumenta la parte del desplazamiento que compensan nuevas tareas y políticas (κ).',
			en: 'Peace p increases the share of displacement offset by new tasks and policies (κ).',
		},
	},
	{
		id: 'desigualdad',
		titulo: { es: 'Desigualdad', en: 'Inequality' },
		latex: String.raw`G(t) = G_0 + a\left(A(t) - A_0\right)(1 - p) - b\left(A(t) - A_0\right)p`,
		descripcion: {
			es: 'La automatización sin reglas la sube; la redistribución la baja.',
			en: 'Automation without rules raises it; redistribution lowers it.',
		},
	},
	{
		id: 'robots',
		titulo: { es: 'Robots', en: 'Robots' },
		latex: String.raw`R(t+1) = R(t) + r\,R(t)\left(1 - \frac{R(t)}{\max\left(R(t),\,R_{sat}\,A(t)\right)}\right),\quad r = r_{min} + (r_{max} - r_{min})\,f`,
		descripcion: {
			es: 'Una curva en S cuyo techo sube con la automatización.',
			en: 'An S-curve whose ceiling rises with automation.',
		},
	},
	{
		id: 'ciencia',
		titulo: { es: 'Ritmo de la ciencia', en: 'Pace of science' },
		latex: String.raw`S(t) = 1 + \sigma\,L(t)\left(\tfrac{3}{5} + \tfrac{2}{5}\,p\right)`,
		descripcion: {
			es: 'Cada orden de magnitud de IA acelera la ciencia; la cooperación (ciencia abierta) lo amplifica.',
			en: 'Each order of magnitude of AI speeds up science; cooperation (open science) amplifies it.',
		},
	},
	{
		id: 'energiaIA',
		titulo: { es: 'Electricidad de la IA', en: 'AI electricity' },
		latex: String.raw`E_{IA}(t) = E_{IA,0}\;10^{\varepsilon L(t)}\,(1 - \eta)^{t}`,
		descripcion: {
			es: 'Crece con la capacidad y se modera con la eficiencia.',
			en: 'It grows with capability and is tempered by efficiency.',
		},
	},
	{
		id: 'energiaLimpia',
		titulo: { es: 'Energía limpia', en: 'Clean energy' },
		latex: String.raw`Q(t+1) = Q(t) + q_0\left(\tfrac{1}{2} + p\right)\left(1 + \lambda \log_{10} S(t)\right)Q(t)\left(1 - Q(t)\right)`,
		descripcion: {
			es: 'Una curva en S que aceleran la cooperación y la ciencia.',
			en: 'An S-curve accelerated by cooperation and science.',
		},
	},
	{
		id: 'temperatura',
		titulo: { es: 'Calentamiento', en: 'Warming' },
		latex: String.raw`T(t) = T_0 + \mathrm{TCRE}\cdot\frac{\sum_{\tau<t} Em(\tau)}{1000},\quad Em(t) = Em_0\,\frac{TE(t)}{TE_0}\,\frac{1 - Q(t)}{1 - Q_0} + U_0(1 - \upsilon)^{t}`,
		descripcion: {
			es: 'La relación TCRE del IPCC: el calentamiento es proporcional al CO₂ acumulado. La demanda de energía TE crece más rápido con más frontera.',
			en: 'The IPCC TCRE relationship: warming is proportional to cumulative CO₂. Energy demand TE grows faster with more frontier.',
		},
	},
	{
		id: 'poblacion',
		titulo: { es: 'Población', en: 'Population' },
		latex: String.raw`P(t) = P_{ONU}(t)\left(1 + \frac{z_{ONU}\,t}{740}\right)\left(1 + \mu \log_{10} S(t)\right)`,
		descripcion: {
			es: 'La variante media de la ONU, desplazada dentro de su intervalo y ajustada por los avances en salud.',
			en: 'The UN medium variant, shifted within its interval and adjusted for health advances.',
		},
	},
	{
		id: 'poder',
		titulo: { es: 'Concentración del poder', en: 'Power concentration' },
		latex: String.raw`\Pi(t) = \Pi_0 + c\,L(t)\,(1 - p)^2 - d\,p`,
		descripcion: {
			es: 'Un índice ilustrativo: más IA sin paz concentra el poder.',
			en: 'An illustrative index: more AI without peace concentrates power.',
		},
	},
	{
		id: 'riesgo',
		titulo: { es: 'Riesgo acumulado de catástrofe', en: 'Cumulative risk of catastrophe' },
		latex: String.raw`h(t) = h_{nat} + h_{IA}\,\frac{\Delta L(t)}{g_{max}}\,(1 - p)^2 + h_{conf}\,\frac{\Pi(t)}{100}\,(1 - p),\quad \mathrm{riesgo}(t) = 1 - e^{-\sum_{\tau \le t} h(\tau)}`,
		descripcion: {
			es: 'Probabilidad de una catástrofe que mate a ≥ 10 % de la humanidad: un riesgo de base más el del avance rápido sin paz y el de la concentración del poder.',
			en: 'Probability of a catastrophe killing ≥ 10% of humanity: a baseline risk plus that of fast progress without peace and that of power concentration.',
		},
	},
	{
		id: 'crisis',
		titulo: { es: 'Crisis', en: 'Crises' },
		latex: String.raw`\chi(t) = (1 - p)\left(\tfrac{1}{2} + \frac{\Pi(t)}{100}\right),\quad \mathrm{crisis}(t) = 1 \iff \chi(t) > \theta`,
		descripcion: {
			es: 'Cuando la tensión χ supera θ estalla una crisis de D años; no puede repetirse antes de 15 años (la última fue la pandemia de 2020).',
			en: 'When tension χ exceeds θ a crisis of D years breaks out; it cannot repeat within 15 years (the last one was the 2020 pandemic).',
		},
	},
];
```

- [ ] **Step 5: Ejecuta la prueba**

Run: `npx vitest run src/lib/futuros/ecuaciones.test.ts`
Expected: PASS. Si `npm run check` falla después con `Could not find a declaration file for module 'temml'`, crea `src/types/temml.d.ts`:

```ts
declare module 'temml' {
	const temml: {
		renderToString(tex: string, opciones?: { displayMode?: boolean }): string;
	};
	export default temml;
}
```

- [ ] **Step 6: Crea los tres componentes en `src/components/futuros/`**

`Ecuaciones.astro`:

```astro
---
// Ecuaciones en MathML, generadas al compilar (sin JS en el cliente).
import temml from 'temml';
import type { Idioma } from '../../i18n/rutas';
import { ECUACIONES } from '../../lib/futuros/ecuaciones';

interface Props {
	lang: Idioma;
}

const { lang } = Astro.props;
---

<dl class="ecuaciones">
	{
		ECUACIONES.map((e) => (
			<div class="ecuacion" id={`ecuacion-${e.id}`}>
				<dt>{e.titulo[lang]}</dt>
				<dd>
					<div class="ecuacion-formula">
						<Fragment set:html={temml.renderToString(e.latex, { displayMode: true })} />
					</div>
					<p>{e.descripcion[lang]}</p>
				</dd>
			</div>
		))
	}
</dl>

<style>
	.ecuaciones {
		display: grid;
		gap: 2rem;
		margin: 1.5rem 0 0;
	}

	dt {
		font-family: var(--fuente-sans);
		font-size: var(--t-ui);
		font-weight: 600;
	}

	dd {
		margin: 0.5rem 0 0;
	}

	.ecuacion-formula {
		overflow-x: auto;
		padding: 0.75rem 1rem;
		background: var(--superficie);
		font-size: 1.125rem;
	}

	dd p {
		margin-top: 0.6rem;
		color: var(--tinta-suave);
	}
</style>
```

`TablaParametros.astro`:

```astro
---
// Tabla de parámetros. Valida al compilar que cada fuente tenga ficha en fuentes.yaml.
import { getCollection } from 'astro:content';
import temml from 'temml';
import type { Idioma } from '../../i18n/rutas';
import { textos } from '../../i18n/ui';
import { OBJETIVOS } from '../../lib/futuros/calibracion';
import { PARAMETROS, validarParametros } from '../../lib/futuros/parametros';

interface Props {
	lang: Idioma;
}

const { lang } = Astro.props;
const t = textos(lang).futuros.modelo;
validarParametros();
const fuentes = new Map((await getCollection('fuentes')).map((f) => [f.id, f.data]));
const usadas = [...Object.values(PARAMETROS).map((p) => p.fuente), ...OBJETIVOS.map((o) => o.fuente)];
const faltan = [...new Set(usadas)].filter((id) => id !== 'supuesto' && !fuentes.has(id));
if (faltan.length) throw new Error(`Fuentes sin ficha en src/content/fuentes.yaml: ${faltan.join(', ')}`);
const numero = (v: number) =>
	new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-US', { maximumSignificantDigits: 3 }).format(v);
---

<div class="tabla-desplazable">
	<table class="tabla-parametros ui">
		<thead>
			<tr>
				<th scope="col">{t.simbolo}</th>
				<th scope="col">{t.descripcion}</th>
				<th scope="col">{t.central}</th>
				<th scope="col">{t.rango}</th>
				<th scope="col">{t.fuente}</th>
			</tr>
		</thead>
		<tbody>
			{
				Object.entries(PARAMETROS).map(([nombre, p]) => {
					const fuente = fuentes.get(p.fuente);
					return (
						<tr id={`parametro-${nombre}`}>
							<th scope="row">
								<Fragment set:html={temml.renderToString(p.simbolo)} />
							</th>
							<td>{p.descripcion[lang]}</td>
							<td>{numero(p.central)}</td>
							<td>{p.min === p.max ? '—' : `${numero(p.min)} – ${numero(p.max)}`}</td>
							<td>
								{fuente ? (
									<a href={fuente.url}>
										{fuente.organizacion}, {fuente.anio}
									</a>
								) : (
									<span class="supuesto">{t.supuesto}</span>
								)}
							</td>
						</tr>
					);
				})
			}
		</tbody>
	</table>
</div>

<style>
	.tabla-desplazable {
		overflow-x: auto;
		margin-top: 1.5rem;
	}

	table {
		width: 100%;
		min-width: 40rem;
		border-collapse: collapse;
		font-size: var(--t-mini);
	}

	th,
	td {
		padding: 0.5rem 0.6rem;
		border-bottom: 1px solid var(--linea);
		text-align: start;
		vertical-align: top;
	}

	thead th {
		color: var(--tinta-suave);
		font-weight: 600;
	}

	td:nth-child(3),
	td:nth-child(4) {
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}

	.supuesto {
		color: var(--tinta-suave);
		font-style: italic;
	}
</style>
```

`Calibracion.astro`:

```astro
---
// Objetivos de calibración y si el modelo los cumple (los mismos que verifican las pruebas).
import type { Idioma } from '../../i18n/rutas';
import { textos } from '../../i18n/ui';
import { evaluar, OBJETIVOS, type Objetivo } from '../../lib/futuros/calibracion';

interface Props {
	lang: Idioma;
}

const { lang } = Astro.props;
const t = textos(lang).futuros.modelo;
const locale = lang === 'es' ? 'es-ES' : 'en-US';
const formato = (o: Objetivo, v: number) => {
	if (o.unidad === 'fraccion') return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(v);
	if (o.unidad === 'anio') return String(Math.round(v));
	const texto = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(v);
	return o.unidad === 'celsius' ? `${texto} °C` : o.unidad === 'twh' ? `${texto} TWh` : texto;
};
---

<ul class="calibracion ui">
	{
		OBJETIVOS.map((o) => {
			const { valor, cumple } = evaluar(o);
			return (
				<li class:list={['objetivo', { 'no-cumple': !cumple }]}>
					<span class="objetivo-estado">{cumple ? t.cumple : t.noCumple}</span>
					<span class="objetivo-texto">{o.descripcion[lang]}</span>
					<span class="objetivo-valor">
						{t.valor}: {formato(o, valor)}
					</span>
				</li>
			);
		})
	}
</ul>

<style>
	.calibracion {
		display: grid;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.objetivo {
		display: grid;
		grid-template-columns: 6rem 1fr;
		gap: 0.2rem 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--linea);
	}

	.objetivo-estado {
		grid-row: span 2;
		font-weight: 600;
	}

	.no-cumple .objetivo-estado {
		text-decoration: underline 2px;
	}

	.objetivo-valor {
		color: var(--tinta-suave);
		font-variant-numeric: tabular-nums;
	}
</style>
```

- [ ] **Step 7: Escribe `src/content/paginas/es/futuros.mdx`**

```mdx
---
titulo: Futuros
descripcion: Cuatro futuros a 100 años según cuánto regulemos y cooperemos y a qué velocidad avance la IA. Un modelo abierto, con sus ecuaciones, fuentes y límites.
---

import Calibracion from '../../../components/futuros/Calibracion.astro';
import Ecuaciones from '../../../components/futuros/Ecuaciones.astro';
import MatrizFuturos from '../../../components/futuros/MatrizFuturos.astro';
import TablaParametros from '../../../components/futuros/TablaParametros.astro';

¿Cómo será el mundo en 2126? Depende, sobre todo, de dos decisiones: cuánto regulamos y cooperamos (la paz) y a qué velocidad dejamos avanzar la IA (la frontera). Cruzarlas da cuatro futuros. Ninguno es una predicción y el atlas no defiende ninguno.

<MatrizFuturos lang="es" variante="portada" />

## Cómo funciona el modelo

Un modelo pequeño simula el siglo año a año. Recibe dos números entre 0 y 1, paz y frontera, y calcula doce indicadores: capacidad de la IA, robots, trabajo, desigualdad, población, ritmo de la ciencia, energía, calentamiento, concentración del poder y riesgo. Corre 200 veces con parámetros al azar dentro de sus rangos; por eso cada gráfico muestra una banda, no una línea única.

Cada página de un futuro arranca en su esquina de la matriz, pero puedes mover los controles y ver cómo cambian las cifras.

## Ecuaciones

<Ecuaciones lang="es" />

## Parámetros

Cada parámetro tiene un valor central, un rango y una fuente. Cuando no hay fuente directa, lo marcamos como supuesto.

<TablaParametros lang="es" />

## Calibración

Antes de publicar, el modelo se contrasta con cifras oficiales. Estos son los objetivos y si se cumplen:

<Calibracion lang="es" />

Los umbrales de riesgo (Pausa por debajo del 9 %, Carrera por encima del 20 %) son una elección editorial, anclada en las estimaciones de superpronosticadores y expertos del torneo XPT.

## Límites del modelo

- No predice: enlaza supuestos con consecuencias.
- La temperatura solo cuenta el CO₂ y no modela la captura de carbono, así que nunca baja; como mucho, se estabiliza.
- La población no reacciona a las catástrofes: el riesgo se muestra como probabilidad, no se simula el evento.
- Los índices de poder y desigualdad son ilustrativos.
- La ONU proyecta hasta 2100; después prolongamos su última tasa.
- Las relaciones entre variables son simples a propósito, para que se puedan leer y discutir.
```

`src/content/paginas/en/futuros.mdx`:

```mdx
---
titulo: Futures
descripcion: Four futures 100 years out, depending on how much we regulate and cooperate and how fast AI advances. An open model, with its equations, sources and limits.
---

import Calibracion from '../../../components/futuros/Calibracion.astro';
import Ecuaciones from '../../../components/futuros/Ecuaciones.astro';
import MatrizFuturos from '../../../components/futuros/MatrizFuturos.astro';
import TablaParametros from '../../../components/futuros/TablaParametros.astro';

What will the world look like in 2126? Above all, it depends on two decisions: how much we regulate and cooperate (peace) and how fast we let AI advance (the frontier). Crossing them gives four futures. None is a prediction, and the atlas does not advocate any of them.

<MatrizFuturos lang="en" variante="portada" />

## How the model works

A small model simulates the century year by year. It takes two numbers between 0 and 1, peace and frontier, and computes twelve indicators: AI capability, robots, work, inequality, population, pace of science, energy, warming, power concentration and risk. It runs 200 times with parameters drawn at random within their ranges; that is why every chart shows a band, not a single line.

Each future's page starts at its corner of the matrix, but you can move the controls and watch the numbers change.

## Equations

<Ecuaciones lang="en" />

## Parameters

Every parameter has a central value, a range and a source. When there is no direct source, we mark it as an assumption.

<TablaParametros lang="en" />

## Calibration

Before publishing, the model is checked against official figures. These are the targets and whether they are met:

<Calibracion lang="en" />

The risk thresholds (Pause below 9%, Race above 20%) are an editorial choice, anchored in the estimates of superforecasters and experts in the XPT tournament.

## Limits of the model

- It does not predict: it links assumptions to consequences.
- Temperature only counts CO₂ and does not model carbon removal, so it never falls; at most, it levels off.
- Population does not react to catastrophes: risk is shown as a probability; the event itself is not simulated.
- The power and inequality indices are illustrative.
- The UN projects to 2100; after that we extend its last rate.
- The relationships between variables are simple on purpose, so they can be read and debated.
```

- [ ] **Step 8: Crea las rutas**

`src/pages/futuros/index.astro`:

```astro
---
import PaginaTexto from '../../components/vistas/PaginaTexto.astro';
---

<PaginaTexto lang="es" seccion="futuros" />
```

`src/pages/en/futures/index.astro`:

```astro
---
import PaginaTexto from '../../../components/vistas/PaginaTexto.astro';
---

<PaginaTexto lang="en" seccion="futuros" />
```

Y en `tests/e2e/sitio.spec.ts`, añade `'/futuros/',` y `'/en/futures/',` a `PAGINAS`.

- [ ] **Step 9: Verifica**

Run: `npm test && npm run check && npm run build && npm run test:csp && npm run test:e2e`
Expected: todo PASS. Abre `/futuros/` en preview: 13 ecuaciones legibles, tabla con 42 parámetros, los 14 objetivos de calibración con “Cumple”.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json src/lib/futuros/ecuaciones.ts src/lib/futuros/ecuaciones.test.ts src/components/futuros src/content/paginas src/pages/futuros/index.astro src/pages/en/futures/index.astro tests/e2e
git add src/types 2>/dev/null || true
git commit -m "feat: página del modelo con ecuaciones, parámetros, calibración y límites"
```

---

### Task 13: Portada y cabecera

**Files:**
- Modify: `src/components/vistas/Portada.astro`
- Modify: `src/components/Cabecera.astro`
- Modify: `src/styles/global.css` (utilidad `.solo-amplio`)
- Modify: `tests/e2e/futuros.spec.ts`, `tests/e2e/sitio.spec.ts`

**Interfaces:**
- Consumes: `MatrizFuturos` (tarea 9), `ruta(lang, 'futuros')` (tarea 4), `textos(lang).nav.futuros` (tarea 8).

- [ ] **Step 1: Escribe las pruebas (fallan)** — añade a `tests/e2e/futuros.spec.ts`:

```ts
test.describe('portada', () => {
	for (const [inicio, etiqueta, nombre, destino] of [
		['/', 'Los cuatro futuros', 'Carrera', /\/futuros\/carrera\/$/],
		['/en/', 'The four futures', 'Race', /\/en\/futures\/race\/$/],
	] as const) {
		test(`${inicio}: cuatro puertas y la de ${nombre} lleva a su futuro`, async ({ page }) => {
			await page.goto(inicio);
			const matriz = page.getByRole('list', { name: etiqueta });
			await expect(matriz.getByRole('link')).toHaveCount(4);
			await matriz.getByRole('link', { name: new RegExp(nombre) }).click();
			await expect(page).toHaveURL(destino);
			await expect(page.locator('h1')).toHaveText(nombre);
		});
	}

	test('la cabecera enlaza a Futuros en escritorio', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/');
		await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Futuros' }).click();
		await expect(page).toHaveURL(/\/futuros\/$/);
	});
});
```

Y en `tests/e2e/sitio.spec.ts`, cambia el bloque `sin desborde horizontal a 320 px` para probar dos anchos:

```ts
for (const ancho of [320, 768]) {
	test.describe(`sin desborde horizontal a ${ancho} px`, () => {
		test.use({ viewport: { width: ancho, height: 700 } });

		for (const ruta of PAGINAS) {
			test(ruta, async ({ page }) => {
				await page.goto(ruta);
				const desborde = await page.evaluate(
					() => document.documentElement.scrollWidth - document.documentElement.clientWidth,
				);
				expect(desborde).toBe(0);
			});
		}
	});
}
```

- [ ] **Step 2: Ejecútalas para verlas fallar**

Run: `npx playwright test tests/e2e/futuros.spec.ts --project=chromium -g portada`
Expected: FAIL (no existe la lista “Los cuatro futuros” en la portada).

- [ ] **Step 3: Cambia `src/components/vistas/Portada.astro`**

Añade la importación `import MatrizFuturos from '../futuros/MatrizFuturos.astro';`. Reemplaza la sección `portada` y la de `temas` por:

```astro
	<section class="contenedor portada" aria-labelledby="titulo-portada">
		<div class="portada-texto">
			<div class="portada-principal">
				<h1 id="titulo-portada">{t.portada.titulo}</h1>
				<p class="entradilla">{t.portada.entradilla}</p>
				<nav class="orientacion ui" aria-label={t.portada.orientacion}>
					<a href={ruta(lang, 'sobre')}>{t.portada.queEs}</a>
					<a href={ruta(lang, 'metodologia')}>{t.portada.comoTrabajamos}</a>
				</nav>
			</div>
			<MatrizFuturos lang={lang} variante="portada" />
		</div>
	</section>

	<section class="contenedor seccion" id="temas" aria-labelledby="titulo-temas">
		<div class="seccion-cabecera">
			<h2 id="titulo-temas">{t.portada.temasTitulo}</h2>
			<p>{t.portada.temasTexto}</p>
		</div>
		<Regla lang={lang} />
		<IndiceTemas lang={lang} variante="completo" encabezado="h3" />
	</section>
```

En su `<style>`, reemplaza todo lo que va desde `.portada {` hasta el final de `.portada :global(.regla) { … }` por:

```css
	.portada {
		padding-top: clamp(2.5rem, 1.5rem + 5vw, 6.5rem);
	}

	.portada h1 {
		max-width: 15ch;
		font-size: clamp(2.75rem, 1.2rem + 5vw, 5.25rem);
		line-height: 1.02;
	}

	.portada .entradilla {
		margin-top: clamp(1.5rem, 1rem + 2vw, 2.5rem);
		color: var(--tinta-suave);
	}

	/* Enlaces de orientación para quien llega por primera vez. */
	.orientacion {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
		margin-top: 1.5rem;
	}

	.portada-texto {
		display: grid;
		gap: clamp(3rem, 2rem + 4vw, 5rem);
	}

	@media (min-width: 64rem) {
		.portada-texto {
			grid-template-columns: minmax(0, 6fr) minmax(0, 5fr);
			align-items: end;
		}
	}

	.seccion :global(.regla) {
		margin-bottom: clamp(2.5rem, 2rem + 3vw, 4rem);
	}
```

- [ ] **Step 4: Añade Futuros a la cabecera** (`src/components/Cabecera.astro`)

En el frontmatter, después de `enMetodologia`:

```ts
const rutaFuturos = ruta(lang, 'futuros');
const enFuturos = Astro.url.pathname.startsWith(rutaFuturos);
```

En `<nav class="cabecera-nav ui">`, antes del botón Temas:

```astro
			<a class="control solo-ancho" href={rutaFuturos} aria-current={enFuturos ? 'page' : undefined}
				>{t.nav.futuros}</a
			>
```

En el enlace de Metodología, cambia `class="control solo-ancho"` por `class="control solo-amplio"`.

En `.menu-pie ul`, añade como primer `<li>`: `<li><a href={rutaFuturos}>{t.nav.futuros}</a></li>`.

En `src/styles/global.css`, junto a `.solo-ancho`:

```css
/* Solo en pantallas de 56rem o más (Metodología en la cabecera; debajo está en el menú). */
@media (max-width: 55.99rem) {
	.solo-amplio {
		display: none !important;
	}
}
```

- [ ] **Step 5: Verifica**

Run: `npm run build && npm run test:csp && npm run test:e2e`
Expected: PASS, incluido el desborde a 320 y 768 px en todas las páginas.

- [ ] **Step 6: Revisión visual de la portada** a 375, 768, 1024 y 1440 px, en claro y oscuro: la matriz es lo primero que destaca a la derecha en escritorio; las cuatro puertas tienen el mismo peso; los ejes se leen (el de paz, de abajo arriba); la regla abre la sección de temas.

- [ ] **Step 7: Commit**

```bash
git add src/components/vistas/Portada.astro src/components/Cabecera.astro src/styles/global.css tests/e2e
git commit -m "feat: matriz de futuros en la portada y enlace en la cabecera"
```

---

### Task 14: Cierre: rendimiento, spec y entrega

**Files:**
- Modify: `lighthouserc.json`
- Modify: `specs/peacethefrontier/tasks.md`
- Modify: `specs/peacethefrontier/requirements.md`

- [ ] **Step 1: Añade un futuro a Lighthouse** — en `lighthouserc.json`, agrega `"http://localhost/futuros/carrera/"` y `"http://localhost/futuros/"` a `collect.url`.

- [ ] **Step 2: Ejecuta la batería completa**

Run: `npm run check && npm test && npm run build && npm run test:csp && npm run test:e2e && npx lhci autorun`
Expected: `0 errors`; Vitest PASS; CSP sin bloques sin hash; Playwright PASS en los 4 proyectos; Lighthouse ≥ 95 en rendimiento y 100 en accesibilidad, LCP < 2,5 s, CLS < 0,1, TBT < 200 ms en todas las URL. (En local, si no hay Chrome: `CHROME_PATH="$(find ~/Library/Caches/ms-playwright -path '*chromium-*' -name 'Google Chrome for Testing' -type f | head -1)" npx lhci autorun`.)

Si `/futuros/carrera/` no llega a los presupuestos, mide antes de cambiar nada (`.lighthouseci/*.json`, auditorías `total-blocking-time` y `largest-contentful-paint`) y avisa con el dato.

- [ ] **Step 3: Actualiza el spec**

En `specs/peacethefrontier/tasks.md`, añade antes de `## Fase 2`:

```markdown
## Fase F: Futuros Paz × Frontera (plan: `futuros-plan.md`)
- [x] TF.1 Modelo, Monte Carlo, eventos y calibración contra fuentes oficiales. _(futuros.md §5)_
- [x] TF.2 Página de cada futuro con panel interactivo y relato en ES/EN. _(F3)_
- [x] TF.3 Página del modelo con ecuaciones, parámetros, calibración y límites. _(F4)_
- [x] TF.4 Matriz en la portada y enlace en la cabecera. _(F1)_
- [ ] TF.5 El autor revisa los ocho relatos antes de publicar.
- [ ] TF.6 Relato escrito en las décadas intermedias. _(futuros.md §11, después)_
```

En `specs/peacethefrontier/requirements.md`, en R6, añade: `- R6.3 Los cuatro futuros de la matriz Paz × Frontera se especifican en futuros.md.`

- [ ] **Step 4: Commit**

```bash
git add lighthouserc.json specs/peacethefrontier
git commit -m "docs: cierre de la fase de futuros"
```

- [ ] **Step 5: Revisión final de la rama** — lanza la revisión de toda la rama (`git diff main...feat/futuros`) según el método de ejecución elegido antes de integrar.
