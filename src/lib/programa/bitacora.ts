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
		fecha: '2026-11-26',
		version: 'v0.2.0',
		tipo: 'auditoria',
		hipotesis: 'H1',
		ruta: {
			es: '/research/working-papers/de-copilotos-a-agentes-autonomos/',
			en: '/en/research/working-papers/from-copilots-to-autonomous-agents/',
		},
		titulo: {
			es: 'Rebaja a Escenario/v0.2.0, explorable interactivo de H1, Colab y protocolo empírico',
			en: 'Downgrade to Scenario/v0.2.0, H1 interactive explorable, Colab notebook and empirical protocol',
		},
		resumen: {
			es: 'Reclasificación honesta de H1–H3 como escenarios simulados, declaración de conflicto de interés (aisona-lab), congelación de H2/H3, mapa de calor interactivo de H1 y registro de predicciones.',
			en: 'Honest reclassification of H1–H3 as simulated scenarios, conflict-of-interest disclosure (aisona-lab), H2/H3 freeze, H1 sensitivity heatmap and public predictions registry.',
		},
	},
	{
		fecha: '2026-11-24',
		version: 'v0.2.0',
		tipo: 'working-paper',
		hipotesis: 'H3',
		ruta: {
			es: '/research/working-papers/ia-cientifica-frente-a-ia-consumo/',
			en: '/en/research/working-papers/scientific-ai-versus-consumer-ai/',
		},
		titulo: {
			es: 'PTF-WP 5 · Escenario de oráculo verificable: IA científica frente a IA de consumo (congelado)',
			en: 'PTF-WP 5 · Verifiable-oracle scenario: scientific AI versus consumer AI (frozen)',
		},
		resumen: {
			es: 'Modelo de embudos de descubrimiento y dataset sintético de 1.500 filas. Rebajado a Escenario v0.2.0 y congelado hasta calibrar H1.',
			en: 'Discovery-funnel model and 1,500-row synthetic dataset. Downgraded to Scenario v0.2.0 and frozen pending H1 calibration.',
		},
	},
	{
		fecha: '2026-11-24',
		version: 'v0.2.0',
		tipo: 'working-paper',
		hipotesis: 'H2',
		ruta: {
			es: '/research/working-papers/superinteligencia-como-coordinacion/',
			en: '/en/research/working-papers/superintelligence-as-coordination/',
		},
		titulo: {
			es: 'PTF-WP 4 · Escenario de coordinación multi-agente y distorsión de benchmarks (congelado)',
			en: 'PTF-WP 4 · Multi-agent coordination and benchmark-distortion scenario (frozen)',
		},
		resumen: {
			es: 'Juego estilizado de 8 actores (500 escenarios sintéticos). Rebajado a Escenario v0.2.0 y congelado hasta calibrar H1.',
			en: 'Stylized 8-actor game (500 synthetic scenarios). Downgraded to Scenario v0.2.0 and frozen pending H1 calibration.',
		},
	},
	{
		fecha: '2026-11-24',
		version: 'v0.2.0',
		tipo: 'working-paper',
		hipotesis: 'H1',
		ruta: {
			es: '/research/working-papers/de-copilotos-a-agentes-autonomos/',
			en: '/en/research/working-papers/from-copilots-to-autonomous-agents/',
		},
		titulo: {
			es: 'PTF-WP 3 · De copilotos a infraestructura autónoma: modelo y explorable (2026–2036)',
			en: 'PTF-WP 3 · From copilots to autonomous infrastructure: model and explorable (2026–2036)',
		},
		resumen: {
			es: 'Simulación parametrizada (3.300 filas sintéticas) con sliders en vivo, mapa de calor de inversión y notebook Colab en un clic.',
			en: 'Parameterized simulation (3,300 synthetic rows) with live sliders, inversion heatmap and 1-click Colab notebook.',
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
] as const;

export const AGENDA_ACTIVA: readonly ProximaInvestigacion[] = [
	{
		ventana: { es: 'Semanas 4–6 · Pieza empírica (prioridad única)', en: 'Weeks 4–6 · Empirical study (sole priority)' },
		hipotesis: 'H1',
		titulo: {
			es: 'Medición real de tasa de fallo por paso y coste de verificación en repos abiertos y logs propios',
			en: 'Empirical measurement of per-step failure rate and verification cost across open repos and agent logs',
		},
		entregable: {
			es: 'Dataset observacional en /research/datos-h1/ + PTF-WP 6 v0.1.0 (se publica incluso si contradice H1)',
			en: 'Observational dataset at /en/research/h1-data/ + PTF-WP 6 v0.1.0 (published even if it contradicts H1)',
		},
	},
	{
		ventana: { es: 'Semana 7 · Revisión técnica externa', en: 'Week 7 · External technical review' },
		hipotesis: 'H1',
		titulo: {
			es: 'Auditoría crítica de H1 y PTF-WP 6 por 2–3 ingenieros/investigadores externos independientes',
			en: 'Critical audit of H1 and PTF-WP 6 by 2–3 independent external technical reviewers',
		},
		entregable: {
			es: 'Comentarios críticos públicos, registro de cambios aplicados y solo entonces promoción a v1.0.0',
			en: 'Published critical comments, changelog of revisions and only then promotion to v1.0.0',
		},
	},
	{
		ventana: { es: 'Congelado · Tras validar H1', en: 'Frozen · Only after H1 validation' },
		hipotesis: 'H1',
		titulo: {
			es: 'Congelación de alcance: sin nuevos papers de H2/H3, simuladores ni temas hasta cerrar H1',
			en: 'Scope freeze: no new H2/H3 papers, simulators or atlas topics until H1 is empirically calibrated',
		},
		entregable: {
			es: 'Actualización mensual del panel de datos reales y resolución del registro público de predicciones',
			en: 'Monthly empirical panel updates and resolution of the public predictions ledger',
		},
	},
] as const;
