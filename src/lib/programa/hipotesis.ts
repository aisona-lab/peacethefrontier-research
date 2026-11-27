import type { Idioma } from '../../i18n/rutas';
import type { NivelId } from '../evidencia';

export const HIPOTESIS_IDS = ['H1', 'H2', 'H3'] as const;
export type HipotesisId = (typeof HIPOTESIS_IDS)[number];
export type EstadoPrograma = 'en-calibracion-empirica' | 'congelada-como-escenario';

export interface TextoHipotesis {
	readonly enunciado: string;
	readonly subtitulo: string;
	readonly estadoTexto: string;
	readonly subtemasNaturales: readonly string[];
	readonly mecanismoTeorico: string;
	readonly criterioRefutacion: string;
	readonly hallazgoPrincipal: string;
}

export interface Hipotesis {
	readonly id: HipotesisId;
	readonly estadoPrograma: EstadoPrograma;
	readonly horizonte: string;
	readonly evidencia: NivelId;
	readonly temas: readonly string[];
	readonly paperClave: string;
	readonly paperSlug: Record<Idioma, string>;
	readonly experimentoId: string;
	readonly rutaCodigo: string;
	readonly rutaNotebookColab?: string;
	readonly comandoReproduccion: string;
	readonly es: TextoHipotesis;
	readonly en: TextoHipotesis;
}

export const TESIS_CENTRAL = {
	es: {
		kicker: 'Portafolio de Investigación · Carlos Nicolás Soto',
		titulo: 'Agentes autónomos como infraestructura de la próxima década',
		tesis:
			'En la próxima década (2026–2036), la transformación estructural de la inteligencia artificial no vendrá de mejores interfaces conversacionales, sino de bucles agénticos integrados como infraestructura operativa, institucional y científica. Dónde reemplazan a las herramientas actuales y dónde fracasan depende de tres cuellos de botella medibles: el coste de verificación frente a la fiabilidad compuesta, la arquitectura de coordinación multi-agente y la existencia de oráculos físicos verificables.',
		compromiso:
			'Cada hipótesis de este portafolio se formula para poder ser refutada, publica su código en GitHub, permite variar supuestos sin escribirme y separa tajantemente simulaciones propias de mediciones observadas.',
		avisoSimulacion:
			'Nota metodológica: los resultados actuales de H1, H2 y H3 provienen de simulaciones parametrizadas con datos propios (synthetic=true), no de datos observados en producción. H2 y H3 están congeladas en estado de escenario mientras calibramos H1 con mediciones reales y revisión externa.',
	},
	en: {
		kicker: 'Research Portfolio · Carlos Nicolás Soto',
		titulo: 'Autonomous agents as the infrastructure of the next decade',
		tesis:
			'Over the next decade (2026–2036), structural AI transformation will not come from better conversational interfaces, but from agentic loops embedded as operational, institutional and scientific infrastructure. Where they replace assistive tools—and where they fail—depends on three measurable bottlenecks: verification cost relative to compound reliability, multi-agent coordination architecture and verifiable physical oracles.',
		compromiso:
			'Every hypothesis in this portfolio is stated in falsifiable form, publishes its code on GitHub, lets any reader perturb its assumptions directly, and separates synthetic simulations from observed data.',
		avisoSimulacion:
			'Methodological note: current numerical outputs for H1, H2 and H3 come from parameterized simulations with synthetic data (synthetic=true), not observed production data. H2 and H3 are frozen as scenarios while H1 undergoes empirical calibration and external technical review.',
	},
} as const;

export const HIPOTESIS: readonly Hipotesis[] = [
	{
		id: 'H1',
		estadoPrograma: 'en-calibracion-empirica',
		horizonte: '2026–2036',
		evidencia: 'escenario-ficcion',
		temas: ['ia', 'espacio', 'salud', 'energia', 'informacion', 'gobernanza'],
		paperClave: 'wp-delegacion-autonoma',
		paperSlug: {
			es: 'de-copilotos-a-agentes-autonomos',
			en: 'from-copilots-to-autonomous-agents',
		},
		experimentoId: 'h1-delegacion-autonoma',
		rutaCodigo: 'experiments/h1-delegacion-autonoma',
		rutaNotebookColab: 'experiments/h1-delegacion-autonoma/h1_reproducir.ipynb',
		comandoReproduccion: 'npm run experiments:check',
		es: {
			enunciado: 'Los agentes autónomos reemplazarán las herramientas de apoyo en 5–10 años',
			subtitulo: 'Economía de delegación, fiabilidad compuesta y coste de verificación',
			estadoTexto: 'Foco activo · Explorable interactivo + calibración empírica en curso',
			subtemasNaturales: ['Ciencia', 'Salud', 'Energía', 'Educación', 'Gobierno'],
			mecanismoTeorico:
				'Un copiloto exige supervisión humana paso a paso; un agente autónomo ejecuta cadenas de K pasos pero acumula probabilidad de fallo compuesto (1 − p^K). El reemplazo ocurre solo cuando el ahorro de supervisión supera la pérdida esperada por fallos no detectados.',
			criterioRefutacion:
				'Quedaría refutada si entre 2031 y 2036 más del 60 % de los flujos estructurados en ciencia computacional, educación y administración siguen exigiendo intervención humana paso a paso pese a disponer de verificadores automáticos con detección > 95 %.',
			hallazgoPrincipal:
				'En la simulación parametrizada de 5 sectores (3.300 filas sintéticas), ciencia, educación y administración cruzan en 2028–2029 bajo coevolución base, mientras gestión sanitaria (2033) y red eléctrica (2034) exigen infraestructura verificadora. Puedes invertir la conclusión moviendo los sliders del paper.',
		},
		en: {
			enunciado: 'Autonomous agents will replace assistive tools within 5–10 years',
			subtitulo: 'Delegation economics, compound reliability and verification cost',
			estadoTexto: 'Active focus · Interactive explorable + empirical calibration underway',
			subtemasNaturales: ['Science', 'Health', 'Energy', 'Education', 'Government'],
			mecanismoTeorico:
				'A copilot requires step-by-step human supervision; an autonomous agent executes K-step chains but accumulates compound failure probability (1 − p^K). Replacement occurs only when saved supervision exceeds expected loss from undetected tail errors.',
			criterioRefutacion:
				'Falsified if between 2031 and 2036 over 60% of structured workflows in computational science, education and public administration still require step-by-step human intervention despite automated verifiers exceeding 95% error detection.',
			hallazgoPrincipal:
				'In our parameterized 5-sector simulation (3,300 synthetic rows), science, education and administration cross in 2028–2029 under baseline co-evolution, whereas health admin (2033) and grid dispatch (2034) require dedicated verification. Use the paper’s interactive sliders to test where the conclusion flips.',
		},
	},
	{
		id: 'H2',
		estadoPrograma: 'congelada-como-escenario',
		horizonte: '2026–2036',
		evidencia: 'escenario-ficcion',
		temas: ['gobernanza', 'ia', 'riesgo', 'poder', 'computo'],
		paperClave: 'wp-coordinacion-multiagente',
		paperSlug: {
			es: 'superinteligencia-como-coordinacion',
			en: 'superintelligence-as-coordination',
		},
		experimentoId: 'h2-coordinacion-multiagente',
		rutaCodigo: 'experiments/h2-coordinacion-multiagente',
		comandoReproduccion: 'npm run experiments:check',
		es: {
			enunciado: 'La superinteligencia no es un problema técnico sino de coordinación',
			subtitulo: 'Dinámicas multi-agente, carrera de capacidades y ley de Goodhart en benchmarks',
			estadoTexto: 'Congelada como escenario · Sin nuevo trabajo hasta calibrar y revisar H1',
			subtemasNaturales: ['Multi-agente', 'Gobernanza', 'Seguridad', 'Benchmarks'],
			mecanismoTeorico:
				'Cuando múltiples agentes o laboratorios compiten por rentas de primer llegado y son evaluados mediante benchmarks estáticos imperfectos, el equilibrio estratégico erosiona los márgenes de seguridad y amplifica la optimización de proxies (Goodhart) a medida que escala la capacidad.',
			criterioRefutacion:
				'Quedaría refutada si el mero escalado técnico de modelos individuales reduce de forma monótona los incidentes sistémicos multi-agente y la divergencia entre benchmarks y despliegue real en ausencia de protocolos vinculantes de auditoría e interoperabilidad.',
			hallazgoPrincipal:
				'En el juego estilizado de 8 actores (500 escenarios sintéticos), escalar capacidad 25× sin coordinación eleva incidentes del 5,5 % al 49,2 % y dispara la brecha de Goodhart; permanece en estado de escenario sin calibración empírica.',
		},
		en: {
			enunciado: 'Superintelligence is not a technical problem, but a coordination problem',
			subtitulo: 'Multi-agent dynamics, capability racing and Goodhart distortion in benchmarks',
			estadoTexto: 'Frozen as scenario · Paused until H1 is empirically calibrated and reviewed',
			subtemasNaturales: ['Multi-agent', 'Governance', 'Safety', 'Benchmarks'],
			mecanismoTeorico:
				'When multiple agents or labs compete for first-mover rents and are gated by imperfect static benchmarks, strategic equilibrium erodes safety margins and amplifies proxy gaming (Goodhart divergence) as raw capability scales.',
			criterioRefutacion:
				'Falsified if scaling raw technical capability in isolated models monotonically reduces multi-agent systemic incidents and benchmark-to-deployment divergence without binding interoperability or audit protocols.',
			hallazgoPrincipal:
				'In our stylized 8-actor game (500 synthetic scenarios), scaling capability 25× without coordination raises incident rates from 5.5% to 49.2% and expands Goodhart divergence; kept strictly as an uncalibrated scenario.',
		},
	},
	{
		id: 'H3',
		estadoPrograma: 'congelada-como-escenario',
		horizonte: '2026–2036',
		evidencia: 'escenario-ficcion',
		temas: ['tecnologias', 'espacio', 'salud', 'planeta', 'energia'],
		paperClave: 'wp-ia-cientifica-vs-consumer',
		paperSlug: {
			es: 'ia-cientifica-frente-a-ia-consumo',
			en: 'scientific-ai-versus-consumer-ai',
		},
		experimentoId: 'h3-ia-cientifica-vs-consumer',
		rutaCodigo: 'experiments/h3-ia-cientifica-vs-consumer',
		comandoReproduccion: 'npm run experiments:check',
		es: {
			enunciado: 'La IA científica cambiará más que la IA consumer',
			subtitulo: 'Ventaja del oráculo verificable y cuellos de botella de validación física',
			estadoTexto: 'Congelada como escenario · Sin nuevo trabajo hasta calibrar y revisar H1',
			subtemasNaturales: ['Descubrimiento de materiales', 'Fármacos', 'Clima', 'Física'],
			mecanismoTeorico:
				'La IA de consumo compite por un presupuesto fijo de atención humana y preferencias subjetivas; la IA científica explora espacios combinatorios acoplada a oráculos verificables (leyes de conservación, simuladores físicos, ensayos), acumulando descubrimientos no rivales limitados solo por el cuello de botella experimental (Ley de Amdahl).',
			criterioRefutacion:
				'Quedaría refutada si hacia 2035 la productividad multifactorial y el excedente económico verificable atribuibles a descubrimientos en materiales, energía, clima y biomedicina asistidos por IA resultan inferiores a los generados por asistentes y medios de consumo.',
			hallazgoPrincipal:
				'En las 1.500 trayectorias sintéticas (2026–2035), los dominios con oráculo físico superan en 7,5×–16,8× el excedente por PFLOP-día del régimen consumer; permanece congelada como escenario hasta calibración empírica de H1.',
		},
		en: {
			enunciado: 'Scientific AI will drive deeper structural change than consumer AI',
			subtitulo: 'The verifiable-oracle advantage and physical validation bottlenecks',
			estadoTexto: 'Frozen as scenario · Paused until H1 is empirically calibrated and reviewed',
			subtemasNaturales: ['Materials discovery', 'Therapeutics', 'Climate', 'Physics'],
			mecanismoTeorico:
				'Consumer AI competes for a fixed human-attention budget under subjective preferences; scientific AI searches combinatorial spaces coupled to verifiable oracles (conservation laws, physical simulators, assays), compounding non-rival discoveries bounded mainly by physical validation throughput (Amdahl’s Law).',
			criterioRefutacion:
				'Falsified if by 2035 verifiable multifactor productivity and structural surplus attributable to AI-assisted breakthroughs in materials, energy, climate and biomedicine fall below those generated by consumer assistants and digital media.',
			hallazgoPrincipal:
				'Across 1,500 synthetic trajectories (2026–2035), verifiable-oracle domains produce 7.5×–16.8× higher surplus per PFLOP-day than consumer baselines; kept frozen as a scenario pending empirical H1 calibration.',
		},
	},
] as const;

export function hipotesisPorId(id: HipotesisId): Hipotesis {
	const encontrada = HIPOTESIS.find((h) => h.id === id);
	if (!encontrada) throw new Error(`Hipótesis desconocida: ${id}`);
	return encontrada;
}
