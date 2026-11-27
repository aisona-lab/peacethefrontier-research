import type { HipotesisId } from './hipotesis';

export type EstadoPrediccion = 'abierta' | 'confirmada' | 'refutada' | 'ambigua';

export interface Prediccion {
	readonly id: string;
	readonly hipotesis: HipotesisId;
	readonly fechaRegistro: string;
	readonly fechaResolucion: string;
	/** Probabilidad inicial asignada por el autor en [0, 1]. */
	readonly probabilidad: number;
	readonly estado: EstadoPrediccion;
	readonly resultado?: 0 | 1;
	readonly fechaResuelta?: string;
	readonly es: {
		readonly enunciado: string;
		readonly criterioResolucion: string;
		readonly notaResolucion?: string;
	};
	readonly en: {
		readonly enunciado: string;
		readonly criterioResolucion: string;
		readonly notaResolucion?: string;
	};
}

export const PREDICCIONES: readonly Prediccion[] = [
	{
		id: 'P-2027-01',
		hipotesis: 'H1',
		fechaRegistro: '2026-11-26',
		fechaResolucion: '2027-03-31',
		probabilidad: 0.65,
		estado: 'abierta',
		es: {
			enunciado:
				'En nuestra muestra empírica de Semana 4–6 (≥ 40 PRs públicos y logs reales de agentes), la mediana del tiempo humano de verificación y corrección superará el 35 % del tiempo equivalente de implementación manual.',
			criterioResolucion:
				'Se resuelve como confirmada si la mediana de (verification_minutes / estimated_manual_minutes) en public/datos/empirico/h1-observado.csv con n ≥ 40 es > 0,35 el 31 de marzo de 2027.',
		},
		en: {
			enunciado:
				'In our Weeks 4–6 empirical sample (≥ 40 public open-repo PRs and real agent logs), median human verification and rework time will exceed 35% of equivalent manual implementation time.',
			criterioResolucion:
				'Resolves confirmed if median (verification_minutes / estimated_manual_minutes) in public/datos/empirico/h1-observado.csv with n ≥ 40 exceeds 0.35 on 31 March 2027.',
		},
	},
	{
		id: 'P-2027-02',
		hipotesis: 'H1',
		fechaRegistro: '2026-11-26',
		fechaResolucion: '2027-06-30',
		probabilidad: 0.55,
		estado: 'abierta',
		es: {
			enunciado:
				'Al menos uno de los tres grandes benchmarks públicos de agentes de software (METR, SWE-bench o Terminal-Bench) añadirá una métrica oficial de tiempo o coste de verificación humana junto a la tasa de resolución.',
			criterioResolucion:
				'Se resuelve como confirmada si existe publicación o tablero oficial documentado antes del 30 de junio de 2027 que reporte coste/tiempo de verificación humana como métrica primaria.',
		},
		en: {
			enunciado:
				'At least one of the three major public software-agent benchmarks (METR, SWE-bench or Terminal-Bench) will introduce an official human verification time or cost metric alongside solve rate.',
			criterioResolucion:
				'Resolves confirmed if an official paper or leaderboard release before 30 June 2027 reports human verification cost/time as a primary reported metric.',
		},
	},
	{
		id: 'P-2027-03',
		hipotesis: 'H1',
		fechaRegistro: '2026-11-26',
		fechaResolucion: '2027-09-30',
		probabilidad: 0.6,
		estado: 'abierta',
		es: {
			enunciado:
				'En tareas de software acotadas (< 2 h humanas) protegidas por suites de tests deterministas (detección > 95 %), la tasa de PRs autónomos aceptados sin ediciones sustanciales en nuestro panel mensual superará el 50 %.',
			criterioResolucion:
				'Se resuelve como confirmada si la proporción de outcome=accepted-clean en el subconjunto determinista acumulado hasta el 30 de septiembre de 2027 supera 0,50 (n ≥ 50).',
		},
		en: {
			enunciado:
				'On scoped software tasks (< 2 human hours) guarded by deterministic test suites (> 95% detection), the rate of autonomous PRs accepted without substantive human edits in our monthly panel will exceed 50%.',
			criterioResolucion:
				'Resolves confirmed if the share of outcome=accepted-clean in the deterministic-test subset accumulated through 30 September 2027 exceeds 0.50 (n ≥ 50).',
		},
	},
	{
		id: 'P-2027-04',
		hipotesis: 'H1',
		fechaRegistro: '2026-11-26',
		fechaResolucion: '2027-12-31',
		probabilidad: 0.85,
		estado: 'abierta',
		es: {
			enunciado:
				'Ningún operador regulado de red eléctrica de transmisión (TSO/ISO en UE o EE. UU.) desplegará despacho en tiempo real autónomo sin aprobación humana en el bucle antes de fin de 2027.',
			criterioResolucion:
				'Se resuelve como refutada si un TSO/ISO publica autorización regulatoria y operación en producción de despacho autónomo sin humano en el bucle antes del 31 de diciembre de 2027.',
		},
		en: {
			enunciado:
				'No regulated transmission system operator (TSO/ISO in the EU or US) will deploy real-time autonomous grid dispatch without human-in-the-loop approval before the end of 2027.',
			criterioResolucion:
				'Resolves falsified if any TSO/ISO publishes regulatory approval and live production deployment of autonomous dispatch without human-in-the-loop oversight before 31 December 2027.',
		},
	},
	{
		id: 'P-2028-01',
		hipotesis: 'H1',
		fechaRegistro: '2026-11-26',
		fechaResolucion: '2028-06-30',
		probabilidad: 0.72,
		estado: 'abierta',
		es: {
			enunciado:
				'En flujos administrativos sanitarios asistidos por agentes (facturación, codificación, citas), menos del 20 % de los trámites auditados en literatura pública cerrarán sin revisión humana final hacia mediados de 2028.',
			criterioResolucion:
				'Se evalúa con informes públicos de sistemas sanitarios o auditorías revisadas por pares publicadas hasta el 30 de junio de 2028.',
		},
		en: {
			enunciado:
				'Across agent-assisted healthcare administrative workflows (billing, coding, scheduling), fewer than 20% of audited cases in public studies will close without final human sign-off by mid-2028.',
			criterioResolucion:
				'Evaluated against public health-system audits or peer-reviewed studies published through 30 June 2028.',
		},
	},
] as const;

/** Brier score medio de predicciones resueltas (0 = calibración perfecta; 0.25 = azar). Null si 0 resueltas. */
export function calcularBrier(lista: readonly Prediccion[]): number | null {
	const resueltas = lista.filter(
		(p): p is Prediccion & { resultado: 0 | 1 } =>
			(p.estado === 'confirmada' || p.estado === 'refutada') && p.resultado !== undefined,
	);
	if (resueltas.length === 0) return null;
	const suma = resueltas.reduce((acc, p) => acc + Math.pow(p.probabilidad - p.resultado, 2), 0);
	return Number((suma / resueltas.length).toFixed(4));
}
