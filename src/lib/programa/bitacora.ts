import type { Idioma } from '../../i18n/rutas';
import type { HipotesisId } from './hipotesis';

export interface EntradaBitacora {
	readonly fecha: string;
	readonly version: string;
	readonly tipo: 'experimento' | 'working-paper' | 'auditoria' | 'dataset';
	readonly hipotesis?: HipotesisId;
	readonly ruta: Record<Idioma, string>;
	readonly titulo: Record<Idioma, string>;
	readonly resumen: Record<Idioma, string>;
}

export interface ProximaInvestigacion {
	readonly ventana: Record<Idioma, string>;
	readonly hipotesis: HipotesisId;
	readonly titulo: Record<Idioma, string>;
	readonly entregable: Record<Idioma, string>;
}

export const BITACORA: readonly EntradaBitacora[] = [
	{
		fecha: '2026-11-24',
		version: 'v1.0.0',
		tipo: 'working-paper',
		hipotesis: 'H3',
		ruta: {
			es: '/research/working-papers/ia-cientifica-frente-a-ia-consumo/',
			en: '/en/research/working-papers/scientific-ai-versus-consumer-ai/',
		},
		titulo: {
			es: 'PTF-WP 5 · La ventaja del oráculo verificable: IA científica frente a IA de consumo',
			en: 'PTF-WP 5 · The verifiable-oracle advantage: scientific AI versus consumer AI',
		},
		resumen: {
			es: 'Modelo de embudos de descubrimiento multi-etapa y dataset sintético de 1.500 filas comparando materiales, triaje preclínico, clima y física con IA consumer.',
			en: 'Multi-stage discovery funnel model and 1,500-row synthetic dataset comparing materials, preclinical triage, climate and physics against consumer AI.',
		},
	},
	{
		fecha: '2026-11-24',
		version: 'v1.0.0',
		tipo: 'working-paper',
		hipotesis: 'H2',
		ruta: {
			es: '/research/working-papers/superinteligencia-como-coordinacion/',
			en: '/en/research/working-papers/superintelligence-as-coordination/',
		},
		titulo: {
			es: 'PTF-WP 4 · Escalar capacidad sin coordinación: juegos multi-agente y distorsión de benchmarks',
			en: 'PTF-WP 4 · Scaling capability without coordination: multi-agent games and benchmark distortion',
		},
		resumen: {
			es: 'Simulación estratégica de 8 actores bajo 4 regímenes institucionales (500 escenarios) evaluando fallo sistémico y brecha de Goodhart.',
			en: 'Strategic simulation of 8 actors across 4 institutional regimes (500 scenarios) measuring systemic failure and Goodhart divergence.',
		},
	},
	{
		fecha: '2026-11-24',
		version: 'v1.0.0',
		tipo: 'working-paper',
		hipotesis: 'H1',
		ruta: {
			es: '/research/working-papers/de-copilotos-a-agentes-autonomos/',
			en: '/en/research/working-papers/from-copilots-to-autonomous-agents/',
		},
		titulo: {
			es: 'PTF-WP 3 · De copilotos a infraestructura autónoma: umbrales en cinco sectores (2026–2036)',
			en: 'PTF-WP 3 · From copilots to autonomous infrastructure: thresholds across five sectors (2026–2036)',
		},
		resumen: {
			es: 'Modelo analítico y Monte Carlo (3.300 filas) sobre fiabilidad compuesta, coste de auditoría y años de cruce en ciencia, salud, energía, educación y gobierno.',
			en: 'Analytical and Monte Carlo model (3,300 rows) on compound reliability, audit cost and crossover years across science, health, energy, education and government.',
		},
	},
	{
		fecha: '2026-11-14',
		version: 'v0.1.0',
		tipo: 'working-paper',
		ruta: {
			es: '/research/working-papers/fiabilidad-de-agentes-y-productividad/',
			en: '/en/research/working-papers/agent-reliability-and-productivity/',
		},
		titulo: {
			es: 'PTF-WP 2 · Fiabilidad de agentes y productividad: síntesis crítica de evidencia',
			en: 'PTF-WP 2 · Agent reliability and productivity: critical evidence synthesis',
		},
		resumen: {
			es: 'Separación metodológica entre horizontes en benchmarks (METR) y tiempos reales de finalización con revisión humana.',
			en: 'Methodological separation between benchmark task horizons (METR) and real completion times including human review.',
		},
	},
	{
		fecha: '2026-11-14',
		version: 'v1.0.0',
		tipo: 'dataset',
		ruta: {
			es: '/sim/',
			en: '/en/sim/',
		},
		titulo: {
			es: 'Simulador defensivo de continuidad de servicio y auditoría base 2026 (PTF-WP 1)',
			en: 'Defensive service-continuity simulator and 2026 baseline audit (PTF-WP 1)',
		},
		resumen: {
			es: '2.880 filas horarias sintéticas con verificación SHA-256 y comprobación de reproducibilidad sobre 432 puntos del modelo macro.',
			en: '2,880 hourly synthetic rows with SHA-256 verification and reproducibility audit across 432 macro-model checkpoints.',
		},
	},
] as const;

export const AGENDA_ACTIVA: readonly ProximaInvestigacion[] = [
	{
		ventana: { es: 'Ciclo mensual · Diciembre 2026', en: 'Monthly cycle · December 2026' },
		hipotesis: 'H1',
		titulo: {
			es: 'Calibración empírica de sobrecoste de verificación en repositorios abiertos y flujos administrativos',
			en: 'Empirical calibration of verification overhead in open-source repositories and administrative workflows',
		},
		entregable: {
			es: 'Dataset observacional + extensión v1.1 de experiments/h1-delegacion-autonoma',
			en: 'Observational dataset + v1.1 extension of experiments/h1-delegacion-autonoma',
		},
	},
	{
		ventana: { es: 'Ciclo mensual · Enero 2027', en: 'Monthly cycle · January 2027' },
		hipotesis: 'H2',
		titulo: {
			es: 'Protocolos de auditoría cruzada entre agentes heterogéneos bajo fallos bizantinos parciales',
			en: 'Cross-agent audit protocols across heterogeneous agents under partial Byzantine faults',
		},
		entregable: {
			es: 'Working paper PTF-WP 6 + benchmark sintético de colusión y reporte selectivo',
			en: 'Working paper PTF-WP 6 + synthetic collusion and selective-reporting benchmark',
		},
	},
	{
		ventana: { es: 'Ciclo mensual · Febrero 2027', en: 'Monthly cycle · February 2027' },
		hipotesis: 'H3',
		titulo: {
			es: ' Cuello de botella de laboratorio autónomo: elasticidad entre cribado in-silico y síntesis física en materiales',
			en: 'Autonomous-lab bottleneck: elasticity between in-silico screening and physical synthesis in materials',
		},
		entregable: {
			es: 'Working paper PTF-WP 7 + serie comparada de rendimiento por PFLOP-día',
			en: 'Working paper PTF-WP 7 + comparative throughput series per PFLOP-day',
		},
	},
] as const;
